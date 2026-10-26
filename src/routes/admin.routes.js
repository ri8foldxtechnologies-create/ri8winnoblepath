const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate, authorize, logAudit } = require('../auth');

// All admin routes require authentication and staff roles
router.use(authenticate);
router.use(authorize('super_admin', 'ngo_admin', 'volunteer_coordinator', 'program_coordinator'));

// Helper: generate Membership ID (RI8V-YYYY-XXXXX)
function generateMembershipId() {
  const year = new Date().getFullYear();
  const last = db.prepare(`
    SELECT membership_id FROM volunteer_applications
    WHERE membership_id LIKE ?
    ORDER BY id DESC LIMIT 1
  `).get(`RI8V-${year}-%`);

  let nextSeq = 1;
  if (last && last.membership_id) {
    const parts = last.membership_id.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num)) nextSeq = num + 1;
    }
  }

  return `RI8V-${year}-${String(nextSeq).padStart(5, '0')}`;
}

// Helper: generate Certificate Number (CERT-RI8V-YYYY-XXXXX)
function generateCertificateNumber(membershipId) {
  return `CERT-${membershipId}`;
}

// Admin Dashboard Summary Metrics
router.get('/dashboard-stats', (req, res) => {
  const totalApps = db.prepare('SELECT COUNT(*) as count FROM volunteer_applications').get().count;
  const pendingApps = db.prepare("SELECT COUNT(*) as count FROM volunteer_applications WHERE status IN ('Submitted', 'Under Verification', 'Additional Information Required')").get().count;
  const activeVolunteers = db.prepare("SELECT COUNT(*) as count FROM volunteer_applications WHERE status = 'Approved'").get().count;
  const certsIssued = db.prepare("SELECT COUNT(*) as count FROM certificates WHERE status = 'Issued'").get().count;
  const certsRevoked = db.prepare("SELECT COUNT(*) as count FROM certificates WHERE status = 'Revoked'").get().count;
  const totalPrograms = db.prepare("SELECT COUNT(*) as count FROM programs WHERE status != 'Archived'").get().count;
  const upcomingEvents = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'Upcoming'").get().count;
  const totalEventRSVPs = db.prepare('SELECT COUNT(*) as count FROM event_registrations').get().count;

  const recentLogs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 8').all();

  return res.json({
    success: true,
    stats: {
      totalApps,
      pendingApps,
      activeVolunteers,
      certsIssued,
      certsRevoked,
      totalPrograms,
      upcomingEvents,
      totalEventRSVPs
    },
    recentLogs
  });
});

// Admin Volunteer Applications List (Searchable & Filterable)
router.get('/volunteers', (req, res) => {
  const { status, search, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT v.*, c.certificate_number, c.status as cert_status, c.issue_date as cert_issue_date
    FROM volunteer_applications v
    LEFT JOIN certificates c ON v.id = c.application_id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'All') {
    query += ' AND v.status = ?';
    params.push(status);
  }

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    query += ` AND (
      v.full_name LIKE ? OR
      v.email LIKE ? OR
      v.mobile LIKE ? OR
      v.application_ref LIKE ? OR
      v.membership_id LIKE ? OR
      v.city LIKE ? OR
      v.state LIKE ?
    )`;
    params.push(s, s, s, s, s, s, s);
  }

  query += ' ORDER BY v.id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const applications = db.prepare(query).all(...params);

  // Total count for pagination
  let countQuery = 'SELECT COUNT(*) as count FROM volunteer_applications v WHERE 1=1';
  const countParams = [];
  if (status && status !== 'All') {
    countQuery += ' AND v.status = ?';
    countParams.push(status);
  }
  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    countQuery += ` AND (
      v.full_name LIKE ? OR
      v.email LIKE ? OR
      v.mobile LIKE ? OR
      v.application_ref LIKE ? OR
      v.membership_id LIKE ? OR
      v.city LIKE ? OR
      v.state LIKE ?
    )`;
    countParams.push(s, s, s, s, s, s, s);
  }
  const totalCount = db.prepare(countQuery).get(...countParams).count;

  return res.json({
    success: true,
    applications,
    totalCount
  });
});

// Single Volunteer Application Details
router.get('/volunteers/:id', (req, res) => {
  const app = db.prepare(`
    SELECT v.*, c.certificate_number, c.status as cert_status, c.issue_date as cert_issue_date,
           c.revocation_date, c.revocation_reason
    FROM volunteer_applications v
    LEFT JOIN certificates c ON v.id = c.application_id
    WHERE v.id = ?
  `).get(req.params.id);

  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  // Parse interests
  let parsedInterests = [];
  try {
    parsedInterests = JSON.parse(app.interests);
  } catch (e) {
    parsedInterests = [app.interests];
  }

  return res.json({
    success: true,
    application: {
      ...app,
      interests: parsedInterests
    }
  });
});

// Update Verification Notes & Status (Volunteer Coordinator / Admin)
router.post('/volunteers/:id/verify', (req, res) => {
  const { status, verification_remarks, safeguarding_checked } = req.body;
  const appId = req.params.id;

  const app = db.prepare('SELECT * FROM volunteer_applications WHERE id = ?').get(appId);
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  const allowedStatuses = ['Submitted', 'Under Verification', 'Additional Information Required', 'Rejected', 'Inactive'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid verification status.' });
  }

  const newStatus = status || app.status;

  db.prepare(`
    UPDATE volunteer_applications SET
      status = ?,
      verification_remarks = ?,
      assigned_verifier = ?,
      verification_date = CURRENT_TIMESTAMP,
      safeguarding_checked = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    newStatus,
    verification_remarks !== undefined ? verification_remarks : app.verification_remarks,
    req.user.full_name,
    safeguarding_checked ? 1 : 0,
    appId
  );

  logAudit(
    'VOLUNTEER_VERIFICATION_UPDATED',
    req.user.full_name,
    req.user.role,
    'VolunteerApplication',
    appId,
    `Updated status to "${newStatus}". Remarks: ${verification_remarks || 'None'}`
  );

  return res.json({ success: true, message: 'Verification record updated successfully.' });
});

// Formal Approval (Super Admin / NGO Admin)
// Approves application, generates Membership ID, and issues Certificate
router.post('/volunteers/:id/approve', authorize('super_admin', 'ngo_admin'), (req, res) => {
  const appId = req.params.id;
  const { remarks } = req.body;

  const app = db.prepare('SELECT * FROM volunteer_applications WHERE id = ?').get(appId);
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  if (app.status === 'Approved') {
    return res.status(400).json({ success: false, message: 'This application is already approved.' });
  }

  // Generate unique Membership ID if not already generated
  let membershipId = app.membership_id;
  if (!membershipId) {
    membershipId = generateMembershipId();
  }

  // Date format e.g. "18 October 2026"
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;

  // Update application
  db.prepare(`
    UPDATE volunteer_applications SET
      status = 'Approved',
      membership_id = ?,
      certificate_status = 'Issued',
      approval_date = CURRENT_TIMESTAMP,
      approving_officer = ?,
      verification_remarks = COALESCE(?, verification_remarks),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    membershipId,
    req.user.full_name,
    remarks ? `Approval Remark: ${remarks}` : null,
    appId
  );

  // Check or create certificate
  let cert = db.prepare('SELECT id, certificate_number FROM certificates WHERE application_id = ?').get(appId);
  if (!cert) {
    const certNum = generateCertificateNumber(membershipId);
    db.prepare(`
      INSERT INTO certificates (
        certificate_number, application_id, volunteer_name, membership_id, issue_date, status, authorized_signatory
      ) VALUES (?, ?, ?, ?, ?, 'Issued', ?)
    `).run(
      certNum,
      appId,
      app.full_name,
      membershipId,
      formattedDate,
      'Ms. Shilpa Sunil Umare, Founder & Director'
    );
  } else {
    db.prepare(`
      UPDATE certificates SET
        status = 'Issued',
        issue_date = ?,
        revocation_date = NULL,
        revocation_reason = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(formattedDate, cert.id);
  }

  logAudit(
    'VOLUNTEER_APPROVED',
    req.user.full_name,
    req.user.role,
    'VolunteerApplication',
    appId,
    `Approved volunteer ${app.full_name}. Generated Membership ID: ${membershipId}`
  );

  return res.json({
    success: true,
    message: `Volunteer ${app.full_name} formally approved! Membership ID: ${membershipId}`,
    membership_id: membershipId,
    certificate_status: 'Issued'
  });
});

// Revoke Certificate (Super Admin / NGO Admin)
router.post('/certificates/:id/revoke', authorize('super_admin', 'ngo_admin'), (req, res) => {
  const certId = req.params.id;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: 'A specific reason is mandatory for certificate revocation.' });
  }

  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId);
  if (!cert) {
    return res.status(404).json({ success: false, message: 'Certificate record not found.' });
  }

  db.prepare(`
    UPDATE certificates SET
      status = 'Revoked',
      revocation_date = CURRENT_TIMESTAMP,
      revocation_reason = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(reason.trim(), certId);

  // Update volunteer app certificate status
  db.prepare(`
    UPDATE volunteer_applications SET
      certificate_status = 'Revoked',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(cert.application_id);

  logAudit(
    'CERTIFICATE_REVOKED',
    req.user.full_name,
    req.user.role,
    'Certificate',
    certId,
    `Revoked certificate ${cert.certificate_number} for volunteer ${cert.volunteer_name}. Reason: ${reason.trim()}`
  );

  return res.json({ success: true, message: `Certificate ${cert.certificate_number} has been revoked.` });
});

// Reissue Certificate (Super Admin / NGO Admin)
router.post('/certificates/:id/reissue', authorize('super_admin', 'ngo_admin'), (req, res) => {
  const certId = req.params.id;
  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId);
  if (!cert) {
    return res.status(404).json({ success: false, message: 'Certificate record not found.' });
  }

  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;

  db.prepare(`
    UPDATE certificates SET
      status = 'Issued',
      issue_date = ?,
      revocation_date = NULL,
      revocation_reason = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(formattedDate, certId);

  db.prepare(`
    UPDATE volunteer_applications SET
      certificate_status = 'Issued',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(cert.application_id);

  logAudit(
    'CERTIFICATE_REISSUED',
    req.user.full_name,
    req.user.role,
    'Certificate',
    certId,
    `Reissued certificate ${cert.certificate_number} for volunteer ${cert.volunteer_name}.`
  );

  return res.json({ success: true, message: `Certificate ${cert.certificate_number} reissued.` });
});

// Export Volunteer Records as CSV
router.get('/export-volunteers', (req, res) => {
  const volunteers = db.prepare(`
    SELECT v.application_ref, v.created_at as registered_date, v.full_name, v.dob,
           v.gender, v.email, v.mobile, v.city, v.state, v.qualification,
           v.occupation, v.interests, v.availability_mode, v.status,
           v.membership_id, v.certificate_status, v.assigned_verifier,
           v.verification_date, v.approval_date, v.approving_officer
    FROM volunteer_applications v
    ORDER BY v.id ASC
  `).all();

  const headers = [
    'Application ID',
    'Registration Date',
    'Full Name',
    'DOB',
    'Gender',
    'Email',
    'Mobile',
    'City',
    'State',
    'Qualification',
    'Occupation',
    'Interests',
    'Availability',
    'Status',
    'Membership ID',
    'Certificate Status',
    'Assigned Verifier',
    'Verification Date',
    'Approval Date',
    'Approving Officer'
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = [headers.join(',')];
  for (const v of volunteers) {
    let cleanInterests = v.interests;
    try {
      cleanInterests = JSON.parse(v.interests).join('; ');
    } catch (e) {}

    rows.push([
      escapeCsv(v.application_ref),
      escapeCsv(v.registered_date),
      escapeCsv(v.full_name),
      escapeCsv(v.dob),
      escapeCsv(v.gender),
      escapeCsv(v.email),
      escapeCsv(v.mobile),
      escapeCsv(v.city),
      escapeCsv(v.state),
      escapeCsv(v.qualification),
      escapeCsv(v.occupation),
      escapeCsv(cleanInterests),
      escapeCsv(v.availability_mode),
      escapeCsv(v.status),
      escapeCsv(v.membership_id),
      escapeCsv(v.certificate_status),
      escapeCsv(v.assigned_verifier),
      escapeCsv(v.verification_date),
      escapeCsv(v.approval_date),
      escapeCsv(v.approving_officer)
    ].join(','));
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="RI8WIN_Volunteer_Register.csv"');
  return res.send(rows.join('\r\n'));
});

// Audit Logs Endpoint
router.get('/audit-logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100').all();
  return res.json({ success: true, logs });
});

module.exports = router;
