// RI8WIN NOBEL PATH FOUNDATION - Advanced Admin & Public Portal Extensions
// Modules: Font Sizing, Image Uploaders, Direct Certificates, Official Letters,
// Dynamic Custom Pages, News & Activities Publication, and Section 8 Donations.

// ============================================================================
// 1. ACCESSIBILITY & FONT SIZING CONTROLLERS
// ============================================================================

function changeFontSize(size) {
  const root = document.documentElement;
  root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge');
  root.classList.add(`font-size-${size}`);

  document.querySelectorAll('.font-size-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-sky-700', 'text-white');
    btn.classList.add('text-slate-300');
  });

  const activeBtn = document.getElementById(`font-btn-${size}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-sky-700', 'text-white');
    activeBtn.classList.remove('text-slate-300');
  }

  localStorage.setItem('ri8_font_size', size);
}

function initAccessibility() {
  const savedSize = localStorage.getItem('ri8_font_size') || 'normal';
  changeFontSize(savedSize);

  if (localStorage.getItem('ri8_high_contrast') === 'true') {
    document.body.classList.add('high-contrast');
  }
}

function toggleHighContrast() {
  document.body.classList.toggle('high-contrast');
  const isHigh = document.body.classList.contains('high-contrast');
  localStorage.setItem('ri8_high_contrast', isHigh ? 'true' : 'false');
  showToast(isHigh ? 'High Contrast Mode Enabled' : 'Normal Contrast Restored', 'info');
}

// ============================================================================
// 2. DIRECT MEDIA & IMAGE UPLOADERS (WITHOUT MANUAL URLS)
// ============================================================================

// Upload member photo directly from file picker (for Directors & Executive Members)
async function uploadMemberPhotoDirectly(input, memberType) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const card = input.closest(memberType === 'director' ? '.cms-director-card' : '.cms-executive-card');
  if (!card) return;

  const btn = card.querySelector('button[onclick*="Upload Photo"]') || input.nextElementSibling;
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block">⏳</span> Uploading...`;
  }

  try {
    const res = await API.uploadImage(file, `${memberType}-photo`);
    if (res.success && res.url) {
      showToast('Photo uploaded successfully!', 'success');
      
      const photoInput = card.querySelector(memberType === 'director' ? '.dir-photo' : '.exec-photo');
      if (photoInput) {
        photoInput.value = res.url;
      }

      // Update thumbnail preview
      const previewImg = card.querySelector(memberType === 'director' ? '.dir-photo-preview' : '.exec-photo-preview');
      if (previewImg) {
        previewImg.src = res.url;
        previewImg.classList.remove('hidden');
      }
    }
  } catch (err) {
    showToast('Failed to upload photo: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText || `<span>📷</span> Upload Photo`;
    }
  }
}

// Upload official brand logo directly from file picker
async function handleLogoUpload(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const btn = document.getElementById('btn-upload-logo');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span> Uploading Logo...`;
  }

  try {
    const res = await API.uploadImage(file, 'foundation-logo');
    if (res.success && res.url) {
      showToast('Brand logo uploaded successfully!', 'success');
      
      // Save logo URL in organization settings
      await API.updateSettings({ logo_url: res.url });
      AppState.settings.logo_url = res.url;

      // Update logo preview in CMS
      const logoPreview = document.getElementById('cms-logo-preview');
      if (logoPreview) {
        logoPreview.src = res.url;
        logoPreview.classList.remove('hidden');
      }
      const logoPlaceholder = document.getElementById('cms-logo-placeholder');
      if (logoPlaceholder) logoPlaceholder.classList.add('hidden');
      const logoInput = document.getElementById('cms-logo-url-input');
      if (logoInput) logoInput.value = res.url;

      // Update live header & footer
      updateHeaderUI(AppState.settings);
      renderFooter(AppState.settings);
    }
  } catch (err) {
    showToast('Error uploading logo: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>📷</span> Upload New Logo File`;
    }
  }
}

// Reset logo to standard default badge
async function resetBrandLogo() {
  if (!confirm('Reset logo back to default R8 Badge?')) return;
  try {
    await API.updateSettings({ logo_url: '' });
    AppState.settings.logo_url = '';
    showToast('Logo reset to default badge.', 'info');

    const logoPreview = document.getElementById('cms-logo-preview');
    if (logoPreview) logoPreview.classList.add('hidden');
    const logoPlaceholder = document.getElementById('cms-logo-placeholder');
    if (logoPlaceholder) logoPlaceholder.classList.remove('hidden');
    const logoInput = document.getElementById('cms-logo-url-input');
    if (logoInput) logoInput.value = '';

    updateHeaderUI(AppState.settings);
    renderFooter(AppState.settings);
  } catch (err) {
    showToast('Error resetting logo: ' + err.message, 'error');
  }
}

// Upload Home Page Hero Image
async function handleHeroImageUpload(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const btn = document.getElementById('btn-upload-hero');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span> Uploading Hero Image...`;
  }

  try {
    const res = await API.uploadImage(file, 'hero-image');
    if (res.success && res.url) {
      showToast('Hero image uploaded successfully!', 'success');
      await API.updateSettings({ hero_image_url: res.url });
      AppState.settings.hero_image_url = res.url;

      const heroInput = document.getElementById('cms-hero-image-input');
      if (heroInput) heroInput.value = res.url;

      const heroPreview = document.getElementById('cms-hero-preview');
      if (heroPreview) {
        heroPreview.src = res.url;
        heroPreview.classList.remove('hidden');
      }
    }
  } catch (err) {
    showToast('Failed to upload hero image: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>📷</span> Upload Hero Image`;
    }
  }
}

// Upload banner image for dynamic pages
async function handlePageBannerUpload(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  try {
    const res = await API.uploadImage(file, 'page-banner');
    if (res.success && res.url) {
      showToast('Banner image uploaded!', 'success');
      const targetInput = document.getElementById('page-banner-input');
      if (targetInput) targetInput.value = res.url;
      const preview = document.getElementById('page-banner-preview');
      if (preview) {
        preview.src = res.url;
        preview.classList.remove('hidden');
      }
    }
  } catch (e) {
    showToast('Upload failed: ' + e.message, 'error');
  }
}

// Upload featured photo for News Articles
async function handleNewsImageUpload(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  try {
    const res = await API.uploadImage(file, 'news-photo');
    if (res.success && res.url) {
      showToast('News photo uploaded!', 'success');
      const targetInput = document.getElementById('news-image-input');
      if (targetInput) targetInput.value = res.url;
      const preview = document.getElementById('news-image-preview');
      if (preview) {
        preview.src = res.url;
        preview.classList.remove('hidden');
      }
    }
  } catch (e) {
    showToast('Upload failed: ' + e.message, 'error');
  }
}

// Upload custom UPI QR code image
async function handleUpiQrUpload(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  try {
    const res = await API.uploadImage(file, 'upi-qr');
    if (res.success && res.url) {
      showToast('UPI QR code uploaded!', 'success');
      await API.updateSettings({ donation_upi_qr: res.url });
      AppState.settings.donation_upi_qr = res.url;
      const preview = document.getElementById('cms-upi-qr-preview');
      if (preview) {
        preview.src = res.url;
        preview.classList.remove('hidden');
      }
    }
  } catch (e) {
    showToast('Upload failed: ' + e.message, 'error');
  }
}


// ============================================================================
// 3. ADMIN MODULE: ISSUE VOLUNTEER & MEMBER CERTIFICATES
// ============================================================================

async function loadAdminCertificatesTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  content.innerHTML = `
    <div class="space-y-6">
      <!-- Header & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
            <span>📜</span> Volunteer & Honorary Member Certificates
          </h3>
          <p class="text-xs text-gray-500">Directly issue, verify, download, and manage official digital certificates for volunteers, honorary members, and executive officers.</p>
        </div>
        <button type="button" onclick="openDirectCertIssueModal()" class="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
          <span>+</span> Issue New Certificate
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <label class="font-semibold text-gray-700">Filter Type:</label>
          <select id="cert-filter-type" onchange="filterCertificatesList()" class="p-1.5 rounded-lg border border-gray-300 bg-white">
            <option value="All">All Certificates</option>
            <option value="Volunteer Service">Volunteer Service</option>
            <option value="Honorary Membership">Honorary Membership</option>
            <option value="Executive Officer">Executive Office Bearer</option>
            <option value="Certificate of Appreciation">Appreciation & Commendation</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <input type="text" id="cert-search-input" onkeyup="if(event.key==='Enter') filterCertificatesList()" placeholder="Search recipient or cert no..." class="p-1.5 rounded-lg border border-gray-300 w-48 sm:w-64"/>
          <button type="button" onclick="filterCertificatesList()" class="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold">Search</button>
        </div>
      </div>

      <!-- Certificates Table Container -->
      <div id="admin-certs-table-container" class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div class="p-8 text-center text-gray-400 text-xs">Loading certificates...</div>
      </div>
    </div>
  `;

  await filterCertificatesList();
}

async function filterCertificatesList() {
  const container = document.getElementById('admin-certs-table-container');
  if (!container) return;

  const type = document.getElementById('cert-filter-type')?.value || 'All';
  const search = document.getElementById('cert-search-input')?.value || '';

  try {
    const res = await API.getAllCertificatesAdmin(type, search);
    const certs = (res && res.certificates) || [];

    if (certs.length === 0) {
      container.innerHTML = `
        <div class="p-10 text-center text-gray-500 space-y-2">
          <div class="text-3xl">📜</div>
          <div class="font-bold text-gray-700">No Certificates Found</div>
          <p class="text-xs text-gray-400">Click "+ Issue New Certificate" above to directly generate an official certificate.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-stone-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
            <tr>
              <th class="p-3 font-semibold">Certificate Number</th>
              <th class="p-3 font-semibold">Recipient Name</th>
              <th class="p-3 font-semibold">Category / Role</th>
              <th class="p-3 font-semibold">Issue Date</th>
              <th class="p-3 font-semibold">Status</th>
              <th class="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${certs.map(c => `
              <tr class="hover:bg-sky-50/40 transition">
                <td class="p-3 font-mono font-bold text-sky-900">${escapeHtml(c.certificate_number)}</td>
                <td class="p-3 font-medium text-gray-900">
                  <div>${escapeHtml(c.volunteer_name)}</div>
                  <div class="text-[11px] text-gray-400 font-mono">ID: ${escapeHtml(c.membership_id)}</div>
                </td>
                <td class="p-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                    c.certificate_type?.includes('Member') ? 'bg-purple-100 text-purple-800' :
                    c.certificate_type?.includes('Executive') ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-800'
                  }">
                    ${escapeHtml(c.certificate_type || 'Volunteer')}
                  </span>
                  <div class="text-[11px] text-gray-500 mt-0.5">${escapeHtml(c.role_title || '')}</div>
                </td>
                <td class="p-3 text-gray-600">${escapeHtml(c.issue_date)}</td>
                <td class="p-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'Issued' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }">
                    ${escapeHtml(c.status)}
                  </span>
                </td>
                <td class="p-3 text-right space-x-1 whitespace-nowrap">
                  <button type="button" onclick='openCertificatePrintModal(${JSON.stringify(c).replace(/'/g, "&apos;")})' class="px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-800 text-white font-semibold text-[11px] transition" title="Preview & Print Certificate">
                    👁️ Preview & Print
                  </button>
                  <a href="${API.getCertificateDownloadUrl(c.certificate_number)}" target="_blank" class="px-2 py-1 rounded bg-stone-700 hover:bg-stone-800 text-white font-semibold text-[11px] transition" title="Download PDF">
                    📄 PDF
                  </a>
                  <button type="button" onclick="deleteCertificateRecord(${c.id})" class="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition" title="Delete Certificate">
                    🗑️
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-rose-500 text-xs text-center">Failed to load certificates: ${err.message}</div>`;
  }
}

// Modal to directly issue a new Certificate
function openDirectCertIssueModal() {
  const modal = document.getElementById('generic-modal');
  if (!modal) return;

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const randomMem = 'RI8-MEM-2026-' + Math.floor(1000 + Math.random() * 9000);

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <button onclick="closeGenericModal()" class="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
      
      <div class="border-b pb-3">
        <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
          <span>📜</span> Issue Official Digital Certificate
        </h3>
        <p class="text-xs text-gray-500">Generate an authentic Section 8 certificate with verifiable QR code and registration number.</p>
      </div>

      <form onsubmit="handleDirectCertIssueSubmit(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-gray-700 mb-1">Recipient Full Name *</label>
          <input type="text" name="recipient_name" required placeholder="e.g. Rahul Sharma" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 font-medium"/>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Certificate Category *</label>
            <select name="certificate_type" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-medium">
              <option value="Volunteer Service">Volunteer Service Certificate</option>
              <option value="Honorary Membership">Honorary Membership Certificate</option>
              <option value="Executive Officer">Executive Office Bearer Certificate</option>
              <option value="Certificate of Appreciation">Certificate of Appreciation</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Designation / Role Title *</label>
            <input type="text" name="role_title" value="Volunteer Member" required class="w-full p-2.5 rounded-lg border border-gray-300"/>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Membership / Reg ID</label>
            <input type="text" name="membership_id" value="${randomMem}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono"/>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Date of Issuance *</label>
            <input type="text" name="issue_date" value="${today}" required class="w-full p-2.5 rounded-lg border border-gray-300"/>
          </div>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Tenure / Service Hours Description</label>
          <input type="text" name="tenure_or_hours" value="100+ Hours Dedicated Community Service" class="w-full p-2.5 rounded-lg border border-gray-300"/>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Special Citation / Remarks</label>
          <textarea name="remarks" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300">Awarded in recognition of exemplary selfless service in promoting education, community health, and environmental sustainability.</textarea>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Authorized Signatory</label>
          <input type="text" name="authorized_signatory" value="Ms. Shilpa Sunil Umare & Ms. Sarika Uttamchand Wakde, Directors" class="w-full p-2.5 rounded-lg border border-gray-300"/>
        </div>

        <div class="p-3 bg-sky-50 rounded-xl border border-sky-200 text-[11px] text-sky-900 leading-relaxed">
          ⚖️ <strong>Section 8 Statutory Notice:</strong> All certificates issued by RI8WIN NOBEL PATH FOUNDATION certify honorary non-remunerative participation in accordance with the Companies Act, 2013.
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" onclick="closeGenericModal()" class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold">Cancel</button>
          <button type="submit" class="px-5 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold shadow transition flex items-center gap-1.5">
            <span>📜</span> Generate & Issue Certificate
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
}

async function handleDirectCertIssueSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    recipient_name: form.recipient_name.value.trim(),
    certificate_type: form.certificate_type.value.trim(),
    role_title: form.role_title.value.trim(),
    membership_id: form.membership_id.value.trim(),
    issue_date: form.issue_date.value.trim(),
    tenure_or_hours: form.tenure_or_hours.value.trim(),
    remarks: form.remarks.value.trim(),
    authorized_signatory: form.authorized_signatory.value.trim()
  };

  try {
    const res = await API.issueCertificateDirectly(payload);
    if (res.success) {
      showToast(res.message, 'success');
      closeGenericModal();
      await filterCertificatesList();
      if (res.certificate) {
        openCertificatePrintModal(res.certificate);
      }
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCertificateRecord(id) {
  if (!confirm('Are you sure you want to permanently delete this certificate record?')) return;
  try {
    const res = await API.deleteCertificateAdmin(id);
    if (res.success) {
      showToast(res.message, 'success');
      await filterCertificatesList();
    }
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// Certificate Live Printable Preview Modal
function openCertificatePrintModal(c) {
  const modal = document.getElementById('generic-modal');
  if (!modal) return;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/#verify?cert=' + c.certificate_number)}`;

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b pb-3 no-print">
        <div class="font-bold text-sm text-[#0369a1] flex items-center gap-2">
          <span>📜</span> Official Certificate Preview (${escapeHtml(c.certificate_number)})
        </div>
        <div class="flex items-center gap-2">
          <button type="button" onclick="window.print()" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition cursor-pointer">
            <span>🖨️</span> Print / Save PDF
          </button>
          <a href="${API.getCertificateDownloadUrl(c.certificate_number)}" target="_blank" class="px-3.5 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-800 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition">
            <span>📄</span> Download Official PDF
          </a>
          <button onclick="closeGenericModal()" class="text-gray-400 hover:text-gray-700 text-xl font-bold ml-2">&times;</button>
        </div>
      </div>

      <!-- Printable Certificate Canvas -->
      <div class="printable-document p-8 sm:p-12 bg-white rounded-2xl border-4 border-double border-amber-600/60 shadow-lg text-center space-y-6 relative overflow-hidden">
        <!-- Top MCA Header -->
        <div class="space-y-1">
          <div class="text-[11px] font-bold uppercase tracking-widest text-sky-800">Ministry of Corporate Affairs, Government of India</div>
          <h2 class="text-2xl sm:text-3xl font-black text-sky-950 uppercase tracking-wider">RI8WIN NOBEL PATH FOUNDATION</h2>
          <div class="text-xs text-gray-500 font-mono">CIN: U88900MH2026NPL481549 • Section 8 Non-Profit Company (Companies Act, 2013)</div>
          <div class="text-[11px] text-gray-400">Regd. Office: Navi Mumbai, Maharashtra - 410218, India</div>
        </div>

        <div class="my-4">
          <span class="inline-block px-6 py-1.5 rounded-full bg-gradient-to-r from-sky-800 via-sky-700 to-sky-900 text-amber-300 font-serif uppercase tracking-widest text-xs font-bold shadow-sm">
            ${escapeHtml(c.certificate_type || 'Certificate of Volunteer Service')}
          </span>
        </div>

        <!-- Presented to -->
        <div class="space-y-2">
          <p class="text-xs text-gray-500 uppercase tracking-widest italic font-serif">This is to proudly certify that</p>
          <h1 class="text-2xl sm:text-4xl font-extrabold text-sky-900 tracking-wide font-serif">${escapeHtml(c.volunteer_name)}</h1>
          <p class="text-xs font-mono text-gray-600 font-semibold">Membership ID: ${escapeHtml(c.membership_id)} • Certificate No: ${escapeHtml(c.certificate_number)}</p>
        </div>

        <!-- Citation Body -->
        <div class="max-w-2xl mx-auto text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2">
          <p>
            Has actively served as an authorized <strong>${escapeHtml(c.role_title || 'Honorary Volunteer Member')}</strong> with <strong>RI8WIN NOBEL PATH FOUNDATION</strong> in advancing our statutory Section 8 charitable mandate in free digital education, preventive healthcare, and environmental afforestation.
          </p>
          ${c.tenure_or_hours ? `<p class="font-semibold text-sky-900">Contribution: ${escapeHtml(c.tenure_or_hours)}</p>` : ''}
          ${c.remarks ? `<p class="italic text-gray-600 text-xs">"${escapeHtml(c.remarks)}"</p>` : ''}
        </div>

        <!-- Statutory Honorary Clause -->
        <div class="text-[10px] text-gray-400 max-w-xl mx-auto border-t border-b border-gray-100 py-1.5 font-mono">
          STATUTORY DECLARATION: Rendered purely in an honorary capacity without salary, commercial remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.
        </div>

        <!-- Footer Signatures & QR -->
        <div class="grid grid-cols-3 items-end pt-6 text-xs text-gray-600">
          <div class="text-left space-y-1">
            <div class="w-32 border-b border-gray-400 pb-1 font-bold text-sky-900">Ms. Shilpa Sunil Umare</div>
            <div class="text-[10px] text-gray-500">Director & Co-Founder</div>
            <div class="text-[9px] text-gray-400">DIN: Registered</div>
          </div>

          <div class="flex flex-col items-center">
            <div class="w-16 h-16 rounded-full border-2 border-amber-500/80 bg-amber-50 flex items-center justify-center font-bold text-[8px] text-amber-900 uppercase text-center leading-tight shadow-inner">
              OFFICIAL SEAL<br/>SECTION 8 NGO
            </div>
            <div class="text-[10px] text-gray-500 mt-1">Issue Date: ${escapeHtml(c.issue_date)}</div>
          </div>

          <div class="flex flex-col items-end text-right space-y-1">
            <img src="${qrUrl}" alt="QR Code" class="w-16 h-16 border p-0.5 rounded shadow-xs"/>
            <div class="text-[9px] text-gray-400 font-mono">Scan to Verify Live</div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}


// ============================================================================
// 4. ADMIN MODULE: CREATE & ISSUE OFFICIAL EMPLOYEE / HONORARY LETTERS
// ============================================================================

const LETTER_TEMPLATES = {
  'Honorary Appointment Letter (Section 8 Compliant)': {
    title: 'OFFICIAL CONFIRMATION OF HONORARY APPOINTMENT',
    body: `Dear [Recipient Name],

On behalf of the Governing Board of RI8WIN NOBEL PATH FOUNDATION, we are pleased to confirm your appointment as [Role Title] of the Foundation with effect from [Effective Date].

1. STATUTORY SECTION 8 HONORARY STATUS (ZERO SALARY DISCLOSURE)
RI8WIN NOBEL PATH FOUNDATION is a non-profit company registered under Section 8 of the Companies Act, 2013 by the Central Registration Centre, Ministry of Corporate Affairs, Government of India (CIN: U88900MH2026NPL481549). In strict accordance with Section 8 statutory provisions, this position is purely in an honorary capacity without salary, commercial remuneration, stipend, bonus, or expectation of profit distribution.

2. CHARITABLE OBJECTIVES & KEY RESPONSIBILITIES
In your honorary capacity, you shall assist and guide our civic outreach programs across:
- Mobilizing youth and community volunteers for child digital literacy camps.
- Organizing public health awareness screenings and preventive nutrition drives.
- Leading native tree plantation and environmental conservation initiatives.
- Upholding child safeguarding and ethical volunteer guidelines.

3. TENURE & ETHICAL MANDATE
Your voluntary tenure is for a period of [Service Period], subject to mutual review. You agree to adhere strictly to the Foundation's Code of Conduct, child safeguarding rules, and the Digital Personal Data Protection Act, 2023.

We welcome you warmly and look forward to your valuable contribution towards our Right Noble Path mission.`
  },
  'Volunteer Experience / Service Letter': {
    title: 'OFFICIAL VOLUNTEER SERVICE & EXPERIENCE CERTIFICATE',
    body: `TO WHOMSOEVER IT MAY CONCERN

This is to certify that [Recipient Name] (Membership ID: [Membership ID]) has completed exemplary voluntary service with RI8WIN NOBEL PATH FOUNDATION (CIN: U88900MH2026NPL481549) as a [Role Title] during the service period [Service Period].

During their tenure, [Recipient Name] demonstrated sincere dedication, ethical conduct, and high enthusiasm across field activities including digital literacy workshops, health awareness camps, and community afforestation initiatives.

In accordance with Section 8 of the Companies Act, 2013, all service was rendered in an honorary, voluntary capacity without financial compensation. We appreciate their civic commitment and wish them the very best in all future academic, professional, and social endeavors.`
  },
  'Letter of Appreciation & Commendation': {
    title: 'LETTER OF COMMENDATION & APPRECIATION',
    body: `Dear [Recipient Name],

The Board of Directors of RI8WIN NOBEL PATH FOUNDATION conveys our profound appreciation for your outstanding dedication and exemplary leadership as [Role Title].

Your tireless voluntary contributions towards community welfare, youth enablement, and environmental preservation have created lasting grassroots impact in our targeted project areas.

Your selflessness reflects the true spirit of the Noble RI8 framework and Section 8 civic collaboration. We thank you for standing as a beacon of hope and positive social change.`
  },
  'Relieving & Service Completion Letter': {
    title: 'FORMAL RELIEVING & TENURE COMPLETION LETTER',
    body: `TO WHOMSOEVER IT MAY CONCERN

This is to confirm that [Recipient Name] (ID: [Membership ID]) has honorably completed their tenure as [Role Title] with RI8WIN NOBEL PATH FOUNDATION on [Effective Date].

[Recipient Name] has completed all voluntary assignments, handed over project documentation, and holds no pending administrative obligations towards the Foundation.

We place on record our sincere appreciation for their contributions and wish them continued success in their future career and civic pursuits.`
  },
  'Custom Official Letterhead Document': {
    title: 'OFFICIAL MEMORANDUM / CORRESPONDENCE',
    body: `Dear [Recipient Name],

This official communication is issued by RI8WIN NOBEL PATH FOUNDATION (CIN: U88900MH2026NPL481549, Section 8 Non-Profit Company, Ministry of Corporate Affairs, Government of India).

[Enter custom letter content here...]`
  }
};

async function loadAdminLettersTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
            <span>✉️</span> Official Letters & Employment Documents
          </h3>
          <p class="text-xs text-gray-500">Draft, issue, print, and archive official letters (Honorary Appointments, Volunteer Experience, Recommendations, Relieving Letters) on Foundation letterhead.</p>
        </div>
        <button type="button" onclick="openCreateLetterModal()" class="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
          <span>+</span> Create Official Letter
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <label class="font-semibold text-gray-700">Filter Type:</label>
          <select id="letter-filter-type" onchange="filterLettersList()" class="p-1.5 rounded-lg border border-gray-300 bg-white">
            <option value="All">All Letter Types</option>
            <option value="Honorary Appointment Letter (Section 8 Compliant)">Honorary Appointment</option>
            <option value="Volunteer Experience / Service Letter">Volunteer Experience</option>
            <option value="Letter of Appreciation & Commendation">Appreciation Letter</option>
            <option value="Relieving & Service Completion Letter">Relieving Letter</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <input type="text" id="letter-search-input" onkeyup="if(event.key==='Enter') filterLettersList()" placeholder="Search recipient or ref no..." class="p-1.5 rounded-lg border border-gray-300 w-48 sm:w-64"/>
          <button type="button" onclick="filterLettersList()" class="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold">Search</button>
        </div>
      </div>

      <!-- Letters Table Container -->
      <div id="admin-letters-table-container" class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div class="p-8 text-center text-gray-400 text-xs">Loading official letters...</div>
      </div>
    </div>
  `;

  await filterLettersList();
}

async function filterLettersList() {
  const container = document.getElementById('admin-letters-table-container');
  if (!container) return;

  const type = document.getElementById('letter-filter-type')?.value || 'All';
  const search = document.getElementById('letter-search-input')?.value || '';

  try {
    const res = await API.getLetters(type, search);
    const letters = (res && res.letters) || [];

    if (letters.length === 0) {
      container.innerHTML = `
        <div class="p-10 text-center text-gray-500 space-y-2">
          <div class="text-3xl">✉️</div>
          <div class="font-bold text-gray-700">No Official Letters Issued Yet</div>
          <p class="text-xs text-gray-400">Click "+ Create Official Letter" above to draft and issue formal documentation.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-stone-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
            <tr>
              <th class="p-3 font-semibold">Ref Number</th>
              <th class="p-3 font-semibold">Recipient</th>
              <th class="p-3 font-semibold">Letter Category</th>
              <th class="p-3 font-semibold">Issue Date</th>
              <th class="p-3 font-semibold">Status</th>
              <th class="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${letters.map(l => `
              <tr class="hover:bg-sky-50/40 transition">
                <td class="p-3 font-mono font-bold text-sky-900">${escapeHtml(l.reference_number)}</td>
                <td class="p-3">
                  <div class="font-medium text-gray-900">${escapeHtml(l.recipient_name)}</div>
                  <div class="text-[11px] text-gray-500">${escapeHtml(l.recipient_role)}</div>
                </td>
                <td class="p-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800">
                    ${escapeHtml(l.letter_type)}
                  </span>
                </td>
                <td class="p-3 text-gray-600">${escapeHtml(l.issue_date)}</td>
                <td class="p-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ${escapeHtml(l.status || 'Active')}
                  </span>
                </td>
                <td class="p-3 text-right space-x-1 whitespace-nowrap">
                  <button type="button" onclick='openLetterPrintModal(${JSON.stringify(l).replace(/'/g, "&apos;")})' class="px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-800 text-white font-semibold text-[11px] transition" title="Print Letterhead">
                    🖨️ View & Print
                  </button>
                  <button type="button" onclick="deleteLetterRecord(${l.id})" class="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition" title="Delete Letter">
                    🗑️
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-rose-500 text-xs text-center">Failed to load letters: ${err.message}</div>`;
  }
}

// Modal to create official letter
function openCreateLetterModal() {
  const modal = document.getElementById('generic-modal');
  if (!modal) return;

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const defaultTemplate = LETTER_TEMPLATES['Honorary Appointment Letter (Section 8 Compliant)'];

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <button onclick="closeGenericModal()" class="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
      
      <div class="border-b pb-3">
        <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
          <span>✉️</span> Create Official Letterhead Document
        </h3>
        <p class="text-xs text-gray-500">Issued under Section 8 of the Companies Act, 2013 on Foundation letterhead.</p>
      </div>

      <form onsubmit="handleCreateLetterSubmit(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-gray-700 mb-1">Letter Type *</label>
          <select id="letter-type-select" name="letter_type" onchange="onLetterTypeSelectChange(this)" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-medium">
            <option value="Honorary Appointment Letter (Section 8 Compliant)">Honorary Appointment Letter (Section 8 Compliant)</option>
            <option value="Volunteer Experience / Service Letter">Volunteer Experience / Service Letter</option>
            <option value="Letter of Appreciation & Commendation">Letter of Appreciation & Commendation</option>
            <option value="Relieving & Service Completion Letter">Relieving & Service Completion Letter</option>
            <option value="Custom Official Letterhead Document">Custom Official Letterhead Document</option>
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Recipient Full Name *</label>
            <input type="text" id="let-recip-name" name="recipient_name" required placeholder="e.g. Dr. Rajesh Sharma" onkeyup="updateLetterBodyPlaceholders()" class="w-full p-2.5 rounded-lg border border-gray-300"/>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Designation / Role *</label>
            <input type="text" id="let-recip-role" name="recipient_role" required value="Honorary Officer / Volunteer Lead" onkeyup="updateLetterBodyPlaceholders()" class="w-full p-2.5 rounded-lg border border-gray-300"/>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Email Address</label>
            <input type="email" name="recipient_email" placeholder="official@example.org" class="w-full p-2 rounded-lg border border-gray-300"/>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Mobile Number</label>
            <input type="tel" name="recipient_phone" placeholder="+91..." class="w-full p-2 rounded-lg border border-gray-300"/>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Membership / Emp ID</label>
            <input type="text" id="let-recip-id" name="membership_or_emp_id" value="RI8-HON-2026-001" onkeyup="updateLetterBodyPlaceholders()" class="w-full p-2 rounded-lg border border-gray-300 font-mono"/>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Date of Issuance *</label>
            <input type="text" name="issue_date" value="${today}" required class="w-full p-2 rounded-lg border border-gray-300"/>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Effective Date</label>
            <input type="text" id="let-eff-date" name="effective_date" value="${today}" onkeyup="updateLetterBodyPlaceholders()" class="w-full p-2 rounded-lg border border-gray-300"/>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Tenure / Service Period</label>
            <input type="text" id="let-serv-period" name="service_period" value="3 Years (Honorary)" onkeyup="updateLetterBodyPlaceholders()" class="w-full p-2 rounded-lg border border-gray-300"/>
          </div>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Residential / Postal Address</label>
          <input type="text" name="recipient_address" placeholder="Address, City, State..." class="w-full p-2 rounded-lg border border-gray-300"/>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Letter Title / Subject *</label>
          <input type="text" id="let-title-input" name="letter_title" value="${defaultTemplate.title}" required class="w-full p-2.5 rounded-lg border border-gray-300 font-bold text-[#0369a1]"/>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="font-bold text-gray-700">Official Letter Body *</label>
            <span class="text-[11px] text-gray-400">Section 8 honorary disclosures pre-loaded</span>
          </div>
          <textarea id="let-body-input" name="letter_body" rows="8" required class="w-full p-3 rounded-lg border border-gray-300 font-mono text-[11px] leading-relaxed">${defaultTemplate.body}</textarea>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Authorized Signatory</label>
          <input type="text" name="authorized_signatory" value="Ms. Shilpa Sunil Umare & Ms. Sarika Uttamchand Wakde, Directors" class="w-full p-2 rounded-lg border border-gray-300"/>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t">
          <button type="button" onclick="closeGenericModal()" class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold">Cancel</button>
          <button type="submit" class="px-5 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold shadow transition flex items-center gap-1.5">
            <span>✉️</span> Issue & Save Official Letter
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
}

function onLetterTypeSelectChange(select) {
  const type = select.value;
  const tpl = LETTER_TEMPLATES[type] || LETTER_TEMPLATES['Custom Official Letterhead Document'];
  const titleInput = document.getElementById('let-title-input');
  const bodyInput = document.getElementById('let-body-input');
  if (titleInput) titleInput.value = tpl.title;
  if (bodyInput) bodyInput.value = tpl.body;
  updateLetterBodyPlaceholders();
}

function updateLetterBodyPlaceholders() {
  const name = document.getElementById('let-recip-name')?.value || '[Recipient Name]';
  const role = document.getElementById('let-recip-role')?.value || '[Role Title]';
  const id = document.getElementById('let-recip-id')?.value || '[Membership ID]';
  const eff = document.getElementById('let-eff-date')?.value || '[Effective Date]';
  const period = document.getElementById('let-serv-period')?.value || '[Service Period]';

  const bodyInput = document.getElementById('let-body-input');
  if (!bodyInput) return;

  let text = bodyInput.value;
  text = text.replace(/\[Recipient Name\]/g, name);
  text = text.replace(/\[Role Title\]/g, role);
  text = text.replace(/\[Membership ID\]/g, id);
  text = text.replace(/\[Effective Date\]/g, eff);
  text = text.replace(/\[Service Period\]/g, period);
  bodyInput.value = text;
}

async function handleCreateLetterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    letter_type: form.letter_type.value.trim(),
    recipient_name: form.recipient_name.value.trim(),
    recipient_role: form.recipient_role.value.trim(),
    recipient_email: form.recipient_email.value.trim(),
    recipient_phone: form.recipient_phone.value.trim(),
    recipient_address: form.recipient_address.value.trim(),
    membership_or_emp_id: form.membership_or_emp_id.value.trim(),
    issue_date: form.issue_date.value.trim(),
    effective_date: form.effective_date.value.trim(),
    service_period: form.service_period.value.trim(),
    letter_title: form.letter_title.value.trim(),
    letter_body: form.letter_body.value.trim(),
    authorized_signatory: form.authorized_signatory.value.trim()
  };

  try {
    const res = await API.createLetter(payload);
    if (res.success) {
      showToast(res.message, 'success');
      closeGenericModal();
      await filterLettersList();
      if (res.letter) {
        openLetterPrintModal(res.letter);
      }
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteLetterRecord(id) {
  if (!confirm('Are you sure you want to delete this official letter record?')) return;
  try {
    const res = await API.deleteLetter(id);
    if (res.success) {
      showToast(res.message, 'success');
      await filterLettersList();
    }
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// Official Letterhead Print Modal
function openLetterPrintModal(l) {
  const modal = document.getElementById('generic-modal');
  if (!modal) return;

  const s = AppState.settings || {};

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b pb-3 no-print">
        <div class="font-bold text-sm text-[#0369a1] flex items-center gap-2">
          <span>✉️</span> Official Letterhead Preview (${escapeHtml(l.reference_number)})
        </div>
        <div class="flex items-center gap-2">
          <button type="button" onclick="window.print()" class="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer">
            <span>🖨️</span> Print on Letterhead
          </button>
          <button onclick="closeGenericModal()" class="text-gray-400 hover:text-gray-700 text-xl font-bold ml-2">&times;</button>
        </div>
      </div>

      <!-- Letterhead Paper Container -->
      <div class="printable-document p-8 sm:p-14 bg-white border border-gray-300 shadow-md text-xs sm:text-sm text-gray-800 space-y-6 font-serif leading-relaxed">
        <!-- Foundation Header Banner -->
        <div class="border-b-2 border-sky-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-xl sm:text-2xl font-black text-sky-950 uppercase tracking-wider font-sans">RI8WIN NOBEL PATH FOUNDATION</h1>
            <div class="text-[11px] text-gray-600 font-sans font-medium">A Section 8 Non-Profit Company under the Companies Act, 2013, Ministry of Corporate Affairs, India</div>
            <div class="text-[11px] text-sky-900 font-mono font-semibold">CIN: U88900MH2026NPL481549 • PAN: AAQCR4085D • TAN: PNER43317B</div>
          </div>
          <div class="text-right text-[11px] text-gray-500 font-sans space-y-0.5">
            <div>The Springs 2, 701, Plot 15, Sector 20</div>
            <div>Roadpali, Kalamboli, Navi Mumbai, MH - 410218</div>
            <div>Email: ${escapeHtml(s.official_email || 'contact@ri8winnobelpath.org')}</div>
            <div>Helpline: ${escapeHtml(s.official_phone || '+91 8691016082')}</div>
          </div>
        </div>

        <!-- Reference & Date Line -->
        <div class="flex justify-between items-center text-xs font-mono font-semibold text-gray-600 pt-1">
          <div>Ref No: <span class="text-sky-900">${escapeHtml(l.reference_number)}</span></div>
          <div>Date: ${escapeHtml(l.issue_date)}</div>
        </div>

        <!-- Addressee -->
        <div class="space-y-0.5 text-xs text-gray-900 font-sans">
          <div class="font-bold text-gray-500 uppercase text-[10px]">To,</div>
          <div class="font-bold text-sm text-sky-950">${escapeHtml(l.recipient_name)}</div>
          <div class="font-semibold text-sky-800">${escapeHtml(l.recipient_role)}</div>
          ${l.recipient_address ? `<div>${escapeHtml(l.recipient_address)}</div>` : ''}
          ${l.recipient_email ? `<div class="font-mono text-gray-500">${escapeHtml(l.recipient_email)}</div>` : ''}
        </div>

        <!-- Letter Subject -->
        <div class="pt-2">
          <div class="font-bold text-sm text-sky-950 uppercase tracking-wide border-b pb-1">
            Subject: ${escapeHtml(l.letter_title)}
          </div>
        </div>

        <!-- Body Paragraphs -->
        <div class="whitespace-pre-line leading-relaxed text-gray-800 space-y-4">
          ${escapeHtml(l.letter_body)}
        </div>

        <!-- Signatures Block -->
        <div class="pt-8 grid grid-cols-2 gap-8 items-end">
          <div class="space-y-1">
            <div class="font-bold text-xs text-gray-700">For and on behalf of:</div>
            <div class="font-extrabold text-sm text-sky-950 font-sans">RI8WIN NOBEL PATH FOUNDATION</div>
            <div class="pt-8 text-xs font-bold text-sky-900 border-t border-gray-400 w-48">${escapeHtml(l.authorized_signatory || 'Ms. Shilpa Sunil Umare & Ms. Sarika Uttamchand Wakde')}</div>
            <div class="text-[11px] text-gray-500">Board of Directors / Authorized Officers</div>
          </div>

          <div class="flex flex-col items-end">
            <div class="w-20 h-20 rounded-full border-2 border-double border-amber-600/80 bg-amber-50 flex items-center justify-center font-bold text-[8px] text-amber-900 uppercase text-center leading-tight shadow-xs">
              OFFICIAL SEAL<br/>SECTION 8 NGO<br/>CIN: 481549
            </div>
          </div>
        </div>

        <!-- Bottom Legal Compliance Bar -->
        <div class="border-t border-gray-200 pt-3 text-[10px] text-gray-400 text-center font-sans">
          This document is generated on official non-profit letterhead under Section 8 of the Companies Act, 2013. Serving solely public charitable objects. Non-profit, non-religious, non-political.
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}


// ============================================================================
// 5. PUBLIC & ADMIN MODULE: NEWS & ACTIVITIES PUBLICATIONS
// ============================================================================

async function renderNews(container, params) {
  // If viewing a specific article
  if (params && params.slug) {
    await renderSingleNewsArticle(container, params.slug);
    return;
  }

  container.innerHTML = `
    <div class="bg-gradient-to-b from-sky-900 to-sky-950 text-white py-14 px-4 sm:px-6">
      <div class="max-w-7xl mx-auto space-y-3">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-800 text-sky-200 border border-sky-700">
          📰 Foundation Press & Outreach
        </span>
        <h1 class="text-3xl sm:text-4xl font-black tracking-tight">News, Press Releases & Activities</h1>
        <p class="text-sky-200/90 text-sm max-w-3xl leading-relaxed">
          Official publications, milestone announcements, ground activity reports, and community impact briefings from RI8WIN NOBEL PATH FOUNDATION.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-10 sm:px-6 space-y-8">
      <!-- Filter and Search Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <!-- Category Filter Pills -->
        <div class="flex flex-wrap items-center gap-1.5 text-xs font-semibold" id="news-category-pills">
          <button type="button" onclick="filterPublicNews('All')" class="news-cat-btn active px-3.5 py-1.5 rounded-lg bg-sky-700 text-white shadow-xs">All News</button>
          <button type="button" onclick="filterPublicNews('Ground Activity Report')" class="news-cat-btn px-3.5 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100">🏕️ Ground Activities</button>
          <button type="button" onclick="filterPublicNews('Press Release')" class="news-cat-btn px-3.5 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100">📢 Press Releases</button>
          <button type="button" onclick="filterPublicNews('Statutory Announcement')" class="news-cat-btn px-3.5 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100">⚖️ Statutory Notices</button>
        </div>

        <!-- Search Box -->
        <div class="flex items-center gap-2">
          <input type="text" id="public-news-search" onkeyup="if(event.key==='Enter') searchPublicNews()" placeholder="Search news & activities..." class="p-2 text-xs rounded-xl border border-gray-300 w-full sm:w-64 focus:ring-2 focus:ring-sky-600"/>
          <button type="button" onclick="searchPublicNews()" class="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs">Search</button>
        </div>
      </div>

      <!-- Articles Grid -->
      <div id="public-news-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="col-span-full py-12 text-center text-gray-400 text-xs">Loading news publications...</div>
      </div>
    </div>
  `;

  await loadPublicNewsGrid();
}

let activeNewsCategory = 'All';

async function filterPublicNews(cat) {
  activeNewsCategory = cat;
  document.querySelectorAll('#news-category-pills .news-cat-btn').forEach(btn => {
    btn.className = 'news-cat-btn px-3.5 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition';
    if (btn.textContent.includes(cat) || (cat === 'All' && btn.textContent.includes('All'))) {
      btn.className = 'news-cat-btn active px-3.5 py-1.5 rounded-lg bg-sky-700 text-white shadow-xs transition';
    }
  });
  await loadPublicNewsGrid();
}

async function searchPublicNews() {
  await loadPublicNewsGrid();
}

async function loadPublicNewsGrid() {
  const grid = document.getElementById('public-news-grid');
  if (!grid) return;

  const search = document.getElementById('public-news-search')?.value || '';

  try {
    const res = await API.getNews(activeNewsCategory, search);
    const articles = (res && res.articles) || [];

    if (articles.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-gray-300 text-gray-500 space-y-2">
          <div class="text-3xl">📰</div>
          <div class="font-bold text-gray-800">No Publications Found</div>
          <p class="text-xs text-gray-400">No news articles match your current search or category filter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = articles.map(a => `
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group">
        <!-- Featured Image -->
        <div class="h-48 bg-stone-100 overflow-hidden relative">
          <img src="${a.featured_image || '/assets/Banner.png'}" alt="${escapeHtml(a.title)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-sky-900/90 text-white backdrop-blur-xs">
            ${escapeHtml(a.category)}
          </span>
        </div>

        <!-- Content -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[11px] text-gray-400">
              <span>📅 ${escapeHtml(a.published_date)}</span>
              <span>•</span>
              <span>✍️ ${escapeHtml(a.author)}</span>
            </div>
            <h3 class="font-extrabold text-base text-gray-900 group-hover:text-sky-700 transition leading-snug">
              <a href="#news/${a.slug}">${escapeHtml(a.title)}</a>
            </h3>
            <p class="text-xs text-gray-600 line-clamp-3 leading-relaxed">
              ${escapeHtml(a.summary || a.content.substring(0, 160) + '...')}
            </p>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <a href="#news/${a.slug}" class="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1">
              Read Publication <span>&rarr;</span>
            </a>
            <span class="text-[10px] text-gray-400">👁️ ${a.views_count || 0} reads</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<div class="col-span-full p-6 text-rose-500 text-center text-xs">Error loading news: ${err.message}</div>`;
  }
}

async function renderSingleNewsArticle(container, slug) {
  try {
    const res = await API.getArticle(slug);
    const a = res.article;
    if (!a) {
      container.innerHTML = `<div class="py-16 text-center text-gray-500">Article not found. <a href="#news" class="text-sky-600 font-bold">Return to News</a></div>`;
      return;
    }

    container.innerHTML = `
      <div class="bg-stone-50 py-8 px-4 sm:px-6 border-b border-gray-200">
        <div class="max-w-4xl mx-auto space-y-2">
          <a href="#news" class="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline">
            &larr; Back to All News & Activities
          </a>
          <div class="flex items-center gap-2 pt-1">
            <span class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">${escapeHtml(a.category)}</span>
            <span class="text-xs text-gray-500 font-mono">Published: ${escapeHtml(a.published_date)}</span>
            <span class="text-xs text-gray-400">• By ${escapeHtml(a.author)}</span>
          </div>
          <h1 class="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">${escapeHtml(a.title)}</h1>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-8">
        ${a.featured_image ? `
          <div class="rounded-3xl overflow-hidden shadow-md max-h-96 w-full">
            <img src="${a.featured_image}" alt="${escapeHtml(a.title)}" class="w-full h-full object-cover"/>
          </div>
        ` : ''}

        <div class="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xs space-y-6 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">
          ${escapeHtml(a.content)}
        </div>

        <div class="p-6 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="font-bold text-sm text-sky-950">RI8WIN NOBEL PATH FOUNDATION</div>
            <p class="text-[11px] text-gray-600 mt-0.5">Section 8 Non-Profit Company (CIN: U88900MH2026NPL481549). Registered with MCA, Govt. of India.</p>
          </div>
          <a href="#volunteer-register" class="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs whitespace-nowrap shadow-xs text-center">
            Join Our Next Mission &rarr;
          </a>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="py-16 text-center text-rose-500 text-xs">Error loading article: ${err.message}</div>`;
  }
}

// Admin News Management Tab
async function loadAdminNewsTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
            <span>📰</span> News & Activities Publication Manager
          </h3>
          <p class="text-xs text-gray-500">Publish, update, and manage public news stories, activity reports, and statutory announcements.</p>
        </div>
        <button type="button" onclick="openCreateNewsModal()" class="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
          <span>+</span> Publish New Article
        </button>
      </div>

      <!-- Articles Table Container -->
      <div id="admin-news-table-container" class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div class="p-8 text-center text-gray-400 text-xs">Loading articles...</div>
      </div>
    </div>
  `;

  await refreshAdminNewsTable();
}

async function refreshAdminNewsTable() {
  const container = document.getElementById('admin-news-table-container');
  if (!container) return;

  try {
    const res = await API.getNews(null, null, 1);
    const articles = (res && res.articles) || [];

    if (articles.length === 0) {
      container.innerHTML = `
        <div class="p-10 text-center text-gray-500 space-y-2">
          <div class="text-3xl">📰</div>
          <div class="font-bold text-gray-700">No News Articles Published Yet</div>
          <p class="text-xs text-gray-400">Click "+ Publish New Article" to write your first activity report or announcement.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-stone-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
            <tr>
              <th class="p-3 font-semibold">Title</th>
              <th class="p-3 font-semibold">Category</th>
              <th class="p-3 font-semibold">Published Date</th>
              <th class="p-3 font-semibold">Reads</th>
              <th class="p-3 font-semibold">Status</th>
              <th class="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${articles.map(a => `
              <tr class="hover:bg-sky-50/40 transition">
                <td class="p-3 font-medium text-gray-900 max-w-xs truncate">
                  <a href="#news/${a.slug}" target="_blank" class="hover:text-sky-700">${escapeHtml(a.title)}</a>
                  <div class="text-[11px] text-gray-400 font-mono">slug: /${escapeHtml(a.slug)}</div>
                </td>
                <td class="p-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800">
                    ${escapeHtml(a.category)}
                  </span>
                </td>
                <td class="p-3 text-gray-600">${escapeHtml(a.published_date)}</td>
                <td class="p-3 font-mono text-gray-600">${a.views_count || 0}</td>
                <td class="p-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    a.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }">
                    ${a.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td class="p-3 text-right space-x-1 whitespace-nowrap">
                  <a href="#news/${a.slug}" target="_blank" class="px-2 py-1 rounded bg-stone-700 hover:bg-stone-800 text-white font-semibold text-[11px] transition">
                    👁️ View
                  </a>
                  <button type="button" onclick="deleteNewsArticleRecord(${a.id})" class="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition">
                    🗑️
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-rose-500 text-xs text-center">Failed to load articles: ${err.message}</div>`;
  }
}

// Modal to create new news article
function openCreateNewsModal() {
  const modal = document.getElementById('generic-modal');
  if (!modal) return;

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <button onclick="closeGenericModal()" class="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
      
      <div class="border-b pb-3">
        <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
          <span>📰</span> Publish News / Ground Activity Story
        </h3>
        <p class="text-xs text-gray-500">Add an outreach report, event highlight, or official notice to the public news feed.</p>
      </div>

      <form onsubmit="handleCreateNewsSubmit(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-gray-700 mb-1">Story Title *</label>
          <input type="text" name="title" required placeholder="e.g. Health Screening Camp Conducted at Kalamboli" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 font-bold"/>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Category *</label>
            <select name="category" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-medium">
              <option value="Ground Activity Report">Ground Activity Report</option>
              <option value="Press Release">Press Release</option>
              <option value="Statutory Announcement">Statutory Announcement</option>
              <option value="Event Summary">Event Summary</option>
              <option value="Media Coverage">Media Coverage</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Published Date *</label>
            <input type="text" name="published_date" value="${today}" required class="w-full p-2.5 rounded-lg border border-gray-300"/>
          </div>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Short Summary (Preview card text)</label>
          <textarea name="summary" rows="2" placeholder="Brief summary of the initiative..." class="w-full p-2 rounded-lg border border-gray-300"></textarea>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Full Article / Publication Content *</label>
          <textarea name="content" rows="6" required placeholder="Detailed story, program impact, statistics, volunteer reflections..." class="w-full p-3 rounded-lg border border-gray-300 font-mono text-[11px] leading-relaxed"></textarea>
        </div>

        <!-- Featured Image Upload -->
        <div class="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <label class="block font-bold text-gray-700">Featured Photo</label>
          <div class="flex items-center gap-3">
            <input type="text" id="news-image-input" name="featured_image" placeholder="/assets/... or leave blank" class="flex-1 p-2 rounded-lg border border-gray-300 bg-white"/>
            <input type="file" id="news-file-picker" accept="image/*" class="hidden" onchange="handleNewsImageUpload(this)"/>
            <button type="button" onclick="document.getElementById('news-file-picker').click()" class="px-3 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs whitespace-nowrap shadow-xs">
              📷 Choose File
            </button>
          </div>
          <img id="news-image-preview" src="" class="hidden h-24 rounded-lg object-cover border mt-2"/>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Author / Credit</label>
            <input type="text" name="author" value="Editorial Board, RI8WIN Foundation" class="w-full p-2 rounded-lg border border-gray-300"/>
          </div>
          <div class="flex items-center pt-5">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_published" checked value="1" class="w-4 h-4 text-sky-600 rounded"/>
              <span class="font-bold text-gray-700">Publish live immediately</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t">
          <button type="button" onclick="closeGenericModal()" class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold">Cancel</button>
          <button type="submit" class="px-5 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold shadow transition flex items-center gap-1.5">
            <span>📰</span> Publish Story
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
}

async function handleCreateNewsSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    title: form.title.value.trim(),
    category: form.category.value.trim(),
    published_date: form.published_date.value.trim(),
    summary: form.summary.value.trim(),
    content: form.content.value.trim(),
    featured_image: form.featured_image.value.trim(),
    author: form.author.value.trim(),
    is_published: form.is_published.checked ? 1 : 0
  };

  try {
    const res = await API.createNews(payload);
    if (res.success) {
      showToast(res.message, 'success');
      closeGenericModal();
      await refreshAdminNewsTable();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteNewsArticleRecord(id) {
  if (!confirm('Are you sure you want to delete this publication?')) return;
  try {
    const res = await API.deleteNews(id);
    if (res.success) {
      showToast(res.message, 'success');
      await refreshAdminNewsTable();
    }
  } catch (e) {
    showToast(e.message, 'error');
  }
}


// ============================================================================
// 6. PUBLIC & ADMIN MODULE: DYNAMIC CUSTOM WEB PAGES
// ============================================================================

async function renderCustomPage(container, params) {
  const slug = params && (params.slug || params.id);
  if (!slug) {
    container.innerHTML = `<div class="py-16 text-center text-gray-500">Webpage not specified. <a href="#home" class="text-sky-600 font-bold">Return Home</a></div>`;
    return;
  }

  try {
    const res = await API.getPage(slug);
    const p = res.page;
    if (!p) {
      container.innerHTML = `<div class="py-16 text-center text-gray-500">Page not found. <a href="#home" class="text-sky-600 font-bold">Return Home</a></div>`;
      return;
    }

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-sky-900 via-sky-800 to-sky-950 text-white py-14 px-4 sm:px-6">
        <div class="max-w-5xl mx-auto space-y-2">
          <div class="flex items-center gap-2 text-xs text-sky-200">
            <a href="#home" class="hover:underline">Home</a>
            <span>/</span>
            <span>Pages</span>
            <span>/</span>
            <span class="text-white font-semibold">${escapeHtml(p.title)}</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white">${escapeHtml(p.title)}</h1>
          ${p.meta_description ? `<p class="text-sky-200 text-sm max-w-2xl">${escapeHtml(p.meta_description)}</p>` : ''}
        </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 py-10 sm:px-6 space-y-8">
        ${p.banner_image ? `
          <div class="rounded-3xl overflow-hidden shadow-md max-h-80 w-full">
            <img src="${p.banner_image}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover"/>
          </div>
        ` : ''}

        <!-- Page HTML Body -->
        <div class="bg-white rounded-3xl p-6 sm:p-12 border border-gray-200 shadow-xs space-y-6 text-xs sm:text-sm text-gray-800 leading-relaxed custom-page-content">
          ${p.content}
        </div>

        <!-- Statutory Note -->
        <div class="p-6 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="font-bold text-sm text-sky-950">RI8WIN NOBEL PATH FOUNDATION</div>
            <p class="text-[11px] text-gray-600 mt-0.5">Section 8 Non-Profit Company (CIN: U88900MH2026NPL481549). All rights reserved.</p>
          </div>
          <a href="#contact" class="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs whitespace-nowrap shadow-xs text-center">
            Connect With Our Office &rarr;
          </a>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="py-16 text-center text-rose-500 text-xs">Error loading page: ${err.message}</div>`;
  }
}

// Admin Custom Pages Tab
async function loadAdminPagesTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
            <span>🌐</span> Dynamic Custom Webpages
          </h3>
          <p class="text-xs text-gray-500">Create, publish, and edit custom pages (e.g. CSR Partnerships, Impact Studies, Advisory Board) with automatic URL slugs and navigation links.</p>
        </div>
        <button type="button" onclick="openCreatePageModal()" class="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
          <span>+</span> Create New Webpage
        </button>
      </div>

      <!-- Pages Table Container -->
      <div id="admin-pages-table-container" class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div class="p-8 text-center text-gray-400 text-xs">Loading webpages...</div>
      </div>
    </div>
  `;

  await refreshAdminPagesTable();
}

async function refreshAdminPagesTable() {
  const container = document.getElementById('admin-pages-table-container');
  if (!container) return;

  try {
    const res = await API.getAllPagesAdmin();
    const pages = (res && res.pages) || [];

    if (pages.length === 0) {
      container.innerHTML = `
        <div class="p-10 text-center text-gray-500 space-y-2">
          <div class="text-3xl">🌐</div>
          <div class="font-bold text-gray-700">No Custom Pages Created Yet</div>
          <p class="text-xs text-gray-400">Click "+ Create New Webpage" above to build your first custom page.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-stone-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
            <tr>
              <th class="p-3 font-semibold">Page Title</th>
              <th class="p-3 font-semibold">URL Path</th>
              <th class="p-3 font-semibold">Navbar Display</th>
              <th class="p-3 font-semibold">Status</th>
              <th class="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${pages.map(p => `
              <tr class="hover:bg-sky-50/40 transition">
                <td class="p-3 font-bold text-gray-900">${escapeHtml(p.title)}</td>
                <td class="p-3 font-mono text-sky-800">/#page/${escapeHtml(p.slug)}</td>
                <td class="p-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.show_in_navbar ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }">
                    ${p.show_in_navbar ? '✓ Shown in Menu' : '✕ Hidden from Menu'}
                  </span>
                </td>
                <td class="p-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'Published' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                  }">
                    ${escapeHtml(p.status)}
                  </span>
                </td>
                <td class="p-3 text-right space-x-1 whitespace-nowrap">
                  <a href="#page/${p.slug}" target="_blank" class="px-2 py-1 rounded bg-stone-700 hover:bg-stone-800 text-white font-semibold text-[11px] transition">
                    👁️ View Live
                  </a>
                  <button type="button" onclick="deleteCustomPageRecord(${p.id})" class="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition">
                    🗑️
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-rose-500 text-xs text-center">Failed to load pages: ${err.message}</div>`;
  }
}

// Modal to create custom page
function openCreatePageModal() {
  const modal = document.getElementById('generic-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <button onclick="closeGenericModal()" class="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
      
      <div class="border-b pb-3">
        <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
          <span>🌐</span> Create New Website Page
        </h3>
        <p class="text-xs text-gray-500">Design custom web pages for CSR partnerships, reports, or special initiatives.</p>
      </div>

      <form onsubmit="handleCreatePageSubmit(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-gray-700 mb-1">Page Title *</label>
          <input type="text" id="page-title-input" name="title" required placeholder="e.g. CSR Partnerships & Grants" onkeyup="autoGenerateSlug(this)" class="w-full p-2.5 rounded-lg border border-gray-300 font-bold"/>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">URL Slug (e.g. csr-partnerships) *</label>
            <input type="text" id="page-slug-input" name="slug" required placeholder="csr-partnerships" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono"/>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Status</label>
            <select name="status" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white">
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Meta Description (SEO & Header summary)</label>
          <input type="text" name="meta_description" placeholder="Brief summary of this page..." class="w-full p-2 rounded-lg border border-gray-300"/>
        </div>

        <!-- Banner Image Upload -->
        <div class="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <label class="block font-bold text-gray-700">Top Banner Image</label>
          <div class="flex items-center gap-3">
            <input type="text" id="page-banner-input" name="banner_image" placeholder="/assets/Banner.png or upload" class="flex-1 p-2 rounded-lg border border-gray-300 bg-white"/>
            <input type="file" id="page-banner-picker" accept="image/*" class="hidden" onchange="handlePageBannerUpload(this)"/>
            <button type="button" onclick="document.getElementById('page-banner-picker').click()" class="px-3 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs whitespace-nowrap shadow-xs">
              📷 Choose Banner
            </button>
          </div>
          <img id="page-banner-preview" src="" class="hidden h-20 rounded-lg object-cover border mt-2"/>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="font-bold text-gray-700">Page Content (HTML & Formatted Text) *</label>
            <span class="text-[11px] text-gray-400">Supports &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, etc.</span>
          </div>
          <textarea name="content" rows="8" required class="w-full p-3 rounded-lg border border-gray-300 font-mono text-[11px] leading-relaxed" placeholder="<h3>About This Initiative</h3>\n<p>Describe your initiative here...</p>"></textarea>
        </div>

        <div class="flex items-center gap-6 pt-1">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="show_in_navbar" checked value="1" class="w-4 h-4 text-sky-600 rounded"/>
            <span class="font-bold text-gray-700">Show in Navigation Menu</span>
          </label>
          <div class="flex items-center gap-2">
            <span class="text-gray-500 font-semibold">Menu Order:</span>
            <input type="number" name="navbar_order" value="1" min="1" max="20" class="w-16 p-1.5 rounded border border-gray-300 text-center"/>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t">
          <button type="button" onclick="closeGenericModal()" class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold">Cancel</button>
          <button type="submit" class="px-5 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold shadow transition flex items-center gap-1.5">
            <span>🌐</span> Save & Publish Page
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
}

function autoGenerateSlug(titleInput) {
  const slugInput = document.getElementById('page-slug-input');
  if (!slugInput) return;
  slugInput.value = titleInput.value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function handleCreatePageSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    title: form.title.value.trim(),
    slug: form.slug.value.trim(),
    meta_description: form.meta_description.value.trim(),
    banner_image: form.banner_image.value.trim(),
    content: form.content.value.trim(),
    show_in_navbar: form.show_in_navbar.checked ? 1 : 0,
    navbar_order: Number(form.navbar_order.value) || 1,
    status: form.status.value
  };

  try {
    const res = await API.createPage(payload);
    if (res.success) {
      showToast(res.message, 'success');
      closeGenericModal();
      await refreshAdminPagesTable();
      await renderCustomNavbarLinks();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCustomPageRecord(id) {
  if (!confirm('Are you sure you want to delete this custom webpage?')) return;
  try {
    const res = await API.deletePage(id);
    if (res.success) {
      showToast(res.message, 'success');
      await refreshAdminPagesTable();
      await renderCustomNavbarLinks();
    }
  } catch (e) {
    showToast(e.message, 'error');
  }
}


// ============================================================================
// 7. PUBLIC & ADMIN MODULE: SECTION 8 DONATIONS & PAYMENT GATEWAY
// ============================================================================

async function renderDonate(container, params) {
  let config = {};
  try {
    const res = await API.getDonationConfig();
    config = (res && res.config) || {};
  } catch (e) {}

  const upiId = config.donation_upi_id || 'ri8winfoundation@upi';
  const orgName = 'RI8WIN NOBEL PATH FOUNDATION';

  container.innerHTML = `
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 text-white py-14 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto text-center space-y-3">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          ❤️ Section 8 Charitable Giving
        </span>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight">Support Our Charitable Mandate</h1>
        <p class="text-sky-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          100% of your voluntary contributions are applied directly towards free digital education, child nutrition, preventive health camps, and mass afforestation in strict adherence to Section 8 of the Companies Act, 2013.
        </p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-10 sm:px-6">
      <div class="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
        
        <!-- Step 1: Select Contribution Cause -->
        <div class="space-y-3">
          <label class="block font-bold text-sm text-[#0369a1] uppercase tracking-wider">1. Select Charitable Program / Cause</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <label class="donate-cause-card cursor-pointer p-3.5 rounded-xl border-2 border-sky-600 bg-sky-50 flex flex-col justify-between space-y-1 transition">
              <input type="radio" name="donate_cause" value="Child Digital Literacy & Education" checked class="hidden"/>
              <div class="text-lg">📚</div>
              <div class="font-bold text-gray-900">Child Digital Education</div>
              <div class="text-[11px] text-gray-500">Free computing & literacy camps</div>
            </label>

            <label class="donate-cause-card cursor-pointer p-3.5 rounded-xl border border-gray-200 hover:border-sky-400 bg-white flex flex-col justify-between space-y-1 transition">
              <input type="radio" name="donate_cause" value="Mass Community Afforestation" class="hidden"/>
              <div class="text-lg">🌳</div>
              <div class="font-bold text-gray-900">Tree Plantation & Climate</div>
              <div class="text-[11px] text-gray-500">Native saplings & biodiversity</div>
            </label>

            <label class="donate-cause-card cursor-pointer p-3.5 rounded-xl border border-gray-200 hover:border-sky-400 bg-white flex flex-col justify-between space-y-1 transition">
              <input type="radio" name="donate_cause" value="Preventive Health Awareness Camps" class="hidden"/>
              <div class="text-lg">🏥</div>
              <div class="font-bold text-gray-900">Health Screening Camps</div>
              <div class="text-[11px] text-gray-500">Preventive checkups & nutrition</div>
            </label>

            <label class="donate-cause-card cursor-pointer p-3.5 rounded-xl border border-gray-200 hover:border-sky-400 bg-white flex flex-col justify-between space-y-1 transition">
              <input type="radio" name="donate_cause" value="General Foundation Charitable Corpus" class="hidden"/>
              <div class="text-lg">🤝</div>
              <div class="font-bold text-gray-900">General Non-Profit Corpus</div>
              <div class="text-[11px] text-gray-500">Where the need is greatest</div>
            </label>
          </div>
        </div>

        <!-- Step 2: Choose Amount -->
        <div class="space-y-3">
          <label class="block font-bold text-sm text-[#0369a1] uppercase tracking-wider">2. Select Voluntary Contribution Amount</label>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-bold">
            <button type="button" onclick="setDonateAmount(500, this)" class="donate-amt-btn py-3 rounded-xl border border-gray-200 hover:border-sky-600 hover:bg-sky-50 transition">₹500</button>
            <button type="button" onclick="setDonateAmount(1000, this)" class="donate-amt-btn active py-3 rounded-xl border-2 border-sky-600 bg-sky-50 text-sky-900 shadow-xs transition">₹1,000</button>
            <button type="button" onclick="setDonateAmount(2500, this)" class="donate-amt-btn py-3 rounded-xl border border-gray-200 hover:border-sky-600 hover:bg-sky-50 transition">₹2,500</button>
            <button type="button" onclick="setDonateAmount(5000, this)" class="donate-amt-btn py-3 rounded-xl border border-gray-200 hover:border-sky-600 hover:bg-sky-50 transition">₹5,000</button>
            <button type="button" onclick="setDonateAmount(10000, this)" class="donate-amt-btn py-3 rounded-xl border border-gray-200 hover:border-sky-600 hover:bg-sky-50 transition">₹10,000</button>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <span class="text-xs font-bold text-gray-600">Or Custom Amount (₹):</span>
            <input type="number" id="custom-donate-amount" min="100" value="1000" oninput="onCustomDonateInput(this)" class="w-36 p-2 rounded-lg border border-gray-300 font-bold text-sky-900 text-sm"/>
          </div>
        </div>

        <!-- Step 3: Donor Particulars (for 80G Receipt & Audit Compliance) -->
        <form onsubmit="handlePublicDonationSubmit(event)" class="space-y-6 text-xs">
          <div class="space-y-3">
            <label class="block font-bold text-sm text-[#0369a1] uppercase tracking-wider">3. Donor Particulars (For Official Tax Receipt)</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-gray-700 mb-1">Full Legal Name *</label>
                <input type="text" name="donor_name" required placeholder="Name as per PAN card" class="w-full p-2.5 rounded-lg border border-gray-300"/>
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">Email Address (For Instant Receipt) *</label>
                <input type="email" name="donor_email" required placeholder="name@example.com" class="w-full p-2.5 rounded-lg border border-gray-300"/>
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">Permanent Account Number (PAN) *</label>
                <input type="text" name="donor_pan" required placeholder="e.g. ABCDE1234F" maxlength="10" class="w-full p-2.5 rounded-lg border border-gray-300 uppercase font-mono" title="Required for Indian Income Tax compliance for charitable contributions"/>
                <span class="text-[10px] text-gray-400">Mandatory under Income Tax rules for tax-exempt non-profit donations.</span>
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">Mobile Contact Number</label>
                <input type="tel" name="donor_phone" placeholder="+91..." class="w-full p-2.5 rounded-lg border border-gray-300"/>
              </div>
              <div class="sm:col-span-2">
                <label class="block font-bold text-gray-700 mb-1">Residential Address / City</label>
                <input type="text" name="donor_address" placeholder="Address, City, State..." class="w-full p-2.5 rounded-lg border border-gray-300"/>
              </div>
            </div>
          </div>

          <!-- Step 4: Payment Channel Selection -->
          <div class="space-y-4 pt-2 border-t">
            <label class="block font-bold text-sm text-[#0369a1] uppercase tracking-wider">4. Select Payment Channel</label>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- UPI / QR Card -->
              <div class="p-5 rounded-2xl bg-sky-50/70 border-2 border-sky-300 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="font-extrabold text-sm text-sky-950 flex items-center gap-1.5">
                    <span>📱</span> Instant UPI / QR Code Payment
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-200 text-sky-900">Recommended</span>
                </div>
                <p class="text-[11px] text-gray-600">Scan using any UPI App (Google Pay, PhonePe, Paytm, BHIM, Cred, Amazon Pay):</p>
                
                <div class="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-sky-200">
                  <div class="w-32 h-32 bg-white flex items-center justify-center p-1 rounded-lg border border-gray-200 shadow-xs">
                    <img id="dynamic-upi-qr" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(upiId)}%26pn%3D${encodeURIComponent(orgName)}%26am%3D1000%26cu%3DINR" alt="UPI QR Code" class="w-full h-full object-contain"/>
                  </div>
                  <div class="space-y-1.5 text-xs text-gray-700">
                    <div>Official UPI ID: <span class="font-mono font-bold text-sky-900">${escapeHtml(upiId)}</span></div>
                    <div>Beneficiary: <strong>${escapeHtml(orgName)}</strong></div>
                    <div class="pt-1">
                      <a id="btn-upi-intent" href="upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(orgName)}&am=1000&cu=INR" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-700 text-white font-bold text-[11px] shadow-xs hover:bg-sky-800 transition">
                        <span>📲</span> Click to Pay via UPI App
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block font-bold text-gray-700 mb-1">Enter UPI Transaction Ref / UTR *</label>
                  <input type="text" name="gateway_payment_id" required placeholder="e.g. 428901289102" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-mono"/>
                  <span class="text-[10px] text-gray-400">12-digit UPI transaction reference from your payment receipt.</span>
                </div>
              </div>

              <!-- Official Bank Account Card -->
              <div class="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div class="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>🏛️</span> Direct Bank Transfer (NEFT / RTGS / IMPS)
                </div>
                <p class="text-[11px] text-gray-600">You may also transfer directly to the Foundation's official banking account:</p>
                <div class="p-3.5 bg-white rounded-xl border border-stone-200 space-y-1.5 font-mono text-[11px] text-gray-800">
                  <div>Account Name: <strong>${escapeHtml(config.donation_account_name || orgName)}</strong></div>
                  <div>Account Number: <strong class="text-sky-900">${escapeHtml(config.donation_account_number || '4815492026001')}</strong></div>
                  <div>Bank Name: <strong>${escapeHtml(config.donation_bank_name || 'State Bank of India')}</strong></div>
                  <div>IFSC Code: <strong class="text-sky-900">${escapeHtml(config.donation_ifsc || 'SBIN0012345')}</strong></div>
                  <div>Branch: ${escapeHtml(config.donation_branch || 'Kalamboli, Navi Mumbai')}</div>
                </div>
                <p class="text-[10px] text-gray-500 leading-relaxed">
                  After initiating transfer, submit this form with your UTR reference to immediately receive your official signed donation receipt.
                </p>
              </div>
            </div>
          </div>

          <!-- Statutory Declaration -->
          <div class="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 space-y-1.5 leading-relaxed">
            <div class="font-bold flex items-center gap-1.5">
              <span>⚖️</span> Section 8 Non-Profit Statutory Transparency
            </div>
            <p>
              ${escapeHtml(config.donation_80g_note || 'RI8WIN NOBEL PATH FOUNDATION is a registered Section 8 non-profit company (CIN: U88900MH2026NPL481549). All contributions are dedicated 100% towards charitable programs in free digital education, health screening camps, and community afforestation. No profits are distributed to members.')}
            </p>
          </div>

          <!-- Submit Button -->
          <div class="pt-2 text-center">
            <button type="submit" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition transform hover:scale-[1.01] cursor-pointer">
              ❤️ Confirm Contribution & Generate Official Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Setup cause selector listeners
  document.querySelectorAll('.donate-cause-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.donate-cause-card').forEach(c => {
        c.className = 'donate-cause-card cursor-pointer p-3.5 rounded-xl border border-gray-200 hover:border-sky-400 bg-white flex flex-col justify-between space-y-1 transition';
      });
      card.className = 'donate-cause-card cursor-pointer p-3.5 rounded-xl border-2 border-sky-600 bg-sky-50 flex flex-col justify-between space-y-1 transition';
    });
  });
}

function setDonateAmount(amt, btn) {
  document.querySelectorAll('.donate-amt-btn').forEach(b => {
    b.className = 'donate-amt-btn py-3 rounded-xl border border-gray-200 hover:border-sky-600 hover:bg-sky-50 transition';
  });
  if (btn) {
    btn.className = 'donate-amt-btn active py-3 rounded-xl border-2 border-sky-600 bg-sky-50 text-sky-900 shadow-xs transition';
  }
  const input = document.getElementById('custom-donate-amount');
  if (input) input.value = amt;
  updateDonateUpiQr(amt);
}

function onCustomDonateInput(input) {
  const amt = Number(input.value) || 100;
  document.querySelectorAll('.donate-amt-btn').forEach(b => {
    b.className = 'donate-amt-btn py-3 rounded-xl border border-gray-200 hover:border-sky-600 hover:bg-sky-50 transition';
  });
  updateDonateUpiQr(amt);
}

function updateDonateUpiQr(amt) {
  const s = AppState.settings || {};
  const upiId = s.donation_upi_id || 'ri8winfoundation@upi';
  const org = 'RI8WIN NOBEL PATH FOUNDATION';
  const qrImg = document.getElementById('dynamic-upi-qr');
  const btnIntent = document.getElementById('btn-upi-intent');

  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(org)}&am=${amt}&cu=INR`;
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;
  }
  if (btnIntent) {
    btnIntent.href = upiString;
  }
}

async function handlePublicDonationSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const causeRadio = document.querySelector('input[name="donate_cause"]:checked');
  const amount = Number(document.getElementById('custom-donate-amount')?.value) || 1000;

  const payload = {
    donor_name: form.donor_name.value.trim(),
    donor_email: form.donor_email.value.trim(),
    donor_pan: form.donor_pan.value.trim().toUpperCase(),
    donor_phone: form.donor_phone.value.trim(),
    donor_address: form.donor_address.value.trim(),
    amount: amount,
    cause: causeRadio ? causeRadio.value : 'General Charitable Corpus',
    payment_method: 'UPI / Bank Transfer',
    gateway_payment_id: form.gateway_payment_id.value.trim()
  };

  try {
    const res = await API.recordDonation(payload);
    if (res.success && res.receipt_number) {
      showToast(res.message, 'success');
      form.reset();
      openDonationReceiptModal(res.donation);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Donation Printable Receipt Modal
function openDonationReceiptModal(d) {
  const modal = document.getElementById('generic-modal');
  if (!modal) return;

  const s = AppState.settings || {};

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b pb-3 no-print">
        <div class="font-bold text-sm text-emerald-800 flex items-center gap-2">
          <span>🧾</span> Official Contribution Receipt (${escapeHtml(d.receipt_number)})
        </div>
        <div class="flex items-center gap-2">
          <button type="button" onclick="window.print()" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition cursor-pointer">
            <span>🖨️</span> Print Receipt
          </button>
          <button onclick="closeGenericModal()" class="text-gray-400 hover:text-gray-700 text-xl font-bold ml-2">&times;</button>
        </div>
      </div>

      <!-- Printable Receipt -->
      <div class="printable-document p-6 sm:p-10 bg-white border border-gray-300 rounded-2xl shadow-xs text-xs text-gray-800 space-y-5">
        <!-- Header -->
        <div class="border-b pb-4 text-center space-y-1">
          <div class="text-[10px] font-bold uppercase tracking-widest text-sky-800">Ministry of Corporate Affairs, Government of India</div>
          <h2 class="text-xl sm:text-2xl font-black text-sky-950 uppercase">RI8WIN NOBEL PATH FOUNDATION</h2>
          <div class="text-[11px] text-gray-500 font-mono">CIN: U88900MH2026NPL481549 • Section 8 Non-Profit Company (Companies Act, 2013)</div>
          <div class="text-[10px] text-gray-400">PAN: AAQCR4085D • TAN: PNER43317B • Regd. Office: Navi Mumbai, Maharashtra - 410218</div>
        </div>

        <div class="text-center">
          <span class="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs tracking-wider uppercase">
            Official Donation & Acknowledgement Receipt
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 border-t border-b py-3 font-mono text-[11px]">
          <div>Receipt No: <strong class="text-sky-900">${escapeHtml(d.receipt_number)}</strong></div>
          <div class="text-right">Date: <strong>${new Date().toLocaleDateString('en-GB')}</strong></div>
          <div>Transaction Ref: <strong>${escapeHtml(d.gateway_payment_id || 'Direct')}</strong></div>
          <div class="text-right">Payment Mode: <strong>${escapeHtml(d.payment_method)}</strong></div>
        </div>

        <!-- Donor Information Block -->
        <div class="p-3 bg-stone-50 rounded-xl space-y-1">
          <div>Received with thanks from: <strong class="text-gray-900 text-sm font-sans">${escapeHtml(d.donor_name)}</strong></div>
          <div>Donor PAN: <strong class="font-mono text-sky-900">${escapeHtml(d.donor_pan || 'Not Provided')}</strong></div>
          ${d.donor_email ? `<div>Email: ${escapeHtml(d.donor_email)}</div>` : ''}
          ${d.donor_address ? `<div>Address: ${escapeHtml(d.donor_address)}</div>` : ''}
        </div>

        <!-- Amount -->
        <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
          <div>
            <div class="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Amount Contributed</div>
            <div class="text-xl font-black text-emerald-950 font-mono">₹${Number(d.amount).toLocaleString('en-IN')}/-</div>
          </div>
          <div class="text-right text-xs">
            <span class="font-bold text-emerald-900">Purpose / Cause:</span><br/>
            <span class="text-emerald-800">${escapeHtml(d.cause)}</span>
          </div>
        </div>

        <!-- Section 8 Statutory Declaration -->
        <div class="text-[10px] text-gray-500 leading-relaxed font-mono">
          STATUTORY DECLARATION: RI8WIN NOBEL PATH FOUNDATION certifies that the funds received shall be applied solely towards the charitable objectives of the Foundation. No portion of income is distributable to members.
        </div>

        <!-- Signatory Block -->
        <div class="pt-4 flex items-end justify-between border-t border-gray-200">
          <div class="space-y-0.5 text-[10px] text-gray-500">
            <div>Authorized Accounts Officer</div>
            <div class="font-bold text-xs text-sky-950">RI8WIN NOBEL PATH FOUNDATION</div>
          </div>
          <div class="w-14 h-14 rounded-full border border-double border-amber-600 bg-amber-50 flex items-center justify-center text-[7px] font-bold text-center text-amber-900 leading-tight">
            OFFICIAL SEAL<br/>SECTION 8 NGO
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

// Admin Donations Management Tab
async function loadAdminDonationsTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
            <span>💳</span> Donations, Receipts & Payment Gateway
          </h3>
          <p class="text-xs text-gray-500">Track incoming charitable contributions, review donor PAN logs, and configure payment gateway channels.</p>
        </div>
        <button type="button" onclick="switchCmsSubtab('donations')" class="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5">
          <span>⚙️</span> Configure Gateway & Bank Details
        </button>
      </div>

      <!-- Stats Counters -->
      <div id="admin-donations-stats" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-xs text-center">
          <div class="text-xs text-gray-500 font-medium">Total Contributions Raised</div>
          <div class="text-2xl font-bold text-emerald-700 mt-1" id="stat-total-amount">₹0</div>
        </div>
        <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-xs text-center">
          <div class="text-xs text-gray-500 font-medium">Total Receipts Issued</div>
          <div class="text-2xl font-bold text-gray-800 mt-1" id="stat-total-donations">0</div>
        </div>
        <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-xs text-center">
          <div class="text-xs text-gray-500 font-medium">Unique Donors</div>
          <div class="text-2xl font-bold text-sky-800 mt-1" id="stat-unique-donors">0</div>
        </div>
      </div>

      <!-- Donations Table Container -->
      <div id="admin-donations-table-container" class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div class="p-8 text-center text-gray-400 text-xs">Loading donation records...</div>
      </div>
    </div>
  `;

  await refreshAdminDonationsTable();
}

async function refreshAdminDonationsTable() {
  const container = document.getElementById('admin-donations-table-container');
  if (!container) return;

  try {
    const res = await API.getAllDonationsAdmin();
    const donations = (res && res.donations) || [];
    const stats = (res && res.stats) || {};

    // Update stats counters
    const amtEl = document.getElementById('stat-total-amount');
    const donEl = document.getElementById('stat-total-donations');
    const uqEl = document.getElementById('stat-unique-donors');
    if (amtEl) amtEl.textContent = '₹' + Number(stats.total_amount || 0).toLocaleString('en-IN');
    if (donEl) donEl.textContent = String(stats.total_donations || 0);
    if (uqEl) uqEl.textContent = String(stats.unique_donors || 0);

    if (donations.length === 0) {
      container.innerHTML = `
        <div class="p-10 text-center text-gray-500 space-y-2">
          <div class="text-3xl">💳</div>
          <div class="font-bold text-gray-700">No Donations Recorded Yet</div>
          <p class="text-xs text-gray-400">When visitors donate via the public "#donate" page or direct UPI, their contributions appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-stone-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
            <tr>
              <th class="p-3 font-semibold">Receipt Number</th>
              <th class="p-3 font-semibold">Donor Details</th>
              <th class="p-3 font-semibold">PAN Number</th>
              <th class="p-3 font-semibold">Cause</th>
              <th class="p-3 font-semibold">Amount (₹)</th>
              <th class="p-3 font-semibold">Date</th>
              <th class="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${donations.map(d => `
              <tr class="hover:bg-sky-50/40 transition">
                <td class="p-3 font-mono font-bold text-sky-900">${escapeHtml(d.receipt_number)}</td>
                <td class="p-3">
                  <div class="font-medium text-gray-900">${escapeHtml(d.donor_name)}</div>
                  <div class="text-[11px] text-gray-400">${escapeHtml(d.donor_email)}</div>
                </td>
                <td class="p-3 font-mono font-bold text-gray-700">${escapeHtml(d.donor_pan || '—')}</td>
                <td class="p-3 text-gray-600">${escapeHtml(d.cause)}</td>
                <td class="p-3 font-mono font-bold text-emerald-700">₹${Number(d.amount).toLocaleString('en-IN')}</td>
                <td class="p-3 text-gray-500 text-[11px]">${new Date(d.created_at).toLocaleDateString('en-GB')}</td>
                <td class="p-3 text-right space-x-1 whitespace-nowrap">
                  <button type="button" onclick='openDonationReceiptModal(${JSON.stringify(d).replace(/'/g, "&apos;")})' class="px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-800 text-white font-semibold text-[11px] transition">
                    🧾 Receipt
                  </button>
                  <button type="button" onclick="deleteDonationRecord(${d.id})" class="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition">
                    🗑️
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-rose-500 text-xs text-center">Failed to load donations: ${err.message}</div>`;
  }
}

async function deleteDonationRecord(id) {
  if (!confirm('Are you sure you want to delete this donation record?')) return;
  try {
    const res = await API.deleteDonation(id);
    if (res.success) {
      showToast(res.message, 'success');
      await refreshAdminDonationsTable();
    }
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// Global Exports
window.changeFontSize = changeFontSize;
window.initAccessibility = initAccessibility;
window.toggleHighContrast = toggleHighContrast;
window.uploadMemberPhotoDirectly = uploadMemberPhotoDirectly;
window.handleLogoUpload = handleLogoUpload;
window.resetBrandLogo = resetBrandLogo;
window.handleHeroImageUpload = handleHeroImageUpload;
window.handlePageBannerUpload = handlePageBannerUpload;
window.handleNewsImageUpload = handleNewsImageUpload;
window.handleUpiQrUpload = handleUpiQrUpload;
window.loadAdminCertificatesTab = loadAdminCertificatesTab;
window.filterCertificatesList = filterCertificatesList;
window.openDirectCertIssueModal = openDirectCertIssueModal;
window.handleDirectCertIssueSubmit = handleDirectCertIssueSubmit;
window.deleteCertificateRecord = deleteCertificateRecord;
window.openCertificatePrintModal = openCertificatePrintModal;
window.loadAdminLettersTab = loadAdminLettersTab;
window.filterLettersList = filterLettersList;
window.openCreateLetterModal = openCreateLetterModal;
window.onLetterTypeSelectChange = onLetterTypeSelectChange;
window.updateLetterBodyPlaceholders = updateLetterBodyPlaceholders;
window.handleCreateLetterSubmit = handleCreateLetterSubmit;
window.deleteLetterRecord = deleteLetterRecord;
window.openLetterPrintModal = openLetterPrintModal;
window.renderNews = renderNews;
window.filterPublicNews = filterPublicNews;
window.searchPublicNews = searchPublicNews;
window.loadAdminNewsTab = loadAdminNewsTab;
window.openCreateNewsModal = openCreateNewsModal;
window.handleCreateNewsSubmit = handleCreateNewsSubmit;
window.deleteNewsArticleRecord = deleteNewsArticleRecord;
window.renderCustomPage = renderCustomPage;
window.loadAdminPagesTab = loadAdminPagesTab;
window.openCreatePageModal = openCreatePageModal;
window.autoGenerateSlug = autoGenerateSlug;
window.handleCreatePageSubmit = handleCreatePageSubmit;
window.deleteCustomPageRecord = deleteCustomPageRecord;
window.renderDonate = renderDonate;
window.setDonateAmount = setDonateAmount;
window.onCustomDonateInput = onCustomDonateInput;
window.handlePublicDonationSubmit = handlePublicDonationSubmit;
window.openDonationReceiptModal = openDonationReceiptModal;
window.loadAdminDonationsTab = loadAdminDonationsTab;
window.deleteDonationRecord = deleteDonationRecord;
