/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

function extendConf (conf) {

  // register our boot file
  // this was default way
  // conf.boot.push('~quasar-app-extension-x/src/boot/x.js')
  // this is by installing boot file into the project dir
  // and instantiating it from the project itself
  conf.boot.push('x')

  // make sure app extension files & ui package gets transpiled
  if (!('transpileDependencies' in conf.build)){
    conf.build.transpileDependencies = []
  }

  console.log('conf.build', conf.build)
  conf.build.transpileDependencies.push(/quasar-app-extension-x[\\/]src/)

  // make sure the stylesheet goes through webpack to avoid SSR issues
  conf.css.push('~quasar-ui-x/src/index.sass')
}

module.exports = function (api) {
  // Quasar compatibility check; you may need
  // hard dependencies, as in a minimum version of the "quasar"
  // package or a minimum version of "@quasar/app-*" CLI
  console.log('api.compatibleWith', api)
  api.compatibleWith('quasar', '^2.0.0')

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0')
  } else if (api.hasWebpack) {
    api.compatibleWith('@quasar/app-webpack', '^3.4.0')
  }


  // Uncomment the line below if you provide a JSON API for your component
  // api.registerDescribeApi('X', '~quasar-ui-x/src/components/X.json')


  // We extend /quasar.conf.js
  api.extendQuasarConf(extendConf)
}
