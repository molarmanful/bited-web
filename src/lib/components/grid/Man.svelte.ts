import SBM from '$lib/SBM'
import * as PIXI from 'pixi.js'

import Font from './Font'
import Glyph from './Glyph'
import Op from './Op'
import Tool from './Tool'
import UndoMan from './UndoMan'

export default class Man {
  on = false
  // TODO: scale based on glyph bounds
  scale = $state(4)
  w = $derived(8 * this.scale)
  pw = $state(12)
  bw = 1
  paintable = false

  app = new PIXI.Application()
  grid = new PIXI.Container()
  lines = new PIXI.Container()
  tiles: PIXI.Sprite[] = []

  font = new Font()
  // TODO: remove
  glyph = new Glyph(this.font, 'test')
  mat = new SBM()
  undoman = new UndoMan(this)
  tool?: Tool
  op = new Op(this)

  #tex_tile?: PIXI.Texture

  async init(node: HTMLElement) {
    await this.app.init({
      antialias: false,
      background: 0xDDDDDD,
    })

    // TODO: remove
    this.glyph.width = 8

    node.appendChild(this.app.canvas)

    this.grid.interactive = true
    this.app.stage.addChild(this.grid)
    this.app.stage.addChild(this.lines)

    this.listen()

    const g_tile = new PIXI.Graphics().rect(0, 0, 1, 1).fill(0xFFFFFF)
    this.#tex_tile = this.app.renderer.generateTexture(g_tile)

    this.gen()

    this.on = true
  }

  destroy() {
    this.unlisten()
    this.app?.destroy({
      removeView: true,
    }, {
      children: true,
      texture: true,
      textureSource: true,
      context: true,
    })
  }

  listen() {
    const up = () => {
      if (!this.tool)
        return
      this.undoman.act(this.tool.diff)
      this.tool = void 0
    }

    this.grid
      .on('pointerdown', ({ screen: { x, y } }) => {
        if (this.tool)
          return
        this.tool = new Tool(this)
        this.tool.pen(x, y, true)
      })

      .on('pointerup', up)
      .on('pointerupoutside', up)

      .on('pointermove', ({ screen: { x, y } }) => {
        if (!this.tool)
          return
        x = Math.max(0, Math.min(this.grid.width - this.bw, x))
        y = Math.max(0, Math.min(this.grid.height - this.bw, y))
        this.tool.pen(x, y)
      })
  }

  unlisten() {
    this.grid
      .off('pointerdown')
      .off('pointerup')
      .off('pointerupoutside')
      .off('pointermove')
  }

  gen() {
    this.grid.removeChildren()
    this.lines.removeChildren()
    this.tiles = []

    this.mat.resize(this.w, this.w)

    const [dy, dx] = this.tr
    let [bly, blx] = this.glyph.tBL
    bly += dy
    blx += dx
    const [oy, ox] = [bly - this.font.metrics.desc, blx]

    const ww = this.w * this.pw

    const hline = (y: number, tint: number, b = 0) => {
      this.lines.addChild(
        new PIXI.Sprite({
          texture: this.#tex_tile,
          height: this.bw + b,
          width: ww,
          y,
          tint,
        }),
      )
    }

    const vline = (x: number, tint: number, b = 0) => {
      this.lines.addChild(
        new PIXI.Sprite({
          texture: this.#tex_tile,
          height: ww,
          width: this.bw + b,
          x,
          tint,
        }),
      )
    }

    const htints = new Map([
      [oy, 0x000000],
      [oy - this.font.metrics.asc, 0xFF0000],
      [oy - this.font.metrics.cap, 0xFFAA00],
      [oy - this.font.metrics.x, 0xFFAA00],
      [bly, 0x00CCCC],
    ])

    const vtints = new Map([
      [ox, 0x000000],
      [ox + this.glyph.width, 0x00CC00],
    ])

    for (let y = 0; y < this.w; y++) {
      const yw = y * this.pw

      hline(yw, 0xDDDDDD)
      vline(yw, 0xDDDDDD)

      for (let x = 0; x < this.w; x++) {
        const xw = x * this.pw

        const tile = new PIXI.Sprite({
          texture: this.#tex_tile,
          scale: this.pw,
          x: xw,
          y: yw,
          tint: +!this.mat.get(y, x) * 0xFFFFFF,
        })

        this.grid.addChild(tile)
        this.tiles.push(tile)
      }
    }

    for (const [k, v] of htints.entries()) hline(k * this.pw, v)
    for (const [k, v] of vtints.entries()) vline(k * this.pw, v)

    this.app.renderer.resize(this.grid.width + this.bw, this.grid.height + this.bw)
  }

  get tr() {
    const [cy, cx] = this.glyph.tCenter
    const [y, x] = [this.w / 2 | 0, this.w / 2 | 0]
    return [y - cy, x - cx]
  }
}
