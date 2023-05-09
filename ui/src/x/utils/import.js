import { defineAsyncComponent, defineComponent, h, markRaw } from "vue";
import { isFunction, isObject, isPromise, isString } from './is.js'
import { err } from './log.js'
import { toText } from "./strings";

// export function customAsyncComponent (component) {
//
//   return defineAsyncComponent({
//
//     loader: component,
//
//     loadingComponent: defineComponent({
//       setup () {
//         return () => h('div', { 'style': 'padding:20px;text-align:center;' }, 'Loading...')
//       }
//     }),
//
//     errorComponent: defineComponent({
//       setup () {
//         return () => h('div', `Error: Cannot find component ${toText(component)}`)
//       }
//     })
//   })
// }

// export function resolveImport (fn = dynamicImport) {
//   /**
//    * Return callback function.
//    * This is necessary to make dynamic imports work properly,
//    * if this is being used as a Quasar App Extension
//    */
//   return (component) => {
//
//     let c = component;
//
//     switch (typeof component) {
//       case 'function': // handle: () => import('...')
//         c = customAsyncComponent(component)
//         break;
//       case 'object':
//         c = isPromise(component)
//           ? customAsyncComponent(() => component) // handle import('../ComponentName...')
//           : component // direct import by component itself
//         break;
//       case 'string':
//         c = customAsyncComponent(fn(component))
//         break;
//     }
//
//     // markRaw to make component object non reactive
//     return markRaw(c);
//   }
// }

// export function setupImport () {
//   return resolveImport(dynamicImport)
// }

// export function dynamicImport (component) {
//   return () => import(`src/${component}.vue`)
// }

export function dynamicImporter (component) {
  return import(`src/${component}.vue`)
}

export async function asyncImport (component, asyncFn = dynamicImporter, timeout = 0) {

  let __import__, error, timer

  // console.log('asyncFn', asyncFn)
  const defaultable = isString(component) || isFunction(component) || isPromise(component)

  try {
    __import__ = (await (async () => new Promise((resolve, reject) => {

      if (timeout) {
        const timeoutSeconds = (timeout / 1000).toFixed(2)
        timer = setTimeout(() => reject(new Error(`Loading '${toText(component)}' failed. Runtime exceeded ${timeoutSeconds}s`)), timeout)
      }
      // handle: 'components/ComponentName'
      if (isString(component)) asyncFn(component).then(r => resolve(r)).catch(e => reject(e))
      // handle: () => import('...')
      if (isFunction(component)) component().then(r => resolve(r)).catch(e => reject(e))
      // handle: import('...')
      if (isPromise(component)) component.then(r => resolve(r)).catch(e => reject(e))
      // handle: ComponentName as default import/export
      if (isObject(component)) resolve(component)
    }))())

    clearTimeout(timer)

  } catch (e) {
    error = 'asyncImport() failed: ' + e
    err(error)
  }

  return new Promise((resolve, reject) => error
    ? reject(error)
    : resolve(markRaw(defaultable ? __import__.default : __import__))
  );
}

export function setupAsyncImport (asyncFn = dynamicImporter, timeout = 0) {
  return (component) => asyncImport(component, asyncFn, timeout)
}

// export function smartImport (component, fn = dynamicImport) {
//   return resolveImport(fn)(component)
// }
