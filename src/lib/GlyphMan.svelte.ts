import type { GlyphSer } from '$lib/db'
import type State from '$lib/State.svelte'
import type { GlyphMeta } from 'bdfparser'

import type Font from './Font.svelte'

import Glyph from '$lib/Glyph.svelte'
import GlyphDB from '$lib/workers/glyphdb?worker'
import GlyphRestore from '$lib/workers/glyphrestore?worker'
import { SvelteMap } from 'svelte/reactivity'

export type BDFRes = [number, GlyphMeta]

export default class GlyphMan {
  st: State
  font: Font
  glyphs = new SvelteMap<number, Glyph>()

  constructor(st: State) {
    this.st = st
    this.font = this.st.font
  }

  async restore() {
    const GR = new GlyphRestore()

    await new Promise<void>((res) => {
      GR.onmessage = ({ data }: { data: GlyphSer[] }) => {
        this.glyphs = new SvelteMap(
          data.map(g => [g.code, Glyph.deser(this.font, g)]),
        )
        res()
      }
    })
  }

  read([code, meta]: BDFRes) {
    this.glyphs.set(code, Glyph.read(this.font, meta, this.st.vw))
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
