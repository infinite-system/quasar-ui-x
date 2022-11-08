// import XDialog from './components/x/dialog/XDialog.vue'
// import XDialogLink from './components/x/dialog-link/XDialogLink.vue'
import XLink from './components/XLink.vue'
import ListenerTracker from "./utils/events";

const version = __UI_VERSION__

function install (app) {
  ListenerTracker.init()
  // app.component(XDialog.name, XDialog)
  // app.component(XDialogLink.name, XDialogLink)
  app.component(XLink.name, XLink)
}

export {
  version,
  // XDialog,
  // XDialogLink,
  XLink,
  ListenerTracker,
  install
}

export default {
  version,
  // XDialog,
  // XDialogLink,
  XLink,
  ListenerTracker,
  install
}
