import type Man from './Man.svelte'

import { UDiff } from './UndoMan.svelte'

export default class Op {
  man: Man

  constructor(man: Man) {
    this.man = man
  }

  act(f: () => void) {
    const a = new Set(this.man.glyph.mat.ks)
    f()
    this.man.gen()
    const b = this.man.glyph.mat.ks
    this.man.undoman.act(new UDiff([
      a.difference(b),
      b.difference(a),
    ]))
  }

  clear() {
    this.act(() => {
      this.man.glyph.mat.ks.clear()
    })
  }

  transpose() {
    this.act(() => {
      this.man.glyph.mat.transpose()
    })
  }

  flipX() {
    this.act(() => {
      this.man.glyph.mat.flipX()
    })
  }

  flipY() {
    this.act(() => {
      this.man.glyph.mat.flipY()
    })
  }

  rotCW() {
    this.act(() => {
      this.man.glyph.mat.rotCCW()
    })
  }

  rotCCW() {
    this.act(() => {
      this.man.glyph.mat.rotCW()
    })
  }
}
