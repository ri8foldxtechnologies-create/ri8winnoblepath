const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authenticate, optionalAuth, logAudit } = require('../auth');

// Setup multer for optional profile photo uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and WebP images are permitted for profile photos.'));
    }
  }
});

// Helper: generate application ref APP-YYYY-XXXXX
function generateApplicationRef() {
  const year = new Date().getFullYear();
  const last = db.prepare(`
    SELECT application_ref FROM volunteer_applications 
    WHERE application_ref LIKE ? 
    ORDER BY id DESC LIMIT 1
  `).get(`APP-${year}-%`);

  let nextSeq = 1;
  if (last && last.application_ref) {
    const parts = last.application_ref.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num)) nextSeq = num + 1;
    }
  }

  return `APP-${year}-${String(nextSeq).padStart(5, '0')}`;
}

// Helper: check if DOB is minor (<18)
function checkIsMinor(dobString) {
  if (!dobString) return false;
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age < 18;
}

// Submit Public Volunteer Registration
router.post('/register', upload.single('profile_photo'), optionalAuth, (req, res) => {
  try {
    const {
      full_name,
      dob,
      gender,
      email,
      mobile,
      city,
      state,
      address,
      qualification,
      institution,
      occupation,
      skills,
      experience,
      interests, // string or JSON array
      availability_mode,
      preferred_days_times,
      preferred_location,
      motivation,
      declaration_accurate,
      declaration_guidelines,
      declaration_consent,
      guardian_name,
      guardian_contact,
      guardian_consent,
      account_password // optional password to create login immediately
    } = req.body;

    // Validation
    if (!full_name || !dob || !email || !mobile || !city || !state || !qualification || !occupation || !availability_mode) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields (Name, DOB, Email, Mobile, City, State, Qualification, Occupation, Availability).'
      });
    }

    // Check declarations
    if (String(declaration_accurate) !== '1' && declaration_accurate !== true && declaration_accurate !== 'true') {
      return res.status(400).json({ success: false, message: 'You must confirm the accuracy of submitted information.' });
    }
    if (String(declaration_guidelines) !== '1' && declaration_guidelines !== true && declaration_guidelines !== 'true') {
      return res.status(400).json({ success: false, message: 'You must accept the volunteer code of conduct and guidelines.' });
    }
    if (String(declaration_consent) !== '1' && declaration_consent !== true && declaration_consent !== 'true') {
      return res.status(400).json({ success: false, message: 'You must consent to data processing for volunteer verification.' });
    }

    // Check minor and guardian consent
    const isMinor = checkIsMinor(dob);
    if (isMinor) {
      if (!guardian_name || !guardian_contact) {
        return res.status(400).json({
          success: false,
          message: 'As an applicant under 18 years of age, guardian name and contact details are required.'
        });
      }
      if (String(guardian_consent) !== '1' && guardian_consent !== true && guardian_consent !== 'true') {
        return res.status(400).json({
          success: false,
          message: 'Guardian consent is mandatory for applicants under 18.'
        });
      }
    }

    // Check if an existing application with same email already exists
    const existing = db.prepare('SELECT id, application_ref, status FROM volunteer_applications WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An application with email ${email} already exists (Ref: ${existing.application_ref}, Status: ${existing.status}). Please contact us or check application status.`
      });
    }

    // Format interests
    let parsedInterests = [];
    if (typeof interests === 'string') {
      try {
        parsedInterests = JSON.parse(interests);
      } catch (e) {
        parsedInterests = interests.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(interests)) {
      parsedInterests = interests;
    }

    if (parsedInterests.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one area of volunteer interest.' });
    }

    // Photo URL
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Check or create user account
    let userId = req.user ? req.user.id : null;
    if (!userId) {
      const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
      if (existingUser) {
        userId = existingUser.id;
      } else if (account_password && account_password.length >= 6) {
        const hash = bcrypt.hashSync(account_password, 10);
        const userRes = db.prepare(`
          INSERT INTO users (email, password_hash, full_name, role, phone)
          VALUES (?, ?, ?, 'volunteer', ?)
        `).run(email.trim().toLowerCase(), hash, full_name.trim(), mobile.trim());
        userId = userRes.lastInsertRowid;
      }
    }

    const applicationRef = generateApplicationRef();

    const insert = db.prepare(`
      INSERT INTO volunteer_applications (
        application_ref, user_id, full_name, dob, is_minor,
        guardian_name, guardian_contact, guardian_consent,
        gender, email, mobile, city, state, address, photo_url,
        qualification, institution, occupation, skills, experience,
        interests, availability_mode, preferred_days_times, preferred_location,
        motivation, declaration_accurate, declaration_guidelines, declaration_consent,
        status, certificate_status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, 1, 1, 1,
        'Submitted', 'Pending'
      )
    `);

    const result = insert.run(
      applicationRef,
      userId,
      full_name.trim(),
      dob,
      isMinor ? 1 : 0,
      isMinor ? (guardian_name || '').trim() : null,
      isMinor ? (guardian_contact || '').trim() : null,
      isMinor ? 1 : 0,
      gender || '',
      email.trim().toLowerCase(),
      mobile.trim(),
      city.trim(),
      state.trim(),
      address ? address.trim() : '',
      photoUrl,
      qualification.trim(),
      institution ? institution.trim() : '',
      occupation.trim(),
      skills ? skills.trim() : '',
      experience ? experience.trim() : '',
      JSON.stringify(parsedInterests),
      availability_mode,
      preferred_days_times ? preferred_days_times.trim() : '',
      preferred_location ? preferred_location.trim() : '',
      motivation ? motivation.trim() : '',
    );

    logAudit(
      'VOLUNTEER_APPLICATION_SUBMITTED',
      full_name.trim(),
      'Applicant',
      'VolunteerApplication',
      result.lastInsertRowid,
      `New application submitted with Ref: ${applicationRef}`
    );

    return res.json({
      success: true,
      message: 'Your volunteer application has been submitted successfully!',
      application_ref: applicationRef,
      status: 'Submitted',
      note: 'Your application is now under review by the NGO verification committee. Once verified and approved, your Volunteer Membership ID and Certificate will be accessible.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while saving registration: ' + error.message });
  }
});

// Volunteer Dashboard Profile (Protected)
router.get('/my-profile', authenticate, (req, res) => {
  const app = db.prepare(`
    SELECT * FROM volunteer_applications 
    WHERE user_id = ? OR LOWER(email) = LOWER(?)
    ORDER BY id DESC LIMIT 1
  `).get(req.user.id, req.user.email);

  if (!app) {
    return res.json({
      success: true,
      has_application: false,
      user: req.user
    });
  }

  let certificate = null;
  if (app.status === 'Approved' && app.certificate_status === 'Issued') {
    certificate = db.prepare('SELECT * FROM certificates WHERE application_id = ?').get(app.id);
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
    has_application: true,
    application: {
      ...app,
      interests: parsedInterests,
      certificate
    }
  });
});

// Get upcoming events and registrations for volunteer
router.get('/my-events', authenticate, (req, res) => {
  const volunteer = db.prepare('SELECT id FROM volunteer_applications WHERE user_id = ? OR LOWER(email) = LOWER(?)').get(req.user.id, req.user.email);

  const upcomingEvents = db.prepare(`
    SELECT e.*, p.title as program_title,
      (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as registered_count,
      (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND (er.participant_email = ? OR (er.volunteer_id = ? AND ? IS NOT NULL))) as is_registered
    FROM events e
    LEFT JOIN programs p ON e.program_id = p.id
    WHERE e.status != 'Cancelled'
    ORDER BY e.event_date ASC
  `).all(req.user.email, volunteer ? volunteer.id : null, volunteer ? volunteer.id : null);

  const myRegistrations = db.prepare(`
    SELECT er.*, e.title as event_title, e.event_date, e.event_time, e.venue_type, e.venue_address
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.participant_email = ? OR er.volunteer_id = ?
    ORDER BY e.event_date DESC
  `).all(req.user.email, volunteer ? volunteer.id : null);

  return res.json({
    success: true,
    upcomingEvents,
    myRegistrations
  });
});

// Volunteer Register for Event
router.post('/register-event', authenticate, (req, res) => {
  const { event_id } = req.body;
  if (!event_id) {
    return res.status(400).json({ success: false, message: 'Event ID is required.' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const volunteer = db.prepare('SELECT id, full_name, email, mobile FROM volunteer_applications WHERE user_id = ? OR LOWER(email) = LOWER(?)').get(req.user.id, req.user.email);

  const existingReg = db.prepare('SELECT id FROM event_registrations WHERE event_id = ? AND participant_email = ?').get(event_id, req.user.email);
  if (existingReg) {
    return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
  }

  db.prepare(`
    INSERT INTO event_registrations (event_id, volunteer_id, participant_name, participant_email, participant_mobile)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    event_id,
    volunteer ? volunteer.id : null,
    volunteer ? volunteer.full_name : req.user.full_name,
    req.user.email,
    volunteer ? volunteer.mobile : (req.user.phone || '')
  );

  return res.json({ success: true, message: `Successfully registered for ${event.title}!` });
});

module.exports = router;
