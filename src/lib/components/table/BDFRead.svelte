<script lang='ts'>
  import type { BDFRes as FontRes } from '$lib/Font.svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'

  import { cState } from '$lib/contexts'
  import { type BDFRes as GlyphRes, Reader } from '$lib/GlyphMan.svelte'
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

  let first = true

  const reader = new Reader(st.glyphman)

  bdf.onmessage = ({ data }: MessageEvent<FontRes | GlyphRes>) => {
    if (!data)
      return

    if (first) {
      st.glyphman.clear()
      first = false
    }

    if (Array.isArray(data)) {
      reader.read(data)
      return
    }

    st.font.read(data)
    st.vscale = st.vscale_min
    st.scale = st.vscale_min + 1
    st.capture()
  }
}} type='file' bind:files {...rest} />
