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


export default function resolveImport(fn = dynamicImport) {
  /**
   * Return callback function.
   * This is necessary to make dynamic imports work properly,
   * if this is being used as a Quasar App Extension
   */
  return (component) => {

    let c = component;

    switch (typeof component) {
      case 'function': // handle: () => import('...')
        c = customAsyncComponent(component)
        break;
      case 'object':
        c = isPromise(component)
          ? customAsyncComponent(() => component) // handle import('../ComponentName...')
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

export function setupImport() {
  return resolveImport(dynamicImport)
}

export function dynamicImport(component) {
  return () => import(`src/${component}.vue`)
}

export async function asyncImporter(component){
  return import(`src/${component}.vue`)
}

export async function asyncImport(component) {
  let i, e
  try {
    i = markRaw((await asyncImporter(component)).default)
  } catch (err) {
    e = 'asyncImport failed: ' + err
  }
  return new Promise((resolve, reject) => e ? reject(e) : resolve(i));
}

export function smartImport(component, fn = dynamicImport) {
  return resolveImport(fn)(component)
}
