import { defineAsyncComponent, markRaw, createApp, createVNode, render, defineComponent, h } from "vue";

let x = {

  onFrame(callback) {
    window.requestAnimationFrame(() => window.requestAnimationFrame(callback))
  },

  prop(prop) {
    return (() => (prop))();
  },

  keepAlive(isAlive) {
    isAlive.value = false
    this.onFrame(() => isAlive.value = true)
  },

  isPromise(p) {
    return p !== null &&
      typeof p === 'object' &&
      typeof p.then === 'function' &&
      typeof p.catch === 'function';
  },

  customAsyncComponent(component) {
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
  },

  smartImport(component) {
    let c = component;
    console.log('typeof component', typeof component)
    switch (typeof component) {
      case 'function': // it's an async () => import('...')
        c = this.customAsyncComponent(component)
        break;
      case 'object':
        c = this.isPromise(component)
          ? this.customAsyncComponent(() => component) // it's an import('../ComponentName...')
          : component // direct import by name ComponentName
        break;
      case 'string':
        c = this.customAsyncComponent(() => import(`@/${component}.vue`))
        break;
    }
    console.log('c', typeof c, c, this.isPromise(c))
    // markRaw to make component object non reactive
    return markRaw(c);
  },

  isFunction(f) {
    return typeof f === 'function'
  },

  isEmpty(obj) {
    for (let i in obj) return false;
    return true;
  },

  createAppComponent({ el, component, props, appContext }) {

    let app = createApp(component, props)

    Object.assign(app._context, appContext) // must use Object.assign on _context

    let mounted = app.mount(el)

    mounted.__unmount__ = () => {
      // destroy app/component
      app?.unmount()
      app = undefined
    }
    console.log('app', app)
    return mounted
  },

  renderComponent({ el, component, props, appContext }) {

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
  },

  serialize(element, selectors = 'input,textarea,select,button') {

    element = typeof element === 'string' ? document.querySelector(element) : element

    if (!element) {
      x.warn(element, 'is not a valid element to x.serialize(); Returning empty object {}')
      return {};
    }

    let inputs = element.querySelectorAll(selectors);

    console.log('inputs', inputs)
    let i, j, q = {};
    for (i = inputs.length - 1; i >= 0; i = i - 1) {

      if (inputs[i].name === "") {
        continue
      }

      switch (inputs[i].nodeName) {
        case 'INPUT':
          switch (inputs[i].type) {
            case 'text':
            case 'hidden':
            case 'password':
            case 'button':
            case 'reset':
            case 'submit':
              q[inputs[i].name] = inputs[i].value
              break;
            case 'checkbox':
            case 'radio':
              if (inputs[i].checked) {
                // if (typeof q[inputs[i].name] !== 'undefined'){
                //   q[inputs[i].name] =
                // }
                q[inputs[i].name] = inputs[i].value
              }
              break;
            case 'file':
              break;
          }
          break;
        case 'TEXTAREA':
          q[inputs[i].name] = inputs[i].value
          break;
        case 'SELECT':
          switch (inputs[i].type) {
            case 'select-one':
              q[inputs[i].name] = inputs[i].value
              break;
            case 'select-multiple':
              for (j = inputs[i].options.length - 1; j >= 0; j = j - 1) {
                if (inputs[i].options[j].selected) {
                  q[inputs[i].name] = inputs[i].options[j].value
                }
              }
              break;
          }
          break;
        case 'BUTTON':
          switch (inputs[i].type) {
            case 'reset':
            case 'submit':
            case 'button':
              q[inputs[i].name] = inputs[i].value
              break;
          }
          break;
      }
    }
    return q;
  },

  serializeQuery(element) {
    element = typeof element === 'string' ? document.querySelector(element) : element

    if (!element) return [];

    let inputs = element.querySelectorAll('input,textarea,select,button');
    let i, j, q = [];
    for (i = inputs.length - 1; i >= 0; i = i - 1) {
      if (inputs[i].name === "") {
        continue;
      }
      switch (inputs[i].nodeName) {
        case 'INPUT':
          switch (inputs[i].type) {
            case 'text':
            case 'hidden':
            case 'password':
            case 'button':
            case 'reset':
            case 'submit':
              q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
              break;
            case 'checkbox':
            case 'radio':
              if (inputs[i].checked) {
                q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
              }
              break;
            case 'file':
              break;
          }
          break;
        case 'TEXTAREA':
          q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
          break;
        case 'SELECT':
          switch (inputs[i].type) {
            case 'select-one':
              q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
              break;
            case 'select-multiple':
              for (j = inputs[i].options.length - 1; j >= 0; j = j - 1) {
                if (inputs[i].options[j].selected) {
                  q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].options[j].value));
                }
              }
              break;
          }
          break;
        case 'BUTTON':
          switch (inputs[i].type) {
            case 'reset':
            case 'submit':
            case 'button':
              q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
              break;
          }
          break;
      }
    }
    return q.join("&");
  },

  __(o) {
    return JSON.parse(JSON.stringify(o))
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  log(...args) {
    return console.log(...args)
  },

  warn(...args) {
    return console.warn(...args)
  },

  info(...args) {
    return console.warn(...args)
  },

  byId(id) {
    return document.getElementById(id)
  },

  /**
   * Simple object check.
   * @param item
   * @returns {boolean}
   */
  isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  },

  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
  mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.mergeDeep(target, ...sources);
  },

  size(o) {
    return Object.keys(o).length;
  },

  toText(html) {
    let tmp = document.createElement("div")
    tmp.appendChild(document.createTextNode(html))
    return tmp.innerHTML;
  }
}

export default x
