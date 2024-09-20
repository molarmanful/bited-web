<script lang='ts'>
  import type { Snippet } from 'svelte'

  import 'uno:components.css'
  import 'uno.css'
  import '../app.css'
  import 'uno:utilities.css'

  interface Props {
    children: Snippet
  }

  const { children }: Props = $props()
</script>

{@render children()}
