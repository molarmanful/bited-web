/* eslint-disable no-restricted-globals */

import { db } from '$lib/db'

(async () => {
  const res = await db.transaction('r', db.st, () =>
    db.st.bulkGet(['font', 'vscale', 'scale']))
  const [font, vscale, scale] = res.map(kv => kv?.v)
  self.postMessage({ font, vscale, scale })
  self.close()
})()
