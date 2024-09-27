import blocksURL from '$lib/uc/blocks.json?url'
import dataURL from '$lib/uc/data.json?url'
import DataLoader from '$lib/workers/dataloader?worker'

interface Char {
  name: string
  category: string
  mirrored: boolean
}

export type Data = [number, Char][]
export type Blocks = Record<string, [number, number]>

const load = <T>(name: string, url: string) => () => new Promise<T>((res) => {
  const l = new DataLoader()
  l.postMessage({ name, url })
  l.onmessage = ({ data }) => res(data as T)
})

export default {
  data: load<Data>('uc_data', dataURL),
  blocks: load<Blocks>('uc_blocks', blocksURL),
}
