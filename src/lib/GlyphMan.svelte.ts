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
      GR.onmessage = ({ data }: { data: number | GlyphSer[] | 'DONE' }) => {
        if (data === 'DONE') {
          res()
          return
        }

        if (typeof data === 'number') {
          this.font.length = data
          return
        }

        for (const g of data)
          this.glyphs.set(g.code, Glyph.deser(this.font, g))
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

  clear() {
    this.glyphs.clear()
    const gd = new GlyphDB({ name: 'clr' })
    gd.postMessage([])
  }
}

export class Reader {
  gm: GlyphMan

  #unlock = () => { }
  #promise = Promise.resolve()

  constructor(gm: GlyphMan) {
    this.gm = gm
  }

  #lock() {
    this.#promise = new Promise(res => this.#unlock = res)
  }

  async read(res: BDFRes) {
    await this.#promise

    this.#lock()
    const gd = new GlyphDB({ name: 'put 1' })
    const q: GlyphSer[] = []
    let now = Date.now()
    let n = 0

    for (const [code, meta, ks] of res) {
      if (code < 0)
        continue

      const glyph = Glyph.read(this.gm.font, this.gm.st.vw, meta, ks, () => {
        q.push(glyph.ser)

        n++
        if (n < res.length)
          return

        this.#unlock()
        gd.postMessage(q)
        gd.postMessage('CLOSE')
      })

      this.gm.glyphs.set(code, glyph)

      if (Date.now() - now < 50)
        continue
      await new Promise<void>(f => setTimeout(f))
      now = Date.now()
    }
  }
}
