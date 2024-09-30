import type { GlyphSer } from '$lib/db'
import type State from '$lib/State.svelte'

import Glyph from '$lib/Glyph.svelte'
import GlyphDB from '$lib/workers/glyphdb?worker'
import GlyphRestore from '$lib/workers/glyphrestore?worker'
import { SvelteMap } from 'svelte/reactivity'

export default class GlyphMan {
  st: State
  glyphs = new SvelteMap<number, Glyph>()

  constructor(st: State) {
    this.st = st
  }

  async restore() {
    const GR = new GlyphRestore()

    await new Promise<void>((res) => {
      GR.onmessage = ({ data }: { data: GlyphSer[] }) => {
        this.glyphs = new SvelteMap(
          data.map(g => [g.code, Glyph.deser(this.st.font, g)]),
        )
        res()
      }
    })
  }

  get(code: number) {
    return this.glyphs.get(code)
  }

  set(glyphs: Glyph[]) {
    for (const glyph of glyphs) this.glyphs.set(glyph.code, glyph)
    const gd = new GlyphDB({ name: 'put' })
    gd.postMessage(glyphs.map(g => g.ser))
  }

  delete(codes: number[]) {
    for (const code of codes) this.glyphs.delete(code)
    const gd = new GlyphDB({ name: 'del' })
    gd.postMessage(codes)
  }
}
