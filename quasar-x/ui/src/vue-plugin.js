import XDialog from './x/dialog/XDialog.vue'
import XDialogLink from './x/dialog-link/XDialogLink.vue'
import XLink from './x/link/XLink.vue'
import { xDialog } from './x/dialog/XDialogHelpers.js'
import ListenerTracker from "./x/utils/events";
import resolveImport from './x/utils/import.js'
import { useX } from './x/utils/use-x'

const version = __UI_VERSION__

function install (app, options) {

  ListenerTracker.init()

  if (typeof options !== 'undefined' && typeof options.importFn !== 'undefined'){
    XDialog.props.importFn.default = options.importFn
    console.log('using options.importFn', options.importFn)
  } else {
    console.log('using standard importFn')
  }

  app.component(XDialog.name, XDialog)
  app.component(XDialogLink.name, XDialogLink)
  app.component(XLink.name, XLink)

  // provide x
  app.provide('x', { dialog : xDialog(app) })
}

export {
  version,
  useX,
  XDialog,
  XDialogLink,
  XLink,
  resolveImport,
  ListenerTracker,
  install
}

export default {
  version,
  useX,
  XDialog,
  XDialogLink,
  XLink,
  resolveImport,
  ListenerTracker,
  install
}
