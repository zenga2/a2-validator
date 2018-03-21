const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const version = require('../package.json').version
const babel = require('rollup-plugin-babel')
const uglify = require('uglify-js')
const zlib = require('zlib')

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

function resolve(p) {
  return path.resolve(__dirname, '../', p)
}

const banner =
  '/*!\n' +
  ' * a2-validator v' + version + '\n' +
  ' * (c) 2017-' + new Date().getFullYear() + ' A2\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const builds = [{
  entry: resolve('src/validator-mixin.js'),
  dest: resolve('dist/a2-validator.js'),
  format: 'umd',
  moduleName: 'a2Validator',
  plugins: [
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  banner
}, {
  entry: resolve('src/validator-mixin.js'),
  dest: resolve('dist/a2-validator.esm.js'),
  format: 'es',
  plugins: [
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  banner
}, {
  entry: resolve('src/validator-mixin.js'),
  dest: resolve('dist/a2-validator.min.js'),
  format: 'umd',
  // 当format为 'umd'时, moduleName就是插件的全局变量名(插件赋值给该全局变量)
  // 本例就是a2Validator
  moduleName: 'a2Validator',
  plugins: [
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  banner
}]

function build(builds) {
  builds.reduce(
    (promise, build) => promise.then(() => buildEntry(build)),
    Promise.resolve()
  ).catch(logError)
}

function buildEntry(config) {
  const isProd = /min\.js$/.test(config.dest)
  return rollup.rollup(config).then((bundle) => {
    const code = bundle.generate(config).code
    if (isProd) {
      var minified = (config.banner ? config.banner + '\n' : '') + uglify.minify(code, {
        output: {
          ascii_only: true
        },
        compress: {}
      }).code
      return write(config.dest, minified, true)
    } else {
      return write(config.dest, code)
    }
  }).catch(logError)
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, (err) => {
      if (err) {
        return reject(err)
      }
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

function logError(e) {
  console.log(e)
}

build(builds)