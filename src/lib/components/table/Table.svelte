<script lang='ts'>
  import { cState } from '$lib/contexts'
  import Glyph from '$lib/Glyph.svelte'
  import { Range } from '$lib/Uc.svelte'
  import { clickout, hex } from '$lib/util'
  import { SvelteSet } from 'svelte/reactivity'

  interface Props {
    cw: number
  }

  const { cw }: Props = $props()
  const st = cState.get()

  let devicePixelRatio = $state(1)
  let scrollY = $state(0)
  let innerHeight = $state(0)

  class Px {
    dpr = $derived(+devicePixelRatio.toFixed(2))
    dprd = $derived(this.dpr | 0)
    scale = $derived(this.dprd / this.dpr)
    fsz = $derived(16 * this.scale)

    constructor() {
      $effect(() => {
        document.body.style.setProperty('--fsz', `${this.fsz}px`)
      })
    }
  }

  const px = new Px()

  class Virt {
    len = $derived(st.uc.view.length)

    vs = $state(2)
    vw = $derived(st.vw * this.vs * px.scale)
    vh = $derived(px.fsz + 8 + px.scale + this.vw)
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
        const k
          = st.uc.view instanceof Range ? st.uc.view.get(i) : st.uc.view[i]

        res.push({
          x: x * this.gw,
          y: y * this.gh,
          k,
          c: String.fromCodePoint(k),
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

  class Sel {
    pivot = $state(-1)
    endpt = $state(-1)
    ex = new SvelteSet<number>()
    min = $derived(Math.min(this.pivot, this.endpt))
    max = $derived(Math.max(this.pivot, this.endpt))
    on = false

    isSel(k: number) {
      return this.min <= k && k <= this.max && !this.ex.has(k)
    }

    each(f: (k: number) => void) {
      for (let k = this.min; k <= this.max; k++) {
        if (this.ex.has(k))
          continue
        f(k)
      }
    }

    reset() {
      this.end()
      this.pivot = this.endpt = -1
      this.ex.clear()
    }

    start(k: number) {
      this.on = true
      this.pivot = k
      this.endpt = k
    }

    drag(k: number) {
      if (!this.on)
        return
      this.endpt = k
    }

    edit(k: number) {
      if (!this.isSel(k)) {
        this.start(k)
        return
      }
      st.code = k
    }

    end() {
      this.on = false
    }
  }

  const sel = new Sel()
</script>

<svelte:window
  onkeydown={(e) => {
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        sel.each(k => st.font.delete(k))
        sel.reset()
        break
    }
  }}
  onpointerup={() => sel.end()}
  bind:devicePixelRatio
  bind:scrollY
  bind:innerHeight
/>

<select
  onchange={() => sel.reset()}
  bind:value={st.block}
>
  <option selected value=''>Font Glyphs</option>
  {#each st.uc.blocks as [name, { i0, i1 }]}
    <option value={name}>
      {name}
      ({hex(i0)}-{hex(i1 - 1)})
    </option>
  {/each}
</select>

<button onclick={() => {
  const g = new Glyph(st.font, 0)
  g.resize(st.w, st.w)
  g.mat.not()
  g.img(st.w, st.w, () => {
    for (const code of st.uc.view) {
      const g1 = new Glyph(st.font, code)
      g1.mat = g.mat.clone()
      g1.blob = g.blob
      st.font.set(g1)
    }
    console.log('STRESSED')
  })
}}>TEST</button>

{#if st.uc.view.length > 0}
  <div class='mx-auto my-8 w-fit'>
    <div
      style:height='{virt.h}px'
      style:width='{virt.w}px'
      class='relative skew-.0000000001 b-(1 bord) bg-bord'
      use:clickout={() => sel.reset()}
    >
      {#each virt.items as { x, y, k, c } (k)}
        {@const glyph = st.font.get(k)}
        <button
          style:width='{virt.vw}px'
          style:left='{x}px'
          style:top='{y}px'
          class="{sel.isSel(k) ? 'bg-sel' : 'bg-bg'} absolute flex flex-col items-center"
          onclick={() => sel.edit(k)}
        >
          <code style:height='{px.fsz}px' class='uni my-1'>
            {c}
          </code>
          <div class='h-0 w-full b-(t-1 bord)'></div>

          <div
            style:height='{virt.vw}px'
            style:width='{virt.vw}px'
            class="{sel.isSel(k)
              ? 'bg-sel'
              : glyph && glyph.blob
              ? 'bg-bg'
              : 'bg-dis'} "
          >
            {#if glyph && glyph.blob}
              <img
                style:height='{virt.vw}px'
                style:width='{virt.vw}px'
                class='text-transparent image-render-pixel dark:invert'
                alt='Bitmap glyph at Unicode codepoint {k}'
                draggable='false'
                src={URL.createObjectURL(glyph.blob)}
              />
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
{:else}
  <div class='h-screen flex items-center justify-center'>
    no glyphs... yet
  </div>
{/if}
