<script setup>
import { watch, ref, reactive, onMounted, toRefs, toRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useX, isObject } from "../../../../../src/x/utils";
import { Platform, useQuasar } from 'quasar'
import data from 'src/assets/YoutubeItems.json'

const $q = useQuasar()
const $x = useX()

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function },
  app: { default: () => ({}), type: Object },
})

const route = useRoute()
const router = useRouter()

const dialog = toRaw(props.dialog)
const app = toRaw(props.app)
const player = reactive(app.player)
const go = toRaw(props.go)

const switchItem = ref(null)
const playerBox = ref(null)

onMounted(() => {

  watch(() => player.view, () => {
    switch (player.view) {
      case 'hidden':
        playerBox.value.style.cssText = `transition:0.4s; transform: scaleY(0); padding:0; overflow:hidden;`
        // dialog.update({ maximized: false })

        switchItem.value = null
        break;
      case 'folded':

        playerBox.value.style.cssText = 'transition:0.4s; height:142px;transform: scaleY(1); '
        // dialog.update({ maximized: false })

        switchItem.value = null
        break
      case 'full':

        const topMargin = Platform.is.mobile && Platform.is.android ? 350 : 350
        playerBox.value.style.cssText = `transition:0.4s; height:calc(100vh - ${topMargin}px);transform: scaleY(1); overflow:auto;`
        // viewStyle.value = 'height:100vh;'
        // setTimeout(() => {
        //   // dialog.update({ maximized: true })
        // }, Platform.is.mobile && Platform.is.android ? 0 : 700)

        break
    }
  }, { immediate: true })

})

function doSwitchItem () {
  player.item = switchItem.value
  switchItem.value = null
}

let playerBoxHeight = null
let height = 0
const isDragging = ref(false)

function userHasPanned ({ evt, ...pan }) {

  if (pan.isFirst) {
    playerBox.value.style.transition = '0s'
    playerBoxHeight = playerBox.value.clientHeight
    height = playerBoxHeight
    isDragging.value = true
  }

  const multiplier = 1.3
  const direction = pan.direction === 'up' ? +1 : -1
  height = playerBoxHeight + pan.distance.y * direction * multiplier

  playerBox.value.style.height = height + 'px'

  if (pan.isLast) {
    isDragging.value = false
  }
}

function noItem () {
  player.item = null
  if (history.state.back) router.back()
  else go(app.config.home)
}

function getItem (watchId) {
  return data.items.filter(item => item.id === watchId)[0]
}

function freezeRouter () {
  if (app.config.dialogViews.includes(route.name) && app.view.beforeWatch.value) {
    // this will retain in memory the view when we start
    // going forward in history, after going backward in history first
    app.view.freeze(app.view.beforeWatch.value)
  }
}

function setItem () {

  if (
    $x.history.isFirstLoad && !player.setItem // first load but not setting item
    || !$x.history.isFirstLoad && player.setItem // or not first load & setting item
    || !player.item // or player has no item
  ) {
    // set new item
    console.log('$x.history.isFirstLoad', $x.history.isFirstLoad,
      'player.setItem', player.setItem)
    player.item = getItem(route.query.id)
  }

}

function swapItem () {

  if (
    !$x.history.isFirstLoad // not first load
    && !player.setItem // & we are not setting item
    && player.item // & there is already item in player
  ) {
    if (player.item.id === route.query.id) {
      switchItem.value = null
    } else {
      swap()
    }
  }
}

function swap () {

  // Handle 2 different history modes
  // Youtube Music like 'replace' style
  if (app.config.history === 'replace') {
    // replace history with stored player item
    // we only set the last playing item into the player
    // we do not mutate the player because of url query
    // we actually mutate the query to the one we have in store
    // preventing it from displaying, that's how it is implemented
    // in Youtube Music App
    router.replace({ name: 'watch', query: { id: player.item.id } })
  } else {
    // Normal style with history and proper back / forward mechanism
    // propose switching to another played item, but continue playing
    // the item that is already playing in a mini player
    switchItem.value = getItem(route.query.id)
  }
}

watch(() => route.query.id, () => {

  // only process the 'watch' route here
  if (route.name !== 'watch') return

  if (!('id' in route.query)) {
    noItem()
  } else {
    freezeRouter()
    setItem()
    swapItem()
  }

  // we are no longer setting the item
  player.setItem = false

}, { immediate: true })
</script>
<template>
  <div ref="playerBox" v-touch-pan.up.down.mouse.prevent="userHasPanned">
    <q-slider
      v-show="!isDragging && player.view === 'folded'"
      :color="$q.dark.isActive ? 'white': 'grey-10'"
      class="player"
      v-model="player.position"
      thumb-size="10px"
      style="position:absolute;"
      :min="0"
      :max="500" />

    <div class="q-pa-sm">
      <div v-if="!player.setItem && switchItem">
        <q-banner inline-actions rounded class="bg-purple-8 text-white">
          <div
            v-if="switchItem" class="row q-pa-sm"
            @click="go({ name: 'watch', query: { id: switchItem.id } })">
            <div>
              <img width="80" height="60" :src="`https://img.youtube.com/vi/${switchItem.id}/0.jpg`">
            </div>
            <div class="q-pa-sm">
              {{ switchItem.title }}<br />
              {{ switchItem.author }}<br />
            </div>
          </div>

          <template v-slot:action>
            <q-btn flat round color="white" size="lg" class="q-mr-sm" icon="play_arrow"
                   @click="doSwitchItem" />
            <q-btn flat round color="white" size="lg" icon="close"
                   @click="go({name:'watch',query:{id:player.item.id}})" />
          </template>
        </q-banner>
      </div>

      <div v-if="isObject(player.item)">
        <div class="row q-pa-sm no-wrap" style="max-width:100wh !important;">
          <div
            class="no-wrap col-grow"
            style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis; word-wrap: unset"
            @click="go({ name: 'watch', query: { id: player.item.id } })">
            <div class="row no-wrap"
                 style="min-width:0;overflow:hidden;">
              <div>
                <img width="80" :src="`https://img.youtube.com/vi/${player.item.id}/0.jpg`">
              </div>
              <div class="q-pa-sm"
                   style="flex:1 1 auto;max-height:min-width:0;overflow:hidden; max-height:50px;">
                {{ player.item.title }}<br />
                {{ player.item.author }}<br />
              </div>
            </div>
          </div>
          <div class="row no-wrap q-pa-lg-sm" @touchstart.stop @mousedown.stop>
            <div>
              <q-btn flat round size="lg"
                     @click="player.view = 'folded'"
                     icon="sym_s_keyboard_arrow_down"></q-btn>
            </div>
            <div>
              <q-btn flat round size="lg"
                     @click="player.view = 'hidden'"
                     icon="sym_s_close"></q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<style lang="sass" scoped>
.player :deep(.q-slider__track-container)
  padding: 0

.player :deep(.q-slider__track)
  border-radius: 0

.player.q-slider
  display: block
</style>
