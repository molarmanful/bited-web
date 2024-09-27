<script lang='ts'>
  import UC, { type Blocks, type Data } from '$lib/Unicode'

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
    fsz = $derived(16 * this.scale)
    csz = $derived(32)

    constructor() {
      $effect(() => {
        document.body.style.setProperty('--fsz', `${this.fsz}px`)
      })
    }
  }

  const px = new Px()

  class Uc {
    dataA = $state.raw<Data>([])
    data = $derived(new Map(this.dataA))

    blocks = $state.raw<Blocks>(new Map())
    block = $state<string>('all')

    view = $derived.by(() => {
      if (this.block === 'all') {
        return this.dataA
      }

      const block = this.blocks.get(this.block)
      if (block) {
        const [i0, i1] = block

        const res: Data = []
        for (let i = i0; i <= i1; i++) {
          const c = this.data.get(i)
          if (c)
            res.push([i, c])
        }

        return res
      }

      // TODO: glyph view default
      return this.dataA
    })

    constructor() {
      $effect(() => {
        UC.data().then(res => this.dataA = res)
        UC.blocks().then(res => this.blocks = res)
      })
    }
  }

  const uc = new Uc()

  class Virt {
    len = $derived(uc.view.length)

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
    top = $state(0)
    rowT = $derived((scrollY + this.top) / this.gh | 0)
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
        const [k, v] = uc.view[i]

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

    offTop(node: HTMLElement) {
      this.top = node.offsetTop
    }
  }

  const virt = new Virt()
</script>

<svelte:window bind:devicePixelRatio bind:scrollY bind:innerHeight />

{#if uc.view.length}
  <div class='mx-auto my-8 w-fit'>
    <select bind:value={uc.block}>
      <option selected value='all'>Unicode</option>
      {#each uc.blocks.keys() as block}
        <option>{block}</option>
      {/each}
    </select>

    <div
      style:height='{virt.h}px'
      style:width='{virt.w}px'
      class='relative skew-.0000000001 b-(1 black) bg-black'
      use:virt.offTop
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
