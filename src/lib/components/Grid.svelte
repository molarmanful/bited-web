<script lang='ts'>
  import type { Action } from 'svelte/action'
  import type { HTMLAttributes } from 'svelte/elements'

  import * as PIXI from 'pixi.js'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    clazz?: string
  }

  const xs = $state(20)
  const ys = $state(20)
  const w = $state(15)

  const { clazz = '', ...rest }: Props = $props()

  let innerHeight = $state(0)
  let innerWidth = $state(0)

  const render: Action = (node) => {
    const app = new PIXI.Application()

    ;(async () => {
      await app.init({
        resizeTo: node,
        antialias: false,
        background: 0xAAAAAA,
      })
      node.appendChild(app.canvas)

      const grid = new PIXI.Container({
        interactive: true,
      })
      app.stage.addChild(grid)

      const tiles: PIXI.Sprite[] = []

      const g_tile = new PIXI.Graphics().rect(0, 0, 1, 1).fill(0xFFFFFF)
      const tex_tile = app.renderer.generateTexture(g_tile)

      const bw = 1
      const w1 = w + bw
      for (let y = 0; y < ys; y++) {
        for (let x = 0; x < xs; x++) {
          const tile = new PIXI.Sprite({
            texture: tex_tile,
            scale: w,
          })
          tile.x = x * w1 + bw
          tile.y = y * w1 + bw
          grid.addChild(tile)
          tiles.push(tile)
        }
      }

      let down = false
      let tint = 0x000000

      const paint = (x: number, y: number, first = false) => {
        x = x - bw
        y = y - bw
        const i = (y / w1 | 0) * xs + (x / w1 | 0)
        if (first) {
          tiles[i].tint ^= 0xFFFFFF
          tint = tiles[i].tint
          return
        }
        tiles[i].tint = tint
      }

      grid
        .on('pointerdown', ({ screen: { x, y } }) => {
          down = true
          paint(x, y, true)
        })
        .on('pointerup', () => {
          down = false
        })
        .on('pointermove', ({ screen: { x, y } }) => {
          if (!down)
            return
          paint(x, y)
        })
    })()
  }
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<div class='{clazz} image-render-pixel' use:render {...rest}></div>
