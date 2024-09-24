import type Man from './Man.svelte'

import { UDiff } from './UndoMan.svelte'

export default class Op {
  man: Man

  constructor(man: Man) {
    this.man = man
  }

  act(f: () => void) {
    const a = new Set(this.man.mat.ks)
    f()
    this.man.gen()
    const b = this.man.mat.ks
    this.man.undoman.act(new UDiff([
      a.difference(b),
      b.difference(a),
    ]))
  }

  debug() {
    console.log(this.man.mat.bin)
  }

  transpose() {
    this.act(() => {
      this.man.mat.transpose()
    })
  }

  flipX() {
    this.act(() => {
      this.man.mat.flipX()
    })
  }

  flipY() {
    this.act(() => {
      this.man.mat.flipY()
    })
  }

  rotCW() {
    this.act(() => {
      this.man.mat.rotCCW()
    })
  }

  rotCCW() {
    this.act(() => {
      this.man.mat.rotCW()
    })
  }
}
