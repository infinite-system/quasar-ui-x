import { isObject } from './is.js'
/**
 * Deep merge two objects.
 * @param target object
 * @param sources array
 */
export default function extend(target, ...sources) {
  if (!sources.length) return target;

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        extend(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return extend(target, ...sources);
}
