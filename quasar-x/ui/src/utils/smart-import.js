import { defineAsyncComponent, defineComponent, h, markRaw } from "vue";
import { isPromise } from './is.js'

export function customAsyncComponent(component) {
  return defineAsyncComponent({
    loader: component,

    loadingComponent: defineComponent({
      setup() {
        return () => h('div', { 'style': 'padding:20px' }, 'Loading...')
      }
    }),

    errorComponent: defineComponent({
      setup() {
        return () => h('div', 'Error: Cannot find component' + component)
      }
    })
  })
}

export default function smartImport(component) {

  let c = component;

  switch (typeof component) {
    case 'function': // it's an async () => import('...')
      c = customAsyncComponent(component)
      break;
    case 'object':
      c = isPromise(component)
        ? customAsyncComponent(() => component) // it's an import('../ComponentName...')
        : component // direct import by name ComponentName
      break;
    case 'string':
      c = customAsyncComponent(() => import(`@/${component}.vue`))
      break;
  }

  // markRaw to make component object non reactive
  return markRaw(c);
}

