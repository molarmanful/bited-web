import data from '$lib/data.json'

interface Char {
  name: string
  category: string
  mirrored: boolean
}

const umap = new Map(data as [number, Char][])

export default umap
