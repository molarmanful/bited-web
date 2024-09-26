<script lang='ts'>
  import type { Action } from 'svelte/action'

  import getUMap from '$lib/Unicode'

  let devicePixelRatio = $state(1)

  const fsz = $derived(16 * (
    devicePixelRatio % 1 < 0.5
      ? 1 / devicePixelRatio
      : devicePixelRatio
  ))

  const csz = $state(32)

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

<svelte:window bind:devicePixelRatio />

{#if umap}
  <div
    style:grid-template-columns='repeat(auto-fit, minmax({csz}px, 1fr))'
    class='grid gap-1px b-(1 black) bg-black'
  >
    {#each [...umap.entries()].slice(0, 1024) as [code]}
      <div class='w-32px flex flex-col items-center bg-white'>
        <code style:height='{fsz}px' class='uni my-1'>
          {String.fromCodePoint(code)}
        </code>
        <div class='h-0 w-full b-(t-1 black)'></div>
        <canvas height={csz} width={csz}></canvas>
      </div>
    {/each}
  </div>
{:else}
  <span>Loading...</span>
{/if}
