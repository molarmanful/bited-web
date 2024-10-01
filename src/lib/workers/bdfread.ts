/* eslint-disable no-restricted-globals */

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

  for (const glyph of font.iterglyphs()) {
    if (!glyph)
      continue
    const { meta } = glyph
    self.postMessage([meta.codepoint, meta])
  }

  self.close()
}
