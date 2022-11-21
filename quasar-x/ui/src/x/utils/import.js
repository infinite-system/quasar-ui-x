import { defineAsyncComponent, defineComponent, h, markRaw } from "vue";
import { isPromise } from './is.js'
import toText from "./to-text";

export function customAsyncComponent(component) {

  return defineAsyncComponent({

    loader: component,

    loadingComponent: defineComponent({
      setup() {
        return () => h('div', { 'style': 'padding:20px;text-align:center;' }, 'Loading...')
      }
    }),

    errorComponent: defineComponent({
      setup() {
        return () => h('div', `Error: Cannot find component ${toText(component)}`)
      }
    })
  })
}


export default function smartImport(fn = srcImport) {
  /**
   * Return callback function.
   * This is necessary to make dynamic imports work properly,
   * if this is being used as a Quasar App Extension
   */
  return (component) => {

    let c = component;

    switch (typeof component) {
      case 'function': // it's an async () => import('...')
        c = customAsyncComponent(component)
        break;
      case 'object':
        c = isPromise(component)
          ? customAsyncComponent(() => component) // it's an import('../ComponentName...')
          : component // direct import by component itself
        break;
      case 'string':
        c = customAsyncComponent(fn(component))
        break;
    }

    // markRaw to make component object non reactive
    return markRaw(c);
  }
}

export function srcImport(component) {
  return () => import(`src/${component}.vue`)
}

export function setupImport(fn = srcImport) {
  return smartImport(fn)
}

export function xImport(component, fn = srcImport) {
  return smartImport(fn)(component)
}
