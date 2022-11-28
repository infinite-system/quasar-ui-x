<script lang="ts">export default { name: 'XDialog', inheritAttrs: false }</script>
<script setup lang="ts">
import { ref, watch, computed, toRefs, defineProps, onBeforeUnmount, useSlots, isRef, h, markRaw, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QBtn, useQuasar } from 'quasar'
import { log, warn, mergeDeep, byId, onFrame, isFunction, isObject, sleep } from '../utils.js'
import {
  dialogId, remove, wrap, optionsFromString, setButtonDefaults,
  dialogFix_Android_Mobile_Browser_Maximized_Bottom_Navbar_Overflow
} from './XDialogHelpers.js';

import { propsXDialog } from "../types/x"
import { asyncImport, setupAsyncImport } from "../utils/import.js";

const p = defineProps(propsXDialog)

const emit = defineEmits([
  'update:modelValue', 'update:options', 'update:import', 'update:props',
  'show', 'hide', 'ok', 'cancel', 'go'
])

const { modelValue, options, import: component, props: componentProps, router } = toRefs(p)

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
const localComponent = ref(component.value)
const localComponentProps = ref(componentProps.value)

const emitName = router.value || ''

function namedEmit (event, ...args) {
  return emit((emitName !== '' ? emitName + ':' : '') + event, ...args)
}

const importComponent = ref(null)
const resolvedImport = shallowRef(null)


const id = p.id || 'XDialog_' + dialogId()

const defaultClass = computed(() => component.value ? 'x-dialog x-dialog-import' : 'x-dialog')
const defaultInnerClass = computed(() => component.value ? 'x-dialog__inner x-dialog__inner-import' : 'x-dialog__inner')

const defaults = {
  message: wrap(id),
  html: true,
  ok: true
}

const hasButton = computed(() => !!slots.default)
const hasTemplate = computed(() => !!slots.template)


function prepareOptions (defaults, options, initialLoad = true) {

  const btnDefaults = {
    ok: { name: '__ok__', flat: true },
    cancel: { name: '__cancel__', flat: true }
  }

  setButtonDefaults(defaults, options, btnDefaults)

  const dialogOptions = {}

  mergeDeep(dialogOptions, defaults, options)

  // log('dialog', id, 'dialogOptions ', dialogOptions, defaults, options)

  // smart wrap the div for component display
  // if we have message option then we display that message
  // not the component, if we set the message to null or undefined
  // then it goes back to the component definition and displays
  // the component
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


let isHiding = false
let isOpening = false
let isLoading = false
let preventDismissRedirect = false

const callbacks = {
  toggle: [],
  show: [],
  hide: [],
  options: [],
  import: [],
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
    isOpening = true
    isLoading = true
    setShow(true)
    return this
  },

  async showAsync ({ maxDuration = 1500, interval = 16.7 } = {}) {

    log('showAsync', 'maxDuration:', maxDuration, 'interval:', interval, 'xState().isOpening():', XDialog.xState().isOpening())
    // Important: XDialog.show() function call below MUST be inside this async function not outside of it
    XDialog.show()

    // delay execution if opening is still in progress
    let i = 0
    while (XDialog.xState().isOpening() && i * interval < maxDuration) {
      i++ && await sleep(interval)
    }

    log('showAsync', 'awaited:', i * interval)
  },

  onShow (setup) {
    setDisplayCallbacks('show', setup)
    return this
  },

  hide,

  async hideAsync ({ command = null, maxDuration = 1500, interval = 16.7 } = {}) {

    log('hideAsync', 'maxDuration:', maxDuration, 'interval:', interval, 'xState().isHiding():', XDialog.xState().isHiding())

    // Important: XDialog.hide() function call below MUST be inside this async function not outside of it
    XDialog.hide(command)

    // delay execution if hiding is still in progress
    let i = 0
    while (XDialog.xState().isHiding() && i * interval < maxDuration) {
      i++ && await sleep(interval)
    }

    log('hideAsync', 'awaited:', i * interval)
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

  options: (opts) => setOptionsThruRef(opts, { update: false }),

  onOptions (setup) {
    setDisplayCallbacks('options', setup)
    return this
  },

  update: (opts) => setOptionsThruRef(opts, { update: true }),

  import: setImport,

  async importAsync ({ component = null, maxDuration = 1500, interval = 16.7 } = {}) {

    log('importAsync', 'maxDuration:', maxDuration, 'interval:', interval, 'xState().isLoading():', XDialog.xState().isLoading())

    // Important: XDialog.import() function call below MUST be inside this async function not outside of it
    XDialog.import(component)

    // delay execution if loading is still in progress
    let i = 0
    while (XDialog.xState().isLoading() && i * interval < maxDuration) {
      i++ && await sleep(interval)
    }

    log('importAsync', 'awaited:', i * interval)
  },

  onImport (setup) {
    setDisplayCallbacks('import', setup)
    return this
  },

  props: setProps,

  onProps (setup) {
    setDisplayCallbacks('props', setup)
    return this
  },

  xId: () => id,
  xDialog: () => p,
  xOptions: () => options.value,
  xDom () {
    return {
      xWrap: () => byId(id)?.closest('.q-dialog'),
      xInner: () => byId(id)?.closest('.q-dialog__inner'),
      xBackdrop: () => byId(id)?.closest('.q-dialog').getElementsByClassName('q-dialog__backdrop')?.[0],
      xContent: () => byId(id)?.closest('.q-dialog-plugin'),
    }
  },
  xState () {
    return {
      isOpen,
      isOpening: () => {
        return isOpening
      },
      isHiding: () => {
        return isHiding
      },
      isLoading: () => {
        return isLoading
      }
    }
  },
  xImport: () => localComponent.value,
  xProps: () => localComponentProps.value
}

// handle route-link options in string form
// router can only set string form options, it cannot set objects
// so we convert those options from string into the object
const opts = optionsFromString(options.value) || options.value

let dialogOptions = prepareOptions(defaults, opts)

function isOpen () {
  return QDialog && byId(id)
}

function hide (command = '') {
  // check status of isHiding, do not hide
  // hide is already in progress
  if (command === 'isHiding') return isHiding;

  // prevent back button redirect on dismiss
  // this is used by XDialogLink
  if (command === 'preventDismissRedirect') {
    preventDismissRedirect = true
  }

  if (isOpen()) {
    isHiding = true
    // fire quasar original hide event
    // this will fire QDialog.onDismiss callback
    QDialog.hide()
  }

  return XDialog
}

function setImport (component) {
  isLoading = true
  emit('update:import', component)
  localComponent.value = component
  return XDialog
}

function setProps (props, config = { update: false }) {
  if (isRef(p.props)) {
    emit('update:props', config.update ? mergeDeep({}, p.props, props) : props)
  } else {
    localComponentProps.value = config.update
        ? mergeDeep(localComponentProps.value, props) : props
  }
  runDisplayCallbacks('props', config)
  return XDialog
}

const isMounted = ref(false)

function unmount () {
  isMounted.value = false
}

function runDisplayCallbacks (type, ...args) {
  callbacks[type].forEach(call => call.fn(...args))
}

function dismissRedirect () {
  if (router.value && !preventDismissRedirect && p.dismissConfig.enabled) {
    p.dismissConfig.fn(vueRouter, vueRoute)
  }
  preventDismissRedirect = false
}

async function setClasses (options) {

  if (XDialog.xState().isOpening()) await XDialog.showAsync()

  if (isOpen()) {
    let classes = defaultClass.value.split(' ');
    if ('class' in options) classes = [...classes, ...options.class.split(' ')]
    classes.forEach(klass => klass ? XDialog.xDom().xWrap().classList.add(klass) : '')
  }
}

function dismiss () {

  runDisplayCallbacks('hide')

  unmount()

  namedEmit('hide')

  setShow(false)

  dismissRedirect()

  isHiding = false
  isLoading = false
  isOpening = false
}

// Custom update function for XDialog

function setOptions (options, config = { update: false }) {
  // if there are saved options update
  if (!config.update) {
    dialogOptions = defaults
  }

  if (dialogOptions) {
    mergeDeep(dialogOptions, prepareOptions(dialogOptions, options, false))
  }

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
    runDisplayCallbacks('options', config)
  })

  // return the dialog instance itself
  return XDialog
}

function update (options) {
  return setOptionsThruRef(options, { update: true })
}

function setOptionsThruRef (opts, config) {
  if (isRef(p.options)) {
    // this is necessary to check if the props are refs
    // then we can forward the update to the v-model:options
    // to keep the two way binding working
    emit('update:options', mergeDeep({}, config.update ? p.options : {}, opts))
  } else {
    // or if the p.options are not reactive
    // we have to directly update the options then
    return setOptions(opts, config)
  }

  return XDialog;
}

function addPromptCallbacks (type, setup) {

  let options = { fn: () => {}, reset: false, payloadFn: null }

  if (isFunction(setup)) {
    options.fn = setup
  } else if (isObject(setup)) {
    Object.assign(options, setup)
    if (options.reset) callbacks[type] = []
  }

  callbacks[type].push(options);
}

function setDisplayCallbacks (type, setup) {

  let options = { fn: () => {}, reset: false }

  if (isFunction(setup)) {
    options.fn = setup
  } else if (isObject(setup)) {
    Object.assign(options, setup)
    if (options.reset) callbacks[type] = []
  }

  callbacks[type].push(options);
}

function mount () {
  // Remove dom that gets left behind
  // when we open and close dialog quickly
  remove(id)

  // Create QDialog
  QDialog = $q.dialog(dialogOptions)

  // Set the main dismiss event
  QDialog.onDismiss(dismiss)

  if (p.onToggle) setDisplayCallbacks('toggle', p.onToggle)
  if (p.onShow) setDisplayCallbacks('show', p.onShow)
  if (p.onHide) setDisplayCallbacks('hide', p.onHide)
  if (p.onOptions) setDisplayCallbacks('options', p.onOptions)
  if (p.onImport) setDisplayCallbacks('import', p.onImport)
  if (p.onProps) setDisplayCallbacks('props', p.onProps)

  if (p.onOk) addPromptCallbacks('ok', p.onOk)
  if (p.onCancel) addPromptCallbacks('cancel', p.onCancel)

  onFrame(() => { // onFrame is a MUST here
    isOpening = false

    dialogFix_Android_Mobile_Browser_Maximized_Bottom_Navbar_Overflow(id, dialogOptions)
    // Teleport will only work when isMounted = true
    isMounted.value = true
  })
}

function fullMount () {
  onFrame(() => { // onFrame is a MUST here
    setShow(true)
    setClasses(options.value)
    runDisplayCallbacks('show')
    namedEmit('show')
    setOkCancelCallbacks()
  })
}

function setShow (value) {
  localShow.value = value
  emit('update:modelValue', value)
}

function setOkCancelCallbacks () {
  if (dialogOptions?.ok || dialogOptions?.cancel) {
    setButtonEvents('ok')
    setButtonEvents('cancel')
  }
}

function setButtonEvents (type) {

  const dialogInner = XDialog.xDom().xInner()

  if (!dialogInner) {
    warn('**events', type, 'could not bet set', 'emitName:', emitName)
    warn('**events', 'dialogInner does not exist')
    return // do nothing
  }

  // find ok / cancel buttons
  const btns = dialogInner?.querySelectorAll('button[name="__' + type + '__"]')

  btns?.forEach(btn => {

    const btnEvents = btn.getEventListeners();

    // remove the listeners
    btnEvents.forEach(e => btn.removeEventListener(e.type, e.listener, e.useCapture))

    // add proper callbacks
    btn.addEventListener('click', (event) => okCancel(type, event), false)

    // re-add the listeners
    // btnEvents.forEach(e => btn.addEventListener(e.type, e.listener, e.args))
    // right now we do not re-add the original listeners but implement
    // our own callback logic and hide/dismiss the dialog
  })
}

function getPayload (element, payloadFn) {
  const payload = payloadFn(element)
  log('payload', payload)
  return payload
}

function okCancel (type, event = null) {

  let payload = {}
  let stopped = false

  for (let callback of callbacks[type]) {

    const payloadFn = isFunction(callback.payloadFn)
        ? callback.payloadFn
        : (p.payloadConfig.enabled ? p.payloadConfig.fn : () => {})

    log('payload', 'payloadFn', payloadFn, 'p.payloadConfig', p.payloadConfig)

    payload = getPayload(XDialog.xDom().xInner(), payloadFn)

    // handle return false to stop the event from going further
    if (callback.fn(payload, stopped) === false) {
      // prevent click event from propagating further
      // this will stop the closing of the dialog
      stopped = true
      if (event !== null) event.stopImmediatePropagation()
      break
    }
  }

  if (callbacks[type].length === 0) {

    log('payload', 'p.payloadConfig', p.payloadConfig)
    payload = getPayload(XDialog.xDom().xInner(), p.payloadConfig.enabled ? p.payloadConfig.fn : () => {})
  }
  // emit events up to parent
  namedEmit(type, payload, stopped)

  if (!stopped) {
    hide()
  }

  return { payload, stopped }
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

watch(isMounted, () => isMounted.value ? fullMount() : null);

// Smart watcher for managing 'modelValue' prop
// from parent and keeping it reactive.
watch(localShow, () => localShow.value ? mount() : hide(), { immediate: true })
watch(modelValue, () => localShow.value = modelValue.value, { immediate: true })

watch(options, () => isOpen()
        ? setOptions(options.value)
        : dialogOptions = prepareOptions(dialogOptions, options.value, false),
    { deep: true }
);

watch(component, () => localComponent.value = component.value, { immediate: true })

const validComponent = computed(() => notEmptyComponent(localComponent.value))

// Smart imported component watcher
watch([localComponent, localShow], (newA, prevA) => {
  // change component only if shown & changed to save on memory and rendering
  if (localShow.value && validComponent && componentChanged(newA, prevA)) {
    importComponent.value = localComponent.value
  }
}, { immediate: true });

const loading = shallowRef(null)
const loadingProps = shallowRef({})
const loadingError = ref(false)

const loader = {
  timer: null,
  show (component) {
    loadingProps.value = { dialog: XDialog, component: component, pretty: p.importConfig.pretty }
    this.timer = setTimeout(() => {
      loading.value = p.importConfig.loading
    }, p.importConfig.delay)
  },
  done () {
    isLoading = false
    clearTimeout(this.timer)
    loading.value = null
  },
  error (e) {
    isLoading = false
    clearTimeout(this.timer)
    loading.value = p.importConfig.error
    loadingProps.value.error = e
    loadingError.value = true
  }
}

const importFn = setupAsyncImport(p.importConfig.fn, p.importConfig.timeout)

watch(importComponent, async () => {

  if (importComponent.value) {

    try {

      console.log('import', 'component', importComponent.value, 'config', p.importConfig)

      loader.show(importComponent.value)

      resolvedImport.value = await importFn(importComponent.value)

      loader.done()

      onFrame(() => runDisplayCallbacks('import'), 50)

    } catch (e) {
      loader.error(e)
    }
  }
}, { immediate: true })

watch(componentProps, () => localComponentProps.value = componentProps.value, { deep: true });

defineExpose(XDialog)
</script>
<template>
  <component v-if="hasButton && button"
             :is="button"
             v-bind="buttonProps"
             @click="XDialog.toggle()">
    <slot :dialog="XDialog"/>
  </component>
  <Teleport v-if="isMounted && (validComponent || hasTemplate)" :to="'#'+id">
    <component v-if="validComponent && !loadingError"
               :is="resolvedImport"
               v-bind="localComponentProps"
               :dialog="XDialog"
    />
    <component v-if="loading" :is="loading" v-bind="loadingProps"/>
    <slot :dialog="XDialog" v-if="!validComponent" name="template"/>
  </Teleport>
</template>
<style lang="sass">
@import './XDialog.sass'
</style>
