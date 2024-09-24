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

  // TODO: remove?
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

  translate(y: number, x: number) {
    this.eachI((y1, x1) => [y1 + y, x1 + x])
  }

  flipY() {
    const [_, w] = this.size
    this.eachI((y, x) => [y, w - x])
  }

  flipX() {
    const [h] = this.size
    this.eachI((y, x) => [h - y, x])
  }

  flipXY() {
    const [h, w] = this.size
    this.eachI((y, x) => [h - y, w - x])
  }

  rotCW() {
    const [_, w] = this.size
    this.eachI((y, x) => [w - x, y])
  }

  rotCCW() {
    const [h] = this.size
    this.eachI((y, x) => [x, h - y])
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

  get bitmap() {
    const [h, w] = this.size
    const xb = (w + 7) >> 3
    const res
      = Array.from<Uint8Array>({ length: h }).map(() =>
        new Uint8Array(xb),
      )

    this.each((y, x) => {
      if (this.in(y, x))
        res[y][x >> 3] |= 1 << (7 - (x & 7))
    })

    return res
  }

  get bin() {
    return this.toString(c => c.toString(2).padStart(8, '0'), ' ')
  }

  toString(
    f = (c: number) => c.toString(16).padStart(2, '0'),
    j = '',
  ) {
    return this.bitmap.map(a =>
      [...a].map(f).join(j),
    ).join('\n')
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
