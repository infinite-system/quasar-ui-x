<script setup>
defineProps(['dialog','prop1','prop2'])
</script>
<template>
  <div class="q-pa-md">
    <div>Simple Component</div>
    <div>prop1: {{prop1}} prop2:{{prop2}}</div>
    <div class="q-pa-lg-sm">
      <q-btn class="float-right" @click="dialog.ok()">Ok</q-btn>
    </div>
  </div>
</template>
