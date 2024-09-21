<script lang='ts'>
  import type { Action } from 'svelte/action'
  import type { HTMLAttributes } from 'svelte/elements'

  import * as PIXI from 'pixi.js'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    clazz?: string
  }

  const xs = $state(20)
  const ys = $state(20)
  const w = $state(16)

  const { clazz = '', ...rest }: Props = $props()

  let innerHeight = $state(0)
  let innerWidth = $state(0)

  const render: Action = (node) => {
    const app = new PIXI.Application()

    ;(async () => {
      await app.init({
        resizeTo: node,
        antialias: false,
      })
      node.appendChild(app.canvas)

      const grid = new PIXI.Container()
      app.stage.addChild(grid)

      const g_tile = new PIXI.Graphics()
        .rect(0, 0, w, w)
        .fill(0xFFFFFF)
        .stroke({ width: 2, color: 0xFF0000, alignment: 0 })
      const tex_tile = app.renderer.generateTexture(g_tile)

      for (let y = 0; y < ys; y++) {
        for (let x = 0; x < xs; x++) {
          const tile = new PIXI.Sprite(tex_tile)
          tile.x = x * w
          tile.y = y * w
          grid.addChild(tile)
        }
      }
    })()
  }
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<div class='{clazz} ' use:render {...rest}></div>
