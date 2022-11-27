<script>export default { name: 'XLink' }</script>
<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  ...RouterLink.props,
  class: String
})

const isExternal = computed(() => {
  return typeof props.to === 'string' && props.to.startsWith('http')
})
// const attrs = useAttrs();
// console.log('xlinkprops', props, attrs)
</script>
<template>
  <a v-if="isExternal"
     target="_blank"
     rel="noopener"
     class="external-link"
     v-bind="$attrs"
     :href="to">
    <slot/>
  </a>
  <router-link v-else v-bind="$props" class="internal-link" v-slot="useLink">
    <slot v-bind="useLink"/>
  </router-link>
</template>
