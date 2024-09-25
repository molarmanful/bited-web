import { createReadStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'

const res = []

const rl = createInterface({
  input: createReadStream('static/UnicodeData.txt'),
})

rl.on('line', (line) => {
  /* eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars */
  const [code, name, category, canon, bi, decomp, dec, digit, num, mirrored, name1, upper, lower, title] = line.split(';')

  res.push([+`0x${code}`, {
    // name: name.startsWith('<') ? name1 : name,
    name: name.startsWith('<') && name1 ? name1 : name,
    category,
    mirrored: mirrored === 'Y',
  }])
})

rl.once('close', async () => {
  await writeFile('src/lib/data.json', JSON.stringify(res))
})
