<script setup>
import { computed, markRaw, onMounted, ref, watch } from "vue";
import { useX } from "../../../src/x/utils/use-x";

import { useRoute, useRouter } from "vue-router";
import { isString } from "../../../src/x/utils/is";
import { byId } from "../../../src/x/utils";

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

  const playerComp = byId('Player_component')
  if (playerComp){
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

onMounted(() => {
  createPlayer()
})

const route = useRoute()
const router = useRouter()

const bgView = ref(false)

const routedDialog = computed(() => bgView.value ? router.resolve(bgView.value) : route)

async function linkFn (event, { navigate }) {
  const watchPlayer = byId('WatchPlayer_component')

  if (watchPlayer) {
    const player = watchPlayer.$XDialog
    event.preventDefault();
    player.config({ dismiss: { redirect: { on: false } } })
    await player.hideAsync()
    player.config({ dismiss: { redirect: { on: true } } })
    navigate(event.originalEvent)
  }
  navigate(event)

  bgView.value = false
}

function watchFn (event, { navigate }) {
  if (route.name !== 'watch') {
    bgView.value = { name: route.name }
  }
  navigate(event)
}

function destroy({dialog}){
  bgView.value = false
}
</script>
<template>
  <q-page padding>

    <x-link :fn="watchFn" :to="{name:'watch'}">Watch</x-link>
    <x-link :fn="linkFn" :to="{name:'explore'}">Explore</x-link>
    <x-link :fn="linkFn" :to="{name:'home'}">Home</x-link>

    <q-slider style="padding:7px 20px" color="black" v-model="playerProps.position" :min="0" :max="500" />

    <router-view :route="routedDialog"></router-view>
    <router-view name="player" @destroy="destroy"></router-view>

  </q-page>
</template>
