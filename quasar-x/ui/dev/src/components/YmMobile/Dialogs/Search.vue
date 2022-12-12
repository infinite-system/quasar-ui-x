<script setup>
import { toRefs, ref, computed, reactive, toRaw } from 'vue'

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  player: { default: () => ({}), type: Object },
  opts: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function },
  test200: { default: 'no', type: String },
  another: { default: 'another', type: String },
})
// empty emits section is necessary to prevent errors

const dialog = toRaw(props.dialog)
const player = reactive(props.player)
const opts = reactive(props.opts)
const go = toRaw(props.go)
setTimeout(() => {
  dialog.props({ test200: 'aaaaaa' }, { update: true })
}, 3000)
const search = ref('')


const positionOptions = [
  'left',
  'right',
  'bottom',
  'top',
  'standard'
]
</script>
<template>
  <div class="row q-py-md">
    <div style="margin-top:-2px"><q-btn @click="dialog.hide()" flat round icon="sym_s_arrow_back" size="md" class="q-mx-sm" /></div>
    <div class="col-grow">

<q-select v-model="opts.position" :options="positionOptions" label="Select Position" />
      <q-input dense rounded standout autofocus v-model="search">
        <template v-slot:prepend>
          <q-avatar>
          <q-icon name="sym_s_search" size="sm" />
            </q-avatar>
        </template>
      </q-input>
{{test200}}
{{another}}
    </div>
    <div><q-btn
      @click="dialog.hide()" flat round icon="sym_s_mic" size="md" class="bg-grey-3 q-px-sm q-ml-sm q-mr-md" /></div>
  </div>
</template>
<style lang="sass" scoped>
</style>
