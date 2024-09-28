<script lang='ts'>
  import type { Snapshot } from './$types'

  import { Grid, Table } from '$lib/components'
  import { cState } from '$lib/contexts'
  import State from '$lib/State.svelte'

  let cw = $state(0)

  const st = new State()
  cState.set(st)
  $inspect(st)

  export const snapshot: Snapshot<{
    char: State['char']
    block: State['block']
  }> = {
    capture: () => ({
      char: st.char,
      block: st.block,
    }),
    restore(x) {
      st.char = x.char
      st.block = x.block
    },
  }
</script>

<svelte:head>
  <title>bited | Bitmap Font Editor</title>
</svelte:head>

<div class='mx-auto container' bind:clientWidth={cw}>
  {#if st.char >= 0}
    <Grid />
  {:else}
    <Table {cw} />
  {/if}
</div>
