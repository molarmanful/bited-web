import Font from '$lib/Font.svelte'
import Uc from '$lib/Uc.svelte'

export default class State {
  font = new Font()
  uc = new Uc(this)

  block = $state('')

  code = $state(-1)
  meta = $derived(this.code >= 0 ? this.uc.data.get(this.code) : void 0)

  // TODO: scale based on glyph bounds
  scale = $state(4)
  w = $derived(8 * this.scale)
  vscale = $state(3)
  vw = $derived(8 * this.vscale)
}
