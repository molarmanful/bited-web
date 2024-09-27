import dataURL from '$lib/data.json?url'
import ver from '$lib/ver.js'
import LF from 'localforage'

(async () => {
  const ver_c = await LF.getItem('uarr_ver')
  const cached = await LF.getItem('uarr')

  let data
  if (cached && ver_c === ver) {
    data = cached
  }
  else {
    const res = await fetch(dataURL)
    const json = await res.json()
    data = json
  }

  globalThis.postMessage(data)

  await LF.setItem('uarr', data)
  await LF.setItem('uarr_ver', ver)
})()
