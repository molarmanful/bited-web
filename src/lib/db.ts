import type { Meta, Metrics, Misc } from '$lib/Font.svelte'

import Dexie, { type EntityTable } from 'dexie'

interface KV {
  k: string
  v: any
}

export interface Char {
  code: number
  name: string
  category: string
  mirrored: boolean
}

export interface StateSer {
  font: FontSer
  vscale: number
  scale: number
}

export interface FontSer {
  meta: Meta
  metrics: Metrics
  misc: Misc
}

export interface GlyphSer {
  code: number
  width: number
  blob: Blob | null
  mat: SBMSer
}

export interface SBMSer {
  ks: Set<string>
  size: [number, number]
}

export const db = new Dexie('bited') as Dexie & {
  uc: EntityTable<KV, 'k'>
  ucdata: EntityTable<Char, 'code'>
  st: EntityTable<KV, 'k'>
  glyphs: EntityTable<GlyphSer, 'code'>
}

db.version(1).stores({
  uc: 'k, v',
  ucdata: 'code, name, category, mirrored',
  st: 'k, v',
  glyphs: 'code, width, blob, mat',
})
