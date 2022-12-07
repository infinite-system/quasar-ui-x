<script setup>
import { watch, ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useX, prop } from "../../../src/x/utils";
import { isObject } from "../../../src/x/utils";
import { Platform } from 'quasar'
import data from 'src/assets/YMMItems.json'

const $x = useX()

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  player: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function }
})

const route = useRoute()
const dialog = prop(props.dialog)
const player = reactive(props.player)
const go = prop(props.go)

const item = ref(null)
const switchItem = ref(null)
const viewStyle = ref('')
watch(() => props.player.view, () => {
  switch (props.player.view) {
    case 'hidden':
      viewStyle.value = `height:0 !important; padding:0; overflow:hidden;`
      switchItem.value = null
      // dialog.update({ maximized: false })
      break;
    case 'folded':
      viewStyle.value = 'height:200px; overflow:auto;'
      switchItem.value = null
      // dialog.update({ maximized: false })
      break
    case 'full':
      const topMargin = Platform.is.mobile && Platform.is.android ? 160 : 128
      viewStyle.value = `height:calc(100vh - ${topMargin}px); overflow:auto;`
      // dialog.update({ maximized: true })
      break
  }
}, { immediate: true })


const router = useRouter()
watch(() => route.query.id, () => {

  if (route.query.id) {

    // if ($x.history.isInitialLoad) {
    //   player.setItem = true
    // }
    if ($x.history.isInitialLoad && !player.setItem

    || !$x.history.isInitialLoad && player.setItem) {

        player.item = data.items.filter(el => el.id === route.query.id)[0]

    }

    console.log('$x.history.isInitialLoad', $x.history.isInitialLoad,
      'player.setItem', player.setItem)

    if (!$x.history.isInitialLoad) {

      if (player.item.id === route.query.id) {

        switchItem.value = null

      } else {

        if (!player.setItem) {
          switchItem.value = data.items.filter(el => el.id === route.query.id)[0]

          // router.replace({ name: 'watch', query: { id: player.item.id }})

        }
      }

      console.log('switch item player.item', player.item)
    }

  }

  player.setItem = false

}, { immediate: true })


// watch(() => player.setItem, () => {
//     console.log('$x.history.isInitialLoad', $x.history.isInitialLoad, 'player.setItem', player.setItem)
// }, { immediate: true })
function doSwitchItem () {
  player.item = switchItem.value
  console.log('player.item', player.item)
  switchItem.value = false
}
</script>
<template>
  <div :style="'transition:0.6s;'+viewStyle">
  <q-slider
    color="black"
    class="player"
    v-model="player.position"
    thumb-size="4px"
    :min="0"
    :max="500" />
    <div class="q-pa-sm">
    <div v-if="!player.setItem && switchItem">
       <q-banner inline-actions rounded class="bg-purple-8 text-white">

          <div v-if="switchItem" class="row q-pa-sm" @click="go({ name: 'watch', query: { id: switchItem.id } })">
            <div>
              <img width="80" :src="`https://img.youtube.com/vi/${switchItem.id}/0.jpg`">
            </div>
            <div class="q-pa-sm">
              {{ switchItem.title }}<br />
              {{ switchItem.author }}<br />
            </div>
          </div>

        <template v-slot:action>
          <q-btn flat round color="white" size="lg" class="q-mr-sm" icon="play_arrow"
                 @click="doSwitchItem" />
          <q-btn flat round color="white" size="lg" icon="close" @click="go({name:'watch',query:{id:player.item.id}})" />
        </template>
      </q-banner>
    </div>


    <div v-if="isObject(player.item)">
      <div class="row q-pa-sm" @click="go({ name: 'watch', query: { id: player.item.id } })">
        <div>
          <img width="80" :src="`https://img.youtube.com/vi/${player.item.id}/0.jpg`">
        </div>
        <div class="q-pa-sm">
          {{ player.item.title }}<br />
          {{ player.item.author }}<br />
        </div>
      </div>
    </div>


    <div class="q-pa-lg-sm">
      <q-btn class="float-right" @click="player.view = 'folded'">fold</q-btn>
      <q-btn class="float-right" @click="player.view = 'hidden'">hide</q-btn>
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
