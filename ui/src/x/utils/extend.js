import { isObject, isPromise } from './is.js'

/**
 * Deep merge two objects.
 * Merges and modifies the target object.
 * Merges sources into target from left to right.
 * Supports circular references and promises.
 * @param target object
 * @param sources array
 */
export default function extend (target, ...sources) {
  return _extend(target, [...sources]);
}

/**
 * Deep merge two objects inner function.
 * Merges and modifies the target object.
 * Merges sources into target from left to right.
 * Supports circular references and promises.
 * @param target target to merge into
 * @param sources sources to merge from
 * @param parents store parents for circular reference checks
 * @returns {*}
 * @private
 */
function _extend (target, sources, parents) {

  if (!sources.length) return target;

  parents = parents || [];
  const source = sources.shift();

  parents.push(target)

  if (isObject(target) && isObject(source)) {
    for (let key in source) {
      if (isObject(source[key])) {
        // detect circular references
        if (parents.indexOf(source[key]) >= 0) {
          // console.log('detected circular reference key:', key,
          // 'value:', source[key],
          // 'parents:', [...parents])
          target[key] = source[key]
        } else {
          if (isPromise(source[key])) {
            // promise objects should not be assigned
            // via _extend
            target[key] = source[key]
          } else {
            // the following lines
            // integrate Proxy support
            // if the target key does not exist
            if (typeof target[key] === 'undefined') {
              // assign directly the proxy or any other object
              target[key] = source[key]
            } else {
              // if target[key] is not an object
              // convert it to an object to be able to extend
              if (typeof target[key] !== 'object'){
                target[key] = {}
              }
              _extend(target[key], [source[key]], parents)
            }
          }
        }

      } else {
        target[key] = source[key]
      }
    }
  }

  return _extend(target, sources, parents);
}
