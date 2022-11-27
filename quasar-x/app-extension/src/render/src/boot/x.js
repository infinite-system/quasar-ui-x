import { boot } from 'quasar/wrappers'
import X, { resolveImport } from 'quasar-ui-x'

export default boot(({ app }) => {

  // We need to pass a function as a prop
  // it has to be a blank function itself
  // returning the function to pass through Vue 3
  // 'resolveImport' gets your local environment dynamicImport callback
  // that can resolve dynamic imports in your project scope
  // this makes the components file resolve within your project
  // relative to src/ folder, or you can set your own logic here
  // to limit unrestricted access to components or render files
  function setupImport() {
    const dynamicImport = function(component) {
      return () => import(`src/${component}.vue`)
    }
    return resolveImport(dynamicImport)
  }

  app.use(X, { importFn: setupImport })
})
