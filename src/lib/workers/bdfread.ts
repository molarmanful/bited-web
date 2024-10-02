/* eslint-disable no-restricted-globals */

import type { BDFRes } from '$lib/GlyphMan.svelte'

import { $Font } from 'bdfparser'

// damn you safari
const lineStream = async function* (stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8')
  let carry = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done)
      break

    carry += decoder.decode(value, { stream: true })
    const lines = carry.split(/\r?\n/)
    carry = lines.pop() || ''

    for (const line of lines) yield line
  }

  if (carry)
    yield carry
}

self.onmessage = async ({ data }) => {
  const font = await $Font(lineStream(data.stream()))

  self.postMessage({
    length: font.length,
    headers: font.headers,
    props: font.props,
  })

  let res: BDFRes = []
  let now = Date.now()
  for (const glyph of font.iterglyphs()) {
    if (!glyph)
      continue

    const { meta } = glyph
    const ks = new Set<string>()

    for (const [y, h] of meta.hexdata.entries()) {
      let b = BigInt(`0x${h}`)
      for (let x = h.length * 4; x-- > 0 && b;) {
        if (b & 1n)
          ks.add(`${y} ${x}`)
        b >>= 1n
      }
    }

    res.push([meta.codepoint, meta, ks])

    if (Date.now() - now > 10) {
      self.postMessage(res)
      res = []
      now = Date.now()
    }
  }

  self.postMessage(res)
  self.close()
}
