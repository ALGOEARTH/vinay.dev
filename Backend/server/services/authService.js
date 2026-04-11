import bcrypt from 'bcryptjs'
import { findOne, insert, findAll } from './jsonStore.js'

export async function validateCredentials(username, password) {
  const user = findOne('users', u => u.username === username && !u.is_banned)
  if (!user) return null
  const match = await bcrypt.compare(password, user.password_hash)
  return match ? user : null
}

export async function createUser({ username, email, password, role }) {
  const password_hash = await bcrypt.hash(password, 10)
  return insert('users', { username, email, password_hash, role, is_banned: false })
}

export async function seedAdminUser() {
  const admins = findAll('users').filter(u => u.role === 'admin')
  if (admins.length > 0) return

  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'Admin@1234'
  const email = process.env.ADMIN_EMAIL || 'admin@vinay.dev'

  await createUser({ username, email, password, role: 'admin' })
  console.log('[authService] Default admin user created.')
}
