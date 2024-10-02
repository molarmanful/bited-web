<script lang='ts'>
  import type { Snapshot } from './$types'

  import { Grid, Table } from '$lib/components'
  import { cState } from '$lib/contexts'
  import State from '$lib/State.svelte'

  const st = new State()
  cState.set(st)

  export const snapshot: Snapshot<{
    code: State['code']
    block: State['block']
  }> = {
    capture: () => ({
      code: st.code,
      block: st.block,
    }),
    restore(x) {
      st.code = x.code
      st.block = x.block
    },
  }
</script>

<svelte:head>
  <title>bited | Bitmap Font Designer</title>
</svelte:head>

{#if st.ready && st.uc.ready}
  {#if st.code >= 0}
    <Grid />
  {:else}
    <Table />
  {/if}
{:else}
  <div class='h-screen flex items-center justify-center'>
    loading{#if !st.ready}
      &nbsp;save data
    {:else if !st.uc.ready}
      &nbsp;unicode data
    {/if}...
  </div>
{/if}
