import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION'

/**
 * Middleware: verify Bearer JWT — populates req.user on success.
 */
export function verifyToken(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' })
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

/**
 * Middleware: require admin role (implies verifyToken).
 */
export function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' })
    }
    next()
  })
}

/**
 * Middleware: require admin OR moderator role.
 */
export function requireModerator(req, res, next) {
  verifyToken(req, res, () => {
    if (!['admin', 'moderator'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' })
    }
    next()
  })
}

/**
 * Sign a JWT that expires in 24 h.
 * @param {{ id: number, username: string, role: string, email: string }} payload
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}
