import { inject } from 'vue'
import type { XVueGlobals } from "@/x/types/x";

export function useX (): XVueGlobals {
  return inject('x')
}
