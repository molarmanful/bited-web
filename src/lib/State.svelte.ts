import Font from './Font'
import Uc from './Uc.svelte'

export default class State {
  font = new Font()
  uc = new Uc({ st: this })

  block = $state('')

  char = $state(-1)
  meta = $derived(this.char < 0 ? void 0 : this.uc.data.get(this.char))
}
