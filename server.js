const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { initSchema } = require('./src/db');

// Ensure required runtime directories exist
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'src', 'uploads'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

// Initialize database schema and verify seed data
initSchema();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/volunteer', require('./src/routes/volunteer.routes'));
app.use('/api/certificate', require('./src/routes/certificate.routes'));
app.use('/api/programs', require('./src/routes/program.routes'));
app.use('/api/events', require('./src/routes/event.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/settings', require('./src/routes/settings.routes'));
app.use('/api/news', require('./src/routes/news.routes'));
app.use('/api/pages', require('./src/routes/pages.routes'));
app.use('/api/donations', require('./src/routes/donation.routes'));
app.use('/api/letters', require('./src/routes/letters.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    organization: 'RI8WIN NOBEL PATH FOUNDATION',
    legal_type: 'Section 8 Non-Profit (Companies Act, 2013)',
    cin: 'U88900MH2026NPL481549',
    timestamp: new Date().toISOString()
  });
});

// Single Page Application Fallback (Express 5 compatible)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

const server = app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`RI8WIN NOBEL PATH FOUNDATION - Official Management Portal`);
  console.log(`Section 8 Non-Profit Organization (CIN: U88900MH2026NPL481549)`);
  console.log(`Server actively running on: http://localhost:${PORT}`);
  console.log(`================================================================`);
});

module.exports = { app, server };
