import * as PIXI from 'pixi.js'

export default class GridMan {
  xs = $state(20)
  ys = $state(20)
  w = $state(15)
  bw = 1
  on = false
  paintable = false
  app?: PIXI.Application
  grid?: PIXI.Container
  tiles: PIXI.Sprite[] = []

  #w1 = $derived(this.w + this.bw)
  #tex_tile?: PIXI.Texture
  #down = false
  #tint = 0x000000

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

  listen() {
    this.grid
      ?.on('pointerdown', ({ screen: { x, y } }) => {
        this.#down = true
        this.paint(x, y, true)
      })
      .on('pointerup', () => {
        this.#down = false
      })
      .on('pointermove', ({ screen: { x, y } }) => {
        if (!this.#down)
          return
        this.paint(x, y)
      })
  }

  paint(x: number, y: number, first = false) {
    if (!this.paintable)
      return

    x = x - this.bw
    y = y - this.bw
    const i = (y / this.#w1 | 0) * this.xs + (x / this.#w1 | 0)

    if (first) {
      this.tiles[i].tint ^= 0xFFFFFF
      this.#tint = this.tiles[i].tint
      return
    }
    this.tiles[i].tint = this.#tint
  }

  gen() {
    this.paintable = false
    this.grid?.removeChildren()
    this.tiles = []

    for (let y = 0; y < this.ys; y++) {
      for (let x = 0; x < this.xs; x++) {
        const tile = new PIXI.Sprite({
          texture: this.#tex_tile,
          scale: this.w,
        })

        tile.x = x * this.#w1 + this.bw
        tile.y = y * this.#w1 + this.bw

        this.grid?.addChild(tile)
        this.tiles.push(tile)
      }
    }

    this.paintable = true
  }
}
