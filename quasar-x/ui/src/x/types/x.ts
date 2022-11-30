import { PropType, ComponentPublicInstance, ComponentOptions, Component, ComputedOptions, MethodOptions } from "vue";
import { QBtn, QDialogOptions, DialogChainObject, AddressbarColor, AppFullscreen, Cookies, Dark, Loading, LoadingBar, LocalStorage, QNotifyCreateOptions, Platform, Screen, SessionStorage } from "quasar";
import { asyncImport, dynamicImporter, setupImport } from '../utils/import.js';
import { redirectFn, payloadFn } from "../dialog/XDialogHelpers.js";
import XDialogLoading from "../dialog/XDialogLoading.vue";
import XDialogError from "../dialog/XDialogError.vue";
import { QVueGlobals } from "quasar/dist/types/globals";
import { QNotifyUpdateOptions, VueClassProp, VueStyleProp } from "quasar/dist/types/api";

// do not remove next line ComponentConstructor is necessery for the x.d.ts file
export type ComponentConstructor<Component extends ComponentPublicInstance<Props, RawBindings, D, C, M> = ComponentPublicInstance<any>, Props = any, RawBindings = any, D = any, C extends ComputedOptions = ComputedOptions, M extends MethodOptions = MethodOptions> =
  { new (): Component }
  & ComponentOptions<Props, RawBindings, D, C, M>
// copied and slightly modified from vue core
declare type Data = Record<string, unknown>;
declare type DefaultFactory<T> = (props: Data) => T | null | undefined;

type OptionalRequired<T> = undefined extends T ? { required?: false } : { required: true };

declare interface PropOptionsWorkaroundRequired<T = any, D = T> {
  type?: PropType<T> | true | null
  default?: D | DefaultFactory<D> | null | undefined | object

  validator? (value: unknown): boolean
}

// convert interface properties to property options
type PropsWorkaround<T> = {
  [Key in keyof T]-?: PropOptionsWorkaroundRequired<T[Key]> & OptionalRequired<T[Key]>
}

export interface XDialogProps {
  id?: string
  modelValue?: boolean
  options?: XDialogOptions | string
  load?: boolean | string | object
  props?: object
  button?: string | object
  buttonProps?: object
  router?: boolean | string | object
  routerRestart?: boolean
  plugins?: [XDialogPlugins]
  onCreate?: XDialogDisplaySetup | XDialogDisplayFn
  onToggle?: XDialogDisplaySetup | XDialogDisplayFn
  onShow?: XDialogDisplaySetup | XDialogDisplayFn
  onHide?: XDialogDisplaySetup | XDialogDisplayFn
  onLoad?: XDialogDisplaySetup | XDialogDisplayFn
  onMount?: XDialogDisplaySetup | XDialogDisplayFn
  onProps?: XDialogDisplaySetup | XDialogDisplayFn
  onOk?: XDialogPromptSetup | XDialogPromptFn
  onCancel?: XDialogPromptSetup | XDialogPromptFn
  loadConfig?: object
  payloadConfig?: object
  dismissConfig?: object
}

export const propsXDialog: PropsWorkaround<XDialogProps> = {
  // main props
  id: { default: '', type: String },
  modelValue: { default: true, type: Boolean },
  options: { default: () => ({}), type: [Object, String] },
  load: { default: undefined, type: [Boolean, String, Object, Function] },
  props: { default: () => ({}), type: Object },

  button: { default: QBtn, type: [String, Object] },
  buttonProps: { default: () => ({}), type: Object },
  router: { default: false, type: [Boolean, String, Object] },
  routerRestart: { default: false, type: Boolean },
  plugins: { default: [], type: Object },
  // events
  onCreate: { default: null, type: [Function, Object] },
  onToggle: { default: null, type: [Function, Object] },
  onShow: { default: null, type: [Function, Object] },
  onLoad: { default: null, type: [Function, Object] },
  onMount: { default: null, type: [Function, Object] },
  onHide: { default: null, type: [Function, Object] },
  onOk: { default: null, type: [Function, Object] },
  onCancel: { default: null, type: [Function, Object] },
  onUpdate: { default: null, type: [Function, Object] },
  onProps: { default: null, type: [Function, Object] },

  // extra configs
  loadConfig: {
    default: () => ({
      fn: dynamicImporter,
      loading: XDialogLoading,
      error: XDialogError,
      delay: 150,
      timeout: 0,
      pretty: false
    }), type: [Object]
  },
  payloadConfig: {
    default: () => ({
      on: true,
      fn: payloadFn
    }), type: [Object]
  },
  dismissConfig: {
    default: () => ({
      on: true,
      fn: redirectFn
    }), type: [Object]
  },
}

export interface XDialogComponentProps {
  dialog?: XDialog
}

export const propsXDialogComponent: PropsWorkaround<XDialogComponentProps> = {
  dialog: { default: () => ({}), type: Object as PropType<XDialog> },
}

type XDialogDisplayFn = () => void | boolean

export interface XDialogDisplaySetup {
  fn?: XDialogPromptFn
  reset?: boolean
}

type XDialogPromptFn = (payload: any) => void | boolean

export interface XDialogPromptSetup {
  fn?: XDialogPromptFn
  reset?: boolean
  payloadFn?: (element: Element) => any
}


export interface XDialog extends XDialogChain {
  xDialog: () => XDialogProps
  xId: () => string
  xOptions: () => XDialogOptions
  xFile: () => string | object
  xProps: () => XDialogProps
  xState: () => object
  xDOM: () => XDialogDOM
}

export interface XDialogChain {
  toggle: () => XDialogChain
  show: () => XDialogChain
  hide: (command?: string | null) => XDialogChain
  ok: XDialogPromptSetup | XDialogPromptFn
  cancel: XDialogPromptSetup | XDialogPromptFn
  update: (opts: XDialogOptions) => XDialogChain
  load: (file: string | object) => XDialogChain
  props: (props: object, options: object) => XDialogChain
  plugins: (plugins: [XDialogPlugins]) => XDialogChain
  // events
  onCreate: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onToggle: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onShow: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onHide: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onOk: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onCancel: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onUpdate: () => XDialogChain
  onLoad: () => XDialogChain
  onProps: () => XDialogChain
}

export interface XDialogPlugins {
  pluginName: (dialog: XDialog, name: string) => void
}

export interface XDialogOptions extends QDialogOptions {
  component?: Component | string
  /**
   * User defined props which will be forwarded to underlying custom component if 'component' prop is used
   */
  componentProps?: any
}

export interface XDialogDOM {
  xWrap: () => Element
  xInner: () => Element
  xBackdrop: () => Element | null
  xContent: () => Element
}

export interface XVueGlobals {
  dialog: (opts: XDialogProps) => XDialog
}
