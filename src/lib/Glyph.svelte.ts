import type { GlyphSer as Ser } from '$lib/db'
import type Font from '$lib/Font.svelte'
import type { GlyphMeta } from 'bdfparser'

import SBM from '$lib/SBM'

export interface Meta {

}

export default class Glyph {
  font: Font
  code = $state(-1)
  width = $state(0)
  blob = $state<Blob | null>(null)
  url = $state<string>()
  mat = new SBM()

  ser = $derived({
    code: this.code,
    width: this.width,
    blob: this.blob,
    mat: this.mat.ser,
  })

  constructor(font: Font, code: number) {
    this.font = font
    this.code = code
    this.width = this.font.metrics.dw_x
  }

  static read(font: Font, vw: number, {
    codepoint: code,
    dwx0: dwx,
    dwy0: dwy,
    bbh,
    bbxoff,
    bbyoff,
  }: GlyphMeta, ks: Set<string>, f = () => { }) {
    const g = new Glyph(font, code)
    g.width = dwx ?? g.width
    g.mat.resize(vw, vw)
    g.mat.ks = ks
    const [dy, dx] = g.trdiff
    g.mat.translate(font.metrics.asc - bbh - bbyoff + dy, bbxoff + dx)
    g.img(vw, vw).then(f)
    return g
  }

  static deser(font: Font, { code, width, blob, mat }: Ser) {
    const g = new Glyph(font, code)
    g.width = width
    g.blob = blob
    g.genURL()
    g.mat = SBM.deser(mat)
    return g
  }

  async img(h: number, w: number) {
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

    await new Promise<void>((res) => {
      cv.toBlob((blob) => {
        this.blob = blob
        this.genURL()
        res()
      })
    })
  }

  genURL() {
    if (!this.blob)
      return
    if (this.url)
      URL.revokeObjectURL(this.url)
    this.url = URL.createObjectURL(this.blob)
  }

  resize(h: number, w: number) {
    const [oy0, ox0] = this.origin
    this.mat.resize(h, w)
    const [oy1, ox1] = this.origin
    this.mat.translate(oy1 - oy0, ox1 - ox0)
  }

  get center(): [number, number] { // y, x
    return [this.font.size >> 1, this.width >> 1]
  }

  get trdiff(): [number, number] {
    const [h, w] = this.mat.size
    const [y, x] = [h >> 1, w >> 1]
    const [cy, cx] = this.center
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
