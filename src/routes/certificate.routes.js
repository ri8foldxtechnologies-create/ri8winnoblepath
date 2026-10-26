const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');
const { authenticate, authorize, optionalAuth, logAudit } = require('../auth');

// Public Certificate Verification Endpoint
router.get('/verify/:certNumber', (req, res) => {
  const certNumber = req.params.certNumber.trim().toUpperCase();

  const cert = db.prepare(`
    SELECT c.*, v.status as volunteer_status, v.full_name as v_name, v.membership_id as v_mem_id,
           v.city, v.state
    FROM certificates c
    LEFT JOIN volunteer_applications v ON c.application_id = v.id
    WHERE UPPER(c.certificate_number) = ?
  `).get(certNumber);

  if (!cert) {
    // Check executive_members in organization_settings
    const execRow = db.prepare('SELECT value FROM organization_settings WHERE key = ?').get('executive_members');
    if (execRow && execRow.value) {
      try {
        const members = JSON.parse(execRow.value);
        const member = members.find(m => 
          (m.certificate_number && m.certificate_number.toUpperCase() === certNumber) ||
          (m.membership_id && m.membership_id.toUpperCase() === certNumber)
        );
        if (member) {
          return res.json({
            success: true,
            status: 'VALID',
            certificate: {
              certificate_number: member.certificate_number || `CERT-HON-${member.membership_id}`,
              volunteer_name: member.name,
              designation: member.role,
              membership_id: member.membership_id,
              issue_date: member.appointment_date,
              organization_name: 'RI8WIN NOBEL PATH FOUNDATION',
              legal_identity: 'Section 8 Non-Profit Organization (Companies Act, 2013), CIN: U88900MH2026NPL481549',
              authorized_signatory: 'Ms. Shilpa Sunil Umare & Ms. Sarika Uttamchand Wakde, Directors',
              membership_status: 'Executive Member & Office Bearer (Honorary)',
              validity_status: 'Active (Honorary - Without Salary as per Section 8 Rule)',
              is_executive: true,
              honorary_terms: member.honorary_terms || 'Honorary Office Bearer • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.',
              section_8_declaration: 'Appointed in an Honorary capacity under Section 8(1)(b) & Section 8(1)(c) of the Companies Act, 2013. Serving purely without salary, remuneration, commission, or dividend in pursuit of charitable objectives.'
            }
          });
        }
      } catch (e) {}
    }

    return res.status(404).json({
      success: false,
      status: 'NOT_FOUND',
      message: 'Certificate not found. The certificate number does not match any official record of RI8WIN NOBEL PATH FOUNDATION.'
    });
  }

  const isRevoked = cert.status === 'Revoked';

  return res.json({
    success: true,
    status: isRevoked ? 'REVOKED' : 'VALID',
    certificate: {
      certificate_number: cert.certificate_number,
      volunteer_name: cert.volunteer_name,
      membership_id: cert.membership_id,
      certificate_type: cert.certificate_type || 'Volunteer Service',
      role_title: cert.role_title || cert.volunteer_status || 'Volunteer Member',
      tenure_or_hours: cert.tenure_or_hours || '100+ Hours Community Service',
      remarks: cert.remarks || '',
      issue_date: cert.issue_date,
      organization_name: 'RI8WIN NOBEL PATH FOUNDATION',
      legal_identity: 'Section 8 Non-Profit Organization, CIN: U88900MH2026NPL481549',
      authorized_signatory: cert.authorized_signatory,
      membership_status: cert.volunteer_status || cert.status,
      validity_status: cert.status,
      revocation_date: cert.revocation_date,
      revocation_reason: cert.revocation_reason
    }
  });
});

// Download Official PDF Certificate
router.get('/download/:certNumber', optionalAuth, async (req, res) => {
  try {
    const certNumber = req.params.certNumber.trim().toUpperCase();

    const cert = db.prepare(`
      SELECT c.*, v.status as volunteer_status, v.full_name as v_name, v.membership_id as v_mem_id,
             v.application_ref, v.user_id, v.email
      FROM certificates c
      LEFT JOIN volunteer_applications v ON c.application_id = v.id
      WHERE UPPER(c.certificate_number) = ?
    `).get(certNumber);

    if (!cert) {
      // Check executive_members in organization_settings
      const execRow = db.prepare('SELECT value FROM organization_settings WHERE key = ?').get('executive_members');
      if (execRow && execRow.value) {
        try {
          const members = JSON.parse(execRow.value);
          const member = members.find(m => 
            (m.certificate_number && m.certificate_number.toUpperCase() === certNumber) ||
            (m.membership_id && m.membership_id.toUpperCase() === certNumber)
          );
          if (member) {
            return generateExecutivePdf(req, res, member);
          }
        } catch (e) {}
      }
      return res.status(404).send('Certificate not found in official foundation records.');
    }

    if (cert.status === 'Revoked') {
      return res.status(410).send(`This certificate (${cert.certificate_number}) has been REVOKED. Reason: ${cert.revocation_reason || 'Administrative action'}. It is no longer valid.`);
    }

    // Determine host URL for QR code
    const host = req.get('host');
    const protocol = req.protocol || 'http';
    const verifyUrl = `${protocol}://${host}/#verify?certNumber=${encodeURIComponent(cert.certificate_number)}`;

    // Generate QR Code Buffer
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#1b4332',
        light: '#ffffff'
      }
    });

    // Create A4 Landscape PDF (841.89 x 595.28 points)
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 30,
      info: {
        Title: `Certificate of Volunteer Membership - ${cert.volunteer_name}`,
        Author: 'RI8WIN NOBEL PATH FOUNDATION',
        Subject: 'Official Volunteer Membership Certificate',
        Keywords: 'RI8WIN, Noble Path, Section 8, NGO, Volunteer Certificate'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Certificate-${cert.membership_id}.pdf"`);

    doc.pipe(res);

    const width = 841.89;
    const height = 595.28;

    // --- Decorative Certificate Borders ---
    // Outer Border (Forest Green)
    doc.rect(20, 20, width - 40, height - 40)
      .lineWidth(3.5)
      .stroke('#1b4332');

    // Inner Border (Subtle Gold)
    doc.rect(27, 27, width - 54, height - 54)
      .lineWidth(1.2)
      .stroke('#d4af37');

    // Thin accent inner border
    doc.rect(32, 32, width - 64, height - 64)
      .lineWidth(0.5)
      .stroke('#1b4332');

    // Corner decorative corner accents
    const corners = [
      [36, 36],
      [width - 36, 36],
      [36, height - 36],
      [width - 36, height - 36]
    ];
    corners.forEach(([cx, cy]) => {
      doc.circle(cx, cy, 3).fill('#d4af37');
    });

    // Header Emblem / Logo Banner if available
    const bannerPath = path.join(__dirname, '..', 'public', 'assets', 'Banner.png');
    if (fs.existsSync(bannerPath)) {
      try {
        // Draw banner logo nicely centered at top
        doc.image(bannerPath, width / 2 - 110, 42, { width: 220, fit: [220, 48], align: 'center' });
      } catch (e) {
        // Fallback text if image error
      }
    }

    // Top Foundation Legal Header
    doc.moveDown(2);
    doc.font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#1b4332')
      .text('RI8WIN NOBEL PATH FOUNDATION', 50, 95, { align: 'center', characterSpacing: 1.5 });

    doc.font('Helvetica')
      .fontSize(9.5)
      .fillColor('#4b5563')
      .text('(A Section 8 Non-Profit Company incorporated under the Companies Act, 2013, Ministry of Corporate Affairs, Govt. of India)', 50, 122, { align: 'center' });

    doc.fontSize(8.5)
      .fillColor('#6b7280')
      .text('Corporate Identity Number (CIN): U88900MH2026NPL481549  |  PAN: AAQCR4085D', 50, 137, { align: 'center' });

    // Gold separator line
    doc.moveTo(180, 153).lineTo(width - 180, 153).lineWidth(1).stroke('#d4af37');

    // Certificate Title
    doc.font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#1b4332')
      .text('CERTIFICATE OF VOLUNTEER MEMBERSHIP', 50, 168, { align: 'center', characterSpacing: 1 });

    doc.font('Helvetica-Oblique')
      .fontSize(10.5)
      .fillColor('#0d9488')
      .text('Noble RI8 Framework  •  Right Noble Path Initiative', 50, 192, { align: 'center' });

    // Certificate Body Text
    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('#374151')
      .text('This is to certify that', 50, 222, { align: 'center' });

    // Volunteer Name (Large, Bold & Highlighted)
    doc.font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#1b4332')
      .text(cert.volunteer_name, 50, 244, { align: 'center' });

    // Underline for name
    const textWidth = doc.widthOfString(cert.volunteer_name);
    const startX = (width - textWidth) / 2;
    doc.moveTo(Math.max(120, startX - 20), 273).lineTo(Math.min(width - 120, startX + textWidth + 20), 273).lineWidth(0.8).stroke('#d4af37');

    // Suggested Official Wording from Part 6
    doc.font('Helvetica')
      .fontSize(11.5)
      .fillColor('#374151')
      .text(
        'has been verified and approved as a volunteer member of RI8WIN NOBEL PATH FOUNDATION.',
        80, 285, { align: 'center', width: width - 160 }
      );

    doc.font('Helvetica')
      .fontSize(10.5)
      .fillColor('#4b5563')
      .text(
        "The volunteer is recognized as a member of the Foundation's volunteer network and is encouraged to contribute towards education, health awareness, environmental sustainability, community welfare, and the Right Noble Path philosophy.",
        100, 310, { align: 'center', width: width - 200, lineGap: 3 }
      );

    // Membership Details Box
    const boxY = 370;
    doc.rect(80, boxY, width - 160, 48)
      .fillAndStroke('#f0fdf4', '#86efac');

    doc.font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor('#166534')
      .text('MEMBERSHIP ID:', 95, boxY + 12);
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#1b4332')
      .text(cert.membership_id, 95, boxY + 28);

    doc.font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor('#166534')
      .text('CERTIFICATE NUMBER:', 270, boxY + 12);
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#1b4332')
      .text(cert.certificate_number, 270, boxY + 28);

    doc.font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor('#166534')
      .text('DATE OF ISSUANCE:', 480, boxY + 12);
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#1b4332')
      .text(cert.issue_date, 480, boxY + 28);

    doc.font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor('#166534')
      .text('STATUS:', 650, boxY + 12);
    doc.font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#059669')
      .text('ACTIVE & VERIFIED', 650, boxY + 28);

    // Bottom Section: Signatory & QR Code
    const bottomY = 445;

    // Authorized Signatory
    doc.moveTo(100, bottomY + 50).lineTo(280, bottomY + 50).lineWidth(1).stroke('#9ca3af');
    doc.font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#1b4332')
      .text('Ms. Shilpa Sunil Umare', 100, bottomY + 56);
    doc.font('Helvetica')
      .fontSize(9)
      .fillColor('#4b5563')
      .text('Founder & Director', 100, bottomY + 70);
    doc.text('RI8WIN NOBEL PATH FOUNDATION', 100, bottomY + 83);

    // Official Seal Emblem in Center
    doc.circle(width / 2, bottomY + 55, 34).lineWidth(1.5).stroke('#d4af37');
    doc.circle(width / 2, bottomY + 55, 30).lineWidth(0.5).stroke('#1b4332');
    doc.font('Helvetica-Bold')
      .fontSize(7.5)
      .fillColor('#1b4332')
      .text('OFFICIAL SEAL', width / 2 - 30, bottomY + 45, { width: 60, align: 'center' });
    doc.fontSize(6.5)
      .fillColor('#0d9488')
      .text('RI8WIN • SECTION 8', width / 2 - 30, bottomY + 57, { width: 60, align: 'center' });

    // Real QR Code on Right
    doc.image(qrBuffer, width - 210, bottomY + 15, { width: 75, height: 75 });
    doc.font('Helvetica')
      .fontSize(7)
      .fillColor('#6b7280')
      .text('Scan to Verify Authenticity', width - 225, bottomY + 95, { width: 105, align: 'center' });

    // Footer Micro-disclaimer
    doc.font('Helvetica')
      .fontSize(7.5)
      .fillColor('#9ca3af')
      .text(
        'This certificate is an official electronic record generated upon formal NGO board verification. To verify authenticity, scan the QR code or visit the verification portal at https://ri8winnobelpath.org',
        50, height - 38, { align: 'center', width: width - 100 }
      );

    doc.end();

  } catch (error) {
    console.error('Error generating PDF certificate:', error);
    if (!res.headersSent) {
      res.status(500).send('Error generating certificate: ' + error.message);
    }
  }
});

async function generateExecutivePdf(req, res, member) {
  try {
    const host = req.get('host');
    const protocol = req.protocol || 'http';
    const certNumber = member.certificate_number || `CERT-HON-${member.membership_id}`;
    const verifyUrl = `${protocol}://${host}/#verify?certNumber=${encodeURIComponent(certNumber)}`;

    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0369a1',
        light: '#ffffff'
      }
    });

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 30,
      info: {
        Title: `Certificate of Honorary Appointment - ${member.name}`,
        Author: 'RI8WIN NOBEL PATH FOUNDATION',
        Subject: 'Section 8 Honorary Office Bearer & Member Certificate',
        Keywords: 'RI8WIN, Section 8, Honorary Member, Without Salary, Non-Profit'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Honorary-Certificate-${member.membership_id}.pdf"`);
    doc.pipe(res);

    const width = 841.89;
    const height = 595.28;

    // Outer Border (Sky Blue)
    doc.rect(20, 20, width - 40, height - 40)
      .lineWidth(3.5)
      .stroke('#0284c7');

    // Inner Border (Gold Accent)
    doc.rect(27, 27, width - 54, height - 54)
      .lineWidth(1.2)
      .stroke('#d97706');

    // Thin Accent
    doc.rect(32, 32, width - 64, height - 64)
      .lineWidth(0.5)
      .stroke('#0369a1');

    // Header
    doc.font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#0284c7')
      .text('GOVERNMENT OF INDIA • MINISTRY OF CORPORATE AFFAIRS', 0, 50, { align: 'center', width });

    doc.font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#0369a1')
      .text('RI8WIN NOBEL PATH FOUNDATION', 0, 68, { align: 'center', width });

    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#475569')
      .text('Section 8 Non-Profit Organization (Companies Act, 2013) | CIN: U88900MH2026NPL481549', 0, 95, { align: 'center', width });

    // Banner Ribbon
    const ribbonY = 120;
    doc.rect(140, ribbonY, width - 280, 28)
      .fillAndStroke('#e0f2fe', '#38bdf8');

    doc.font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#0369a1')
      .text('OFFICIAL CERTIFICATE OF HONORARY APPOINTMENT & MEMBERSHIP', 140, ribbonY + 8, {
        align: 'center',
        width: width - 280
      });

    // Presentation text
    doc.font('Helvetica-Oblique')
      .fontSize(11)
      .fillColor('#64748b')
      .text('This is to officially certify the appointment of', 0, 168, { align: 'center', width });

    // Member Name
    doc.font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#0f172a')
      .text(member.name, 0, 190, { align: 'center', width });

    // Designation / Role
    doc.font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('#0284c7')
      .text(member.role, 0, 222, { align: 'center', width });

    // Section 8 Statutory Non-Profit & Non-Remuneration Declaration
    const declY = 250;
    doc.rect(80, declY, width - 160, 96)
      .fillAndStroke('#ffffff', '#cbd5e1');

    doc.font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor('#b45309')
      .text('STATUTORY DECLARATION UNDER SECTION 8 OF THE COMPANIES ACT, 2013:', 95, declY + 10, { width: width - 190 });

    doc.font('Helvetica')
      .fontSize(8.5)
      .fillColor('#334155')
      .text(
        'In strict compliance with Section 8(1)(b) & Section 8(1)(c) of the Companies Act, 2013 (Govt. of India), RI8WIN NOBEL PATH FOUNDATION operates exclusively as a non-profit company with its income applied solely to charitable objects. This appointment is held entirely in an HONORARY CAPACITY WITHOUT ANY SALARY, REMUNERATION, COMMISSION, DIVIDEND, OR PROFIT SHARE. The appointee undertakes to advance the Foundation’s Noble RI8 framework across Education, Health, and Environment with utmost integrity.',
        95, declY + 28, { width: width - 190, lineGap: 3 }
      );

    // Meta Box
    const boxY = 360;
    doc.rect(80, boxY, width - 160, 48)
      .fillAndStroke('#f0f9ff', '#7dd3fc');

    doc.font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#0369a1')
      .text('MEMBERSHIP ID:', 95, boxY + 10);
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#0f172a')
      .text(member.membership_id, 95, boxY + 26);

    doc.font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#0369a1')
      .text('CERTIFICATE NUMBER:', 270, boxY + 10);
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#0f172a')
      .text(certNumber, 270, boxY + 26);

    doc.font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#0369a1')
      .text('APPOINTMENT DATE:', 480, boxY + 10);
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#0f172a')
      .text(member.appointment_date || '06 October 2026', 480, boxY + 26);

    doc.font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#0369a1')
      .text('STATUS:', 650, boxY + 10);
    doc.font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor('#0284c7')
      .text('HONORARY (NO SALARY)', 650, boxY + 26);

    // Bottom Section: Signatories & QR
    const bottomY = 430;

    // Signatory 1
    doc.moveTo(80, bottomY + 50).lineTo(230, bottomY + 50).lineWidth(1).stroke('#94a3b8');
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0369a1').text('Ms. Shilpa Sunil Umare', 80, bottomY + 56);
    doc.font('Helvetica').fontSize(8.5).fillColor('#64748b').text('Director & Co-Founder', 80, bottomY + 69);
    doc.text('RI8WIN NOBEL PATH FOUNDATION', 80, bottomY + 81);

    // Signatory 2
    doc.moveTo(270, bottomY + 50).lineTo(420, bottomY + 50).lineWidth(1).stroke('#94a3b8');
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0369a1').text('Ms. Sarika Uttamchand Wakde', 270, bottomY + 56);
    doc.font('Helvetica').fontSize(8.5).fillColor('#64748b').text('Director & Co-Founder', 270, bottomY + 69);
    doc.text('RI8WIN NOBEL PATH FOUNDATION', 270, bottomY + 81);

    // Seal
    doc.circle(530, bottomY + 50, 30).lineWidth(1.5).stroke('#d97706');
    doc.circle(530, bottomY + 50, 26).lineWidth(0.5).stroke('#0284c7');
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#0369a1').text('OFFICIAL SEAL', 500, bottomY + 42, { width: 60, align: 'center' });
    doc.fontSize(6).fillColor('#0284c7').text('SECTION 8 NGO', 500, bottomY + 53, { width: 60, align: 'center' });

    // QR Code
    doc.image(qrBuffer, width - 190, bottomY + 15, { width: 75, height: 75 });
    doc.font('Helvetica').fontSize(7).fillColor('#64748b').text('Scan to Verify Online', width - 205, bottomY + 95, { width: 105, align: 'center' });

    doc.font('Helvetica')
      .fontSize(7.5)
      .fillColor('#94a3b8')
      .text(
        'Official statutory certificate issued under Section 8 of the Companies Act, 2013. Non-transferable. To verify authenticity online, scan the QR code.',
        50, height - 32, { align: 'center', width: width - 100 }
      );

    doc.end();
  } catch (err) {
    console.error('Error generating executive certificate:', err);
    if (!res.headersSent) {
      res.status(500).send('Error generating certificate: ' + err.message);
    }
  }
}

// Admin: Get all certificates
router.get('/admin/all', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  const { search, type } = req.query;

  let query = `
    SELECT c.*, v.full_name as v_full_name, v.email as v_email, v.phone as v_phone, v.city as v_city
    FROM certificates c
    LEFT JOIN volunteer_applications v ON c.application_id = v.id
  `;
  const conditions = [];
  const params = [];

  if (type && type !== 'All') {
    conditions.push('c.certificate_type = ?');
    params.push(type);
  }

  if (search && search.trim()) {
    conditions.push('(c.volunteer_name LIKE ? OR c.certificate_number LIKE ? OR c.membership_id LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY c.id DESC';

  const certificates = db.prepare(query).all(...params);
  return res.json({ success: true, certificates });
});

// Admin: Directly issue a Certificate (Volunteer, Member, Executive, Appreciation)
router.post('/admin/issue', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const {
      recipient_name,
      certificate_type = 'Volunteer Service',
      role_title = 'Volunteer Member',
      membership_id,
      issue_date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      tenure_or_hours = '100+ Hours Community Service',
      remarks = 'Issued with honor for exemplary dedication towards Section 8 charitable objectives.',
      authorized_signatory = 'Ms. Shilpa Sunil Umare & Ms. Sarika Uttamchand Wakde, Directors'
    } = req.body;

    if (!recipient_name || !recipient_name.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient name is required.' });
    }

    // Auto-generate membership_id if not provided
    let memId = (membership_id || '').trim();
    if (!memId) {
      const prefix = certificate_type.toLowerCase().includes('member') ? 'RI8-MEM' : 'RI8-VOL';
      memId = `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Auto-generate unique certificate number: CERT-RI8-2026-XXXXX
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const certNumber = `CERT-RI8-2026-${randomSuffix}`;

    const insert = db.prepare(`
      INSERT INTO certificates (
        certificate_number, application_id, volunteer_name, membership_id, issue_date,
        status, certificate_type, role_title, tenure_or_hours, remarks, authorized_signatory
      ) VALUES (?, NULL, ?, ?, ?, 'Issued', ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      certNumber,
      recipient_name.trim(),
      memId,
      issue_date.trim(),
      certificate_type.trim(),
      role_title.trim(),
      tenure_or_hours.trim(),
      remarks.trim(),
      authorized_signatory.trim()
    );

    logAudit(
      'CERTIFICATE_ISSUED',
      req.user.full_name,
      req.user.role,
      'Certificate',
      certNumber,
      `Directly issued ${certificate_type} certificate (${certNumber}) to ${recipient_name.trim()}`
    );

    const certificate = db.prepare('SELECT * FROM certificates WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({
      success: true,
      message: `Certificate ${certNumber} generated and issued successfully!`,
      certificate
    });
  } catch (error) {
    console.error('Error directly issuing certificate:', error);
    return res.status(500).json({ success: false, message: 'Failed to issue certificate: ' + error.message });
  }
});

// Admin: Delete certificate
router.delete('/admin/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    db.prepare('DELETE FROM certificates WHERE id = ?').run(id);

    logAudit(
      'CERTIFICATE_DELETED',
      req.user.full_name,
      req.user.role,
      'Certificate',
      String(id),
      `Deleted certificate ${existing.certificate_number} (${existing.volunteer_name})`
    );

    return res.json({ success: true, message: 'Certificate deleted successfully.' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete certificate: ' + error.message });
  }
});

module.exports = router;
