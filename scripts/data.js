import { writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'

const toStream = async url => Readable.fromWeb((await fetch(url)).body)

const more = `
000000..00FFFF; Unicode (BMP)
010000..01FFFF; Unicode (SMP)
020000..02FFFF; Unicode (SIP)
030000..03FFFF; Unicode (TIP)
040000..04FFFF; Unicode (Plane 4)
050000..05FFFF; Unicode (Plane 5)
060000..06FFFF; Unicode (Plane 6)
070000..07FFFF; Unicode (Plane 7)
080000..08FFFF; Unicode (Plane 8)
090000..09FFFF; Unicode (Plane 9)
0A0000..0AFFFF; Unicode (Plane 10)
0B0000..0BFFFF; Unicode (Plane 11)
0C0000..0CFFFF; Unicode (Plane 12)
0D0000..0DFFFF; Unicode (Plane 13)
0E0000..0EFFFF; Unicode (SSP)
000000..10FFFF; Unicode (Full)
`.split('\n')

const getData = async () => {
  const lines = createInterface({
    input: await toStream('https://unicode.org/Public/UNIDATA/UnicodeData.txt'),
  })

  const a = []
  for await (const line of lines) {
    /* eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars */
    const [code, name, category, canon, bi, decomp, dec, digit, num, mirrored, name1, upper, lower, title]
      = line.split(';')
    a.push({
      code: +`0x${code}`,
      name: name.startsWith('<') && name1 ? name1 : name,
      category,
      mirrored: mirrored === 'Y',
    })
  }

  await writeFile('src/lib/uc/data.json', JSON.stringify(a))
}

const getBlocks = async () => {
  const lines = createInterface({
    input: await toStream('https://unicode.org/Public/UNIDATA/Blocks.txt'),
  })

  const a = []
  const f = (line) => {
    if (line.startsWith('#') || /^\s*$/.test(line))
      return
    const [range, name] = line.split('; ')
    const [start, end] = range.split('..')
    a.push([name, [+`0x${start}`, +`0x${end}` + 1]])
  }

  for await (const line of lines) f(line)
  for (const line of more) f(line)

  await writeFile('src/lib/uc/blocks.json', JSON.stringify(a))
}

await getData()
await getBlocks()
await writeFile('src/lib/uc/ver.js', `export default ${Date.now()}`)
