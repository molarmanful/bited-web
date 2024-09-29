import DataLoader from '$lib/workers/dataloader?worker'

export interface Res {
  blocks: [string, [number, number]][]
}

export default () => new Promise<Res>((res) => {
  const l = new DataLoader()
  l.onmessage = ({ data: { blocks } }) => res({ blocks })
})
