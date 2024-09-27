<script lang='ts'>
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { Grid, Table } from '$lib/components'
  import { derived } from 'svelte/store'

  let cw = $state(0)

  const pstate = derived<typeof page, App.PageState>(
    page,
    ($page, set) => {
      if (!browser)
        return
      set(history.state['sveltekit:states'] ?? {})
    },
    {},
  )
</script>

<svelte:head>
  <title>bited | Bitmap Font Editor</title>
</svelte:head>

<div class='mx-auto container' bind:clientWidth={cw}>
  {#if $pstate.char !== void 0}
    <Grid char={$pstate.char} />
  {:else}
    <Table cp={$pstate.cp} {cw} />
  {/if}
</div>
