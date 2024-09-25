import * as PIXI from 'pixi.js'

import Font from './Font'
import Glyph from './Glyph'
import Op from './Op'
import Tool from './Tool'
import UndoMan from './UndoMan'

type Mode = 'pen' | 'line'

interface Handlers {
  down?: (tool: Tool, x: number, y: number) => void
  move?: (tool: Tool, x: number, y: number) => void
  up?: (tool: Tool, x: number, y: number) => void
}

export default class Man {
  on = false
  // TODO: scale based on glyph bounds
  scale = $state(4)
  w = $derived(8 * this.scale)
  pw = $state(12)
  odd = $state(0)
  bw = 1
  mode = $state<Mode>('pen')

  app = new PIXI.Application()
  grid = new PIXI.Container()
  lines = new PIXI.Container()
  tiles: PIXI.Sprite[] = []
  resize = () => {
    this.odd = this.app.renderer.width % 2
  }

  font = new Font()
  // TODO: remove
  glyph = new Glyph(this.font, 'test')
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
    const clamp = (x: number, y: number): [number, number] => [
      Math.max(0, Math.min(this.grid.width - this.bw, x)),
      Math.max(0, Math.min(this.grid.height - this.bw, y)),
    ]

    const up = ({ screen: { x, y } }: PIXI.FederatedPointerEvent) => {
      if (!this.tool)
        return
      [x, y] = clamp(x, y)
      this.handlers.up?.(this.tool, x, y)
      this.undoman.act(this.tool.diff)
      this.tool = void 0
    }

    this.app.renderer.on('resize', this.resize)
    addEventListener('resize', this.resize)

    this.grid
      .on('pointerdown', ({ screen: { x, y } }) => {
        if (this.tool)
          return
        this.tool = new Tool(this)
        this.handlers.down?.(this.tool, x, y)
      })

      .on('pointermove', ({ screen: { x, y } }) => {
        if (!this.tool)
          return
        [x, y] = clamp(x, y)
        this.handlers.move?.(this.tool, x, y)
      })

      .on('pointerup', up)
      .on('pointerupoutside', up)
  }

  get handlers() {
    const handlers: Record<Mode, Handlers> = {
      pen: {
        down(tool, x, y) { tool.pen(x, y, true) },
        move(tool, x, y) { tool.pen(x, y) },
      },
      line: {
        down(tool, x, y) { tool.line(x, y, true) },
        move(tool, x, y) { tool.line(x, y) },
        up(tool, x, y) { tool.line(x, y, false, true) },
      },
    }

    return handlers[this.mode]
  }

  unlisten() {
    this.app.renderer.off('resize')
    removeEventListener('resize', this.resize)
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

    const [oy0, ox0] = this.glyph.origin
    this.glyph.mat.resize(this.w, this.w)

    const [bly] = this.glyph.cornerBL
    const [oy, ox] = this.glyph.origin
    this.glyph.mat.translate(oy - oy0, ox - ox0)

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
          tint: +!this.glyph.mat.get(y, x) * 0xFFFFFF,
        })

        this.grid.addChild(tile)
        this.tiles.push(tile)
      }
    }

    for (const [k, v] of vtints.entries()) vline(k * this.pw, v)
    for (const [k, v] of htints.entries()) hline(k * this.pw, v)

    this.app.renderer.resize(this.grid.width + this.bw, this.grid.height + this.bw)
  }

  retint() {
    for (const i_ in this.tiles) {
      const i = +i_
      const x = i % this.w
      const y = i / this.w | 0
      this.tiles[i].tint = +!this.glyph.mat.get(y, x) * 0xFFFFFF
    }
  }
}
