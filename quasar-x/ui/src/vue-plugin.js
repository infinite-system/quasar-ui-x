import XDialog from './components/x/dialog/XDialog'
import XDialogLink from './components/x/dialog-link/XDialogLink'
import XLink from './components/x/link/XLink'

const version = __UI_VERSION__

function install (app) {
  // app.component(Component.name, Component)
  app.component(XDialog.name, XDialog)
  app.component(XDialogLink.name, XDialog)
  app.component(XLink.name, XDialog)
}

export {
  version,
  XDialog,
  XDialogLink,
  XLink,

  install
}
