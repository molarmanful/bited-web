import type { Ser as FontSer } from '$lib/Font.svelte'

import Font from '$lib/Font.svelte'
import Uc from '$lib/Uc.svelte'
import LF from 'localforage'

interface Ser {
  font: FontSer
  vscale: number
  scale: number
}

export default class State {
  #on = $state(false)
  font = new Font()
  uc = new Uc(this)

  block = $state('')

  code = $state(-1)
  meta = $derived(this.code >= 0 ? this.uc.data.get(this.code) : void 0)

  vscale = $state(3)
  vw = $derived(8 * this.vscale)
  scale = $state(4)
  w = $derived(8 * this.scale)

  ser = $derived<Ser>({
    font: this.font.ser,
    vscale: this.vscale,
    scale: this.scale,
  })

  constructor() {
    $effect.pre(() => {
      this.restore()
    })

    $effect(() => {
      if (!this.#on)
        return
      this.capture()
    })
  }

  deser({ font, vscale, scale }: Ser) {
    this.vscale = vscale
    this.scale = scale
    this.font.deser(font)
  }

  async capture() {
    const t0 = performance.now()
    const ser = this.ser
    const t1 = performance.now()
    console.log('CAP', t1 - t0)
    await LF.setItem('bited-font', ser)
  }

  async restore() {
    const t0 = performance.now()
    const res = await LF.getItem<Ser>('bited-font')
    if (res)
      this.deser(res)
    const t1 = performance.now()
    console.log('RES', t1 - t0)
    this.#on = true
  }
}
