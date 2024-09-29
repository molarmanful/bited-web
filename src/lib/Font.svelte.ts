import type { FontSer as Ser } from '$lib/db'

import Glyph from '$lib/Glyph.svelte'
import { SvelteMap } from 'svelte/reactivity'

export interface Metrics {
  cap: number
  x: number
  asc: number
  desc: number
  width: number
}

export default class Font {
  name = $state('FONTNAME')
  metrics = $state<Metrics>({
    cap: 9,
    x: 7,
    asc: 14,
    desc: 2,
    width: 8,
  })

  size = $derived(this.metrics.asc + this.metrics.desc)
  glyphs = new SvelteMap<number, Glyph>()

  ser = $derived<Ser>({
    name: this.name,
    metrics: $state.snapshot(this.metrics),
  })

  // TODO: load glyphs from db
  deser({ name, metrics }: Ser) {
    this.name = name
    this.metrics = metrics
  }

  useMetrics(metrics: Partial<Metrics>) {
    Object.assign(this.metrics, metrics)

    this.metrics.cap = Math.max(0, this.metrics.cap | 0)
    this.metrics.x = Math.max(0, this.metrics.x | 0)
    this.metrics.asc = Math.max(0, this.metrics.asc | 0)
    this.metrics.desc = Math.max(0, this.metrics.desc | 0)
    this.metrics.width = Math.max(0, this.metrics.width | 0)
  }

  get(code: number) {
    return this.glyphs.get(code) ?? new Glyph(this, code)
  }

  set(glyph: Glyph) {
    this.glyphs.set(glyph.code, glyph)
  }

  has(code: number) {
    return this.glyphs.has(code)
  }

  delete(code: number) {
    this.glyphs.delete(code)
  }
}
