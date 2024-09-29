/* eslint-disable no-restricted-globals */

import { db } from '$lib/db'

self.onmessage = ({ data: { font, vscale, scale } }) => (async () => {
  await db.transaction('rw', db.st, () => {
    db.st.bulkPut([
      { k: 'font', v: font },
      { k: 'vscale', v: vscale },
      { k: 'scale', v: scale },
    ])
  })
})()
