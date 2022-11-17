export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function isFunction(f) {
  return typeof f === 'function'
}

export function isEmpty(obj) {
  for (let i in obj) return false;
  return true;
}

export function isPromise(p) {
  return p !== null &&
    typeof p === 'object' &&
    typeof p.then === 'function' &&
    typeof p.catch === 'function';
}
