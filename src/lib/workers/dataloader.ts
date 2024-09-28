/* eslint-disable no-restricted-globals */

import ver from '$lib/uc/ver.js'
import LF from 'localforage'

self.onmessage = ({ data: { name, url } }) => {
  (async () => {
    const ver_c = await LF.getItem('uc_ver')
    const cached = await LF.getItem(name)

    let data
    if (cached && ver_c === ver) {
      data = cached
    }
    else {
      const res = await fetch(url)
      const json = await res.json()
      data = json
    }

    self.postMessage(data)

    await LF.setItem(name, data)
    await LF.setItem('uc_ver', ver)

    self.close()
  })()
}
