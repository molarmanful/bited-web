import type { Action } from 'svelte/action'

export const used = (..._: any[]) => { }

export const hex = (n: number) => n.toString(16).padStart(4, '0')

export const clickout: Action<HTMLElement, (e: MouseEvent) => void> = (node, f = (_: MouseEvent) => { }) => {
  const abort = new AbortController()

  addEventListener('click', (e) => {
    if (e.target && node.contains(e.target as Node))
      return
    f(e)
  }, { signal: abort.signal })

  return { destroy: () => abort.abort() }
}
