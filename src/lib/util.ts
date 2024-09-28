import type { Action } from 'svelte/action'

export const clickout: Action<HTMLElement, (e: MouseEvent) => void> = (node, f = (_: MouseEvent) => { }) => {
  const abort = new AbortController()

  addEventListener('click', (e) => {
    if (e.target && node.contains(e.target as Node))
      return
    f(e)
  }, { signal: abort.signal })

  return { destroy: () => abort.abort() }
}
