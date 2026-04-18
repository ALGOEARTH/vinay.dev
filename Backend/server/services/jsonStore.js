import fs from 'fs'
import path from 'path'
import { DATA_DIR } from '../config/dataPath.js'

const COLLECTIONS = ['users', 'posts', 'guestbook', 'logs']

// Per-collection mutex (simple boolean spin lock)
const locks = new Map()

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  for (const col of COLLECTIONS) {
    const file = path.join(DATA_DIR, `${col}.json`)
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '[]', 'utf8')
    }
  }
}

// Initialize on module load
ensureDataDir()

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`)
}

function read(collection) {
  try {
    const raw = fs.readFileSync(filePath(collection), 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function atomicWrite(collection, data) {
  const dest = filePath(collection)
  const tmp = dest + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tmp, dest)
}

async function acquireLock(collection) {
  while (locks.get(collection)) {
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  locks.set(collection, true)
}

function releaseLock(collection) {
  locks.set(collection, false)
}

function nextId(arr) {
  if (arr.length === 0) return 1
  return Math.max(...arr.map(i => i.id || 0)) + 1
}

export function findAll(collection, { sortBy, desc: descOrder, limit } = {}) {
  let arr = read(collection)
  if (sortBy) {
    arr = arr.slice().sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return descOrder ? 1 : -1
      if (a[sortBy] > b[sortBy]) return descOrder ? -1 : 1
      return 0
    })
  }
  if (limit) arr = arr.slice(0, limit)
  return arr
}

export function findById(collection, id) {
  const arr = read(collection)
  return arr.find(item => item.id === Number(id)) ?? null
}

export function findOne(collection, predicate) {
  const arr = read(collection)
  return arr.find(predicate) ?? null
}

export async function insert(collection, data) {
  await acquireLock(collection)
  try {
    const arr = read(collection)
    const now = new Date().toISOString()
    const newItem = {
      id: nextId(arr),
      ...data,
      created_at: now,
      updated_at: now
    }
    arr.push(newItem)
    atomicWrite(collection, arr)
    return newItem
  } finally {
    releaseLock(collection)
  }
}

export async function update(collection, id, changes) {
  await acquireLock(collection)
  try {
    const arr = read(collection)
    const idx = arr.findIndex(item => item.id === Number(id))
    if (idx === -1) return null
    arr[idx] = { ...arr[idx], ...changes, updated_at: new Date().toISOString() }
    atomicWrite(collection, arr)
    return arr[idx]
  } finally {
    releaseLock(collection)
  }
}

export async function remove(collection, id) {
  await acquireLock(collection)
  try {
    const arr = read(collection)
    const idx = arr.findIndex(item => item.id === Number(id))
    if (idx === -1) return false
    arr.splice(idx, 1)
    atomicWrite(collection, arr)
    return true
  } finally {
    releaseLock(collection)
  }
}

export function count(collection) {
  return read(collection).length
}
