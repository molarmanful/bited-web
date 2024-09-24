<script lang='ts'>
  import type { Action } from 'svelte/action'
  import type { HTMLAttributes } from 'svelte/elements'

  import Man from './Man.svelte'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    clazz?: string
  }

  const { clazz = '', ...rest }: Props = $props()

  let innerHeight = $state(0)
  let innerWidth = $state(0)

  const man = new Man()

  let scale = $state(man.scale)
  let pw = $state(man.pw)

  const render: Action = (node) => {
    man.init(node)

    return { destroy: () => man.destroy() }
  }
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<form onsubmit={() => {
  man.scale = scale
  man.pw = pw
  man.gen()
}}>
  <input min={(man.font.size + 15) >> 3} type='number' bind:value={scale} />
  <input min='4' step='4' type='number' bind:value={pw} />
  <button type='submit'>UPDATE</button>
</form>

<button onclick={() => man.op.debug()}>DEBUG</button>
<button onclick={() => man.undoman.undo()}>UNDO</button>
<button onclick={() => man.undoman.redo()}>REDO</button>
<button onclick={() => man.op.transpose()}>TRANSPOSE</button>
<button onclick={() => man.op.flipX()}>FLIPX</button>
<button onclick={() => man.op.flipY()}>FLIPY</button>
<button onclick={() => man.op.rotCW()}>CW</button>
<button onclick={() => man.op.rotCCW()}>CCW</button>

<div class='{clazz} image-render-pixel cursor-crosshair' use:render {...rest}></div>
