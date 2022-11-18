import { boot } from 'quasar/wrappers'
import X from 'quasar-app-extension-x' // "ui" is aliased in quasar.conf.js

export default boot(({ app }) => {

  app.use(X, { lalala: true })
})
