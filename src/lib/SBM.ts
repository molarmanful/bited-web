type KsLike = SBM | Set<string>

export default class SBM {
  ks = new Set<string>()
  size: [number, number] = [0, 0] // h, w

  get(y: number, x: number) {
    return this.in(y, x) ? this.ks.has(SBM.encode(y, x)) : void 0
  }

  set(y: number, x: number, v?: boolean) {
    if (!this.in(y, x))
      return
    const k = SBM.encode(y, x)
    if (v || (v === void 0 && !this.ks.has(k))) {
      this.ks.add(k)
      return
    }
    this.ks.delete(k)
  }

  add(y: number, x: number) {
    this.size = [
      Math.max(this.size[0], y),
      Math.max(this.size[1], x),
    ]
    this.ks.add(SBM.encode(y, x))
  }

  in(y: number, x: number) {
    return (y >= 0 && y < this.size[0]) && (x >= 0 && x < this.size[1])
  }

  resize(h: number, w: number) {
    this.size = [h, w]
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
        this.set(y, x)
      }
    }
  }

  transpose() {
    this.eachI((y, x) => [x, y])
    this.size.reverse()
  }

  flipY() {
    this.eachI((y, x) => [y, this.size[1] - x])
  }

  flipX() {
    this.eachI((y, x) => [this.size[0] - y, x])
  }

  rotCW() {
    this.eachI((y, x) => [this.size[1] - x, y])
  }

  rotCCW() {
    this.eachI((y, x) => [x, this.size[0] - y])
  }

  eachI(f: (y: number, x: number) => [number, number]) {
    const ks = new Set<string>()
    this.each((y, x) => {
      ks.add(SBM.encode(...f(y, x)))
    })
    this.ks = ks
  }

  each(f: (y: number, x: number) => void) {
    for (const k of this.ks) {
      const [y, x] = SBM.decode(k)
      f(y, x)
    }
  }

  toPretty() {
    const res = Array.from({ length: this.size[0] }).map(() =>
      Array.from<number>({ length: this.size[1] }).fill(0),
    )
    this.each((y, x) => {
      res[y][x] = 1
    })
    return res
  }

  static encode(y: number, x: number) {
    return `${y} ${x}`
  }

  static decode(k: string): [number, number] {
    const [sy, sx] = k.split(' ')
    return [+sy, +sx]
  }

  static setify(a: KsLike) {
    return a instanceof SBM ? a.ks : a
  }
}
