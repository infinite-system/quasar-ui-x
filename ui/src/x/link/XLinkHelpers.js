import { log, isFunction,logify } from '../utils'

export async function linkFn (event, { href, route: to, navigate }) {
  navigate(event)
}