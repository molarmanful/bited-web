/* eslint-disable no-restricted-globals */

import { db } from '$lib/db'

self.onmessage = async ({ data }) => {
  await db.transaction('rw', db.glyphs, () => {
    switch (self.name) {
      case 'put':
        db.glyphs.bulkPut(data)
        break

      case 'del':
        db.glyphs.bulkDelete(data)
        break
    }
  })

  self.close()
}
