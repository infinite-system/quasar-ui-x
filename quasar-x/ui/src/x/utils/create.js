import { createApp, createVNode, render } from "vue";

// @adopted from https://stackoverflow.com/questions/69488256/vue-3-append-component-to-the-dom-best-practice
export default function createComponent({ el, component, props, appContext }) {

  let app = createApp(component, props)

  Object.assign(app._context, appContext) // must use Object.assign on _context

  let mounted = app.mount(el)

  mounted.unmount__ = () => {
    // destroy app/component
    app?.unmount()
    app = undefined
  };

  return mounted
}

// @adopted from https://stackoverflow.com/questions/69488256/vue-3-append-component-to-the-dom-best-practice
// TODO: needs to be reworked, prefer
export function renderComponent({ el, component, props, appContext }) {

  let vnode = createVNode(component, props)
  vnode.appContext = { ...appContext }
  render(vnode, el)
  return {
    // destroy vnode
    __unmount() {
      render(null, el)
      vnode = undefined
    }
  }
}
