import type Font from './Font'

export default class Glyph {
  font: Font
  name: string
  code: number = -1
  width: number

  constructor(font: Font, name: string, code = -1) {
    this.font = font
    this.name = name
    this.code = code
    this.width = this.font.metrics.width
  }

  get tCenter(): [number, number] { // y, x
    return [this.font.size / 2 | 0, this.width / 2 | 0]
  }

  get tBL(): [number, number] { // y, x
    return [this.font.size, 0]
  }
}
