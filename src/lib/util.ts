import type { Action } from 'svelte/action'

import { liveQuery } from 'dexie'
import { fromStore } from 'svelte/store'

export const used = (..._: any[]) => { }

export const hex = (n: number) => n.toString(16).padStart(4, '0')

export const clickout: Action<
  HTMLElement,
  (e: MouseEvent) => void
> = (node, f = () => { }) => {
  const abort = new AbortController()

  addEventListener('click', (e) => {
    if (e.target && node.contains(e.target as Node))
      return
    f(e)
  }, { signal: abort.signal })

  return { destroy: () => abort.abort() }
}

export const liveQ = <T>(q: () => T | Promise<T>) => fromStore<T>({
  subscribe: (run, invalidate) =>
    liveQuery(q).subscribe(run, invalidate).unsubscribe,
})
