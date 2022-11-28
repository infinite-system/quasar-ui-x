export function log(...args) {
  return console.log(...args)
}

export function warn(...args) {
  return console.warn(...args)
}

export function err(...args) {
  return console.error(...args)
}

export function info(...args) {
  return console.warn(...args)
}

export function stringify(obj) {
  // stringify an object, avoiding circular structures
  // https://stackoverflow.com/a/31557814
  const simpleObject = {};
  for (const prop in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
      continue;
    }
    if (typeof (obj[prop]) == 'object') {
      continue;
    }
    if (typeof (obj[prop]) == 'function') {
      continue;
    }
    simpleObject[prop] = obj[prop];
  }
  return JSON.stringify(simpleObject); // returns cleaned up JSON
}

export function logify(o) {
  return JSON.parse(stringify(o))
}

export default {
  log,
  info,
  logify,
  stringify,
  warn
}
