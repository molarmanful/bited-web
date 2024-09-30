<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'

  import { ModeToggle } from '$lib/components'
  import { cState } from '$lib/contexts'
  import { hex } from '$lib/util'

  interface Props extends HTMLAttributes<HTMLElement> {
    onchange: (e: Event) => void
    clazz?: string
  }

  const { onchange, clazz = '', ...rest }: Props = $props()
  const st = cState.get()
</script>

<nav class='{clazz} fixed bottom-0 w-full bg-bg b-(t-1 bord) z-50 h-16 flex' {...rest}>
  <div class='m-auto flex items-center gap-8 container'>
    <!-- TODO: rename on click -->
    <strong class='max-w-15ch w-fit overflow-hidden text-ellipsis whitespace-nowrap'>
      {st.font.meta.family}
    </strong>

    <select {onchange} bind:value={st.block}>
      <option selected value=''>Font Glyphs</option>
      {#each st.uc.blocks as [name, { i0, i1 }]}
        <option value={name}>
          {name}
          ({hex(i0)}-{hex(i1 - 1)})
        </option>
      {/each}
    </select>

    <!-- TODO: put in settings -->
    <ModeToggle clazz='ml-auto' />
  </div>
</nav>
