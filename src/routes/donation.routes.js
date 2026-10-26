const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate, authorize, logAudit } = require('../auth');

// Public: Get donation gateway configuration & bank details
router.get('/config', (req, res) => {
  const keys = [
    'donation_enabled', 'donation_upi_id', 'donation_upi_qr',
    'donation_bank_name', 'donation_account_name', 'donation_account_number',
    'donation_ifsc', 'donation_branch', 'donation_80g_note',
    'razorpay_enabled', 'razorpay_key_id'
  ];

  const rows = db.prepare(`SELECT key, value FROM organization_settings WHERE key IN (${keys.map(() => '?').join(',')})`).all(...keys);
  const config = {};
  for (const r of rows) {
    let val = r.value;
    if (val === 'true') val = true;
    if (val === 'false') val = false;
    config[r.key] = val;
  }

  // Fallbacks if not configured yet
  config.donation_enabled = config.donation_enabled !== false;
  config.donation_upi_id = config.donation_upi_id || 'ri8winfoundation@upi';
  config.donation_bank_name = config.donation_bank_name || 'State Bank of India';
  config.donation_account_name = config.donation_account_name || 'RI8WIN NOBEL PATH FOUNDATION';
  config.donation_account_number = config.donation_account_number || '4815492026001';
  config.donation_ifsc = config.donation_ifsc || 'SBIN0012345';
  config.donation_branch = config.donation_branch || 'Kalamboli, Navi Mumbai, Maharashtra - 410218';
  config.donation_80g_note = config.donation_80g_note || 'RI8WIN NOBEL PATH FOUNDATION is registered under Section 8 of the Companies Act, 2013 (CIN: U88900MH2026NPL481549). All contributions are dedicated 100% towards charitable programs in free digital education, health camps, and community afforestation.';

  return res.json({ success: true, config });
});

// Public: Record voluntary donation and generate official receipt
router.post('/record', (req, res) => {
  try {
    const {
      donor_name,
      donor_email,
      donor_phone = '',
      donor_pan = '',
      donor_address = '',
      amount,
      cause = 'General Charitable Corpus',
      payment_method = 'UPI',
      payment_gateway = 'Direct UPI / QR',
      gateway_payment_id = '',
      gateway_order_id = ''
    } = req.body;

    if (!donor_name || !donor_name.trim()) {
      return res.status(400).json({ success: false, message: 'Donor name is required.' });
    }
    if (!donor_email || !donor_email.trim()) {
      return res.status(400).json({ success: false, message: 'Valid email address is required for donation receipt.' });
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please specify a valid contribution amount.' });
    }

    // Generate unique receipt number: RI8-DON-2026-XXXXX
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `RI8-DON-2026-${randomSuffix}`;

    const insert = db.prepare(`
      INSERT INTO donations (
        receipt_number, donor_name, donor_email, donor_phone, donor_pan, donor_address,
        amount, currency, cause, payment_method, payment_gateway, gateway_payment_id,
        gateway_order_id, payment_status, tax_exemption_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, 'Completed', ?)
    `);

    const taxNote = 'RI8WIN NOBEL PATH FOUNDATION is a registered Section 8 Non-Profit Company (CIN: U88900MH2026NPL481549). Contributions are applied 100% towards charitable non-profit objectives.';

    const result = insert.run(
      receiptNumber,
      donor_name.trim(),
      donor_email.trim(),
      donor_phone.trim(),
      (donor_pan || '').trim().toUpperCase(),
      (donor_address || '').trim(),
      numAmount,
      cause.trim(),
      payment_method.trim(),
      payment_gateway.trim(),
      (gateway_payment_id || `TXN-${Date.now()}`).trim(),
      gateway_order_id.trim(),
      taxNote
    );

    const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Thank you for your generous support! Your donation receipt has been generated.',
      receipt_number: receiptNumber,
      donation
    });
  } catch (error) {
    console.error('Error recording donation:', error);
    return res.status(500).json({ success: false, message: 'Failed to record donation: ' + error.message });
  }
});

// Public: Get official donation receipt by receipt number
router.get('/receipt/:receiptNumber', (req, res) => {
  const receiptNumber = req.params.receiptNumber.trim().toUpperCase();
  const donation = db.prepare('SELECT * FROM donations WHERE UPPER(receipt_number) = ?').get(receiptNumber);

  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation receipt not found.' });
  }

  return res.json({
    success: true,
    receipt: {
      ...donation,
      organization_name: 'RI8WIN NOBEL PATH FOUNDATION',
      cin: 'U88900MH2026NPL481549',
      pan: 'AAQCR4085D',
      tan: 'PNER43317B',
      registered_office: 'The Springs 2, 701, Plot No 15, Sector 20, Roadpali, Kalamboli, Navi Mumbai, Maharashtra - 410218, India',
      authorized_signatory: 'Ms. Shilpa Sunil Umare & Ms. Sarika Uttamchand Wakde, Directors'
    }
  });
});

// Admin: Get all donation records and summary stats
router.get('/admin/all', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  const donations = db.prepare('SELECT * FROM donations ORDER BY id DESC').all();
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_donations,
      COALESCE(SUM(amount), 0) as total_amount,
      COUNT(DISTINCT donor_email) as unique_donors
    FROM donations
  `).get();

  return res.json({ success: true, donations, stats });
});

// Admin: Delete / void donation record
router.delete('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    db.prepare('DELETE FROM donations WHERE id = ?').run(id);

    logAudit(
      'DONATION_DELETED',
      req.user.full_name,
      req.user.role,
      'Donation',
      String(id),
      `Deleted donation record: ${existing.receipt_number} (₹${existing.amount} by ${existing.donor_name})`
    );

    return res.json({ success: true, message: 'Donation record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting donation:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete donation: ' + error.message });
  }
});

module.exports = router;
