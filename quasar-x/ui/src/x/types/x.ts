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
  import?: boolean | string | object
  importConfig?: object
  props?: object
  button?: string | object
  buttonProps?: object
  router?: boolean | string | object
  routerRestart?: boolean
  onShow?: XDialogDisplaySetup | XDialogDisplayFn
  onHide?: XDialogDisplaySetup | XDialogDisplayFn
  onOk?: XDialogPromptSetup | XDialogPromptFn
  onCancel?: XDialogPromptSetup | XDialogPromptFn
  importConfig?: object
  importFn?: () => ({}) | object
  importLoading?: Component
  importError?: Component
  payloadFn?: () => ({}) | object
  redirectFn?: () => ({}) | object
}

export const propsXDialog: PropsWorkaround<XDialogProps> = {
  // main props
  id: { default: '', type: String },
  modelValue: { default: true, type: Boolean },
  options: { default: () => ({}), type: [Object, String] },
  import: { default: undefined, type: [Boolean, String, Object, Function] },
  props: { default: () => ({}), type: Object },

  button: { default: QBtn, type: [String, Object] },
  buttonProps: { default: () => ({}), type: Object },
  router: { default: false, type: [Boolean, String, Object] },
  routerRestart: { default: false, type: Boolean },
  // events
  onShow: { default: null, type: [Function, Object] },
  onHide: { default: null, type: [Function, Object] },
  onOk: { default: null, type: [Function, Object] },
  onCancel: { default: null, type: [Function, Object] },
  onOptions: { default: null, type: [Function, Object] },
  onProps: { default: null, type: [Function, Object] },

  importFn: { default: setupImport, type: [Function, Object] },
  importLoading: { default: XDialogLoading, type: [Object] },
  importError: { default: XDialogError, type: [Object] },

  payloadFn: { default: () => payloadFn, type: [Function, Object] },
  redirectFn: { default: () => redirectFn, type: [Function, Object] },
  // extra configs
  importConfig: {
    default: () => ({
      fn: dynamicImporter,
      loading: XDialogLoading,
      error: XDialogError,
      delay: 150,
      timeout: 0,
      pretty: true
    }), type: [Object]
  },
  payloadConfig: {
    default: () => ({
      enabled: true,
      handler: payloadFn
    }), type: [Object]
  },
  dismissConfig: {
    default: () => ({
      enabled: true,
      handler: redirectFn
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

type XDialogPromptFn = (payload: any, stopped: boolean) => void | boolean

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
  options: (opts: XDialogOptions) => XDialogChain
  update: (opts: XDialogOptions) => XDialogChain
  import: (file: string | object) => XDialogChain
  importFn: (fn: () => object | null) => XDialogChain
  props: (props: object, options: object) => XDialogChain
  // events
  onShow: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onHide: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onOk: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onCancel: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onOptions: () => XDialogChain
  onImport: () => XDialogChain
  onProps: () => XDialogChain
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
  dialog: (opts: XDialogProps) => XDialogChain
}
