import type State from '$lib/State.svelte'

import UC, { type Blocks, type Data } from '$lib/Unicode'

export default class Uc {
  st: State
  ready = $state(false)

  dataA = $state.raw<Data>([])
  data = $derived(new Map(this.dataA))

  blocks = $state.raw<Blocks>(new Map())

  view = $derived.by(() => {
    if (this.st.block === 'all') {
      return this.dataA
    }

    const block = this.blocks.get(this.st.block)
    if (block) {
      const [i0, i1] = block

      const res: Data = []
      for (let i = i0; i <= i1; i++) {
        const c = this.data.get(i)
        if (c)
          res.push([i, c])
      }

      return res
    }

    // TODO: glyph view default
    return this.dataA
  })

  constructor(st: State) {
    this.st = st

    $effect(() => {
      Promise.all([
        UC.data().then(res => this.dataA = res),
        UC.blocks().then(res => this.blocks = res),
      ]).then(() => {
        this.ready = true
      })
    })
  }
}
