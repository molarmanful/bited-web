<script lang='ts'>
  import type { BDFRes } from '$lib/Font.svelte'
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
    bdf.onmessage = ({ data }: MessageEvent<BDFRes>) => {
      if (!data)
        return
      st.font.read(data)
    }

    bdf.postMessage(files[0])
  })
</script>

<!-- TODO: drag-drop -->
<input class='{clazz} ' type='file' bind:files {...rest} />
