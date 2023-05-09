import { boot } from 'quasar/wrappers'
import X, { XDialogLoading, XDialogError, helpers } from 'quasar-ui-x'

export default boot(({ app }) => {
  const config = {
    XDialog: {
      load: {
        fn: (component) => import(`src/${component}.vue`),
        loading: XDialogLoading,
        error: XDialogError,
        delay: 150,
        timeout: 0,
        pretty: true
      },
      payload: { on: true, fn: helpers.payloadFn },
      dismiss: { redirect: { on: true, fn: helpers.redirectFn } },
      router: { restart: false, emit: false }
    }
  }
  app.use(X, config)
})
