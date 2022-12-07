<script setup>
import { computed, onMounted, ref, watch, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useX, isString, byId, mergeDeep } from "../../../src/x/utils";
import { QBtn, useQuasar } from 'quasar'
import { Platform } from 'quasar'
import Plyr from 'plyr'
import data from 'src/assets/YMMItems.json'

const $x = useX()
const $q = useQuasar()

const route = useRoute()
const router = useRouter()

const bgRouterView = ref(false)

const routedDialog = computed(() => bgRouterView.value ? router.resolve(bgRouterView.value) : route)

function $style (dialog, name) {

  let i = 1

  function injectStyle (style) {
    const id = `${dialog.xId()}__style__${i++}`
    if (!document.getElementById(id)) {
      const div = document.createElement("div")
      div.innerHTML = style;
      const styleElement = div.firstElementChild;
      styleElement.setAttribute('id', id);
      document.body.appendChild(styleElement)
    }
  }

  return (style) => injectStyle(style)
}

function $move (dialog) {

  return (position) => {

    if (isString(position)) {

      const dialogs = document.querySelectorAll('div[data-v-app][x-type="XDialog"]')

      switch (position) {
        case 'bottom':
          if (dialogs.length) {
            dialogs[0].parentNode
              .insertBefore(dialog.xDOM().xComponent(), dialogs[0])
          }
          break;
        case 'top':
          if (dialogs.length) {
            dialogs[0].parentNode
              .insertBefore(dialog.xDOM().xComponent(), dialogs[dialogs.length - 1].nextSibling)
          }
          break;
        case 'html':
          document.documentElement.insertBefore(dialog.xDOM().xComponent(), document.body.nextSibling)
          break;
      }
    }
  }
}

function $player (dialog, name) {

  dialog.$style(`<style>
    .x-dialog.player .x-dialog-plugin-load {
      border-radius: 0;
      background-color: #ffffff;
      -webkit-backdrop-filter: blur(7px);
      backdrop-filter: blur(7px);
      -webkit-box-shadow: 0px 0px 4px -1px rgba(0,0,0,0.33);
      box-shadow: 0px 0px 4px -1px rgba(0,0,0,0.33);
      width: 100vw !important;
    }

    .x-dialog.player .q-dialog__inner--minimized {
      padding:0
    }

   .x-dialog.player .q-dialog__inner--minimized > div {
     max-width: 100vw !important;
     width: 100vw !important;
   }
  </style>`)

  dialog.update({
    class: `${dialog.xClass()} player`,
  });
}


let bigPlayer = null

const storage = {
  get (i) {
    return $q.localStorage.getItem('player.item')
  },
  set (i, v) {
    return $q.localStorage.set(i, v)
  }
}

const player = reactive({
  position: 0,
  item: storage.get('player.item'),
  view: storage.get('player.item') ? 'folded' : 'hidden',
  setItem: false
})

const playerProps = ref({
  id: 'Player',
  options: { position: 'bottom', seamless: true, ok: false },
  load: () => import('../components/Player'),
  props: { player: player, go },
  onLoad: ({ dialog }) => {
    setInterval(() => {
      player.position += 1
      if (player.position >= 500) {
        player.position = 0
      }
    }, 50)
  },
  plugins: {
    $style,
    $player,
  },
})

function initPlayer () {
  const player = byId('Player')
  return player ? player.$XDialog : $x.dialog(playerProps.value)
}

const bigPlayerProps = reactive({
  id: 'BigPlayer',
  router: 'watch',
  options: {
    position: 'bottom',
    seamless: true,
    noRouteDismiss: true,
    transitionShow: 'jump-up',
    ok: false
  },
  onHide: ({ dialog }) => {
    player.view = 'hidden'
  },
  config: {
    dismiss: {
      redirect: {
        fn: (router, route) => {
          if (route.name === 'watch') {
            router.back()
          }
        }
      }
    }
  },
  load: () => import('../components/BigPlayer.vue'),
  props: {
    player: player,
    go: go
  },
  plugins: {
    $style,
    $player
  }
})

function initBigPlayer () {
  const player = byId('BigPlayer')
  return player ? player.$XDialog : $x.dialog(bigPlayerProps)
}

let lastViewBeforeWatchPosition = 0

onMounted(() => {

  // https://stackoverflow.com/a/58950454/1502706
  window.onpopstate = function(event) {

    let direction = $x.history.determineDirection(event)

    const { pathname, search, hash } = document.location
    const resolvedRoute = router.resolve({
      path: pathname + search + hash
    })

    console.log('document.location.href', document.location.href)
    if (resolvedRoute.name === 'watch') {
      // handle reaching the end of history, either forward or backwards

      const opposite = direction === 'forward' ? 'back' : 'forward'
      const path = history.state[direction] ? history.state[direction] : history.state[opposite]

      if (lastViewBeforeWatchPosition >= 0){
        if (direction === 'forward') {
          lastViewBeforeWatchPosition++
        } else {
          lastViewBeforeWatchPosition--
        }
      }

      // bgRouterView.value = { path: path }
      // bgRouterView.value = { path: path }

    } else {
      lastViewBeforeWatchPosition = 0
      bgRouterView.value = false
      sessionStorage.setItem('lastNotWatchPath', JSON.stringify(resolvedRoute.fullPath))
    }
    console.log('lastViewBeforeWatchPosition', lastViewBeforeWatchPosition, 'direction', direction)
  }

  initBigPlayer()

  if (!Platform.is.mobile){
    initPlayer()
  }

  const player = new Plyr('#plyr');

})

watch(route, () => {
  if (route.name === 'watch') {
    player.view = 'full'
  } else {
    player.view = player.item ? 'folded' : 'hidden'
  }
}, { immediate: true, deep: true })

watch(() => player.item, () => {
  if (!player.item) player.view = 'hidden'
  storage.set('player.item', player.item)
})

const defaultWatchDismissRoute = { name: 'home' }

watch(() => player.view, () => {

  if (player.view === 'hidden') player.item = false

  if (['hidden', 'folded'].includes(player.view) && route.name === 'watch') {
    // if (router.resolve({ path: history.state.back }).name !== 'watch'){
    console.log('history', history, 'lastViewBeforeWatchPosition', lastViewBeforeWatchPosition)

    const path = JSON.parse(sessionStorage.getItem('lastNotWatchPath'))

    if (path) {
      console.log('go to saved path', path, 'lastViewBeforeWatchPosition', lastViewBeforeWatchPosition)

      if (lastViewBeforeWatchPosition){
        console.log('going to -'+lastViewBeforeWatchPosition)
        router.go(-(lastViewBeforeWatchPosition))
      } else {
        console.log('go to.....')
        go({ path: path })
      }

      // router.back()
    } else {
      if (history.state.back) {
        console.log('go to back')
        router.back()
      } else {
        console.log('go to default dismiss watch')
        go(defaultWatchDismissRoute)
      }
    }

  }
})

function mount (props) {
  mergeDeep(bigPlayerProps, props)
}

function go (to) {
  if (to.name === 'watch') {
    lastViewBeforeWatchPosition++

    if (route.name !== 'watch'){
      bgRouterView.value = { name: route.name }
    }
  } else {
    bgRouterView.value = false
    lastViewBeforeWatchPosition = 0

    console.log('router.resolve(to)', router.resolve(to))
    sessionStorage.setItem('lastNotWatchPath', JSON.stringify(router.resolve(to).fullPath))
  }

  console.log('router.resolve(to)', router.resolve(to))

  // if (to.name === 'watch' && route.name === 'watch'){
  //   router.replace(to)
  // } else {
    player.setItem = true
    router.push(to)
  // }
}

</script>
<template>
  <q-page padding>

    <div class="row flex-center">
      <q-btn @click="go({name:'home'})">Home</q-btn>
      <q-btn @click="go({name:'explore'})">Explore</q-btn>
      <q-btn @click="go({name:'library'})">Library</q-btn>
      <q-btn @click="go({name:'watch'})">Watch</q-btn>
    </div>

    <pre>{{ player }}</pre>


    <div v-for="item in data.items" class="row q-pa-sm" @click="go({ name: 'watch', query: { id: item.id } })">
      <div>
        <img width="100" :src="`https://img.youtube.com/vi/${item.id}/0.jpg`">
      </div>
      <div class="q-pa-sm">
        {{ item.title }}<br />
        {{ item.author }}<br />
      </div>
    </div>


    <!--    <div id="plyr" data-plyr-provider="youtube" data-plyr-embed-id="bTqVqk7FSmY"></div>-->

    <q-slider style="padding:7px 20px" color="black" v-model="player.position" :min="0" :max="500" />

    <router-view :route="routedDialog"></router-view>
    <router-view name="player" @go="go" @mount="mount"></router-view>

  </q-page>
</template>
<style lang="sass">
@import 'https://cdn.plyr.io/3.7.3/plyr.css'
</style>
