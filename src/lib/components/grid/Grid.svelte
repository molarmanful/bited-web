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

  let xs = $state(man.xs)
  let ys = $state(man.ys)
  let w = $state(man.w)

  const render: Action = (node) => {
    man.init(node)

    return { destroy: () => man.destroy() }
  }
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<form onsubmit={() => {
  man.xs = xs
  man.ys = ys
  man.w = w
  man.gen()
}}>
  <input type='number' bind:value={xs} />
  <input type='number' bind:value={ys} />
  <input type='number' bind:value={w} />
  <button type='submit'>UPDATE</button>
</form>

<button onclick={() => man.undoman.undo()}>UNDO</button>
<button onclick={() => man.undoman.redo()}>REDO</button>

<div class='{clazz} image-render-pixel' use:render {...rest}></div>
