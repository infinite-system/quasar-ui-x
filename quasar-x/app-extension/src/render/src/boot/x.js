import { boot } from 'quasar/wrappers'
import X, { XDialogLoading, XDialogError, payloadFn, redirectFn } from 'quasar-ui-x'

export default boot(({ app }) => {
  app.use(X, {
    XDialog: {
      config: {
        load: {
          fn: (component) => import(`src/${component}.vue`),,
          loading: XDialogLoading,
          error: XDialogError,
          delay: 150,
          timeout: 0,
          pretty: false
        },
        payload: {
          on: true,
          fn: payloadFn
        },
        dismiss: {
          redirect: {
            on: true,
            fn: redirectFn
          }
        },
        router: {
          restart: false,
          emit: false
        }
      }
    }
  })
})
