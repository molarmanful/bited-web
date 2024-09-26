<script lang='ts'>
  import { Grid, Table } from '$lib/components'

  let cw = $state(0)
</script>

<div class='mx-auto container' bind:clientWidth={cw}>
  <Table {cw} />
</div>
