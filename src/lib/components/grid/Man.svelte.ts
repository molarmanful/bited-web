import SBM from '$lib/SBM'
import * as PIXI from 'pixi.js'

import Font from './Font.svelte'
import Op from './Op.svelte'
import Tool from './Tool.svelte'
import UndoMan from './UndoMan.svelte'

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
  mat = new SBM()
  undoman = new UndoMan(this)
  tool?: Tool
  op = new Op(this)

  #tex_tile?: PIXI.Texture

  async init(node: HTMLElement) {
    await this.app.init({
      antialias: false,
      background: 0xAAAAAA,
    })

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

    for (let y = 0; y < this.w; y++) {
      const yw = y * this.pw
      const ww = this.w * this.pw

      const hline = new PIXI.Sprite({
        texture: this.#tex_tile,
        height: this.bw,
        width: ww,
        y: yw,
        tint: 0xAAAAAA,
      })
      const vline = new PIXI.Sprite({
        texture: this.#tex_tile,
        height: ww,
        width: this.bw,
        x: yw,
        tint: 0xAAAAAA,
      })
      this.lines.addChild(hline)
      this.lines.addChild(vline)

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

    this.app.renderer.resize(this.grid.width + this.bw, this.grid.height + this.bw)
  }
}
