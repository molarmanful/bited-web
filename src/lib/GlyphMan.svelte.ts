import type { GlyphSer } from '$lib/db'
import type State from '$lib/State.svelte'
import type { GlyphMeta } from 'bdfparser'

import type Font from './Font.svelte'

import Glyph from '$lib/Glyph.svelte'
import GlyphDB from '$lib/workers/glyphdb?worker'
import GlyphRestore from '$lib/workers/glyphrestore?worker'
import { SvelteMap } from 'svelte/reactivity'

export type BDFRes = [number, GlyphMeta, Set<string>][]

export default class GlyphMan {
  st: State
  font: Font
  glyphs = new SvelteMap<number, Glyph>()

  constructor(st: State) {
    this.st = st
    this.font = this.st.font

    $effect(() => {
      if (this.glyphs.size === this.font.length)
        this.font.length = void 0
    })
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

  async read(res: BDFRes) {
    const gd = new GlyphDB({ name: 'put 1' })
    let now = Date.now()
    let now1 = Date.now()
    let q: GlyphSer[] = []

    for (let i = 0; i < res.length; i++) {
      const [code, meta, ks] = res[i]
      if (code < 0)
        continue

      const glyph = Glyph.read(this.font, this.st.vw, meta, ks, () => {
        q.push(glyph.ser)
        if (i < res.length - 1)
          return
        gd.postMessage(q)
        gd.postMessage('CLOSE')
        q = []
      })
      this.glyphs.set(code, glyph)

      if (Date.now() - now > 50) {
        await new Promise(f => requestIdleCallback(f))
        now = Date.now()
      }

      if (Date.now() - now1 > 100 && q.length) {
        gd.postMessage(q)
        q = []
        now1 = Date.now()
      }
    }
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

  clear() {
    this.glyphs.clear()
    const gd = new GlyphDB({ name: 'clr' })
    gd.postMessage([])
  }
}
