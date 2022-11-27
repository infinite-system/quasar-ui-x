import byId from './utils/by-id'
import createComponent from './utils/create'
import { extractData, extractQuery } from './utils/extract-data'
import { isObject, isFunction, isEmpty, isPromise } from './utils/is'
import keepAlive from './utils/keep-alive'
import { warn, info, log, logify, stringify } from './utils/log'
import mergeDeep from './utils/merge-deep'
import prop from './utils/prop'
import size from './utils/size'
import sleep from './utils/sleep'
import resolveImport, { dynamicImport, smartImport } from './utils/import'
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
  keepAlive,
  warn,
  info,
  log,
  logify,
  stringify,
  mergeDeep,
  prop,
  size,
  sleep,
  resolveImport,
  dynamicImport,
  smartImport,
  onFrame
}
