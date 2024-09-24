interface Metrics {
  cap: number
  x: number
  asc: number
  desc: number
}

export default class Font {
  metrics = $state<Metrics>({
    cap: 8,
    x: 4,
    asc: 12,
    desc: 4,
  })

  size = $derived(this.metrics.asc + this.metrics.desc)

  useMetrics(metrics: Partial<Metrics>) {
    Object.assign(this.metrics, metrics)
    this.metrics.cap = Math.max(0, this.metrics.cap)
    this.metrics.x = Math.max(0, this.metrics.x)
    this.metrics.asc = Math.max(0, this.metrics.asc)
    this.metrics.desc = Math.max(0, this.metrics.desc)
  }
}
