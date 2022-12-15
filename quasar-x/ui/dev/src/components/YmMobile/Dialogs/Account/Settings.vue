<script setup>
import { toRefs, ref, computed, reactive, toRaw } from 'vue'
import EssentialLink from '../../../EssentialLink.vue'

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  app: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function },
  settingsBack: { default: () => () => {}, type: Function },
})
// empty emits section is necessary to prevent errors

defineEmits(['mount'])
const dialog = toRaw(props.dialog)
const go = toRaw(props.go)

const essentialLinks = [
  { title: 'General', icon: 'sym_s_display_settings', to: { name : 'account', params: { part: ['settings', 'general'] } } },
  { title: 'Playback', icon: 'sym_s_play_circle', to: { name : 'settings', params: { part: 'playback' }  } },
  { title: 'Data saving', icon: 'sym_s_database', to: { name : 'settings', params: { part: 'data' }  } },
  { title: 'Downloads & storage', icon: 'sym_s_save', to: { name : 'settings', params: { part: 'downloads' }  } },
  { title: 'Notifications', icon: 'sym_s_notifications', to: { name : 'settings', params: { part: 'notifications' }  } },
  { title: 'Privacy & location', icon: 'sym_s_lock', to: { name : 'settings', params: { part: 'privacy' }  } },
  { title: 'Paid memberships', icon: 'sym_s_remember_me', to: { name : 'settings', params: { part: 'memberships' }  } },
  { title: 'About YT Music', icon: 'sym_s_info', to: { name : 'settings', params: { part: 'about' } } }
];

</script>
<template>
  <div class="row q-py-md">
    <div style="margin-top:-6px">
      <q-btn @click="settingsBack" flat round icon="sym_s_arrow_back" size="md" class="q-mx-sm" />
    </div>
    <div class="col-grow text-h5 q-pa-none">Settings</div>
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
