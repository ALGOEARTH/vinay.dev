import { describe, it, expect, afterEach, beforeEach } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { insert, findAll, findById, findOne, update, remove, count } from '../services/jsonStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data')

const TEST_COL = 'test'

function clearTestCollection() {
  const file = path.join(DATA_DIR, `${TEST_COL}.json`)
  if (fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf8')
}

beforeEach(() => {
  clearTestCollection()
})

afterEach(() => {
  clearTestCollection()
})

describe('jsonStore', () => {
  it('insert returns item with id=1 and created_at', async () => {
    const item = await insert(TEST_COL, { name: 'Alice', value: 42 })
    expect(item.id).toBe(1)
    expect(item.name).toBe('Alice')
    expect(item.value).toBe(42)
    expect(typeof item.created_at).toBe('string')
    expect(typeof item.updated_at).toBe('string')
  })

  it('findAll returns all items', async () => {
    await insert(TEST_COL, { name: 'A' })
    await insert(TEST_COL, { name: 'B' })
    const all = findAll(TEST_COL)
    expect(all).toHaveLength(2)
  })

  it('findById finds by id', async () => {
    const item = await insert(TEST_COL, { name: 'findMe' })
    const found = findById(TEST_COL, item.id)
    expect(found).not.toBeNull()
    expect(found.name).toBe('findMe')
  })

  it('findById returns null for missing id', async () => {
    const found = findById(TEST_COL, 9999)
    expect(found).toBeNull()
  })

  it('findOne finds by predicate', async () => {
    await insert(TEST_COL, { name: 'Alice' })
    await insert(TEST_COL, { name: 'Bob' })
    const found = findOne(TEST_COL, item => item.name === 'Bob')
    expect(found).not.toBeNull()
    expect(found.name).toBe('Bob')
  })

  it('findOne returns null when no match', async () => {
    await insert(TEST_COL, { name: 'Alice' })
    const found = findOne(TEST_COL, item => item.name === 'Nobody')
    expect(found).toBeNull()
  })

  it('update changes fields and updates updated_at', async () => {
    const item = await insert(TEST_COL, { name: 'original', score: 1 })
    const originalUpdated = item.updated_at

    await new Promise(r => setTimeout(r, 5))
    const updated = await update(TEST_COL, item.id, { name: 'changed', score: 99 })

    expect(updated.name).toBe('changed')
    expect(updated.score).toBe(99)
    expect(updated.updated_at).not.toBe(originalUpdated)
  })

  it('update returns null for missing item', async () => {
    const result = await update(TEST_COL, 9999, { name: 'x' })
    expect(result).toBeNull()
  })

  it('remove deletes item and returns true', async () => {
    const item = await insert(TEST_COL, { name: 'toDelete' })
    const result = await remove(TEST_COL, item.id)
    expect(result).toBe(true)
    expect(findById(TEST_COL, item.id)).toBeNull()
  })

  it('remove returns false for missing item', async () => {
    const result = await remove(TEST_COL, 9999)
    expect(result).toBe(false)
  })

  it('count returns correct number', async () => {
    expect(count(TEST_COL)).toBe(0)
    await insert(TEST_COL, { x: 1 })
    await insert(TEST_COL, { x: 2 })
    expect(count(TEST_COL)).toBe(2)
  })

  it('sequential inserts get incrementing ids', async () => {
    const a = await insert(TEST_COL, { n: 1 })
    const b = await insert(TEST_COL, { n: 2 })
    const c = await insert(TEST_COL, { n: 3 })
    expect(a.id).toBe(1)
    expect(b.id).toBe(2)
    expect(c.id).toBe(3)
  })
})
