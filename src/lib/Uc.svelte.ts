import type State from '$lib/State.svelte'

import UC from '$lib/Unicode'

export class Range {
  i0 = $state(0)
  i1 = $state(1)
  length = $derived(this.i1 - this.i0)

  constructor(i0: number, i1: number) {
    this.i0 = i0
    this.i1 = i1
  }

  get(i: number) {
    return this.i0 + i
  }

  *[Symbol.iterator]() {
    for (let i = this.i0; i < this.i1; i++) yield i
  }
}

export default class Uc {
  st: State
  ready = $state(false)

  blocks = $state.raw<Map<string, Range>>(new Map())

  constructor(st: State) {
    this.st = st

    $effect(() => {
      (async () => {
        const { blocks } = await UC()
        this.blocks = new Map(blocks.map(([k, v]) => [k, new Range(...v)]))
        this.ready = true
      })()
    })
  }
}
