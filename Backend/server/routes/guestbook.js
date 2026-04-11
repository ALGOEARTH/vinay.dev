import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { body, validationResult } from 'express-validator'
import { getDb } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

const guestbookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { success: false, message: 'Rate limit: only 3 guestbook entries per hour per IP.' }
})

// GET /api/guestbook
router.get('/', (req, res) => {
  try {
    const db = getDb()
    const entries = db.prepare(
      'SELECT id, name, message, website, created_at FROM guestbook ORDER BY created_at DESC LIMIT 50'
    ).all()
    return res.json({ success: true, entries })
  } catch (err) {
    console.error('[guestbook GET]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

// POST /api/guestbook
router.post('/',
  guestbookLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
    body('message').trim().isLength({ min: 5, max: 500 }).withMessage('Message must be 5–500 characters'),
    body('website').optional({ checkFalsy: true }).isURL().withMessage('Website must be a valid URL')
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    try {
      const db = getDb()
      const { name, message, website } = req.body
      const ip = req.ip ?? null

      const result = db.prepare(
        'INSERT INTO guestbook (name, message, website, ip) VALUES (?, ?, ?, ?)'
      ).run(name, message, website || null, ip)

      const entry = db.prepare(
        'SELECT id, name, message, website, created_at FROM guestbook WHERE id = ?'
      ).get(result.lastInsertRowid)

      return res.status(201).json({ success: true, entry })
    } catch (err) {
      console.error('[guestbook POST]', err)
      return res.status(500).json({ success: false, message: 'Server error' })
    }
  }
)

// DELETE /api/guestbook/:id
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const db = getDb()
    const { id } = req.params
    const entry = db.prepare('SELECT id FROM guestbook WHERE id = ?').get(id)
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' })

    db.prepare('DELETE FROM guestbook WHERE id = ?').run(id)
    return res.json({ success: true, message: 'Entry deleted' })
  } catch (err) {
    console.error('[guestbook DELETE]', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router
