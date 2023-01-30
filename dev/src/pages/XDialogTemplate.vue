<script setup>
import { onMounted, ref } from "vue";

const dg = ref('dg')
onMounted(() => {
  dg.value.onOk(() => {
    alert('ok')
  })
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
    >
      <template #default>Open</template>
      <template #template="{ dialog }">
          <div class="q-pa-md text-bold">Hello</div>
          <div class="q-pa-md">
            Message body
          </div>
          <q-btn @click="dialog.ok()">Ok</q-btn>
      </template>
    </x-dialog>

  </q-page>
</template>
