import type State from '$lib/State.svelte'

import UC, { type Res } from '$lib/Unicode'

export default class Uc {
  st: State
  ready = $state(false)

  blocks = $state.raw<Res['blocks']>(new Map())
  codes = $state.raw<Res['codes']>([])
  codesS = $state.raw<Set<number>>(new Set())

  view = $derived.by(() => {
    if (this.st.block === 'all') {
      return this.codes
    }

    const block = this.blocks.get(this.st.block)
    if (block) {
      const [i0, i1] = block

      const res: Res['codes'] = []
      for (let i = i0; i <= i1; i++) {
        if (this.codesS.has(i))
          res.push(i)
      }

      return res
    }

    return [...this.st.font.glyphs.keys()].sort((a, b) => a - b)
  })

  constructor(st: State) {
    this.st = st

    $effect(() => {
      (async () => {
        const { blocks, codes } = await UC()
        this.blocks = blocks
        this.codes = codes
        this.codesS = new Set(codes)
        this.ready = true
      })()
    })
  }
}
