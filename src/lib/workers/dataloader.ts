/* eslint-disable no-restricted-globals */

import { type Char, db } from '$lib/db'
import blocksURL from '$lib/uc/blocks.json?url'
import dataURL from '$lib/uc/data.json?url'
import ver from '$lib/uc/ver.js'

(async () => {
  const [ver_c, blocks_c] = await db.uc.bulkGet(['ver', 'blocks'])

  let data: Char[] = []
  let blocks: [string, [number, number]][]
  let mustcache = false

  if (ver_c?.v === ver && blocks_c?.v) {
    blocks = blocks_c.v
  }
  else {
    [blocks, data] = await Promise.all(
      [blocksURL, dataURL].map(async url => await (await fetch(url)).json()),
    )
    mustcache = true
  }

  self.postMessage({ blocks })

  if (mustcache) {
    await db.transaction('rw', db.uc, db.ucdata, async () => {
      await Promise.all([
        db.uc.clear(),
        db.ucdata.clear(),
      ])

      db.uc.bulkPut([
        { k: 'blocks', v: blocks },
        { k: 'ver', v: ver },
      ])

      db.ucdata.bulkPut(data)
    })
  }

  self.close()
})()
