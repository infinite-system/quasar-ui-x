const vue = require('rollup-plugin-vue')
const css = require('rollup-plugin-css-only')
const path = require('path')
const readline = require('readline')
const fs = require('fs')
const fse = require('fs-extra')
const rollup = require('rollup')
const uglify = require('uglify-js')
const babel = require('@rollup/plugin-babel')
const buble = require('@rollup/plugin-buble')
const typescript = require('rollup-plugin-ts')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const replace = require('@rollup/plugin-replace')

const { version } = require('../package.json')

const buildConf = require('./config')
const buildUtils = require('./utils')

// compile typescript definitions
const srcTypesFile = path.resolve(__dirname, '../src/x/types/x.ts')
const srcConstTypesFile = path.resolve(__dirname, '../src/x/types/index.d.ts')
const distTypesDir = path.resolve(__dirname, '../dist/types')
const distTypesFile = distTypesDir + '/x.d.ts'

const bootFileSrc = path.resolve(__dirname, '../dev/src/boot/register.js')
const bootFileDestination = path.resolve(__dirname, '../../app-extension/src/render/src/boot/x.js')
fs.copyFile(bootFileSrc, bootFileDestination, (err) => {
  if (err) {
    console.log("Error Found:", err)
  } else {
    console.log(`Boot file ${bootFileSrc} copied to ${bootFileDestination}`)
  }
});

const rollupPlugins = [
  replace({
    preventAssignment: false,
    values: {
      __UI_VERSION__: `'${version}'`
    }
  }),
  nodeResolve({
    extensions: ['.js'],
    preferBuiltins: false
  }),
  commonjs({extensions:['.js']}),
  typescript({
    transpileOnly : true
    // module: 'es2020',
    // typescript: require('typescript'),
    // objectHashIgnoreUnknownHack: true,
    // check:false,
  }),
  // inspiration for css & vue compilation
  // https://forum.vuejs.org/t/how-do-i-extract-scss-using-latest-rollup-plugin-vue/42032/2
  // https://gist.github.com/plinionaves/b3257f9989eef3b65125d4072e3a884d
  css(),
  vue({ preprocessStyles: true }),
  json(),
  babel({
    babelHelpers: 'bundled',
    babelrc: false,
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-transform-for-of',
      // '@babel/plugin-transform-runtime'
    ],
    extensions: [
      ".vue", '.js', '.ts'
    ],
    exclude: "node_modules/**",
    presets: [
      ["@babel/env", {
        modules: false,
        useBuiltIns: "usage",
        corejs: 3,
        targets: {
          // "chrome": "48",
          "ie": "11"
        },
      }]
    ]
  }),
  buble({ objectAssign: 'Object.assign' })
]

const builds = [
  {
    rollup: {
      input: {
        input: pathResolve('../src/index.esm.js')
      },
      output: {
        file: pathResolve('../dist/index.esm.js'),
        format: 'es'
      }
    },
    build: {
      // unminified: true,
      minified: true
    }
  },
  {
    rollup: {
      input: {
        input: pathResolve('../src/index.common.js')
      },
      output: {
        file: pathResolve('../dist/index.common.js'),
        format: 'cjs'
      }
    },
    build: {
      // unminified: true,
      minified: true
    }
  },
  {
    rollup: {
      input: {
        input: pathResolve('../src/index.umd.js')
      },
      output: {
        name: 'x',
        file: pathResolve('../dist/index.umd.js'),
        format: 'umd'
      }
    },
    build: {
      unminified: true,
      minified: true,
      minExt: true
    }
  }
]

// Add your asset folders here, if needed
// addAssets(builds, 'icon-set', 'iconSet')
// addAssets(builds, 'lang', 'lang')

build(builds)

/**
 * Helpers
 */

function pathResolve(_path) {
  return path.resolve(__dirname, _path)
}

// eslint-disable-next-line no-unused-vars
function addAssets(builds, type, injectName) {
  const
    files = fs.readdirSync(pathResolve('../../ui/src/components/' + type)),
    plugins = [buble(/* bubleConfig */)],
    outputDir = pathResolve(`../dist/${type}`)

  fse.mkdirp(outputDir)

  files
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
      const name = file.substr(0, file.length - 3).replace(/-([a-z])/g, g => g[1].toUpperCase())
      builds.push({
        rollup: {
          input: {
            input: pathResolve(`../src/components/${type}/${file}`),
            plugins
          },
          output: {
            file: addExtension(pathResolve(`../dist/${type}/${file}`), 'umd'),
            format: 'umd',
            name: `x.${injectName}.${name}`
          }
        },
        build: {
          minified: true
        }
      })
    })
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(srcConstTypesFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let lines = ''
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    // console.log(`Line from file: ${line}`);
    if (!(new RegExp(/^\s*import/).test(line))){
      lines += line + "\n"
    }
  }
  return lines
}

function build(builds) {

  fs.mkdir(distTypesDir, (err) => {
    if (err) {
      console.log("Error Found:", err);
    } else {
      fs.copyFile(srcTypesFile, distTypesFile, (err) => {
        if (err) console.log("Error Found:", err)

        fs.readFile(srcConstTypesFile, (err, data) => {
          if (err) console.log("Error Found:", err)

          processLineByLine().then(newData => {
            fs.appendFile(distTypesFile, "\n" + newData, (err) => {
              if (err) console.log("Error Found:", err)

              console.log('x.d.ts has been built')
            })
          })

        })
      })
    }
  })

  return Promise
    .all(builds.map(genConfig).map(buildEntry))
    .catch(buildUtils.logError)
}

function genConfig(opts) {
  Object.assign(opts.rollup.input, {
    plugins: rollupPlugins,
    external: ['vue', 'quasar']
  })

  Object.assign(opts.rollup.output, {
    banner: buildConf.banner,
    globals: { vue: 'Vue', quasar: 'Quasar' }
  })

  return opts
}

function addExtension(filename, ext = 'min') {
  const insertionPoint = filename.lastIndexOf('.')
  return `${filename.slice(0, insertionPoint)}.${ext}${filename.slice(insertionPoint)}`
}

function buildEntry(config) {
  return rollup
    .rollup(config.rollup.input)
    .then(bundle => bundle.generate(config.rollup.output))
    .then(({ output }) => {
      const code = config.rollup.output.format === 'umd'
        ? injectVueRequirement(output[0].code)
        : output[0].code

      return config.build.unminified
        ? buildUtils.writeFile(config.rollup.output.file, code)
        : code
    })
    .then(code => {
      if (!config.build.minified) {
        return code
      }

      const minified = uglify.minify(code, {
        compress: {
          pure_funcs: ['makeMap']
        }
      })

      if (minified.error) {
        return Promise.reject(minified.error)
      }

      return buildUtils.writeFile(
        config.build.minExt === true
          ? addExtension(config.rollup.output.file)
          : config.rollup.output.file,
        buildConf.banner + minified.code,
        true
      )
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}

function injectVueRequirement(code) {
  // eslint-disable-next-line
  const index = code.indexOf(`Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue`)

  if (index === -1) {
    return code
  }

  const checkMe = ` if (Vue === void 0) {
    console.error('[ Quasar ] Vue is required to run. Please add a script tag for it before loading Quasar.')
    return
  }
  `

  return code.substring(0, index - 1) +
    checkMe +
    code.substring(index)
}
