<script lang='ts'>
  import umap from '$lib/Unicode'
</script>

<div
  style:grid-template-columns='repeat(auto-fill, minmax(8ch, 1fr))'
  class='grid gap-1px b-(1 black) bg-black [&>*]:(bg-white p-1 text-center)'
>
  {#each umap.entries() as [code]}
    <div>
      {code.toString(16).padStart(4, '0')}
      <br>
      <code class='whitespace-pre-wrap text-2xl'>{String.fromCodePoint(code)}</code>
    </div>
  {/each}
</div>
