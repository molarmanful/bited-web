import type { Ser as FontSer } from '$lib/Font.svelte'

import Font from '$lib/Font.svelte'
import Uc from '$lib/Uc.svelte'

export interface Ser {
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

  vscale = $state(3)
  vw = $derived(8 * this.vscale)
  scale = $state(4)
  w = $derived(8 * this.scale)

  ser = $derived<Ser>({
    font: this.font.ser,
    vscale: this.vscale,
    scale: this.scale,
  })

  deser({ font, vscale, scale }: Ser) {
    this.vscale = vscale
    this.scale = scale
    this.font.deser(font)
  }

  async capture() {
    const ser = this.ser
    await LF.setItem('bited-font', ser)
  }

  async restore() {
    await navigator?.storage?.persist?.()
    this.#on = true
  }
}
