/* eslint-disable no-restricted-globals */
import { $Font } from 'bdfparser'

const stream = async function* (file: File) {
  const reader = file.stream().getReader()
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
  const font = await $Font(stream(data))
  self.postMessage({
    length: font.length,
    headers: font.headers,
    props: font.props,
    glyphs: font.glyphs,
  })
  self.close()
}
