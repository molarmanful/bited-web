<script lang='ts'>
  import getUArr from '$lib/Unicode'

  interface Props {
    cw: number
  }

  const { cw }: Props = $props()

  let devicePixelRatio = $state(1)
  let scrollY = $state(0)
  let innerHeight = $state(0)

  class Px {
    dpr = $derived(+devicePixelRatio.toFixed(2))
    dprd = $derived(this.dpr | 0)
    scale = $derived(this.dprd / this.dpr)
    comp = $state(0)
    fsz = $derived(16 * this.scale)
    csz = $derived(32)
  }

  const px = new Px()

  $effect(() => {
    document.body.style.setProperty('--fsz', `${px.fsz}px`)
  })

  let uarr = $state.raw<Awaited<ReturnType<typeof getUArr>>>([])

  $effect(() => {
    getUArr().then((res) => {
      uarr = res
    })
  })

  class Virt {
    len = $derived(uarr.length)

    vh = $derived(px.fsz + 8 + px.scale + px.csz)
    vw = $derived(px.csz)
    gap = $derived(px.scale)
    gh = $derived(this.vh + this.gap)
    gw = $derived(this.vw + this.gap)

    cols = $derived(cw / this.gw | 0)
    rows = $derived(Math.ceil(this.len / this.cols))
    h = $derived(this.rows * this.gh + this.gap)
    w = $derived(this.cols * this.gw + this.gap)

    rowD = $derived(Math.ceil(innerHeight / this.gh))
    rowS = $derived(Math.ceil(this.rowD))
    rowT = $derived(scrollY / this.gh | 0)
    rowB = $derived(this.rowT + this.rowD)
    row0 = $derived(Math.max(0, this.rowT - this.rowS))
    row1 = $derived(Math.min(this.len, this.rowB + this.rowS))

    i0 = $derived(this.row0 * this.cols)
    i1 = $derived(Math.min(this.row1 * (this.cols + 1), this.len))

    items = $derived.by(() => {
      const res = []
      let x = 0
      let y = this.row0

      for (let i = this.i0; i < this.i1; i++) {
        const [k, v] = uarr[i]

        res.push({
          x: x * this.gw,
          y: y * this.gh,
          k,
          v,
        })

        x++
        if (x >= this.cols) {
          x = 0
          y++
        }
      }

      return res
    })
  }

  const virt = new Virt()
</script>

<svelte:window bind:devicePixelRatio bind:scrollY bind:innerHeight />

{#if uarr.length}
  <div class='mx-auto my-4 w-fit'>
    <div
      style:height='{virt.h}px'
      style:width='{virt.w}px'
      class='relative skew-.0000000001 b-(1 black) bg-black'
    >
      {#each virt.items as { x, y, k } (k)}
        <div
          style:width='{virt.vw}px'
          style:left='{x}px'
          style:top='{y}px'
          class='absolute flex flex-col items-center bg-white'
        >
          <code style:height='{px.fsz}px' class='uni my-1'>
            {String.fromCodePoint(k)}
          </code>
          <div class='h-0 w-full b-(t-1 black)'></div>
          <canvas class='bg-slate-300' height={virt.vw} width={virt.vw}></canvas>
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class='h-screen flex items-center justify-center'>
    Loading...
  </div>
{/if}
