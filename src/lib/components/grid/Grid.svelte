<script lang='ts'>
  import type { Action } from 'svelte/action'
  import type { HTMLAttributes } from 'svelte/elements'

  import GridMan from './GridMan.svelte'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    clazz?: string
  }

  const { clazz = '', ...rest }: Props = $props()

  let innerHeight = $state(0)
  let innerWidth = $state(0)

  const man = new GridMan()

  let xs = $state(man.xs)
  let ys = $state(man.ys)
  let w = $state(man.w)

  const render: Action = (node) => {
    man.init(node)
  }
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<input type='number' bind:value={xs} />
<input type='number' bind:value={ys} />
<input type='number' bind:value={w} />
<button onclick={() => {
  man.xs = xs
  man.ys = ys
  man.w = w
  man.gen()
}}>UPDATE</button>

<div class='{clazz} image-render-pixel' use:render {...rest}></div>
