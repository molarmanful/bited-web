<script lang='ts'>
  import type { HTMLButtonAttributes } from 'svelte/elements'

  import { mode, toggleMode } from 'mode-watcher'

  interface Props extends HTMLButtonAttributes {
    clazz?: string
  }

  const { clazz = '', ...rest }: Props = $props()
</script>

<button class='{clazz} p-2! uni pxhack' onclick={toggleMode} {...rest}>
  {$mode === 'dark' ? '🌛︎︎' : '🌞︎︎'}
  <span class='sr-only'>Set to {$mode ?? 'dark'} mode</span>
</button>
