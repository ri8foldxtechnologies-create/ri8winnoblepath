const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate, optionalAuth, authorize, logAudit } = require('../auth');

// Public List Events
router.get('/', (req, res) => {
  const { category, status } = req.query;
  let query = `
    SELECT e.*, p.title as program_title,
           (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as registered_count
    FROM events e
    LEFT JOIN programs p ON e.program_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    query += ' AND e.category = ?';
    params.push(category);
  }
  if (status) {
    query += ' AND e.status = ?';
    params.push(status);
  } else {
    query += " AND e.status != 'Cancelled'";
  }

  query += ' ORDER BY e.event_date ASC';
  const events = db.prepare(query).all(...params);
  return res.json({ success: true, events });
});

// Single Event Details
router.get('/:id', optionalAuth, (req, res) => {
  const event = db.prepare(`
    SELECT e.*, p.title as program_title,
           (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as registered_count
    FROM events e
    LEFT JOIN programs p ON e.program_id = p.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  let isRegistered = false;
  if (req.user) {
    const reg = db.prepare('SELECT id FROM event_registrations WHERE event_id = ? AND participant_email = ?').get(event.id, req.user.email);
    if (reg) isRegistered = true;
  }

  return res.json({ success: true, event, isRegistered });
});

// Create Event (Admin / Coordinator)
router.post('/', authenticate, authorize('super_admin', 'ngo_admin', 'program_coordinator', 'volunteer_coordinator'), (req, res) => {
  const { title, category, program_id, description, event_date, event_time, venue_type, venue_address, capacity, status } = req.body;

  if (!title || !category || !event_date || !description) {
    return res.status(400).json({ success: false, message: 'Title, category, date, and description are required.' });
  }

  const { image_url } = req.body;

  const result = db.prepare(`
    INSERT INTO events (title, category, program_id, description, event_date, event_time, venue_type, venue_address, capacity, status, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(),
    category,
    program_id ? parseInt(program_id, 10) : null,
    description.trim(),
    event_date,
    event_time || '',
    venue_type || 'Offline',
    venue_address || '',
    capacity ? parseInt(capacity, 10) : 50,
    status || 'Upcoming',
    image_url || null
  );

  logAudit('EVENT_CREATED', req.user.full_name, req.user.role, 'Event', result.lastInsertRowid, `Created event: ${title}`);

  return res.json({ success: true, message: 'Event published successfully.', eventId: result.lastInsertRowid });
});

// Update Event
router.put('/:id', authenticate, authorize('super_admin', 'ngo_admin', 'program_coordinator', 'volunteer_coordinator'), (req, res) => {
  const { title, category, program_id, description, event_date, event_time, venue_type, venue_address, capacity, status, image_url } = req.body;

  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  db.prepare(`
    UPDATE events SET
      title = ?, category = ?, program_id = ?, description = ?, event_date = ?,
      event_time = ?, venue_type = ?, venue_address = ?, capacity = ?, status = ?,
      image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title !== undefined ? title : existing.title,
    category !== undefined ? category : existing.category,
    program_id !== undefined ? (program_id ? parseInt(program_id, 10) : null) : existing.program_id,
    description !== undefined ? description : existing.description,
    event_date !== undefined ? event_date : existing.event_date,
    event_time !== undefined ? event_time : existing.event_time,
    venue_type !== undefined ? venue_type : existing.venue_type,
    venue_address !== undefined ? venue_address : existing.venue_address,
    capacity ? parseInt(capacity, 10) : existing.capacity,
    status !== undefined ? status : existing.status,
    image_url !== undefined ? image_url : existing.image_url,
    req.params.id
  );

  logAudit('EVENT_UPDATED', req.user.full_name, req.user.role, 'Event', req.params.id, `Updated event: ${title || existing.title}`);

  return res.json({ success: true, message: 'Event updated successfully.' });
});

// Delete Event (Permanent Deletion)
router.delete('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  const existing = db.prepare('SELECT title FROM events WHERE id = ?').get(req.params.id);
  db.prepare("DELETE FROM event_registrations WHERE event_id = ?").run(req.params.id);
  db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
  logAudit('EVENT_DELETED', req.user.full_name, req.user.role, 'Event', req.params.id, `Deleted event: ${existing ? existing.title : req.params.id}`);
  return res.json({ success: true, message: 'Event permanently deleted from database.' });
});

// Public / Volunteer RSVP
router.post('/:id/rsvp', optionalAuth, (req, res) => {
  const eventId = req.params.id;
  const { participant_name, participant_email, participant_mobile } = req.body;

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const name = (req.user ? req.user.full_name : participant_name) || '';
  const email = (req.user ? req.user.email : participant_email) || '';
  const mobile = (req.user ? req.user.phone : participant_mobile) || '';

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required for registration.' });
  }

  // Check if volunteer
  const vol = db.prepare('SELECT id FROM volunteer_applications WHERE LOWER(email) = LOWER(?)').get(email.trim());

  const existingReg = db.prepare('SELECT id FROM event_registrations WHERE event_id = ? AND LOWER(participant_email) = LOWER(?)').get(eventId, email.trim());
  if (existingReg) {
    return res.status(400).json({ success: false, message: 'This email is already registered for this event.' });
  }

  // Check capacity
  const count = db.prepare('SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?').get(eventId).count;
  if (count >= event.capacity) {
    return res.status(400).json({ success: false, message: 'This event has reached its maximum registration capacity.' });
  }

  db.prepare(`
    INSERT INTO event_registrations (event_id, volunteer_id, participant_name, participant_email, participant_mobile)
    VALUES (?, ?, ?, ?, ?)
  `).run(eventId, vol ? vol.id : null, name.trim(), email.trim().toLowerCase(), mobile.trim());

  return res.json({
    success: true,
    message: `Thank you, ${name}! Your participation registration for "${event.title}" is confirmed.`
  });
});

// View Attendees (Admin / Coordinator)
router.get('/:id/attendees', authenticate, authorize('super_admin', 'ngo_admin', 'program_coordinator', 'volunteer_coordinator'), (req, res) => {
  const attendees = db.prepare(`
    SELECT er.*, v.membership_id, v.status as volunteer_status
    FROM event_registrations er
    LEFT JOIN volunteer_applications v ON er.volunteer_id = v.id
    WHERE er.event_id = ?
    ORDER BY er.registered_at DESC
  `).all(req.params.id);

  return res.json({ success: true, attendees });
});

// Mark Attendance (Admin / Coordinator)
router.post('/:id/attendance', authenticate, authorize('super_admin', 'ngo_admin', 'program_coordinator', 'volunteer_coordinator'), (req, res) => {
  const { registration_id, attended } = req.body;

  if (!registration_id) {
    return res.status(400).json({ success: false, message: 'Registration ID required.' });
  }

  db.prepare(`
    UPDATE event_registrations SET
      attended = ?,
      attendance_marked_at = CURRENT_TIMESTAMP,
      attendance_marked_by = ?
    WHERE id = ? AND event_id = ?
  `).run(attended ? 1 : 0, req.user.full_name, registration_id, req.params.id);

  return res.json({ success: true, message: 'Attendance status recorded.' });
});

module.exports = router;
