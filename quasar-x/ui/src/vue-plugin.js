import XDialog from './x/dialog/XDialog.vue'
import XDialogLoading from './x/dialog/XDialogLoading.vue'
import XDialogError from './x/dialog/XDialogError.vue'
import XDialogComponent from './x/dialog/XDialogComponent.vue'
import XDialogLink from './x/dialog-link/XDialogLink.vue'
import XLink from './x/link/XLink.vue'
import { xDialog, payloadFn, redirectFn } from './x/dialog/XDialogHelpers.js'
import ListenerTracker from "./x/utils/events";
import { setupAsyncImport } from './x/utils/import.js'
import { isAsync } from './x/utils/is.js'
import { useX } from './x/utils/use-x'
import xHistory, { extendHistory } from "./x/utils/private/extend-history";

const version = __UI_VERSION__

function install (app, options) {

  ListenerTracker.init()

  if (options && 'XDialog' in options) {
    XDialog.props.config.default = () => options.XDialog
  }

  app.component(XDialog.name, XDialog)
  app.component(XDialogComponent.name, XDialogComponent)
  app.component(XDialogLoading.name, XDialogLoading)
  app.component(XDialogError.name, XDialogError)

  app.component(XDialogLink.name, XDialogLink)
  app.component(XLink.name, XLink)

  extendHistory()

  const provideX = {
    dialog: xDialog(app),
    history: xHistory
  }

  app.provide('$x', provideX)
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
  payloadFn,
  redirectFn,
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
  payloadFn,
  redirectFn,
  ListenerTracker,
  install
}
