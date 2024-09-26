<script lang='ts'>
  import type { Action } from 'svelte/action'

  import getUMap from '$lib/Unicode'

  let umap = $state<Awaited<ReturnType<typeof getUMap>>>()

  $effect(() => {
    getUMap().then((res) => {
      umap = res
    })
  })

  const perf: Action = (node) => {
    const abort = new AbortController()
    const f = () => {
      const { x, y } = node.getBoundingClientRect()
      node.style.transform = `translate(${-x % 1}px, ${-y % 1}px)`
    }

    f()
    addEventListener('resize', f, { signal: abort.signal })

    return { destroy: () => abort.abort() }
  }
</script>

{#if umap}
  <div
    style:grid-template-columns='repeat(auto-fit, minmax(40px, 1fr))'
    class='grid gap-1px b-(1 black) bg-black'
  >
    {#each [...umap.entries()].slice(0, 1024) as [code]}
      <div class='flex flex-col items-center bg-white'>
        <code class='uni my-1 h-16px'>
          {String.fromCodePoint(code)}
        </code>
        <div class='h-0 w-full b-(t-1 black)'></div>
        <canvas class='my-1 b-(1 red)' height='32' width='32'></canvas>
      </div>
    {/each}
  </div>
{:else}
  <span>Loading...</span>
{/if}
