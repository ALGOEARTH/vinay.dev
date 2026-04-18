import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import fs from 'fs/promises'
import path from 'path'
import { findAll, findById, findOne, insert, update, remove, count } from '../services/jsonStore.js'
import { validateCredentials } from '../services/authService.js'
import { verifyToken, requireAdmin, generateToken } from '../middleware/auth.js'
import { DATA_DIR } from '../config/dataPath.js'

const VISITORS_FILE = path.join(DATA_DIR, 'visitors.json')
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json')

const router = Router()

async function logAction(userId, action, details, ip) {
  try {
    await insert('logs', {
      user_id: userId ?? null,
      action,
      details: details ? JSON.stringify(details) : null,
      ip: ip ?? null
    })
  } catch (err) {
    console.error('[admin] logAction error:', err)
  }
}

// POST /api/admin/login
router.post('/login',
  [
    body('username').trim().notEmpty().withMessage('Username required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    try {
      const { username, password } = req.body
      const user = await validateCredentials(username, password)

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' })
      }
      if (user.is_banned) {
        return res.status(403).json({ success: false, message: 'Account banned' })
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      })

      await logAction(user.id, 'LOGIN', { username: user.username }, req.ip)

      return res.json({
        success: true,
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      })
    } catch (err) {
      console.error('[admin/login]', err)
      return res.status(500).json({ success: false, message: 'Server error' })
    }
  }
)

// GET /api/admin/me
router.get('/me', verifyToken, (req, res) => {
  return res.json({ success: true, user: req.user })
})

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    let visitorsData = { count: 0, visits: [] }
    try {
      const raw = await fs.readFile(VISITORS_FILE, 'utf8')
      visitorsData = JSON.parse(raw)
    } catch { /* file may not exist yet */ }

    let contactsData = []
    try {
      const raw = await fs.readFile(CONTACTS_FILE, 'utf8')
      contactsData = JSON.parse(raw)
    } catch { /* file may not exist yet */ }

    const now = new Date()
    const todayStr = now.toDateString()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 6)

    const todayVisits = visitorsData.visits.filter(v => new Date(v.timestamp).toDateString() === todayStr).length
    const weeklyVisits = visitorsData.visits.filter(v => new Date(v.timestamp) >= weekAgo).length

    const chart = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
      const dayStr = d.toDateString()
      const dayCount = visitorsData.visits.filter(v => new Date(v.timestamp).toDateString() === dayStr).length
      chart.push({ label, count: dayCount })
    }

    const usersTotal = count('users')
    const postsTotal = count('posts')
    const postsPublished = findAll('posts').filter(p => p.status === 'published').length
    const guestbookTotal = count('guestbook')

    const allUsers = findAll('users')
    const recentLogs = findAll('logs', { sortBy: 'created_at', desc: true, limit: 15 })
    const recentActivity = recentLogs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      ip: log.ip,
      created_at: log.created_at,
      username: allUsers.find(u => u.id === log.user_id)?.username ?? null
    }))

    return res.json({
      success: true,
      visitors: {
        total: visitorsData.count,
        today: todayVisits,
        weekly: weeklyVisits,
        chart
      },
      contacts: {
        total: contactsData.length,
        recent: contactsData.slice(-5).reverse()
      },
      users: { total: usersTotal },
      posts: { total: postsTotal, published: postsPublished },
      guestbook: { total: guestbookTotal },
      recentActivity
    })
  } catch (err) {
    console.error('[admin/stats]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET /api/admin/users
router.get('/users', requireAdmin, (req, res) => {
  try {
    const users = findAll('users', { sortBy: 'created_at', desc: true })
      .map(({ password_hash, ...u }) => u) // eslint-disable-line no-unused-vars
    return res.json({ success: true, users })
  } catch (err) {
    console.error('[admin/users]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

// PUT /api/admin/users/:id
router.put('/users/:id',
  requireAdmin,
  [
    body('role').optional().isIn(['admin', 'moderator', 'editor', 'user']).withMessage('Invalid role'),
    body('is_banned').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    try {
      const { id } = req.params
      const { role, is_banned } = req.body
      const user = findById('users', id)
      if (!user) return res.status(404).json({ success: false, message: 'User not found' })

      const changes = {}
      if (role !== undefined) changes.role = role
      if (is_banned !== undefined) changes.is_banned = !!is_banned
      await update('users', id, changes)

      await logAction(req.user.id, 'UPDATE_USER', { targetId: id, role, is_banned }, req.ip)
      return res.json({ success: true, message: 'User updated' })
    } catch (err) {
      console.error('[admin/users PUT]', err)
      return res.status(500).json({ success: false, message: 'Server error' })
    }
  }
)

// POST /api/admin/users/:id/reset-password
router.post('/users/:id/reset-password',
  requireAdmin,
  [body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    try {
      const { id } = req.params
      const user = findById('users', id)
      if (!user) return res.status(404).json({ success: false, message: 'User not found' })

      const password_hash = await bcrypt.hash(req.body.newPassword, 10)
      await update('users', id, { password_hash })
      await logAction(req.user.id, 'RESET_PASSWORD', { targetId: id }, req.ip)
      return res.json({ success: true, message: 'Password reset' })
    } catch (err) {
      console.error('[admin/reset-password]', err)
      return res.status(500).json({ success: false, message: 'Server error' })
    }
  }
)

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' })
    }
    const user = findById('users', id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    await remove('users', id)
    await logAction(req.user.id, 'DELETE_USER', { targetId: id }, req.ip)
    return res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    console.error('[admin/users DELETE]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET /api/admin/posts
router.get('/posts', requireAdmin, (req, res) => {
  try {
    const allUsers = findAll('users')
    const posts = findAll('posts', { sortBy: 'created_at', desc: true }).map(post => ({
      ...post,
      author: allUsers.find(u => u.id === post.author_id)?.username ?? null
    }))
    return res.json({ success: true, posts })
  } catch (err) {
    console.error('[admin/posts GET]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

// POST /api/admin/posts
router.post('/posts',
  requireAdmin,
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title required (max 200 chars)'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content required'),
    body('status').isIn(['draft', 'published']).withMessage('Status must be draft or published')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    try {
      const { title, content, status } = req.body
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

      const post = await insert('posts', { title, slug, content, status, author_id: req.user.id })

      await logAction(req.user.id, 'CREATE_POST', { postId: post.id, title }, req.ip)
      return res.status(201).json({ success: true, id: post.id, slug })
    } catch (err) {
      console.error('[admin/posts POST]', err)
      return res.status(500).json({ success: false, message: 'Server error' })
    }
  }
)

// PUT /api/admin/posts/:id
router.put('/posts/:id',
  requireAdmin,
  [
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('content').optional().trim().isLength({ min: 1 }),
    body('status').optional().isIn(['draft', 'published'])
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    try {
      const { id } = req.params
      const post = findById('posts', id)
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

      const { title, content, status } = req.body
      const changes = {}
      if (title !== undefined) changes.title = title
      if (content !== undefined) changes.content = content
      if (status !== undefined) changes.status = status
      await update('posts', id, changes)

      await logAction(req.user.id, 'UPDATE_POST', { postId: id, title, status }, req.ip)
      return res.json({ success: true, message: 'Post updated' })
    } catch (err) {
      console.error('[admin/posts PUT]', err)
      return res.status(500).json({ success: false, message: 'Server error' })
    }
  }
)

// DELETE /api/admin/posts/:id
router.delete('/posts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const post = findById('posts', id)
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

    await remove('posts', id)
    await logAction(req.user.id, 'DELETE_POST', { postId: id }, req.ip)
    return res.json({ success: true, message: 'Post deleted' })
  } catch (err) {
    console.error('[admin/posts DELETE]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET /api/admin/logs
router.get('/logs', requireAdmin, (req, res) => {
  try {
    const allUsers = findAll('users')
    const logs = findAll('logs', { sortBy: 'created_at', desc: true, limit: 100 }).map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      ip: log.ip,
      created_at: log.created_at,
      username: allUsers.find(u => u.id === log.user_id)?.username ?? null
    }))
    return res.json({ success: true, logs })
  } catch (err) {
    console.error('[admin/logs]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router
