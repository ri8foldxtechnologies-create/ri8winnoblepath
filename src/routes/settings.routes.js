const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');
const { authenticate, authorize, logAudit } = require('../auth');

// Multer storage for admin image uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = req.body.target || 'site-asset';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and SVG images are allowed.'));
    }
  }
});

function parseSettingValue(val) {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {}
  }
  return val;
}

// Public: Get Organization Settings & Legal Disclosures
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM organization_settings').all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = parseSettingValue(row.value);
  }

  return res.json({
    success: true,
    settings
  });
});

// Admin: Upload Site Image (Banner, Logo, Director Photos, Hero Image)
router.post('/upload-image', authenticate, authorize('super_admin', 'ngo_admin'), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const { target } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;
    const filePath = req.file.path;

    // Sync to root uploads folder if different
    try {
      const rootUploads = path.resolve(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(rootUploads)) fs.mkdirSync(rootUploads, { recursive: true });
      const rootDest = path.join(rootUploads, req.file.filename);
      if (filePath !== rootDest) {
        fs.copyFileSync(filePath, rootDest);
      }
    } catch(e) {}

    const upsert = db.prepare(`
      INSERT INTO organization_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    // Handle specific target integrations
    if (target === 'banner') {
      upsert.run('banner_url', fileUrl);
      // Copy to public/assets/Banner.png for PDF certificate consistency
      try {
        const dest = path.join(__dirname, '..', 'public', 'assets', 'Banner.png');
        fs.copyFileSync(filePath, dest);
      } catch (e) {
        console.error('Error syncing banner to public/assets:', e);
      }
    } else if (target === 'hero_image' || target === 'hero-image') {
      upsert.run('hero_image_url', fileUrl);
    } else if (target === 'logo' || target === 'foundation-logo') {
      upsert.run('logo_url', fileUrl);
    }

    logAudit(
      'IMAGE_UPLOADED',
      req.user.full_name,
      req.user.role,
      'Settings',
      target || 'general',
      `Uploaded image asset (${target}): ${fileUrl}`
    );

    return res.json({
      success: true,
      message: `Image uploaded successfully for ${target || 'asset'}!`,
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: 'Image upload failed: ' + error.message });
  }
});

// Admin: Update Organization Settings (Super Admin / NGO Admin)
router.put('/', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid settings payload.' });
  }

  const upsert = db.prepare(`
    INSERT INTO organization_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);

  for (const [key, val] of Object.entries(updates)) {
    const stringVal = typeof val === 'string' ? val : JSON.stringify(val);
    upsert.run(key, stringVal);
  }

  logAudit(
    'SETTINGS_UPDATED',
    req.user.full_name,
    req.user.role,
    'Settings',
    'org_settings',
    `Updated organization legal and disclosure parameters`
  );

  const rows = db.prepare('SELECT key, value FROM organization_settings').all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = parseSettingValue(row.value);
  }

  return res.json({
    success: true,
    message: 'All organization information and settings updated successfully.',
    settings
  });
});

module.exports = router;
