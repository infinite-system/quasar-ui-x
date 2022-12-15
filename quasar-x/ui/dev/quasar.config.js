// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const path = require('path')
const webpack = require('webpack')

module.exports = function (ctx) {
  return {
    supportTS: true,
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    boot: [
      'register.js'
    ],

    css: [
      'app.sass'
    ],

    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
      'material-symbols-sharp'
    ],

    framework: {
      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      config: {},

      // Quasar plugins
      plugins: [
        'Notify', 'Dialog', 'SessionStorage', 'LocalStorage', 'Cookies'
      ]
    },

    // animations: 'all', // --- includes all animations
    animations: [],

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {

      target: {

        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        // node: 'node16'
      },

      // extendViteConf(viteConf, { isServer, isClient }) {

      // },
      vueRouterMode: 'history',

      chainWebpack(chain) {
        chain.resolve.alias.merge({
          '@': path.resolve(__dirname, `src`),
          '#': path.resolve(__dirname, `../src`),
          ui: path.resolve(__dirname, `../src/index.esm.js`)
        })

        chain.plugin('define-ui')
          .use(webpack.DefinePlugin, [{
            __UI_VERSION__: `'${require('../package.json').version}'`
          }])
      }
    },

    devServer: {
      // port: 8080,
      open: false // opens browser window automatically
    },

    ssr: {
      middlewares: [
        ctx.prod ? 'compression' : '',
        'render' // keep this as last one
      ]
    }
  }
}
