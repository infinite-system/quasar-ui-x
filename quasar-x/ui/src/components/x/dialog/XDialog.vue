<script>
export default {
  name: 'XDialog',
  inheritAttrs: false
}
</script>
<script setup>
import { ref, watch, computed, toRefs, onBeforeUnmount, useSlots, isRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { QBtn, useQuasar } from 'quasar'
import { keepAlive, warn, mergeDeep, log, byId, size, onFrame, extractData, isPromise } from '../../../utils.js'
import {
  dialogId, dialogRemove, dialogWrap, dialogOptionsFromString, dialogRouter,
  dialogRedirect, dialogEmit, dialogHideAsync, dialogSetButtonDefaults,
  dialogFix_Android_Mobile_Browser_Maximized_Bottom_Navbar_Overflow
} from "./XDialogHelpers";
import { defineAsyncComponent, defineComponent, h, markRaw } from "vue";

 function customAsyncComponent(component) {
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

 function smartImport(component) {

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
      c = customAsyncComponent(() => import(`../${component}.vue`))
      break;
  }

  // markRaw to make component object non reactive
  return markRaw(c);
}


const $q = useQuasar()

const vueRouter = useRouter()
const vueRoute = useRoute()

const slots = useSlots()

const props = defineProps({
  id: { default: '', type: String },
  modelValue: { default: true, type: Boolean },
  options: { default: () => ({}), type: [Object, String] },
  component: { default: undefined, type: [Boolean, String, Object, Function] },
  componentProps: { default: () => ({}), type: Object },
  button: { default: QBtn, type: [String, Object] },
  buttonAttrs: { default: () => ({}), type: Object },
  router: { default: false, type: [Boolean, String, Object] }
})

const { modelValue, options, component, componentProps, router } = toRefs(props)

const localShow = ref(modelValue.value)
const localComponent = ref(component.value)
const localComponentProps = ref(componentProps.value)

const { emitName, redirectFunction } = dialogRouter(router.value, dialogRedirect)

const emit = defineEmits([
  // built in two way binding v-models:
  'update:modelValue', 'update:options', 'update:component', 'update:componentProps',
  // emitable events that a parent can catch:
  'show', 'hide', 'ok', 'cancel', 'go'
])

function namedEmit(event, ...args) { return dialogEmit(emit, emitName, event, ...args)}

const importComponent = ref('')

// vue router-view refresh helpers
const isAlive = ref(true)
const live = () => keepAlive(isAlive)

const id = props.id || 'XDialog_' + dialogId()

let defaults = {
  class: component.value ? 'nopadding' : '',
  message: dialogWrap(id),
  html: true,
  ok: true
}

const hasButton = computed(() => !!slots.default)
const hasTemplate = computed(() => !!slots.template)

function prepareOptions(defaults, options, initialLoad = true) {

  let btnDefaults = {
    ok: { name: '__ok__', flat: true },
    cancel: { name: '__cancel__', flat: true }
  }

  dialogSetButtonDefaults(defaults, options, btnDefaults)

  if ('component' in options) {
    if (initialLoad) {
      warn("XDialog warning: trying to set 'component' through options, 'component' should be set through XDialog props. " +
        "'component' can be updated through dialog.update() function, but cannot be set as options on intial load.")
    } else {
      // only updates change component
      setComponent(options.component)
    }
  }

  if ('componentProps' in options) {
    if (initialLoad) {
      warn("XDialog warning: trying to set 'componentProps' through options, 'componentProps' should be set through props. " +
        "'componentProps' can be updated through dialog.update() function, but cannot be set as options on intial load.")
    } else {
      // only updates change component props
      setComponentProps(options.componentProps)
    }
  }

  let dialogOptions = {}
  mergeDeep(dialogOptions, defaults, options)

  log('dialog', id, 'dialogOptions ', dialogOptions, defaults, options)

  // smart wrap the div for component display
  // if we have message option then we display that message
  // not the component, if we set the message to null or undefined
  // then it goes back to the component definition and displays
  // the component
  if (!('message' in options)
    || options?.message === undefined
    || options?.message === null
    || options?.message === '') {
    dialogOptions.message = dialogWrap(id, '')
  } else {
    dialogOptions.message = options.message + dialogWrap(id, '')
  }

  // remove 'component' from dialogOptions
  if ('component' in dialogOptions) {
    delete dialogOptions.component
  }

  // remove 'componentProps' from dialogOptions
  if ('componentProps' in dialogOptions) {
    delete dialogOptions.componentProps
  }

  dialogOptions.html = true

  return dialogOptions
}

let qDialog = null

// handle route-link options in string form
// router can only set string form options, it cannot set objects
// so we convert those options from string into the object
let opts = dialogOptionsFromString(options.value) || options.value

let dialogOptions = prepareOptions(defaults, opts)

let isHiding = false
let preventDismissRedirect = false

let callbacks = {
  show: [],
  hide: [],
  ok: [],
  cancel: [],
}

const xDialog = {
  ok,
  cancel,
  show,
  hide,
  toggle,
  go,

  // history: '',
  // next: '',
  // back: '',
  // toStart: '',
  // toEnd: '',

  onShow(callback) {
    callbacks.show.push(callback)
    return this
  },
  onHide(callback) {
    callbacks.hide.push(callback)
    return this
  },
  onOk(callback) {
    callbacks.ok.push(callback)
    return this
  },
  onCancel(callback) {
    callbacks.cancel.push(callback)
    return this
  },
  update: (opts) => updateThroughRef(opts),
  getId: () => id,
  getQDialog: () => qDialog,
  getQOptions: () => options.value,
  getProps: () => props,
  getDOM() {
    let template = byId(id)
    return {
      template: () => template,
      inner: () => template?.closest('.q-dialog-plugin'),
      outer: () => template?.closest('.q-dialog')
    }
  },
  getComponent: () => localComponent.value,
  getComponentProps: () => localComponentProps.value,
  setComponent,
  setComponentProps
}

function ok(formData, event, callback = () => {}) {
  return callback(okCancel('ok', formData, event))
}

function cancel(formData, event, callback = () => {}) {
  return callback(okCancel('cancel', formData, event))
}

function dialogExists() { return qDialog && byId(id) }

function show() { setShow(true) }

function toggle() { setShow(!localShow.value) }

function hide(command = '') {
  // check status of isHiding, do not hide
  // hide is already in progress
  if (command === 'isHiding') return isHiding;

  // prevent back button redirect on dismiss
  // this is used by XDialogLink
  if (command === 'preventDismissRedirect') {
    preventDismissRedirect = true
  }

  if (dialogExists()) {
    isHiding = true
    // fire quasar original hide event
    // this will fire qDialog.onDismiss callback
    qDialog.hide()
  }
}

function setComponent(component) {
  emit('update:component', component)
  localComponent.value = component
}

function setComponentProps(newProps) {
  if (isRef(props.componentProps)) {
    // this is necessary to check if the props are refs
    // then we can forward the update to the v-model:options
    // to keep the two way binding working
    emit('update:componentProps', newProps)
  } else {
    // or if the props.options are not reactive
    // we have to directly update the options then
    localComponentProps.value = newProps
  }
  // Object.assign(componentProps.value, props)
  // emit('update:componentProps', componentProps.value)
  log('setComponentProps', props, componentProps.value)
}

function go(component, componentProps = {}) {
  setComponent(component)
  setComponentProps(componentProps)
}

const isMounted = ref(false)

// MUST always be before the watch functions
onBeforeUnmount(async () => {
  if (dialogExists()) {
    await dialogHideAsync(xDialog)
    dialogRemove(id)
  }
})

function dismiss() {

  callbacks['hide'].forEach(call => call(xDialog))
  // not mounted anymore
  isMounted.value = false

  namedEmit('hide', qDialog)

  setShow(false)

  if (router.value && preventDismissRedirect === false) {
    redirectFunction(vueRouter, vueRoute)
  }

  preventDismissRedirect = false
  isHiding = false
}

log('render dialog', id)

// Custom update function for XDialog

function update(options) {
  // if there are saved options update
  if (dialogOptions) {
    mergeDeep(dialogOptions, prepareOptions(dialogOptions, options, false))
  }

  if (('component' in options && size(options) === 1)
    || ('componentProps' in options && size(options) === 1)
    || ('component' in options && 'componentProps' in options && size(options) === 2)
  ) {
    return xDialog
  }

  // save the DOM state of the dialog
  let content = ''
  onFrame(() => { // onFrame is a MUST here
    content = byId(id)
    // we need to wait for the content to render first
    // update the options
    qDialog.update(dialogOptions)
  })

  // restore the DOM state of the dialog
  // onFrame is a MUST here
  onFrame(() => byId(id)?.replaceWith(content))

  // return the dialog instance itself
  return xDialog
}

function updateThroughRef(opts) {
  if (isRef(props.options)) {
    // this is necessary to check if the props are refs
    // then we can forward the update to the v-model:options
    // to keep the two way binding working
    emit('update:options', { ...props.options, ...opts })
  } else {
    // or if the props.options are not reactive
    // we have to directly update the options then
    return update(opts)
  }

  return xDialog;
}

function mount() {
  // Remove dom that gets left behind
  // when we open and close dialog quickly
  dialogRemove(id)

  // Create QDialog
  qDialog = $q.dialog(dialogOptions)

  // Set the main dismiss event
  qDialog.onDismiss(dismiss)

  onFrame(() => { // onFrame is a MUST here
    dialogFix_Android_Mobile_Browser_Maximized_Bottom_Navbar_Overflow(id, dialogOptions)
    // Teleport will only work when isMounted = true
    isMounted.value = true
  })
}

function setShow(value) {
  localShow.value = value
  emit('update:modelValue', value)
}

function setOkCancelCallbacks() {
  if (dialogOptions?.ok || dialogOptions?.cancel) {
    setButtonEvents('ok')
    setButtonEvents('cancel')
  }
}

function setButtonEvents(type) {

  let dialogInner = xDialog.getDOM().inner()

  if (!dialogInner) {
    warn('**events', type, 'could not bet set', 'emitName:', emitName)
    warn('**events', 'dialogInner does not exist')
    return // do nothing
  }

  // find ok / cancel buttons
  let btns = dialogInner?.querySelectorAll('button[name="__' + type + '__"]')

  btns?.forEach(btn => {

    let btnEvents = btn.getEventListeners();

    // remove the listeners
    btnEvents.forEach(e => btn.removeEventListener(e.type, e.listener, e.useCapture))

    // add proper callbacks
    btn.addEventListener('click', (event) => okCancel(type, event), false)

    // re-add the listeners
    btnEvents.forEach(e => btn.addEventListener(e.type, e.listener, e.args))
  })
}

function okCancel(type, event) {

  let formData = extractData(xDialog.getDOM().inner())

  log(type + ' formdata ', formData)

  let eventStopped = false
  callbacks[type].forEach(call => {
    // handle return false to stop the event from going further
    if (call(formData, xDialog, event) === false) {
      // prevent click event from propagating further
      // this will stop the closing of the dialog
      if (event !== null) {
        eventStopped = true
        event.stopImmediatePropagation()
      }
    }
  })

  // emit events up to parent
  let processedReturn = { formData, eventStopped, event, dialog: xDialog }

  namedEmit(type, processedReturn)

  return processedReturn
}

function runShowCallbacks() {
  callbacks.show.forEach(showFunc => showFunc(xDialog))
}

// Smart watcher for managing 'modelValue' prop
// from parent and keeping it reactive.
watch(localShow, () => localShow.value ? mount() : hide(), { immediate: true })
watch(modelValue, () => localShow.value = modelValue.value, { immediate: true })

function fullMount() {
  onFrame(() => { // onFrame is a MUST here
    setShow(true)
    runShowCallbacks()
    namedEmit('show', xDialog)
    setOkCancelCallbacks()
  })
}

watch(isMounted, () => isMounted.value ? fullMount() : null);

watch(options, () => dialogExists()
    ? update(options.value)
    : dialogOptions = prepareOptions(dialogOptions, options.value, false),
  { deep: true }
);

watch(component, () => localComponent.value = component.value, { immediate: true })

function notEmptyComponent(c) {
  return c !== false && c !== null && c !== undefined && c !== ''
}

const validComponent = computed(() => notEmptyComponent(localComponent.value))

function componentChanged(newA, prevA) {
  // this helps resolve differences in filenames of () => imports()
  // note both [localComponent, localShow] are necessary for
  // the correct operation of the next line:
  return newA?.toString() !== prevA?.toString()
}

// Smart imported component watcher
watch([localComponent, localShow], (newA, prevA) => {
  // change component only if shown & changed to save on memory and rendering
  if (localShow.value && validComponent && componentChanged(newA, prevA)) {
    importComponent.value = localComponent.value
  }
}, { immediate: true });

const computedComponent = computed(() => smartImport(importComponent.value))

watch(componentProps, () => localComponentProps.value = componentProps.value, { deep: true });

defineExpose(xDialog)
</script>
<template>
  <component v-if="hasButton && button"
             :is="button"
             v-bind="buttonAttrs"
             @click="toggle()">
    <slot :dialog="xDialog"/>
  </component>
  <Teleport v-if="isMounted && (validComponent || hasTemplate)" :to="'#'+id">
    <component v-if="validComponent"
               :is="computedComponent"
               v-bind="localComponentProps"
               :dialog="xDialog"
               @go="go"
               @live="live"/>
    <slot :dialog="xDialog" name="template"/>
  </Teleport>
</template>
