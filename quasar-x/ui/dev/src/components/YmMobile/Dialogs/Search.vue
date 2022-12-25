<script setup>
import { toRefs, ref, computed, reactive, toRaw } from 'vue'

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  player: { default: () => ({}), type: Object },
  options: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function },
  reactiveProp: { default: 'no', type: String },
})
// empty emits section is necessary to prevent errors

const dialog = toRaw(props.dialog)
const player = reactive(props.player)
const options = reactive(props.options)
const go = toRaw(props.go)

setTimeout(() => {
  dialog.props({ test: 'asfsdfs' })
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
  <div>
    <div class="row q-py-md">
      <div style="margin-top:-2px">
        <q-btn @click="dialog.hide()" flat round icon="sym_s_arrow_back" size="md" class="q-mx-sm" />
      </div>
      <div class="col-grow">

        <q-input dense rounded standout autofocus v-model="search">
          <template v-slot:prepend>
            <q-avatar>
              <q-icon name="sym_s_search" size="sm" />
            </q-avatar>
          </template>
        </q-input>

      </div>
      <div>
        <q-btn
          @click="dialog.hide()" flat round icon="sym_s_mic" size="md" class="q-px-sm q-ml-sm q-mr-md" />
      </div>
    </div>
    <div class="q-pa-md">
      <q-select v-model="options.position" :options="positionOptions" label="Select Position" />
    </div>
    {{ reactiveProp }}
  </div>
</template>
<style lang="sass" scoped>
</style>
