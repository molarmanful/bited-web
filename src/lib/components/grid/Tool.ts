import type Man from './Man.svelte'

import { UDiff } from './UndoMan'

export default class Tool {
  man: Man
  prev: Set<string>

  #color = false

  constructor(man: Man) {
    this.man = man
    this.prev = new Set(this.man.mat.ks)
  }

  pen(x: number, y: number, first = false, v?: boolean) {
    x = x / this.man.pw | 0
    y = y / this.man.pw | 0
    const i = y * this.man.w + x

    let t = false
    if (v !== void 0) {
      t = v
    }
    else if (first) {
      // TODO: change to account for dark mode
      t = this.#color = !!this.man.tiles[i].tint
    }
    else {
      t = this.#color
    }

    this.man.tiles[i].tint = +!t * 0xFFFFFF
    this.man.mat.set(y, x, t)
  }

  get diff() {
    const a = this.prev
    const b = this.man.mat.ks
    return new UDiff([
      a.difference(b),
      b.difference(a),
    ])
  }
}
