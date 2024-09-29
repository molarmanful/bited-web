import { db, type StateSer as Ser } from '$lib/db'
import Font from '$lib/Font.svelte'
import Uc from '$lib/Uc.svelte'
import { liveQ } from '$lib/util'
import Capture from '$lib/workers/statecapture?worker'
import Restore from '$lib/workers/staterestore?worker'

export default class State {
  ready = $state(false)
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

  #glyphq = liveQ(() =>
    db.transaction('r', db.glyphs, async () => {
      const [glyphs, glyph] = await Promise.all([
        db.glyphs.toArray(),
        db.glyphs.get(this.code),
      ])
      return { glyphs, glyph }
    }),
  )

  glyphq = $derived(this.#glyphq.current)
  glyphs = $derived(new Map(this.glyphq.glyphs.map(g => [g.code, g])))

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
    const C = new Capture()
    C.postMessage(this.ser)
  }

  async restore() {
    // TODO: verify that this works
    await navigator?.storage?.persist?.()
    const R = new Restore()
    R.onmessage = ({ data }) => {
      this.deser(data)
      this.ready = true
    }
  }
}
