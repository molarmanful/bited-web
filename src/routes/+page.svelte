<script lang='ts'>
  import type { Snapshot } from './$types'

  import { Grid, Table } from '$lib/components'
  import { cState } from '$lib/contexts'
  import State from '$lib/State.svelte'
  import { toggleMode } from 'mode-watcher'

  let cw = $state(0)

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

<div class='mx-auto container' bind:clientWidth={cw}>
  <button onclick={toggleMode}>TOGGLE</button>

  {#if st.uc.ready}
    {#if st.code >= 0}
      <Grid />
    {:else}
      <Table {cw} />
    {/if}
  {:else}
    <div class='h-screen flex items-center justify-center'>
      loading...
    </div>
  {/if}
</div>
