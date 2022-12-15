<template>
  <div class="row q-py-md">
    <div style="margin-top:-6px">
      <q-btn @click="dialog.hide()" flat round icon="sym_s_arrow_back" size="md" class="q-mx-sm" />
    </div>

    <div class="col-grow text-h5 q-pa-none">Account</div>

  </div>

  <div class="q-pa-md text-uppercase q-card--bordered">Music Premium</div>

  <EssentialLink
    v-for="link in essentialLinks"
    :key="link.title"
    v-bind="link"
    :go="go"
  />
</template>
<style lang="sass" scoped>
</style>
<script setup>
import EssentialLink from '../../EssentialLink.vue'
import { toRefs, ref, computed, reactive, toRaw } from 'vue'
import extend from '#/x/utils/extend'

function handleClick(evt, go){
  //g
}
const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  player: { default: () => ({}), type: Object },
  opts: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function },
  // onMount: { default: () => () => {}, type: Function }
})

defineEmits(['mount'])
// empty emits section is necessary to prevent errors

const dialog = toRaw(props.dialog)
const player = reactive(props.player)
const opts = reactive(props.opts)
const go = toRaw(props.go)

const search = ref('')

const essentialLinks = [
  { title: 'Your channel', icon: 'sym_s_account_circle', to: { name : 'account' } },
  { title: 'Downloads', icon: 'sym_s_download', to: { name : 'account' } },
  { title: 'History', icon: 'sym_s_history', to: { name : 'account' } },
  { title: 'Your Recap', icon: 'sym_s_fast_rewind', to: { name : 'account' } },
  { title: 'Paid Memberships', icon: 'sym_s_paid', to: { name : 'account' } },
  { title: 'Switch Account', icon: 'sym_s_switch_account', to: { name : 'account', params: { part: 'switch' } } },
  { title: 'Settings', icon: 'sym_s_settings', to: { name : 'account', params: { part: 'settings' } } },
  { title: 'Help and Feedback', icon: 'sym_s_help', to: { name : 'account' } }
];

</script>
