<script setup>
import { ref } from 'vue'

const dialog = ref('pluginDialog')
const show = ref(false)

function plugin (dialog, name) {

  dialog.update({
    class:''
  })

  dialog.onLoad({
    fn: () => alert('plugin onLoad event'),
    plugin: name
  })

  // return plugin interface
  return {
    pluginFunction1 () {
      alert('pluginFunction1')
    },
    pluginFunction2 () {
      alert('pluginFunction2')
    }
  }
}

function pluginUsage () {
  // using plugin interface
  const dg = dialog.value
  dg.$plugin.pluginFunction1()
  dg.$plugin.pluginFunction2()
}
</script>
<template>
  <q-page padding>

    <x-dialog
      ref="dialog"
      v-model="show"
      load="components/Simple"
      @ok="pluginUsage"
      :options="{title:'test component'}"
      :plugins="{plugin}">simple plugin test!</x-dialog>

  </q-page>
</template>
