<script setup>
import { onUnmounted, ref } from "vue";

const dg = ref('dg')
let timeout1 = null
let timeout2 = null

function switchState(){

    timeout1 = setTimeout(() => {
      dg.value.load('components/Simple')
      timeout2 = setTimeout(() => {
        dg.value.load()
      }, 3000)
    }, 3000)

}
onUnmounted(() => {
  clearTimeout(timeout1)
  clearTimeout(timeout2)
})
</script>
<template>
  <q-page padding>

    <x-dialog
      ref="dg"
      :model-value="false"
      :options="{
        ok: false
      }"
      @show="switchState"
    >
      <template #default>Open</template>
      <template #template="{ dialog }">
          <div class="q-pa-md text-bold">This is a template</div>
          <div class="q-pa-md">
            This will change to component in 3 seconds.<br />
            And then back in another 3 seconds.
          </div>
          <div class="q-pa-md">
            <q-btn @click="switchState">Start Over</q-btn> <q-btn class="float-right" @click="dialog.ok()">Ok</q-btn>
          </div>
      </template>
    </x-dialog>

  </q-page>
</template>
