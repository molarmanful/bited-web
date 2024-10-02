import type { StateSer as Ser, StateSer } from '$lib/db'

import { db } from '$lib/db'
import Font from '$lib/Font.svelte'
import GlyphMan from '$lib/GlyphMan.svelte'
import Uc from '$lib/Uc.svelte'
import { liveQ } from '$lib/util'
import StateCapture from '$lib/workers/statecapture?worker'
import StateRestore from '$lib/workers/staterestore?worker'

export default class State {
  ready = $state(false)
  font = new Font()
  uc = new Uc(this)

  block = $state('')
  code = $state(-1)

  #metaQ = liveQ(() =>
    this.code < 0
      ? void 0
      : db.transaction('r', db.ucdata, () => db.ucdata.get(this.code)),
  )

  meta = $derived(this.#metaQ.current)

  vscale = $state(3)
  vw = $derived(8 * this.vscale)
  scale = $state(4)
  w = $derived(8 * this.scale)

  ser = $derived<Ser>({
    font: this.font.ser,
    vscale: this.vscale,
    scale: this.scale,
  })

  glyphman = new GlyphMan(this)

  constructor() {
    $effect.pre(() => {
      this.restore()
    })
  }

  deser({ font, vscale, scale }: Ser) {
    if (vscale)
      this.vscale = vscale
    if (scale)
      this.scale = scale
    if (font)
      this.font.deser(font)
  }

  capture() {
    const C = new StateCapture()
    C.postMessage(this.ser)
  }

  async restore() {
    await navigator?.storage?.persist?.()

    const SR = new StateRestore()

    await Promise.all([
      new Promise<void>((res) => {
        SR.onmessage = ({ data }: { data: StateSer }) => {
          this.deser(data)
          res()
        }
      }),

      this.glyphman.restore(),
    ])

    this.ready = true
  }
}
