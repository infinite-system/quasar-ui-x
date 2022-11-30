<script lang="ts">export default { name: 'XDialog', inheritAttrs: false }</script>
<script setup lang="ts">
import { ref, watch, computed, toRefs, defineProps, onBeforeUnmount, useSlots, isRef, h, markRaw, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QBtn, useQuasar } from 'quasar'
import { log, warn, mergeDeep, byId, onFrame, isFunction, isObject, sleep, isArray } from '../utils.js'
import {
  dialogId, remove, wrap, parseOptions, setButtonDefaults,
  fix_Android_Mobile_Browser_Maximized_Bottom_Navbar_Overflow
} from './XDialogHelpers.js';

import { propsXDialog } from "../types/x"
import { setupAsyncImport } from "../utils/import.js";

const p = defineProps(propsXDialog)

const emit = defineEmits([
  'update:modelValue', 'update:options', 'update:load', 'update:props',
  'show', 'hide', 'ok', 'cancel'
])

const { modelValue, options, load: component, props: componentProps, router } = toRefs(p)

// onBeforeUnmount MUST always be before the watch functions
onBeforeUnmount(async () => {
  if (isOpen()) {
    /**
     * prevent rerouting on dismiss that fires when it determines
     * if it's moving back in history or has to move forward with push
     * @see function dialogRedirect
     */
    await XDialog.hideAsync({ command: 'preventDismissRedirect' })
    remove(id)
  }
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

const emitName = router.value || ''

function namedEmit (event, ...args) {
  return emit((emitName !== '' ? emitName + ':' : '') + event, ...args)
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

function prepareOptions (defaults, options) {

  const btnDefaults = {
    ok: { name: '__ok__', flat: true },
    cancel: { name: '__cancel__', flat: true }
  }

  setButtonDefaults(defaults, options, btnDefaults)

  let dialogOptions = {}

  dialogOptions = mergeDeep({}, defaults, options)

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

const isHiding = ref(false)
const isOpening = ref(false)
const isLoading = ref(false)
const isLoaded = ref(false)
const isMounted = ref(false)
const isFailed = ref(false)

const isCreated = ref(false)

let preventDismissRedirect = false

const callbacks = {
  create: [],
  toggle: [],
  show: [],
  hide: [],
  update: [],
  load: [],
  mount: [],
  props: [],
  ok: [],
  cancel: [],
}

const XDialog = {
  toggle () {
    const toggleValue = !localShow.value

    setShow(toggleValue)
    runDisplayCallbacks('toggle', toggleValue)
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

    this.show()

    // delay execution if opening is still in progress
    let i = 0
    while (this.xState().isOpening() && i * interval < maxDuration) {
      i++ && await sleep(interval)
    }

    log('showAsync', 'await', i * interval)
  },

  onShow (setup) {
    setDisplayCallbacks('show', setup)
    return this
  },

  hide,

  async hideAsync ({ command = null, maxDuration = 1500, interval = 16.7 } = {}) {

    this.hide(command)

    // delay execution if hiding is still in progress
    let i = 0
    while (this.xState().isHiding() && i * interval < maxDuration) {
      i++ && await sleep(interval)
    }

    log('hideAsync', 'await', i * interval)
  },

  onHide (setup) {
    setDisplayCallbacks('hide', setup)
    return this
  },

  ok (setup) {
    addPromptCallbacks('ok', setup)
    okCancel('ok');
    return this
  },

  onOk (setup) {
    addPromptCallbacks('ok', setup)
    return this
  },

  cancel (setup) {
    addPromptCallbacks('cancel', setup)
    okCancel('cancel');
    return this
  },

  onCancel (setup) {
    addPromptCallbacks('cancel', setup)
    return this
  },

  update: updateThruRef,

  onUpdate (setup) {
    setDisplayCallbacks('update', setup)
    return this
  },

  load,

  async loadAsync ({ component = null, maxDuration = 1500, interval = 16.7 } = {}) {

    this.load(component)

    // delay execution if loading is still in progress
    let i = 0
    while (this.xState().isLoading() && i * interval < maxDuration) {
      i++ && await sleep(interval)
    }

    log('loadAsync', 'await', i * interval)
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

  plugins (plugins) {
    setPlugins(plugins)
    return this
  },

  xId: () => id,
  xDialog: () => p,
  xOptions: () => localOptions.value,
  xLoad: () => resolvedImport.value,
  xProps: () => localComponentProps.value,
  xState () {
    return {
      isOpen,
      isOpening: () => isOpening.value,
      isHiding: () => isHiding.value,
      isLoading: () => isLoading.value,
      isLoaded: () => isLoaded.value,
      isMounted: () => isMounted.value,
      isFailed: () => isFailed.value
    }
  },
  xDOM () {
    return {
      xWrap: () => byId(id)?.closest('.q-dialog'),
      xInner: () => byId(id)?.closest('.q-dialog__inner'),
      xBackdrop: () => byId(id)?.closest('.q-dialog').getElementsByClassName('q-dialog__backdrop')?.[0],
      xContent: () => byId(id)?.closest('.q-dialog-plugin'),
    }
  },
  xClass () {
    return this.xOptions()?.class ? this.xOptions().class : ''
  },
}

// handle route-link options in string form
// router can only set string form options, it cannot set objects
// so we convert those options from string into the object
const opts = parseOptions(localOptions.value)

let dialogOptions = prepareOptions(defaults, opts)

function isOpen () {
  return !!(QDialog && byId(id))
}

function hide (command = '') {

  isOpening.value = false
  isLoading.value = false
  isLoaded.value = false
  isMounted.value = false
  isFailed.value = false

  // prevent back button redirect on dismiss
  // this is used by XDialogLink
  if (command === 'preventDismissRedirect') {
    preventDismissRedirect = true
  }

  if (isOpen()) {
    isHiding.value = true
    // fire quasar original hide event
    // this will fire QDialog.onDismiss callback
    QDialog.hide()
  }

  return XDialog
}

function load (component) {
  isLoading.value = true
  emit('update:load', component)
  localComponent.value = component
  return XDialog
}

function setProps (props, config = { update: false }) {

  localComponentProps.value = config.update ? mergeDeep(localComponentProps.value, props) : props

  if (isRef(p.props)) {
    emit('update:props', localComponentProps.value)
  }

  runDisplayCallbacks('props', config)

  return XDialog
}

function uncreate () {
  isCreated.value = false
}

function runDisplayCallbacks (type, ...args) {
  callbacks[type].forEach(call => call.fn(...args))
}

function dismissRedirect () {
  if (router.value && !preventDismissRedirect && p.dismissConfig.on) {
    p.dismissConfig.fn(vueRouter, vueRoute)
  }
  preventDismissRedirect = false
}

async function setClasses (options) {

  if (XDialog.xState().isOpening()) await XDialog.showAsync()

  if (isOpen()) {

    let classes = defaultClass.value.split(' ');
    if ('class' in options) classes = [...classes, ...options.class.split(' ')]

    classes.forEach(c => c ? XDialog.xDOM().xWrap().classList.add(c) : '')
  }
}

function dismiss () {

  runDisplayCallbacks('hide')

  uncreate()

  namedEmit('hide')

  setShow(false)

  dismissRedirect()

  isHiding.value = false
}

// Custom update function for XDialog

function update (options) {

  dialogOptions = prepareOptions(defaults, options)

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

  mergeDeep(localOptions.value, opts)

  if (isRef(p.options)) {
    // this is necessary to check if the props are refs
    // then we can forward the update to the v-model:options
    // to keep the two way binding working
    emit('update:options', localOptions.value)
  } else {
    // or if the p.options are not reactive
    // we have to directly update the options then
    return update(localOptions.value)
  }

  return XDialog;
}

function setPlugins (plugins) {
  for (const name in plugins) {
    const fn = plugins[name]
    if (isFunction(fn)) {
      fn(XDialog, name)
    } else {
      warn(`XDialog plugin '${name}' has to be a function`)
    }
  }
}

function resetCallbacks (type, reset) {

  const notBase = ({ plugin }) => plugin !== '__base__'
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

function addPromptCallbacks (type, setup) {

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

function __base__ (dialog, name) {

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
      log('dialog.xOptions()', dialog.xOptions())
      fix_Android_Mobile_Browser_Maximized_Bottom_Navbar_Overflow(dialog.xId(), dialog.xOptions())
      setOkCancelCallbacks()
    },
    plugin: name
  }).onLoad({
    fn: () => {
      setOkCancelCallbacks()
    },
    plugin: name
  })
}

function getPayload (payloadFn) {

  const payload = payloadFn(XDialog.xDOM().xInner())

  log('payload', payload)

  return payload
}

function okCancel (type, event = null) {

  let payload = {}
  let stopped = false

  const defaultPayloadFn = p.payloadConfig.on ? p.payloadConfig.fn : () => {}

  for (const callback of callbacks[type]) {

    const payloadFn = isFunction(callback.payloadFn)
      ? callback.payloadFn
      : defaultPayloadFn

    log('payload', 'payloadFn', payloadFn, 'payloadConfig', p.payloadConfig)

    payload = getPayload(payloadFn)

    // handle return false to stop the event from going further
    if (callback.fn(payload) === false) {
      // prevent click event from propagating further
      // this will stop the closing of the dialog
      stopped = true
      if (event !== null) event.stopImmediatePropagation()
      break
    }
  }

  // emit events up to parent
  namedEmit(type, payload, stopped)

  if (!stopped) hide()
}

function create () {

  isOpening.value = true
  isLoading.value = true

  isLoaded.value = false
  isMounted.value = false
  isFailed.value = false
  isHiding.value = false

  setShow(true)

  // Remove dom that gets left behind
  // when we open and close dialog quickly
  remove(id)

  // Create QDialog
  QDialog = $q.dialog(dialogOptions)

  // Set the main dismiss event
  QDialog.onDismiss(dismiss)

  // must be before callback definitions
  setPlugins({ __base__ })
  setPlugins(p.plugins)

  if (p.onCreate) setDisplayCallbacks('create', p.onCreate)

  runDisplayCallbacks('create', p.onCreate)

  if (p.onToggle) setDisplayCallbacks('toggle', p.onToggle)
  if (p.onShow) setDisplayCallbacks('show', p.onShow)
  if (p.onHide) setDisplayCallbacks('hide', p.onHide)
  if (p.onUpdate) setDisplayCallbacks('update', p.onUpdate)
  if (p.onProps) setDisplayCallbacks('props', p.onProps)
  if (p.onLoad) setDisplayCallbacks('load', p.onLoad)
  if (p.onMount) setDisplayCallbacks('mount', p.onMount)

  if (p.onOk) addPromptCallbacks('ok', p.onOk)
  if (p.onCancel) addPromptCallbacks('cancel', p.onCancel)

  onFrame(() => { // onFrame is a MUST here
    // Teleport will only work when isCreated = true
    isCreated.value = true
    isOpening.value = false

    setClasses(localOptions.value)

    runDisplayCallbacks('show')

    namedEmit('show')

    // if there is not component being loaded, loading is complete at this point
    if (!p.load) {

      isLoading.value = false
      isLoaded.value = true

      runDisplayCallbacks('load')
    }
  })
}

function setShow (show) {
  localShow.value = show
  emit('update:modelValue', show)
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

watch(options, () => localOptions.value = options.value, { immediate: true, deep: true })

watch(localOptions, () => {
    isOpen() || isOpening.value
      ? update(localOptions.value)
      : dialogOptions = prepareOptions(defaults, localOptions.value)
  }, { immediate: true, deep: true }
);

const validComponent = computed(() => notEmptyComponent(localComponent.value))

watch(component, () => localComponent.value = component.value, { immediate: true })

// Smart loaded component watcher
watch([localComponent, localShow], (newA, prevA) => {
  // change component only if shown & changed to save on memory and rendering
  if (localShow.value && validComponent && componentChanged(newA, prevA)) {
    loadComponent.value = localComponent.value
  }
}, { immediate: true });

const loading = shallowRef(null)
const loadingProps = shallowRef({})
const loadingError = ref(false)

const loader = {

  timer: null,

  show (component) {

    isLoading.value = true
    isMounted.value = false
    isFailed.value = false

    loadingProps.value = { dialog: XDialog, component: component, pretty: p.loadConfig.pretty }

    this.timer = setTimeout(() => {
      loading.value = p.loadConfig.loading
    }, p.loadConfig.delay)
  },

  done () {
    clearTimeout(this.timer)

    loading.value = null

    isLoading.value = false
    onFrame(() => {
      if (loadFile.value) {
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

    loading.value = p.loadConfig.error
    loadingProps.value.error = e

    loadingError.value = true
  }
}

const loadFn = setupAsyncImport(p.loadConfig.fn, p.loadConfig.timeout)

const loadFile = ref(null)
watch(loadComponent, async () => {

  if (loadComponent.value && !isHiding.value) {

    try {
      log('load', 'component', loadComponent.value, 'config', p.loadConfig)

      // this reassignment is necessary loadFile.value is used later in
      // watch(isHiding, ...) to cancel import if dialog is dismissed
      loadFile.value = loadComponent.value

      loader.show(loadComponent.value)

      resolvedImport.value = await loadFn(loadFile.value)

      loader.done()

    } catch (e) {
      loader.error(e)
    }
  }
}, { immediate: true })

watch(isHiding, () => isHiding.value ? loadFile.value = null : null);

watch(componentProps, () => localComponentProps.value = componentProps.value, { deep: true });

function emitMount (...args) {
  isMounted.value = true
  runDisplayCallbacks('mount', ...args)
}

defineExpose(XDialog)
</script>
<template>
  <component v-if="hasButton && button"
             :is="button"
             v-bind="buttonProps"
             @click="XDialog.toggle()">
    <slot :dialog="XDialog" />
  </component>
  <Teleport v-if="isCreated && (validComponent || hasTemplate)" :to="'#'+id">
    <component v-if="validComponent && !loadingError && resolvedImport"
               :is="resolvedImport"
               v-bind="localComponentProps"
               :dialog="XDialog"
               @mount="emitMount"
    />
    <component v-if="loading" :is="loading" v-bind="loadingProps" />
    <slot v-if="!validComponent" name="template" :dialog="XDialog" />
  </Teleport>
</template>
<style lang="sass">
@import './XDialog.sass'
</style>
