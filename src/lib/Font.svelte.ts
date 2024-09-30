import type { FontSer as Ser } from '$lib/db'

export interface Metrics {
  cap: number
  x: number
  asc: number
  desc: number
  width: number
}

export default class Font {
  // TODO: rework with XLFD
  name = $state('fontname')
  metrics = $state<Metrics>({
    cap: 9,
    x: 7,
    asc: 14,
    desc: 2,
    width: 8,
  })

  size = $derived(this.metrics.asc + this.metrics.desc)

  ser = $derived<Ser>({
    name: this.name,
    metrics: $state.snapshot(this.metrics),
  })

  deser({ name, metrics }: Ser) {
    if (name)
      this.name = name
    if (metrics)
      this.useMetrics(metrics)
  }

  useMetrics(metrics: Partial<Metrics>) {
    Object.assign(this.metrics, metrics)

    this.metrics.cap = Math.max(0, this.metrics.cap | 0)
    this.metrics.x = Math.max(0, this.metrics.x | 0)
    this.metrics.asc = Math.max(0, this.metrics.asc | 0)
    this.metrics.desc = Math.max(0, this.metrics.desc | 0)
    this.metrics.width = Math.max(0, this.metrics.width | 0)
  }
}
