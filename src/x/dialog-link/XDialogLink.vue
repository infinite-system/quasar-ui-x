<script>export default { name: 'XDialogLink' }</script>
<script setup>
import { useRoute, useRouter } from "vue-router";
import { RouterLink } from 'vue-router'
import { QBtn } from "quasar";
import { linkHandler } from "../dialog-link/XDialogLinkHelpers";

const props = defineProps({
  ...RouterLink.props,
  btn: { default: 'a', type: [String, QBtn] },
  dialog: { required: true, type: Object },
  linkFn: { default: () => linkHandler, type: [Function] },
  routerView: { default: 'default', type: String },
})

const router = useRouter()
const route = useRoute()

const onClick = (event, custom) => {
  props.linkFn(props.dialog, event, router, route, custom)
  // emit('x-dialog-link-click');{ href, route, navigate }
}
//log('props', props)
</script>
<template>
  <router-link v-bind="props" :custom="true" v-slot="{ href, isActive, isExactActive, route, navigate }">
    <component :is="btn" :href="href" v-bind="$attrs" :class="[
        'x-dialog-link',
        isExactActive ? 'x-dialog-link--exact-active' : '',
        isActive ? 'x-dialog-link--active' : ''
      ]"
         @click="onClick($event, { href, route, navigate })">
      <slot />
    </component>
  </router-link>
</template>
