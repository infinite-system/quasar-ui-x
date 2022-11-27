import { defineComponent } from 'vue'
import { computed, ref, h } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'XLink',
  props: {
    ...RouterLink.props,
    class: String
  },
  setup (props, { slots, attrs }) {
    const isExternal = computed(() => {
      return typeof props.to === 'string' && props.to.startsWith('http')
    })
    const noopener = ref()
    return () => {
      if (isExternal.value) {
        return h('a', {
          ...attrs,
          target: '_blank',
          rel: noopener,
          class: 'external-link',
          href: props.to
        }, {
          default: () => slots.default ? slots.default() : undefined
        })
      } else {
        return h(RouterLink, {
          ...props,
          class: 'internal-link'
        }, {
          default: (ctx) => slots.default ? slots.default(ctx) : undefined
        })
      }
    }
  }
})