<script lang='ts'>
  import type { Action } from 'svelte/action'

  import umap from '$lib/Unicode'

  const perf: Action = (node) => {
    const abort = new AbortController()
    const f = () => {
      const { x } = node.getBoundingClientRect()
      node.style.transform = `translateX(${-x % 1}px)`
    }

    f()
    addEventListener('resize', f, { signal: abort.signal })

    return { destroy: () => abort.abort() }
  }
</script>

<div
  style:grid-template-columns='repeat(auto-fill, minmax(40px, 1fr))'
  class='grid gap-1px b-(1 black) bg-black'
>
  {#if umap}
    {#each umap.entries() as [code]}
      <div class='flex flex-col items-center bg-white'>
        <code class='uni my-1 h-16px' use:perf>
          {String.fromCodePoint(code)}
        </code>
        <div class='h-0 w-full b-(t-1 black)'></div>
        <canvas class='my-1 b-(1 red)' height='32' width='32'></canvas>
      </div>
    {/each}
  {/if}
</div>
