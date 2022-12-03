import { inject } from 'vue'
import type { XVueGlobals } from "../types/x";

export function useX (): XVueGlobals | undefined {
  return inject('x')
}
