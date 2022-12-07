<script setup>
import { computed, markRaw, onBeforeUpdate, onMounted, ref, watch } from "vue";
import { useX } from "../../../src/x/utils/use-x";

import { useRoute, useRouter } from "vue-router";
import { isString } from "../../../src/x/utils/is";
import { byId, keepAlive } from "../../../src/x/utils";
import { QBtn } from 'quasar'


const $x = useX()

function style (dialog, name) {

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

function player (dialog, name) {

  dialog.$style(`<style>
    .x-dialog.player .x-dialog__inner-load {
      border-radius: 0;
      background-color: #ffffff1a;
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

function move (dialog, name) {

  return (position) => {

    if (isString(position)) {

      const dialogs = document.querySelectorAll('div[data-v-app][x-type="XDialog"]')

      switch (position) {
        case 'bottom':
          if (dialogs.length) {
            dialogs[0].parentNode
              .insertBefore(dialog.xDOM().xComponent(), dialogs[0])
            console.dir(dialog.xDOM().xComponent())
          }
          break;
        case 'top':
          if (dialogs.length) {
            console.log(dialogs[dialogs.length - 1], dialogs[dialogs.length - 1].nextSibling)
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

const playerProps = ref({
  position: 0
})

function createPlayer () {

  const playerComp = byId('Player')

  if (playerComp) {
    playerProps.value = playerComp.$XDialog.xProps().player
    return playerComp.$XDialog
  }

  return $x.dialog({
    id: 'Player',
    options: { position: 'bottom', seamless: true, ok: false },
    load: () => import('../components/Player'),
    props: { player: playerProps },
    onLoad: ({ dialog }) => {
      setInterval(() => {
        playerProps.value.position += 1
      }, 100)
      dialog.$move('html')
    },
    plugins: {
      move,
      style,
      player,
    },
  })
}

function createBigPlayer () {

  const bigPlayer = byId('BigPlayer')

  return (bigPlayer)
    ? bigPlayer.$XDialog
    : $x.dialog({
      id: 'BigPlayer',
      router: 'ymd-watch',
      options: {
        position: 'bottom',
        seamless: true,
        noRouteDismiss: true,
        transitionShow: 'jump-up',
        ok: false
      },
      onHide: () => {
        // not showing anymore, set to false
        show.value = false
      },
      config: {
        dismiss: {
          redirect: {
            fn: (route) => route.back()
          }
        }
      },
      load: () => import('../components/BigPlayer.vue'),
      props: {
        player: playerProps
      }
    })
}

let bigPlayer = null
let show = ref(true)

onMounted(() => {

  //https://stackoverflow.com/a/58950454/1502706
  window.onpopstate = async function(event) {
    try {
      const directions = ['back', 'forward']

      console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
      console.log('event', event)
      let firstTime = true

      let direction = ''

      if ('__lastPosition' in window) {
        firstTime = false
        window.__prevPosition = window.__lastPosition
      } else {
        direction = 'back'
      }

      if (!firstTime) {
        if (window.__prevPosition > event.state.position) {
          direction = 'back'
        } else {
          direction = 'forward'
        }

        window.__prevPosition = window.__lastPosition
        window.__lastPosition = event.state.position
      }
      // if (directions.includes(direction)){

      const { pathname, search, hash } = document.location

      const resolvedRoute = router.resolve({
        path: pathname + search + hash
      })

      console.log('direction', direction,
        'document.location', document.location,
        'document.location.href', document.location.href,
        'resolvedRoute', resolvedRoute)

      if (resolvedRoute.name === 'ymd-watch') {

        console.log('going into watch')

        show.value = true

        const opposite = direction === 'forward' ? 'back' : 'forward'

        const path = event.state[direction] ? event.state[direction] : event.state[opposite]

        console.log('path', path)
        bgView.value = { name: router.resolve({ path: path }).name }
        console.log('bgView.value', JSON.stringify(bgView.value))

      } else {

        console.log('going not into watch')

        await playerHideAsync('BigPlayer')

        unfreezeRouterView()
      }

      // }
    } catch (e) {
      console.log('exception', e)
    }

  }

  createPlayer()


})

function unfreezeRouterView () {
  bgView.value = false
}

async function playerHideAsync (id) {

  try {
    const player = byId(id)

    if (player) {

      const dialog = player.$XDialog

      dialog.config({ dismiss: { redirect: { on: false } } })

      await dialog.hideAsync()

      dialog.config({ dismiss: { redirect: { on: true } } })
    }

  } catch (e) {
    console.log('exception', e)
  }

}

const route = useRoute()
const router = useRouter()

const bgView = ref(false)

const routedDialog = computed(() => bgView.value ? router.resolve(bgView.value) : route)

async function linkFn (event, { navigate }) {

  const bigPlayer = byId('BigPlayer')

  if (bigPlayer) {

    event.preventDefault();

    await playerHideAsync('BigPlayer')

    navigate(event.originalEvent)

  } else {
    navigate(event)
  }

  unfreezeRouterView()
}

function watchFn (event, { navigate }) {

  show.value = true

  if (route.name !== 'ymd-watch') {
    bgView.value = { name: route.name }
  }

  navigate(event)
}

function mount (props) {

  try {
    if (props.show) {
      bigPlayer = createBigPlayer()
      bigPlayer.props(props)
    }

  } catch (e) {
    console.log('exception', e)
  }

}

async function unmount () {

  try {

    unfreezeRouterView()

    await playerHideAsync('BigPlayer')

  } catch (e) {
    console.log('e', e)
  }
}

</script>
<template>
  <q-page padding>

    <div class="row flex-center">
      <x-link :btn="QBtn" class="q-btn--flat" :fn="linkFn" :to="{name:'ymd-home'}">Home</x-link>
      <x-link :btn="QBtn" class="q-btn--flat" :fn="linkFn" :to="{name:'ymd-explore'}">Explore</x-link>
      <x-link :btn="QBtn" class="q-btn--flat" :fn="linkFn" :to="{name:'ymd-library'}">Library</x-link>
      <x-link :btn="QBtn" class="q-btn--flat" :fn="watchFn" :to="{name:'ymd-watch'}">Watch</x-link>
    </div>

    <q-slider style="padding:7px 20px" color="black" v-model="playerProps.position" :min="0" :max="500" />

    <router-view :route="routedDialog"></router-view>
    <router-view name="player" :show="show" @mount="mount" @unmount="unmount"></router-view>

  </q-page>
</template>
