import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE_DATA_DIR = path.resolve(__dirname, 'data')
const TEST_DATA_DIR = path.join(os.tmpdir(), 'vinay-dev-backend-test-data')

process.env.DATA_DIR = TEST_DATA_DIR

fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true })
fs.mkdirSync(TEST_DATA_DIR, { recursive: true })

for (const name of ['users.json', 'posts.json', 'guestbook.json', 'logs.json', 'contacts.json', 'visitors.json']) {
  const source = path.join(SOURCE_DATA_DIR, name)
  const target = path.join(TEST_DATA_DIR, name)
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target)
    continue
  }

  const fallback = name === 'visitors.json' ? { count: 0, visits: [] } : []
  fs.writeFileSync(target, JSON.stringify(fallback, null, 2), 'utf8')
}
