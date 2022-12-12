<script setup>
import { computed, onMounted, ref, watch, reactive, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useX, byId, extend } from "../../../src/x/utils";
import { $style, $move } from "../../../src/x/dialog/XDialogPlugins.js";
import { QBtn, useQuasar } from 'quasar'
import Plyr from 'plyr'
import data from 'src/assets/YoutubeItems.json'

const $x = useX()
const $q = useQuasar()

const route = useRoute()
const router = useRouter()


onBeforeUnmount(() => {
  Player().destroy()
  Menu().destroy()
  Search().destroy()
})

const bgRouterView = ref(null)
const routedDialog = computed(() => bgRouterView.value ? resolve(bgRouterView.value) : route)

function $wide (dialog, name) {

  dialog.$style(`<style>
    .x-dialog.wide .x-dialog-plugin-load {
      border-radius: 0;
      width: 100vw !important;
    }

    .x-dialog.wide .q-dialog__inner--minimized {
      padding:0;
    }

   .x-dialog.wide .q-dialog__inner--minimized > div {
     max-width: 100vw !important;
     width: 100vw !important;
     max-height: 100vh !important;
   }
  </style>`)

  dialog.update({
    class: `${dialog.xClass()} wide`,
  });
}

function $player (dialog, name) {

  dialog.$style(`<style>
    .x-dialog.player .x-dialog-plugin-load {
      background-color: #ffffff;
      -webkit-box-shadow: 0 0 4px -1px rgba(0,0,0,0.33);
      box-shadow: 0 0 4px -1px rgba(0,0,0,0.33);
    }

    .x-dialog.player .x-dialog-plugin-load {
      overflow: inherit; /* makes knob visible on folded player */
    }
  </style>`)

  dialog.update({
    class: `${dialog.xClass()} player`,
  });
}


const storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {}
  },
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
}

const session = {
  get: (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch (e) {}
  },
  set: (key, value) => sessionStorage.setItem(key, JSON.stringify(value))
}

const app = {
  history: 'push', // 'replace' | 'push'
  home: { name: 'home' },
  dialogViews: ['watch', 'search', 'user']
}

const player = reactive({
  position: 0,
  item: storage.get('player.item'),
  view: storage.get('player.item') ? 'folded' : 'hidden',
  setItem: false
})

console.log('player', storage.get('player.item'))

const menu = {
  id: 'Menu',
  options: {
    position: 'bottom',
    seamless: true,
    ok: false
  },
  load: () => import('../components/YmMobile/Dialogs/Menu.vue'),
  props: { player, go },
  onLoad: () => {
    setInterval(() => {
      player.position += 1
      if (player.position >= 500) {
        player.position = 0
      }
    }, 250)
  },
  plugins: {
    $style,
    $wide,
  },
}

let _Menu

function Menu () {
  return _Menu ? _Menu : _Menu = $x.dialog(menu)
}

const beforeWatchPath = ref('')
const playerDialog = {
  id: 'Player',
  router: 'watch',
  debug: true,
  options: {
    position: 'bottom',
    seamless: true,
    noRouteDismiss: true,
    transitionShow: 'jump-up',
    ok: false
  },
  onHide: () => {
    player.view = 'hidden'
  },
  config: {
    dismiss: {
      redirect: {
        on: false
      }
    }
  },
  load: import('src/components/YmMobile/Dialogs/Player.vue'),
  props: {
    app,
    player,
    beforeWatchPath,
    freezeView,
    go,
  },
  plugins: {
    $style,
    $wide,
    $player
  }
}

let _Player

function Player () {
  return _Player ? _Player : _Player = $x.dialog(playerDialog)
}

function notDialogView (route) {
  // route is not 'watch' and not all other dialog views, like 'search', 'user', etc.
  return !app.dialogViews.includes(route.name)
}

function onBackForward (fn) {
  // onBackForward history change
  // https://stackoverflow.com/a/58950454/1502706
  addEventListener('popstate', fn)
}

onMounted(() => {

  onBackForward(() => {
    const current = resolve(currentPath())

    if (notDialogView(current)) {
      unfreezeView()
      setBeforeWatchPath(current.fullPath)
    }
  })

  if (notDialogView(route)) {
    console.log('route.fullPath', route.fullPath)
    setBeforeWatchPath(route.fullPath)
  }

  Player()
  Menu()
  Search()

  const plyr = new Plyr('#plyr');
})

watch(() => route.name, () => {

  if (route.name === 'watch') {
    player.view = 'full'
  } else {
    player.view = player.item ? 'folded' : 'hidden'
  }

}, { immediate: true })

watch(() => player.item, () => {

  if (!player.item) {
    player.view = 'hidden'
  }

  storage.set('player.item', player.item)
})

function goBeforeWatch () {
  console.log('beforeWatchPath.value', beforeWatchPath.value)
  return go(beforeWatchPath.value)
}

function goBack () {
  return router.back()
}

function goHome () {
  return go(app.home)
}

function goBackOrHome () {

  const back = history.state.back
  const backName = back ? resolve(back).name : null

  if (back
    && !app.dialogViews.includes(backName)
  ) {
    return goBack()
  } else {
    return goHome()
  }
}

function isWatchView () {
  return route.name === 'watch'
}

function playerIsFoldingHiding () {
  return ['hidden', 'folded'].includes(player.view)
}

function playerFoldMoveHistory () {
  if (getBeforeWatchPath()) {
    return goBeforeWatch()
  } else {
    return goBackOrHome()
  }
}

watch(() => player.view, () => {

  if (player.view === 'hidden') {
    player.item = null
  }

  if (isWatchView() && playerIsFoldingHiding()) {
    playerFoldMoveHistory()
  }
})

function resolve (to) {
  return router.resolve(to)
}

function push (to) {
  to = resolve(to)

  if (to.name === 'watch') {
    player.setItem = true
  }

  return router.push(to)
}

function replace (to) {
  to = resolve(to)

  if (to.name === 'watch') {
    player.setItem = true
  }

  return router.replace(to)
}

function currentPath () {
  const { pathname, search, hash } = document.location
  const currentPath = pathname + search + hash
  console.log('currentPath', currentPath)
  return currentPath
}

function setBeforeWatchPath (to) {
  console.log('setBeforeWatchPath', to)
  session.set('beforeWatchPath', beforeWatchPath.value = to)
}

function getBeforeWatchPath () {
  return beforeWatchPath.value = session.get('beforeWatchPath')
}

function youtubeGo (to) {

  const watchToWatch = to.name === 'watch' && route.name === 'watch'

  return watchToWatch
    ? replace(to)
    : push(to)
}

function go (to) {

  to = resolve(to)

  if (app.dialogViews.includes(to.name)) {
    freezeView()
  } else {
    unfreezeView()
    setBeforeWatchPath(to.fullPath)
  }

  if (app.history === 'replace') {
    return youtubeGo()
  } else {
    return push(to)
  }
}

function mountPlayer (props) {
  extend(playerDialog, props)
}


let _Search

function Search () {
  return _Search ? _Search : _Search = $x.dialog(search)
}

const show = ref(true)

const opts = reactive({
  maximized: false,
  fullWidth: true,
  fullHeight: true,
  position: 'right',
  seamless: true,
  transitionShow: 'none',
  transitionHide: 'none',
  ok: false
})

const config = reactive({
  dismiss: { redirect: { on: false } }
})

const props = reactive({
  go,
  test200: 'lalala',
  opts: opts
})

const load = ref(() => import('src/components/YmMobile/Dialogs/Search.vue'))

const search = {
  modelValue: ref(false),
  id: 'Search',
  router: 'search',
  options: opts,
  load: load,
  onShow: ({ dialog }) => {
    dialog.$move('bottom')
  },
  props: props,
  plugins: { $move },
  config
}

function mountSearch () {

  // console.log('merging opts', props)
  if (route.name === 'search') {

    // search.modelValue.value = true
    extend(search, {
      modelValue: {
        value: true
      },
      config: {
        dismiss: {
          redirect: {
            on: true,
            fn: ({ router }) => {
              console.log('go back search')
              return history.state.back ? router.back() : go(app.home)
            }
          }
        }
      },
      // props: { test200: 'yes '}
    })

    props.test200 = 'hohoho'
    // Search()
    // search.props.test200 = 'hahaaaaa'
    // show.value = true
    // search.modelValue = ref(true)
    // Search().show()
    // alert('ddaaa')
    // Search()
    // console.log('Search().xConfig()', Search().xConfig())
  } else {

    // alert('yes')

    // alert('aaa')
    // search.modelValue.value = false
    // search.props.test200 = 'haha'
    extend(search, {
      modelValue: {
        value: false,
      },
      config: { dismiss: { redirect: { on: false } } },
      // props: { test200: 'aaaa '}
    })
    // Search().props()
    props.test200 = 'hihihi'

    console.log('search', search)
  }
}

const isFrozen = ref(false)

function freezeView (value) {

  // more info on this implementation
  // https://github.com/vuejs/vue-router/issues/703
  // https://github.com/vuejs/rfcs/blob/master/active-rfcs/0036-router-view-route-prop.md
  // https://github.com/vuejs/vue-router/issues/703#issuecomment-428123334

  if (!isFrozen.value) {

    // save router-view state, make it static
    // it won't change with router change now
    bgRouterView.value = value || route.fullPath
    isFrozen.value = true
  }
}

function unfreezeView () {

  if (isFrozen.value) {
    // unfreeze router-view to be able to set it
    // from the router navigation
    bgRouterView.value = null
    isFrozen.value = false
  }
}


const selectOptions = [
  'lalala',
  'blablabla'
]

const positionOptions = [
  'left',
  'right',
  'bottom',
  'top',
  'standard'
]
</script>
<template>

  <q-layout view="hHh lpr fFf">

    <q-header :elevated="false" class="bg-white">
      <q-toolbar>
        <q-toolbar-title>
          <div @click="go({ name: 'home' })" class="logo"></div>
        </q-toolbar-title>
        <q-btn flat @click="go({name:'search'})" round dense color="black" icon="sym_s_search" class="q-mr-xs" />
        <q-btn flat round dense color="black" icon="sym_s_account_circle" />
      </q-toolbar>
    </q-header>
    <q-toggle v-model="search.config.dismiss.redirect.on" label="config.dismiss.redirect.on" />
    <q-select v-model="props.test200" :options="selectOptions" label="Select Prop" />
    <q-select v-model="opts.position" :options="positionOptions" label="Select Position" />

    <q-input v-model="props.test200" />
    <q-page-container>
      <br />{{ beforeWatchPath }}

      <q-toggle v-model="search.modelValue.value" label="show" />
      <!--    <pre>{{ player }}</pre>-->
      <pre>{{ search }}</pre>

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

      <q-slider style="padding:7px 20" color="black" v-model="player.position" :min="0" :max="500" />

      <router-view :route="routedDialog" v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>

      <router-view name="player" @mount="mountPlayer"></router-view>
      <router-view name="search" @mount="mountSearch"></router-view>

    </q-page-container>

  </q-layout>
</template>
<style lang="sass">
@import 'https://cdn.plyr.io/3.7.3/plyr.css'

.logo
  width: 80px
  height: 50px
  background: url('src/assets/YouTube-Music-Logo.png') center center
  background-size: 120px 85px
  cursor: pointer
</style>
