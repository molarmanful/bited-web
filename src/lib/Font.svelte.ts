import type { FontSer as Ser } from '$lib/db'
import type { Font as BDFFont } from 'bdfparser'

interface MetaBase {
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

export type Meta = MetaBase & Record<string, string>

export interface Metrics {
  px_size: number
  pt_size: number
  res_x: number
  res_y: number
  // TODO: make sure math checks out for w < 0
  avg_w: number
  cap: number
  x: number
  asc: number
  desc: number
}

interface BDFRes {
  headers: BDFFont['headers']
  props: BDFFont['props']
  glyphs: BDFFont['glyphs']
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
    avg_w: 8,
    cap: 9,
    x: 7,
    asc: 14,
    desc: 2,
  })

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

  size = $derived(this.metrics.asc + this.metrics.desc)

  ser = $derived<Ser>({
    meta: $state.snapshot(this.meta),
    metrics: $state.snapshot(this.metrics),
  })

  deser({ meta, metrics }: Ser) {
    this.useMeta(meta)
    this.useMetrics(metrics)
  }

  read({ headers, props, glyphs }: BDFRes) {
    const num = (s?: string | number | null) => {
      const n = +(s ?? 0)
      return Number.isNaN(n) ? n : 0
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

    // TODO: bbx fallback calc
    this.useMetrics({
      px_size: num(props.pixel_size ?? px_size),
      pt_size: num(props.point_size ?? pt_size),
      res_x: num(headers?.xres ?? props.resolution_x ?? res_x),
      res_y: num(headers?.yres ?? props.resolution_y ?? res_y),
      avg_w: num(props.average_width ?? avg_w),
      cap: num(props.capheight),
      x: num(props.xheight),
      asc: num(props.font_ascent),
      desc: num(props.font_ascent),
    })
  }

  useMeta(meta: Partial<Meta>) {
    for (const k in meta) {
      if (meta[k] == null)
        delete meta[k]
    }
    Object.assign(this.meta, meta)
  }

  useMetrics(metrics: Partial<Metrics>) {
    Object.assign(this.metrics, metrics)
  }
}
