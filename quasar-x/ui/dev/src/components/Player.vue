<script setup>
import { toRefs, ref, computed, reactive, toRaw } from 'vue'

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  player: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function }
})
// empty emits section is necessary to prevent errors

const player  = reactive(props.player)
const go = toRaw(props.go)

function rotate() {
  if (player.view !== 'full' && player.item){
    go({ name: 'watch', query: { id: player.item.id }})
  } else if (player.item) {
    player.view = 'folded'
  } else {
    player.view = 'hidden'
  }
}
const rotation = computed(() => player.view !== 'full' ? '' : 'rotate-180')
</script>
<template>
<div>
  <q-slider
    color="black"
    class="player"
    v-model="player.position"
    thumb-size="4px"
    :min="0"
    :max="500" />

  <div class="row q-pa-sm">
    <div>
      <q-btn flat round icon="skip_previous" />
      <q-btn size="30px" flat icon="play_arrow" />
      <q-btn flat round icon="skip_next" />
    </div>
    <div class="col-grow"></div>
    <div class="q-pa-md">
      <q-btn flat round icon="volume_up" />
      <q-btn flat round icon="repeat" />
      <q-btn flat round icon="shuffle" />
      <q-btn :class="rotation" style="transition:0.3s" @click="rotate" flat round icon="keyboard_arrow_up" />
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
