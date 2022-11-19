import { boot } from 'quasar/wrappers'
import X, { smartImport } from 'quasar-ui-x'

export default boot(({ app }) => {
  app.use(X, {
    __importer__: smartImport((component) => {
      return () => import(`src/${component}.vue`)
    })
  })
})
