import type State from '$lib/State.svelte'

import UC, { type Res } from '$lib/Unicode'

const range = ([i0, i1]: [number, number]) => {
  const res: number[] = []
  for (let i = i0; i <= i1; i++)
    res.push(i)
  return res
}

export default class Uc {
  st: State
  ready = $state(false)

  blocks = $state.raw<Res['blocks']>(new Map())
  codes = $derived<number[]>([...this.blocks.values()].flatMap(range))

  view = $derived.by(() => {
    if (this.st.block === 'all')
      return this.codes

    const block = this.blocks.get(this.st.block)
    if (block)
      return range(block)

    return [...this.st.font.glyphs.keys()].sort((a, b) => a - b)
  })

  constructor(st: State) {
    this.st = st

    $effect(() => {
      (async () => {
        const { blocks } = await UC()
        this.blocks = blocks
        this.ready = true
      })()
    })
  }
}
