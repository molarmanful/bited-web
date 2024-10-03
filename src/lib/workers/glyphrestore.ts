/* eslint-disable no-restricted-globals */

import { db, type GlyphSer } from '$lib/db'

(async () => {
  let now = Date.now()
  let res: GlyphSer[] = []

  await db.transaction('r', db.glyphs, async () => {
    self.postMessage(await db.glyphs.count())

    await db.glyphs.each((g) => {
      res.push(g)

      if (Date.now() - now > 10) {
        self.postMessage(res)
        res = []
        now = Date.now()
      }
    })
  })

  self.postMessage(res)
  self.postMessage('DONE')
  self.close()
})()
