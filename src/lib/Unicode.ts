import DataLoader from '$lib/workers/dataloader?worker'

export interface Res {
  blocks: Map<string, [number, number]>
  codes: Set<number>
}

export default () => new Promise<Res>((res) => {
  const l = new DataLoader()
  l.onmessage = ({ data: { blocks, codes } }) => {
    res({
      blocks: new Map(blocks),
      codes: new Set(codes),
    })
  }
})
