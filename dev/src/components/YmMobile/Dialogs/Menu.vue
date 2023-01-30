<script setup>
import { toRefs, ref, computed, reactive, toRaw, watch } from 'vue'
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar()

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  player: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function }
})

const player = reactive(props.player)
const go = toRaw(props.go)

function rotate () {
  if (player.view !== 'full' && player.item) {
    go({ name: 'watch', query: { id: player.item.id } })
  } else if (player.item) {
    player.view = 'folded'
  } else {
    player.view = 'hidden'
  }
}

const route = useRoute()
const tab = ref('')
watch(() => route.name, () => tab.value = route.name, { immediate: true })
const rotation = computed(() => player.view !== 'full' ? '' : 'rotate-180')
</script>
<template>
  <q-tabs
    v-model="tab"
    indicator-color="transparent"
    :active-color="$q.dark.isActive ? 'white' : 'black'"
    class="text-grey-14"
    content-class="justify-evenly"
  >
    <q-tab class="col-grow text-weight-light text-capitalize" name="home" @click="go({name:'home'})" icon="home">
      <span class="menu-font">Home</span>
    </q-tab>
    <q-tab class="col-grow text-weight-light text-capitalize" name="explore" @click="go({name:'explore'})"
           icon="sym_s_explore">
      <span class="menu-font">Explore</span>
    </q-tab>
    <q-tab class="col-grow text-weight-light text-capitalize" name="library" @click="go({name:'library'})"
           icon="sym_s_library_music">
      <span class="menu-font">Library</span>
    </q-tab>
  </q-tabs>
</template>
<style lang="sass">
.material-symbols-sharp
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48

.menu-font
  font-size: 12px
</style>
