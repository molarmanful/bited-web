import { writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'

const toStream = async url => Readable.fromWeb((await fetch(url)).body)

const getData = async () => {
  const rl = createInterface({
    input: await toStream('https://unicode.org/Public/UNIDATA/UnicodeData.txt'),
  })

  const a = []
  for await (const line of rl) {
    /* eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars */
    const [code, name, category, canon, bi, decomp, dec, digit, num, mirrored, name1, upper, lower, title]
      = line.split(';')

    a.push([+`0x${code}`, {
      // name: name.startsWith('<') ? name1 : name,
      name: name.startsWith('<') && name1 ? name1 : name,
      category,
      mirrored: mirrored === 'Y',
    }])
  }

  await writeFile('src/lib/data.json', JSON.stringify(a))
}

const getBlocks = async () => {
  const rl = createInterface({
    input: await toStream('https://unicode.org/Public/UNIDATA/Blocks.txt'),
  })

  const a = []
  for await (const line of rl) {
    if (line.startsWith('#') || /^\s*$/.test(line))
      continue

    const [range, name] = line.split('; ')
    const [start, end] = range.split('..')

    a.push([+`0x${start}`, +`0x${end}` + 1, name])
  }

  await writeFile('src/lib/blocks.json', JSON.stringify(a))
}

await getData()
await getBlocks()
await writeFile('src/lib/ver.js', `export default ${Date.now()}`)
