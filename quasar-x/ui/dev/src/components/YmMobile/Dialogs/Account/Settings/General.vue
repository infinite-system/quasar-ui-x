<script setup>
import { ref } from 'vue'

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  app: { default: () => ({}), type: Object },
  go: { default: () => () => {}, type: Function },
  settingsBack: { default: () => () => {}, type: Function },
})

defineEmits(['mount'])

const restrictedMode = ref(false)
const enableStats = ref(false)
</script>
<template>
  <div>
    <div class="row q-py-md">
      <div class="adjust-back-arrow">
        <q-btn @click="settingsBack" flat round icon="sym_s_arrow_back" size="md" class="q-mx-sm" />
      </div>
      <div class="col-grow text-h5 q-pa-none">General</div>
    </div>
    <q-item tag="div" v-ripple active-class="" clickable>
      <q-item-section class="q-pt-xs">
        <q-item-label>Show animated thumbnails</q-item-label>
        <q-item-label caption>Always</q-item-label>
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple active-class="" clickable>
      <q-item-section class="q-pt-xs">
        <q-item-label>Restricted mode</q-item-label>
        <q-item-label caption>Restricted mode hids songs and videos that may contain
          inappropriate content flagged by users and other signals.
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="restrictedMode" />
      </q-item-section>
    </q-item>

    <q-item tag="div" v-ripple active-class="" clickable>
      <q-item-section class="q-pt-xs">
        <q-item-label>Captions</q-item-label>
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple active-class="" clickable>
      <q-item-section class="q-pt-xs">
        <q-item-label>Enable stats for nerds</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="enableStats" />
      </q-item-section>
    </q-item>
  </div>
</template>
