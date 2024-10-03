/* eslint-disable no-restricted-globals */

import { db, type GlyphSer } from '$lib/db'

(async () => {
  let now = Date.now()
  let res: GlyphSer[] = []

  await db.transaction('r', db.glyphs, () =>
    db.glyphs.each((g) => {
      res.push(g)
      console.log('start')

      if (Date.now() - now > 10) {
        self.postMessage(res)
        res = []
        now = Date.now()
        console.log('next')
      }
    }))

  self.postMessage(res)
  self.postMessage('DONE')
  console.log('done')
  self.close()
})()
