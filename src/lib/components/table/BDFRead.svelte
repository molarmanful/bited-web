<script lang='ts'>
  import type { HTMLInputAttributes } from 'svelte/elements'

  import { cState } from '$lib/contexts'
  import BDF from '$lib/workers/bdfread?worker'
  import { Font } from 'bdfparser'

  interface Props extends HTMLInputAttributes {
    clazz?: string
  }

  interface BDFRes {
    headers: Font['headers']
    props: Font['props']
    glyphs: Font['glyphs']
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
      console.log(data)
      const { headers, props, glyphs } = data
      st.font.deser({
        name:
          props.family_name ?? headers?.fontname.match(/^-.+?-(.+?)-/)?.[1],
        metrics: {
          cap: +(props?.capheight ?? 0),
          x: +(props?.xheight ?? 0),
          asc: 14,
          desc: 2,
          width: 8,
        },
      })
    // TODO: load glyphs
    }

    bdf.postMessage(files[0])
  })
</script>

<!-- TODO: drag-drop -->
<input class='{clazz} ' type='file' bind:files {...rest} />
