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
</script>

<!-- TODO: drag-drop -->
<input class='{clazz} ' onchange={() => {
  if (!files?.[0])
    return

  const bdf = new BDF()
  bdf.postMessage(files[0])

  let first = false
  bdf.onmessage = async ({ data }: MessageEvent<FontRes | GlyphRes>) => {
    if (!data)
      return

    if (!first) {
      st.glyphman.clear()
      first = true
    }

    if (Array.isArray(data)) {
      st.glyphman.read(data)
      return
    }

    st.font.read(data)
    st.capture()
  }
}} type='file' bind:files {...rest} />
