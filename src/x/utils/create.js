import { createApp, createVNode, render, h, defineComponent } from "vue";
import XDialog from "../dialog/XDialog.vue";
import { extend } from "../utils.js";

// @adopted from https://stackoverflow.com/questions/69488256/vue-3-append-component-to-the-dom-best-practice
export default function createComponent ({ app, component, props, el }) {

  let expose = null

  let childApp = createApp({ render: () => expose = h(component, props) })

  Object.assign(childApp._context, app._context)

  childApp.mount(el)

  let exposed = expose.component.exposed

  exposed.__destroy__ = (callback) => {
    // unmount & destroy childApp
    callback()

    childApp?.unmount()
    childApp = undefined
  }

  // console.log({ exposed: exposed, expose: expose, childApp: childApp  })
  return exposed
}
//
// export default function createComponent ({ app, el, component, props, appContext }) {
//
//
//   const body = document.body;
//   let div = document.createElement("div");
//   body.appendChild(div);
//
//   // youCom 为自己写的组件,  SoltChild 可以是自己的子组件 ，也可以不传
//   let vm = createVNode(h(XDialog, props));
//
//   vm.appContext = app._context; // 这句很关键，关联起了上下文
//   console.log('vm', vm)
//   const mount = render(vm, div);
//   console.log('mount', vm.component.exposed)
//   return vm.component.exposed
// }

// @adopted from https://stackoverflow.com/questions/69488256/vue-3-append-component-to-the-dom-best-practice
// TODO: needs to be reworked, prefer
export function renderComponent ({ el, component, props, appContext }) {

  let vnode = createVNode(component, props)
  vnode.appContext = { ...appContext }
  render(vnode, el)
  return {
    // destroy vnode
    __unmount () {
      render(null, el)
      vnode = undefined
    }
  }
}
