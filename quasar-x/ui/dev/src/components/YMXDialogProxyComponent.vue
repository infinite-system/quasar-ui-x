<script setup>
import { watch } from "vue";

const props = defineProps(['dialog'])
const emit = defineEmits(['mount'])

watch(() => props.dialog, () => {
  emit('mount', props.dialog)
}, { immediate: true, deep: true })
</script>
<template></template>
