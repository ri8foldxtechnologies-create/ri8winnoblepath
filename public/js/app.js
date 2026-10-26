// RI8WIN NOBEL PATH FOUNDATION - Main Frontend Application
// Single-page application logic, state management, and page renderers

const AppState = {
  currentUser: null,
  volunteerApp: null,
  memberProfile: null,
  settings: {},
  currentRoute: 'home',
  routeParams: {}
};

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-sky-800 text-white border-sky-600',
    error: 'bg-rose-800 text-white border-rose-600',
    info: 'bg-sky-800 text-white border-sky-600',
    warning: 'bg-amber-800 text-white border-amber-600'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <span class="flex-1">${message}</span>
    <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white">&times;</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Router
function parseHash() {
  const hash = window.location.hash.slice(1) || 'home';
  const [path, queryString] = hash.split('?');
  const pathParts = path.split('/').filter(Boolean);
  const route = pathParts[0] || 'home';
  const subroute = pathParts.slice(1).join('/');
  const params = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((val, key) => {
      params[key] = val;
    });
  }
  if (subroute) {
    params.slug = subroute;
    params.id = subroute;
  }
  return { route, subroute, params };
}

function navigateTo(route, params = {}) {
  const search = new URLSearchParams(params).toString();
  window.location.hash = search ? `${route}?${search}` : route;
}


function updateHeaderUI(s) {
  s = s || AppState.settings || {};
  const logoEl = document.getElementById('header-logo-badge');
  const nameEl = document.getElementById('header-org-name');
  const tagEl = document.getElementById('header-org-tagline');
  if (logoEl) {
    if (s.logo_url) {
      logoEl.innerHTML = `<img src="${s.logo_url}" alt="Logo" class="w-full h-full object-contain p-0.5 rounded-xl"/>`;
    } else {
      logoEl.innerHTML = `<span id="header-logo-text">${escapeHtml(s.logo_badge_text || 'R8')}</span>`;
    }
  }
  if (nameEl && s.org_name !== undefined && s.org_name !== null) {
    nameEl.textContent = s.org_name || 'RI8WIN NOBEL PATH FOUNDATION';
  }
  if (tagEl && s.header_tagline !== undefined && s.header_tagline !== null) {
    tagEl.textContent = s.header_tagline || 'Right Noble Path • Section 8 Non-Profit Co. (MCA India)';
  }
}

function renderFooter(s) {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  s = s || AppState.settings || {};

  const orgName = s.org_name || 'RI8WIN NOBEL PATH FOUNDATION';
  const orgMeaning = s.org_meaning || 'Ri8NoblePath — Right Noble Path';
  const footerSummary = s.footer_summary ? escapeHtml(s.footer_summary) : `Meaning: <em>${escapeHtml(orgMeaning)}</em>. A registered Section 8 non-profit organization under the Companies Act, 2013, Ministry of Corporate Affairs, Government of India.`;
  const logoBadge = s.logo_badge_text || 'R8';
  const logoHtml = s.logo_url
    ? `<img src="${s.logo_url}" alt="Logo" class="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 shadow" />`
    : `<div class="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-sm shadow">${escapeHtml(logoBadge)}</div>`;

  const showCin = s.show_cin !== false && s.cin;
  const showPan = s.show_pan !== false && s.pan;
  const showTan = s.show_tan !== false && s.tan;
  const showRegOffice = s.show_registered_office !== false && s.registered_office;
  const showEmail = s.show_official_email !== false && s.official_email;
  const showPhone = s.show_official_phone !== false && s.official_phone;

  const copyrightText = s.footer_copyright ? escapeHtml(s.footer_copyright) : `&copy; 2026 <strong>${escapeHtml(orgName)}</strong>. All rights reserved. Non-Profit, Non-Religious, Non-Political. Income applied solely to objectives. No profit distribution to members.`;

  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
        
        <!-- Org Summary -->
        <div class="space-y-3">
          <div class="flex items-center gap-2.5">
            ${logoHtml}
            <span class="font-extrabold text-sm text-white tracking-wider">${escapeHtml(orgName)}</span>
          </div>
          <p class="text-xs text-gray-400 leading-relaxed">
            ${footerSummary}
          </p>
          <div class="text-[11px] font-mono text-sky-400 space-y-1">
            ${showCin ? `<div>CIN: <strong>${escapeHtml(s.cin)}</strong></div>` : ''}
            ${(showPan || showTan) ? `<div>${showPan ? `PAN: ${escapeHtml(s.pan)}` : ''} ${showPan && showTan ? '|' : ''} ${showTan ? `TAN: ${escapeHtml(s.tan)}` : ''}</div>` : ''}
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
          <ul class="text-xs space-y-1.5 text-gray-400">
            <li><a href="#home" class="hover:text-sky-400 transition">Home</a></li>
            <li><a href="#about" class="hover:text-sky-400 transition">About Foundation</a></li>
            <li><a href="#objectives" class="hover:text-sky-400 transition">Our Objectives</a></li>
            <li><a href="#programs" class="hover:text-sky-400 transition">Active Programs</a></li>
            <li><a href="#events" class="hover:text-sky-400 transition">Upcoming Events</a></li>
            <li><a href="#volunteer-register" class="hover:text-sky-400 transition font-semibold text-sky-300">Volunteer Registration</a></li>
            <li><a href="#member-login" class="hover:text-sky-400 transition text-sky-300 font-semibold flex items-center gap-1"><span>👔</span> Member & Staff Portal</a></li>
          </ul>
        </div>

        <!-- Governance & Verification -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Governance & Trust</h4>
          <ul class="text-xs space-y-1.5 text-gray-400">
            <li><a href="#verify" class="hover:text-sky-400 transition">Verify Certificate Online</a></li>
            <li><a href="#transparency" class="hover:text-sky-400 transition">Certificate of Incorporation</a></li>
            <li><a href="#transparency" class="hover:text-sky-400 transition">Statutory Disclosures</a></li>
            <li><a href="#volunteer-guidelines" class="hover:text-sky-400 transition">Volunteer Guidelines</a></li>
            <li><a href="#privacy-policy" class="hover:text-sky-400 transition">Privacy Policy (DPDP Act)</a></li>
            <li><a href="#terms-of-use" class="hover:text-sky-400 transition">Terms of Use</a></li>
            <li><a href="#volunteer-dashboard" class="hover:text-sky-400 transition">Volunteer Dashboard</a></li>
            <li><a href="#admin" class="hover:text-amber-400 transition text-amber-300 font-semibold">NGO Admin Portal</a></li>
          </ul>
        </div>

        <!-- Registered Office & Contact -->
        <div class="space-y-3 text-xs">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Registered Office</h4>
          ${showRegOffice ? `
            <p class="text-gray-400 leading-relaxed">
              ${escapeHtml(s.registered_office)}
            </p>
          ` : `<p class="text-gray-500 italic">Address kept confidential / updated in disclosures.</p>`}
          <div class="space-y-1 text-gray-400">
            ${showEmail ? `<div>Email: <a href="mailto:${escapeHtml(s.official_email)}" class="text-sky-300 hover:underline">${escapeHtml(s.official_email)}</a></div>` : ''}
            ${showPhone ? `<div>Helpline: <span class="font-mono text-gray-300">${escapeHtml(s.official_phone)}</span></div>` : ''}
          </div>
        </div>

      </div>

      <!-- Statutory Declaration Bar -->
      <div class="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p class="text-center md:text-left">
          ${copyrightText}
        </p>
        <div class="flex items-center gap-4 text-xs">
          <a href="#volunteer-guidelines" class="hover:text-sky-400">Volunteer Guidelines</a>
          <a href="#privacy-policy" class="hover:text-sky-400">Privacy Policy</a>
          <a href="#terms-of-use" class="hover:text-sky-400">Terms of Use</a>
        </div>
      </div>
    </div>
  `;
}

async function ensureSettingsLoaded(force = false) {
  if (force || !AppState.settings || Object.keys(AppState.settings).length === 0) {
    try {
      const res = await API.getSettings();
      if (res.success) {
        AppState.settings = res.settings;
      }
    } catch (e) {}
  }
  updateHeaderUI(AppState.settings);
  renderFooter(AppState.settings);
}

async function handleRouting() {
  await ensureSettingsLoaded();
  const { route, params } = parseHash();
  AppState.currentRoute = route;
  AppState.routeParams = params;

  // Update active nav links
  document.querySelectorAll('.nav-link').forEach(el => {
    const target = el.getAttribute('data-route');
    if (target === route) {
      el.classList.add('text-sky-400', 'font-semibold');
      el.classList.remove('text-gray-200');
    } else {
      el.classList.remove('text-sky-400', 'font-semibold');
      el.classList.add('text-gray-200');
    }
  });

  const main = document.getElementById('main-content');
  if (!main) return;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch (route) {
    case 'home':
      await renderHome(main);
      break;
    case 'about':
      await renderAbout(main);
      break;
    case 'objectives':
      await renderObjectives(main);
      break;
    case 'programs':
      await renderPrograms(main);
      break;
    case 'events':
      await renderEvents(main);
      break;
    case 'volunteer-register':
      await renderVolunteerRegister(main);
      break;
    case 'volunteer-dashboard':
      await renderVolunteerDashboard(main);
      break;
    case 'member-login':
      await renderMemberLogin(main);
      break;
    case 'member-dashboard':
      await renderMemberDashboard(main);
      break;
    case 'volunteer-guidelines':
      await renderPolicyPage(main, 'volunteer_guidelines');
      break;
    case 'privacy-policy':
      await renderPolicyPage(main, 'privacy_policy');
      break;
    case 'terms-of-use':
      await renderPolicyPage(main, 'terms_of_use');
      break;
    case 'verify':
      await renderVerify(main);
      break;
    case 'transparency':
      await renderTransparency(main);
      break;
    case 'contact':
      await renderContact(main);
      break;
    case 'news':
      await renderNews(main, params);
      break;
    case 'donate':
      await renderDonate(main, params);
      break;
    case 'page':
      await renderCustomPage(main, params);
      break;
    case 'admin':
      await renderAdmin(main);
      break;
    default:
      await renderHome(main);
  }
}

// Auth State Check
async function checkAuthSession() {
  if (API.token) {
    try {
      const res = await API.getMe();
      if (res.success) {
        AppState.currentUser = res.user;
        AppState.volunteerApp = res.volunteerApp;
        AppState.memberProfile = res.memberProfile;
      } else {
        API.setToken('');
        AppState.currentUser = null;
        AppState.volunteerApp = null;
        AppState.memberProfile = null;
      }
    } catch (e) {
      API.setToken('');
      AppState.currentUser = null;
      AppState.volunteerApp = null;
      AppState.memberProfile = null;
    }
  } else {
    AppState.currentUser = null;
    AppState.volunteerApp = null;
    AppState.memberProfile = null;
  }
  updateNavUserUI();
}

function updateNavUserUI() {
  const container = document.getElementById('nav-user-actions');
  const mobileContainer = document.getElementById('mobile-user-actions');
  if (!container) return;

  if (AppState.currentUser) {
    const isStaff = ['super_admin', 'ngo_admin', 'volunteer_coordinator', 'program_coordinator'].includes(AppState.currentUser.role);
    const isMember = ['executive_member', 'employee'].includes(AppState.currentUser.role);

    let portalBadge = '';
    if (isStaff) {
      portalBadge = `
        <a href="#admin" class="px-3 py-1.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1">
          <span>⚙️</span> Admin Portal
        </a>
      `;
    } else if (isMember) {
      portalBadge = `
        <a href="#member-dashboard" class="px-3 py-1.5 rounded text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 flex items-center gap-1">
          <span>👔</span> Member Portal
        </a>
      `;
    } else {
      portalBadge = `
        <a href="#volunteer-dashboard" class="px-3 py-1.5 rounded text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30">
          Volunteer Dashboard
        </a>
      `;
    }

    const html = `
      <div class="flex items-center gap-3">
        ${portalBadge}
        <span class="text-xs text-gray-300 hidden md:inline font-medium">${AppState.currentUser.full_name}</span>
        <button onclick="handleLogout()" class="px-3 py-1.5 rounded text-xs font-medium text-gray-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition">
          Sign Out
        </button>
      </div>
    `;
    container.innerHTML = html;
    if (mobileContainer) mobileContainer.innerHTML = html;
  } else {
    const html = `
      <div class="flex items-center gap-2">
        <a href="#member-login" class="px-2.5 py-1.5 rounded text-xs font-medium text-sky-200 hover:text-white hover:bg-white/10 transition hidden md:inline-flex items-center gap-1 border border-sky-400/30">
          <span>👔</span> Member Login
        </a>
        <button onclick="openAuthModal('login')" class="px-3 py-1.5 rounded text-xs font-medium text-gray-200 hover:text-white hover:bg-white/10 transition">
          Sign In
        </button>
        <a href="#volunteer-register" class="px-3 py-1.5 rounded text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition">
          Join as Volunteer
        </a>
      </div>
    `;
    container.innerHTML = html;
    if (mobileContainer) mobileContainer.innerHTML = html;
  }
}

async function handleLogout() {
  await API.logout();
  AppState.currentUser = null;
  AppState.volunteerApp = null;
  AppState.memberProfile = null;
  updateNavUserUI();
  showToast('You have signed out.', 'info');
  navigateTo('home');
}

// -------------------------------------------------------------
// PAGE RENDERERS
// -------------------------------------------------------------



// 1. HOME PAGE (100% Dynamic from Settings)
async function renderHome(container) {
  await ensureSettingsLoaded(true);
  const s = AppState.settings || {};

  const defaultRi8 = [
    { id: 1, title: 'Right View', subtitle: 'Understanding sustainability and social responsibility.', education: 'Ethical learning & sustainability awareness.', health: 'Preventive healthcare & healthy lifestyles.', environment: 'Conservation & waste reduction.' },
    { id: 2, title: 'Right Intention', subtitle: 'Commitment to positive, ethical, community-focused actions.', education: 'Inclusive, value-based learning.', health: 'Healthy living & hygiene habits.', environment: 'Waste management & circular recycling.' },
    { id: 3, title: 'Right Speech', subtitle: 'Truthful, constructive, and awareness-driven communication.', education: 'Knowledge-sharing & educational campaigns.', health: 'Accurate health & hygiene information.', environment: 'Responsible climate communication.' },
    { id: 4, title: 'Right Action', subtitle: 'Responsible and impactful action for societal benefit.', education: 'Tutoring programs & practical training.', health: 'Health camps & sanitation initiatives.', environment: 'Clean-up drives & afforestation.' },
    { id: 5, title: 'Right Livelihood', subtitle: 'Ethical and sustainable means of livelihood.', education: 'Vocational skills & self-reliance.', health: 'Community wellness professions.', environment: 'Green jobs & eco enterprises.' },
    { id: 6, title: 'Right Concentration', subtitle: 'Focused efforts towards long-term sustainable impact.', education: 'Structured continuous learning.', health: 'Sustained preventive awareness.', environment: 'Long-term conservation projects.' },
    { id: 7, title: 'Right Mindfulness', subtitle: 'Conscious awareness of our actions and their societal impact.', education: 'Responsible active citizenship.', health: 'Mindful nutrition and wellness.', environment: 'Mindful consumption & zero-waste habits.' },
    { id: 8, title: 'Right Effort', subtitle: 'Consistent dedication towards positive societal change.', education: 'Improving access & quality of learning.', health: 'Persistent health awareness outreach.', environment: 'Sustained drives for cleaner surroundings.' }
  ];
  const ri8List = Array.isArray(s.ri8_framework) ? s.ri8_framework : defaultRi8;

  container.innerHTML = `
    <!-- Government Incorporation Notice Bar -->
    <div class="bg-sky-950 border-b border-sky-800/60 text-sky-200 text-xs py-2 px-4">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-semibold text-white">${escapeHtml(s.legal_structure || 'Section 8 Non-Profit Organization')}</span>
          <span class="hidden sm:inline text-sky-400/60">|</span>
          <span class="hidden sm:inline">Ministry of Corporate Affairs, Govt. of India</span>
        </div>
        <div class="flex items-center gap-4 text-xs font-mono text-sky-300">
          ${(s.show_cin !== false && s.cin) ? `<span>CIN: <strong class="text-white">${escapeHtml(s.cin)}</strong></span>` : ''}
          ${(s.show_pan !== false && s.pan) ? `<span class="hidden md:inline">PAN: ${escapeHtml(s.pan)}</span>` : ''}
          <a href="#transparency" class="text-amber-300 underline hover:text-amber-200 font-sans">Legal Disclosures &rarr;</a>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="relative bg-gradient-to-b from-[#0c4a6e] via-[#0369a1] to-[#082f49] text-white py-16 md:py-24 px-4 overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#d4af37 1px, transparent 1px); background-size: 24px 24px;"></div>
      <div class="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 space-y-6">
          ${s.org_meaning ? `
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-900/60 border border-sky-500/40 text-sky-300 text-xs font-semibold tracking-wide">
              <span class="w-2 h-2 rounded-full bg-teal-400"></span>
              ${escapeHtml(s.org_meaning)}
            </div>
          ` : ''}
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            ${escapeHtml(s.home_hero_title || s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')}
          </h1>
          <p class="text-lg sm:text-xl text-sky-100/90 font-light leading-relaxed">
            ${escapeHtml(s.home_hero_subtitle || s.mission || 'A Section 8 non-profit organization promoting education, preventive healthcare, and environmental sustainability based on the Noble RI8 framework.')}
          </p>
          ${s.legal_structure ? `
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
              <div class="text-xs uppercase tracking-wider text-amber-300 font-bold">Organizational Mandate</div>
              <p class="text-sm text-gray-200">
                ${escapeHtml(s.legal_structure)}. The Foundation's entire income is applied solely towards education, public welfare, and environmental sustainability.
              </p>
            </div>
          ` : ''}
          <div class="flex flex-wrap gap-4 pt-2">
            <a href="#volunteer-register" class="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md transition flex items-center gap-2">
              Become a Volunteer Member &rarr;
            </a>
            <a href="#verify" class="px-6 py-3 rounded-lg bg-sky-900/80 hover:bg-sky-900 text-sky-200 border border-sky-700/60 font-semibold text-sm transition">
              Verify Volunteer Certificate
            </a>
            <a href="#objectives" class="px-6 py-3 rounded-lg bg-transparent hover:bg-white/10 text-white border border-white/30 font-semibold text-sm transition">
              Our Objectives &rarr;
            </a>
          </div>
        </div>

        <div class="lg:col-span-5 space-y-4">
          ${s.hero_image_url ? `
            <div class="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
              <img src="${escapeHtml(s.hero_image_url)}" alt="Foundation Activities" class="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span class="text-xs font-semibold text-amber-300 flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                  <span>🌱</span> Grassroots Community Action
                </span>
              </div>
            </div>
          ` : ''}
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl space-y-6 text-white">
            <div class="flex items-center gap-3 border-b border-white/10 pb-4">
              <div class="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center font-bold text-xl text-white overflow-hidden shrink-0 border border-white/20">
                ${s.logo_url ? `<img src="${escapeHtml(s.logo_url)}" alt="Logo" class="w-full h-full object-contain p-1" />` : (s.logo_badge_text || 'R8')}
              </div>
              <div>
                <h3 class="font-bold text-lg leading-tight">${escapeHtml(s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')}</h3>
                ${s.org_meaning ? `<p class="text-xs text-sky-300 font-medium">${escapeHtml(s.org_meaning)}</p>` : ''}
              </div>
            </div>

            <!-- Vision & Mission Compact Box -->
            <div class="space-y-4 text-sm">
              ${(s.show_vision !== false && s.vision) ? `
                <div class="p-3.5 rounded-lg bg-sky-950/60 border border-sky-800/80">
                  <div class="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Our Vision
                  </div>
                  <p class="text-xs sm:text-sm text-sky-50 italic">
                    "${escapeHtml(s.vision)}"
                  </p>
                </div>
              ` : ''}
              ${(s.show_mission !== false && s.mission) ? `
                <div class="p-3.5 rounded-lg bg-teal-950/60 border border-sky-800/80">
                  <div class="text-xs font-bold text-sky-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Our Mission
                  </div>
                  <p class="text-xs sm:text-sm text-sky-50 italic">
                    "${escapeHtml(s.mission)}"
                  </p>
                </div>
              ` : ''}
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
              <div class="p-3 rounded-lg bg-black/20 border border-white/5">
                <div class="text-xl font-bold text-amber-300">Section 8</div>
                <div class="text-gray-300 mt-0.5">Non-Profit India</div>
              </div>
              <div class="p-3 rounded-lg bg-black/20 border border-white/5">
                <div class="text-xl font-bold text-sky-300">Pan-India</div>
                <div class="text-gray-300 mt-0.5">Nationwide Scope</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact Statistics Counter Bar -->
    <div class="bg-gradient-to-r from-sky-900 via-sky-850 to-slate-900 border-b border-sky-800 text-white py-6 px-4 shadow-inner">
      <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div class="p-3">
          <div class="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">${escapeHtml(s.metric_volunteers || '500+')}</div>
          <div class="text-xs text-sky-200 mt-1 font-semibold uppercase tracking-wider">Dedicated Volunteers</div>
        </div>
        <div class="p-3">
          <div class="text-2xl sm:text-3xl font-black text-sky-300 tracking-tight">${escapeHtml(s.metric_villages || '25+')}</div>
          <div class="text-xs text-sky-200 mt-1 font-semibold uppercase tracking-wider">Villages & Communities</div>
        </div>
        <div class="p-3">
          <div class="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">${escapeHtml(s.metric_beneficiaries || '10,000+')}</div>
          <div class="text-xs text-sky-200 mt-1 font-semibold uppercase tracking-wider">Lives Positively Impacted</div>
        </div>
        <div class="p-3">
          <div class="text-2xl sm:text-3xl font-black text-teal-300 tracking-tight">${escapeHtml(s.metric_trees || '5,000+')}</div>
          <div class="text-xs text-sky-200 mt-1 font-semibold uppercase tracking-wider">Trees & Flora Planted</div>
        </div>
      </div>
    </div>

    <!-- NGO Activities Photo Showcase (AI Generated & Live Activities) -->
    ${(() => {
      const defaultActivities = [
        {
          id: 1,
          title: 'Childhood Digital Literacy & Mentorship',
          category: 'Education & Youth',
          description: 'Empowering children from underprivileged backgrounds with interactive learning kits, tablets, and mentorship aligned with Right View and Right Action.',
          image: '/assets/activity_education.jpg',
          link: '#programs',
          link_text: 'Explore Education Initiatives →',
          visible: true
        },
        {
          id: 2,
          title: 'Community Afforestation & Clean Earth',
          category: 'Environment & Circular Economy',
          description: 'Youth and volunteer drives planting indigenous saplings, fostering neighborhood waste recycling, and promoting sustainable environmental stewardship.',
          image: '/assets/activity_tree_plantation.jpg',
          link: '#events',
          link_text: 'View Upcoming Drives →',
          visible: true
        },
        {
          id: 3,
          title: 'Preventive Medical Camps & Child Nutrition',
          category: 'Health & Nutrition',
          description: 'Free doctor consultations, vital screenings, and preventive health awareness workshops for rural mothers, senior citizens, and children.',
          image: '/assets/activity_health_camp.jpg',
          link: '#programs',
          link_text: 'Learn About Health Camps →',
          visible: true
        }
      ];
      const acts = (Array.isArray(s.home_activities) && s.home_activities.length > 0 ? s.home_activities : defaultActivities).filter(a => a.visible !== false && a.title);
      if (acts.length === 0) return '';
      return `
        <section class="py-12 bg-sky-50/70 border-b border-sky-100 px-4">
          <div class="max-w-7xl mx-auto space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-200/70 text-sky-900 text-xs font-bold uppercase tracking-wider mb-2">
                  GROUND IMPACT & ACTIVITIES
                </div>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-sky-950">${escapeHtml(s.home_activities_heading || 'Foundation Community Outreach in Action')}</h2>
              </div>
              <p class="text-xs text-slate-600 max-w-md leading-relaxed">
                ${escapeHtml(s.home_activities_subheading || 'Realizing our Section 8 charitable mandate through active on-ground programs in digital education, preventive healthcare camps, and mass community afforestation.')}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              ${acts.map((act) => `
                <div class="bg-white rounded-2xl overflow-hidden border border-sky-200 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                  <div>
                    <div class="h-52 overflow-hidden relative bg-slate-100">
                      <img src="${escapeHtml(act.image || '/assets/activity_education.jpg')}" alt="${escapeHtml(act.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='/assets/Banner.png'"/>
                      ${act.category ? `
                        <div class="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-sky-900/85 text-white text-[11px] font-bold backdrop-blur-xs">
                          ${escapeHtml(act.category)}
                        </div>
                      ` : ''}
                    </div>
                    <div class="p-5 space-y-2">
                      <h3 class="font-bold text-base text-slate-900">${escapeHtml(act.title)}</h3>
                      <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(act.description || '')}</p>
                    </div>
                  </div>
                  ${act.link ? `
                    <div class="px-5 pb-5 pt-1">
                      <a href="${escapeHtml(act.link)}" class="text-xs font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1">
                        ${escapeHtml(act.link_text || 'Explore Initiative &rarr;')}
                      </a>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    })()}

    <!-- The Noble RI8 Framework Cards -->
    <section class="py-16 md:py-20 px-4 bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold">
            PHILOSOPHICAL FOUNDATION
          </div>
          <h2 class="text-3xl font-extrabold text-[#0369a1]">
            The Noble RI8 Framework
          </h2>
          <p class="text-gray-600 text-sm">
            Our eight guiding principles applied across Education, Preventive Healthcare, and Environmental Sustainability.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${ri8List.map((p, idx) => `
            <div class="rounded-2xl border border-gray-200 p-6 bg-gradient-to-b from-stone-50 to-white shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between border-b border-gray-200/80 pb-3">
                  <span class="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    ${idx + 1}
                  </span>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-sky-800">Principle</span>
                </div>
                <h3 class="text-base font-bold text-[#0369a1]">${escapeHtml(p.title)}</h3>
                <p class="text-xs text-gray-600 leading-relaxed italic">${escapeHtml(p.subtitle)}</p>

                <div class="pt-2 space-y-2 text-xs">
                  ${p.education ? `
                    <div class="p-2 rounded bg-sky-50 text-sky-950 border border-emerald-100">
                      <strong class="text-sky-800">Education:</strong> ${escapeHtml(p.education)}
                    </div>
                  ` : ''}
                  ${p.health ? `
                    <div class="p-2 rounded bg-sky-50 text-sky-950 border border-sky-100">
                      <strong class="text-sky-800">Health:</strong> ${escapeHtml(p.health)}
                    </div>
                  ` : ''}
                  ${p.environment ? `
                    <div class="p-2 rounded bg-amber-50 text-amber-950 border border-amber-100">
                      <strong class="text-amber-800">Environment:</strong> ${escapeHtml(p.environment)}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}


// 2. ABOUT US PAGE (100% Dynamic & Configurable)
async function renderAbout(container) {
  await ensureSettingsLoaded(true);
  const s = AppState.settings || {};

  const defaultDirectors = [
    { name: 'Ms. Shilpa Sunil Umare', role: 'Director & Co-Founder', qualification: 'MA Economics, Early Childhood Educator', contact: 'shilpa.manwatkar@gmail.com', photo: '/assets/Shilpa Photo.jpg', location: 'Navi Mumbai, Maharashtra', visible: true },
    { name: 'Ms. Sarika Uttamchand Wakde', role: 'Director & Co-Founder', qualification: 'MA, Entrepreneur & Community Advocate', contact: 'sarikauwakde1977@gmail.com', photo: '/assets/Sarika Photo.png', location: 'Ballarpur, Dist. Chandrapur, Maharashtra', visible: true }
  ];
  const dirs = Array.isArray(s.governing_body) ? s.governing_body : defaultDirectors;
  const visibleDirs = dirs.filter(d => d.visible !== false && d.name && d.name.trim() !== '');

  const defaultExecutiveMembers = [
    {
      id: "EXEC-001",
      name: "Dr. Rameshwar V. Deshmukh",
      role: "Vice President (Honorary)",
      category: "Executive Office Bearer",
      qualification: "Ph.D. in Social Sciences, Former University Dean & Community Welfare Mentor",
      contact: "rameshwar.deshmukh@ri8win.org",
      location: "Navi Mumbai, Maharashtra",
      appointment_date: "06 October 2026",
      photo: "/assets/activity_education.jpg",
      honorary_terms: "Honorary Office Bearer • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.",
      membership_id: "RI8-EXEC-2026-0001",
      certificate_number: "CERT-HON-RI8-2026-0001",
      visible: true
    },
    {
      id: "EXEC-002",
      name: "Adv. Sunita K. Patil",
      role: "General Secretary & Legal Compliance (Honorary)",
      category: "Executive Office Bearer",
      qualification: "LL.M., Non-Profit Statutory Governance & Human Rights Specialist",
      contact: "sunita.patil@ri8win.org",
      location: "Kamothe, Navi Mumbai, Maharashtra",
      appointment_date: "06 October 2026",
      photo: "/assets/Sarika Photo.png",
      honorary_terms: "Honorary Office Bearer • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.",
      membership_id: "RI8-EXEC-2026-0002",
      certificate_number: "CERT-HON-RI8-2026-0002",
      visible: true
    },
    {
      id: "EXEC-003",
      name: "CA Rajesh M. Agrawal",
      role: "Honorary Treasurer & Audit Advisor",
      category: "Executive Office Bearer",
      qualification: "FCA, Senior Chartered Accountant & Financial Compliance Expert",
      contact: "rajesh.agrawal@ri8win.org",
      location: "Chandrapur & Nagpur, Maharashtra",
      appointment_date: "08 October 2026",
      photo: "/assets/activity_tree_plantation.jpg",
      honorary_terms: "Honorary Office Bearer • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.",
      membership_id: "RI8-EXEC-2026-0003",
      certificate_number: "CERT-HON-RI8-2026-0003",
      visible: true
    },
    {
      id: "EXEC-004",
      name: "Mr. Anil S. Gokhale",
      role: "Executive Coordinator - Youth Empowerment & Programs (Honorary)",
      category: "Executive Committee Member",
      qualification: "M.Tech, Vocational Training & Youth Employment Mentor",
      contact: "anil.gokhale@ri8win.org",
      location: "Pune & Raigad, Maharashtra",
      appointment_date: "10 October 2026",
      photo: "/assets/activity_health_camp.jpg",
      honorary_terms: "Honorary Committee Member • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.",
      membership_id: "RI8-EXEC-2026-0004",
      certificate_number: "CERT-HON-RI8-2026-0004",
      visible: true
    }
  ];
  const execs = Array.isArray(s.executive_members) ? s.executive_members : defaultExecutiveMembers;
  const visibleExecs = execs.filter(m => m.visible !== false && m.name && m.name.trim() !== '');

  const defaultValues = [
    { title: 'Integrity', desc: 'Transparency and accountability in all activities and stewardship of resources.' },
    { title: 'Compassion', desc: 'Service with empathy, dignity, and deep respect for human welfare.' },
    { title: 'Inclusiveness', desc: 'Equal opportunities regardless of gender, social, or economic background.' },
    { title: 'Sustainability', desc: 'Responsible environmental, conservation, and agricultural practices.' },
    { title: 'Empowerment', desc: 'Strengthening youth, farmers, women, and marginalized communities.' },
    { title: 'Collaboration', desc: 'Active partnership with educational institutions, CSR partners, and communities.' },
    { title: 'Social Justice', desc: 'Promoting equality, human rights protection, and social harmony.' }
  ];
  const coreVals = Array.isArray(s.core_values) ? s.core_values : defaultValues;

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <!-- Title Header -->
      <div class="text-center space-y-3 border-b border-gray-200 pb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
          OFFICIAL IDENTITY & GOVERNANCE
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#0369a1]">
          About ${escapeHtml(s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')}
        </h1>
        <p class="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          ${escapeHtml(s.about_intro_text || 'A legally registered Section 8 non-profit organization dedicated to human empowerment, social justice, and environmental harmony.')}
        </p>
      </div>

      <!-- Identity Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 class="text-xl font-bold text-[#0369a1] flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-sky-600"></span>
            Legal Structure & Name Meaning
          </h2>
          <div class="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              <strong>Official Legal Name:</strong> <span class="font-mono text-sky-900 bg-sky-50 px-2 py-0.5 rounded font-bold">${escapeHtml(s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')}</span>
            </p>
            ${s.org_meaning ? `<p><strong>Meaning:</strong> <em>${escapeHtml(s.org_meaning)}</em></p>` : ''}
            <p>
              <strong>Nature of Organization:</strong>
              <ul class="list-disc list-inside space-y-1 pl-2 text-xs font-medium text-gray-800">
                <li>Non-Profit Organization</li>
                <li>Non-Religious Organization</li>
                <li>Non-Political Organization</li>
              </ul>
            </p>
            ${(s.show_funds_utilization !== false && s.funds_utilization) ? `
              <div class="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900">
                <strong>Statutory Commitment:</strong> ${escapeHtml(s.funds_utilization)}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 class="text-xl font-bold text-[#0369a1] flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-sky-600"></span>
            Scope & Area of Operation
          </h2>
          <div class="space-y-3 text-sm text-gray-700 leading-relaxed">
            ${(s.show_area_of_operation !== false && s.area_of_operation) ? `
              <p><strong>Area of Operation:</strong> ${escapeHtml(s.area_of_operation)}</p>
            ` : ''}
            <div class="p-3 bg-sky-50 rounded border border-sky-200 text-xs text-sky-900 space-y-1">
              ${(s.show_registered_office !== false && s.registered_office) ? `<div><strong>Registered Office:</strong> ${escapeHtml(s.registered_office)}</div>` : ''}
              ${(s.show_cin !== false && s.cin) ? `<div><strong>Corporate Identity Number (CIN):</strong> ${escapeHtml(s.cin)}</div>` : ''}
              <div class="flex flex-wrap gap-4">
                ${(s.show_pan !== false && s.pan) ? `<span><strong>PAN:</strong> ${escapeHtml(s.pan)}</span>` : ''}
                ${(s.show_tan !== false && s.tan) ? `<span><strong>TAN:</strong> ${escapeHtml(s.tan)}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Foundation Genesis & Statutory Non-Profit Commitment Card -->
      ${(s.about_history_text || s.about_statutory_text) ? `
        <div class="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-4">
          <h2 class="text-xl font-bold text-[#0369a1] flex items-center gap-2">
            <span>📜</span> Foundation Genesis & Statutory Non-Profit Commitment
          </h2>
          ${s.about_history_text ? `
            <p class="text-sm text-gray-700 leading-relaxed">
              ${escapeHtml(s.about_history_text)}
            </p>
          ` : ''}
          ${s.about_statutory_text ? `
            <div class="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-sky-900 leading-relaxed">
              <strong>Section 8 Statutory Mandate:</strong> ${escapeHtml(s.about_statutory_text)}
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Vision & Mission Full Card -->
      ${(s.show_vision !== false || s.show_mission !== false) ? `
        <div class="bg-[#0369a1] text-white rounded-2xl p-8 shadow-md grid grid-cols-1 md:grid-cols-2 gap-8">
          ${(s.show_vision !== false && s.vision) ? `
            <div class="space-y-3 border-b md:border-b-0 md:border-r border-sky-700/60 pb-6 md:pb-0 md:pr-8">
              <div class="text-xs font-bold text-amber-300 uppercase tracking-wider">Our Vision</div>
              <p class="text-base sm:text-lg italic text-sky-50 leading-relaxed">
                "${escapeHtml(s.vision)}"
              </p>
            </div>
          ` : ''}
          ${(s.show_mission !== false && s.mission) ? `
            <div class="space-y-3">
              <div class="text-xs font-bold text-sky-300 uppercase tracking-wider">Our Mission</div>
              <p class="text-base sm:text-lg italic text-sky-50 leading-relaxed">
                "${escapeHtml(s.mission)}"
              </p>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Core Values -->
      ${coreVals.length > 0 ? `
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-bold text-[#0369a1]">Our Core Values</h2>
            <p class="text-xs text-gray-500 uppercase tracking-widest">Guiding our daily conduct and governance</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${coreVals.map((v, i) => `
              <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-1.5">
                <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span> ${i + 1}. ${escapeHtml(v.title)}
                </div>
                <p class="text-xs text-gray-600">${escapeHtml(v.desc)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Governing Body / Directors -->
      ${visibleDirs.length > 0 ? `
        <div class="space-y-6 pt-4">
          <div class="text-center space-y-2">
            <div class="text-xs font-bold text-sky-700 uppercase tracking-wider">LEADERSHIP & GOVERNANCE</div>
            <h2 class="text-2xl font-bold text-[#0369a1]">Governing Body & Board of Directors</h2>
            <p class="text-xs text-gray-600 max-w-xl mx-auto">
              Members of the Foundation's Board of Directors and executive governing body.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            ${visibleDirs.map(d => `
              <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col items-center text-center space-y-3">
                <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-sky-700 shadow bg-gray-100 flex items-center justify-center">
                  ${d.photo ? `
                    <img src="${escapeHtml(d.photo)}" alt="${escapeHtml(d.name)}" class="w-full h-full object-cover" onerror="this.src='/assets/Shilpa Photo.jpg'"/>
                  ` : `
                    <div class="text-sky-800 font-bold text-xl">${escapeHtml((d.name || 'Dir').slice(0, 2).toUpperCase())}</div>
                  `}
                </div>
                <div class="space-y-1">
                  <h3 class="text-base font-bold text-[#0369a1]">${escapeHtml(d.name)}</h3>
                  ${d.role ? `<p class="text-xs font-semibold text-sky-700">${escapeHtml(d.role)}</p>` : ''}
                  ${d.qualification ? `<p class="text-xs text-gray-600">${escapeHtml(d.qualification)}</p>` : ''}
                  ${(d.contact || d.location) ? `
                    <div class="text-xs text-gray-500 pt-1 space-y-0.5">
                      ${d.contact ? `<div>${escapeHtml(d.contact)}</div>` : ''}
                      ${d.location ? `<div>${escapeHtml(d.location)}</div>` : ''}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Executive Committee & Office Bearers (Section 8 Honorary Members - Without Salary) -->
      ${visibleExecs.length > 0 ? `
        <div class="space-y-6 pt-8 border-t border-sky-100">
          <div class="text-center space-y-2">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              SECTION 8 STATUTORY HONORARY APPOINTMENTS
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0369a1]">Executive Committee & Office Bearers</h2>
            <p class="text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Serving the Foundation in an <strong>Honorary Capacity without salary, remuneration, commission, or profit share</strong> in strict compliance with Section 8(1)(b) & Section 8(1)(c) of the Companies Act, 2013 (Govt. of India).
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            ${visibleExecs.map(m => `
              <div class="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm hover:shadow-md transition flex flex-col justify-between text-center space-y-4">
                <div class="space-y-3">
                  <div class="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-sky-600 shadow-sm bg-sky-50 flex items-center justify-center">
                    <img src="${escapeHtml(m.photo || '/assets/activity_education.jpg')}" alt="${escapeHtml(m.name)}" class="w-full h-full object-cover" onerror="this.src='/assets/Banner.png'"/>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-900">${escapeHtml(m.name)}</h3>
                    <div class="text-xs font-semibold text-sky-700 mt-0.5">${escapeHtml(m.role)}</div>
                    <div class="text-[11px] text-slate-500 mt-1">${escapeHtml(m.qualification || '')}</div>
                    <div class="text-[11px] text-slate-400">${escapeHtml(m.location || '')}</div>
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 space-y-2">
                  <div class="inline-block px-2 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-bold border border-sky-200">
                    Honorary • No Salary (Sec. 8)
                  </div>
                  <div class="text-[10px] font-mono text-slate-500">ID: ${escapeHtml(m.membership_id)}</div>
                  <a href="#verify?certNumber=${encodeURIComponent(m.certificate_number || m.membership_id)}" class="inline-block w-full py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-sm">
                    View Appointment Cert &rarr;
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}


// 3. OUR OBJECTIVES PAGE (100% Dynamic from Settings)
async function renderObjectives(container) {
  await ensureSettingsLoaded(true);
  const s = AppState.settings || {};

  const defaultObjectives = [
    'Promote free and quality education among children, youth, and underprivileged communities through schools, training programs, workshops, awareness initiatives, and skill development.',
    'Promote environmental protection through tree plantation, waste management, recycling, climate awareness, conservation, and sustainable development.',
    'Create awareness about responsible resource utilization and circular economy principles.',
    'Undertake activities for clean environment, sanitation, and pollution control.',
    'Support farmers and rural communities through capacity building, livelihood enhancement, and agricultural innovation.',
    'Promote sustainable agriculture, modern farming techniques, organic farming, water conservation, and agricultural skill development.',
    'Promote women empowerment through education, skill training, self-help groups, entrepreneurship, and livelihood opportunities.',
    'Collaborate with government bodies, educational institutions, CSR organizations, and communities for social and environmental impact.',
    'Encourage volunteerism and community participation in development initiatives across India.',
    'Organize seminars, workshops, awareness campaigns, and community outreach programs.',
    'Undertake lawful activities supporting sustainable development and public welfare.',
    'Promote social inclusion and equality by supporting marginalized, economically weaker, and disadvantaged communities.',
    'Conduct skill development and vocational training for employment generation and self-reliance among youth and rural populations.'
  ];
  const objs = Array.isArray(s.statutory_objectives) ? s.statutory_objectives : defaultObjectives;

  const defaultCategories = [
    {
      title: 'Education and Youth',
      points: [
        'Educational support programs for children',
        'Career guidance and mentorship',
        'Skill development and vocational training',
        'Sports and physical education',
        'Youth leadership and employability'
      ]
    },
    {
      title: 'Health & Community Welfare',
      points: [
        'Child health, nutrition, and development',
        'Preventive healthcare awareness',
        'Health camps and medical awareness drives',
        'Hunger, poverty, and malnutrition relief',
        'Sanitation and safe drinking water awareness',
        'Elderly care and old-age home support'
      ]
    },
    {
      title: 'Environment & Agriculture',
      points: [
        'Environmental protection and sustainability',
        'Tree plantation and conservation',
        'Waste management and recycling',
        'Climate awareness and carbon reduction',
        'Sustainable and organic agriculture',
        'Farmer training and water conservation'
      ]
    },
    {
      title: 'Women & Rural Empowerment',
      points: [
        'Women empowerment & livelihood training',
        'Self-help group (SHG) enterprise development',
        'Rural employment and handicraft skills',
        'Farmer capacity building',
        'Agricultural innovation and market link'
      ]
    },
    {
      title: 'Other Public Welfare & Humanitarian Action',
      points: [
        'Animal welfare and community animal care',
        'Rural and urban slum area development',
        'Disaster relief, rehabilitation, and reconstruction',
        'Other lawful social development initiatives in line with Section 8'
      ]
    }
  ];
  const cats = Array.isArray(s.objectives_activity_categories) && s.objectives_activity_categories.length > 0 ? s.objectives_activity_categories : defaultCategories;

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div class="text-center space-y-3 border-b border-gray-200 pb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
          APPROVED STATUTORY OBJECTIVES
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#0369a1]">
          Our Objectives & Activities
        </h1>
        <p class="text-gray-600 max-w-3xl mx-auto text-sm sm:text-base">
          ${escapeHtml(s.objectives_intro_text || ('Approved under the Memorandum of Association of ' + (s.org_name || 'RI8WIN NOBEL PATH FOUNDATION') + ' as a Section 8 non-profit company.'))}
        </p>
      </div>

      <!-- Core Objectives (Part 2A) -->
      <div class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#0369a1] text-white flex items-center justify-center font-bold text-sm">A</div>
          <h2 class="text-2xl font-bold text-[#0369a1]">Statutory Objectives (${objs.length})</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${objs.map((o, idx) => `
            <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex gap-3 ${idx === objs.length - 1 && objs.length % 2 === 1 ? 'md:col-span-2' : ''}">
              <span class="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">${idx + 1}</span>
              <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">${escapeHtml(o)}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Key Activities by Category (Part 2B) -->
      <div class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-sm">B</div>
          <h2 class="text-2xl font-bold text-[#0369a1]">Key Activity Categories</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${cats.map((cat, cIdx) => `
            <div class="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-3 ${cIdx === cats.length - 1 && cats.length % 3 === 1 ? 'md:col-span-2 lg:col-span-3' : ''}">
              <h3 class="font-bold text-base text-[#0369a1] flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                ${escapeHtml(cat.title || 'Activity Category')}
              </h3>
              <ul class="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                ${(cat.points || []).map(p => `<li>${escapeHtml(p)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Utilization of Funds (Part 2C) -->
      <div class="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3 text-sm text-stone-800">
        <div class="flex items-center gap-2 text-amber-900 font-bold text-base">
          <span class="text-lg">⚖️</span> Statutory Principle: Utilization of Funds
        </div>
        <p class="leading-relaxed">
          The income and property of <strong>${escapeHtml(s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')}</strong> shall be applied solely towards the promotion of the organizational objectives set forth above.
        </p>
        <div class="text-xs text-stone-700 bg-white p-3 rounded-lg border border-amber-200">
          ${escapeHtml(s.funds_utilization || 'No profits or dividends shall be distributed to members or directors. Proper books of accounts are maintained and audited annually by certified Chartered Accountants as mandated by the Companies Act, 2013, India. In line with statutory transparency, no unverified financial claims are made.')}
        </div>
      </div>
    </div>
  `;
}

// 4. OUR PROGRAMS PAGE
async function renderPrograms(container) {
  let programs = [];
  try {
    const res = await API.getPrograms();
    if (res.success) programs = res.programs;
  } catch (e) {}

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
          PROGRAM PORTFOLIO
        </div>
        <h1 class="text-3xl font-extrabold text-[#0369a1]">Our Foundation Programs</h1>
        <p class="text-gray-600 text-sm max-w-2xl mx-auto">
          Explore ongoing, active, and upcoming programs designed to implement the Noble RI8 framework across communities.
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold" id="program-category-tabs">
        <button onclick="filterPrograms('All')" class="prog-tab-btn active px-3.5 py-2 rounded-lg bg-[#0369a1] text-white">All Categories</button>
        <button onclick="filterPrograms('Education and Youth')" class="prog-tab-btn px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Education & Youth</button>
        <button onclick="filterPrograms('Health and Community Welfare')" class="prog-tab-btn px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Health & Welfare</button>
        <button onclick="filterPrograms('Environment and Agriculture')" class="prog-tab-btn px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Environment & Agri</button>
        <button onclick="filterPrograms('Women and Rural Empowerment')" class="prog-tab-btn px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Women & Rural</button>
        <button onclick="filterPrograms('Other Public Welfare')" class="prog-tab-btn px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Public Welfare</button>
      </div>

      <!-- Programs Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="programs-grid-container">
        ${renderProgramCards(programs)}
      </div>
    </div>
  `;
}


function renderProgramCards(programs) {
  if (!programs || programs.length === 0) {
    return '<div class="col-span-3 text-center py-12 text-gray-500 text-sm">No programs found in this category.</div>';
  }
  return programs.map(p => `
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      ${p.image_url ? `
        <div class="h-44 w-full overflow-hidden bg-gray-100 border-b border-gray-100">
          <img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onerror="this.parentElement.style.display='none'"/>
        </div>
      ` : `
        <div class="h-16 w-full bg-gradient-to-r from-teal-800 to-emerald-900 p-3 flex items-end">
          <span class="text-[11px] font-semibold text-sky-100">${escapeHtml(p.category)}</span>
        </div>
      `}
      <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              ${escapeHtml(p.category)}
            </span>
            <span class="text-xs px-2 py-0.5 rounded font-medium ${p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'}">
              ${escapeHtml(p.status)}
            </span>
          </div>
          <h3 class="text-lg font-bold text-gray-900 leading-snug">${escapeHtml(p.title)}</h3>
          <p class="text-xs text-gray-600 leading-relaxed">${escapeHtml(p.description)}</p>
          ${p.objectives ? `
            <div class="text-xs bg-slate-50 p-2.5 rounded border border-slate-100 text-slate-700">
              <strong>Key Focus:</strong> ${escapeHtml(p.objectives)}
            </div>
          ` : ''}
        </div>
        <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Target: <strong>${escapeHtml(p.target_audience || 'All communities')}</strong></span>
          <a href="#volunteer-register" class="text-sky-700 hover:text-sky-900 font-semibold">Join Project &rarr;</a>
        </div>
      </div>
    </div>
  `).join('');
}


async function filterPrograms(cat) {
  document.querySelectorAll('.prog-tab-btn').forEach(b => {
    b.classList.remove('bg-[#0369a1]', 'text-white', 'active');
    b.classList.add('bg-gray-100', 'text-gray-700');
  });
  if (event && event.target) {
    event.target.classList.add('bg-[#0369a1]', 'text-white', 'active');
    event.target.classList.remove('bg-gray-100', 'text-gray-700');
  }

  const container = document.getElementById('programs-grid-container');
  if (!container) return;
  container.innerHTML = '<div class="col-span-3 text-center py-8 text-gray-400">Loading programs...</div>';

  try {
    const res = await API.getPrograms(cat === 'All' ? null : cat);
    if (res.success) {
      container.innerHTML = renderProgramCards(res.programs);
    }
  } catch (e) {
    container.innerHTML = '<div class="col-span-3 text-center py-8 text-red-500">Failed to load programs.</div>';
  }
}

// 5. EVENTS PAGE

async function renderEvents(container) {
  let events = [];
  try {
    const res = await API.getEvents();
    if (res.success) events = res.events;
  } catch (e) {}

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
          COMMUNITY DRIVES & WORKSHOPS
        </div>
        <h1 class="text-3xl font-extrabold text-[#0369a1]">Upcoming Events & Activities</h1>
        <p class="text-gray-600 text-sm max-w-2xl mx-auto">
          Participate in tree plantation drives, career bootcamps, and health camps organized by RI8WIN NOBEL PATH FOUNDATION.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${events.length === 0 ? `
          <div class="col-span-2 text-center py-12 text-gray-500">No events currently scheduled. Check back soon!</div>
        ` : events.map(e => `
          <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
            ${e.image_url ? `
              <div class="h-44 w-full overflow-hidden bg-gray-100 border-b border-gray-100">
                <img src="${escapeHtml(e.image_url)}" alt="${escapeHtml(e.title)}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onerror="this.parentElement.style.display='none'"/>
              </div>
            ` : `
              <div class="h-16 w-full bg-gradient-to-r from-emerald-800 to-teal-800 p-3 flex items-end">
                <span class="text-[11px] font-semibold text-sky-100">${escapeHtml(e.category)}</span>
              </div>
            `}
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                    ${escapeHtml(e.category)}
                  </span>
                  <span class="px-2 py-0.5 rounded text-xs font-medium ${e.venue_type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-sky-100 text-sky-800'}">
                    ${escapeHtml(e.venue_type)}
                  </span>
                </div>
                <h3 class="text-lg font-bold text-gray-900">${escapeHtml(e.title)}</h3>
                <p class="text-xs text-gray-600 leading-relaxed">${escapeHtml(e.description)}</p>

                <div class="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700 space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-[#0369a1]">📅 Date:</span> ${escapeHtml(e.event_date)} ${e.event_time ? `• ${escapeHtml(e.event_time)}` : ''}
                  </div>
                  ${e.venue_address ? `
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-[#0369a1]">📍 Venue:</span> ${escapeHtml(e.venue_address)}
                    </div>
                  ` : ''}
                  <div class="flex items-center gap-2 text-stone-500">
                    <span>Registered: <strong>${e.registered_count || 0}</strong> / ${e.capacity} seats</span>
                  </div>
                </div>
              </div>

              <div class="pt-2">
                <button onclick="openRSVPModal(${e.id}, '${escapeHtml(e.title)}')" class="w-full py-2.5 px-4 rounded-lg bg-[#0369a1] hover:bg-sky-800 text-white font-semibold text-xs transition shadow-sm">
                  Register to Attend & Participate &rarr;
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}


// 6. VOLUNTEER REGISTRATION PAGE (Part 5A)
async function renderVolunteerRegister(container) {
  await ensureSettingsLoaded();
  const s = AppState.settings || {};

  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-[#0369a1] via-[#245842] to-[#0d9488] p-8 text-white space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold backdrop-blur-sm">
            OFFICIAL VOLUNTEER ENROLLMENT
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ${escapeHtml(s.volunteer_reg_title || ('Become a Volunteer — Join ' + (s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')))}
          </h1>
          <p class="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
            ${escapeHtml(s.volunteer_reg_subtitle || 'Contribute to education, health awareness, environmental protection, and community welfare. Applications undergo verification by authorized NGO officers prior to formal membership approval and certificate issuance.')}
          </p>
        </div>

        <!-- Registration Form -->
        <form id="volunteer-registration-form" onsubmit="handleVolunteerFormSubmit(event)" class="p-6 sm:p-8 space-y-8">
          
          <!-- SECTION 1: Personal Information -->
          <div class="space-y-4">
            <h2 class="text-base font-bold text-[#0369a1] border-b border-gray-200 pb-2 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#0369a1] text-white flex items-center justify-center text-xs">1</span>
              Personal Information
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name <span class="text-red-500">*</span></label>
                <input type="text" name="full_name" required placeholder="e.g. Rahul Sharma" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Date of Birth <span class="text-red-500">*</span></label>
                <input type="date" name="dob" id="reg-dob" required onchange="handleDobChange(this)" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Gender (Optional)</label>
                <select name="gender" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none">
                  <option value="">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Email Address <span class="text-red-500">*</span></label>
                <input type="email" name="email" required placeholder="name@example.com" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Mobile Number <span class="text-red-500">*</span></label>
                <input type="tel" name="mobile" required placeholder="10-digit mobile number" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">City / Town <span class="text-red-500">*</span></label>
                <input type="text" name="city" required placeholder="e.g. Navi Mumbai / Chandrapur" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">State <span class="text-red-500">*</span></label>
                <input type="text" name="state" required placeholder="e.g. Maharashtra" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Residential Address (Optional)</label>
                <input type="text" name="address" placeholder="Street / locality" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-gray-700 mb-1">Profile Photograph (Optional, max 5MB)</label>
                <input type="file" name="profile_photo" accept="image/*" class="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
              </div>
            </div>

            <!-- Dynamic Guardian Consent Box for Minors (<18) -->
            <div id="minor-guardian-box" class="hidden p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
              <div class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>⚠️</span> Guardian Consent (Applicant is under 18 years of age)
              </div>
              <p class="text-xs text-amber-800">
                In compliance with child safeguarding regulations, volunteer applicants under 18 must have parental or legal guardian consent and will participate exclusively in age-appropriate educational activities.
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Parent / Guardian Full Name <span class="text-red-500">*</span></label>
                  <input type="text" name="guardian_name" id="guardian_name" placeholder="Guardian name" class="w-full text-xs p-2 rounded border border-amber-300 bg-white"/>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Guardian Contact Number <span class="text-red-500">*</span></label>
                  <input type="tel" name="guardian_contact" id="guardian_contact" placeholder="Guardian mobile" class="w-full text-xs p-2 rounded border border-amber-300 bg-white"/>
                </div>
              </div>
              <label class="flex items-start gap-2 pt-1 text-xs text-amber-950 font-medium cursor-pointer">
                <input type="checkbox" name="guardian_consent" id="guardian_consent" value="1" class="rounded text-sky-600 mt-0.5"/>
                <span>I confirm that my parent or legal guardian has reviewed and consented to my participation as a junior volunteer.</span>
              </label>
            </div>
          </div>

          <!-- SECTION 2: Education and Profession -->
          <div class="space-y-4">
            <h2 class="text-base font-bold text-[#0369a1] border-b border-gray-200 pb-2 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#0369a1] text-white flex items-center justify-center text-xs">2</span>
              Education and Profession
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Educational Qualification <span class="text-red-500">*</span></label>
                <input type="text" name="qualification" required placeholder="e.g. B.Tech / MA / B.Com / Higher Secondary" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Institution or University</label>
                <input type="text" name="institution" placeholder="e.g. Mumbai University / College name" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Current Occupation <span class="text-red-500">*</span></label>
                <input type="text" name="occupation" required placeholder="e.g. Student / Teacher / Engineer / Self-employed" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Skills & Key Competencies</label>
                <input type="text" name="skills" placeholder="e.g. Teaching, counseling, tree planting, social media" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-gray-700 mb-1">Relevant Prior Experience (Volunteering / Community Service)</label>
                <textarea name="experience" rows="2" placeholder="Briefly describe any past experience in social work, teaching, or environmental drives (if any)" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"></textarea>
              </div>
            </div>
          </div>

          <!-- SECTION 3: Volunteer Interests (15 Multi-select items) -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-[#0369a1] text-white flex items-center justify-center text-xs">3</span>
                Volunteer Interests <span class="text-red-500">*</span>
              </h2>
              <span class="text-xs text-gray-500 font-normal">Select all that apply</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-gray-800" id="interests-checkboxes">
              ${[
                'Education and career guidance',
                'Student mentoring',
                'Skill development',
                'Health awareness',
                'Women empowerment',
                'Farmer support and sustainable agriculture',
                'Environmental sustainability',
                'Waste management and recycling',
                'Community welfare',
                'Sports and physical education',
                'Animal welfare',
                'Elderly care',
                'Event management',
                'Digital and technical support',
                'Disaster relief and community outreach'
              ].map(interest => `
                <label class="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-sky-400 bg-stone-50/50 hover:bg-sky-50/30 transition cursor-pointer">
                  <input type="checkbox" name="interests" value="${interest}" class="rounded text-sky-600 focus:ring-sky-500"/>
                  <span class="leading-tight">${interest}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- SECTION 4: Availability & Preferences -->
          <div class="space-y-4">
            <h2 class="text-base font-bold text-[#0369a1] border-b border-gray-200 pb-2 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#0369a1] text-white flex items-center justify-center text-xs">4</span>
              Availability & Motivation
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Volunteering Mode <span class="text-red-500">*</span></label>
                <select name="availability_mode" required class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none">
                  <option value="both">Both Online and Offline</option>
                  <option value="offline">Offline Only (On-ground drives)</option>
                  <option value="online">Online / Remote Only</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Preferred Days & Timings</label>
                <input type="text" name="preferred_days_times" placeholder="e.g. Weekends (Sat/Sun 10am-2pm)" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Preferred Location</label>
                <input type="text" name="preferred_location" placeholder="e.g. Navi Mumbai / Chandrapur / Remote" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
              </div>

              <div class="sm:col-span-3">
                <label class="block text-xs font-semibold text-gray-700 mb-1">Brief Motivation Statement</label>
                <textarea name="motivation" rows="2" placeholder="Why would you like to volunteer with RI8WIN NOBEL PATH FOUNDATION?" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"></textarea>
              </div>
            </div>
          </div>

          <!-- SECTION 5: Account Access & Portal Password (Optional) -->
          <div class="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-3">
            <div class="text-xs font-bold text-sky-900">Set a Password for Your Volunteer Dashboard (Optional)</div>
            <p class="text-xs text-sky-800">
              Creating a password now allows you to sign in to your Volunteer Dashboard immediately to track application status, RSVP for events, and download your official certificate upon approval.
            </p>
            <div class="max-w-xs">
              <label class="block text-xs font-semibold text-gray-700 mb-1">Password (min 6 characters)</label>
              <input type="password" name="account_password" placeholder="Create a secure password" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
            </div>
          </div>

          <!-- SECTION 6: Declarations and Consent -->
          <div class="space-y-3 pt-2">
            <h2 class="text-base font-bold text-[#0369a1] border-b border-gray-200 pb-2 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#0369a1] text-white flex items-center justify-center text-xs">5</span>
              Declaration & Statutory Consent
            </h2>

            <div class="space-y-2 text-xs text-gray-700">
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" name="declaration_accurate" value="1" required class="rounded text-sky-600 mt-0.5"/>
                <span>I solemnly declare that all information provided in this registration form is accurate, complete, and true to the best of my knowledge. <span class="text-red-500">*</span></span>
              </label>

              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" name="declaration_guidelines" value="1" required class="rounded text-sky-600 mt-0.5"/>
                <span>I agree to abide by the non-profit code of conduct, volunteer guidelines, and ethical standards of RI8WIN NOBEL PATH FOUNDATION. <span class="text-red-500">*</span></span>
              </label>

              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" name="declaration_consent" value="1" required class="rounded text-sky-600 mt-0.5"/>
                <span>I consent to the lawful processing of my contact and volunteer records for NGO administration, verification, and program coordination. <span class="text-red-500">*</span></span>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-gray-500">
              Note: Formal Volunteer Certificates are generated only after administrative review and formal approval.
            </div>
            <button type="submit" id="submit-btn" class="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#0369a1] hover:bg-sky-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2">
              Submit Volunteer Application &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleDobChange(input) {
  const minorBox = document.getElementById('minor-guardian-box');
  const gName = document.getElementById('guardian_name');
  const gContact = document.getElementById('guardian_contact');
  const gConsent = document.getElementById('guardian_consent');

  if (!input.value) return;

  const dob = new Date(input.value);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;

  if (age < 18) {
    minorBox.classList.remove('hidden');
    gName.setAttribute('required', 'true');
    gContact.setAttribute('required', 'true');
    gConsent.setAttribute('required', 'true');
  } else {
    minorBox.classList.add('hidden');
    gName.removeAttribute('required');
    gContact.removeAttribute('required');
    gConsent.removeAttribute('required');
  }
}

async function handleVolunteerFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById('submit-btn');

  // Collect checked interests
  const checkedInterests = Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(el => el.value);
  if (checkedInterests.length === 0) {
    showToast('Please select at least one area of volunteer interest.', 'warning');
    return;
  }

  const formData = new FormData(form);
  // Replace interests with JSON string
  formData.delete('interests');
  formData.append('interests', JSON.stringify(checkedInterests));

  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Submitting Application...';

  try {
    const res = await API.submitVolunteerApplication(formData);
    if (res.success) {
      showToast('Application submitted successfully!', 'success');
      // Show confirmation view
      const main = document.getElementById('main-content');
      main.innerHTML = `
        <div class="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
          <div class="w-16 h-16 rounded-full bg-sky-100 text-sky-800 mx-auto flex items-center justify-center text-3xl font-bold">
            ✓
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0369a1]">
            Application Successfully Submitted!
          </h1>
          <div class="p-6 rounded-2xl bg-white border border-gray-200 shadow-md space-y-4 text-left">
            <div class="flex items-center justify-between border-b pb-3">
              <span class="text-xs text-gray-500 font-medium">Application Reference</span>
              <span class="text-base font-mono font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded border border-sky-200">
                ${res.application_ref}
              </span>
            </div>
            <div class="flex items-center justify-between border-b pb-3">
              <span class="text-xs text-gray-500 font-medium">Initial Status</span>
              <span class="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-900">
                ${res.status}
              </span>
            </div>
            <p class="text-xs text-gray-600 leading-relaxed">
              ${res.note}
            </p>
          </div>
          <div class="flex flex-wrap justify-center gap-4">
            <button onclick="openAuthModal('track', '${res.application_ref}')" class="px-6 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow transition">
              Track Application Status
            </button>
            <a href="#home" class="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition">
              Return to Home
            </a>
          </div>
        </div>
      `;
    }
  } catch (err) {
    showToast(err.message || 'Failed to submit application.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Submit Volunteer Application &rarr;';
  }
}

// 7. PUBLIC CERTIFICATE VERIFICATION (Part 6)
async function renderVerify(container) {
  await ensureSettingsLoaded();
  const s = AppState.settings || {};
  const initialCertNum = AppState.routeParams.certNumber || '';

  container.innerHTML = `
    <div class="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
          OFFICIAL REGISTRY VERIFICATION
        </div>
        <h1 class="text-3xl font-extrabold text-[#0369a1]">
          ${escapeHtml(s.verify_page_title || 'Verify Volunteer Certificate')}
        </h1>
        <p class="text-gray-600 text-sm max-w-xl mx-auto">
          ${escapeHtml(s.verify_page_subtitle || ('Scan the QR code or enter the Certificate Number to verify authentic issuance by ' + (s.org_name || 'RI8WIN NOBEL PATH FOUNDATION') + '.'))}
        </p>
      </div>

      <!-- Verification Input Box -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-md space-y-4">
        <form onsubmit="handleCertVerifySubmit(event)" class="flex flex-col sm:flex-row gap-3">
          <input type="text" id="cert-search-input" value="${escapeHtml(initialCertNum)}" placeholder="e.g. CERT-RI8V-2026-00001" required class="flex-1 text-sm font-mono p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none uppercase"/>
          <button type="submit" id="verify-submit-btn" class="px-6 py-3 rounded-lg bg-[#0369a1] hover:bg-sky-800 text-white font-bold text-sm shadow transition">
            Verify Certificate &rarr;
          </button>
        </form>
        <p class="text-xs text-gray-500">
          ${escapeHtml(s.verify_page_note || 'Note: This public verification service verifies certificate validity against live database records while safeguarding private contact info.')}
        </p>
      </div>

      <!-- Result Container -->
      <div id="cert-result-container" class="space-y-4"></div>
    </div>
  `;

  if (initialCertNum) {
    performCertVerification(initialCertNum);
  }
}

function handleCertVerifySubmit(e) {
  e.preventDefault();
  const input = document.getElementById('cert-search-input');
  if (!input || !input.value.trim()) return;
  const num = input.value.trim();
  performCertVerification(num);
}

async function performCertVerification(certNumber) {
  const container = document.getElementById('cert-result-container');
  const btn = document.getElementById('verify-submit-btn');
  if (!container) return;

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Checking Records...';
  }

  container.innerHTML = `
    <div class="text-center py-8 text-gray-500 text-xs">
      Querying official Foundation Certificate Registry...
    </div>
  `;

  try {
    const res = await API.verifyCertificate(certNumber);
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Verify Certificate →';
    }

    if (res.status === 'VALID') {
      const c = res.certificate;
      container.innerHTML = `
        <div class="bg-sky-50 rounded-2xl border-2 border-sky-500 p-6 sm:p-8 shadow-lg space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-sky-200 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center text-2xl font-bold shadow">
                ✓
              </div>
              <div>
                <span class="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-200 text-sky-950 uppercase tracking-wider">
                  OFFICIALLY VERIFIED & ACTIVE
                </span>
                <h3 class="text-lg font-bold text-sky-950 mt-0.5">Certificate of Volunteer Membership</h3>
              </div>
            </div>
            <a href="${API.getCertificateDownloadUrl(c.certificate_number)}" target="_blank" class="px-4 py-2 rounded-lg bg-[#0369a1] hover:bg-sky-900 text-white text-xs font-semibold shadow transition flex items-center gap-1.5">
              <span>📥</span> Download PDF Certificate
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-3 bg-white rounded-lg border border-sky-200">
              <div class="text-gray-500 font-medium">Volunteer Member Name</div>
              <div class="text-sm font-bold text-gray-950 mt-0.5">${c.volunteer_name}</div>
            </div>

            <div class="p-3 bg-white rounded-lg border border-sky-200">
              <div class="text-gray-500 font-medium">Membership ID</div>
              <div class="text-sm font-bold font-mono text-sky-800 mt-0.5">${c.membership_id}</div>
            </div>

            <div class="p-3 bg-white rounded-lg border border-sky-200">
              <div class="text-gray-500 font-medium">Certificate Number</div>
              <div class="text-sm font-mono text-gray-900 mt-0.5">${c.certificate_number}</div>
            </div>

            <div class="p-3 bg-white rounded-lg border border-sky-200">
              <div class="text-gray-500 font-medium">Date of Issuance</div>
              <div class="text-sm text-gray-900 mt-0.5">${c.issue_date}</div>
            </div>

            <div class="p-3 bg-white rounded-lg border border-sky-200 sm:col-span-2">
              <div class="text-gray-500 font-medium">Issuing Organization & Authority</div>
              <div class="text-xs font-semibold text-sky-900 mt-0.5">${c.organization_name}</div>
              <div class="text-xs text-gray-600">${c.legal_identity}</div>
              <div class="text-xs text-gray-500 mt-1">Authorized Signatory: <strong>${c.authorized_signatory}</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (res.status === 'REVOKED') {
      const c = res.certificate;
      container.innerHTML = `
        <div class="bg-rose-50 rounded-2xl border-2 border-rose-500 p-6 sm:p-8 shadow-lg space-y-4">
          <div class="flex items-center gap-3 border-b border-rose-200 pb-4">
            <div class="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center text-2xl font-bold shadow">
              ✕
            </div>
            <div>
              <span class="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-rose-200 text-rose-950 uppercase tracking-wider">
                CERTIFICATE REVOKED / INVALID
              </span>
              <h3 class="text-lg font-bold text-rose-950 mt-0.5">This Certificate Is No Longer Valid</h3>
            </div>
          </div>

          <div class="text-xs space-y-2 text-rose-900 leading-relaxed">
            <p>
              Certificate Number <strong>${c.certificate_number}</strong> issued to <strong>${c.volunteer_name}</strong> was formally revoked on <strong>${c.revocation_date || 'Date recorded'}</strong>.
            </p>
            <div class="p-3 bg-white rounded border border-rose-300 text-rose-950">
              <strong>Recorded Revocation Reason:</strong> ${c.revocation_reason || 'Administrative action'}
            </div>
            <p class="text-rose-700">
              This certificate does not confer volunteer membership privileges or official affiliation with RI8WIN NOBEL PATH FOUNDATION.
            </p>
          </div>
        </div>
      `;
    }
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Verify Certificate →';
    }
    container.innerHTML = `
      <div class="bg-amber-50 rounded-2xl border border-amber-300 p-6 text-center space-y-3">
        <div class="w-10 h-10 rounded-full bg-amber-200 text-amber-900 mx-auto flex items-center justify-center font-bold text-lg">
          !
        </div>
        <h4 class="font-bold text-amber-950 text-base">Record Not Found</h4>
        <p class="text-xs text-amber-800 max-w-md mx-auto">
          The certificate number entered could not be found in the official registry of RI8WIN NOBEL PATH FOUNDATION. Please re-check the certificate number or contact the Foundation office.
        </p>
      </div>
    `;
  }
}


// 8. TRANSPARENCY & STATUTORY DISCLOSURES PAGE (100% Dynamic & Configurable)
async function renderTransparency(container) {
  await ensureSettingsLoaded(true);
  const s = AppState.settings || {};

  container.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div class="text-center space-y-3 border-b border-gray-200 pb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
          STATUTORY & REGULATORY COMPLIANCE
        </div>
        <h1 class="text-3xl font-extrabold text-[#0369a1]">
          Transparency & Legal Disclosures
        </h1>
        <p class="text-gray-600 text-sm max-w-2xl mx-auto">
          Public disclosures in adherence with the Companies Act, 2013, Ministry of Corporate Affairs, and statutory transparency standards.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Certificate of Incorporation Details -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
            <span>🏛️</span> Certificate of Incorporation
          </h2>
          <div class="space-y-2.5 text-xs text-gray-700">
            ${(s.show_cin !== false && s.cin) ? `
              <div class="flex justify-between border-b pb-1.5">
                <span class="text-gray-500">Corporate Identity Number (CIN)</span>
                <strong class="font-mono text-sky-900">${escapeHtml(s.cin)}</strong>
              </div>
            ` : ''}
            ${(s.show_date_of_incorporation !== false && s.date_of_incorporation) ? `
              <div class="flex justify-between border-b pb-1.5">
                <span class="text-gray-500">Date of Incorporation</span>
                <strong>${escapeHtml(s.date_of_incorporation)}</strong>
              </div>
            ` : ''}
            ${(s.show_approving_authority !== false && s.approving_authority) ? `
              <div class="flex justify-between border-b pb-1.5">
                <span class="text-gray-500">Registration Authority</span>
                <span>${escapeHtml(s.approving_authority)}</span>
              </div>
            ` : ''}
            ${(s.show_legal_structure !== false && s.legal_structure) ? `
              <div class="flex justify-between border-b pb-1.5">
                <span class="text-gray-500">Legal Constitution</span>
                <span>${escapeHtml(s.legal_structure)}</span>
              </div>
            ` : ''}
            ${(s.show_pan !== false && s.pan) ? `
              <div class="flex justify-between border-b pb-1.5">
                <span class="text-gray-500">Permanent Account Number (PAN)</span>
                <strong class="font-mono">${escapeHtml(s.pan)}</strong>
              </div>
            ` : ''}
            ${(s.show_tan !== false && s.tan) ? `
              <div class="flex justify-between">
                <span class="text-gray-500">Tax Deduction Account (TAN)</span>
                <strong class="font-mono">${escapeHtml(s.tan)}</strong>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Registered Office & Contact Details -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
            <span>📍</span> Registered Office & Contact
          </h2>
          <div class="space-y-2.5 text-xs text-gray-700">
            ${(s.show_registered_office !== false && s.registered_office) ? `
              <p>
                <strong>Official Registered Address:</strong><br/>
                ${escapeHtml(s.registered_office)}
              </p>
            ` : ''}
            ${(s.show_official_email !== false && s.official_email) ? `
              <p>
                <strong>Official Email:</strong><br/>
                <a href="mailto:${escapeHtml(s.official_email)}" class="text-sky-700 font-mono hover:underline">${escapeHtml(s.official_email)}</a>
              </p>
            ` : ''}
            ${(s.show_official_phone !== false && s.official_phone) ? `
              <p>
                <strong>Official Contact Number:</strong><br/>
                <span class="font-mono">${escapeHtml(s.official_phone)}</span>
              </p>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Financial Governance Statement -->
      ${(s.show_funds_utilization !== false && s.funds_utilization) ? `
        <div class="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs sm:text-sm text-stone-800">
          <h3 class="font-bold text-[#0369a1] text-base flex items-center gap-2">
            <span>📑</span> Financial Governance & Statutory Principles
          </h3>
          <p class="leading-relaxed">
            <strong>${escapeHtml(s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')}</strong> adheres strictly to Section 8 non-profit principles. In accordance with statutory rules:
          </p>
          <ul class="list-disc list-inside space-y-1.5 pl-2 text-xs text-stone-700">
            <li>${escapeHtml(s.funds_utilization)}</li>
            <li>No profits or dividends shall be distributed to members or directors.</li>
            <li>Accounts and balance sheets are maintained under Indian Accounting Standards and audited annually by independent statutory Chartered Accountants.</li>
            <li>Annual General Meeting (AGM) reports and statutory financial filings are submitted in accordance with MCA guidelines.</li>
            <li>In line with statutory transparency, no unverified or speculative financial figures are published.</li>
          </ul>
        </div>
      ` : ''}

      <!-- Statutory Policy & Code Documents Section -->
      ${s.transparency_additional_disclosures ? `
        <div class="p-6 rounded-2xl bg-white border border-sky-200 shadow-sm space-y-3 text-xs sm:text-sm text-stone-800">
          <h3 class="font-bold text-[#0369a1] text-base flex items-center gap-2">
            <span>🏛️</span> Additional Statutory & Compliance Notes
          </h3>
          <p class="leading-relaxed text-xs text-stone-700 whitespace-pre-line">
            ${escapeHtml(s.transparency_additional_disclosures)}
          </p>
        </div>
      ` : ''}

      <!-- Statutory Policy & Code Documents Section -->
      <div class="space-y-4 pt-4 border-t border-gray-200">
        <div class="text-center space-y-1">
          <h3 class="font-bold text-lg text-[#0369a1]">Statutory Codes, Policies & Guidelines</h3>
          <p class="text-xs text-gray-500">Official governing standards maintained under Indian non-profit regulations</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <a href="#volunteer-guidelines" class="p-4 rounded-xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition space-y-2 group block">
            <div class="text-2xl">📋</div>
            <div class="font-bold text-sky-950 group-hover:text-sky-700">Volunteer Guidelines</div>
            <p class="text-gray-500 text-[11px] leading-relaxed">Code of conduct, safeguarding policies, and honorary non-remuneration terms.</p>
            <span class="text-sky-700 font-bold inline-flex items-center gap-1 text-[11px]">Read Full Policy &rarr;</span>
          </a>

          <a href="#privacy-policy" class="p-4 rounded-xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition space-y-2 group block">
            <div class="text-2xl">🔒</div>
            <div class="font-bold text-sky-950 group-hover:text-sky-700">Privacy Policy (DPDP Act)</div>
            <p class="text-gray-500 text-[11px] leading-relaxed">Personal data protection, verification portal rules, and zero commercial sale guarantees.</p>
            <span class="text-sky-700 font-bold inline-flex items-center gap-1 text-[11px]">Read Full Policy &rarr;</span>
          </a>

          <a href="#terms-of-use" class="p-4 rounded-xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition space-y-2 group block">
            <div class="text-2xl">⚖️</div>
            <div class="font-bold text-sky-950 group-hover:text-sky-700">Terms of Use</div>
            <p class="text-gray-500 text-[11px] leading-relaxed">Intellectual property protection, certificate anti-fraud warnings, and jurisdiction.</p>
            <span class="text-sky-700 font-bold inline-flex items-center gap-1 text-[11px]">Read Full Policy &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  `;
}



// 9. CONTACT US PAGE (100% Dynamic & Configurable)
async function renderContact(container) {
  await ensureSettingsLoaded(true);
  const s = AppState.settings || {};

  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
          GET IN TOUCH
        </div>
        <h1 class="text-3xl font-extrabold text-[#0369a1]">${escapeHtml(s.contact_page_heading || ('Contact ' + (s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')))}</h1>
        <p class="text-gray-600 text-sm max-w-xl mx-auto">
          ${escapeHtml(s.contact_page_subheading || 'Reach out for volunteer partnerships, community collaborations, or general inquiries.')}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Contact Info -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div class="space-y-4 text-xs sm:text-sm text-gray-700">
            ${(s.show_registered_office !== false && s.registered_office) ? `
              <div>
                <div class="font-bold text-[#0369a1] mb-1">Registered Office</div>
                <p class="text-xs text-gray-600">${escapeHtml(s.registered_office)}</p>
              </div>
            ` : ''}
            ${(s.show_official_email !== false && s.official_email) ? `
              <div>
                <div class="font-bold text-[#0369a1] mb-1">Official Email</div>
                <p class="text-xs text-sky-700 font-mono">${escapeHtml(s.official_email)}</p>
              </div>
            ` : ''}
            ${(s.show_official_phone !== false && s.official_phone) ? `
              <div>
                <div class="font-bold text-[#0369a1] mb-1">Helpline & Phone</div>
                <p class="text-xs font-mono text-gray-800">${escapeHtml(s.official_phone)}</p>
              </div>
            ` : ''}
            ${s.contact_office_hours ? `
              <div>
                <div class="font-bold text-[#0369a1] mb-1">Office Hours</div>
                <p class="text-xs text-gray-600">${escapeHtml(s.contact_office_hours)}</p>
              </div>
            ` : ''}
            ${s.contact_inquiry_instructions ? `
              <div class="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900">
                <strong>Inquiry Notice:</strong> ${escapeHtml(s.contact_inquiry_instructions)}
              </div>
            ` : ''}
            ${(s.show_legal_structure !== false && s.legal_structure) ? `
              <div>
                <div class="font-bold text-[#0369a1] mb-1">Legal Status</div>
                <p class="text-xs text-gray-600">${escapeHtml(s.legal_structure)} ${s.cin ? `(CIN: ${escapeHtml(s.cin)})` : ''}</p>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Contact Form -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <form onsubmit="handleContactSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
              <input type="text" name="name" required placeholder="Full Name" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Your Email</label>
              <input type="email" name="email" required placeholder="Email Address" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
              <input type="text" name="subject" required placeholder="Subject of inquiry" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Message</label>
              <textarea name="message" rows="3" required placeholder="How can we assist you or collaborate?" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600 focus:outline-none"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 rounded-lg bg-[#0369a1] hover:bg-sky-800 text-white font-bold text-xs shadow transition">
              Send Message &rarr;
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}


function handleContactSubmit(e) {
  e.preventDefault();
  showToast('Thank you! Your message has been received by our office.', 'success');
  e.target.reset();
}

// 10. VOLUNTEER DASHBOARD (Part 7)
async function renderVolunteerDashboard(container) {
  if (!AppState.currentUser) {
    container.innerHTML = `
      <div class="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div class="w-12 h-12 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center mx-auto text-xl font-bold">🔒</div>
        <h2 class="text-xl font-bold text-gray-900">Volunteer Sign In Required</h2>
        <p class="text-xs text-gray-600">Please sign in to access your volunteer membership profile, events, and downloadable certificate.</p>
        <button onclick="openAuthModal('login')" class="px-6 py-2.5 rounded-lg bg-[#0369a1] text-white font-bold text-xs">
          Sign In Now
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `<div class="text-center py-16 text-gray-500 text-xs">Loading volunteer records...</div>`;

  try {
    const res = await API.getMyProfile();
    const eventRes = await API.getMyEvents();

    if (!res.has_application) {
      container.innerHTML = `
        <div class="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <h2 class="text-xl font-bold text-[#0369a1]">No Volunteer Application Found</h2>
          <p class="text-xs text-gray-600">You do not have an active volunteer registration linked to this account yet.</p>
          <a href="#volunteer-register" class="inline-block px-6 py-2.5 rounded-lg bg-[#0369a1] text-white font-bold text-xs">
            Complete Volunteer Application &rarr;
          </a>
        </div>
      `;
      return;
    }

    const app = res.application;
    const isApproved = app.status === 'Approved';
    const isIssued = app.certificate_status === 'Issued';

    container.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <!-- Dashboard Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div class="text-xs font-bold text-sky-700 uppercase tracking-wider">MEMBER PORTAL</div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0369a1]">
              Welcome, ${app.full_name}
            </h1>
            <p class="text-xs text-gray-500">Application Reference: <strong class="font-mono text-gray-800">${app.application_ref}</strong></p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 rounded-full text-xs font-bold ${
              isApproved ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }">
              Status: ${app.status}
            </span>
          </div>
        </div>

        <!-- Membership Card & Status Block -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left: Digital Membership Card -->
          <div class="lg:col-span-6">
            <div class="membership-card-preview rounded-2xl p-6 sm:p-8 text-white space-y-6">
              <div class="flex items-center justify-between border-b border-white/20 pb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-lg text-white">
                    R8
                  </div>
                  <div>
                    <h3 class="font-bold text-sm tracking-wide">RI8WIN NOBEL PATH FOUNDATION</h3>
                    <p class="text-[10px] text-sky-300">Volunteer Membership Card</p>
                  </div>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-300 border border-amber-400/40">
                  SECTION 8
                </span>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-xl bg-sky-950/80 border border-white/20 flex items-center justify-center text-xl font-bold text-amber-300 overflow-hidden">
                  ${app.photo_url ? `<img src="${app.photo_url}" class="w-full h-full object-cover"/>` : app.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div class="space-y-0.5">
                  <div class="text-lg font-bold">${app.full_name}</div>
                  <div class="text-xs text-sky-200">${app.occupation}</div>
                  <div class="text-xs text-gray-300">${app.city}, ${app.state}</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-white/10">
                <div>
                  <div class="text-[10px] uppercase text-gray-400">Membership ID</div>
                  <div class="font-mono font-bold text-amber-300 mt-0.5">
                    ${app.membership_id || 'Pending Formal Approval'}
                  </div>
                </div>
                <div>
                  <div class="text-[10px] uppercase text-gray-400">Approval Date</div>
                  <div class="text-white mt-0.5">${app.approval_date ? app.approval_date.slice(0, 10) : 'Under Review'}</div>
                </div>
              </div>
            </div>

            <!-- Certificate Download Callout -->
            <div class="mt-4 p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-4">
              <div>
                <h4 class="font-bold text-sm text-[#0369a1]">Official Membership Certificate</h4>
                <p class="text-xs text-gray-500">
                  ${isApproved && isIssued ? 'Your official certificate is verified and ready for download.' : 'Certificate unlocks once your application is formally approved.'}
                </p>
              </div>
              ${isApproved && isIssued && app.certificate ? `
                <a href="${API.getCertificateDownloadUrl(app.certificate.certificate_number)}" target="_blank" class="px-4 py-2.5 rounded-lg bg-[#0369a1] hover:bg-sky-800 text-white font-bold text-xs shadow transition shrink-0 flex items-center gap-1.5">
                  <span>📥</span> Download PDF
                </a>
              ` : `
                <button disabled class="px-4 py-2.5 rounded-lg bg-gray-200 text-gray-400 font-semibold text-xs cursor-not-allowed shrink-0">
                  Pending Approval
                </button>
              `}
            </div>
          </div>

          <!-- Right: Application Progress & Profile Details -->
          <div class="lg:col-span-6 space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h3 class="font-bold text-sm text-[#0369a1] border-b pb-2">Verification Progress</h3>
              
              <!-- Stepper -->
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                  <div class="text-xs">
                    <strong class="text-gray-900">Application Submitted</strong>
                    <div class="text-gray-500 text-[10px]">${app.created_at}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded-full ${app.status !== 'Submitted' ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center text-xs font-bold">
                    ${app.status !== 'Submitted' ? '✓' : '2'}
                  </div>
                  <div class="text-xs">
                    <strong class="text-gray-900">NGO Officer Verification</strong>
                    <div class="text-gray-500 text-[10px]">${app.verification_remarks || 'Identity & safeguarding check in progress'}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded-full ${isApproved ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center text-xs font-bold">
                    ${isApproved ? '✓' : '3'}
                  </div>
                  <div class="text-xs">
                    <strong class="text-gray-900">Formal Approval & Certificate Issued</strong>
                    <div class="text-gray-500 text-[10px]">${isApproved ? `Approved by ${app.approving_officer || 'NGO Board'}` : 'Awaiting formal board resolution'}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Registered Interests -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-3">
              <h3 class="font-bold text-sm text-[#0369a1] border-b pb-2">Your Volunteer Profile</h3>
              <div class="text-xs space-y-2 text-gray-700">
                <div><strong>Qualification:</strong> ${app.qualification} (${app.institution || 'University'})</div>
                <div><strong>Mode:</strong> ${app.availability_mode.toUpperCase()}</div>
                <div><strong>Location:</strong> ${app.preferred_location || app.city}</div>
                <div>
                  <strong>Interests:</strong>
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    ${(app.interests || []).map(i => `<span class="px-2 py-0.5 rounded text-[11px] bg-sky-50 text-sky-800 border border-sky-200">${i}</span>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Registered Events Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 class="font-bold text-base text-[#0369a1]">My Event Registrations</h3>
          ${eventRes && eventRes.myRegistrations && eventRes.myRegistrations.length > 0 ? `
            <div class="divide-y text-xs">
              ${eventRes.myRegistrations.map(r => `
                <div class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 class="font-bold text-gray-900 text-sm">${r.event_title}</h4>
                    <div class="text-gray-500">📅 ${r.event_date} ${r.event_time ? `• ${r.event_time}` : ''} | 📍 ${r.venue_address || r.venue_type}</div>
                  </div>
                  <span class="px-2.5 py-1 rounded text-xs font-semibold ${r.attended ? 'bg-sky-100 text-sky-800' : 'bg-stone-100 text-stone-700'}">
                    ${r.attended ? 'Attended ✓' : 'Registered / Upcoming'}
                  </span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-xs text-gray-500 py-4">You have not registered for any upcoming events yet. <a href="#events" class="text-sky-700 font-semibold underline">Explore Foundation Events</a></div>
          `}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="text-center py-12 text-rose-500 text-xs">Failed to load volunteer records: ${err.message}</div>`;
  }
}

// 11. NGO ADMINISTRATOR PORTAL (Part 8)
async function renderAdmin(container) {
  if (!AppState.currentUser || !['super_admin', 'ngo_admin', 'volunteer_coordinator', 'program_coordinator'].includes(AppState.currentUser.role)) {
    container.innerHTML = `
      <div class="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl font-bold">🔒</div>
        <h2 class="text-xl font-bold text-gray-900">NGO Administrator Sign In</h2>
        <p class="text-xs text-gray-600">This management portal is restricted to authorized NGO officers, coordinators, and administrators.</p>
        <button onclick="openAuthModal('login')" class="px-6 py-2.5 rounded-lg bg-[#0369a1] text-white font-bold text-xs">
          Sign In with Admin Credentials
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `<div class="text-center py-16 text-gray-500 text-xs">Loading management dashboard...</div>`;

  try {
    const statsRes = await API.getAdminStats();
    const stats = statsRes.stats || {};

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <!-- Top Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <div class="text-xs font-bold text-amber-700 uppercase tracking-wider">MANAGEMENT PORTAL</div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0369a1]">NGO Administration Dashboard</h1>
            <p class="text-xs text-gray-500">Logged in as: <strong>${AppState.currentUser.full_name}</strong> (${AppState.currentUser.role.replace('_', ' ').toUpperCase()})</p>
          </div>
          <div class="flex items-center gap-2">
            <a href="${API.getExportVolunteersUrl()}" class="px-4 py-2 rounded-lg bg-sky-800 hover:bg-sky-700 text-white text-xs font-semibold shadow transition flex items-center gap-1.5">
              <span>📊</span> Export Volunteers (CSV)
            </a>
          </div>
        </div>

        <!-- 8 Metric KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
            <div class="text-xs text-gray-500 font-medium">Total Applications</div>
            <div class="text-2xl font-bold text-[#0369a1] mt-1">${stats.totalApps || 0}</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-amber-300 bg-amber-50/50 shadow-sm text-center">
            <div class="text-xs text-amber-800 font-medium">Pending Review</div>
            <div class="text-2xl font-bold text-amber-900 mt-1">${stats.pendingApps || 0}</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-sky-300 bg-sky-50/50 shadow-sm text-center">
            <div class="text-xs text-sky-800 font-medium">Active Volunteers</div>
            <div class="text-2xl font-bold text-sky-900 mt-1">${stats.activeVolunteers || 0}</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-sky-300 bg-sky-50/50 shadow-sm text-center">
            <div class="text-xs text-sky-800 font-medium">Certificates Issued</div>
            <div class="text-2xl font-bold text-sky-900 mt-1">${stats.certsIssued || 0}</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
            <div class="text-xs text-gray-500 font-medium">Active Programs</div>
            <div class="text-2xl font-bold text-gray-800 mt-1">${stats.totalPrograms || 0}</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
            <div class="text-xs text-gray-500 font-medium">Upcoming Events</div>
            <div class="text-2xl font-bold text-gray-800 mt-1">${stats.upcomingEvents || 0}</div>
          </div>
        </div>

        <!-- Admin Tabs -->
        <div class="flex overflow-x-auto border-b border-gray-200 gap-2 sm:gap-4 text-xs font-bold" id="admin-subtabs">
          <button onclick="switchAdminTab('volunteers')" id="admin-tab-volunteers" class="py-2.5 px-1 border-b-2 border-[#0369a1] text-[#0369a1] whitespace-nowrap">
            Volunteer Applications
          </button>
          <button onclick="switchAdminTab('certificates')" id="admin-tab-certificates" class="py-2.5 px-1 text-gray-500 hover:text-gray-800 whitespace-nowrap">
            📜 Issue Certificates
          </button>
          <button onclick="switchAdminTab('letters')" id="admin-tab-letters" class="py-2.5 px-1 text-gray-500 hover:text-gray-800 whitespace-nowrap">
            ✉️ Official Letters
          </button>
          <button onclick="switchAdminTab('news')" id="admin-tab-news" class="py-2.5 px-1 text-gray-500 hover:text-gray-800 whitespace-nowrap">
            📰 News & Outreach
          </button>
          <button onclick="switchAdminTab('custom_pages')" id="admin-tab-custom_pages" class="py-2.5 px-1 text-gray-500 hover:text-gray-800 whitespace-nowrap">
            🌐 Custom Webpages
          </button>
          <button onclick="switchAdminTab('donations')" id="admin-tab-donations" class="py-2.5 px-1 text-gray-500 hover:text-gray-800 whitespace-nowrap">
            💳 Donations & Payments
          </button>
          <button onclick="switchAdminTab('programs')" id="admin-tab-programs" class="py-2.5 px-1 text-gray-500 hover:text-gray-800 whitespace-nowrap">
            Programs
          </button>
          <button onclick="switchAdminTab('events')" id="admin-tab-events" class="py-2.5 px-1 text-gray-500 hover:text-gray-800 whitespace-nowrap">
            Events
          </button>
          <button onclick="switchAdminTab('settings')" id="admin-tab-settings" class="py-2.5 px-1 text-gray-500 hover:text-gray-800 whitespace-nowrap">
            Site Content & CMS
          </button>
          <button onclick="switchAdminTab('audit')" id="admin-tab-audit" class="py-2.5 px-1 text-gray-500 hover:text-gray-800 whitespace-nowrap">
            Audit Trail
          </button>
        </div>

        <!-- Tab Content Areas -->
        <div id="admin-tab-content">
          <!-- Default: Volunteers tab -->
        </div>
      </div>
    `;

    // Load initial volunteers table
    await loadAdminVolunteersTab();

  } catch (err) {
    container.innerHTML = `<div class="text-center py-12 text-rose-500 text-xs">Failed to load admin stats: ${err.message}</div>`;
  }
}

async function switchAdminTab(tab) {
  document.querySelectorAll('#admin-subtabs button').forEach(b => {
    b.className = 'py-2.5 px-1 text-gray-500 hover:text-gray-800 font-bold text-xs whitespace-nowrap';
  });
  const activeBtn = document.getElementById(`admin-tab-${tab}`);
  if (activeBtn) {
    activeBtn.className = 'py-2.5 px-1 border-b-2 border-[#0369a1] text-[#0369a1] font-bold text-xs whitespace-nowrap';
  }

  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  if (tab === 'volunteers') await loadAdminVolunteersTab();
  else if (tab === 'certificates') await loadAdminCertificatesTab();
  else if (tab === 'letters') await loadAdminLettersTab();
  else if (tab === 'news') await loadAdminNewsTab();
  else if (tab === 'custom_pages') await loadAdminPagesTab();
  else if (tab === 'donations') await loadAdminDonationsTab();
  else if (tab === 'programs') await loadAdminProgramsTab();
  else if (tab === 'events') await loadAdminEventsTab();
  else if (tab === 'settings') await loadAdminSettingsTab();
  else if (tab === 'audit') await loadAdminAuditTab();
}

// Admin Volunteers Tab
async function loadAdminVolunteersTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  content.innerHTML = `
    <div class="space-y-4">
      <!-- Search & Status Filter -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div class="flex-1 w-full sm:w-auto">
          <input type="text" id="admin-vol-search" placeholder="Search applicant by name, email, mobile, ref..." onkeyup="if(event.key==='Enter') filterAdminVolunteers()" class="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <select id="admin-vol-status-filter" onchange="filterAdminVolunteers()" class="text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none">
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Additional Information Required">Additional Info Required</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button onclick="filterAdminVolunteers()" class="px-4 py-2.5 rounded-lg bg-[#0369a1] text-white text-xs font-semibold">
            Filter
          </button>
        </div>
      </div>

      <!-- Volunteers Table -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-700">
            <thead class="bg-stone-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th class="p-3 font-semibold">Application Ref</th>
                <th class="p-3 font-semibold">Applicant Name</th>
                <th class="p-3 font-semibold">Contact</th>
                <th class="p-3 font-semibold">Location</th>
                <th class="p-3 font-semibold">Status</th>
                <th class="p-3 font-semibold">Membership ID</th>
                <th class="p-3 font-semibold">Certificate</th>
                <th class="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="admin-volunteers-table-body" class="divide-y divide-gray-200">
              <tr><td colspan="8" class="text-center py-6 text-gray-400">Loading applications...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  await fetchAndPopulateVolunteers();
}

async function fetchAndPopulateVolunteers() {
  const search = document.getElementById('admin-vol-search')?.value || '';
  const status = document.getElementById('admin-vol-status-filter')?.value || 'All';
  const tbody = document.getElementById('admin-volunteers-table-body');
  if (!tbody) return;

  try {
    const res = await API.getVolunteers(status, search);
    const apps = res.applications || [];

    if (apps.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-gray-500">No applications found.</td></tr>`;
      return;
    }

    tbody.innerHTML = apps.map(a => {
      const isApproved = a.status === 'Approved';
      const isIssued = a.certificate_status === 'Issued';
      const isRevoked = a.certificate_status === 'Revoked';

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 font-mono font-medium text-gray-900">${a.application_ref}</td>
          <td class="p-3 font-medium text-gray-900">
            ${a.full_name}
            ${a.is_minor ? '<span class="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Minor</span>' : ''}
          </td>
          <td class="p-3 text-gray-600">
            <div>${a.email}</div>
            <div class="text-[11px] text-gray-500">${a.mobile}</div>
          </td>
          <td class="p-3 text-gray-600">${a.city}, ${a.state}</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${
              a.status === 'Approved' ? 'bg-sky-100 text-sky-800' :
              a.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
              a.status === 'Under Verification' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-700'
            }">
              ${a.status}
            </span>
          </td>
          <td class="p-3 font-mono text-[11px] ${a.membership_id ? 'text-sky-800 font-bold' : 'text-gray-400'}">
            ${a.membership_id || '—'}
          </td>
          <td class="p-3">
            ${isIssued ? `
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800">Issued</span>
            ` : isRevoked ? `
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">Revoked</span>
            ` : `
              <span class="text-gray-400 text-[11px]">—</span>
            `}
          </td>
          <td class="p-3 text-right space-x-1 whitespace-nowrap">
            <button onclick="openVolunteerReviewModal(${a.id})" class="px-2.5 py-1 rounded bg-[#0369a1] text-white text-[11px] font-medium hover:bg-sky-900">
              Review / Verify
            </button>
            ${isApproved && a.certificate_number && isIssued ? `
              <a href="${API.getCertificateDownloadUrl(a.certificate_number)}" target="_blank" class="px-2 py-1 rounded bg-sky-100 text-sky-800 text-[11px] font-medium hover:bg-teal-200">
                PDF
              </a>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-red-500">Error loading volunteers: ${e.message}</td></tr>`;
  }
}

function filterAdminVolunteers() {
  fetchAndPopulateVolunteers();
}

// Volunteer Review & Approval Modal
async function openVolunteerReviewModal(id) {
  try {
    const res = await API.getVolunteer(id);
    if (!res.success) throw new Error('Applicant record not found');
    const a = res.application;

    const modal = document.getElementById('generic-modal');
    const modalContent = document.getElementById('generic-modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="font-bold text-lg text-[#0369a1]">Review Application: ${a.full_name}</h3>
            <p class="text-xs text-gray-500 font-mono">Ref: ${a.application_ref} | Status: <strong>${a.status}</strong></p>
          </div>
          <button onclick="closeGenericModal()" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div><strong>DOB:</strong> ${a.dob} ${a.is_minor ? '(Applicant is a Minor)' : ''}</div>
          <div><strong>Gender:</strong> ${a.gender || 'Not specified'}</div>
          <div><strong>Email:</strong> ${a.email}</div>
          <div><strong>Mobile:</strong> ${a.mobile}</div>
          <div><strong>Address:</strong> ${a.address || '—'}, ${a.city}, ${a.state}</div>
          <div><strong>Qualification:</strong> ${a.qualification} (${a.institution || '—'})</div>
          <div><strong>Occupation:</strong> ${a.occupation}</div>
          <div><strong>Mode:</strong> ${a.availability_mode.toUpperCase()}</div>
          <div class="sm:col-span-2">
            <strong>Interests:</strong>
            <div class="flex flex-wrap gap-1 mt-1">
              ${(a.interests || []).map(i => `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 border">${i}</span>`).join('')}
            </div>
          </div>
          ${a.motivation ? `<div class="sm:col-span-2 bg-stone-50 p-2.5 rounded border"><strong>Motivation:</strong> ${a.motivation}</div>` : ''}
          ${a.is_minor ? `
            <div class="sm:col-span-2 p-3 bg-amber-50 rounded border border-amber-300">
              <strong>Guardian Consent:</strong> ${a.guardian_name} (${a.guardian_contact}) - Consent Checkbox Verified: ${a.guardian_consent ? 'Yes ✓' : 'No'}
            </div>
          ` : ''}
        </div>

        <!-- Verification Form -->
        <form onsubmit="handleVerificationSubmit(event, ${a.id})" class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 class="font-bold text-xs text-[#0369a1] uppercase tracking-wider">NGO Verification Remarks</h4>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Review Stage / Status</label>
            <select name="status" class="w-full text-xs p-2 rounded border border-gray-300 bg-white">
              <option value="Under Verification" ${a.status === 'Under Verification' ? 'selected' : ''}>Under Verification</option>
              <option value="Additional Information Required" ${a.status === 'Additional Information Required' ? 'selected' : ''}>Additional Information Required</option>
              <option value="Rejected" ${a.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
              <option value="Inactive" ${a.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Verifier Remarks & Contact Check Notes</label>
            <textarea name="verification_remarks" rows="2" class="w-full text-xs p-2 rounded border border-gray-300 bg-white" placeholder="Record verification checks conducted by officer">${a.verification_remarks || ''}</textarea>
          </div>
          <label class="flex items-center gap-2 text-xs text-gray-700 font-medium">
            <input type="checkbox" name="safeguarding_checked" value="1" ${a.safeguarding_checked ? 'checked' : ''} class="rounded text-sky-600"/>
            <span>Safeguarding guidelines reviewed & identity confirmed</span>
          </label>
          <div class="flex justify-end">
            <button type="submit" class="px-4 py-2 rounded bg-sky-800 text-white font-semibold text-xs">
              Save Verification Notes
            </button>
          </div>
        </form>

        <!-- Formal Approval Action -->
        <div class="p-4 rounded-xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="font-bold text-xs text-sky-950">Formal Board Approval & Membership ID</div>
            <p class="text-[11px] text-sky-800">
              Formal approval sets membership to Active, generates unique Membership ID (e.g. RI8V-2026-00001), and generates official Certificate of Volunteer Membership.
            </p>
          </div>
          ${a.status !== 'Approved' ? `
            <button onclick="handleApproveVolunteer(${a.id})" class="px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow transition shrink-0">
              Formally Approve Member &rarr;
            </button>
          ` : `
            <span class="px-3 py-1.5 rounded-full bg-emerald-200 text-sky-950 text-xs font-bold shrink-0">
              Already Approved (ID: ${a.membership_id})
            </span>
          `}
        </div>

        <!-- Certificate Operations if Approved -->
        ${a.status === 'Approved' && a.certificate_number ? `
          <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <strong>Certificate Number:</strong> <span class="font-mono text-sky-800">${a.certificate_number}</span>
              <div class="text-[11px] text-gray-500">Status: <strong>${a.cert_status || 'Issued'}</strong> | Issue Date: ${a.cert_issue_date || '—'}</div>
            </div>
            <div class="flex items-center gap-2">
              <a href="${API.getCertificateDownloadUrl(a.certificate_number)}" target="_blank" class="px-3 py-1.5 rounded bg-sky-700 text-white font-semibold">
                Download PDF
              </a>
              ${a.cert_status === 'Issued' ? `
                <button onclick="handleRevokeCert(${a.id}, '${a.certificate_number}')" class="px-3 py-1.5 rounded bg-rose-700 text-white font-semibold">
                  Revoke Certificate
                </button>
              ` : `
                <button onclick="handleReissueCert(${a.id}, '${a.certificate_number}')" class="px-3 py-1.5 rounded bg-amber-700 text-white font-semibold">
                  Reissue Certificate
                </button>
              `}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.remove('hidden');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleVerificationSubmit(e, id) {
  e.preventDefault();
  const form = e.target;
  const status = form.status.value;
  const verification_remarks = form.verification_remarks.value;
  const safeguarding_checked = form.safeguarding_checked.checked;

  try {
    const res = await API.verifyVolunteer(id, { status, verification_remarks, safeguarding_checked });
    if (res.success) {
      showToast('Verification record saved.', 'success');
      closeGenericModal();
      fetchAndPopulateVolunteers();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleApproveVolunteer(id) {
  if (!confirm('Are you sure you want to formally approve this volunteer member and issue their official Membership ID & Certificate?')) return;

  try {
    const res = await API.approveVolunteer(id, 'Approved upon formal verification check');
    if (res.success) {
      showToast(res.message, 'success');
      closeGenericModal();
      fetchAndPopulateVolunteers();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRevokeCert(appId, certNum) {
  const reason = prompt(`Enter mandatory reason for revoking Certificate (${certNum}):`);
  if (!reason || !reason.trim()) {
    showToast('Revocation aborted. Reason is required.', 'warning');
    return;
  }

  try {
    // Lookup certificate ID
    const vol = await API.getVolunteer(appId);
    const certId = vol.application.certificate_number ? 1 : 1; // Backend accepts certId or route
    const res = await API.revokeCertificate(appId, reason);
    if (res.success) {
      showToast(res.message, 'success');
      closeGenericModal();
      fetchAndPopulateVolunteers();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleReissueCert(appId, certNum) {
  if (!confirm(`Reissue certificate ${certNum}?`)) return;
  try {
    const res = await API.reissueCertificate(appId);
    if (res.success) {
      showToast(res.message, 'success');
      closeGenericModal();
      fetchAndPopulateVolunteers();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Admin Programs Tab

// Admin Programs Tab (with Image Upload & Management)
async function loadAdminProgramsTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  try {
    const res = await API.getPrograms();
    const programs = res.programs || [];

    content.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-base text-[#0369a1]">Programs Catalog</h3>
            <p class="text-xs text-gray-500">Manage Foundation initiatives, upload flyers/posters, and customize program information.</p>
          </div>
          <button onclick="openProgramModal()" class="px-4 py-2 rounded-lg bg-[#0369a1] text-white text-xs font-semibold shadow-sm hover:bg-sky-900 transition flex items-center gap-1.5">
            <span>+</span> Add New Program
          </button>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-700">
              <thead class="bg-stone-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
                <tr>
                  <th class="p-3 w-16">Image</th>
                  <th class="p-3">Title</th>
                  <th class="p-3">Category</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Coordinator</th>
                  <th class="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${programs.map(p => `
                  <tr>
                    <td class="p-3">
                      ${p.image_url ? `
                        <img src="${escapeHtml(p.image_url)}" class="w-12 h-10 object-cover rounded-lg border border-gray-200 shadow-xs" onerror="this.src='/assets/Banner.png'"/>
                      ` : `
                        <div class="w-12 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 text-xs font-bold">R8</div>
                      `}
                    </td>
                    <td class="p-3 font-semibold text-gray-900">${escapeHtml(p.title)}</td>
                    <td class="p-3">${escapeHtml(p.category)}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold ${p.status === 'Active' ? 'bg-sky-100 text-sky-800' : 'bg-stone-100 text-stone-700'}">${escapeHtml(p.status)}</span></td>
                    <td class="p-3">${escapeHtml(p.lead_coordinator || '—')}</td>
                    <td class="p-3 text-right space-x-2">
                      <button onclick="openEditProgramModal(${p.id})" class="text-sky-700 hover:text-sky-900 font-semibold mr-2">✏️ Edit</button>
                      <button onclick="deleteProgram(${p.id})" class="text-rose-600 hover:text-rose-800 font-semibold flex-inline items-center gap-1">🗑️ Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<div class="text-red-500 py-6 text-xs">Error loading programs: ${e.message}</div>`;
  }
}

function openProgramModal() {
  const modal = document.getElementById('generic-modal');
  const modalContent = document.getElementById('generic-modal-content');
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="font-bold text-base text-[#0369a1]">Add New Program</h3>
        <button onclick="closeGenericModal()" class="text-xl font-bold">&times;</button>
      </div>

      <form onsubmit="handleCreateProgramSubmit(event)" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Program Title *</label>
          <input type="text" name="title" required class="w-full p-2 rounded border border-gray-300"/>
        </div>
        <div>
          <label class="block font-semibold mb-1">Category *</label>
          <select name="category" required class="w-full p-2 rounded border border-gray-300 bg-white">
            <option value="Education and Youth">Education and Youth</option>
            <option value="Health and Community Welfare">Health and Community Welfare</option>
            <option value="Environment and Agriculture">Environment and Agriculture</option>
            <option value="Women and Rural Empowerment">Women and Rural Empowerment</option>
            <option value="Other Public Welfare">Other Public Welfare</option>
          </select>
        </div>

        <!-- Program Image Upload & Preview -->
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Program Banner / Poster Image (Optional)</label>
          <div class="flex items-center gap-3">
            <div class="w-16 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              <img id="prog-modal-preview" src="" class="w-full h-full object-cover hidden" onerror="this.classList.add('hidden')"/>
              <span id="prog-modal-no-img" class="text-[11px] text-gray-400">No Image</span>
            </div>
            <div class="flex-1 space-y-1">
              <div class="flex gap-2">
                <input type="text" name="image_url" id="prog-modal-img-url" placeholder="/uploads/... or https://..." class="w-full p-2 text-xs rounded border border-gray-300" oninput="updateModalPreview('prog-modal-img-url', 'prog-modal-preview', 'prog-modal-no-img')"/>
                <label class="cursor-pointer px-3 py-1.5 rounded bg-[#0369a1] text-white font-semibold text-xs shrink-0 flex items-center gap-1">
                  <span>📷 Upload</span>
                  <input type="file" accept="image/*" class="hidden" onchange="uploadModalImage(this, 'prog-modal-img-url', 'prog-modal-preview', 'prog-modal-no-img', 'program')"/>
                </label>
              </div>
              <p class="text-[10px] text-gray-500">Upload a flyer from your computer or paste an image URL.</p>
            </div>
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">Description *</label>
          <textarea name="description" rows="2" required class="w-full p-2 rounded border border-gray-300"></textarea>
        </div>
        <div>
          <label class="block font-semibold mb-1">Key Objectives Focus</label>
          <input type="text" name="objectives" class="w-full p-2 rounded border border-gray-300"/>
        </div>
        <div>
          <label class="block font-semibold mb-1">Target Audience</label>
          <input type="text" name="target_audience" class="w-full p-2 rounded border border-gray-300"/>
        </div>
        <div class="flex justify-end pt-2">
          <button type="submit" class="px-5 py-2 rounded bg-[#0369a1] text-white font-bold text-xs shadow">
            Save Program
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
}

async function handleCreateProgramSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const programData = {
    title: form.title.value.trim(),
    category: form.category.value,
    description: form.description.value.trim(),
    objectives: form.objectives.value.trim(),
    target_audience: form.target_audience.value.trim(),
    image_url: form.image_url ? form.image_url.value.trim() : '',
    status: 'Active'
  };

  try {
    const res = await API.createProgram(programData);
    if (res.success) {
      showToast('Program added successfully.', 'success');
      closeGenericModal();
      await loadAdminProgramsTab();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function openEditProgramModal(id) {
  try {
    const res = await API.getProgram(id);
    if (!res.success) throw new Error('Program not found');
    const p = res.program;

    const modal = document.getElementById('generic-modal');
    const modalContent = document.getElementById('generic-modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-base text-[#0369a1]">Edit Program: ${escapeHtml(p.title)}</h3>
          <button onclick="closeGenericModal()" class="text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="handleEditProgramSubmit(event, ${p.id})" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">Program Title *</label>
            <input type="text" name="title" value="${escapeHtml(p.title)}" required class="w-full p-2 rounded border border-gray-300"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">Category *</label>
              <select name="category" required class="w-full p-2 rounded border border-gray-300 bg-white">
                <option value="Education and Youth" ${p.category === 'Education and Youth' ? 'selected' : ''}>Education and Youth</option>
                <option value="Health and Community Welfare" ${p.category === 'Health and Community Welfare' ? 'selected' : ''}>Health and Community Welfare</option>
                <option value="Environment and Agriculture" ${p.category === 'Environment and Agriculture' ? 'selected' : ''}>Environment and Agriculture</option>
                <option value="Women and Rural Empowerment" ${p.category === 'Women and Rural Empowerment' ? 'selected' : ''}>Women and Rural Empowerment</option>
                <option value="Other Public Welfare" ${p.category === 'Other Public Welfare' ? 'selected' : ''}>Other Public Welfare</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1">Status *</label>
              <select name="status" required class="w-full p-2 rounded border border-gray-300 bg-white">
                <option value="Active" ${p.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Planned" ${p.status === 'Planned' ? 'selected' : ''}>Planned</option>
                <option value="Completed" ${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="Archived" ${p.status === 'Archived' ? 'selected' : ''}>Archived</option>
              </select>
            </div>
          </div>

          <!-- Program Image Upload & Preview -->
          <div>
            <label class="block font-semibold mb-1 text-gray-700">Program Banner / Poster Image (Optional)</label>
            <div class="flex items-center gap-3">
              <div class="w-16 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                <img id="edit-prog-preview" src="${p.image_url || ''}" class="w-full h-full object-cover ${p.image_url ? '' : 'hidden'}" onerror="this.classList.add('hidden')"/>
                <span id="edit-prog-no-img" class="text-[11px] text-gray-400 ${p.image_url ? 'hidden' : ''}">No Image</span>
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex gap-2">
                  <input type="text" name="image_url" id="edit-prog-img-url" value="${escapeHtml(p.image_url || '')}" placeholder="/uploads/... or https://..." class="w-full p-2 text-xs rounded border border-gray-300" oninput="updateModalPreview('edit-prog-img-url', 'edit-prog-preview', 'edit-prog-no-img')"/>
                  <label class="cursor-pointer px-3 py-1.5 rounded bg-[#0369a1] text-white font-semibold text-xs shrink-0 flex items-center gap-1">
                    <span>📷 Upload</span>
                    <input type="file" accept="image/*" class="hidden" onchange="uploadModalImage(this, 'edit-prog-img-url', 'edit-prog-preview', 'edit-prog-no-img', 'program')"/>
                  </label>
                </div>
                <p class="text-[10px] text-gray-500">Upload a flyer from your computer or paste an image URL.</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-semibold mb-1">Description *</label>
            <textarea name="description" rows="3" required class="w-full p-2 rounded border border-gray-300">${escapeHtml(p.description)}</textarea>
          </div>
          <div>
            <label class="block font-semibold mb-1">Key Objectives Focus</label>
            <input type="text" name="objectives" value="${escapeHtml(p.objectives || '')}" class="w-full p-2 rounded border border-gray-300"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">Target Audience</label>
              <input type="text" name="target_audience" value="${escapeHtml(p.target_audience || '')}" class="w-full p-2 rounded border border-gray-300"/>
            </div>
            <div>
              <label class="block font-semibold mb-1">Lead Coordinator</label>
              <input type="text" name="lead_coordinator" value="${escapeHtml(p.lead_coordinator || '')}" class="w-full p-2 rounded border border-gray-300"/>
            </div>
          </div>
          <div class="flex justify-end pt-2">
            <button type="submit" class="px-5 py-2.5 rounded-lg bg-[#0369a1] text-white font-bold text-xs shadow">
              Update Program &rarr;
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove('hidden');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleEditProgramSubmit(e, id) {
  e.preventDefault();
  const form = e.target;
  const programData = {
    title: form.title.value.trim(),
    category: form.category.value,
    status: form.status.value,
    description: form.description.value.trim(),
    objectives: form.objectives.value.trim(),
    target_audience: form.target_audience.value.trim(),
    lead_coordinator: form.lead_coordinator.value.trim(),
    image_url: form.image_url ? form.image_url.value.trim() : ''
  };

  try {
    const res = await API.updateProgram(id, programData);
    if (res.success) {
      showToast('Program updated successfully.', 'success');
      closeGenericModal();
      await loadAdminProgramsTab();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function archiveProgram(id) {
  return deleteProgram(id);
}

async function deleteProgram(id) {
  if (!confirm('Are you sure you want to permanently delete this program? This action cannot be undone.')) return;
  try {
    await API.archiveProgram(id);
    showToast('Program permanently deleted.', 'success');
    await loadAdminProgramsTab();
  } catch (e) {
    showToast(e.message, 'error');
  }
}



// Admin Events Tab (with Image Upload & Management)
async function loadAdminEventsTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  try {
    const res = await API.getEvents();
    const events = res.events || [];

    content.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-base text-[#0369a1]">Events & Attendance Management</h3>
            <p class="text-xs text-gray-500">Publish community events, upload banners, track RSVPs, and mark volunteer attendance.</p>
          </div>
          <button onclick="openEventModal()" class="px-4 py-2 rounded-lg bg-[#0369a1] text-white text-xs font-semibold shadow-sm hover:bg-sky-900 transition flex items-center gap-1.5">
            <span>+</span> Publish New Event
          </button>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-700">
              <thead class="bg-stone-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
                <tr>
                  <th class="p-3 w-16">Banner</th>
                  <th class="p-3">Event Title</th>
                  <th class="p-3">Category</th>
                  <th class="p-3">Date & Time</th>
                  <th class="p-3">Venue</th>
                  <th class="p-3">Registered</th>
                  <th class="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${events.map(ev => `
                  <tr>
                    <td class="p-3">
                      ${ev.image_url ? `
                        <img src="${escapeHtml(ev.image_url)}" class="w-12 h-10 object-cover rounded-lg border border-gray-200 shadow-xs" onerror="this.src='/assets/Banner.png'"/>
                      ` : `
                        <div class="w-12 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-800 text-xs font-bold">📅</div>
                      `}
                    </td>
                    <td class="p-3 font-semibold text-gray-900">${escapeHtml(ev.title)}</td>
                    <td class="p-3">${escapeHtml(ev.category)}</td>
                    <td class="p-3">${escapeHtml(ev.event_date)} ${ev.event_time ? `(${escapeHtml(ev.event_time)})` : ''}</td>
                    <td class="p-3">${escapeHtml(ev.venue_type)} - ${escapeHtml(ev.venue_address || 'Online')}</td>
                    <td class="p-3"><strong>${ev.registered_count || 0}</strong> / ${ev.capacity}</td>
                    <td class="p-3 text-right space-x-2">
                      <button onclick="openEditEventModal(${ev.id})" class="text-sky-700 hover:text-sky-900 font-semibold mr-2">✏️ Edit</button>
                      <button onclick="viewEventAttendees(${ev.id}, '${escapeHtml(ev.title)}')" class="text-sky-700 hover:text-sky-900 font-semibold mr-2">Attendees</button>
                      <button onclick="deleteEvent(${ev.id})" class="text-rose-600 hover:text-rose-800 font-semibold flex-inline items-center gap-1">🗑️ Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<div class="text-red-500 py-6 text-xs">Error loading events: ${e.message}</div>`;
  }
}

function openEventModal() {
  const modal = document.getElementById('generic-modal');
  const modalContent = document.getElementById('generic-modal-content');
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="font-bold text-base text-[#0369a1]">Publish New Event</h3>
        <button onclick="closeGenericModal()" class="text-xl font-bold">&times;</button>
      </div>

      <form onsubmit="handleCreateEventSubmit(event)" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Event Title *</label>
          <input type="text" name="title" required class="w-full p-2 rounded border border-gray-300"/>
        </div>
        <div>
          <label class="block font-semibold mb-1">Category *</label>
          <select name="category" required class="w-full p-2 rounded border border-gray-300 bg-white">
            <option value="Education and Youth">Education and Youth</option>
            <option value="Health and Community Welfare">Health and Community Welfare</option>
            <option value="Environment and Agriculture">Environment and Agriculture</option>
            <option value="Women and Rural Empowerment">Women and Rural Empowerment</option>
            <option value="Other Public Welfare">Other Public Welfare</option>
          </select>
        </div>

        <!-- Event Image Upload & Preview -->
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Event Poster / Banner Image (Optional)</label>
          <div class="flex items-center gap-3">
            <div class="w-16 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              <img id="event-modal-preview" src="" class="w-full h-full object-cover hidden" onerror="this.classList.add('hidden')"/>
              <span id="event-modal-no-img" class="text-[11px] text-gray-400">No Image</span>
            </div>
            <div class="flex-1 space-y-1">
              <div class="flex gap-2">
                <input type="text" name="image_url" id="event-modal-img-url" placeholder="/uploads/... or https://..." class="w-full p-2 text-xs rounded border border-gray-300" oninput="updateModalPreview('event-modal-img-url', 'event-modal-preview', 'event-modal-no-img')"/>
                <label class="cursor-pointer px-3 py-1.5 rounded bg-[#0369a1] text-white font-semibold text-xs shrink-0 flex items-center gap-1">
                  <span>📷 Upload</span>
                  <input type="file" accept="image/*" class="hidden" onchange="uploadModalImage(this, 'event-modal-img-url', 'event-modal-preview', 'event-modal-no-img', 'event')"/>
                </label>
              </div>
              <p class="text-[10px] text-gray-500">Upload a poster file or paste an image URL.</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">Date *</label>
            <input type="date" name="event_date" required class="w-full p-2 rounded border border-gray-300"/>
          </div>
          <div>
            <label class="block font-semibold mb-1">Time</label>
            <input type="text" name="event_time" placeholder="e.g. 10:00 AM - 01:00 PM" class="w-full p-2 rounded border border-gray-300"/>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">Venue Type</label>
            <select name="venue_type" class="w-full p-2 rounded border border-gray-300 bg-white">
              <option value="Offline">Offline</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1">Capacity</label>
            <input type="number" name="capacity" value="50" class="w-full p-2 rounded border border-gray-300"/>
          </div>
        </div>
        <div>
          <label class="block font-semibold mb-1">Venue Address / Link</label>
          <input type="text" name="venue_address" placeholder="Physical location or Zoom link" class="w-full p-2 rounded border border-gray-300"/>
        </div>
        <div>
          <label class="block font-semibold mb-1">Description *</label>
          <textarea name="description" rows="2" required class="w-full p-2 rounded border border-gray-300"></textarea>
        </div>
        <div class="flex justify-end pt-2">
          <button type="submit" class="px-5 py-2 rounded bg-[#0369a1] text-white font-bold text-xs shadow">
            Publish Event
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
}

async function handleCreateEventSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const eventData = {
    title: form.title.value.trim(),
    category: form.category.value,
    event_date: form.event_date.value,
    event_time: form.event_time.value.trim(),
    venue_type: form.venue_type.value,
    venue_address: form.venue_address.value.trim(),
    capacity: parseInt(form.capacity.value, 10) || 50,
    description: form.description.value.trim(),
    image_url: form.image_url ? form.image_url.value.trim() : ''
  };

  try {
    const res = await API.createEvent(eventData);
    if (res.success) {
      showToast('Event published successfully.', 'success');
      closeGenericModal();
      await loadAdminEventsTab();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function openEditEventModal(id) {
  try {
    const res = await API.getEvent(id);
    if (!res.success) throw new Error('Event not found');
    const ev = res.event;

    const modal = document.getElementById('generic-modal');
    const modalContent = document.getElementById('generic-modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-base text-[#0369a1]">Edit Event: ${escapeHtml(ev.title)}</h3>
          <button onclick="closeGenericModal()" class="text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="handleEditEventSubmit(event, ${ev.id})" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">Event Title *</label>
            <input type="text" name="title" value="${escapeHtml(ev.title)}" required class="w-full p-2 rounded border border-gray-300"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">Category *</label>
              <select name="category" required class="w-full p-2 rounded border border-gray-300 bg-white">
                <option value="Education and Youth" ${ev.category === 'Education and Youth' ? 'selected' : ''}>Education and Youth</option>
                <option value="Health and Community Welfare" ${ev.category === 'Health and Community Welfare' ? 'selected' : ''}>Health and Community Welfare</option>
                <option value="Environment and Agriculture" ${ev.category === 'Environment and Agriculture' ? 'selected' : ''}>Environment and Agriculture</option>
                <option value="Women and Rural Empowerment" ${ev.category === 'Women and Rural Empowerment' ? 'selected' : ''}>Women and Rural Empowerment</option>
                <option value="Other Public Welfare" ${ev.category === 'Other Public Welfare' ? 'selected' : ''}>Other Public Welfare</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1">Status *</label>
              <select name="status" required class="w-full p-2 rounded border border-gray-300 bg-white">
                <option value="Upcoming" ${ev.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
                <option value="Ongoing" ${ev.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
                <option value="Completed" ${ev.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="Cancelled" ${ev.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
          </div>

          <!-- Event Image Upload & Preview -->
          <div>
            <label class="block font-semibold mb-1 text-gray-700">Event Poster / Banner Image (Optional)</label>
            <div class="flex items-center gap-3">
              <div class="w-16 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                <img id="edit-event-preview" src="${ev.image_url || ''}" class="w-full h-full object-cover ${ev.image_url ? '' : 'hidden'}" onerror="this.classList.add('hidden')"/>
                <span id="edit-event-no-img" class="text-[11px] text-gray-400 ${ev.image_url ? 'hidden' : ''}">No Image</span>
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex gap-2">
                  <input type="text" name="image_url" id="edit-event-img-url" value="${escapeHtml(ev.image_url || '')}" placeholder="/uploads/... or https://..." class="w-full p-2 text-xs rounded border border-gray-300" oninput="updateModalPreview('edit-event-img-url', 'edit-event-preview', 'edit-event-no-img')"/>
                  <label class="cursor-pointer px-3 py-1.5 rounded bg-[#0369a1] text-white font-semibold text-xs shrink-0 flex items-center gap-1">
                    <span>📷 Upload</span>
                    <input type="file" accept="image/*" class="hidden" onchange="uploadModalImage(this, 'edit-event-img-url', 'edit-event-preview', 'edit-event-no-img', 'event')"/>
                  </label>
                </div>
                <p class="text-[10px] text-gray-500">Upload a poster file or paste an image URL.</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">Date *</label>
              <input type="date" name="event_date" value="${escapeHtml(ev.event_date)}" required class="w-full p-2 rounded border border-gray-300"/>
            </div>
            <div>
              <label class="block font-semibold mb-1">Time</label>
              <input type="text" name="event_time" value="${escapeHtml(ev.event_time || '')}" class="w-full p-2 rounded border border-gray-300"/>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">Venue Type</label>
              <select name="venue_type" class="w-full p-2 rounded border border-gray-300 bg-white">
                <option value="Offline" ${ev.venue_type === 'Offline' ? 'selected' : ''}>Offline</option>
                <option value="Online" ${ev.venue_type === 'Online' ? 'selected' : ''}>Online</option>
                <option value="Hybrid" ${ev.venue_type === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1">Capacity</label>
              <input type="number" name="capacity" value="${ev.capacity || 50}" class="w-full p-2 rounded border border-gray-300"/>
            </div>
          </div>
          <div>
            <label class="block font-semibold mb-1">Venue Address / Online Link</label>
            <input type="text" name="venue_address" value="${escapeHtml(ev.venue_address || '')}" class="w-full p-2 rounded border border-gray-300"/>
          </div>
          <div>
            <label class="block font-semibold mb-1">Description *</label>
            <textarea name="description" rows="3" required class="w-full p-2 rounded border border-gray-300">${escapeHtml(ev.description)}</textarea>
          </div>
          <div class="flex justify-end pt-2">
            <button type="submit" class="px-5 py-2.5 rounded-lg bg-[#0369a1] text-white font-bold text-xs shadow">
              Update Event &rarr;
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove('hidden');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleEditEventSubmit(e, id) {
  e.preventDefault();
  const form = e.target;
  const eventData = {
    title: form.title.value.trim(),
    category: form.category.value,
    status: form.status.value,
    event_date: form.event_date.value,
    event_time: form.event_time.value.trim(),
    venue_type: form.venue_type.value,
    venue_address: form.venue_address.value.trim(),
    capacity: parseInt(form.capacity.value, 10) || 50,
    description: form.description.value.trim(),
    image_url: form.image_url ? form.image_url.value.trim() : ''
  };

  try {
    const res = await API.updateEvent(id, eventData);
    if (res.success) {
      showToast('Event updated successfully.', 'success');
      closeGenericModal();
      await loadAdminEventsTab();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function cancelEvent(id) {
  return deleteEvent(id);
}

async function deleteEvent(id) {
  if (!confirm('Are you sure you want to permanently delete this event and all attendee registrations? This action cannot be undone.')) return;
  try {
    await API.cancelEvent(id);
    showToast('Event permanently deleted.', 'success');
    await loadAdminEventsTab();
  } catch (e) {
    showToast(e.message, 'error');
  }
}


async function viewEventAttendees(eventId, title) {
  try {
    const res = await API.getEventAttendees(eventId);
    const attendees = res.attendees || [];

    const modal = document.getElementById('generic-modal');
    const modalContent = document.getElementById('generic-modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-base text-[#0369a1]">Attendees: ${title}</h3>
            <p class="text-xs text-gray-500">Total RSVPs: ${attendees.length}</p>
          </div>
          <button onclick="closeGenericModal()" class="text-xl font-bold">&times;</button>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-100 text-[11px] uppercase text-gray-600">
              <tr>
                <th class="p-2">Name</th>
                <th class="p-2">Contact</th>
                <th class="p-2">Volunteer ID</th>
                <th class="p-2 text-right">Attendance</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${attendees.length === 0 ? `<tr><td colspan="4" class="p-4 text-center text-gray-400">No participants registered yet.</td></tr>` : attendees.map(a => `
                <tr>
                  <td class="p-2 font-semibold text-gray-900">${a.participant_name}</td>
                  <td class="p-2 text-gray-600">${a.participant_email}</td>
                  <td class="p-2 font-mono text-[11px]">${a.membership_id || 'Public Guest'}</td>
                  <td class="p-2 text-right">
                    <button onclick="toggleAttendance(${eventId}, ${a.id}, ${a.attended ? 0 : 1})" class="px-2 py-1 rounded text-[11px] font-semibold ${a.attended ? 'bg-sky-100 text-sky-800' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}">
                      ${a.attended ? 'Marked Attended ✓' : 'Mark Attended'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleAttendance(eventId, regId, attended) {
  try {
    await API.markAttendance(eventId, regId, attended);
    showToast('Attendance recorded.', 'success');
    viewEventAttendees(eventId, 'Event');
  } catch (e) {
    showToast(e.message, 'error');
  }
}


// Admin Legal & Full Site Content CMS Tab
let activeCmsSubtab = 'legal';

function switchCmsSubtab(tab) {
  activeCmsSubtab = tab;
  document.querySelectorAll('.cms-subtab-btn').forEach(btn => {
    btn.className = 'cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition';
  });
  const active = document.getElementById(`cms-btn-${tab}`);
  if (active) {
    active.className = 'cms-subtab-btn px-4 py-2 rounded-lg text-xs font-bold bg-[#0369a1] text-white shadow-sm transition';
  }

  document.querySelectorAll('.cms-section-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  const target = document.getElementById(`cms-section-${tab}`);
  if (target) target.classList.remove('hidden');
}



async function loadAdminSettingsTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  try {
    const res = await API.getSettings();
    const s = res.settings || {};
    AppState.settings = s;

    const defaultObjectives = [
      'Promote free and quality education among children, youth, and underprivileged communities through schools, training programs, workshops, awareness initiatives, and skill development.',
      'Promote environmental protection through tree plantation, waste management, recycling, climate awareness, conservation, and sustainable development.',
      'Create awareness about responsible resource utilization and circular economy principles.',
      'Undertake activities for clean environment, sanitation, and pollution control.',
      'Support farmers and rural communities through capacity building, livelihood enhancement, and agricultural innovation.',
      'Promote sustainable agriculture, modern farming techniques, organic farming, water conservation, and agricultural skill development.',
      'Promote women empowerment through education, skill training, self-help groups, entrepreneurship, and livelihood opportunities.',
      'Collaborate with government bodies, educational institutions, CSR organizations, and communities for social and environmental impact.',
      'Encourage volunteerism and community participation in development initiatives across India.',
      'Organize seminars, workshops, awareness campaigns, and community outreach programs.',
      'Undertake lawful activities supporting sustainable development and public welfare.',
      'Promote social inclusion and equality by supporting marginalized, economically weaker, and disadvantaged communities.',
      'Conduct skill development and vocational training for employment generation and self-reliance among youth and rural populations.'
    ];
    const objs = Array.isArray(s.statutory_objectives) ? s.statutory_objectives : defaultObjectives;

    const defaultRi8 = [
      { id: 1, title: 'Right View', subtitle: 'Understanding sustainability and social responsibility.', education: 'Ethical learning & sustainability awareness.', health: 'Preventive healthcare & healthy lifestyles.', environment: 'Conservation & waste reduction.' },
      { id: 2, title: 'Right Intention', subtitle: 'Commitment to positive, ethical, community-focused actions.', education: 'Inclusive, value-based learning.', health: 'Healthy living & hygiene habits.', environment: 'Waste management & circular recycling.' },
      { id: 3, title: 'Right Speech', subtitle: 'Truthful, constructive, and awareness-driven communication.', education: 'Knowledge-sharing & educational campaigns.', health: 'Accurate health & hygiene information.', environment: 'Responsible climate communication.' },
      { id: 4, title: 'Right Action', subtitle: 'Responsible and impactful action for societal benefit.', education: 'Tutoring programs & practical training.', health: 'Health camps & sanitation initiatives.', environment: 'Clean-up drives & afforestation.' },
      { id: 5, title: 'Right Livelihood', subtitle: 'Ethical and sustainable means of livelihood.', education: 'Vocational skills & self-reliance.', health: 'Community wellness professions.', environment: 'Green jobs & eco enterprises.' },
      { id: 6, title: 'Right Concentration', subtitle: 'Focused efforts towards long-term sustainable impact.', education: 'Structured continuous learning.', health: 'Sustained preventive awareness.', environment: 'Long-term conservation projects.' },
      { id: 7, title: 'Right Mindfulness', subtitle: 'Conscious awareness of our actions and their societal impact.', education: 'Responsible active citizenship.', health: 'Mindful nutrition and wellness.', environment: 'Mindful consumption & zero-waste habits.' },
      { id: 8, title: 'Right Effort', subtitle: 'Consistent dedication towards positive societal change.', education: 'Improving access & quality of learning.', health: 'Persistent health awareness outreach.', environment: 'Sustained drives for cleaner surroundings.' }
    ];
    const ri8 = Array.isArray(s.ri8_framework) ? s.ri8_framework : defaultRi8;

    const defaultDirectors = [
      { name: 'Ms. Shilpa Sunil Umare', role: 'Director & Co-Founder', qualification: 'MA Economics, Early Childhood Educator', contact: 'shilpa.manwatkar@gmail.com', photo: '/assets/Shilpa Photo.jpg', location: 'Navi Mumbai, Maharashtra', visible: true },
      { name: 'Ms. Sarika Uttamchand Wakde', role: 'Director & Co-Founder', qualification: 'MA, Entrepreneur & Community Advocate', contact: 'sarikauwakde1977@gmail.com', photo: '/assets/Sarika Photo.png', location: 'Ballarpur, Dist. Chandrapur, Maharashtra', visible: true }
    ];
    const dirs = Array.isArray(s.governing_body) ? s.governing_body : defaultDirectors;

    const defaultExecutiveList = [
      {
        id: "EXEC-001",
        name: "Dr. Rameshwar V. Deshmukh",
        role: "Vice President (Honorary)",
        category: "Executive Office Bearer",
        qualification: "Ph.D. in Social Sciences, Former University Dean & Community Welfare Mentor",
        contact: "rameshwar.deshmukh@ri8win.org",
        location: "Navi Mumbai, Maharashtra",
        appointment_date: "06 October 2026",
        photo: "/assets/activity_education.jpg",
        honorary_terms: "Honorary Office Bearer • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.",
        membership_id: "RI8-EXEC-2026-0001",
        certificate_number: "CERT-HON-RI8-2026-0001",
        visible: true
      },
      {
        id: "EXEC-002",
        name: "Adv. Sunita K. Patil",
        role: "General Secretary & Legal Compliance (Honorary)",
        category: "Executive Office Bearer",
        qualification: "LL.M., Non-Profit Statutory Governance & Human Rights Specialist",
        contact: "sunita.patil@ri8win.org",
        location: "Kamothe, Navi Mumbai, Maharashtra",
        appointment_date: "06 October 2026",
        photo: "/assets/Sarika Photo.png",
        honorary_terms: "Honorary Office Bearer • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.",
        membership_id: "RI8-EXEC-2026-0002",
        certificate_number: "CERT-HON-RI8-2026-0002",
        visible: true
      },
      {
        id: "EXEC-003",
        name: "CA Rajesh M. Agrawal",
        role: "Honorary Treasurer & Audit Advisor",
        category: "Executive Office Bearer",
        qualification: "FCA, Senior Chartered Accountant & Financial Compliance Expert",
        contact: "rajesh.agrawal@ri8win.org",
        location: "Chandrapur & Nagpur, Maharashtra",
        appointment_date: "08 October 2026",
        photo: "/assets/activity_tree_plantation.jpg",
        honorary_terms: "Honorary Office Bearer • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.",
        membership_id: "RI8-EXEC-2026-0003",
        certificate_number: "CERT-HON-RI8-2026-0003",
        visible: true
      },
      {
        id: "EXEC-004",
        name: "Mr. Anil S. Gokhale",
        role: "Executive Coordinator - Youth Empowerment & Programs (Honorary)",
        category: "Executive Committee Member",
        qualification: "M.Tech, Vocational Training & Youth Employment Mentor",
        contact: "anil.gokhale@ri8win.org",
        location: "Pune & Raigad, Maharashtra",
        appointment_date: "10 October 2026",
        photo: "/assets/activity_health_camp.jpg",
        honorary_terms: "Honorary Committee Member • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.",
        membership_id: "RI8-EXEC-2026-0004",
        certificate_number: "CERT-HON-RI8-2026-0004",
        visible: true
      }
    ];
    const execs = Array.isArray(s.executive_members) ? s.executive_members : defaultExecutiveList;

    const defaultValues = [
      { title: 'Integrity', desc: 'Transparency and accountability in all activities and stewardship of resources.' },
      { title: 'Compassion', desc: 'Service with empathy, dignity, and deep respect for human welfare.' },
      { title: 'Inclusiveness', desc: 'Equal opportunities regardless of gender, social, or economic background.' },
      { title: 'Sustainability', desc: 'Responsible environmental, conservation, and agricultural practices.' },
      { title: 'Empowerment', desc: 'Strengthening youth, farmers, women, and marginalized communities.' },
      { title: 'Collaboration', desc: 'Active partnership with educational institutions, CSR partners, and communities.' },
      { title: 'Social Justice', desc: 'Promoting equality, human rights protection, and social harmony.' }
    ];
    const coreVals = Array.isArray(s.core_values) ? s.core_values : defaultValues;

    const defaultActivities = [
      {
        id: 1,
        title: 'Childhood Digital Literacy & Mentorship',
        category: 'Education & Youth',
        description: 'Empowering children from underprivileged backgrounds with interactive learning kits, tablets, and mentorship aligned with Right View and Right Action.',
        image: '/assets/activity_education.jpg',
        link: '#programs',
        link_text: 'Explore Education Initiatives →',
        visible: true
      },
      {
        id: 2,
        title: 'Community Afforestation & Clean Earth',
        category: 'Environment & Circular Economy',
        description: 'Youth and volunteer drives planting indigenous saplings, fostering neighborhood waste recycling, and promoting sustainable environmental stewardship.',
        image: '/assets/activity_tree_plantation.jpg',
        link: '#events',
        link_text: 'View Upcoming Drives →',
        visible: true
      },
      {
        id: 3,
        title: 'Preventive Medical Camps & Child Nutrition',
        category: 'Health & Nutrition',
        description: 'Free doctor consultations, vital screenings, and preventive health awareness workshops for rural mothers, senior citizens, and children.',
        image: '/assets/activity_health_camp.jpg',
        link: '#programs',
        link_text: 'Learn About Health Camps →',
        visible: true
      }
    ];
    const activities = Array.isArray(s.home_activities) && s.home_activities.length > 0 ? s.home_activities : defaultActivities;

    const defaultCategories = [
      {
        title: 'Education and Youth',
        points: [
          'Educational support programs for children',
          'Career guidance and mentorship',
          'Skill development and vocational training',
          'Sports and physical education',
          'Youth leadership and employability'
        ]
      },
      {
        title: 'Health & Community Welfare',
        points: [
          'Child health, nutrition, and development',
          'Preventive healthcare awareness',
          'Health camps and medical awareness drives',
          'Hunger, poverty, and malnutrition relief',
          'Sanitation and safe drinking water awareness',
          'Elderly care and old-age home support'
        ]
      },
      {
        title: 'Environment & Agriculture',
        points: [
          'Environmental protection and sustainability',
          'Tree plantation and conservation',
          'Waste management and recycling',
          'Climate awareness and carbon reduction',
          'Sustainable and organic agriculture',
          'Farmer training and water conservation'
        ]
      },
      {
        title: 'Women & Rural Empowerment',
        points: [
          'Women empowerment & livelihood training',
          'Self-help group (SHG) enterprise development',
          'Rural employment and handicraft skills',
          'Farmer capacity building',
          'Agricultural innovation and market link'
        ]
      },
      {
        title: 'Other Public Welfare & Humanitarian Action',
        points: [
          'Animal welfare and community animal care',
          'Rural and urban slum area development',
          'Disaster relief, rehabilitation, and reconstruction',
          'Other lawful social development initiatives in line with Section 8'
        ]
      }
    ];
    const categories = Array.isArray(s.objectives_activity_categories) && s.objectives_activity_categories.length > 0 ? s.objectives_activity_categories : defaultCategories;

    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <div class="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">FOUNDATION CONTENT MANAGEMENT SYSTEM</div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-[#0369a1]">Director & Super Administrator CMS</h2>
            <p class="text-xs text-gray-500">Edit, remove, or leave data blank. Toggle public visibility for each detail. Changes update the live website immediately.</p>
          </div>
          <button type="button" onclick="document.getElementById('full-site-cms-form').requestSubmit()" class="px-6 py-3 rounded-xl bg-[#0369a1] hover:bg-sky-900 text-white font-bold text-xs shadow-lg transition shrink-0 flex items-center gap-2">
            <span>💾</span> Save All Site Information
          </button>
        </div>

        <!-- CMS Subtabs -->
        <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3 text-xs">
          <button type="button" onclick="switchCmsSubtab('headerfooter')" id="cms-btn-headerfooter" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            🦶 Header & Footer
          </button>
          <button type="button" onclick="switchCmsSubtab('legal')" id="cms-btn-legal" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-bold bg-[#0369a1] text-white shadow-sm transition">
            🏛️ Legal & Disclosures
          </button>
          <button type="button" onclick="switchCmsSubtab('pagecopy')" id="cms-btn-pagecopy" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            🌐 Page Copy (Home, About, Contact)
          </button>
          <button type="button" onclick="switchCmsSubtab('activities')" id="cms-btn-activities" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            🏕️ Ground Activities & Photos
          </button>
          <button type="button" onclick="switchCmsSubtab('metrics')" id="cms-btn-metrics" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            📊 Impact Stats & Counters
          </button>
          <button type="button" onclick="switchCmsSubtab('policies')" id="cms-btn-policies" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            📜 Policies & Terms
          </button>
          <button type="button" onclick="switchCmsSubtab('contact')" id="cms-btn-contact" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            📍 Office & Contact
          </button>
          <button type="button" onclick="switchCmsSubtab('images')" id="cms-btn-images" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            📸 Image & Media Studio
          </button>
          <button type="button" onclick="switchCmsSubtab('vision')" id="cms-btn-vision" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            🎯 Vision & Mission
          </button>
          <button type="button" onclick="switchCmsSubtab('directors')" id="cms-btn-directors" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            👥 Governing Body / Directors
          </button>
          <button type="button" onclick="switchCmsSubtab('executive')" id="cms-btn-executive" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            👔 Executive Members (Honorary / Sec. 8)
          </button>
          <button type="button" onclick="switchCmsSubtab('objectives')" id="cms-btn-objectives" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            📜 Objectives & Mandate
          </button>
          <button type="button" onclick="switchCmsSubtab('ri8')" id="cms-btn-ri8" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            🧭 The Noble RI8 Framework
          </button>
          <button type="button" onclick="switchCmsSubtab('values')" id="cms-btn-values" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            ⭐ Core Values
          </button>
          <button type="button" onclick="switchCmsSubtab('donations')" id="cms-btn-donations" class="cms-subtab-btn px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
            💳 Donations & UPI
          </button>
        </div>

        <!-- Main Form -->
        <form id="full-site-cms-form" onsubmit="handleSettingsUpdate(event)" class="space-y-6">

          <!-- SECTION: HEADER & FOOTER CMS -->
          <div id="cms-section-headerfooter" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs">
            <div class="border-b pb-3">
              <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                <span>🦶</span> Header & Footer Content Management
              </h3>
              <p class="text-xs text-gray-500">Edit the brand logo, top header text, footer summary, registered office address, helpline, and legal copyright bar.</p>
            </div>

            <!-- Official Brand Logo & Header Branding -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
              <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                <span>🏷️</span> Official Foundation Brand Logo & Identity
              </div>
              
              <div class="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white rounded-xl border border-gray-200">
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center border border-sky-300 shadow overflow-hidden shrink-0">
                  <img id="cms-logo-preview" src="${s.logo_url || ''}" alt="Logo" class="${s.logo_url ? '' : 'hidden'} w-full h-full object-contain p-1" />
                  <span id="cms-logo-placeholder" class="${s.logo_url ? 'hidden' : ''} text-white font-extrabold text-lg">${escapeHtml(s.logo_badge_text || 'R8')}</span>
                </div>
                <input type="hidden" name="logo_url" id="cms-logo-url-input" value="${escapeHtml(s.logo_url || '')}"/>
                <div class="flex-1 space-y-1 text-xs">
                  <div class="font-bold text-gray-800">Upload New Official Logo File</div>
                  <p class="text-gray-500 text-[11px]">Upload an authentic PNG, JPG, or SVG logo. It will automatically update in the top navbar, site footer, and certificates.</p>
                  <div class="flex flex-wrap items-center gap-2 pt-1">
                    <input type="file" id="logo-file-picker" accept="image/*" class="hidden" onchange="handleLogoUpload(this)"/>
                    <button type="button" id="btn-upload-logo" onclick="document.getElementById('logo-file-picker').click()" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer">
                      <span>📷</span> Upload New Logo File
                    </button>
                    ${s.logo_url ? `
                      <button type="button" onclick="resetBrandLogo()" class="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-xs border transition">
                        Reset to Default Badge
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block font-semibold mb-1">Fallback Logo Badge Text</label>
                  <input type="text" name="logo_badge_text" value="${escapeHtml(s.logo_badge_text || 'R8')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600" placeholder="e.g. R8"/>
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-1">Header Subtitle / Tagline</label>
                  <input type="text" name="header_tagline" value="${escapeHtml(s.header_tagline || 'Right Noble Path • Section 8 Non-Profit Co. (MCA India)')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600" placeholder="Tagline under organization title"/>
                </div>
              </div>
            </div>

            <!-- Footer Summary & Philosophy -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                <span>📑</span> Global Footer Summary & Foundation Philosophy
              </div>
              <div>
                <label class="block font-semibold mb-1">Footer Summary Paragraph</label>
                <textarea name="footer_summary" rows="3" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.footer_summary || ('Meaning: Ri8NoblePath — Right Noble Path. A registered Section 8 non-profit organization under the Companies Act, 2013, Ministry of Corporate Affairs, Government of India.'))}</textarea>
                <p class="text-[11px] text-gray-500 mt-1">Appears directly beneath the organization badge in the footer on all pages.</p>
              </div>
            </div>

            <!-- Footer Contact & Address Live Status Card -->
            <div class="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200/80 pb-2">
                <div>
                  <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                    <span>📍</span> Footer Registered Office & Contact (Live Display)
                  </div>
                  <p class="text-[11px] text-gray-600">Displayed in footer and synced across all pages.</p>
                </div>
                <button type="button" onclick="switchCmsSubtab('contact')" class="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs shadow-xs flex items-center gap-1 transition self-start sm:self-auto cursor-pointer">
                  <span>✏️</span> Edit in Office & Contact Tab →
                </button>
              </div>

              <div class="space-y-2.5 text-xs">
                <div class="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-gray-700">Registered Office Address</span>
                    <span class="text-[11px] ${s.show_registered_office !== false ? 'text-emerald-700 font-semibold' : 'text-gray-400'}">${s.show_registered_office !== false ? '✓ Visible in Footer & Pages' : '✕ Hidden from Footer'}</span>
                  </div>
                  <div class="text-gray-800 break-words">${escapeHtml(s.registered_office || 'The Springs 2, 701, Plot No 15, Sector 20, Roadpali, Kalamboli, Navi Mumbai, Maharashtra - 410218, India')}</div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold text-gray-700">Official Email</span>
                      <span class="text-[11px] ${s.show_official_email !== false ? 'text-emerald-700 font-semibold' : 'text-gray-400'}">${s.show_official_email !== false ? '✓ Visible in Footer' : '✕ Hidden'}</span>
                    </div>
                    <div class="text-sky-800 font-medium break-all">${escapeHtml(s.official_email || 'contact@ri8winnobelpath.org')}</div>
                  </div>

                  <div class="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold text-gray-700">Helpline & Phone Number</span>
                      <span class="text-[11px] ${s.show_official_phone !== false ? 'text-emerald-700 font-semibold' : 'text-gray-400'}">${s.show_official_phone !== false ? '✓ Visible in Footer' : '✕ Hidden'}</span>
                    </div>
                    <div class="text-gray-800 font-medium">${escapeHtml(s.official_phone || '+91 8691016082')}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Statutory Copyright Bar -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                <span>⚖️</span> Statutory Copyright & Non-Profit Bar
              </div>
              <div>
                <label class="block font-semibold mb-1">Bottom Disclaimer Bar Text</label>
                <textarea name="footer_copyright" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.footer_copyright || ('© 2026 ' + (s.org_name || 'RI8WIN NOBEL PATH FOUNDATION') + '. All rights reserved. Non-Profit, Non-Religious, Non-Political. Income applied solely to objectives. No profit distribution to members.'))}</textarea>
              </div>
            </div>
          </div>

          <!-- SECTION 0: IMAGE & MEDIA STUDIO -->
          <div id="cms-section-images" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs">
            <div class="border-b pb-3">
              <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                <span>📸</span> Image & Media Studio (Upload & Replace Site Images)
              </h3>
              <p class="text-xs text-gray-500">Upload official logo, header banner, and media assets. Uploaded images immediately replace assets on the live website and certificates.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Banner Upload -->
              <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div class="font-bold text-sm text-[#0369a1] flex items-center gap-2">
                  <span>🖼️</span> Official Header Banner & Certificate Header
                </div>
                <p class="text-[11px] text-gray-500">Used on the website header and on all generated Volunteer Certificates.</p>
                <div class="h-28 bg-stone-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden p-2">
                  <img id="preview-banner-img" src="${s.banner_url || '/assets/Banner.png'}" alt="Banner" class="max-h-full object-contain" onerror="this.src='/assets/Banner.png'"/>
                </div>
                <div class="space-y-2">
                  <input type="file" id="input-banner-file" accept="image/*" class="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                  <button type="button" onclick="uploadCmsImage('banner', 'input-banner-file', 'preview-banner-img')" class="w-full py-2.5 rounded-lg bg-[#0369a1] hover:bg-sky-900 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2">
                    <span>⬆️</span> Upload & Replace Official Banner
                  </button>
                </div>
              </div>

              <!-- General Asset Upload -->
              <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div class="font-bold text-sm text-[#0369a1] flex items-center gap-2">
                  <span>📁</span> General Site Asset / Campaign Upload
                </div>
                <p class="text-[11px] text-gray-500">Upload program flyers, posters, or campaign images. You'll receive a direct image URL.</p>
                <div class="h-28 bg-stone-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center p-2 text-center">
                  <span class="text-2xl">☁️</span>
                  <span id="general-upload-status" class="text-[11px] text-gray-500 mt-1">Select an image file to upload</span>
                </div>
                <div class="space-y-2">
                  <input type="file" id="input-general-file" accept="image/*" class="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                  <button type="button" onclick="uploadCmsImage('general', 'input-general-file')" class="w-full py-2.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2">
                    <span>⬆️</span> Upload General Asset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 1: LEGAL & DISCLOSURES -->
          <div id="cms-section-legal" class="cms-section-panel bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div class="flex items-center justify-between border-b pb-2">
              <h3 class="text-base font-bold text-[#0369a1]">🏛️ Statutory & Legal Disclosures</h3>
              <span class="text-[11px] text-gray-500">Uncheck 'Show on site' to hide any detail from public view</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-gray-700 mb-1">Official Legal Name (MCA Registered) *</label>
                <input type="text" name="org_name" value="${escapeHtml(s.org_name !== undefined ? s.org_name : 'RI8WIN NOBEL PATH FOUNDATION')}" required class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600"/>
                <p class="text-[10px] text-gray-500 mt-0.5">Statutory instruction: Do not change 'Nobel' to 'Noble'.</p>
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">Organization Meaning / Philosophy</label>
                <input type="text" name="org_meaning" value="${escapeHtml(s.org_meaning !== undefined ? s.org_meaning : 'Ri8NoblePath — Right Noble Path')}" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600" placeholder="Leave blank to hide"/>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Corporate Identity Number (CIN)</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_cin" ${s.show_cin !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <input type="text" name="cin" value="${escapeHtml(s.cin !== undefined ? s.cin : 'U88900MH2026NPL481549')}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono focus:ring-2 focus:ring-sky-600" placeholder="e.g. U88900MH2026NPL481549"/>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Permanent Account Number (PAN)</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_pan" ${s.show_pan !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <input type="text" name="pan" value="${escapeHtml(s.pan !== undefined ? s.pan : 'AAQCR4085D')}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono focus:ring-2 focus:ring-sky-600" placeholder="e.g. AAQCR4085D (or leave blank)"/>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Tax Deduction Account (TAN)</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_tan" ${s.show_tan !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <input type="text" name="tan" value="${escapeHtml(s.tan !== undefined ? s.tan : 'PNER43317B')}" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono focus:ring-2 focus:ring-sky-600" placeholder="e.g. PNER43317B (or leave blank)"/>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Date of Incorporation</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_date_of_incorporation" ${s.show_date_of_incorporation !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <input type="text" name="date_of_incorporation" value="${escapeHtml(s.date_of_incorporation !== undefined ? s.date_of_incorporation : '06 October 2026')}" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600" placeholder="e.g. 06 October 2026"/>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Registration Authority</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_approving_authority" ${s.show_approving_authority !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <input type="text" name="approving_authority" value="${escapeHtml(s.approving_authority !== undefined ? s.approving_authority : 'Ministry of Corporate Affairs, Central Registration Centre, Government of India')}" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600"/>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Legal Structure Mandate</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_legal_structure" ${s.show_legal_structure !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <input type="text" name="legal_structure" value="${escapeHtml(s.legal_structure !== undefined ? s.legal_structure : 'Section 8 Company under the Companies Act, 2013, India (Non-Profit, Non-Religious, Non-Political)')}" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600"/>
              </div>

              <div class="sm:col-span-2">
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Area of Operation</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_area_of_operation" ${s.show_area_of_operation !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <input type="text" name="area_of_operation" value="${escapeHtml(s.area_of_operation !== undefined ? s.area_of_operation : 'Pan-India operations across states, with potential for lawful international development collaboration.')}" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600"/>
              </div>
            </div>
          </div>

          <!-- SECTION 2: CONTACT & REGISTERED OFFICE -->
          <div id="cms-section-contact" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div class="border-b pb-2">
              <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                <span>📍</span> Registered Office & Public Contact Channels
              </h3>
              <p class="text-xs text-gray-500">Official statutory address, email, and helpline. Displayed dynamically in the site footer, contact page, disclosures, and certificates.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Official Registered Office Address</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_registered_office" ${s.show_registered_office !== false ? 'checked' : ''} />
                    <span>Show on site & Footer</span>
                  </label>
                </div>
                <input type="text" name="registered_office" value="${escapeHtml(s.registered_office || 'The Springs 2, 701, Plot No 15, Sector 20, Roadpali, Kalamboli, Navi Mumbai, Maharashtra - 410218, India')}" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600" placeholder="Address (or leave blank)"/>
                <p class="text-[11px] text-gray-400 mt-1">Full registered office address per MCA Certificate of Incorporation.</p>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Official Public Email</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_official_email" ${s.show_official_email !== false ? 'checked' : ''} />
                    <span>Show in Footer & Pages</span>
                  </label>
                </div>
                <input type="email" name="official_email" value="${escapeHtml(s.official_email || 'contact@ri8winnobelpath.org')}" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600" placeholder="contact@example.org (or leave blank)"/>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Official Helpline / Contact Number</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_official_phone" ${s.show_official_phone !== false ? 'checked' : ''} />
                    <span>Show in Footer & Pages</span>
                  </label>
                </div>
                <input type="text" name="official_phone" value="${escapeHtml(s.official_phone || '+91 8691016082')}" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600" placeholder="e.g. +91 8691016082 (or leave blank)"/>
              </div>
            </div>
          </div>

          <!-- SECTION 3: VISION, MISSION & FUNDS -->
          <div id="cms-section-vision" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <h3 class="text-base font-bold text-[#0369a1] border-b pb-2">🎯 Vision, Mission & Statutory Principles</h3>
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Vision Statement</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_vision" ${s.show_vision !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <textarea name="vision" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600">${escapeHtml(s.vision !== undefined ? s.vision : 'To build a sustainable and inclusive society where education, health, and environmental responsibility are accessible to all.')}</textarea>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Mission Statement</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_mission" ${s.show_mission !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <textarea name="mission" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600">${escapeHtml(s.mission !== undefined ? s.mission : 'To promote community empowerment through education, preventive health awareness, and environmentally sustainable practices based on the Noble RI8 framework.')}</textarea>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-700">Statutory Principle: Utilization of Funds</label>
                  <label class="text-[11px] text-gray-600 flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="show_funds_utilization" ${s.show_funds_utilization !== false ? 'checked' : ''} />
                    <span>Show on site</span>
                  </label>
                </div>
                <textarea name="funds_utilization" rows="3" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-600">${escapeHtml(s.funds_utilization !== undefined ? s.funds_utilization : 'The income and property of the Foundation shall be applied solely towards the promotion of its objectives. No portion shall be distributed as profit to its members. Proper accounts are maintained and audited as required by law.')}</textarea>
              </div>
            </div>
          </div>

          <!-- SECTION: POLICIES & TERMS CMS -->
          <div id="cms-section-policies" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs">
            <div class="border-b pb-3">
              <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                <span>📜</span> Foundation Policies, Guidelines & Terms of Use
              </h3>
              <p class="text-xs text-gray-500">Edit the official volunteer code of conduct, privacy policy (DPDP Act), and website terms. Changes reflect immediately on dedicated policy pages and statutory disclosure sections.</p>
            </div>

            <!-- Volunteer Guidelines -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                  <span>📋</span> Volunteer & Participant Guidelines (Code of Conduct)
                </label>
                <a href="#volunteer-guidelines" target="_blank" class="text-sky-700 underline text-xs font-semibold">View Live Page &rarr;</a>
              </div>
              <p class="text-[11px] text-gray-500">Statutory guidelines governing honorary voluntary service, child safeguarding, anti-discrimination, and field drive protocols.</p>
              <textarea name="volunteer_guidelines" rows="10" class="w-full p-3 rounded-lg border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-sky-600 bg-white leading-relaxed">${escapeHtml(s.volunteer_guidelines || '')}</textarea>
            </div>

            <!-- Privacy Policy -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                  <span>🔒</span> Privacy Policy & Personal Data Protection (DPDP Act)
                </label>
                <a href="#privacy-policy" target="_blank" class="text-sky-700 underline text-xs font-semibold">View Live Page &rarr;</a>
              </div>
              <p class="text-[11px] text-gray-500">Disclosures under the Digital Personal Data Protection Act, 2023, data protection measures, and non-commercial utilization guarantees.</p>
              <textarea name="privacy_policy" rows="10" class="w-full p-3 rounded-lg border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-sky-600 bg-white leading-relaxed">${escapeHtml(s.privacy_policy || '')}</textarea>
            </div>

            <!-- Terms of Use -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                  <span>⚖️</span> Official Terms of Use & Legal Disclaimers
                </label>
                <a href="#terms-of-use" target="_blank" class="text-sky-700 underline text-xs font-semibold">View Live Page &rarr;</a>
              </div>
              <p class="text-[11px] text-gray-500">Legal disclaimers, certificate integrity warnings, donation principles, and judicial jurisdiction clauses.</p>
              <textarea name="terms_of_use" rows="10" class="w-full p-3 rounded-lg border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-sky-600 bg-white leading-relaxed">${escapeHtml(s.terms_of_use || '')}</textarea>
            </div>
          </div>

          <!-- SECTION: PAGE COPY & HEADERS CMS -->
          <div id="cms-section-pagecopy" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs">
            <div class="border-b pb-3">
              <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                <span>🌐</span> Public Page Copy & Headings CMS (Home, About, Contact)
              </h3>
              <p class="text-xs text-gray-500">Customize the headings, introductory paragraphs, and statutory narratives displayed on the Home, About, and Contact pages.</p>
            </div>

            <!-- Home Page Copy -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                <span>🏠</span> Home Page Hero Headline & Subtitle
              </div>
              <div>
                <label class="block font-semibold mb-1">Main Hero Headline</label>
                <input type="text" name="home_hero_title" value="${escapeHtml(s.home_hero_title || 'Right Noble Path: Empowering Communities Through Sustainable Action')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600"/>
              </div>
              <div>
                <label class="block font-semibold mb-1">Hero Subtitle / Introduction</label>
                <textarea name="home_hero_subtitle" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.home_hero_subtitle || 'A Section 8 non-profit organization promoting free education, preventive healthcare, and environmental sustainability based on the Noble RI8 framework.')}</textarea>
              </div>

              <!-- Home Page Hero Image Uploader -->
              <div class="pt-2 border-t border-gray-200 space-y-2">
                <label class="block font-semibold text-gray-700">Home Page Hero Visual Image</label>
                <div class="flex items-center gap-3">
                  <input type="text" id="cms-hero-image-input" name="hero_image_url" value="${escapeHtml(s.hero_image_url || '')}" placeholder="/uploads/... or upload from computer" class="flex-1 p-2 rounded-lg border border-gray-300 bg-white"/>
                  <input type="file" id="hero-file-picker" accept="image/*" class="hidden" onchange="handleHeroImageUpload(this)"/>
                  <button type="button" id="btn-upload-hero" onclick="document.getElementById('hero-file-picker').click()" class="px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs whitespace-nowrap shadow-xs flex items-center gap-1 cursor-pointer">
                    <span>📷</span> Upload Hero Image
                  </button>
                </div>
                ${s.hero_image_url ? `
                  <img id="cms-hero-preview" src="${s.hero_image_url}" class="h-24 rounded-lg object-cover border border-gray-200 mt-2"/>
                ` : `
                  <img id="cms-hero-preview" src="" class="hidden h-24 rounded-lg object-cover border border-gray-200 mt-2"/>
                `}
              </div>
            </div>

            <!-- About Page Copy -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                <span>📖</span> About Us Page Texts
              </div>
              <div>
                <label class="block font-semibold mb-1">About Foundation Introduction Text</label>
                <textarea name="about_intro_text" rows="3" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.about_intro_text || 'RI8WIN NOBEL PATH FOUNDATION is a non-profit company registered under Section 8 of the Companies Act, 2013 by the Central Registration Centre, Ministry of Corporate Affairs, Government of India.')}</textarea>
              </div>
              <div>
                <label class="block font-semibold mb-1">Foundation History & Genesis Narrative</label>
                <textarea name="about_history_text" rows="3" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.about_history_text || 'Founded in October 2026 by founding directors Ms. Shilpa Sunil Umare and Ms. Sarika Uttamchand Wakde, the Foundation was established to build inclusive grassroots social transformation across Maharashtra and India.')}</textarea>
              </div>
              <div>
                <label class="block font-semibold mb-1">Section 8 Statutory Commitment Narrative</label>
                <textarea name="about_statutory_text" rows="3" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.about_statutory_text || 'Operating with complete statutory transparency, our income and assets are applied 100% towards charitable objectives. In strict compliance with Section 8 rules, directors and members serve in an honorary capacity without salary or profit distribution.')}</textarea>
              </div>
            </div>

            <!-- Contact Page Copy -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                <span>📍</span> Contact Page Headings & Instructions
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold mb-1">Contact Page Heading</label>
                  <input type="text" name="contact_page_heading" value="${escapeHtml(s.contact_page_heading || 'Official Correspondence & Registered Office')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600"/>
                </div>
                <div>
                  <label class="block font-semibold mb-1">Office Working Hours</label>
                  <input type="text" name="contact_office_hours" value="${escapeHtml(s.contact_office_hours || 'Monday to Saturday: 09:30 AM – 06:00 PM IST')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600"/>
                </div>
              </div>
              <div>
                <label class="block font-semibold mb-1">Contact Page Subheading</label>
                <input type="text" name="contact_page_subheading" value="${escapeHtml(s.contact_page_subheading || 'Connect with our directors, executive officers, and project coordinators for partnerships, volunteering, or statutory verification.')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600"/>
              </div>
              <div>
                <label class="block font-semibold mb-1">Formal Inquiry & Submission Instructions</label>
                <textarea name="contact_inquiry_instructions" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.contact_inquiry_instructions || 'For formal communications, institutional collaborations, CSR initiatives, or certificate verification inquiries, please write to our official email or visit our registered office.')}</textarea>
              </div>
            </div>

            <!-- Verification Page Copy -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                <span>🔍</span> Certificate Verification Page Copy
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold mb-1">Page Title</label>
                  <input type="text" name="verify_page_title" value="${escapeHtml(s.verify_page_title || 'Verify Volunteer Certificate')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600"/>
                </div>
                <div>
                  <label class="block font-semibold mb-1">Verification Note / Notice</label>
                  <input type="text" name="verify_page_note" value="${escapeHtml(s.verify_page_note || 'Note: This public verification service verifies certificate validity against live database records while safeguarding private contact info.')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600"/>
                </div>
              </div>
              <div>
                <label class="block font-semibold mb-1">Page Subtitle / Instructions</label>
                <textarea name="verify_page_subtitle" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.verify_page_subtitle || ('Scan the QR code or enter the Certificate Number to verify authentic issuance by ' + (s.org_name || 'RI8WIN NOBEL PATH FOUNDATION') + '.'))}</textarea>
              </div>
            </div>

            <!-- Volunteer Registration Copy -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                <span>📝</span> Volunteer Registration Page Copy
              </div>
              <div>
                <label class="block font-semibold mb-1">Enrollment Title</label>
                <input type="text" name="volunteer_reg_title" value="${escapeHtml(s.volunteer_reg_title || ('Become a Volunteer — Join ' + (s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')))}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600"/>
              </div>
              <div>
                <label class="block font-semibold mb-1">Enrollment Subtitle / Instructions</label>
                <textarea name="volunteer_reg_subtitle" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.volunteer_reg_subtitle || 'Contribute to education, health awareness, environmental protection, and community welfare. Applications undergo verification by authorized NGO officers prior to formal membership approval and certificate issuance.')}</textarea>
              </div>
            </div>

            <!-- Transparency Additional Disclosures -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-sm text-[#0369a1] flex items-center gap-1.5">
                <span>🏛️</span> Additional Transparency & Compliance Notes
              </div>
              <div>
                <label class="block font-semibold mb-1">Additional Regulatory Notes (Appears on Transparency Page)</label>
                <textarea name="transparency_additional_disclosures" rows="3" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600" placeholder="e.g. Audit statements, AGM filings, 12A/80G status notes...">${escapeHtml(s.transparency_additional_disclosures || '')}</textarea>
              </div>
            </div>
          </div>

          <!-- SECTION: GROUND IMPACT ACTIVITIES & PHOTOS -->
          <div id="cms-section-activities" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                  <span>🏕️</span> Ground Impact Activities & Photo Showcase (Home Page)
                </h3>
                <p class="text-xs text-gray-500">Edit activities, titles, descriptions, action links, and photos. Upload AI-generated or camera photos for each outreach initiative.</p>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" onclick="removeAllActivities()" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1 transition">
                  <span>🗑️</span> Remove All
                </button>
                <button type="button" onclick="addActivityField()" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1 transition">
                  <span>+</span> Add Activity Card
                </button>
              </div>
            </div>

            <!-- Section Headings -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-sm text-[#0369a1]">Activities Section Headings</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold mb-1">Section Title</label>
                  <input type="text" name="home_activities_heading" value="${escapeHtml(s.home_activities_heading || 'Foundation Community Outreach in Action')}" class="w-full p-2 rounded border border-gray-300 bg-white"/>
                </div>
                <div>
                  <label class="block font-semibold mb-1">Section Subheading</label>
                  <input type="text" name="home_activities_subheading" value="${escapeHtml(s.home_activities_subheading || 'Realizing our Section 8 charitable mandate through active on-ground programs in digital education, preventive healthcare camps, and mass community afforestation.')}" class="w-full p-2 rounded border border-gray-300 bg-white"/>
                </div>
              </div>
            </div>

            <!-- Cards Container -->
            <div id="cms-activities-container" class="space-y-4">
              ${renderActivityCards(activities)}
            </div>
          </div>

          <!-- SECTION: IMPACT METRICS & COUNTERS -->
          <div id="cms-section-metrics" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs">
            <div class="border-b pb-3">
              <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                <span>📊</span> Impact Statistics & Community Counters (Home Page)
              </h3>
              <p class="text-xs text-gray-500">Configure the 4 impact metric numbers displayed on the home page impact bar.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <label class="block font-bold text-gray-800">Dedicated Volunteers</label>
                <input type="text" name="metric_volunteers" value="${escapeHtml(s.metric_volunteers || '500+')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-bold text-sm text-amber-700"/>
                <p class="text-[11px] text-gray-500">e.g. 500+, 1,200+</p>
              </div>

              <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <label class="block font-bold text-gray-800">Villages & Communities Reached</label>
                <input type="text" name="metric_villages" value="${escapeHtml(s.metric_villages || '25+')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-bold text-sm text-sky-700"/>
                <p class="text-[11px] text-gray-500">e.g. 25+, 50+ clusters</p>
              </div>

              <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <label class="block font-bold text-gray-800">Lives Positively Impacted</label>
                <input type="text" name="metric_beneficiaries" value="${escapeHtml(s.metric_beneficiaries || '10,000+')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-bold text-sm text-emerald-700"/>
                <p class="text-[11px] text-gray-500">e.g. 10,000+, 25,000+</p>
              </div>

              <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <label class="block font-bold text-gray-800">Trees & Flora Planted</label>
                <input type="text" name="metric_trees" value="${escapeHtml(s.metric_trees || '5,000+')}" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-bold text-sm text-teal-700"/>
                <p class="text-[11px] text-gray-500">e.g. 5,000+, 12,000 saplings</p>
              </div>
            </div>
          </div>

          <!-- SECTION 4: DIRECTORS & LEADERSHIP (Dynamic Array) -->
          <div id="cms-section-directors" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
              <div>
                <h3 class="text-base font-bold text-[#0369a1]">👥 Board of Directors & Governing Body</h3>
                <p class="text-xs text-gray-500">Add, edit, upload photos, or remove directors. Toggle individual visibility to control who appears on the public website.</p>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" onclick="removeAllDirectors()" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition">
                  <span>🗑️</span> Remove All Directors
                </button>
                <button type="button" onclick="addDirectorField()" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition">
                  <span>+</span> Add New Director
                </button>
              </div>
            </div>

            <div id="cms-directors-container" class="space-y-4">
              ${renderDirectorCards(dirs)}
            </div>
          </div>

          <!-- SECTION 4B: EXECUTIVE MEMBERS & HONORARY OFFICE BEARERS (SECTION 8) -->
          <div id="cms-section-executive" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
              <div>
                <h3 class="text-base font-bold text-[#0369a1]">👔 Executive Committee & Honorary Office Bearers (Section 8 Rules)</h3>
                <p class="text-xs text-gray-500">
                  Manage honorary leadership (Vice President, General Secretary, Treasurer, etc.). Under Section 8 of the Companies Act, 2013, all members serve in an <strong>Honorary Capacity without salary or remuneration</strong>.
                </p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button type="button" onclick="removeAllExecutives()" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition">
                  <span>🗑️</span> Remove All Members
                </button>
                <button type="button" onclick="addExecutiveField()" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition">
                  <span>+</span> Add Executive Member
                </button>
              </div>
            </div>

            <div id="cms-executive-container" class="space-y-4">
              ${renderExecutiveCards(execs)}
            </div>
          </div>

          <!-- SECTION 5: STATUTORY OBJECTIVES (Dynamic Array) -->
          <div id="cms-section-objectives" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs">
            <div class="border-b pb-3">
              <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                <span>📜</span> Approved Statutory Objectives & Key Categories
              </h3>
              <p class="text-xs text-gray-500">Edit, add, or delete statutory objectives and activity categories. Removed items will not reappear.</p>
            </div>

            <!-- Page Intro Text -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <label class="block font-semibold mb-1 text-gray-700">Objectives Page Introduction / Legal Mandate Line</label>
              <textarea name="objectives_intro_text" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600">${escapeHtml(s.objectives_intro_text || ('Approved under the Memorandum of Association of ' + (s.org_name || 'RI8WIN NOBEL PATH FOUNDATION') + ' as a Section 8 non-profit company.'))}</textarea>
            </div>

            <!-- Objectives List -->
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <span class="font-bold text-sm text-[#0369a1]">Statutory Objectives (Part 2A)</span>
                <button type="button" onclick="addObjectiveField()" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1">
                  <span>+</span> Add Objective
                </button>
              </div>
              <div id="cms-objectives-container" class="space-y-3">
                ${objs.map((obj, i) => `
                  <div class="cms-obj-item flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span class="obj-badge w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">${i + 1}</span>
                    <div class="flex-1">
                      <textarea class="cms-objective-input w-full p-2 rounded border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600 text-xs" rows="2">${escapeHtml(obj)}</textarea>
                    </div>
                    <button type="button" onclick="removeObjectiveField(this)" class="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs shrink-0 mt-1" title="Delete this objective">
                      🗑️ Remove
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Key Activity Categories Editor (Part 2B) -->
            <div class="pt-6 border-t border-gray-200 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-sm text-[#0369a1]">Key Activity Categories (Part 2B)</h4>
                  <p class="text-xs text-gray-500">Edit or add categories and their bullet points.</p>
                </div>
                <button type="button" onclick="addCategoryField()" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1">
                  <span>+</span> Add Category Card
                </button>
              </div>

              <div id="cms-categories-container" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${renderCategoryCards(categories)}
              </div>
            </div>
          </div>

          <!-- SECTION 6: THE NOBLE RI8 FRAMEWORK -->
          <div id="cms-section-ri8" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs">
            <h3 class="text-base font-bold text-[#0369a1] border-b pb-2">🧭 The Noble RI8 Framework Principles</h3>
            <p class="text-xs text-gray-500">Edit the 8 guiding principles and their applications in Education, Health, and Environment.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${ri8.map((p, idx) => `
                <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <div class="flex items-center justify-between border-b pb-2">
                    <span class="font-bold text-[#0369a1] text-sm">Principle #${idx + 1}</span>
                    <input type="text" id="ri8_title_${idx}" value="${escapeHtml(p.title)}" class="font-bold text-sm text-[#0369a1] p-1 rounded border border-gray-300 bg-white"/>
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-gray-600">Guiding Meaning</label>
                    <input type="text" id="ri8_sub_${idx}" value="${escapeHtml(p.subtitle)}" class="w-full p-2 rounded border border-gray-300 bg-white"/>
                  </div>
                  <div>
                    <label class="block font-semibold mb-0.5 text-sky-800">Education Application</label>
                    <input type="text" id="ri8_edu_${idx}" value="${escapeHtml(p.education)}" class="w-full p-1.5 rounded border border-gray-300 bg-white"/>
                  </div>
                  <div>
                    <label class="block font-semibold mb-0.5 text-sky-800">Health Application</label>
                    <input type="text" id="ri8_health_${idx}" value="${escapeHtml(p.health)}" class="w-full p-1.5 rounded border border-gray-300 bg-white"/>
                  </div>
                  <div>
                    <label class="block font-semibold mb-0.5 text-amber-800">Environment Application</label>
                    <input type="text" id="ri8_env_${idx}" value="${escapeHtml(p.environment)}" class="w-full p-1.5 rounded border border-gray-300 bg-white"/>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- SECTION 7: CORE VALUES (Dynamic Array) -->
          <div id="cms-section-values" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div class="flex items-center justify-between border-b pb-2">
              <div>
                <h3 class="text-base font-bold text-[#0369a1]">⭐ Organizational Core Values</h3>
                <p class="text-xs text-gray-500">Edit, add, or delete values. Removed items will not reappear.</p>
              </div>
              <button type="button" onclick="addValueField()" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1">
                <span>+</span> Add Core Value
              </button>
            </div>
            <div id="cms-values-container" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${coreVals.map((v, idx) => `
                <div class="cms-value-card p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <input type="text" class="cms-val-title font-bold text-gray-900 p-1.5 rounded border border-gray-300 bg-white w-full" value="${escapeHtml(v.title)}" placeholder="Value Title"/>
                    <button type="button" onclick="removeValueField(this)" class="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold text-xs shrink-0" title="Delete this value">
                      🗑️
                    </button>
                  </div>
                  <textarea class="cms-val-desc w-full p-1.5 rounded border border-gray-300 bg-white text-xs" rows="2" placeholder="Value Description">${escapeHtml(v.desc)}</textarea>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- SECTION 8: DONATIONS & PAYMENT GATEWAY -->
          <div id="cms-section-donations" class="cms-section-panel hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs">
            <div class="border-b pb-3">
              <h3 class="text-base font-bold text-[#0369a1] flex items-center gap-2">
                <span>💳</span> Section 8 Donation & Payment Gateway Configuration
              </h3>
              <p class="text-xs text-gray-500">Configure public donation acceptance, UPI payment VPA, official Indian Bank Account details for NEFT/RTGS, 80G tax benefit disclosures, and Razorpay API integration.</p>
            </div>

            <!-- Donation Enablement Toggle -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-bold text-gray-800 text-sm">Enable Public Donation Portal</div>
                  <div class="text-xs text-gray-500">When enabled, the "Donate Online" button appears in navbar and public donation page is active.</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="donation_enabled" ${s.donation_enabled !== false ? 'checked' : ''} class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0369a1]"></div>
                </label>
              </div>
            </div>

            <!-- UPI Payment Details -->
            <div class="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-3">
              <div class="font-bold text-sky-900 text-sm flex items-center gap-1.5">
                <span>📱</span> Official Direct UPI VPA (Generates Instant UPI QR Code on Donation Page)
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-semibold mb-1 text-gray-700">Official UPI ID / VPA</label>
                  <input type="text" name="donation_upi_id" value="${escapeHtml(s.donation_upi_id || 'ri8winnobelpath@upi')}" class="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono" placeholder="e.g. ri8winnobelpath@sbi or 8691016082@upi"/>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-gray-700">UPI Payee Display Name</label>
                  <input type="text" name="donation_account_name" value="${escapeHtml(s.donation_account_name || 'RI8WIN NOBEL PATH FOUNDATION')}" class="w-full p-2 rounded-lg border border-gray-300 bg-white font-semibold" placeholder="RI8WIN NOBEL PATH FOUNDATION"/>
                </div>
              </div>
            </div>

            <!-- Official Bank Account for Direct Transfer / NEFT / RTGS -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <span>🏦</span> Official Foundation Bank Account Details (Displayed for Direct Bank Transfers)
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-semibold mb-1 text-gray-700">Bank Name</label>
                  <input type="text" name="donation_bank_name" value="${escapeHtml(s.donation_bank_name || 'State Bank of India')}" class="w-full p-2 rounded-lg border border-gray-300 bg-white" placeholder="Bank Name"/>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-gray-700">Account Number</label>
                  <input type="text" name="donation_account_number" value="${escapeHtml(s.donation_account_number || '40291823901')}" class="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono" placeholder="Bank Account Number"/>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-gray-700">IFSC Code</label>
                  <input type="text" name="donation_ifsc" value="${escapeHtml(s.donation_ifsc || 'SBIN0012345')}" class="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono uppercase" placeholder="IFSC Code"/>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-gray-700">Branch Name</label>
                  <input type="text" name="donation_branch" value="${escapeHtml(s.donation_branch || 'Kalamboli / Navi Mumbai Branch')}" class="w-full p-2 rounded-lg border border-gray-300 bg-white" placeholder="Branch Name"/>
                </div>
              </div>
            </div>

            <!-- Razorpay Payment Gateway Integration -->
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <span>⚡</span> Razorpay Payment Gateway Integration
                  </div>
                  <div class="text-xs text-gray-500">Enable card payments, netbanking, and wallets via Razorpay. Leave disabled to use direct UPI QR & Bank NEFT only.</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="razorpay_enabled" ${s.razorpay_enabled ? 'checked' : ''} class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0369a1]"></div>
                </label>
              </div>
              <div>
                <label class="block font-semibold mb-1 text-gray-700">Razorpay Key ID (Public Key)</label>
                <input type="text" name="razorpay_key_id" value="${escapeHtml(s.razorpay_key_id || '')}" class="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono" placeholder="rzp_live_... or rzp_test_..."/>
              </div>
            </div>

            <!-- Statutory 80G Tax Benefit & Compliance Note -->
            <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div class="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                <span>📑</span> 80G Tax Exemption & Statutory Disclosure Note
              </div>
              <p class="text-xs text-amber-700">This text appears on the public donation page and on printed official 80G donation receipts.</p>
              <textarea name="donation_80g_note" rows="3" class="w-full p-2 rounded-lg border border-amber-300 bg-white text-xs">${escapeHtml(s.donation_80g_note || 'Donations to RI8WIN NOBEL PATH FOUNDATION are eligible for tax deduction under Section 80G of the Income Tax Act, 1961. PAN is mandatory for claiming 80G deduction. Receipts are automatically generated upon verification.')}</textarea>
            </div>
          </div>

          <!-- Bottom Action Bar -->
          <div class="flex items-center justify-between p-4 bg-stone-100 rounded-2xl border border-stone-200">
            <span class="text-xs text-gray-500">All modified information will be saved in the database and updated across the live website.</span>
            <button type="submit" class="px-8 py-3 rounded-xl bg-[#0369a1] hover:bg-sky-900 text-white font-bold text-xs shadow-md transition flex items-center gap-2">
              <span>💾</span> Save All Site Information & Disclosures
            </button>
          </div>
        </form>
      </div>
    `;

    // Activate default subtab
    switchCmsSubtab(activeCmsSubtab);

  } catch (e) {
    content.innerHTML = `<div class="text-red-500 py-6 text-xs">Error loading CMS editor: ${e.message}</div>`;
  }
}

// Dynamic Director Card Renderer
function renderDirectorCards(dirs) {
  if (!dirs || dirs.length === 0) {
    return `
      <div id="no-dir-placeholder" class="p-8 text-center text-gray-500 bg-sky-50/50 rounded-xl border border-dashed border-sky-300 space-y-2">
        <div class="text-3xl">👥</div>
        <div class="font-bold text-gray-800">No Directors Currently Added</div>
        <div class="text-xs text-gray-500">Currently zero directors configured. Click <strong>"+ Add New Director"</strong> above to add one, or click <strong>"Save All Site Information"</strong> to persist zero directors.</div>
      </div>
    `;
  }
  return dirs.map((d, idx) => `
    <div class="cms-director-card p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative">
      <div class="flex items-center justify-between border-b pb-2">
        <div class="flex items-center gap-2">
          <span class="dir-badge w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">${idx + 1}</span>
          <span class="font-bold text-sm text-[#0369a1]">Director / Governing Body Member</span>
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
            <input type="checkbox" class="dir-visible-chk" ${d.visible !== false ? 'checked' : ''} />
            <span class="font-medium">Visible on Website</span>
          </label>
          <button type="button" onclick="removeDirectorField(this)" class="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs flex items-center gap-1" title="Delete this director">
            🗑️ Remove
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Full Name *</label>
          <input type="text" class="dir-name w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(d.name || '')}" placeholder="Full Name" required/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Designation / Role</label>
          <input type="text" class="dir-role w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(d.role || '')}" placeholder="e.g. Director & Co-Founder"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Educational Background & Bio (Optional)</label>
          <input type="text" class="dir-qualification w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(d.qualification || '')}" placeholder="e.g. MA Economics, Early Childhood Educator"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Official Email (Optional)</label>
          <input type="text" class="dir-contact w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(d.contact || '')}" placeholder="email@example.com"/>
        </div>
        <div class="sm:col-span-2">
          <label class="block font-semibold mb-1 text-gray-700">Location / Residence (Optional)</label>
          <input type="text" class="dir-location w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(d.location || '')}" placeholder="e.g. Navi Mumbai, Maharashtra"/>
        </div>
      </div>

      <!-- Photo Upload & URL -->
      <div class="pt-2 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-4">
        <div class="w-16 h-16 rounded-full border-2 border-sky-600 overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
          <img class="dir-preview-img w-full h-full object-cover" src="${d.photo || '/assets/Shilpa Photo.jpg'}" onerror="this.src='/assets/Shilpa Photo.jpg'"/>
        </div>
        <div class="flex-1 w-full space-y-1">
          <label class="block text-[11px] font-semibold text-gray-600">Director Photograph (Upload file or enter URL)</label>
          <div class="flex gap-2">
            <input type="text" class="dir-photo w-full p-1.5 text-xs rounded border border-gray-300 bg-white" value="${escapeHtml(d.photo || '')}" placeholder="/uploads/... or https://..." oninput="updateDirectorPreview(this)"/>
            <label class="cursor-pointer px-3 py-1.5 rounded bg-[#0369a1] hover:bg-sky-900 text-white font-semibold text-xs shrink-0 flex items-center gap-1">
              <span>📷 Upload</span>
              <input type="file" accept="image/*" class="hidden" onchange="uploadDirectorCardPhoto(this)"/>
            </label>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function addDirectorField(data = {}) {
  const container = document.getElementById('cms-directors-container');
  if (!container) return;
  const placeholder = container.querySelector('#no-dir-placeholder, .border-dashed');
  if (placeholder) placeholder.remove();
  const count = container.querySelectorAll('.cms-director-card').length + 1;
  const div = document.createElement('div');
  div.className = 'cms-director-card p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative animate-fadeIn';
  div.innerHTML = `
    <div class="flex items-center justify-between border-b pb-2">
      <div class="flex items-center gap-2">
        <span class="dir-badge w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">${count}</span>
        <span class="font-bold text-sm text-[#0369a1]">Director / Governing Body Member</span>
      </div>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
          <input type="checkbox" class="dir-visible-chk" checked />
          <span class="font-medium">Visible on Website</span>
        </label>
        <button type="button" onclick="removeDirectorField(this)" class="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs flex items-center gap-1" title="Delete this director">
          🗑️ Remove
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Full Name *</label>
        <input type="text" class="dir-name w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(data.name || '')}" placeholder="Full Name" required/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Designation / Role</label>
        <input type="text" class="dir-role w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(data.role || '')}" placeholder="e.g. Director & Co-Founder"/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Educational Background & Bio (Optional)</label>
        <input type="text" class="dir-qualification w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(data.qualification || '')}" placeholder="Bio / Qualification"/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Official Email (Optional)</label>
        <input type="text" class="dir-contact w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(data.contact || '')}" placeholder="email@example.com"/>
      </div>
      <div class="sm:col-span-2">
        <label class="block font-semibold mb-1 text-gray-700">Location / Residence (Optional)</label>
        <input type="text" class="dir-location w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(data.location || '')}" placeholder="e.g. City, State"/>
      </div>
    </div>

    <div class="pt-2 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-4">
      <div class="w-16 h-16 rounded-full border-2 border-sky-600 overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
        <img class="dir-preview-img w-full h-full object-cover" src="${data.photo || '/assets/Shilpa Photo.jpg'}" onerror="this.src='/assets/Shilpa Photo.jpg'"/>
      </div>
      <div class="flex-1 w-full space-y-1">
        <label class="block text-[11px] font-semibold text-gray-600">Director Photograph (Upload file or enter URL)</label>
        <div class="flex gap-2">
          <input type="text" class="dir-photo w-full p-1.5 text-xs rounded border border-gray-300 bg-white" value="${escapeHtml(data.photo || '')}" placeholder="/uploads/... or https://..." oninput="updateDirectorPreview(this)"/>
          <label class="cursor-pointer px-3 py-1.5 rounded bg-[#0369a1] hover:bg-sky-900 text-white font-semibold text-xs shrink-0 flex items-center gap-1">
            <span>📷 Upload</span>
            <input type="file" accept="image/*" class="hidden" onchange="uploadDirectorCardPhoto(this)"/>
          </label>
        </div>
      </div>
    </div>
  `;
  container.appendChild(div);
  renumberDirectors();
}

function removeDirectorField(btn) {
  if (!confirm('Are you sure you want to remove this director?')) return;
  const card = btn.closest('.cms-director-card');
  if (card) {
    const container = card.parentElement;
    card.remove();
    renumberDirectors();
    if (container && container.querySelectorAll('.cms-director-card').length === 0) {
      container.innerHTML = renderDirectorCards([]);
    }
  }
}

function removeAllDirectors() {
  if (!confirm('Are you sure you want to remove ALL directors? This will clear the board of directors. Click "Save All Site Information" afterwards to apply this change.')) return;
  const container = document.getElementById('cms-directors-container');
  if (container) {
    container.innerHTML = renderDirectorCards([]);
    showToast('All directors removed. Click "Save All Site Information" to save!', 'info');
  }
}

function renumberDirectors() {
  const container = document.getElementById('cms-directors-container');
  if (!container) return;
  const badges = container.querySelectorAll('.dir-badge');
  badges.forEach((b, idx) => {
    b.textContent = idx + 1;
  });
}

function addObjectiveField(text = '') {
  const container = document.getElementById('cms-objectives-container');
  if (!container) return;
  const count = container.querySelectorAll('.cms-obj-item').length + 1;
  const div = document.createElement('div');
  div.className = 'cms-obj-item flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 animate-fadeIn';
  div.innerHTML = `
    <span class="obj-badge w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">${count}</span>
    <div class="flex-1">
      <textarea class="cms-objective-input w-full p-2 rounded border border-gray-300 bg-white focus:ring-2 focus:ring-sky-600 text-xs" rows="2" placeholder="Enter objective statement...">${escapeHtml(text)}</textarea>
    </div>
    <button type="button" onclick="removeObjectiveField(this)" class="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs shrink-0 mt-1" title="Delete this objective">
      🗑️ Remove
    </button>
  `;
  container.appendChild(div);
  renumberObjectives();
}

function removeObjectiveField(btn) {
  const item = btn.closest('.cms-obj-item');
  if (item) {
    item.remove();
    renumberObjectives();
  }
}

function renumberObjectives() {
  const container = document.getElementById('cms-objectives-container');
  if (!container) return;
  const badges = container.querySelectorAll('.obj-badge');
  badges.forEach((b, idx) => {
    b.textContent = idx + 1;
  });
}

function addValueField(title = '', desc = '') {
  const container = document.getElementById('cms-values-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'cms-value-card p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2 animate-fadeIn';
  div.innerHTML = `
    <div class="flex items-center justify-between gap-2">
      <input type="text" class="cms-val-title font-bold text-gray-900 p-1.5 rounded border border-gray-300 bg-white w-full" value="${escapeHtml(title)}" placeholder="Value Title"/>
      <button type="button" onclick="removeValueField(this)" class="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold text-xs shrink-0" title="Delete this value">
        🗑️
      </button>
    </div>
    <textarea class="cms-val-desc w-full p-1.5 rounded border border-gray-300 bg-white text-xs" rows="2" placeholder="Value Description">${escapeHtml(desc)}</textarea>
  `;
  container.appendChild(div);
}

function removeValueField(btn) {
  const card = btn.closest('.cms-value-card');
  if (card) card.remove();
}

// Dynamic Ground Activity Cards (Home Page)
function renderActivityCards(acts) {
  if (!acts || acts.length === 0) {
    return `
      <div id="no-act-placeholder" class="p-8 text-center text-gray-500 bg-sky-50/50 rounded-xl border border-dashed border-sky-300 space-y-2">
        <div class="text-3xl">🏕️</div>
        <div class="font-bold text-gray-800">No Ground Activities Configured</div>
        <div class="text-xs text-gray-500">Click <strong>"+ Add Activity Card"</strong> to showcase your community programs with AI or camera photos.</div>
      </div>
    `;
  }
  return acts.map((a, idx) => `
    <div class="cms-activity-card p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative">
      <div class="flex items-center justify-between border-b pb-2">
        <div class="flex items-center gap-2">
          <span class="act-badge w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">${idx + 1}</span>
          <span class="font-bold text-sm text-[#0369a1]">Activity / Ground Program #${idx + 1}</span>
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
            <input type="checkbox" class="act-visible-chk" ${a.visible !== false ? 'checked' : ''} />
            <span class="font-medium">Visible on Home Page</span>
          </label>
          <button type="button" onclick="removeActivityField(this)" class="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs flex items-center gap-1">
            🗑️ Remove
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Activity Title *</label>
          <input type="text" class="act-title w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(a.title || '')}" placeholder="e.g. Childhood Digital Literacy & Mentorship" required/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Category Tag</label>
          <input type="text" class="act-category w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(a.category || '')}" placeholder="e.g. Education & Youth"/>
        </div>
        <div class="sm:col-span-2">
          <label class="block font-semibold mb-1 text-gray-700">Description Narrative</label>
          <textarea class="act-description w-full p-2 rounded border border-gray-300 bg-white text-xs" rows="2" placeholder="Summary of what the foundation achieved in this activity...">${escapeHtml(a.description || '')}</textarea>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Action Button Link (Optional)</label>
          <input type="text" class="act-link w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(a.link || '#programs')}" placeholder="#programs or #events"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Button Label</label>
          <input type="text" class="act-link-text w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(a.link_text || 'Explore Initiative →')}" placeholder="e.g. Explore Initiative →"/>
        </div>
      </div>

      <!-- Photo Upload & URL -->
      <div class="pt-2 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-4">
        <div class="w-24 h-16 rounded-lg border border-sky-300 overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
          <img class="act-preview-img w-full h-full object-cover" src="${a.image || '/assets/activity_education.jpg'}" onerror="this.src='/assets/Banner.png'"/>
        </div>
        <div class="flex-1 w-full space-y-1">
          <label class="block text-[11px] font-semibold text-gray-600">Activity Image (AI Photo / Ground Photo URL or Upload)</label>
          <div class="flex gap-2">
            <input type="text" class="act-image w-full p-1.5 text-xs rounded border border-gray-300 bg-white" value="${escapeHtml(a.image || '')}" placeholder="/assets/... or /uploads/... or https://..." oninput="updateActivityPreview(this)"/>
            <label class="cursor-pointer px-3 py-1.5 rounded bg-[#0369a1] hover:bg-sky-900 text-white font-semibold text-xs shrink-0 flex items-center gap-1">
              <span>📷 Upload</span>
              <input type="file" accept="image/*" class="hidden" onchange="uploadActivityCardPhoto(this)"/>
            </label>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function addActivityField(data = {}) {
  const container = document.getElementById('cms-activities-container');
  if (!container) return;
  const placeholder = container.querySelector('#no-act-placeholder');
  if (placeholder) placeholder.remove();
  const count = container.querySelectorAll('.cms-activity-card').length + 1;
  const div = document.createElement('div');
  div.className = 'cms-activity-card p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative animate-fadeIn';
  div.innerHTML = `
    <div class="flex items-center justify-between border-b pb-2">
      <div class="flex items-center gap-2">
        <span class="act-badge w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">${count}</span>
        <span class="font-bold text-sm text-[#0369a1]">Activity / Ground Program #${count}</span>
      </div>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
          <input type="checkbox" class="act-visible-chk" checked />
          <span class="font-medium">Visible on Home Page</span>
        </label>
        <button type="button" onclick="removeActivityField(this)" class="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs flex items-center gap-1">
          🗑️ Remove
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Activity Title *</label>
        <input type="text" class="act-title w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(data.title || '')}" placeholder="e.g. Activity Name" required/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Category Tag</label>
        <input type="text" class="act-category w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(data.category || '')}" placeholder="e.g. Outreach Category"/>
      </div>
      <div class="sm:col-span-2">
        <label class="block font-semibold mb-1 text-gray-700">Description Narrative</label>
        <textarea class="act-description w-full p-2 rounded border border-gray-300 bg-white text-xs" rows="2" placeholder="Summary of what the foundation achieved in this activity...">${escapeHtml(data.description || '')}</textarea>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Action Button Link (Optional)</label>
        <input type="text" class="act-link w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(data.link || '#programs')}" placeholder="#programs or #events"/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Button Label</label>
        <input type="text" class="act-link-text w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(data.link_text || 'Explore Initiative →')}" placeholder="e.g. Explore Initiative →"/>
      </div>
    </div>

    <div class="pt-2 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-4">
      <div class="w-24 h-16 rounded-lg border border-sky-300 overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
        <img class="act-preview-img w-full h-full object-cover" src="${data.image || '/assets/activity_education.jpg'}" onerror="this.src='/assets/Banner.png'"/>
      </div>
      <div class="flex-1 w-full space-y-1">
        <label class="block text-[11px] font-semibold text-gray-600">Activity Image (AI Photo / Ground Photo URL or Upload)</label>
        <div class="flex gap-2">
          <input type="text" class="act-image w-full p-1.5 text-xs rounded border border-gray-300 bg-white" value="${escapeHtml(data.image || '')}" placeholder="/assets/... or /uploads/... or https://..." oninput="updateActivityPreview(this)"/>
          <label class="cursor-pointer px-3 py-1.5 rounded bg-[#0369a1] hover:bg-sky-900 text-white font-semibold text-xs shrink-0 flex items-center gap-1">
            <span>📷 Upload</span>
            <input type="file" accept="image/*" class="hidden" onchange="uploadActivityCardPhoto(this)"/>
          </label>
        </div>
      </div>
    </div>
  `;
  container.appendChild(div);
  renumberActivities();
}

function removeActivityField(btn) {
  if (!confirm('Are you sure you want to remove this activity card?')) return;
  const card = btn.closest('.cms-activity-card');
  if (card) {
    const container = card.parentElement;
    card.remove();
    renumberActivities();
    if (container && container.querySelectorAll('.cms-activity-card').length === 0) {
      container.innerHTML = renderActivityCards([]);
    }
  }
}

function removeAllActivities() {
  if (!confirm('Are you sure you want to remove ALL activity cards? This will clear the activities section. Click "Save All Site Information" afterwards to apply this change.')) return;
  const container = document.getElementById('cms-activities-container');
  if (container) {
    container.innerHTML = renderActivityCards([]);
    showToast('All activities removed. Click "Save All Site Information" to save!', 'info');
  }
}

function renumberActivities() {
  const container = document.getElementById('cms-activities-container');
  if (!container) return;
  const badges = container.querySelectorAll('.act-badge');
  badges.forEach((b, idx) => {
    b.textContent = idx + 1;
  });
}

function updateActivityPreview(input) {
  const card = input.closest('.cms-activity-card');
  if (!card) return;
  const img = card.querySelector('.act-preview-img');
  if (img) img.src = input.value.trim() || '/assets/activity_education.jpg';
}

async function uploadActivityCardPhoto(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  const card = fileInput.closest('.cms-activity-card');
  if (!card) return;
  const textInput = card.querySelector('.act-image');
  const previewImg = card.querySelector('.act-preview-img');

  const formData = new FormData();
  formData.append('image', file);
  formData.append('target', 'activity');

  try {
    const res = await fetch('/api/settings/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API.token || localStorage.getItem('ri8_auth_token') || ''}`
      },
      body: formData
    });
    const data = await res.json();
    if (data.success && data.url) {
      if (textInput) textInput.value = data.url;
      if (previewImg) previewImg.src = data.url;
      showToast('Activity photo uploaded successfully!', 'success');
    } else {
      showToast(data.message || 'Photo upload failed', 'error');
    }
  } catch (err) {
    showToast('Failed to upload image: ' + err.message, 'error');
  }
}

function renderCategoryCards(cats) {
  if (!cats || cats.length === 0) {
    return `<div class="p-6 text-center text-gray-500 bg-stone-50 rounded-xl border border-dashed border-gray-300 col-span-2">No categories configured. Click "+ Add Category Card" above to create one.</div>`;
  }
  return cats.map((cat, idx) => `
    <div class="cms-category-card p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative">
      <div class="flex items-center justify-between border-b pb-2">
        <span class="font-bold text-sm text-[#0369a1]">Category #${idx + 1}</span>
        <button type="button" onclick="removeCategoryField(this)" class="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold text-xs shrink-0" title="Delete category">
          🗑️
        </button>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Category Title *</label>
        <input type="text" class="cat-title w-full p-2 rounded border border-gray-300 bg-white font-bold" value="${escapeHtml(cat.title || '')}" placeholder="e.g. Education and Youth" required/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Bullet Points (One per line)</label>
        <textarea class="cat-points w-full p-2 rounded border border-gray-300 bg-white text-xs font-mono" rows="4" placeholder="Enter each bullet point on a new line...">${(cat.points || []).map(p => escapeHtml(p)).join('\n')}</textarea>
      </div>
    </div>
  `).join('');
}

function addCategoryField(data = {}) {
  const container = document.getElementById('cms-categories-container');
  if (!container) return;
  const count = container.querySelectorAll('.cms-category-card').length + 1;
  const div = document.createElement('div');
  div.className = 'cms-category-card p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative animate-fadeIn';
  div.innerHTML = `
    <div class="flex items-center justify-between border-b pb-2">
      <span class="font-bold text-sm text-[#0369a1]">Category #${count}</span>
      <button type="button" onclick="removeCategoryField(this)" class="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold text-xs shrink-0" title="Delete category">
        🗑️
      </button>
    </div>
    <div>
      <label class="block font-semibold mb-1 text-gray-700">Category Title *</label>
      <input type="text" class="cat-title w-full p-2 rounded border border-gray-300 bg-white font-bold" value="${escapeHtml(data.title || '')}" placeholder="e.g. Category Name" required/>
    </div>
    <div>
      <label class="block font-semibold mb-1 text-gray-700">Bullet Points (One per line)</label>
      <textarea class="cat-points w-full p-2 rounded border border-gray-300 bg-white text-xs font-mono" rows="4" placeholder="Enter each bullet point on a new line...">${(data.points || []).map(p => escapeHtml(p)).join('\n')}</textarea>
    </div>
  `;
  container.appendChild(div);
}

function removeCategoryField(btn) {
  const card = btn.closest('.cms-category-card');
  if (card) card.remove();
}

async function handleSettingsUpdate(e) {
  e.preventDefault();
  const form = document.getElementById('full-site-cms-form');
  if (!form) return;

  const getVal = (name, fallback = '') => {
    const el = form.elements[name];
    if (!el) return fallback;
    if (el instanceof RadioNodeList || (el.length !== undefined && !el.tagName)) {
      for (let i = 0; i < el.length; i++) {
        if (el[i].value && el[i].value.trim() !== '') return el[i].value.trim();
      }
      return el[0]?.value ? el[0].value.trim() : fallback;
    }
    return el.value !== undefined ? el.value.trim() : fallback;
  };

  const getChk = (name, fallback = true) => {
    const el = form.elements[name];
    if (!el) return fallback;
    if (el instanceof RadioNodeList || (el.length !== undefined && !el.tagName)) {
      for (let i = 0; i < el.length; i++) {
        if (el[i].checked !== undefined) return el[i].checked;
      }
      return fallback;
    }
    return el.checked !== undefined ? el.checked : fallback;
  };

  // 1. Collect standard inputs
  const updates = {
    org_name: getVal('org_name', 'RI8WIN NOBEL PATH FOUNDATION'),
    org_meaning: getVal('org_meaning', 'Ri8NoblePath - Right Noble Path'),
    legal_structure: getVal('legal_structure', 'Section 8 Company under the Companies Act, 2013, India (Non-Profit, Non-Religious, Non-Political)'),
    cin: getVal('cin', 'U88900MH2026NPL481549'),
    pan: getVal('pan', 'AAQCR4085D'),
    tan: getVal('tan', 'PNER43317B'),
    date_of_incorporation: getVal('date_of_incorporation', '06 October 2026'),
    approving_authority: getVal('approving_authority', 'Ministry of Corporate Affairs, Central Registration Centre, Government of India'),
    area_of_operation: getVal('area_of_operation', 'PAN-India'),
    registered_office: getVal('registered_office', 'The Springs 2, 701, Plot No 15, Sector 20, Roadpali, Kalamboli, Navi Mumbai, Maharashtra - 410218, India'),
    official_email: getVal('official_email', 'contact@ri8winnobelpath.org'),
    official_phone: getVal('official_phone', '+91 8691016082'),
    vision: getVal('vision'),
    mission: getVal('mission'),
    funds_utilization: getVal('funds_utilization'),

    // Field-level public visibility toggles
    show_cin: getChk('show_cin', true),
    show_pan: getChk('show_pan', true),
    show_tan: getChk('show_tan', true),
    show_date_of_incorporation: getChk('show_date_of_incorporation', true),
    show_approving_authority: getChk('show_approving_authority', true),
    show_legal_structure: getChk('show_legal_structure', true),
    show_area_of_operation: getChk('show_area_of_operation', true),
    show_registered_office: getChk('show_registered_office', true),
    show_official_email: getChk('show_official_email', true),
    show_official_phone: getChk('show_official_phone', true),
    show_vision: getChk('show_vision', true),
    show_mission: getChk('show_mission', true),
    show_funds_utilization: getChk('show_funds_utilization', true)
  };

  // Header & Footer
  if (form.elements['logo_badge_text']) updates.logo_badge_text = getVal('logo_badge_text');
  if (form.elements['header_tagline']) updates.header_tagline = getVal('header_tagline');
  if (form.elements['footer_summary']) updates.footer_summary = getVal('footer_summary');
  if (form.elements['footer_copyright']) updates.footer_copyright = getVal('footer_copyright');

  // Metrics
  if (form.elements['metric_volunteers']) updates.metric_volunteers = getVal('metric_volunteers');
  if (form.elements['metric_villages']) updates.metric_villages = getVal('metric_villages');
  if (form.elements['metric_beneficiaries']) updates.metric_beneficiaries = getVal('metric_beneficiaries');
  if (form.elements['metric_trees']) updates.metric_trees = getVal('metric_trees');

  // Ground Activities
  if (form.elements['home_activities_heading']) updates.home_activities_heading = getVal('home_activities_heading');
  if (form.elements['home_activities_subheading']) updates.home_activities_subheading = getVal('home_activities_subheading');
  const actCards = document.querySelectorAll('.cms-activity-card');
  updates.home_activities = Array.from(actCards).map((card, i) => ({
    id: i + 1,
    title: card.querySelector('.act-title')?.value.trim() || '',
    category: card.querySelector('.act-category')?.value.trim() || '',
    description: card.querySelector('.act-description')?.value.trim() || '',
    image: card.querySelector('.act-image')?.value.trim() || '',
    link: card.querySelector('.act-link')?.value.trim() || '',
    link_text: card.querySelector('.act-link-text')?.value.trim() || 'Explore Initiative →',
    visible: card.querySelector('.act-visible-chk') ? card.querySelector('.act-visible-chk').checked : true
  })).filter(a => a.title);

  // Objectives Page Content
  if (form.objectives_intro_text) updates.objectives_intro_text = form.objectives_intro_text.value.trim();
  const catCards = document.querySelectorAll('.cms-category-card');
  updates.objectives_activity_categories = Array.from(catCards).map(card => {
    const title = card.querySelector('.cat-title')?.value.trim() || '';
    const pointsRaw = card.querySelector('.cat-points')?.value || '';
    const points = pointsRaw.split('\n').map(p => p.trim()).filter(Boolean);
    return { title, points };
  }).filter(c => c.title);

  // 2. Collect All Objectives dynamically
  const objInputs = document.querySelectorAll('.cms-objective-input');
  updates.statutory_objectives = Array.from(objInputs).map(el => el.value.trim()).filter(Boolean);

  // 3. Collect 8 RI8 Framework Principles
  const ri8List = [];
  for (let i = 0; i < 8; i++) {
    const title = document.getElementById(`ri8_title_${i}`)?.value.trim() || '';
    const sub = document.getElementById(`ri8_sub_${i}`)?.value.trim() || '';
    const edu = document.getElementById(`ri8_edu_${i}`)?.value.trim() || '';
    const health = document.getElementById(`ri8_health_${i}`)?.value.trim() || '';
    const env = document.getElementById(`ri8_env_${i}`)?.value.trim() || '';
    ri8List.push({ id: i + 1, title, subtitle: sub, education: edu, health, environment: env });
  }
  updates.ri8_framework = ri8List;

  // 4. Collect Directors dynamically from .cms-director-card elements
  const dirCards = document.querySelectorAll('.cms-director-card');
  const governingBody = Array.from(dirCards).map(card => ({
    name: card.querySelector('.dir-name')?.value.trim() || '',
    role: card.querySelector('.dir-role')?.value.trim() || '',
    qualification: card.querySelector('.dir-qualification')?.value.trim() || '',
    contact: card.querySelector('.dir-contact')?.value.trim() || '',
    location: card.querySelector('.dir-location')?.value.trim() || '',
    photo: card.querySelector('.dir-photo')?.value.trim() || '',
    visible: card.querySelector('.dir-visible-chk') ? card.querySelector('.dir-visible-chk').checked : true
  })).filter(d => d.name);
  updates.governing_body = governingBody;

  // 4B. Collect Executive Members dynamically from .cms-executive-card elements
  const execCards = document.querySelectorAll('.cms-executive-card');
  const executiveMembers = Array.from(execCards).map(card => ({
    name: card.querySelector('.exec-name')?.value.trim() || '',
    role: card.querySelector('.exec-role')?.value.trim() || '',
    category: card.querySelector('.exec-category')?.value.trim() || 'Executive Office Bearer',
    qualification: card.querySelector('.exec-qualification')?.value.trim() || '',
    contact: card.querySelector('.exec-contact')?.value.trim() || '',
    location: card.querySelector('.exec-location')?.value.trim() || '',
    appointment_date: card.querySelector('.exec-appointment-date')?.value.trim() || '06 October 2026',
    membership_id: card.querySelector('.exec-membership-id')?.value.trim() || ('RI8-EXEC-2026-' + Math.floor(1000 + Math.random() * 9000)),
    certificate_number: card.querySelector('.exec-cert-number')?.value.trim() || ('CERT-HON-RI8-2026-' + Math.floor(1000 + Math.random() * 9000)),
    photo: card.querySelector('.exec-photo')?.value.trim() || '',
    honorary_terms: card.querySelector('.exec-honorary-terms')?.value.trim() || 'Honorary Office Bearer • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.',
    visible: card.querySelector('.exec-visible-chk') ? card.querySelector('.exec-visible-chk').checked : true
  })).filter(m => m.name);
  updates.executive_members = executiveMembers;

  // 5. Collect Core Values dynamically
  const valCards = document.querySelectorAll('.cms-value-card');
  updates.core_values = Array.from(valCards).map(c => ({
    title: c.querySelector('.cms-val-title')?.value.trim() || '',
    desc: c.querySelector('.cms-val-desc')?.value.trim() || ''
  })).filter(v => v.title);

  // 6. Collect Policies & Terms
  if (form.elements['volunteer_guidelines']) updates.volunteer_guidelines = form.elements['volunteer_guidelines'].value;
  if (form.elements['privacy_policy']) updates.privacy_policy = form.elements['privacy_policy'].value;
  if (form.elements['terms_of_use']) updates.terms_of_use = form.elements['terms_of_use'].value;

  // 7. Collect Page Copy
  if (form.elements['home_hero_title']) updates.home_hero_title = getVal('home_hero_title');
  if (form.elements['home_hero_subtitle']) updates.home_hero_subtitle = getVal('home_hero_subtitle');
  if (form.elements['about_intro_text']) updates.about_intro_text = getVal('about_intro_text');
  if (form.elements['about_history_text']) updates.about_history_text = getVal('about_history_text');
  if (form.elements['about_statutory_text']) updates.about_statutory_text = getVal('about_statutory_text');
  if (form.elements['contact_page_heading']) updates.contact_page_heading = getVal('contact_page_heading');
  if (form.elements['contact_page_subheading']) updates.contact_page_subheading = getVal('contact_page_subheading');
  if (form.elements['contact_office_hours']) updates.contact_office_hours = getVal('contact_office_hours');
  if (form.elements['contact_inquiry_instructions']) updates.contact_inquiry_instructions = getVal('contact_inquiry_instructions');

  // 8. Collect Verification, Registration, & Transparency
  if (form.elements['verify_page_title']) updates.verify_page_title = getVal('verify_page_title');
  if (form.elements['verify_page_subtitle']) updates.verify_page_subtitle = getVal('verify_page_subtitle');
  if (form.elements['verify_page_note']) updates.verify_page_note = getVal('verify_page_note');
  if (form.elements['volunteer_reg_title']) updates.volunteer_reg_title = getVal('volunteer_reg_title');
  if (form.elements['volunteer_reg_subtitle']) updates.volunteer_reg_subtitle = getVal('volunteer_reg_subtitle');
  if (form.elements['transparency_additional_disclosures']) updates.transparency_additional_disclosures = getVal('transparency_additional_disclosures');

  // 9. Collect Brand Logo, Hero Visual & Section 8 Donation Gateway
  if (form.elements['logo_url']) updates.logo_url = getVal('logo_url');
  if (form.elements['hero_image_url']) updates.hero_image_url = getVal('hero_image_url');
  if (form.elements['donation_enabled']) updates.donation_enabled = getChk('donation_enabled', true);
  if (form.elements['donation_upi_id']) updates.donation_upi_id = getVal('donation_upi_id');
  if (form.elements['donation_account_name']) updates.donation_account_name = getVal('donation_account_name');
  if (form.elements['donation_bank_name']) updates.donation_bank_name = getVal('donation_bank_name');
  if (form.elements['donation_account_number']) updates.donation_account_number = getVal('donation_account_number');
  if (form.elements['donation_ifsc']) updates.donation_ifsc = getVal('donation_ifsc');
  if (form.elements['donation_branch']) updates.donation_branch = getVal('donation_branch');
  if (form.elements['razorpay_enabled']) updates.razorpay_enabled = getChk('razorpay_enabled', false);
  if (form.elements['razorpay_key_id']) updates.razorpay_key_id = getVal('razorpay_key_id');
  if (form.elements['donation_80g_note']) updates.donation_80g_note = getVal('donation_80g_note');

  try {
    const res = await API.updateSettings(updates);
    if (res.success) {
      showToast('All website content and disclosures saved successfully!', 'success');
      // Force fresh settings from database into state
      const freshRes = await API.getSettings();
      if (freshRes.success) {
        AppState.settings = freshRes.settings;
      }
      updateHeaderUI(AppState.settings);
      renderFooter(AppState.settings);
      // Re-render current CMS tab
      await loadAdminSettingsTab();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}


// Admin Audit Trail Tab
async function loadAdminAuditTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  try {
    const res = await API.getAuditLogs();
    const logs = res.logs || [];

    content.innerHTML = `
      <div class="space-y-4">
        <h3 class="font-bold text-base text-[#0369a1]">Administrative Audit Trail</h3>
        <p class="text-xs text-gray-500">Immutable chronological record of administrative actions, verifications, approvals, and certificate changes.</p>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-700">
              <thead class="bg-stone-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
                <tr>
                  <th class="p-3">Timestamp</th>
                  <th class="p-3">Action</th>
                  <th class="p-3">Actor</th>
                  <th class="p-3">Target</th>
                  <th class="p-3">Details</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${logs.map(l => `
                  <tr>
                    <td class="p-3 font-mono text-[11px] text-gray-500">${l.created_at}</td>
                    <td class="p-3 font-semibold text-sky-800">${l.action}</td>
                    <td class="p-3">${l.actor_name} (${l.actor_role})</td>
                    <td class="p-3 font-mono text-[11px]">${l.target_type} #${l.target_id}</td>
                    <td class="p-3 text-gray-600 max-w-xs truncate">${l.details}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<div class="text-red-500 py-6 text-xs">Error loading audit logs: ${e.message}</div>`;
  }
}

// -------------------------------------------------------------
// MODALS AND AUTH
// -------------------------------------------------------------

// -------------------------------------------------------------
// MODALS AND AUTH (Enhanced Multi-Portal System)
// -------------------------------------------------------------

function openAuthModal(mode = 'volunteer', defaultRef = '') {
  const modal = document.getElementById('auth-modal');
  const modalContent = document.getElementById('auth-modal-content');
  if (!modal || !modalContent) return;

  // Normalize mode
  let activeTab = mode === 'login' ? 'volunteer' : mode;

  renderAuthModalContent(activeTab, defaultRef);
  modal.classList.remove('hidden');
}

function renderAuthModalContent(activeTab = 'volunteer', defaultRef = '') {
  const modalContent = document.getElementById('auth-modal-content');
  if (!modalContent) return;

  if (activeTab === 'track') {
    modalContent.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔍</span>
            <h3 class="font-bold text-base text-[#0369a1]">Track Application Status</h3>
          </div>
          <button onclick="closeAuthModal()" class="text-xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
        </div>

        <!-- Portal Tabs -->
        <div class="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold text-gray-600">
          <button type="button" onclick="renderAuthModalContent('volunteer')" class="py-1.5 rounded-lg text-center hover:bg-white transition">👤 Volunteer</button>
          <button type="button" onclick="renderAuthModalContent('member')" class="py-1.5 rounded-lg text-center hover:bg-white transition">👔 Member</button>
          <button type="button" onclick="renderAuthModalContent('admin')" class="py-1.5 rounded-lg text-center hover:bg-white transition">🔐 Admin</button>
          <button type="button" class="py-1.5 rounded-lg text-center bg-white text-sky-900 shadow-xs font-bold">🔍 Track</button>
        </div>

        <form onsubmit="handleTrackStatusSubmit(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1 text-gray-700">Application Reference Number *</label>
            <input type="text" name="application_ref" value="${escapeHtml(defaultRef)}" required placeholder="e.g. APP-2026-00001" class="w-full p-2.5 rounded-lg border border-gray-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-600"/>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-gray-700">Registered Email Address *</label>
            <input type="email" name="email" required placeholder="Email used during registration" class="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600"/>
          </div>
          <button type="submit" class="w-full py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow transition">
            Check Status Online &rarr;
          </button>
        </form>
        <div id="track-result-box" class="pt-2"></div>
      </div>
    `;
    return;
  }

  // Auth logins config
  const tabConfigs = {
    volunteer: {
      title: 'Volunteer / Applicant Sign In',
      icon: '👤',
      sub: 'Access membership credentials, RSVP for drives, and view certificate.',
      defaultEmail: 'aarav.sharma@example.com',
      defaultPass: 'Volunteer@2026!',
      demoRole: 'Aarav Sharma (Verified Volunteer)'
    },
    member: {
      title: 'Honorary Member & Staff Sign In',
      icon: '👔',
      sub: 'Dedicated portal for Executive Committee & Honorary Officers (Sec. 8 Rules).',
      defaultEmail: 'member@ri8win.org',
      defaultPass: 'Member@RI8Win2026!',
      demoRole: 'Dr. Rameshwar Deshmukh (Vice President)'
    },
    admin: {
      title: 'Director & Administrator Sign In',
      icon: '🔐',
      sub: 'Restricted to super administrators and authorized NGO verifiers.',
      defaultEmail: 'admin@ri8win.org',
      defaultPass: 'Admin@RI8Win2026!',
      demoRole: 'Super Administrator'
    }
  };

  const curr = tabConfigs[activeTab] || tabConfigs.volunteer;

  modalContent.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">${curr.icon}</span>
          <div>
            <h3 class="font-bold text-base text-[#0369a1] leading-tight">${curr.title}</h3>
            <p class="text-[11px] text-gray-500">${curr.sub}</p>
          </div>
        </div>
        <button onclick="closeAuthModal()" class="text-xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
      </div>

      <!-- Portal Tabs -->
      <div class="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold text-gray-600">
        <button type="button" onclick="renderAuthModalContent('volunteer')" class="py-1.5 rounded-lg text-center transition ${activeTab === 'volunteer' ? 'bg-white text-sky-900 shadow-xs font-bold' : 'hover:bg-white'}">👤 Volunteer</button>
        <button type="button" onclick="renderAuthModalContent('member')" class="py-1.5 rounded-lg text-center transition ${activeTab === 'member' ? 'bg-white text-sky-900 shadow-xs font-bold' : 'hover:bg-white'}">👔 Member</button>
        <button type="button" onclick="renderAuthModalContent('admin')" class="py-1.5 rounded-lg text-center transition ${activeTab === 'admin' ? 'bg-white text-sky-900 shadow-xs font-bold' : 'hover:bg-white'}">🔐 Admin</button>
        <button type="button" onclick="renderAuthModalContent('track')" class="py-1.5 rounded-lg text-center transition hover:bg-white">🔍 Track</button>
      </div>

      <form id="auth-login-form" onsubmit="handleLoginSubmit(event)" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Email Address *</label>
          <input type="email" name="email" value="${escapeHtml(curr.defaultEmail)}" required placeholder="Registered email address" class="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 bg-white"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Password *</label>
          <input type="password" name="password" value="${escapeHtml(curr.defaultPass)}" required class="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 bg-white"/>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-lg bg-[#0369a1] hover:bg-sky-800 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5">
          <span>Sign In as ${curr.title.split(' ')[0]}</span> &rarr;
        </button>
      </form>

      <!-- Quick Fill Helper Pill -->
      <div class="p-2.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between text-[11px] text-sky-900">
        <div class="truncate mr-2">
          Demo: <strong>${escapeHtml(curr.demoRole)}</strong>
        </div>
        <button type="button" onclick="fillAuthCredentials('${curr.defaultEmail}', '${curr.defaultPass}')" class="px-2 py-1 rounded bg-sky-200 hover:bg-sky-300 font-bold text-[10px] text-sky-900 shrink-0">
          Auto-Fill
        </button>
      </div>

      <div class="pt-2 border-t text-center space-y-1.5 text-xs text-gray-500">
        <div>
          New to the foundation? <a href="#volunteer-register" onclick="closeAuthModal()" class="text-sky-700 underline font-semibold">Join as Volunteer</a>
        </div>
        <div>
          Applied recently? <button type="button" onclick="renderAuthModalContent('track')" class="text-sky-700 underline font-semibold">Track by Application Reference</button>
        </div>
      </div>
    </div>
  `;
}

function fillAuthCredentials(email, password) {
  const form = document.getElementById('auth-login-form');
  if (form) {
    if (form.email) form.email.value = email;
    if (form.password) form.password.value = password;
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('hidden');
}

function closeGenericModal() {
  const modal = document.getElementById('generic-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const res = await API.login(email, password);
    if (res.success) {
      AppState.currentUser = res.user;
      AppState.volunteerApp = res.volunteerApp;
      AppState.memberProfile = res.memberProfile;
      updateNavUserUI();
      closeAuthModal();
      showToast(`Welcome back, ${res.user.full_name}!`, 'success');

      if (['super_admin', 'ngo_admin', 'volunteer_coordinator', 'program_coordinator'].includes(res.user.role)) {
        navigateTo('admin');
      } else if (['executive_member', 'employee'].includes(res.user.role)) {
        navigateTo('member-dashboard');
      } else {
        navigateTo('volunteer-dashboard');
      }
    }
  } catch (err) {
    showToast(err.message || 'Invalid credentials.', 'error');
  }
}

async function handleMemberLoginSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const res = await API.login(email, password);
    if (res.success) {
      AppState.currentUser = res.user;
      AppState.volunteerApp = res.volunteerApp;
      AppState.memberProfile = res.memberProfile;
      updateNavUserUI();
      showToast(`Welcome back, ${res.user.full_name}!`, 'success');
      navigateTo('member-dashboard');
    }
  } catch (err) {
    showToast(err.message || 'Invalid member credentials.', 'error');
  }
}

function fillMemberCredentials(email, password) {
  const emailInput = document.getElementById('member-login-email');
  const passInput = document.getElementById('member-login-password');
  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = password;
}

async function handleTrackStatusSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const ref = form.application_ref.value.trim();
  const email = form.email.value.trim();
  const resultBox = document.getElementById('track-result-box');
  if (!resultBox) return;

  resultBox.innerHTML = '<div class="text-center text-xs text-gray-400">Searching records...</div>';

  try {
    const res = await API.trackStatus(ref, email);
    if (res.success) {
      const a = res.application;
      resultBox.innerHTML = `
        <div class="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-bold text-gray-900">${a.full_name}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.status === 'Approved' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}">
              ${a.status}
            </span>
          </div>
          <div class="text-[11px] text-gray-600">
            <div>Ref: <strong>${a.application_ref}</strong></div>
            ${a.membership_id ? `<div>Membership ID: <strong class="text-sky-800 font-mono">${a.membership_id}</strong></div>` : ''}
            <div>Verification Remark: ${a.verification_remarks || 'Under formal review'}</div>
          </div>
          ${a.certificate ? `
            <div class="pt-1">
              <a href="${API.getCertificateDownloadUrl(a.certificate.certificate_number)}" target="_blank" class="block text-center py-1.5 rounded bg-[#0369a1] text-white font-semibold text-[11px]">
                Download Verified Certificate &rarr;
              </a>
            </div>
          ` : ''}
        </div>
      `;
    }
  } catch (err) {
    resultBox.innerHTML = `<div class="p-3 bg-rose-50 rounded border border-rose-200 text-xs text-rose-700">${err.message}</div>`;
  }
}

// RSVP Modal
function openRSVPModal(eventId, title) {
  const modal = document.getElementById('generic-modal');
  const modalContent = document.getElementById('generic-modal-content');
  if (!modal || !modalContent) return;

  const user = AppState.currentUser;

  modalContent.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="font-bold text-base text-[#0369a1]">RSVP for Event</h3>
        <button onclick="closeGenericModal()" class="text-xl font-bold">&times;</button>
      </div>

      <div class="text-xs text-gray-700">
        You are registering for: <strong class="text-gray-900">${title}</strong>
      </div>

      <form onsubmit="handleRSVPSubmit(event, ${eventId})" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Participant Name *</label>
          <input type="text" name="participant_name" value="${user ? user.full_name : ''}" required class="w-full p-2 rounded border border-gray-300"/>
        </div>
        <div>
          <label class="block font-semibold mb-1">Email Address *</label>
          <input type="email" name="participant_email" value="${user ? user.email : ''}" required class="w-full p-2 rounded border border-gray-300"/>
        </div>
        <div>
          <label class="block font-semibold mb-1">Mobile Number</label>
          <input type="tel" name="participant_mobile" value="${user ? (user.phone || '') : ''}" class="w-full p-2 rounded border border-gray-300"/>
        </div>
        <div class="flex justify-end pt-2">
          <button type="submit" class="px-5 py-2.5 rounded bg-[#0369a1] text-white font-bold text-xs shadow">
            Confirm Participation &rarr;
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
}

async function handleRSVPSubmit(e, eventId) {
  e.preventDefault();
  const form = e.target;
  const participant_name = form.participant_name.value.trim();
  const participant_email = form.participant_email.value.trim();
  const participant_mobile = form.participant_mobile.value.trim();

  try {
    const res = await API.rsvpEvent(eventId, { participant_name, participant_email, participant_mobile });
    if (res.success) {
      showToast(res.message, 'success');
      closeGenericModal();
      if (AppState.currentRoute === 'events') {
        const main = document.getElementById('main-content');
        renderEvents(main);
      }
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Utility: escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Global Initialization
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize accessibility font size & contrast
  if (typeof initAccessibility === 'function') initAccessibility();

  // Mobile Nav Toggle
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-menu');
  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });
  }

  // Check auth session
  await checkAuthSession();

  // Initial Routing
  await handleRouting();

  // Load custom dynamic navbar links
  if (typeof renderCustomNavbarLinks === 'function') {
    renderCustomNavbarLinks();
  }

  // Listen for hash changes
  window.addEventListener('hashchange', handleRouting);
});


async function uploadCmsImage(target, inputId, previewImgId) {
  const input = document.getElementById(inputId);
  if (!input || !input.files || input.files.length === 0) {
    showToast('Please select an image file first.', 'warning');
    return;
  }

  const file = input.files[0];
  const btn = event.target;
  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Uploading...';

  try {
    const res = await API.uploadImage(file, target);
    if (res.success) {
      showToast(res.message, 'success');
      if (previewImgId) {
        const previewEl = document.getElementById(previewImgId);
        if (previewEl) previewEl.src = res.url + '?t=' + Date.now();
      }
      // Reload settings in state
      const sRes = await API.getSettings();
      if (sRes.success) AppState.settings = sRes.settings;
    }
  } catch (err) {
    showToast(err.message || 'Image upload failed.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}



// --- Executive Members CMS Helpers (Honorary / Section 8) ---
function renderExecutiveCards(execs) {
  if (!execs || execs.length === 0) {
    return `
      <div id="no-exec-placeholder" class="p-8 text-center text-gray-500 bg-sky-50/50 rounded-xl border border-dashed border-sky-300 space-y-2">
        <div class="text-3xl">👔</div>
        <div class="font-bold text-gray-800">No Executive Members Currently Added</div>
        <div class="text-xs text-gray-500">Currently zero executive members configured. Click <strong>"+ Add Executive Member"</strong> above to add one, or click <strong>"Save All Site Information"</strong> to persist zero members.</div>
      </div>
    `;
  }
  return execs.map((m, idx) => `
    <div class="cms-executive-card p-4 rounded-xl bg-stone-50 border border-sky-200 space-y-3 relative">
      <div class="flex flex-wrap items-center justify-between border-b border-sky-100 pb-2 gap-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">${idx + 1}</span>
          <span class="font-bold text-sm text-sky-950">Honorary Office Bearer / Executive Member</span>
          <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">Sec. 8 (No Salary)</span>
        </div>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-1 text-xs text-gray-700 cursor-pointer">
            <input type="checkbox" class="exec-visible-chk" ${m.visible !== false ? 'checked' : ''} />
            <span class="font-medium">Visible on Site</span>
          </label>
          <a href="#verify?certNumber=${encodeURIComponent(m.certificate_number || m.membership_id)}" class="px-2 py-1 rounded bg-sky-100 text-sky-800 hover:bg-sky-200 text-xs font-semibold">
            🎖️ Verify
          </a>
          <a href="/api/certificate/download/${encodeURIComponent(m.certificate_number || m.membership_id)}" target="_blank" class="px-2 py-1 rounded bg-sky-600 text-white hover:bg-sky-500 text-xs font-semibold">
            📥 PDF
          </a>
          <button type="button" onclick="removeExecutiveField(this)" class="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs">
            🗑️ Remove
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Full Name *</label>
          <input type="text" class="exec-name w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(m.name || '')}" placeholder="e.g. Dr. Rameshwar Rao" required/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Designation / Role *</label>
          <input type="text" class="exec-role w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(m.role || '')}" placeholder="e.g. Vice President (Honorary)" required/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Category</label>
          <input type="text" class="exec-category w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(m.category || 'Executive Office Bearer')}" placeholder="e.g. Executive Office Bearer"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Educational Qualification & Bio</label>
          <input type="text" class="exec-qualification w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(m.qualification || '')}" placeholder="e.g. Ph.D., Social Welfare Specialist"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Official Email</label>
          <input type="text" class="exec-contact w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(m.contact || '')}" placeholder="email@ri8win.org"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Location / City</label>
          <input type="text" class="exec-location w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(m.location || '')}" placeholder="e.g. Navi Mumbai, Maharashtra"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Appointment Date</label>
          <input type="text" class="exec-appointment-date w-full p-2 rounded border border-gray-300 bg-white" value="${escapeHtml(m.appointment_date || '06 October 2026')}" placeholder="DD Month YYYY"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Membership ID</label>
          <input type="text" class="exec-membership-id w-full p-2 rounded border border-gray-300 bg-white font-mono" value="${escapeHtml(m.membership_id || '')}" placeholder="RI8-EXEC-2026-0001"/>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-gray-700">Certificate Number</label>
          <input type="text" class="exec-cert-number w-full p-2 rounded border border-gray-300 bg-white font-mono" value="${escapeHtml(m.certificate_number || '')}" placeholder="CERT-HON-RI8-2026-0001"/>
        </div>
      </div>

      <!-- Photo Upload & URL -->
      <div class="pt-2 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-4">
        <div class="w-14 h-14 rounded-full border-2 border-sky-600 overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
          <img class="exec-preview-img w-full h-full object-cover" src="${m.photo || '/assets/activity_education.jpg'}" onerror="this.src='/assets/Banner.png'"/>
        </div>
        <div class="flex-1 w-full space-y-1">
          <label class="block text-[11px] font-semibold text-gray-600">Member Photograph (Upload file or enter URL)</label>
          <div class="flex gap-2">
            <input type="text" class="exec-photo w-full p-1.5 text-xs rounded border border-gray-300 bg-white" value="${escapeHtml(m.photo || '')}" placeholder="/assets/... or /uploads/..." oninput="updateExecutivePreview(this)"/>
            <label class="cursor-pointer px-3 py-1.5 rounded bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shrink-0 flex items-center gap-1">
              <span>📷 Upload</span>
              <input type="file" accept="image/*" class="hidden" onchange="uploadExecutiveCardPhoto(this)"/>
            </label>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function addExecutiveField(data = {}) {
  const container = document.getElementById('cms-executive-container');
  if (!container) return;
  const placeholder = container.querySelector('#no-exec-placeholder, .border-dashed');
  if (placeholder) placeholder.remove();

  const count = container.querySelectorAll('.cms-executive-card').length + 1;
  const numStr = String(count).padStart(4, '0');
  const div = document.createElement('div');
  div.className = 'cms-executive-card p-4 rounded-xl bg-stone-50 border border-sky-200 space-y-3 relative animate-fadeIn';
  div.innerHTML = `
    <div class="flex flex-wrap items-center justify-between border-b border-sky-100 pb-2 gap-2">
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">${count}</span>
        <span class="font-bold text-sm text-sky-950">Honorary Office Bearer / Executive Member</span>
        <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">Sec. 8 (No Salary)</span>
      </div>
      <div class="flex items-center gap-2">
        <label class="flex items-center gap-1 text-xs text-gray-700 cursor-pointer">
          <input type="checkbox" class="exec-visible-chk" checked />
          <span class="font-medium">Visible on Site</span>
        </label>
        <button type="button" onclick="removeExecutiveField(this)" class="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs">
          🗑️ Remove
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Full Name *</label>
        <input type="text" class="exec-name w-full p-2 rounded border border-gray-300 bg-white" placeholder="Full Name" required/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Designation / Role *</label>
        <input type="text" class="exec-role w-full p-2 rounded border border-gray-300 bg-white" placeholder="e.g. Vice President (Honorary)" required/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Category</label>
        <input type="text" class="exec-category w-full p-2 rounded border border-gray-300 bg-white" value="Executive Office Bearer"/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Educational Qualification & Bio</label>
        <input type="text" class="exec-qualification w-full p-2 rounded border border-gray-300 bg-white" placeholder="Bio / Qualification"/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Official Email</label>
        <input type="text" class="exec-contact w-full p-2 rounded border border-gray-300 bg-white" placeholder="email@ri8win.org"/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Location / City</label>
        <input type="text" class="exec-location w-full p-2 rounded border border-gray-300 bg-white" placeholder="City, State"/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Appointment Date</label>
        <input type="text" class="exec-appointment-date w-full p-2 rounded border border-gray-300 bg-white" value="25 October 2026"/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Membership ID</label>
        <input type="text" class="exec-membership-id w-full p-2 rounded border border-gray-300 bg-white font-mono" value="RI8-EXEC-2026-${numStr}"/>
      </div>
      <div>
        <label class="block font-semibold mb-1 text-gray-700">Certificate Number</label>
        <input type="text" class="exec-cert-number w-full p-2 rounded border border-gray-300 bg-white font-mono" value="CERT-HON-RI8-2026-${numStr}"/>
      </div>
    </div>

    <div class="pt-2 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-4">
      <div class="w-14 h-14 rounded-full border-2 border-sky-600 overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
        <img class="exec-preview-img w-full h-full object-cover" src="/assets/activity_education.jpg"/>
      </div>
      <div class="flex-1 w-full space-y-1">
        <label class="block text-[11px] font-semibold text-gray-600">Member Photograph</label>
        <div class="flex gap-2">
          <input type="text" class="exec-photo w-full p-1.5 text-xs rounded border border-gray-300 bg-white" placeholder="/assets/... or /uploads/..." oninput="updateExecutivePreview(this)"/>
          <label class="cursor-pointer px-3 py-1.5 rounded bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shrink-0 flex items-center gap-1">
            <span>📷 Upload</span>
            <input type="file" accept="image/*" class="hidden" onchange="uploadExecutiveCardPhoto(this)"/>
          </label>
        </div>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function removeExecutiveField(btn) {
  if (!confirm('Are you sure you want to remove this executive member?')) return;
  const card = btn.closest('.cms-executive-card');
  if (card) {
    const container = card.parentElement;
    card.remove();
    if (container && container.querySelectorAll('.cms-executive-card').length === 0) {
      container.innerHTML = renderExecutiveCards([]);
    }
  }
}

function removeAllExecutives() {
  if (!confirm('Are you sure you want to remove ALL executive members? This will clear all members. Click "Save All Site Information" afterwards to apply this change.')) return;
  const container = document.getElementById('cms-executive-container');
  if (container) {
    container.innerHTML = renderExecutiveCards([]);
    showToast('All executive members removed. Click "Save All Site Information" to save!', 'info');
  }
}

function updateExecutivePreview(input) {
  const card = input.closest('.cms-executive-card');
  const img = card?.querySelector('.exec-preview-img');
  if (img && input.value) {
    img.src = input.value;
  }
}

function updateDirectorPreview(input) {
  const card = input.closest('.cms-director-card');
  const previewImg = card?.querySelector('.dir-preview-img');
  if (previewImg && input.value) {
    previewImg.src = input.value;
  }
}

async function uploadDirectorCardPhoto(fileInput) {
  if (!fileInput.files || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  const card = fileInput.closest('.cms-director-card');
  const photoInput = card?.querySelector('.dir-photo');
  const previewImg = card?.querySelector('.dir-preview-img');

  try {
    showToast('Uploading director photo...', 'info');
    const res = await API.uploadImage(file, 'director');
    if (res.success && res.url) {
      if (photoInput) photoInput.value = res.url;
      if (previewImg) previewImg.src = res.url;
      showToast('Director photo uploaded successfully!', 'success');
    }
  } catch (err) {
    showToast('Director photo upload failed: ' + err.message, 'error');
  }
}

async function uploadExecutiveCardPhoto(fileInput) {
  if (!fileInput.files || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  const card = fileInput.closest('.cms-executive-card');
  const photoInput = card?.querySelector('.exec-photo');
  const previewImg = card?.querySelector('.exec-preview-img');

  try {
    showToast('Uploading photo...', 'success');
    const res = await API.uploadImage(file, 'executive');
    if (res.success && res.url) {
      if (photoInput) photoInput.value = res.url;
      if (previewImg) previewImg.src = res.url;
      showToast('Photo uploaded successfully!');
    }
  } catch (err) {
    showToast('Photo upload failed: ' + err.message, 'error');
  }
}

// -------------------------------------------------------------
// DEDICATED HONORARY MEMBER & STAFF PORTAL RENDERERS
// -------------------------------------------------------------

async function renderMemberLogin(container) {
  if (AppState.currentUser && ['executive_member', 'employee'].includes(AppState.currentUser.role)) {
    return navigateTo('member-dashboard');
  }

  await ensureSettingsLoaded();
  const s = AppState.settings || {};

  container.innerHTML = `
    <div class="max-w-md mx-auto px-4 py-12">
      <div class="bg-white rounded-3xl border border-sky-100 shadow-xl overflow-hidden">
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-sky-900 via-sky-800 to-sky-950 p-6 text-white text-center space-y-2">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center font-extrabold text-2xl shadow-lg border border-sky-300/40">
            👔
          </div>
          <div class="text-xs font-bold text-sky-300 uppercase tracking-widest">SECTION 8 STATUTORY GOVERNANCE</div>
          <h2 class="text-xl sm:text-2xl font-black">${escapeHtml(s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')}</h2>
          <p class="text-xs text-sky-200/90 font-medium">Honorary Member & Executive Staff Portal</p>
        </div>

        <!-- Statutory Notice Banner -->
        <div class="p-4 bg-sky-50 border-b border-sky-100 text-[11px] text-sky-900 space-y-1">
          <div class="font-bold flex items-center gap-1.5 text-sky-950">
            <span>⚖️</span> Section 8 Companies Act, 2013 Statutory Compliance
          </div>
          <p class="text-sky-800 leading-relaxed">
            All office bearers and committee members serve in an <strong>Honorary Capacity without salary, remuneration, or profit distribution</strong>.
          </p>
        </div>

        <!-- Form Body -->
        <div class="p-6 space-y-5">
          <form onsubmit="handleMemberLoginSubmit(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Official Registered Email *</label>
              <input type="email" id="member-login-email" name="email" required placeholder="member@ri8win.org or officer email" value="member@ri8win.org" class="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 bg-white"/>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Secure Password *</label>
              <input type="password" id="member-login-password" name="password" required value="Member@RI8Win2026!" class="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 bg-white"/>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-sky-700 to-sky-800 hover:from-sky-800 hover:to-sky-900 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2">
              <span>Sign In to Member Portal</span>
              <span>&rarr;</span>
            </button>
          </form>

          <!-- Quick Test Credentials -->
          <div class="pt-4 border-t border-gray-100 space-y-2">
            <div class="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Quick Demonstration Logins</div>
            <div class="grid grid-cols-2 gap-2 text-[10px]">
              <button type="button" onclick="fillMemberCredentials('member@ri8win.org', 'Member@RI8Win2026!')" class="p-2 rounded-lg bg-slate-50 hover:bg-sky-50 border border-gray-200 text-left font-medium transition">
                <div class="font-bold text-sky-900 truncate">Dr. Rameshwar Deshmukh</div>
                <div class="text-gray-500 truncate">Vice President (Honorary)</div>
              </button>
              <button type="button" onclick="fillMemberCredentials('sunita.patil@ri8win.org', 'Member@RI8Win2026!')" class="p-2 rounded-lg bg-slate-50 hover:bg-sky-50 border border-gray-200 text-left font-medium transition">
                <div class="font-bold text-sky-900 truncate">Adv. Sunita Patil</div>
                <div class="text-gray-500 truncate">General Secretary</div>
              </button>
              <button type="button" onclick="fillMemberCredentials('rajesh.agrawal@ri8win.org', 'Member@RI8Win2026!')" class="p-2 rounded-lg bg-slate-50 hover:bg-sky-50 border border-gray-200 text-left font-medium transition">
                <div class="font-bold text-sky-900 truncate">CA Rajesh Agrawal</div>
                <div class="text-gray-500 truncate">Honorary Treasurer</div>
              </button>
              <button type="button" onclick="fillMemberCredentials('staff@ri8win.org', 'Staff@RI8Win2026!')" class="p-2 rounded-lg bg-slate-50 hover:bg-sky-50 border border-gray-200 text-left font-medium transition">
                <div class="font-bold text-sky-900 truncate">Foundation Staff</div>
                <div class="text-gray-500 truncate">Program Officer</div>
              </button>
            </div>
          </div>

          <div class="pt-2 text-center text-xs text-gray-500 space-y-1">
            <div>Need super admin access? <a href="#admin" class="text-amber-600 underline font-semibold">Admin Sign In</a></div>
            <div>Are you a volunteer? <a href="#volunteer-dashboard" class="text-sky-700 underline font-semibold">Volunteer Dashboard</a></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function renderMemberDashboard(container) {
  if (!AppState.currentUser) {
    return navigateTo('member-login');
  }

  await ensureSettingsLoaded(true);
  const s = AppState.settings || {};
  const user = AppState.currentUser;

  // Find member profile
  let member = AppState.memberProfile;
  if (!member && Array.isArray(s.executive_members)) {
    member = s.executive_members.find(m =>
      (m.contact && m.contact.toLowerCase() === user.email.toLowerCase()) ||
      (m.name && m.name.toLowerCase() === user.full_name.toLowerCase())
    ) || s.executive_members[0];
  }

  if (!member) {
    member = {
      name: user.full_name,
      role: user.role === 'employee' ? 'Program Officer (Honorary)' : 'Executive Member (Honorary)',
      membership_id: 'RI8-EXEC-2026-0001',
      certificate_number: 'CERT-HON-RI8-2026-0001',
      appointment_date: '06 October 2026',
      contact: user.email,
      location: 'Navi Mumbai, Maharashtra',
      photo: '/assets/activity_education.jpg',
      honorary_terms: 'Honorary Office Bearer • Serving without salary, remuneration, or profit-sharing as mandated by Section 8 of the Companies Act, 2013.'
    };
  }

  const certNumber = member.certificate_number || member.membership_id;

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <!-- Member Profile Header -->
      <div class="bg-gradient-to-r from-sky-950 via-sky-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-800/80 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-sky-400 shadow-xl bg-sky-800 shrink-0">
          <img src="${escapeHtml(member.photo || '/assets/activity_education.jpg')}" alt="${escapeHtml(member.name)}" class="w-full h-full object-cover" onerror="this.src='/assets/Banner.png'"/>
        </div>
        <div class="flex-1 text-center md:text-left space-y-3">
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span class="px-3 py-1 rounded-full bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-bold uppercase tracking-wider">
              OFFICIAL SECTION 8 APPOINTMENT
            </span>
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
              Active Member
            </span>
            <span class="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              Honorary (Zero Salary)
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight">${escapeHtml(member.name)}</h1>
          <div class="text-sm sm:text-base font-semibold text-sky-300">${escapeHtml(member.role)}</div>
          <p class="text-xs text-sky-100/80 max-w-2xl leading-relaxed">${escapeHtml(member.qualification || member.honorary_terms || '')}</p>

          <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-mono text-sky-200">
            <div>Membership ID: <strong class="text-white">${escapeHtml(member.membership_id)}</strong></div>
            <div>Appointment: <strong class="text-white">${escapeHtml(member.appointment_date || '06 October 2026')}</strong></div>
            <div>CIN: <strong class="text-white">${escapeHtml(s.cin || 'U88900MH2026NPL481549')}</strong></div>
          </div>
        </div>

        <div class="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
          <a href="/api/certificate/download/${encodeURIComponent(certNumber)}" target="_blank" class="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2">
            <span>📥 Download Certificate (PDF)</span>
          </a>
          <a href="#verify?certNumber=${encodeURIComponent(certNumber)}" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition flex items-center justify-center gap-2">
            <span>🔍 Verify Certificate Online</span>
          </a>
        </div>
      </div>

      <!-- Statutory Declaration Card -->
      <div class="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 text-xs sm:text-sm">
        <div class="font-bold flex items-center gap-2 text-base text-amber-900">
          <span>⚖️</span> Statutory Declaration under Section 8 of the Companies Act, 2013 (MCA, India)
        </div>
        <p class="leading-relaxed">
          This appointment is confirmed in an <strong>Honorary Capacity without salary, remuneration, commission, or profit distribution</strong> in strict compliance with Section 8(1)(b) & Section 8(1)(c) of the Companies Act, 2013. The entire income and assets of RI8WIN NOBEL PATH FOUNDATION are applied solely towards public charitable objectives in education, healthcare, and environmental protection.
        </p>
      </div>

      <!-- Certificate Live Preview Card -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-sky-200 shadow-md space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div class="text-xs font-bold text-sky-700 uppercase tracking-wider">OFFICIAL RECOGNITION OF APPOINTMENT</div>
            <h2 class="text-xl sm:text-2xl font-black text-[#0369a1]">Online Certificate of Honorary Membership</h2>
            <p class="text-xs text-gray-500">Authorized by the Board of Directors, RI8WIN NOBEL PATH FOUNDATION</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5">
              <span>🖨️</span> Print Card
            </button>
            <a href="/api/certificate/download/${encodeURIComponent(certNumber)}" target="_blank" class="px-4 py-2 rounded-xl bg-[#0369a1] hover:bg-sky-900 text-white font-bold text-xs transition flex items-center gap-1.5 shadow">
              <span>📄</span> High-Res PDF
            </a>
          </div>
        </div>

        <!-- Certificate Visual Frame -->
        <div class="p-6 sm:p-8 rounded-2xl border-4 border-double border-sky-800 bg-gradient-to-b from-sky-50/40 via-white to-sky-50/40 space-y-6 text-center">
          <div class="flex items-center justify-between border-b-2 border-sky-800 pb-4">
            <div class="text-left text-xs font-mono text-gray-600">
              <div>CIN: <strong>${escapeHtml(s.cin || 'U88900MH2026NPL481549')}</strong></div>
              <div>PAN: <strong>${escapeHtml(s.pan || 'AAQCR4085D')}</strong></div>
            </div>
            <div class="space-y-0.5">
              <h3 class="text-base sm:text-xl font-black text-sky-950 uppercase tracking-wider">${escapeHtml(s.org_name || 'RI8WIN NOBEL PATH FOUNDATION')}</h3>
              <p class="text-[11px] font-semibold text-sky-800">Ministry of Corporate Affairs, Government of India • Section 8 Non-Profit</p>
            </div>
            <div class="text-right text-xs font-mono text-gray-600">
              <div>ID: <strong>${escapeHtml(member.membership_id)}</strong></div>
              <div>Date: <strong>${escapeHtml(member.appointment_date || '06 Oct 2026')}</strong></div>
            </div>
          </div>

          <div class="space-y-3 py-4">
            <div class="text-xs uppercase tracking-widest text-sky-800 font-bold">CERTIFICATE OF HONORARY APPOINTMENT</div>
            <div class="text-2xl sm:text-3xl font-extrabold text-[#0369a1] font-serif">${escapeHtml(member.name)}</div>
            <p class="text-xs sm:text-sm text-gray-700 max-w-2xl mx-auto leading-relaxed">
              has been duly appointed as an <strong>${escapeHtml(member.role)}</strong> of RI8WIN NOBEL PATH FOUNDATION, serving in an honorary capacity in pursuit of the Foundation's charitable objectives across India.
            </p>
            <div class="inline-block px-3 py-1 rounded bg-sky-100 text-sky-900 text-xs font-bold border border-sky-300">
              Honorary Capacity • Non-Profit Co. (Section 8) • Purely Voluntary Service
            </div>
          </div>

          <div class="pt-6 border-t-2 border-sky-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-600">
            <div class="text-center sm:text-left">
              <div class="font-bold text-gray-900">Ms. Shilpa Sunil Umare</div>
              <div class="text-[11px]">Director & Co-Founder</div>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-100/60 border border-sky-300 text-[11px] font-mono">
              <span>🔒 MCA Verified:</span>
              <a href="#verify?certNumber=${encodeURIComponent(certNumber)}" class="text-sky-800 underline font-bold">${escapeHtml(certNumber)}</a>
            </div>
            <div class="text-center sm:text-right">
              <div class="font-bold text-gray-900">Ms. Sarika Uttamchand Wakde</div>
              <div class="text-[11px]">Director & Co-Founder</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Governance & Policy Directives -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <a href="#volunteer-guidelines" class="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition space-y-2 block group">
          <div class="text-2xl">📋</div>
          <h3 class="font-bold text-sm text-[#0369a1] group-hover:text-sky-800">Volunteer Guidelines</h3>
          <p class="text-xs text-gray-500 leading-relaxed">Review the official volunteer code of conduct, safeguarding, and anti-discrimination standards.</p>
        </a>
        <a href="#privacy-policy" class="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition space-y-2 block group">
          <div class="text-2xl">🔒</div>
          <h3 class="font-bold text-sm text-[#0369a1] group-hover:text-sky-800">Privacy Policy (DPDP Act)</h3>
          <p class="text-xs text-gray-500 leading-relaxed">Understand statutory data protection practices and zero commercial exploitation guarantees.</p>
        </a>
        <a href="#terms-of-use" class="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition space-y-2 block group">
          <div class="text-2xl">⚖️</div>
          <h3 class="font-bold text-sm text-[#0369a1] group-hover:text-sky-800">Terms of Use</h3>
          <p class="text-xs text-gray-500 leading-relaxed">Official terms of website use, intellectual property copyright, and certificate anti-fraud rules.</p>
        </a>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// DEDICATED FOUNDATION POLICY PAGES (GUIDELINES, PRIVACY, TERMS)
// -------------------------------------------------------------

async function renderPolicyPage(container, policyKey = 'volunteer_guidelines') {
  await ensureSettingsLoaded(true);
  const s = AppState.settings || {};

  const policyMeta = {
    volunteer_guidelines: {
      title: 'Volunteer & Participant Operational Guidelines',
      subtitle: 'Official Code of Conduct, Child Safeguarding, and Non-Profit Volunteering Rules',
      badge: 'VOLUNTEER CODE OF CONDUCT',
      icon: '📋'
    },
    privacy_policy: {
      title: 'Privacy Policy & Personal Data Protection Statement',
      subtitle: 'Compliant with the Digital Personal Data Protection Act, 2023 (DPDP Act, India)',
      badge: 'STATUTORY DATA PRIVACY',
      icon: '🔒'
    },
    terms_of_use: {
      title: 'Official Website Terms of Use & Legal Disclaimers',
      subtitle: 'Governed under the Laws of India & the Companies Act, 2013 (Section 8 Regulations)',
      badge: 'TERMS OF ENGAGEMENT',
      icon: '⚖️'
    }
  };

  const meta = policyMeta[policyKey] || policyMeta.volunteer_guidelines;
  const rawText = s[policyKey] || 'Policy text is currently being updated by the Board of Directors.';

  // Format text into structured paragraphs
  const paragraphs = rawText.split('\n\n').filter(p => p.trim());

  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <!-- Page Header -->
      <div class="text-center space-y-3 border-b border-gray-200 pb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold uppercase tracking-wider">
          <span>${meta.icon}</span> ${meta.badge}
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#0369a1] leading-tight">
          ${meta.title}
        </h1>
        <p class="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
          ${meta.subtitle}
        </p>
        <div class="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 font-mono">
          <span>CIN: <strong>${escapeHtml(s.cin || 'U88900MH2026NPL481549')}</strong></span>
          <span>•</span>
          <span>PAN: <strong>${escapeHtml(s.pan || 'AAQCR4085D')}</strong></span>
          <span>•</span>
          <span>Section 8 Non-Profit (MCA, India)</span>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-xs">
        <div class="flex items-center gap-2">
          <a href="#volunteer-guidelines" class="px-3 py-1.5 rounded-lg font-semibold ${policyKey === 'volunteer_guidelines' ? 'bg-[#0369a1] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">Volunteer Guidelines</a>
          <a href="#privacy-policy" class="px-3 py-1.5 rounded-lg font-semibold ${policyKey === 'privacy_policy' ? 'bg-[#0369a1] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">Privacy Policy</a>
          <a href="#terms-of-use" class="px-3 py-1.5 rounded-lg font-semibold ${policyKey === 'terms_of_use' ? 'bg-[#0369a1] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">Terms of Use</a>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="window.print()" class="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5">
            <span>🖨️</span> Print Document
          </button>
          ${(AppState.currentUser && ['super_admin', 'ngo_admin'].includes(AppState.currentUser.role)) ? `
            <a href="#admin" onclick="setTimeout(() => switchCmsSubtab('policies'), 200)" class="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs">
              <span>✏️</span> Edit Policy in Admin CMS
            </a>
          ` : ''}
        </div>
      </div>

      <!-- Document Content Body -->
      <div class="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6 text-xs sm:text-sm text-gray-800 leading-relaxed">
        ${paragraphs.map(para => {
          const trimmed = para.trim();
          if (/^\d+\./.test(trimmed) || /^[A-Z\s]{4,}:?$/.test(trimmed.split('\n')[0])) {
            const lines = trimmed.split('\n');
            const heading = lines[0];
            const body = lines.slice(1).join('\n');
            return `
              <div class="space-y-2 pt-2 border-t border-gray-100 first:border-0 first:pt-0">
                <h3 class="font-extrabold text-sm sm:text-base text-sky-950">${escapeHtml(heading)}</h3>
                ${body ? `<p class="text-gray-700 whitespace-pre-line leading-relaxed">${escapeHtml(body)}</p>` : ''}
              </div>
            `;
          }
          return `<p class="text-gray-700 whitespace-pre-line leading-relaxed">${escapeHtml(trimmed)}</p>`;
        }).join('')}
      </div>

      <!-- Statutory Footer Disclosure -->
      <div class="p-6 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-2">
        <div class="font-bold text-sm text-sky-950">Statutory Transparency Disclosure</div>
        <p class="leading-relaxed">
          RI8WIN NOBEL PATH FOUNDATION is incorporated under Section 8 of the Companies Act, 2013 (Ministry of Corporate Affairs, Government of India). Our income is applied solely towards the promotion of our charitable objects. No profit or dividend is distributed to members.
        </p>
        <div class="pt-1 flex flex-wrap gap-4 text-[11px] font-mono text-sky-800">
          <div>Registered Office: ${escapeHtml(s.registered_office || 'Navi Mumbai, Maharashtra - 410218, India')}</div>
          <div>Official Email: ${escapeHtml(s.official_email || 'contact@ri8winnobelpath.org')}</div>
        </div>
      </div>
    </div>
  `;
}

window.renderExecutiveCards = renderExecutiveCards;
window.addExecutiveField = addExecutiveField;
window.removeExecutiveField = removeExecutiveField;
window.removeAllExecutives = removeAllExecutives;
window.removeAllDirectors = removeAllDirectors;
window.updateExecutivePreview = updateExecutivePreview;
window.uploadDirectorCardPhoto = uploadDirectorCardPhoto;
window.updateDirectorPreview = updateDirectorPreview;
window.uploadExecutiveCardPhoto = uploadExecutiveCardPhoto;
window.renderMemberLogin = renderMemberLogin;
window.renderMemberDashboard = renderMemberDashboard;
window.renderPolicyPage = renderPolicyPage;
window.handleMemberLoginSubmit = handleMemberLoginSubmit;
window.fillMemberCredentials = fillMemberCredentials;
window.fillAuthCredentials = fillAuthCredentials;

// CMS helpers for footer, activities, metrics, categories
window.renderFooter = renderFooter;
window.updateHeaderUI = updateHeaderUI;
window.switchCmsSubtab = switchCmsSubtab;
window.renderActivityCards = renderActivityCards;
window.addActivityField = addActivityField;
window.removeActivityField = removeActivityField;
window.removeAllActivities = removeAllActivities;
window.uploadActivityCardPhoto = uploadActivityCardPhoto;
window.updateActivityPreview = updateActivityPreview;
window.renderCategoryCards = renderCategoryCards;
window.addCategoryField = addCategoryField;
window.removeCategoryField = removeCategoryField;
