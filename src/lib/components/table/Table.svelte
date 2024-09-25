<script lang='ts'>
  import umap from '$lib/Unicode'
</script>

{#each umap.entries() as [code, meta]}
  <pre>{code.toString(16).padStart(4, '0')}: {meta.name}</pre>
{/each}
