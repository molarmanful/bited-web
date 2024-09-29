import type Font from '$lib/Font.svelte'
import type Glyph from '$lib/Glyph.svelte'
import type State from '$lib/State.svelte'

import { used } from '$lib/util'
import { mode as dmode } from 'mode-watcher'
import * as PIXI from 'pixi.js'

import Op from './Op'
import Tool from './Tool'
import UndoMan from './UndoMan.svelte'

type Mode = 'pen' | 'line'

interface Handlers {
  down?: (tool: Tool, x: number, y: number) => void
  move?: (tool: Tool, x: number, y: number) => void
  up?: (tool: Tool, x: number, y: number) => void
}

export default class Man {
  st: State
  font: Font
  glyph: Glyph

  on = $state(false)
  pw = $state(12)
  odd = $state(0)
  bw = 1
  mode = $state<Mode>('pen')

  dark = $state(false)

  app = new PIXI.Application()
  grid = new PIXI.Container()
  lines = new PIXI.Container()
  tiles: PIXI.Sprite[] = []
  undoman = new UndoMan(this)
  tool?: Tool
  op = new Op(this)
  abort = new AbortController()

  #tex_tile?: PIXI.Texture

  theme = $derived({
    bg: this.dark ? 0x000000 : 0xFFFFFF,
    fg: this.dark ? 0xFFFFFF : 0x000000,
    bord: this.dark ? 0x171717 : 0xD4D4D4,
    origin: this.dark ? 0x525252 : 0x000000,
    asc: this.dark ? 0x831843 : 0xEC4899,
    cap: this.dark ? 0x7F1D1D : 0xF97316,
    x: this.dark ? 0x713F12 : 0xEAB308,
    desc: this.dark ? 0x164E63 : 0x06B6D4,
    w: this.dark ? 0x14532D : 0x22C55E,
  })

  handlers = $derived.by(() => {
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
  })

  constructor(st: State) {
    this.st = st
    this.font = this.st.font
    this.glyph = this.font.getF(this.st.code)

    dmode.subscribe(x => this.dark = x === 'dark')

    $effect(() => {
      if (!this.on)
        return
      used(this.dark)
      this.gen(false)
    })
  }

  async init(node: HTMLElement) {
    await this.app.init({
      antialias: false,
      background: this.theme.bord,
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

    this.app.renderer.on('resize', () => this.resize())
    addEventListener('resize', () => this.resize(), {
      signal: this.abort.signal,
    })

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

  unlisten() {
    this.app.renderer.off('resize')
    this.abort.abort()
    this.grid
      .off('pointerdown')
      .off('pointerup')
      .off('pointerupoutside')
      .off('pointermove')
  }

  gen(hard = true) {
    this.lines.removeChildren()
    if (hard) {
      this.grid.removeChildren()
      this.tiles = []
    }
    else {
      this.retint()
    }

    this.glyph.resize(this.st.w, this.st.w)
    const [bly] = this.glyph.cornerBL
    const [oy, ox] = this.glyph.origin

    const ww = this.st.w * this.pw

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

    // TODO: convert to dark mode

    const htints = new Map([
      [oy - this.font.metrics.asc, this.theme.asc],
      [oy - this.font.metrics.cap, this.theme.cap],
      [oy - this.font.metrics.x, this.theme.x],
      [bly, this.theme.desc],
      [oy, this.theme.origin],
    ])

    const vtints = new Map([
      [ox + this.glyph.width, this.theme.w],
      [ox, this.theme.origin],
    ])

    for (let y = 0; y < this.st.w; y++) {
      const yw = y * this.pw

      hline(yw, this.theme.bord)
      vline(yw, this.theme.bord)

      if (!hard)
        continue

      for (let x = 0; x < this.st.w; x++) {
        const xw = x * this.pw

        const tile = new PIXI.Sprite({
          texture: this.#tex_tile,
          scale: this.pw,
          x: xw,
          y: yw,
          tint: this.cellColor(y, x),
        })

        this.grid.addChild(tile)
        this.tiles.push(tile)
      }
    }

    for (const [k, v] of htints.entries()) hline(k * this.pw, v)
    for (const [k, v] of vtints.entries()) vline(k * this.pw, v)

    this.app.renderer.resize(this.grid.width + this.bw, this.grid.height + this.bw)
    this.app.renderer.background.color = this.theme.bord
  }

  retint() {
    for (const i_ in this.tiles) {
      const i = +i_
      const x = i % this.st.w
      const y = i / this.st.w | 0
      this.tiles[i].tint = this.cellColor(y, x)
    }
  }

  cellColor(y: number, x: number) {
    return this.glyph.mat.get(y, x) ? this.theme.fg : this.theme.bg
  }

  resize() {
    this.odd = this.app.renderer.width & 1
  }
}
