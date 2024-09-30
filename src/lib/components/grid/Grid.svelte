<script lang='ts'>
  import type { Action } from 'svelte/action'

  import { cState } from '$lib/contexts'
  import { db } from '$lib/db'
  import { liveQ } from '$lib/util'

  import Man from './Man.svelte'

  const st = cState.get()

  let innerHeight = $state(0)
  let innerWidth = $state(0)

  const man = new Man(st)

  let scale = $state(st.scale)
  let pw = $state(man.pw)

  const metaQ = liveQ(() =>
    db.transaction('r', db.ucdata, () => db.ucdata.get(st.code)),
  )
  const meta = $derived(metaQ.current)

  const render: Action = (node) => {
    man.init(node)
    return { destroy: () => man.destroy() }
  }
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<div class='h-screen flex flex-col items-center'>
  <div>
    <form onsubmit={() => {
      st.scale = scale
      man.pw = pw
      man.gen()
    }}>
      <input min={(man.font.size + 15) >> 3} required type='number' bind:value={scale} />
      <input min='4' required step='4' type='number' bind:value={pw} />
      <button type='submit'>UPDATE</button>
    </form>

    <button onclick={() => st.code = -1}>TABLE</button>

    <button onclick={() => man.undoman.undo()}>UNDO</button>
    <button onclick={() => man.undoman.redo()}>REDO</button>

    <button onclick={() => man.op.clear()}>CLEAR</button>
    <button onclick={() => man.op.transpose()}>TRANSPOSE</button>
    <button onclick={() => man.op.flipX()}>FLIPX</button>
    <button onclick={() => man.op.flipY()}>FLIPY</button>
    <button onclick={() => man.op.rotCW()}>CW</button>
    <button onclick={() => man.op.rotCCW()}>CCW</button>

    <button onclick={() => man.mode = 'pen'}>PEN</button>
    <button onclick={() => man.mode = 'line'}>LINE</button>
  </div>

  {#if meta}
    <div class='font-mono'>
      U+{st.code.toString(16).padStart(4, '0')}&nbsp;
      {meta.category}&nbsp;
      {meta.name}
    </div>
  {/if}

  <div
    style:padding-top='{man.odd}px'
    style:padding-left='{man.odd}px'
    class='m-auto cursor-crosshair overflow-auto'
    use:render
  ></div>
</div>
