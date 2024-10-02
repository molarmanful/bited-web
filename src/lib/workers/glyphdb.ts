/* eslint-disable no-restricted-globals */

import { db } from '$lib/db'

const [cmd, alive] = self.name.split(' ')
let close = false

self.onmessage = async ({ data }) => {
  if (data === 'CLOSE') {
    close = true
    return
  }

  await db.transaction('rw', db.glyphs, () => {
    switch (cmd) {
      case 'put':
        db.glyphs.bulkPut(data)
        break

      case 'del':
        db.glyphs.bulkDelete(data)
        break

      case 'clr':
        db.glyphs.clear()
        break
    }
  })

  if (!alive || close)
    self.close()
}
