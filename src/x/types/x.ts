import { PropType, ComponentPublicInstance, ComponentOptions, Component, ComputedOptions, MethodOptions, Ref } from "vue";
import {
  QBtn,
  QDialogOptions
} from "quasar";
import { dynamicImporter } from '../utils/import.js';

import { redirectFn, payloadFn } from "../dialog/XDialogHelpers.js";

import XDialogLoading from "../dialog/XDialogLoading.vue";
import XDialogError from "../dialog/XDialogError.vue";

// do not remove next line ComponentConstructor is necessary for the x.d.ts file
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
  modelValue?: boolean | Ref
  options?: QDialogOptions | string
  load?: boolean | string | object | Promise<any>
  props?: object
  btn?: string | object
  btnProps?: object
  router?: boolean | string | object
  plugins?: XDialogPlugins
  config?: XDialogConfig
  debug?: boolean | Array<string>
  onCreate?: XDialogDisplaySetup | XDialogDisplayFn | object
  onToggle?: XDialogDisplaySetup | XDialogToggleFn | object
  onShow?: XDialogDisplaySetup | XDialogDisplayFn | object
  onHide?: XDialogDisplaySetup | XDialogDisplayFn | object
  onUpdate?: XDialogDisplaySetup | XDialogDisplayFn | object
  onLoad?: XDialogDisplaySetup | XDialogDisplayFn | object
  onProps?: XDialogDisplaySetup | XDialogDisplayFn | object
  onMount?: XDialogDisplaySetup | XDialogDisplayFn | object
  onFail?: XDialogDisplaySetup | XDialogDisplayFn | object
  onConfig?: XDialogDisplaySetup | XDialogConfigFn | object
  onPlugins?: XDialogDisplaySetup | XDialogDisplayFn | object
  onDestroy?: XDialogDisplaySetup | XDialogDisplayFn | object
  onOk?: XDialogPromptSetup | XDialogPromptFn | object
  onCancel?: XDialogPromptSetup | XDialogPromptFn | object
}

export interface XDialogConfig {
  load?: XDialogConfigLoad
  payload?: XDialogConfigPayload
  dismiss?: XDialogConfigDismiss
  router?: XDialogConfigRouter
}

export interface XDialogConfigLoad {
  fn: (element: HTMLElement) => any
  loading: Component
  error: Component
  delay: number
  timeout: number
  pretty: boolean
}

export interface XDialogConfigDismiss {
  redirect: XDialogConfigDismissRedirect
}

export interface XDialogConfigPayload {
  on?: boolean
  fn?: (payload: any) => void | false
}

export interface XDialogConfigRouter {
  restart?: boolean
  emit?: boolean
}

export interface XDialogConfigDismissRedirect {
  on?: boolean
  fn?: (config: XDialogConfigDismissRedirectFnArgs) => void
}

export interface XDialogConfigDismissRedirectFnArgs {
  dialog?: XDialog,
  route?: object,
  router?: object
}

export const propsXDialog: PropsWorkaround<XDialogProps> = {
  // main props
  id: { default: '', type: String },
  modelValue: { default: true, type: [Boolean, Object] },
  options: { default: () => ({}), type: [Object, String] },
  load: { default: undefined, type: [Boolean, String, Object, Function] },
  props: { default: () => ({}), type: Object },

  btn: { default: QBtn, type: [String, Object] },
  btnProps: { default: () => ({}), type: Object },
  router: { default: false, type: [Boolean, String, Object] },
  plugins: { default: [], type: Object },
  config: {
    default: () => ({
      load: {
        fn: dynamicImporter,
        loading: XDialogLoading,
        error: XDialogError,
        delay: 150,
        timeout: 0,
        pretty: false
      },
      payload: {
        on: true,
        fn: payloadFn
      },
      dismiss: {
        redirect: {
          on: true,
          fn: redirectFn
        }
      },
      router: {
        restart: false,
        emit: false
      }
    }),
    type: Object
  },
  debug: { default: false, type: [Boolean, Object] },

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
  onFail: { default: null, type: [Function, Object] },
  onConfig: { default: null, type: [Function, Object] },
  onPlugins: { default: null, type: [Function, Object] },
  onDestroy: { default: null, type: [Function, Object] }
}

export interface XDialogComponentProps {
  dialog?: XDialog
}

export const propsXDialogComponent: PropsWorkaround<XDialogComponentProps> = {
  dialog: { default: () => ({}), type: Object as PropType<XDialog> },
}

export interface XDialogDisplayFnArgs {
  dialog: XDialog
  router: object
  route: object
}

export interface XDialogPayloadFnArgs extends XDialogDisplayFnArgs {
  payload: any
}

export interface XDialogToggleFnArgs extends XDialogDisplayFnArgs {
  toggle: any
}

export interface XDialogConfigFnArgs extends XDialogDisplayFnArgs {
  config: object
}

export declare type XDialogDisplayFn<T = any> = (args?: XDialogDisplayFnArgs) => void | boolean
export declare type XDialogToggleFn = (args?: XDialogToggleFnArgs) => void | boolean
export declare type XDialogConfigFn = (args?: XDialogConfigFnArgs) => void | boolean

export interface XDialogPromptSetup {
  fn?: XDialogPromptFn
  reset?: boolean
}

declare type XDialogPromptFn = (args?: XDialogPayloadFnArgs) => void | boolean

export interface XDialogDisplaySetup {
  fn?: XDialogDisplayFn | XDialogToggleFn
  reset?: boolean
  payloadFn?: (element: Element) => any
}

export interface XDialog extends XDialogChain {
  xDialog: () => XDialogProps
  xId: () => string
  xOptions: () => QDialogOptions
  xLoad: () => string | object
  xProps: () => XDialogProps
  xState: () => XDialogState
  xClass: () => string
  xConfig: () => XDialogConfig
  xDOM: () => XDialogDOM
}

export interface XDialogChain {
  toggle: () => XDialogChain
  show: () => XDialogChain
  showAsync: () => XDialogChain
  hide: (command?: string | null) => XDialogChain
  hideAsync: () => XDialogChain
  ok: XDialogPromptSetup | XDialogPromptFn
  cancel: XDialogPromptSetup | XDialogPromptFn
  update: (opts: QDialogOptions) => XDialogChain
  load: (component: string | object | Component) => XDialogChain
  loadAsync: () => XDialogChain
  props: (props: object, options: object) => XDialogChain
  plugins: (plugins: [XDialogPlugins]) => XDialogChain
  config?: (config: XDialogConfig) => XDialogChain
  destroy: () => void
  // events
  onCreate: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onToggle: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onShow: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onHide: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onOk: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onCancel: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onUpdate: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onLoad: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onProps: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onFail: (setup: XDialogPromptSetup | XDialogPromptFn) => XDialogChain
  onConfig: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onPlugins: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
  onDestroy: (setup: XDialogDisplaySetup | XDialogDisplayFn) => XDialogChain
}

export interface XDialogState {
  isVisible: boolean
  isShown: boolean
  isShowing: boolean
  isHiding: boolean
  isLoading: boolean
  isLoaded: boolean
  isMounted: boolean
  isFailed: boolean
}

export interface XDialogPlugins {
  [key: string]: (dialog: XDialog, name: string) => void | object
}

export interface XDialogDOM {
  xComponent: () => Element
  xWrap: () => Element
  xInner: () => Element
  xBackdrop: () => Element | null
  xContent: () => Element
}

export interface XVueHistory {
  isFirstLoad: boolean
  direction: 'back' | 'forward' | null
  determineDirection: (event: Event) => string
}

export interface XVueGlobals {
  dialog: (opts: XDialogProps) => XDialog
  history: XVueHistory
}
