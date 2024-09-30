/* eslint-disable no-restricted-globals */

import { db } from '$lib/db'

self.onmessage = async ({ data: { font, vscale, scale } }) => {
  await db.transaction('rw', db.st, () => {
    db.st.bulkPut([
      { k: 'font', v: font },
      { k: 'vscale', v: vscale },
      { k: 'scale', v: scale },
    ])
  })
  self.close()
}
