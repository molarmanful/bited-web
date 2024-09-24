import Glyph from './Glyph'

interface Metrics {
  cap: number
  x: number
  asc: number
  desc: number
  width: number
}

export default class Font {
  name = 'FONTNAME'
  metrics = $state<Metrics>({
    cap: 9,
    x: 6,
    asc: 12,
    desc: 4,
    width: 0,
  })

  size = $derived(this.metrics.asc + this.metrics.desc)
  glyphs = new Map<string, Glyph>()

  useMetrics(metrics: Partial<Metrics>) {
    Object.assign(this.metrics, metrics)

    this.metrics.cap = Math.max(0, this.metrics.cap | 0)
    this.metrics.x = Math.max(0, this.metrics.x | 0)
    this.metrics.asc = Math.max(0, this.metrics.asc | 0)
    this.metrics.desc = Math.max(0, this.metrics.desc | 0)
    this.metrics.width = Math.max(0, this.metrics.width | 0)
  }

  addGlyph(name: string, code = -1) {
    this.glyphs.set(name, new Glyph(this, name, code))
  }
}
