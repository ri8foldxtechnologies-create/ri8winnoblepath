const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate, authorize, logAudit } = require('../auth');

// Admin: Get all official letters
router.get('/', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  const { search, type } = req.query;

  let query = 'SELECT * FROM official_letters';
  const conditions = [];
  const params = [];

  if (type && type !== 'All') {
    conditions.push('letter_type = ?');
    params.push(type);
  }

  if (search && search.trim()) {
    conditions.push('(recipient_name LIKE ? OR reference_number LIKE ? OR recipient_role LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY id DESC';

  const letters = db.prepare(query).all(...params);
  return res.json({ success: true, letters });
});

// Admin: Get single letter by ID
router.get('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  const id = Number(req.params.id);
  const letter = db.prepare('SELECT * FROM official_letters WHERE id = ?').get(id);

  if (!letter) {
    return res.status(404).json({ success: false, message: 'Official letter not found.' });
  }

  return res.json({
    success: true,
    letter: {
      ...letter,
      org_name: 'RI8WIN NOBEL PATH FOUNDATION',
      cin: 'U88900MH2026NPL481549',
      pan: 'AAQCR4085D',
      tan: 'PNER43317B',
      registered_office: 'The Springs 2, 701, Plot No 15, Sector 20, Roadpali, Kalamboli, Navi Mumbai, Maharashtra - 410218, India',
      official_email: 'contact@ri8winnobelpath.org',
      official_phone: '+91 8691016082'
    }
  });
});

// Admin: Create new official letter
router.post('/', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const {
      reference_number,
      letter_type = 'Honorary Appointment Letter (Section 8 Compliant)',
      recipient_name,
      recipient_role,
      recipient_email = '',
      recipient_phone = '',
      recipient_address = '',
      membership_or_emp_id = '',
      issue_date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      effective_date = '',
      service_period = '',
      program_department = 'Community Social Action & Civic Welfare',
      letter_title,
      letter_body,
      authorized_signatory = 'Ms. Shilpa Sunil Umare & Ms. Sarika Uttamchand Wakde, Directors',
      status = 'Active'
    } = req.body;

    if (!recipient_name || !recipient_name.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient full name is required.' });
    }
    if (!recipient_role || !recipient_role.trim()) {
      return res.status(400).json({ success: false, message: 'Designation / role is required.' });
    }
    if (!letter_title || !letter_title.trim()) {
      return res.status(400).json({ success: false, message: 'Letter subject / title is required.' });
    }
    if (!letter_body || !letter_body.trim()) {
      return res.status(400).json({ success: false, message: 'Letter content body is required.' });
    }

    // Auto-generate reference number if not provided
    let cleanRef = (reference_number && reference_number.trim()) || '';
    if (!cleanRef) {
      const count = db.prepare('SELECT COUNT(*) as count FROM official_letters').get().count;
      cleanRef = `RI8WIN/LET/2026/${String(count + 1).padStart(3, '0')}`;
    }

    const insert = db.prepare(`
      INSERT INTO official_letters (
        reference_number, letter_type, recipient_name, recipient_role, recipient_email,
        recipient_phone, recipient_address, membership_or_emp_id, issue_date, effective_date,
        service_period, program_department, letter_title, letter_body, authorized_signatory, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      cleanRef.trim().toUpperCase(),
      letter_type.trim(),
      recipient_name.trim(),
      recipient_role.trim(),
      recipient_email.trim(),
      recipient_phone.trim(),
      recipient_address.trim(),
      membership_or_emp_id.trim(),
      issue_date.trim(),
      effective_date.trim(),
      service_period.trim(),
      program_department.trim(),
      letter_title.trim(),
      letter_body.trim(),
      authorized_signatory.trim(),
      status || 'Active'
    );

    logAudit(
      'LETTER_CREATED',
      req.user.full_name,
      req.user.role,
      'Letter',
      String(result.lastInsertRowid),
      `Generated official letter ${cleanRef} for ${recipient_name.trim()} (${recipient_role.trim()})`
    );

    const letter = db.prepare('SELECT * FROM official_letters WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({
      success: true,
      message: 'Official letter created and issued successfully!',
      letter
    });
  } catch (error) {
    console.error('Error creating official letter:', error);
    return res.status(500).json({ success: false, message: 'Failed to create letter: ' + error.message });
  }
});

// Admin: Update official letter
router.put('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM official_letters WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Letter not found.' });
    }

    const {
      reference_number = existing.reference_number,
      letter_type = existing.letter_type,
      recipient_name = existing.recipient_name,
      recipient_role = existing.recipient_role,
      recipient_email = existing.recipient_email,
      recipient_phone = existing.recipient_phone,
      recipient_address = existing.recipient_address,
      membership_or_emp_id = existing.membership_or_emp_id,
      issue_date = existing.issue_date,
      effective_date = existing.effective_date,
      service_period = existing.service_period,
      program_department = existing.program_department,
      letter_title = existing.letter_title,
      letter_body = existing.letter_body,
      authorized_signatory = existing.authorized_signatory,
      status = existing.status
    } = req.body;

    const update = db.prepare(`
      UPDATE official_letters SET
        reference_number = ?,
        letter_type = ?,
        recipient_name = ?,
        recipient_role = ?,
        recipient_email = ?,
        recipient_phone = ?,
        recipient_address = ?,
        membership_or_emp_id = ?,
        issue_date = ?,
        effective_date = ?,
        service_period = ?,
        program_department = ?,
        letter_title = ?,
        letter_body = ?,
        authorized_signatory = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(
      reference_number.trim().toUpperCase(),
      letter_type.trim(),
      recipient_name.trim(),
      recipient_role.trim(),
      recipient_email.trim(),
      recipient_phone.trim(),
      recipient_address.trim(),
      membership_or_emp_id.trim(),
      issue_date.trim(),
      effective_date.trim(),
      service_period.trim(),
      program_department.trim(),
      letter_title.trim(),
      letter_body.trim(),
      authorized_signatory.trim(),
      status,
      id
    );

    logAudit(
      'LETTER_UPDATED',
      req.user.full_name,
      req.user.role,
      'Letter',
      String(id),
      `Updated official letter: ${reference_number}`
    );

    const letter = db.prepare('SELECT * FROM official_letters WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Official letter updated successfully!', letter });
  } catch (error) {
    console.error('Error updating letter:', error);
    return res.status(500).json({ success: false, message: 'Failed to update letter: ' + error.message });
  }
});

// Admin: Delete official letter
router.delete('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM official_letters WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Letter not found.' });
    }

    db.prepare('DELETE FROM official_letters WHERE id = ?').run(id);

    logAudit(
      'LETTER_DELETED',
      req.user.full_name,
      req.user.role,
      'Letter',
      String(id),
      `Deleted official letter ${existing.reference_number} (${existing.recipient_name})`
    );

    return res.json({ success: true, message: 'Official letter deleted successfully.' });
  } catch (error) {
    console.error('Error deleting letter:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete letter: ' + error.message });
  }
});

module.exports = router;
