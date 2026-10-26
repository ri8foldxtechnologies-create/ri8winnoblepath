const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate, authorize, logAudit } = require('../auth');

// Public List Programs
router.get('/', (req, res) => {
  const { category, status } = req.query;
  let query = 'SELECT * FROM programs WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  } else {
    query += " AND status != 'Archived'";
  }

  query += ' ORDER BY id ASC';
  const programs = db.prepare(query).all(...params);
  return res.json({ success: true, programs });
});

// Single Program
router.get('/:id', (req, res) => {
  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id);
  if (!program) {
    return res.status(404).json({ success: false, message: 'Program not found.' });
  }
  const events = db.prepare('SELECT * FROM events WHERE program_id = ? ORDER BY event_date ASC').all(req.params.id);
  return res.json({ success: true, program, events });
});

// Create Program (Admin / Coordinator)
router.post('/', authenticate, authorize('super_admin', 'ngo_admin', 'program_coordinator'), (req, res) => {
  const { title, category, description, objectives, target_audience, status, lead_coordinator, image_url } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ success: false, message: 'Title, category, and description are required.' });
  }

  const result = db.prepare(`
    INSERT INTO programs (title, category, description, objectives, target_audience, status, lead_coordinator, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(),
    category,
    description.trim(),
    objectives || '',
    target_audience || '',
    status || 'Active',
    lead_coordinator || req.user.full_name,
    image_url || null
  );

  logAudit('PROGRAM_CREATED', req.user.full_name, req.user.role, 'Program', result.lastInsertRowid, `Created program: ${title}`);

  return res.json({ success: true, message: 'Program created successfully.', programId: result.lastInsertRowid });
});

// Update Program
router.put('/:id', authenticate, authorize('super_admin', 'ngo_admin', 'program_coordinator'), (req, res) => {
  const { title, category, description, objectives, target_audience, status, lead_coordinator, image_url } = req.body;

  const existing = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Program not found.' });
  }

  db.prepare(`
    UPDATE programs SET
      title = ?, category = ?, description = ?, objectives = ?, target_audience = ?, status = ?, lead_coordinator = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title !== undefined ? title : existing.title,
    category !== undefined ? category : existing.category,
    description !== undefined ? description : existing.description,
    objectives !== undefined ? objectives : existing.objectives,
    target_audience !== undefined ? target_audience : existing.target_audience,
    status !== undefined ? status : existing.status,
    lead_coordinator !== undefined ? lead_coordinator : existing.lead_coordinator,
    image_url !== undefined ? image_url : existing.image_url,
    req.params.id
  );

  logAudit('PROGRAM_UPDATED', req.user.full_name, req.user.role, 'Program', req.params.id, `Updated program: ${title || existing.title}`);

  return res.json({ success: true, message: 'Program updated successfully.' });
});

// Delete Program (Permanent Deletion)
router.delete('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  const existing = db.prepare('SELECT title FROM programs WHERE id = ?').get(req.params.id);
  db.prepare("DELETE FROM programs WHERE id = ?").run(req.params.id);
  logAudit('PROGRAM_DELETED', req.user.full_name, req.user.role, 'Program', req.params.id, `Deleted program: ${existing ? existing.title : req.params.id}`);
  return res.json({ success: true, message: 'Program permanently deleted from database.' });
});

module.exports = router;
