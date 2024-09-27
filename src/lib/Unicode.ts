import DataLoader from '$lib/dataloader?worker'

export interface Char {
  name: string
  category: string
  mirrored: boolean
}

export default () => {
  const loader = new DataLoader()

  return new Promise<[number, Char][]>((res) => {
    loader.onmessage = ({ data }) => {
      res(data as [number, Char][])
    }
  })
}
