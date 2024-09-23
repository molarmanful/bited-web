import SBM from '$lib/SBM'
import * as PIXI from 'pixi.js'

import Tool from './Tool.svelte'
import UndoMan from './UndoMan.svelte'

export default class Man {
  on = false
  xs = $state(20)
  ys = $state(20)
  w = $state(15)
  bw = 1
  w1 = $derived(this.w + this.bw)
  paintable = false
  app?: PIXI.Application
  grid?: PIXI.Container
  tiles: PIXI.Sprite[] = []
  mat = new SBM()
  undoman = new UndoMan(this)
  tool?: Tool

  #tex_tile?: PIXI.Texture

  async init(node: HTMLElement) {
    this.app = new PIXI.Application()
    await this.app.init({
      resizeTo: node,
      antialias: false,
      background: 0xAAAAAA,
    })

    node.appendChild(this.app.canvas)

    this.grid = new PIXI.Container({
      interactive: true,
    })
    this.app.stage.addChild(this.grid)

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
    this.grid
      ?.on('pointerdown', ({ screen: { x, y } }) => {
        if (this.tool)
          return
        this.tool = new Tool(this)
        this.tool.pen(x, y, true)
      })
      .on('pointerup', () => {
        if (!this.tool)
          return
        this.undoman.act(this.tool.diff)
        this.tool = void 0
      })
      .on('pointermove', ({ screen: { x, y } }) => {
        if (!this.tool)
          return
        this.tool.pen(x, y)
      })
  }

  unlisten() {
    this.grid?.off('pointerdown').off('pointerup').off('pointermove')
  }

  gen() {
    this.grid?.removeChildren()
    this.tiles = []

    this.mat.resize(this.xs, this.ys)

    for (let y = 0; y < this.ys; y++) {
      for (let x = 0; x < this.xs; x++) {
        const tile = new PIXI.Sprite({
          texture: this.#tex_tile,
          scale: this.w,
        })

        tile.x = x * this.w1 + this.bw
        tile.y = y * this.w1 + this.bw
        tile.tint = +!this.mat.get(x, y) * 0xFFFFFF

        this.grid?.addChild(tile)
        this.tiles.push(tile)
      }
    }
  }
}
