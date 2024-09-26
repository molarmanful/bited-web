<script lang='ts'>
  import type { Snippet } from 'svelte'

  import 'core-js/proposals/set-methods-v2'
  import '@unocss/reset/tailwind-compat.css'
  import 'uno:components.css'
  import '../app.css'
  import 'uno.css'
  import 'uno:utilities.css'

  interface Props {
    children: Snippet
  }

  const { children }: Props = $props()
</script>

{@render children()}
