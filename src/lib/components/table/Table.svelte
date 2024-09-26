<script lang='ts'>
  import type { Action } from 'svelte/action'

  import getUMap from '$lib/Unicode'

  let dpr_ = $state(1)
  const dpr = $derived(+dpr_.toFixed(2))
  const dprd = $derived(dpr % 1)
  const scale = $derived(dprd > 0 && dprd < 1 ? 1 / dpr : 1)
  const fsz = $derived(16 * scale)
  const csz = $derived(32)

  $inspect(dpr, scale, fsz)

  $effect(() => {
    document.body.style.setProperty('--fsz', `${fsz}px`)
  })

  let umap = $state<Awaited<ReturnType<typeof getUMap>>>()

  $effect(() => {
    getUMap().then((res) => {
      umap = res
    })
  })

  const perf: Action = (node) => {
    const abort = new AbortController()
    const f = () => {
      requestAnimationFrame(() => {
        const { x, y } = node.getBoundingClientRect()
        node.style.transform = `translate(${-x % 1}px, ${-y % 1}px)`
      })
    }

    f()
    addEventListener('resize', f, { signal: abort.signal })

    return { destroy: () => abort.abort() }
  }
</script>

<svelte:window bind:devicePixelRatio={dpr_} />

{#if umap}
  <div
    style:grid-template-columns='repeat(auto-fill, {csz}px)'
    class='grid justify-center gap-1px b-(1 black) bg-black'
  >
    {#each [...umap.entries()].slice(0, 1024) as [code]}
      <div style:width='{csz}px' class='flex flex-col items-center bg-white'>
        <code style:height='{fsz}px' class='uni my-1'>
          {String.fromCodePoint(code)}
        </code>
        <div class='h-0 w-full b-(t-1 black)'></div>
        <canvas class='bg-slate-300' height={csz} width={csz}></canvas>
      </div>
    {/each}
  </div>
{:else}
  <span>Loading...</span>
{/if}
