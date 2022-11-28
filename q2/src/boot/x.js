import { boot } from 'quasar/wrappers'
import X, { XDialogLoading, XDialogError } from 'quasar-ui-x'

export default boot(({ app }) => {

  app.use(X, {
    importConfig: {
      fn: (component) => import(`src/${component}.vue`),
      loading: XDialogLoading,
      error: XDialogError,
      delay: 150, // delay loading display, having a loader
      timeout: 0, // 0 in ms or never timeout, set it to your own preference
      pretty: true
    }
  })
})
