<script lang='ts'>
  import type { BDFRes as FontRes } from '$lib/Font.svelte'
  import type { BDFRes as GlyphRes } from '$lib/GlyphMan.svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'

  import { cState } from '$lib/contexts'
  import BDF from '$lib/workers/bdfread?worker'

  interface Props extends HTMLInputAttributes {
    clazz?: string
  }

  const { clazz = '', ...rest }: Props = $props()
  const st = cState.get()

  let files = $state<FileList>()

  $effect(() => {
    if (!files)
      return

    const bdf = new BDF()
    bdf.onmessage = async ({ data }: MessageEvent<FontRes | GlyphRes>) => {
      if (!data)
        return
      if (Array.isArray(data)) {
        st.glyphman.read(data)
        return
      }
      st.font.read(data)
      st.capture()
    }
    bdf.postMessage(files[0])
  })
</script>

<!-- TODO: drag-drop -->
<input class='{clazz} ' type='file' bind:files {...rest} />
