<script>export default { name: 'XLink' }</script>
<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { QBtn } from "quasar";
import { linkFn } from "../link/XLinkHelpers";

const props = defineProps({
  ...RouterLink.props,
  btn: { default: 'a', type: [String, Object] },
  fn: { default: () => linkFn, type: [Function] }
})

const isExternal = computed(() => {
  return typeof props.to === 'string' && props.to.startsWith('http')
})

const onClick = (event, custom) => {
  props.fn(event, custom)
}
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
  <router-link v-else v-bind="$props" class="internal-link" :custom="true" v-slot="{ href, isActive, isExactActive, route, navigate }">
    <component :is="btn" :href="href" v-bind="$attrs" :class="[
        'x-link',
        isExactActive ? 'x-link--exact-active' : '',
        isActive ? 'x-link--active' : ''
      ]"
         @click="onClick($event, { href, route, navigate })">
      <slot />
    </component>
  </router-link>
</template>
