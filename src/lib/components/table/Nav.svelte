<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'

  import { ModeToggle } from '$lib/components'
  import { cState } from '$lib/contexts'
  import { hex } from '$lib/util'
  import { Font } from 'bdfparser'

  interface Props extends HTMLAttributes<HTMLElement> {
    onchange: (e: Event) => void
    clazz?: string
  }

  const { onchange, clazz = '', ...rest }: Props = $props()
  const st = cState.get()

  let files = $state<FileList>()

  $effect(() => {
    if (!files)
      return
    (async () => {
      const file = await files[0].text()
      const font = await new Font().load_filelines(file.split('\n').values())
      console.log(font)
    })()
  })
</script>

<nav class='{clazz} fixed bottom-0 w-full bg-bg b-(t-1 bord) z-50 h-16 flex' {...rest}>
  <div class='m-auto flex items-center gap-8 container'>
    <!-- TODO: rename on click -->
    <strong>{st.font.name}</strong>

    <select {onchange} bind:value={st.block}>
      <option selected value=''>Font Glyphs</option>
      {#each st.uc.blocks as [name, { i0, i1 }]}
        <option value={name}>
          {name}
          ({hex(i0)}-{hex(i1 - 1)})
        </option>
      {/each}
    </select>

    <!-- TODO: drag-drop -->
    <input type='file' bind:files />

    <!-- TODO: put in settings -->
    <ModeToggle clazz='ml-auto' />
  </div>
</nav>
