import type Font from '$lib/Font'

import SBM from '$lib/SBM'

export default class Glyph {
  font: Font
  code: number
  width: number
  mat = new SBM()

  constructor(font: Font, code: number) {
    this.font = font
    this.code = code
    this.width = this.font.metrics.width
  }

  get center(): [number, number] { // y, x
    return [this.font.size / 2 | 0, this.width / 2 | 0]
  }

  get trdiff(): [number, number] {
    const [h, w] = this.mat.size
    const [cy, cx] = this.center
    const [y, x] = [h / 2 | 0, w / 2 | 0]
    return [y - cy, x - cx]
  }

  get cornerBL(): [number, number] { // y, x
    const [dy, dx] = this.trdiff
    return [this.font.size + dy, dx]
  }

  get origin(): [number, number] {
    const [bly, blx] = this.cornerBL
    return [bly - this.font.metrics.desc, blx]
  }

  get bbx(): [number, number, number, number] {
    const [h, w, , xmin, ymax] = this.mat.box
    if (h === 0 && w === 0)
      return [0, 0, 0, 0]
    const [oy, ox] = this.origin
    return [w, h, xmin - ox, oy - ymax]
  }

  get bitmap() {
    const a = this.mat.clone()
    const [h, w, ymin, xmin] = a.box
    a.translate(-ymin, -xmin)
    a.resize(h, w)
    return `${a}`
  }
}
