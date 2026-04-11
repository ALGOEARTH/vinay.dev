import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDb } from '../db.js'
import { verifyToken, requireAdmin, generateToken } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../data')
const VISITORS_FILE = path.join(DATA_DIR, 'visitors.json')
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json')

const router = Router()

function logAction(userId, action, details, ip) {
  try {
    const db = getDb()
    db.prepare('INSERT INTO logs (user_id, action, details, ip) VALUES (?, ?, ?, ?)').run(
      userId ?? null,
      action,
      details ? JSON.stringify(details) : null,
      ip ?? null
    )
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
      const db = getDb()
      const { username, password } = req.body
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
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

      logAction(user.id, 'LOGIN', { username: user.username }, req.ip)

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
    const db = getDb()

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

    // Build 7-day chart
    const chart = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
      const dayStr = d.toDateString()
      const count = visitorsData.visits.filter(v => new Date(v.timestamp).toDateString() === dayStr).length
      chart.push({ label, count })
    }

    const usersTotal = db.prepare('SELECT COUNT(*) as c FROM users').get().c
    const postsTotal = db.prepare('SELECT COUNT(*) as c FROM posts').get().c
    const postsPublished = db.prepare("SELECT COUNT(*) as c FROM posts WHERE status = 'published'").get().c
    const guestbookTotal = db.prepare('SELECT COUNT(*) as c FROM guestbook').get().c

    const recentActivity = db.prepare(`
      SELECT l.id, l.action, l.details, l.ip, l.created_at, u.username
      FROM logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 15
    `).all()

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
    const db = getDb()
    const users = db.prepare(
      'SELECT id, username, email, role, is_banned, created_at FROM users ORDER BY created_at DESC'
    ).all()
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
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    try {
      const db = getDb()
      const { id } = req.params
      const { role, is_banned } = req.body
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
      if (!user) return res.status(404).json({ success: false, message: 'User not found' })

      if (role !== undefined) db.prepare('UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?').run(role, id)
      if (is_banned !== undefined) db.prepare('UPDATE users SET is_banned = ?, updated_at = datetime("now") WHERE id = ?').run(is_banned ? 1 : 0, id)

      logAction(req.user.id, 'UPDATE_USER', { targetId: id, role, is_banned }, req.ip)
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
      const db = getDb()
      const { id } = req.params
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id)
      if (!user) return res.status(404).json({ success: false, message: 'User not found' })

      const hash = await bcrypt.hash(req.body.newPassword, 10)
      db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?').run(hash, id)
      logAction(req.user.id, 'RESET_PASSWORD', { targetId: id }, req.ip)
      return res.json({ success: true, message: 'Password reset' })
    } catch (err) {
      console.error('[admin/reset-password]', err)
      return res.status(500).json({ success: false, message: 'Server error' })
    }
  }
)

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, (req, res) => {
  try {
    const db = getDb()
    const { id } = req.params
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' })
    }
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    db.prepare('DELETE FROM users WHERE id = ?').run(id)
    logAction(req.user.id, 'DELETE_USER', { targetId: id }, req.ip)
    return res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    console.error('[admin/users DELETE]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET /api/admin/posts
router.get('/posts', requireAdmin, (req, res) => {
  try {
    const db = getDb()
    const posts = db.prepare(`
      SELECT p.*, u.username as author
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
    `).all()
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
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    try {
      const db = getDb()
      const { title, content, status } = req.body
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

      const result = db.prepare(
        'INSERT INTO posts (title, slug, content, status, author_id) VALUES (?, ?, ?, ?, ?)'
      ).run(title, slug, content, status, req.user.id)

      logAction(req.user.id, 'CREATE_POST', { postId: result.lastInsertRowid, title }, req.ip)
      return res.status(201).json({ success: true, id: result.lastInsertRowid, slug })
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
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    try {
      const db = getDb()
      const { id } = req.params
      const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(id)
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

      const { title, content, status } = req.body
      if (title !== undefined) db.prepare('UPDATE posts SET title = ?, updated_at = datetime("now") WHERE id = ?').run(title, id)
      if (content !== undefined) db.prepare('UPDATE posts SET content = ?, updated_at = datetime("now") WHERE id = ?').run(content, id)
      if (status !== undefined) db.prepare('UPDATE posts SET status = ?, updated_at = datetime("now") WHERE id = ?').run(status, id)

      logAction(req.user.id, 'UPDATE_POST', { postId: id, title, status }, req.ip)
      return res.json({ success: true, message: 'Post updated' })
    } catch (err) {
      console.error('[admin/posts PUT]', err)
      return res.status(500).json({ success: false, message: 'Server error' })
    }
  }
)

// DELETE /api/admin/posts/:id
router.delete('/posts/:id', requireAdmin, (req, res) => {
  try {
    const db = getDb()
    const { id } = req.params
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(id)
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

    db.prepare('DELETE FROM posts WHERE id = ?').run(id)
    logAction(req.user.id, 'DELETE_POST', { postId: id }, req.ip)
    return res.json({ success: true, message: 'Post deleted' })
  } catch (err) {
    console.error('[admin/posts DELETE]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET /api/admin/logs
router.get('/logs', requireAdmin, (req, res) => {
  try {
    const db = getDb()
    const logs = db.prepare(`
      SELECT l.id, l.action, l.details, l.ip, l.created_at, u.username
      FROM logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `).all()
    return res.json({ success: true, logs })
  } catch (err) {
    console.error('[admin/logs]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router
