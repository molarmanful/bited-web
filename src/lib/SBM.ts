import 'core-js/proposals/set-methods-v2'

type KsLike = SBM | Set<string>

export default class SBM {
  ks = new Set<string>()
  size: [number, number] = [0, 0] // h, w

  get(x: number, y: number) {
    return this.in(x, y) ? this.ks.has(SBM.encode(x, y)) : void 0
  }

  set(x: number, y: number, v?: boolean) {
    if (!this.in(x, y))
      return
    const k = SBM.encode(x, y)
    if (v || (v === void 0 && !this.ks.has(k))) {
      this.ks.add(k)
      return
    }
    this.ks.delete(k)
  }

  in(x: number, y: number) {
    return (x >= 0 && x < this.size[0]) && (y >= 0 && y < this.size[1])
  }

  resize(h: number, w: number) {
    const [h0, w0] = this.size
    this.size = [h, w]
    if (h < h0 || w < w0)
      this.check()
  }

  check() {
    for (const k of this.ks) {
      if (!this.in(...SBM.decode(k)))
        this.ks.delete(k)
    }
  }

  union(a: KsLike) {
    this.ks = this.ks.union(SBM.setify(a))
  }

  intersection(a: KsLike) {
    this.ks = this.ks.intersection(SBM.setify(a))
  }

  difference(a: KsLike) {
    this.ks = this.ks.difference(SBM.setify(a))
  }

  symmetricDifference(a: KsLike) {
    this.ks = this.ks.symmetricDifference(SBM.setify(a))
  }

  not() {
    const [h, w] = this.size
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        this.set(x, y)
      }
    }
  }

  static encode(x: number, y: number) {
    return `${x} ${y}`
  }

  static decode(k: string): [number, number] {
    const [sx, sy] = k.split(' ')
    return [+sx, +sy]
  }

  static setify(a: KsLike) {
    return a instanceof SBM ? a.ks : a
  }
}
