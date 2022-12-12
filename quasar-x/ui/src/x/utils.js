import byId from './utils/by-id'
import createComponent from './utils/create'
import { extractData, extractQuery } from './utils/extract-data'
import { isObject, isFunction, isEmpty, isPromise, isAsync, isArray, isString } from './utils/is'
import keepAlive from './utils/keep-alive'
import { err, warn, info, log, dbg, logify, stringify } from './utils/log'
import extend from './utils/merge-deep'
import prop from './utils/prop'
import size from './utils/size'
import sleep from './utils/sleep'
import { dynamicImport, smartImport } from './utils/import'
import onFrame from './utils/on-frame'
import { useX } from './utils/use-x'
export {
  useX,
  byId,
  createComponent,
  extractData,
  extractQuery,
  isObject,
  isFunction,
  isEmpty,
  isPromise,
  isAsync,
  isArray,
  isString,
  keepAlive,
  err,
  warn,
  info,
  dbg,
  log,
  logify,
  stringify,
  extend,
  prop,
  size,
  sleep,
  dynamicImport,
  smartImport,
  onFrame
}
