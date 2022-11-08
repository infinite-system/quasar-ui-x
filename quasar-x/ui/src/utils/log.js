
export function log(...args) {
  return console.log(...args)
}

export function warn(...args) {
  return console.warn(...args)
}

export function info(...args) {
  return console.warn(...args)
}

export function logify(o) {
  return JSON.parse(JSON.stringify(o))
}

export default {
  log,
  info,
  logify,
  warn
}
