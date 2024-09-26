import dataURL from '$lib/data.json?url'
import LF from 'localforage'

(async () => {
  const cached = await LF.getItem('umap')
  let data
  if (cached) {
    data = cached
  }
  else {
    const res = await fetch(dataURL)
    const json = await res.json()
    await LF.setItem('umap', json)
    data = json
  }

  globalThis.postMessage(data)
})()
