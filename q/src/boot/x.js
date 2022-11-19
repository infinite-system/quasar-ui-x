import { boot } from 'quasar/wrappers'
import VuePlugin, { smartImport } from 'quasar-ui-x'

export default boot(({ app }) => {
  app.use(VuePlugin, {
    __importer__: smartImport((component) => {
      return () => import(`src/${component}.vue`)
    })
  })
})
