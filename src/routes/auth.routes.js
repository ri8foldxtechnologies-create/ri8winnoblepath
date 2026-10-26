const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { generateToken, authenticate, logAudit } = require('../auth');

function getMemberProfile(user) {
  if (!user || !['executive_member', 'employee'].includes(user.role)) return null;
  try {
    const execRow = db.prepare('SELECT value FROM organization_settings WHERE key = ?').get('executive_members');
    if (execRow && execRow.value) {
      const list = JSON.parse(execRow.value);
      if (Array.isArray(list) && list.length > 0) {
        if (user.email.toLowerCase() === 'member@ri8win.org') {
          return list[0]; // First executive officer (Vice President)
        }
        const matched = list.find(m => 
          (m.contact && m.contact.toLowerCase() === user.email.toLowerCase()) ||
          (m.name && m.name.toLowerCase() === user.full_name.toLowerCase())
        );
        if (matched) return matched;
      }
    }
  } catch (e) {}

  // Resilient fallback for registered executive / employee users:
  const isVp = user.email.toLowerCase().includes('member@') || user.email.toLowerCase().includes('rameshwar');
  const isSec = user.email.toLowerCase().includes('sunita');
  const isTreas = user.email.toLowerCase().includes('agrawal');
  
  let roleTitle = 'Honorary Executive Member';
  let certId = 'CERT-HON-RI8-2026-0001';
  let memId = 'RI8-EXEC-2026-0001';

  if (isVp) {
    roleTitle = 'Vice President (Honorary)';
    certId = 'CERT-HON-RI8-2026-0001';
    memId = 'RI8-EXEC-2026-0001';
  } else if (isSec) {
    roleTitle = 'General Secretary & Legal Compliance (Honorary)';
    certId = 'CERT-HON-RI8-2026-0002';
    memId = 'RI8-EXEC-2026-0002';
  } else if (isTreas) {
    roleTitle = 'Treasurer & Audit Advisor (Honorary)';
    certId = 'CERT-HON-RI8-2026-0003';
    memId = 'RI8-EXEC-2026-0003';
  } else if (user.role === 'employee') {
    roleTitle = 'Program Officer (Honorary)';
    certId = 'CERT-HON-RI8-2026-0005';
    memId = 'RI8-EXEC-2026-0005';
  }

  return {
    name: user.full_name || 'Executive Officer',
    role: roleTitle,
    category: 'Executive Office Bearer',
    contact: user.email,
    location: 'Navi Mumbai, Maharashtra',
    appointment_date: '06 October 2026',
    membership_id: memId,
    certificate_number: certId,
    honorary_terms: 'Honorary Member • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.',
    visible: true
  };
}

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // set to true in https
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  logAudit('USER_LOGIN', user.full_name, user.role, 'User', user.id, `User signed in: ${user.email}`);

  // Fetch linked volunteer application if user is volunteer
  let volunteerApp = null;
  if (user.role === 'volunteer') {
    volunteerApp = db.prepare('SELECT * FROM volunteer_applications WHERE user_id = ? OR LOWER(email) = LOWER(?)').get(user.id, user.email);
  }

  const memberProfile = getMemberProfile(user);

  return res.json({
    success: true,
    message: 'Signed in successfully.',
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone
    },
    memberProfile,
    volunteerApp: volunteerApp ? {
      id: volunteerApp.id,
      application_ref: volunteerApp.application_ref,
      membership_id: volunteerApp.membership_id,
      status: volunteerApp.status,
      certificate_status: volunteerApp.certificate_status
    } : null
  });
});

// Register volunteer user account
router.post('/register', (req, res) => {
  const { email, password, full_name, phone } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, phone)
    VALUES (?, ?, ?, 'volunteer', ?)
  `).run(email.trim().toLowerCase(), hash, full_name.trim(), phone || '');

  const user = {
    id: result.lastInsertRowid,
    email: email.trim().toLowerCase(),
    full_name: full_name.trim(),
    role: 'volunteer',
    phone: phone || ''
  };

  const token = generateToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  logAudit('USER_REGISTER', user.full_name, 'volunteer', 'User', user.id, `New volunteer account created: ${user.email}`);

  return res.json({
    success: true,
    message: 'Account created successfully.',
    token,
    user
  });
});

// Current User Info
router.get('/me', authenticate, (req, res) => {
  let volunteerApp = null;
  if (req.user.role === 'volunteer') {
    volunteerApp = db.prepare('SELECT * FROM volunteer_applications WHERE user_id = ? OR LOWER(email) = LOWER(?)').get(req.user.id, req.user.email);
  }

  const memberProfile = getMemberProfile(req.user);

  return res.json({
    success: true,
    user: req.user,
    memberProfile,
    volunteerApp
  });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Signed out successfully.' });
});

// Volunteer Quick Lookup by Ref & Email (for public tracking without mandatory password)
router.post('/track-status', (req, res) => {
  const { application_ref, email } = req.body;

  if (!application_ref || !email) {
    return res.status(400).json({ success: false, message: 'Application Reference and registered Email are required.' });
  }

  const app = db.prepare(`
    SELECT id, application_ref, full_name, email, city, state, status,
           membership_id, certificate_status, approval_date, created_at,
           verification_remarks
    FROM volunteer_applications
    WHERE UPPER(application_ref) = UPPER(?) AND LOWER(email) = LOWER(?)
  `).get(application_ref.trim(), email.trim());

  if (!app) {
    return res.status(404).json({
      success: false,
      message: 'No application found matching the provided reference and email. Please check your details.'
    });
  }

  let cert = null;
  if (app.status === 'Approved' && app.certificate_status === 'Issued') {
    cert = db.prepare('SELECT certificate_number, issue_date, status FROM certificates WHERE application_id = ?').get(app.id);
  }

  return res.json({
    success: true,
    application: {
      ...app,
      certificate: cert
    }
  });
});

module.exports = router;
