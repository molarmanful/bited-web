import DataLoader from '$lib/dataloader?worker'

export interface Char {
  name: string
  category: string
  mirrored: boolean
}

export default () => {
  const loader = new DataLoader()

  return new Promise((res) => {
    loader.onmessage = ({ data }) => {
      loader.terminate()
      res(new Map(data as [number, Char][]))
    }
  })
}
