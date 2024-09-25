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

  let rw = $state(0)

  const render: Action = (node) => {
    man.init(node)

    return { destroy: () => man.destroy() }
  }

  const mpx: Action = (node) => {
    $effect(() => {
      if (!innerWidth || !rw)
        return

      node.style.paddingTop = node.style.paddingLeft = '0'
      const { x, y } = node.getBoundingClientRect()
      node.style.paddingTop = `${1 - (y % 1)}px`
      node.style.paddingLeft = `${1 - (x % 1)}px`
      console.log(x, y, node.style.paddingLeft, node.style.paddingTop)
    })
  }
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<div class='flex flex-col items-center'>
  <div>
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
  </div>

  <div
    class='{clazz} image-render-pixel cursor-crosshair mx-auto'
    bind:clientWidth={rw}
    use:mpx
    use:render
    {...rest}
  ></div>
</div>
