import data from '$lib/data.json'

export interface Char {
  name: string
  category: string
  mirrored: boolean
}

export default new Map(data as [number, Char][])
