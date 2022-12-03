<script lang="ts">export default { name: 'XDialog', inheritAttrs: false }</script>
<script setup lang="ts">
import { ref, watch, computed, toRefs, defineProps, onBeforeUnmount, useSlots, isRef, h, markRaw, shallowRef, isReactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QBtn, useQuasar } from 'quasar'
import { dbg, warn, mergeDeep, byId, onFrame, isFunction, isObject, sleep, isArray, err, prop } from '../utils.js'
import {
  dialogId, remove, wrap, parseOptions, setButtonDefaults,
  fix_Android_Mobile_Browser_Maximized_Bottom_Navbar_Overflow
} from './XDialogHelpers.js';

import { propsXDialog } from "../types/x"
import { setupAsyncImport } from "../utils/import.js";

const p = defineProps(propsXDialog)
const defaultConfig = propsXDialog.config.default();

let config = {}
if (p.config !== defaultConfig) {
  config = mergeDeep({}, defaultConfig, p.config)
} else {
  config = prop(p.config)
}

const emit = defineEmits([
  'update:modelValue', 'update:options', 'update:load', 'update:props',
  'create', 'toggle', 'show', 'hide', 'ok', 'cancel', 'load', 'props', 'update', 'mount', 'fail'
])

const { modelValue, options, load: component, props: componentProps, router } = toRefs(p)

const __XDIALOG_DEBUG__ = process.env.NODE_ENV === 'development' ? true : p.debug
const debugAll = true
let debug = {}
if (isArray(p.debug)) {
  p.debug.forEach(el => debug[el] = 1)
} else {
  debug = {
    'load': 1,
    'showAsync': 1,
    'hideAsync': 1,
    'nativePlugin': 0,
    'payload': 1
  }
}

function x (type, ...args) {
  if (!__XDIALOG_DEBUG__) return
  if (typeof debug[type] !== 'undefined' || debugAll) {
    dbg('XDialog', type, ...args)
  } else {
    warn(`XDialog debug: unknown debug type '${type}'`)
  }
}

async function destroy(){
  if (isVisible()) {
    /**
     * prevent rerouting on dismiss that fires when it determines
     * if it's moving back in history or has to move forward with push
     * @see function dialogRedirect
     */
    runDisplayCallbacks('destroy')
    XDialog.config({ dismiss: { redirect: { on: false } } })
    // alert('unmount')
    await XDialog.hideAsync()
    XDialog.config({ dismiss: { redirect: { on: true } } })
    remove(id)
  }
}
// onBeforeUnmount MUST always be before the watch functions
onBeforeUnmount(() => {
  destroy()
})

const vueRouter = useRouter()
const vueRoute = useRoute()

const $q = useQuasar()

const slots = useSlots()

// define local variables
const localShow = ref(modelValue.value)
const localOptions = ref(options.value)
const localComponent = shallowRef(component.value)
const localComponentProps = ref(componentProps.value)

const loadingComponent = shallowRef(null)
const loadingComponentProps = shallowRef({})
const loadingComponentError = ref(false)


const emitName = router.value || ''

function namedEmit (event, ...args) {
  if (config.router.emit) {
    emit((emitName !== '' ? `${emitName}:` : '') + event, ...args)
  }
}

const loadComponent = ref(null)
const resolvedImport = shallowRef(null)

const id = p.id || 'XDialog_' + dialogId()

const defaultClass = computed(() => component.value ? 'x-dialog x-dialog-load' : 'x-dialog')
const defaultInnerClass = computed(() => component.value ? 'x-dialog__inner x-dialog__inner-load' : 'x-dialog__inner')

const defaults = {
  message: wrap(id),
  html: true,
  ok: true
}

const hasButton = computed(() => !!slots.default)
const hasTemplate = computed(() => !!slots.template)

function prepareOptions (dialogOptions, defaults, options) {

  const btnDefaults = {
    ok: { name: '__ok__', flat: true },
    cancel: { name: '__cancel__', flat: true }
  }

  const btnOptions = setButtonDefaults(defaults, options, btnDefaults)

  function onlyUnique (value, index, self) {
    return self.indexOf(value) === index;
  }

  if ('class' in options) {
    let classes = options.class.split(' ')
    options.class = classes.filter(onlyUnique).join(' ');
  }

  // x('btnOptions',btnOptions)
  mergeDeep(dialogOptions, defaults, options, btnOptions)
  /**
   * smart wrap the div for component display within 'message' option
   */
  if (!('message' in options)
      || options?.message === undefined
      || options?.message === null
      || options?.message === '') {
    dialogOptions.message = wrap(id, '')
  } else {
    dialogOptions.message = options.message + wrap(id, '')
  }

  dialogOptions.class = defaultInnerClass.value + ' ' + ('class' in options ? options.class : '')
  dialogOptions.html = true

  return dialogOptions
}

let QDialog = null

const isCreated = ref(false)
const isShown = ref(false)
const isHiding = ref(false)
const isShowing = ref(false)
const isLoading = ref(false)
const isLoaded = ref(false)
const isMounted = ref(false)
const isFailed = ref(false)

let callbacks = []
const allPlugins = []

function initCallbacks () {
  callbacks = {
    // display callbacks
    create: [],
    toggle: [],
    show: [],
    hide: [],
    update: [],
    load: [],
    props: [],
    mount: [],
    fail: [],
    config: [],
    plugins: [],
    destroy: [],
    // prompt callbacks
    ok: [],
    cancel: [],
  }

  setPlugins({ nativePlugin })
  setPlugins(p.plugins)

  if (p.onCreate) setDisplayCallbacks('create', p.onCreate)
  if (p.onToggle) setDisplayCallbacks('toggle', p.onToggle)
  if (p.onShow) setDisplayCallbacks('show', p.onShow)
  if (p.onHide) setDisplayCallbacks('hide', p.onHide)
  if (p.onUpdate) setDisplayCallbacks('update', p.onUpdate)
  if (p.onProps) setDisplayCallbacks('props', p.onProps)
  if (p.onLoad) setDisplayCallbacks('load', p.onLoad)
  if (p.onMount) setDisplayCallbacks('mount', p.onMount)
  if (p.onFail) setDisplayCallbacks('fail', p.onFail)
  if (p.onPlugins) setDisplayCallbacks('plugins', p.onPlugins)
  if (p.onConfig) setDisplayCallbacks('config', p.onConfig)
  if (p.onDestroy) setDisplayCallbacks('destroy', p.onDestroy)

  if (p.onOk) setPromptCallbacks('ok', p.onOk)
  if (p.onCancel) setPromptCallbacks('cancel', p.onCancel)
}


const XDialog = {

  onCreate (setup) {
    setDisplayCallbacks('create', setup)
    return this
  },

  toggle () {
    const toggle = !localShow.value
    setShow(toggle)
    runDisplayCallbacks('toggle', { toggle })
    return this
  },

  onToggle (setup) {
    setDisplayCallbacks('toggle', setup)
    return this
  },

  show () {
    setShow(true)
    return this
  },

  async showAsync ({ maxDuration = 1500, interval = 16.7 } = {}) {

    if (!isShowing.value && !isShown.value) {
      setShow(true)
    }

    // delay execution if opening is still in progress
    let i = 0
    while (isShowing.value && i * interval < maxDuration) {
      i++ && await sleep(interval)
    }

    x('showAsync', 'await', parseInt(i * interval))
  },

  onShow (setup) {
    setDisplayCallbacks('show', setup)
    return this
  },

  hide,

  async hideAsync ({ maxDuration = 1500, interval = 16.7 } = {}) {

    this.hide()

    // delay execution if hiding is still in progress
    let i = 0
    while (isHiding.value && i * interval < maxDuration) {
      i++ && await sleep(interval)
    }

    x('hideAsync', 'await', parseInt(i * interval))
  },

  onHide (setup) {
    setDisplayCallbacks('hide', setup)
    return this
  },

  ok (setup) {
    setPromptCallbacks('ok', setup)
    okCancel('ok');
    return this
  },

  onOk (setup) {
    setPromptCallbacks('ok', setup)
    return this
  },

  cancel (setup) {
    setPromptCallbacks('cancel', setup)
    okCancel('cancel');
    return this
  },

  onCancel (setup) {
    setPromptCallbacks('cancel', setup)
    return this
  },

  update: updateThruRef,

  onUpdate (setup) {
    setDisplayCallbacks('update', setup)
    return this
  },

  load,

  async loadAsync (component, { maxDuration = 1500, interval = 16.7 } = {}) {

    this.load(component)

    // delay execution if loading is still in progress
    let i = 0
    while (isLoading.value && i * interval < maxDuration) {
      i++ && await sleep(interval)
    }

    x('loadAsync', 'await', i * interval)
  },

  onLoad (setup) {
    setDisplayCallbacks('load', setup)
    return this
  },

  onMount (setup) {
    setDisplayCallbacks('mount', setup)
    return this
  },

  props: setProps,

  onProps (setup) {
    setDisplayCallbacks('props', setup)
    return this
  },

  plugins: setPlugins,

  onPlugins (setup) {
    runDisplayCallbacks('plugins')
    return this
  },

  config: setConfig,

  onConfig (setup) {
    runDisplayCallbacks('config')
    return this
  },

  destroy,

  onDestroy (setup) {
    runDisplayCallbacks('destroy')
    return this
  },

  xId: () => id,
  xDialog: () => p,
  xOptions: () => localOptions.value,
  xLoad: () => resolvedImport.value,
  xProps: () => localComponentProps.value,
  xState () {
    return {
      isShowing: () => isShowing.value,
      isShown: () => isShown.value,
      isHiding: () => isHiding.value,
      isLoading: () => isLoading.value,
      isLoaded: () => isLoaded.value,
      isMounted: () => isMounted.value,
      isFailed: () => isFailed.value
    }
  },
  xDOM () {
    return {
      xComponent: () => byId(id)?.closest('[data-v-app]'),
      xWrap: () => byId(id)?.closest('.q-dialog'),
      xInner: () => byId(id)?.closest('.q-dialog__inner'),
      xBackdrop: () => byId(id)?.closest('.q-dialog').getElementsByClassName('q-dialog__backdrop')?.[0],
      xContent: () => byId(id)?.closest('.q-dialog-plugin'),
    }
  },
  xClass () {
    return this.xOptions()?.class ? this.xOptions().class : ''
  },
  xPlugins: () => allPlugins,
  xConfig: () => config
}
const callbackParams = { dialog: XDialog, router: vueRouter, route: vueRoute }
initCallbacks()
// handle route-link options in string form
// router can only set string form options, it cannot set objects
// so we convert those options from string into the object
const opts = parseOptions(localOptions.value)

let dialogOptions = prepareOptions({}, defaults, opts)

function isVisible () {
  return !!(QDialog && byId(id))
}

function hide (command = '') {

  if (isVisible()) {

    setShow(false)

    isHiding.value = true
    // fire quasar original hide event
    // this will fire QDialog.onDismiss callback
    QDialog.hide()
  }

  return XDialog
}

function load (component) {

  isLoading.value = true

  x('load', { 'p.load': p.load, 'isRef': isRef(p.load), component: component })

  emit('update:load', component)

  localComponent.value = component
  return XDialog
}

function setProps (props, config = { update: false }) {

  localComponentProps.value = config.update ? mergeDeep(localComponentProps.value, props) : props

  x('setProps', { 'p.props': p.props, isRef: isRef(p.props) })

  if (isRef(p.props)) {
    emit('update:props', localComponentProps.value)
  }

  runDisplayCallbacks('props', config)

  return XDialog
}

function uncreate () {
  isCreated.value = false

  isShowing.value = false
  isShown.value = false

  isLoading.value = false
  isLoaded.value = false

  isMounted.value = false
  isFailed.value = false
}

function runDisplayCallbacks (type, extra = {}, ...args) {
  callbacks[type].forEach(call => call.fn({ ...callbackParams, ...extra }, ...args))
  // namedEmit(type, ...args)
}

function dismissRedirect () {
  if (router.value && config.dismiss.redirect.on) {
    config.dismiss.redirect.fn(vueRouter, vueRoute)
  }
}

async function setClasses (options) {

  if (isShowing.value) await XDialog.showAsync({ justAwait: true })

  if (isShown.value) {

    let classes = defaultClass.value.split(' ');
    if ('class' in options) classes = [...classes, ...options.class.split(' ')]

    classes.forEach(c => c ? XDialog.xDOM().xWrap().classList.add(c) : '')
  }
}

function dismiss () {

  runDisplayCallbacks('hide')

  uncreate()

  setShow(false)

  dismissRedirect()

  isHiding.value = false
}

// Custom update function for XDialog

function update (options) {


  x('update', options)
  prepareOptions(dialogOptions, defaults, options)

  setClasses(options)

  // save the DOM state of the dialog
  let content = ''
  onFrame(() => { // onFrame is a MUST here
    content = byId(id)
    // we need to wait for the content to render first
    // update the options
    QDialog.update(dialogOptions)
  })

  // restore the DOM state of the dialog
  // onFrame is a MUST here
  onFrame(() => {
    byId(id)?.replaceWith(content)
    runDisplayCallbacks('update')
  })

  // return the dialog instance itself
  return XDialog
}

function updateThruRef (opts) {

  console.group('updateThruRef')
  x('', { 'p.options': p.options, 'p.modelValue': p.modelValue })

  mergeDeep(localOptions.value, opts)

  if (isRef(p.options)) {
    x('', { isRef: true, newOpts: { ...localOptions.value, ...opts } })
    // this is necessary to check if the props are refs
    // then we can forward the update to the v-model:options
    // to keep the two way binding working
    emit('update:options', localOptions.value)
  }
  x('', { localOptions: localOptions.value })
  console.groupEnd()
  return XDialog;
}

function setConfig (cfg) {
  config = mergeDeep(config, cfg)
  runDisplayCallbacks('config', { config })
  return XDialog
}

function setPlugins (plugins) {
  for (const name in plugins) {
    const fn = plugins[name]
    allPlugins.push(name)
    if (isFunction(fn)) {
      const pluginExpose = fn(XDialog, name)
      if (isObject(pluginExpose) || isFunction(pluginExpose)) {
        XDialog[`$${name}`] = pluginExpose
      }
    } else {
      warn(`XDialog plugin '${name}' has to be a function`)
    }
  }
  runDisplayCallbacks('plugins')
  return XDialog
}

function resetCallbacks (type, reset) {

  const notBase = ({ plugin }) => plugin !== 'nativePlugin'
  const notUser = ({ plugin }) => plugin !== false

  switch (true) {
    case reset === 'all':
      callbacks[type] = callbacks[type].filter(({ plugin }) => notBase(plugin))
      break;
    case reset === true:
      callbacks[type] = callbacks[type].filter(({ plugin }) => notBase(plugin) && notUser(plugin))
      break;
    case isArray(reset):
      callbacks[type] = callbacks[type].filter(setup => !reset.includes(setup.plugin))
      break;
  }
}

function setPromptCallbacks (type, setup) {

  let options = { fn: () => {}, reset: false, payloadFn: null, plugin: false }

  if (isFunction(setup)) {
    options.fn = setup
  } else if (isObject(setup)) {
    Object.assign(options, setup)
    if (options.reset) resetCallbacks(type, options.reset)
  }

  callbacks[type].push(options);
}

function setDisplayCallbacks (type, setup) {

  let options = { fn: () => {}, reset: false, plugin: false }

  if (isFunction(setup)) {
    options.fn = setup
  } else if (isObject(setup)) {
    Object.assign(options, setup)
    if (options.reset) resetCallbacks(type, options.reset)
  }

  callbacks[type].push(options);
}

function nativePlugin (dialog, name) {

  function setOkCancelCallbacks () {
    setButtonEvents('ok')
    setButtonEvents('cancel')
  }

  function setButtonEvents (type) {

    const dialogInner = dialog.xDOM().xInner()

    if (!dialogInner) {
      warn('Could not find XDialog.xDOM().xInner() to setButtonEvents')
      return
    }
    // find ok / cancel buttons
    const btns = dialogInner.querySelectorAll('button[name="__' + type + '__"]')

    btns.forEach(btn => {
      const btnEvents = btn.getEventListeners();
      // remove the default listeners
      btnEvents.forEach(e => btn.removeEventListener(e.type, e.listener, e.useCapture))
      // add proper callbacks
      btn.addEventListener('click', (event) => okCancel(type, event), false)
    })
  }

  dialog.onShow({
    fn: () => {
      // x('nativePlugin', 'onShow()', { xOptions: dialog.xOptions() })
      XDialog.xDOM().xComponent().setAttribute('x-type', 'XDialog')
      XDialog.xDOM().xComponent().setAttribute('id', `${id}_component`)
      XDialog.xDOM().xComponent().$XDialog = XDialog
      fix_Android_Mobile_Browser_Maximized_Bottom_Navbar_Overflow(dialog.xId(), dialog.xOptions())
      setOkCancelCallbacks()
    },
    plugin: name
  }).onLoad({
    fn: () => {
      x('nativePlugin', 'onLoad()')
      setOkCancelCallbacks()
    },
    plugin: name
  })
}

function getPayload (payloadFn) {

  const payload = payloadFn(XDialog.xDOM().xInner())

  x('payload', payload)

  return payload
}

function okCancel (type, event = null) {

  let payload = {}
  let stopped = false

  const defaultPayloadFn = config.payload.on ? config.payload.fn : () => {}

  for (const callback of callbacks[type]) {

    const payloadFn = isFunction(callback.payloadFn)
        ? callback.payloadFn
        : defaultPayloadFn

    x('payload', { payloadFn: payloadFn, 'config.payload': config.payload })

    payload = getPayload(payloadFn)

    // handle return false to stop the event from going further
    if (callback.fn({ ...callbackParams, payload }) === false) {
      // prevent click event from propagating further
      // this will stop the closing of the dialog
      stopped = true
      if (event !== null) event.stopImmediatePropagation()
      break
    }
  }

  // emit events up to parent
  namedEmit(type, payload, stopped)

  if (!stopped) setShow(false)
}

function create () {

  isCreated.value = false

  isShowing.value = true
  isShown.value = false

  isLoading.value = true
  isLoaded.value = false

  isMounted.value = false
  isFailed.value = false
  isHiding.value = false

  // Remove dom that gets left behind
  // when we open and close dialog quickly
  remove(id)

  // Create QDialog
  QDialog = $q.dialog(dialogOptions)


  // Set the main dismiss event
  QDialog.onDismiss(dismiss)

  // must be before callback definitions


  isCreated.value = true
  runDisplayCallbacks('create')

  onFrame(() => { // onFrame is a MUST here

    isShowing.value = false
    isShown.value = true

    setClasses(localOptions.value)

    runDisplayCallbacks('show')

    // if there is not component being loaded, loading is complete at this point
    if (!p.load) {

      isLoading.value = false
      isLoaded.value = true

      runDisplayCallbacks('load')
    }
  })
}

x('modelValue', isRef(prop(p.modelValue)))

function setShow (show) {
  x('setShow', show)
  emit('update:modelValue', show)
  localShow.value = show
}

function notEmptyComponent (c) {
  return c !== false && c !== null && c !== undefined && c !== ''
}

function componentChanged (newA, prevA) {
  /**
   * important! this helps resolve differences in filenames of () => imports()
   * note both [localComponent, localShow] are necessary for
   * the correct operation of the next line:
   */
  return newA?.toString() !== prevA?.toString()
}

// Smart watcher for managing 'modelValue' prop
// from parent and keeping it reactive.
watch(modelValue, () => localShow.value = modelValue.value, { immediate: true })
watch(localShow, () => localShow.value ? create() : hide(), { immediate: true })

watch(options, () => {
  localOptions.value = options.value
  // x('watch.options', { options: options.value})
}, { immediate: true, deep: true })

watch(localOptions, () => {
      isShown.value || isShowing.value
          ? update(localOptions.value)
          : prepareOptions(dialogOptions, defaults, localOptions.value)
    }, { immediate: true, deep: true }
);

const validComponent = computed(() => notEmptyComponent(localComponent.value))

watch(component, () => localComponent.value = component.value, { immediate: true })

const loadFile = ref(null)
// Smart loaded component watcher
watch([localComponent, localShow], (newA, prevA) => {
  // change component only if shown & changed to save on memory and rendering
  if (localShow.value && validComponent && componentChanged(newA, prevA)) {
    loadComponent.value = localComponent.value
  }
}, { immediate: true });


const loading = {

  timer: null,

  init (component) {
    // this line is necessary, even though it seems
    // like it's not, clears stuck loaders
    clearTimeout(this.timer)

    isLoading.value = true
    isMounted.value = false
    isFailed.value = false

    loadingComponentProps.value = {
      dialog: XDialog,
      component: component,
      pretty: config.load.pretty
    }

    this.timer = setTimeout(() => {
      loadingComponent.value = config.load.loading
    }, config.load.delay)
  },

  done () {
    clearTimeout(this.timer)

    loadingComponent.value = null

    onFrame(() => {
      if (loadFile.value) {
        isLoading.value = false
        isLoaded.value = true
        isFailed.value = false
        runDisplayCallbacks('load')
      }
    }, 50)
  },

  error (e) {
    clearTimeout(this.timer)

    isLoading.value = false
    isLoaded.value = true
    isFailed.value = true

    loadingComponent.value = config.load.error
    loadingComponentProps.value.error = e

    loadingComponentError.value = true

    runDisplayCallbacks('fail')
  }
}

const loadFn = setupAsyncImport(config.load.fn, config.load.timeout)

watch([loadComponent, localShow], async () => {

  if (loadComponent.value && localShow.value) {

    try {
      x('load', { component: loadComponent.value, 'p.load': p.load, config: config.load })

      // this reassignment is necessary loadFile.value is used later in
      // watch(isHiding, ...) to cancel import if dialog is dismissed
      loadFile.value = loadComponent.value

      loading.init(loadComponent.value)

      resolvedImport.value = await loadFn(loadFile.value)

      loading.done()

    } catch (e) {
      loading.error(e)
    }
  }
}, { immediate: true })

watch(isHiding, () => {
  // prevents it from emitting onLoad events
  // when ok / cancel / dismiss
  // is pressed before the component is loaded
  if (isHiding.value) loadFile.value = null
});

watch(componentProps, () => localComponentProps.value = componentProps.value, { deep: true });

function emitMount (...args) {
  isMounted.value = true
  runDisplayCallbacks('mount', {}, ...args)
}

defineExpose(XDialog)
</script>
<template>
  <component v-if="hasButton && btn"
             :is="btn"
             v-bind="btnProps"
             @click="XDialog.toggle()">
    <slot :dialog="XDialog" />
  </component>
  <Teleport v-if="isShown && (validComponent || hasTemplate)" :to="'#'+id">
    <component v-if="(isLoaded || isLoading) && validComponent && !loadingComponentError && resolvedImport"
               :is="resolvedImport"
               v-bind="localComponentProps"
               :dialog="XDialog"
               @mount="emitMount"
    />
    <component v-if="loadingComponent" :is="loadingComponent" v-bind="loadingComponentProps" />
    <slot v-if="!validComponent" name="template" :dialog="XDialog" />
  </Teleport>
</template>
<style lang="sass">
@import './XDialog.sass'
</style>
