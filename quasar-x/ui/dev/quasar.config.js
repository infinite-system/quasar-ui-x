// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals');

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

        browser: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari11.1'],
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
        //
        // chain.plugin('copy').tap(options => {
        //   options[0][0].ignore.push('src/components/vue-dd/**/*');
        //   return options;
        // });
        // chain.module.rule('vue-dd')
        //   // .test(/.+$/)
        //   .exclude
        //     .add(
        //       path.resolve(__dirname, 'src/components/vue-dd/**/*')
        //     )
        // chain.plugins.(new webpack.IgnorePlugin({
        //   resourceRegExp: /.*$/,
        //   contextRegExp: /src\/components\/vue-dd/
        // }))



      },
      extendWebpack (cfg, { isServer, isClient }) {


        // console.log(path.resolve(__dirname, 'src/components/vue-dd'))



        // cfg.module.rules[cfg.module.rules.length - 1].exclude = cfg.module.rules[0].exclude = cfg.module.rules[2].exclude =[
        //   // {
        //   // test: /\.(m?jsx?|tsx?|vue)$/,
        //   // exclude:
        //     path.resolve(__dirname, 'src/components/vue-dd/node_modules'),
        // // }
        // ]

        //
        // if (!('plugins' in cfg)){
        //   cfg.plugins = []
        // }
        //   cfg.plugins.push(
        //   new webpack.NormalModuleReplacementPlugin(
        //     /src\/components\/vue-dd\/node_modules/,
        //     'node_modules'
        //   )
        // )
        //



        //
        // if (!('externals' in cfg)){
        //   cfg.externals = []
        // }
        // cfg.target = 'web'
        // cfg.externals.push(nodeExternals({
        //   modulesFromFile: true
        // }))
        // cfg.externalsPresets = {
        //   node: true // in order to ignore built-in modules like path, fs, etc.
        // }
        //




        // console.log('cfg', JSON.stringify(cfg, null, 4))
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
