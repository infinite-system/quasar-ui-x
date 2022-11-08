import byId from './utils/by-id'
import createAppComponent from './utils/create'
import { extractData, extractDataQuery } from './utils/extract-data'
import { isObject, isFunction, isEmpty, isPromise } from './utils/is'
import keepAlive from './utils/keep-alive'
import { warn, info, log, logify } from './utils/log'
import mergeDeep from './utils/merge-deep'
import prop from './utils/prop'
import size from './utils/size'
import sleep from './utils/sleep'
// import smartImport from './utils/smart-import'
import onFrame from './utils/on-frame'

export {
  byId,
  createAppComponent,
  extractData,
  extractDataQuery,
  isObject,
  isFunction,
  isEmpty,
  isPromise,
  keepAlive,
  warn,
  info,
  log,
  logify,
  mergeDeep,
  prop,
  size,
  sleep,
  // smartImport,
  onFrame
}
