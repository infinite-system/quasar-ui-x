<template>
  <div style="padding:20px;text-align:center;">
    Could not load component: '{{ component }}'.
    <br />
    {{ !pretty ? error : '' }}
  </div>
</template>
<script lang="ts">export default { name: 'XDialogError', inheritAttrs: false }</script>
<script setup lang="ts">
const props = defineProps(['component', 'error', 'dialog', 'pretty'])
</script>
