import type { Ser as SBMSer } from '$lib/SBM'

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

export interface GlyphSer {
  code: number
  width: number
  blob: Blob | null
  mat: SBMSer
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
