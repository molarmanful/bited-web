export default class Px {
  devicePixelRatio = $state({ x: 1 })
  dpr = $derived(+this.devicePixelRatio.x.toFixed(2))
  dprd = $derived(this.dpr | 0)
  scale = $derived(this.dprd / this.dpr)
  fsz = $derived(16 * this.scale)

  constructor(devicePixelRatio: { x: number }) {
    this.devicePixelRatio = devicePixelRatio

    $effect(() => {
      document.documentElement.style.setProperty('--fsz', `${this.fsz}px`)
    })
  }
}
