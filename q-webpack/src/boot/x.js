import { boot } from 'quasar/wrappers'
import X, { XDialogLoading, XDialogError, payloadFn, redirectFn } from 'quasar-ui-x'

export default boot(({ app }) => {
  const config = {
    XDialog: {
      load: {
        fn: (component) => import(`src/${component}.vue`),
        loading: XDialogLoading,
        error: XDialogError,
        delay: 0,
        timeout: 0,
        pretty: true
      },
      payload: { on: true, fn: payloadFn },
      dismiss: { redirect: { on: true, fn: redirectFn } },
      router: { restart: false, emit: false }
    }
  }
  console.log('XDialogLoading', XDialogLoading)
  app.use(X, config)
})
