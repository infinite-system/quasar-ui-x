<script setup>
import { ref } from "vue";

const dg = ref('dg')

function onLoad() {
  const dialog = dg.value
  setTimeout(() => {
    dialog.props({
      prop1: 'Prop1ValueChanged',
      prop2: 'Prop2ValueChanged'
    })
  }, 3000)
}
</script>
<template>
  <q-page padding>

    <x-dialog
      ref="dg"
      :model-value="false"
      :options="{
        title:'Component loaded below',
        message:'<div style=\'padding:3px 15px\'>Props will change in 3 seconds</div>',
        ok: false
      }"
      :load="() => import('src/components/SimpleProps.vue')"
      :props="{prop1:'Prop1Value',prop2:'Prop2Value'}"
      @load="onLoad"
    >Open</x-dialog>

  </q-page>
</template>
