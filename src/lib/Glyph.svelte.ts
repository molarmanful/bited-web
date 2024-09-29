import type Font from '$lib/Font.svelte'
import type { Ser as SBMSer } from '$lib/SBM'

import SBM from '$lib/SBM'

export interface Ser {
  code: number
  width: number
  blob: Blob | null
  mat: SBMSer
}

export default class Glyph {
  font: Font
  code = $state(-1)
  width = $state(0)
  blob = $state<Blob | null>(null)
  mat = new SBM()

  constructor(font: Font, code: number) {
    this.font = font
    this.code = code
    this.width = this.font.metrics.width
  }

  ser = $derived({
    code: this.code,
    width: this.width,
    blob: this.blob,
    mat: this.mat.ser,
  })

  static deser(font: Font, { code, width, blob, mat }: Ser) {
    const g = new Glyph(font, code)
    g.width = width
    g.blob = blob
    g.mat = SBM.deser(mat)
    return g
  }

  img(h: number, w: number, f = () => { }) {
    const [h0, w0] = this.mat.size
    this.resize(h, w)

    const cv = document.createElement('canvas')
    cv.height = h
    cv.width = w
    const ctx = cv.getContext('2d')
    if (!ctx) {
      console.error('getContext failed')
      return
    }

    const imageData = ctx.createImageData(w, h)
    const { data } = imageData

    this.mat.each((y, x) => {
      if (!this.mat.in(y, x))
        return
      const i = (y * h + x) * 4
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 255
    })

    this.resize(h0, w0)
    ctx.putImageData(imageData, 0, 0)

    this.blob = null
    cv.toBlob((blob) => {
      this.blob = blob
      f()
    })
  }

  resize(h: number, w: number) {
    const [oy0, ox0] = this.origin
    this.mat.resize(h, w)
    const [oy1, ox1] = this.origin
    this.mat.translate(oy1 - oy0, ox1 - ox0)
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
