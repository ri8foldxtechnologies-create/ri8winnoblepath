const jwt = require('jsonwebtoken');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'ri8win_nobel_path_sec8_foundation_key_2026_super_secure';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticate(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, full_name, role, phone FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }
}

function optionalAuth(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT id, email, full_name, role, phone FROM users WHERE id = ?').get(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // ignore
    }
  }
  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    // Super admin has access to everything
    if (req.user.role === 'super_admin') {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: Insufficient privileges.' });
    }
    next();
  };
}

function logAudit(action, actorName, actorRole, targetType, targetId, details) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (action, actor_name, actor_role, target_type, target_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      action,
      actorName || 'System',
      actorRole || 'System',
      targetType || 'General',
      String(targetId || '0'),
      typeof details === 'object' ? JSON.stringify(details) : String(details || '')
    );
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticate,
  optionalAuth,
  authorize,
  logAudit
};
