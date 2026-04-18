import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { validateCredentials, createUser, seedAdminUser } from '../services/authService.js'
import { findAll, update } from '../services/jsonStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

const RUN_ID = Date.now()
const TEST_USERNAME = `testuser_${RUN_ID}`
const TEST_EMAIL = `test_${RUN_ID}@example.com`
const TEST_PASSWORD = 'TestPass@999'

let createdUserId = null

beforeAll(async () => {
  const user = await createUser({
    username: TEST_USERNAME,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    role: 'user'
  })
  createdUserId = user.id
})

afterAll(() => {
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
    const filtered = users.filter(
      u => !String(u.username).startsWith('testuser_') && !String(u.username).startsWith('created_')
    )
    fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 2), 'utf8')
  } catch { /* ignore */ }
})

describe('authService', () => {
  it('seedAdminUser creates admin if none exists', async () => {
    const usersFile = USERS_FILE
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
    const noAdmins = users.filter(u => u.role !== 'admin')
    fs.writeFileSync(usersFile, JSON.stringify(noAdmins, null, 2), 'utf8')

    await seedAdminUser()

    const allUsers = findAll('users')
    const admins = allUsers.filter(u => u.role === 'admin')
    expect(admins.length).toBeGreaterThanOrEqual(1)
  })

  it('validateCredentials returns user on correct password', async () => {
    const user = await validateCredentials(TEST_USERNAME, TEST_PASSWORD)
    expect(user).not.toBeNull()
    expect(user.username).toBe(TEST_USERNAME)
  })

  it('validateCredentials returns null on wrong password', async () => {
    const user = await validateCredentials(TEST_USERNAME, 'WrongPassword!')
    expect(user).toBeNull()
  })

  it('validateCredentials returns null for banned user', async () => {
    await update('users', createdUserId, { is_banned: true })
    const user = await validateCredentials(TEST_USERNAME, TEST_PASSWORD)
    expect(user).toBeNull()
    await update('users', createdUserId, { is_banned: false })
  })

  it('validateCredentials returns null for non-existent user', async () => {
    const user = await validateCredentials('nobody_xyz_123', 'anything')
    expect(user).toBeNull()
  })

  it('createUser creates user with hashed password', async () => {
    const uniqueName = `created_${Date.now()}`
    const user = await createUser({
      username: uniqueName,
      email: `${uniqueName}@test.com`,
      password: 'Secret123!',
      role: 'user'
    })
    expect(user.username).toBe(uniqueName)
    expect(user.password_hash).toBeDefined()
    expect(user.password_hash).not.toBe('Secret123!')
    expect(user.is_banned).toBe(false)
  })
})
