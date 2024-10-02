/* eslint-disable no-restricted-globals */

import { db } from '$lib/db'

const [cmd, alive] = self.name.split(' ')

self.onmessage = async ({ data }) => {
  await db.transaction('rw', db.glyphs, () => {
    switch (cmd) {
      case 'put':
        db.glyphs.bulkPut(data)
        break

      case 'del':
        db.glyphs.bulkDelete(data)
        break
    }
  })

  if (!alive)
    self.close()
}
