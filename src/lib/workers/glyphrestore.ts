/* eslint-disable no-restricted-globals */

import { db } from '$lib/db'

(async () => {
  const res = await db.transaction('r', db.glyphs, () => db.glyphs.toArray())
  self.postMessage(res)
  self.close()
})()
