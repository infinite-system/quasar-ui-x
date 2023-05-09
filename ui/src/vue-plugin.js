import XDialog from './x/dialog/XDialog.vue'
import XDialogLoading from './x/dialog/XDialogLoading.vue'
import XDialogError from './x/dialog/XDialogError.vue'
import XDialogComponent from './x/dialog/XDialogComponent.vue'
import XDialogLink from './x/dialog-link/XDialogLink.vue'
import XLink from './x/link/XLink.vue'

import * as helpers from './x/dialog/XDialogHelpers.js'
import * as utils from './x/utils'

const version = __UI_VERSION__

function install (app, options) {

  utils.ListenerTracker.init()

  if (options && 'XDialog' in options) {
    const defaults = XDialog.props.config.default()
    utils.extend(defaults, options.XDialog)
    XDialog.props.config.default = () => defaults
  }

  app.component(XDialog.name, XDialog)
  app.component(XDialogComponent.name, XDialogComponent)
  app.component(XDialogLoading.name, XDialogLoading)
  app.component(XDialogError.name, XDialogError)

  app.component(XDialogLink.name, XDialogLink)
  app.component(XLink.name, XLink)

  utils.extendHistory()

  const provideX = {
    dialog: helpers.xDialog(app),
    history: utils.xHistory,
    helpers: helpers,
    utils: utils
  }

  app.provide('$x', provideX)
}

const useX = utils.useX;

export {
  version,
  install,

  XDialog,
  XDialogComponent,
  XDialogLoading,
  XDialogError,
  XDialogLink,
  XLink,

  helpers,
  utils,

  useX
}

export default {
  version,
  install,

  XDialog,
  XDialogComponent,
  XDialogLoading,
  XDialogError,
  XDialogLink,
  XLink,

  helpers,
  utils,

  useX
}
