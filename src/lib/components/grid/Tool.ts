import type State from '$lib/State.svelte'

import type Man from './Man.svelte'

import { UDiff } from './UndoMan.svelte'

export default class Tool {
  st: State
  man: Man
  prev: Set<string>
  ptr: [number, number] = [0, 0]

  #color = false

  constructor(man: Man) {
    this.man = man
    this.st = this.man.st
    this.prev = new Set(this.man.glyph.mat.ks)
  }

  pen(x: number, y: number, down = false, v?: boolean) {
    const x0 = x / this.man.pw | 0
    const y0 = y / this.man.pw | 0

    let t = false
    if (v !== void 0) {
      t = v
    }
    else if (down) {
      // TODO: change to account for dark mode
      t = this.#color = !!this.man.tiles[y0 * this.st.w + x0].tint
      this.ptr = [x0, y0]
    }
    else {
      t = this.#color
    }

    for (const [x, y] of this.interp(x0, y0)) {
      this.man.tiles[y * this.st.w + x].tint = +!t * 0xFFFFFF
      this.man.glyph.mat.set(y, x, t)
    }

    this.ptr = [x0, y0]
  }

  line(x: number, y: number, down = false, up = false) {
    this.man.retint()

    const x0 = x / this.man.pw | 0
    const y0 = y / this.man.pw | 0

    if (down) {
      this.ptr = [x0, y0]
    }

    for (const [x, y] of this.interp(x0, y0)) {
      this.man.tiles[y * this.st.w + x].tint = 0
      if (up)
        this.man.glyph.mat.set(y, x, true)
    }
  }

  interp(x: number, y: number): [number, number][] {
    let [x0, y0] = this.ptr
    const xys: [number, number][] = [[x0, y0]]

    const dx = Math.abs(x - x0)
    const dy = Math.abs(y - y0)
    const sx = Math.sign(x - x0)
    const sy = Math.sign(y - y0)
    let e = dx - dy

    while (x0 !== x || y0 !== y) {
      const e2 = e << 1
      if (e2 > -dy) {
        e -= dy
        x0 += sx
      }
      if (e2 < dx) {
        e += dx
        y0 += sy
      }
      xys.push([x0, y0])
    }

    return xys
  }

  get diff() {
    const a = this.prev
    const b = this.man.glyph.mat.ks
    return new UDiff([
      a.difference(b),
      b.difference(a),
    ])
  }
}
