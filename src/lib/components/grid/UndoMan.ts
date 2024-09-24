import type SBM from '$lib/SBM'

import type Man from './Man.svelte'

export default class UndoMan {
  undos: UndoItem[] = []
  redos: UndoItem[] = []
  man: Man

  constructor(man: Man) {
    this.man = man
  }

  act(item: UndoItem) {
    this.redos = []
    this.undos.push(item)
  }

  undo() {
    const item = this.undos.pop()
    if (!item)
      return
    item.undo(this.man)
    this.redos.push(item)
    this.man.gen()
  }

  redo() {
    const item = this.redos.pop()
    if (!item)
      return
    item.redo(this.man)
    this.undos.push(item)
    this.man.gen()
  }
}

export type UndoItem = USet | UDiff

export class USet {
  x: [SBM, SBM]

  constructor(x: [SBM, SBM]) {
    this.x = x
  }

  undo(Man: Man) {
    Man.glyph.mat = this.x[0]
  }

  redo(Man: Man) {
    Man.glyph.mat = this.x[1]
  }
}

export class UDiff {
  x: [Set<string>, Set<string>] // del, add

  constructor(x: [Set<string>, Set<string>]) {
    this.x = x
  }

  undo(Man: Man) {
    Man.glyph.mat.union(this.x[0])
    Man.glyph.mat.difference(this.x[1])
  }

  redo(Man: Man) {
    Man.glyph.mat.difference(this.x[0])
    Man.glyph.mat.union(this.x[1])
  }
}
