import type Man from './Man.svelte'

import { UDiff } from './UndoMan'

export default class Tool {
  man: Man
  prev: Set<string>
  ptr: [number, number] = [0, 0]

  #color = false

  constructor(man: Man) {
    this.man = man
    this.prev = new Set(this.man.glyph.mat.ks)
  }

  pen(x: number, y: number, first = false, v?: boolean) {
    const x1 = x / this.man.pw | 0
    const y1 = y / this.man.pw | 0

    let t = false
    if (v !== void 0) {
      t = v
    }
    else if (first) {
      // TODO: change to account for dark mode
      t = this.#color = !!this.man.tiles[y1 * this.man.w + x1].tint
      this.ptr = [x1, y1]
    }
    else {
      t = this.#color
    }

    for (const [x, y] of this.interp(x1, y1)) {
      this.man.tiles[y * this.man.w + x].tint = +!t * 0xFFFFFF
      this.man.glyph.mat.set(y, x, t)
    }
    this.ptr = [x1, y1]
  }

  line(x: number, y: number, first = false) {
    this.man.retint()

    const x1 = x / this.man.pw | 0
    const y1 = y / this.man.pw | 0

    if (first) {
      this.ptr = [x, y]
    }

    for (const [x, y] of this.interp(x1, y1)) {
      this.man.tiles[y * this.man.w + x].tint = 0
    }
  }

  interp(x: number, y: number): [number, number][] {
    let [x0, y0] = this.ptr
    const xys: [number, number][] = [[x, y]]

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
