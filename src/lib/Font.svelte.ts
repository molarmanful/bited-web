import type { FontSer as Ser } from '$lib/db'
import type { Font as BDFFont } from 'bdfparser'

export interface Meta {
  foundry: string
  family: string
  weight: string
  slant: 'R' | 'I' | 'O' | 'RI' | 'RO'
  setwidth: string
  add_style: string
  spacing: 'P' | 'M' | 'C'
  ch_reg: string
  ch_enc: string
}

// TODO: support METRICSSET, DWIDTH1, VVECTOR

export interface Metrics {
  px_size: number
  pt_size: number
  res_x: number
  res_y: number
  // TODO: make sure math checks out for w < 0
  avg_w: number

  dw_x: number
  dw_y: number

  cap_h: number
  x_h: number
  asc: number
  desc: number
}

export type Misc = Record<string, string>

export interface BDFRes {
  headers: BDFFont['headers']
  props: BDFFont['props']
  glyphs: BDFFont['glyphs']
}

const clean = <T>(o: Record<string, T | null | undefined>) => {
  for (const k in o) {
    if (o[k] == null)
      delete o[k]
  }
  return o as Record<string, T>
}

export default class Font {
  meta = $state<Meta>({
    foundry: 'bited',
    family: 'NEW FONT',
    weight: 'Medium',
    slant: 'R',
    setwidth: 'Normal',
    add_style: '',
    spacing: 'P',
    ch_reg: 'ISO10646',
    ch_enc: '1',
  })

  metrics = $state<Metrics>({
    px_size: 16,
    pt_size: 150,
    res_x: 75,
    res_y: 75,
    avg_w: 80,

    dw_x: 8,
    dw_y: 0,

    cap_h: 9,
    x_h: 7,
    asc: 14,
    desc: 2,
  })

  misc = $state<Misc>({})

  font = $derived(`-${[
    this.meta.foundry,
    this.meta.family,
    this.meta.weight,
    this.meta.slant,
    this.meta.setwidth,
    this.meta.add_style,
    this.metrics.px_size,
    this.metrics.pt_size,
    this.metrics.res_x,
    this.metrics.res_y,
    this.meta.spacing,
    this.metrics.avg_w,
    this.meta.ch_reg,
    this.meta.ch_enc,
  ].join('-')}`)

  size = $derived(this.metrics.px_size || this.metrics.asc + this.metrics.desc)

  ser = $derived<Ser>({
    meta: $state.snapshot(this.meta),
    metrics: $state.snapshot(this.metrics),
    misc: $state.snapshot(this.misc),
  })

  deser({ meta, metrics }: Ser) {
    this.useMeta(meta)
    this.useMetrics(metrics)
  }

  read({ headers, props }: BDFRes) {
    const num = (s?: string | number | null) => {
      const n = +(s ?? 0)
      return Number.isNaN(n) ? 0 : n
    }

    const [
      foundry,
      family,
      weight,
      slant,
      setwidth,
      add_style,
      px_size,
      pt_size,
      res_x,
      res_y,
      spacing,
      avg_w,
      ch_reg,
      ch_enc,
    ] = (headers?.fontname ?? '').split('-').slice(1)

    this.useMeta({
      foundry: props.foundry ?? foundry,
      family: props.family_name ?? family,
      weight: props.weight_name ?? weight,
      slant: (props.slant ?? slant)?.toUpperCase() as Meta['slant'] | undefined,
      setwidth: props.setwidth_name ?? setwidth,
      add_style: props.add_style_name ?? add_style,
      spacing: (props.spacing ?? spacing)?.toUpperCase() as Meta['spacing'] | undefined,
      ch_reg: props.charset_registry ?? ch_reg,
      ch_enc: props.charset_encoding ?? ch_enc,
    })

    const h = num(props.pixel_size ?? px_size ?? headers?.fbby)
    const desc = Math.max(0, num(props.font_descent ?? Math.abs(num(headers?.fbbyoff))))
    const avg_w1 = num(props.average_width ?? avg_w?.replace('~', '-'))

    this.useMetrics({
      px_size: h,
      pt_size: num(props.point_size ?? pt_size),
      res_x: num(headers?.xres ?? props.resolution_x ?? res_x),
      res_y: num(headers?.yres ?? props.resolution_y ?? res_y),
      avg_w: avg_w1,

      dw_x: headers?.dwx0 ?? Math.round(avg_w1 / 10),
      dw_y: num(headers?.dwy0),

      cap_h: num(props.cap_height),
      x_h: num(props.x_height),
      asc: Math.max(0, num(props.font_ascent ?? h - desc)),
      desc: num(desc),
    })

    // god hath forsaken us
    const purge
      = [...`${this.read}`.matchAll(/props\s*\.\s*(\w+)/g)]
        .map(([, x]) => x)

    const misc = { ...props }
    for (const k in misc) {
      if (purge.includes(k))
        delete misc[k]
    }

    this.useMisc(misc)
  }

  useMeta(meta: Partial<Meta>) {
    Object.assign(this.meta, clean(meta))
  }

  useMetrics(metrics: Partial<Metrics>) {
    Object.assign(this.metrics, clean(metrics))
  }

  useMisc(misc: BDFFont['props']) {
    Object.assign(this.misc, clean(misc))
  }
}
