<script setup>
import { onMounted, onBeforeUpdate, toRaw } from "vue";

const props = defineProps({
  dialog: { default: () => ({}), type: Object },
  routerViews: { default: () => ({}), type: Object }
})
const emit = defineEmits(['mount'])

const routerViews = toRaw(props.routerViews)
onMounted(() => emit('mount', props.dialog))
onBeforeUpdate(() => emit('mount', props.dialog))
</script>
<template>
  <router-view v-for="v in routerViews" v-bind="routerViews[v]"></router-view>
</template>
