<script setup>
import { toRefs, ref, computed, reactive, toRaw } from 'vue'
import EssentialLink from '../../../EssentialLink.vue'

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  app: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function },
  accountslugBack: { default: () => () => {}, type: Function },
})
// empty emits section is necessary to prevent errors

defineEmits(['mount'])
const dialog = toRaw(props.dialog)
const go = toRaw(props.go)

const essentialLinks = [
  { title: 'General', icon: 'sym_s_account_circle', to: { name : 'account', params: { part: ['settings', 'general'] } } },
  { title: 'Playback', icon: 'sym_s_download', to: { name : 'settings', params: { part: 'playback' }  } },
];

</script>
<template>
  <div class="row q-py-md">
    <div class="adjust-back-arrow">
      <q-btn @click="accountslugBack" flat round icon="sym_s_arrow_back" size="md" class="q-mx-sm" />
    </div>
    <div class="col-grow text-h5 q-pa-none">Switch Account</div>
  </div>
  <EssentialLink
    v-for="link in essentialLinks"
    :key="link.title"
    v-bind="link"
    :go="go"
  />
</template>
<style lang="sass" scoped>
</style>
