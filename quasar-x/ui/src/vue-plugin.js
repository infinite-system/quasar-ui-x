import XDialog from './x/dialog/XDialog.vue'
import XDialogLoading from './x/dialog/XDialogLoading.vue'
import XDialogError from './x/dialog/XDialogError.vue'
import XDialogComponent from './x/dialog/XDialogComponent.vue'
import XDialogLink from './x/dialog-link/XDialogLink.vue'
import XLink from './x/link/XLink.vue'
import { xDialog } from './x/dialog/XDialogHelpers.js'
import ListenerTracker from "./x/utils/events";
import { setupAsyncImport } from './x/utils/import.js'
import { isAsync } from './x/utils/is.js'
import { useX } from './x/utils/use-x'

const version = __UI_VERSION__

function install (app, options) {

  ListenerTracker.init()

  if (typeof options !== 'undefined'
    && typeof options.importConfig !== 'undefined'
  ){
    console.log('XDialog.props', XDialog.props)
    XDialog.props.importConfig.default = () => options.importConfig
    console.log('using options.importConfig.fn', options.importConfig)
  } else {
    console.log('using default importConfig.Fn')
  }

  app.component(XDialog.name, XDialog)
  app.component(XDialogComponent.name, XDialogComponent)
  app.component(XDialogLoading.name, XDialogLoading)
  app.component(XDialogError.name, XDialogError)
  app.component(XDialogLink.name, XDialogLink)
  app.component(XLink.name, XLink)

  // provide x
  app.provide('x', { dialog : xDialog(app) })
}

export {
  version,
  useX,
  XDialog,
  XDialogComponent,
  XDialogLoading,
  XDialogError,
  XDialogLink,
  XLink,
  isAsync,
  setupAsyncImport,
  ListenerTracker,
  install
}

export default {
  version,
  useX,
  XDialog,
  XDialogComponent,
  XDialogLoading,
  XDialogError,
  XDialogLink,
  XLink,
  isAsync,
  setupAsyncImport,
  ListenerTracker,
  install
}
