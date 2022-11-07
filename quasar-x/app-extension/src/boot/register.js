import { boot } from 'quasar/wrappers'
import VuePlugin from 'quasar-ui-x'

export default boot(({ app }) => {
  app.use(VuePlugin)
})
