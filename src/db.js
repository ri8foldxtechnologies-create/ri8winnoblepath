const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ri8win.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'volunteer',
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS volunteer_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_ref TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      full_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      is_minor INTEGER DEFAULT 0,
      guardian_name TEXT,
      guardian_contact TEXT,
      guardian_consent INTEGER DEFAULT 0,
      gender TEXT,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      address TEXT,
      photo_url TEXT,
      qualification TEXT NOT NULL,
      institution TEXT,
      occupation TEXT NOT NULL,
      skills TEXT,
      experience TEXT,
      interests TEXT NOT NULL,
      availability_mode TEXT NOT NULL,
      preferred_days_times TEXT,
      preferred_location TEXT,
      motivation TEXT,
      declaration_accurate INTEGER DEFAULT 1,
      declaration_guidelines INTEGER DEFAULT 1,
      declaration_consent INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Submitted',
      verification_remarks TEXT,
      assigned_verifier TEXT,
      verification_date DATETIME,
      safeguarding_checked INTEGER DEFAULT 0,
      approval_date DATETIME,
      approving_officer TEXT,
      membership_id TEXT UNIQUE,
      certificate_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certificate_number TEXT UNIQUE NOT NULL,
      application_id INTEGER REFERENCES volunteer_applications(id) ON DELETE SET NULL,
      volunteer_name TEXT NOT NULL,
      membership_id TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      status TEXT DEFAULT 'Issued',
      certificate_type TEXT DEFAULT 'Volunteer Service',
      role_title TEXT DEFAULT 'Volunteer Service Member',
      tenure_or_hours TEXT DEFAULT '100+ Hours Community Service',
      remarks TEXT,
      revocation_date DATETIME,
      revocation_reason TEXT,
      authorized_signatory TEXT DEFAULT 'Ms. Shilpa Sunil Umare, Founder & Director',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS official_letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_number TEXT UNIQUE NOT NULL,
      letter_type TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      recipient_role TEXT NOT NULL,
      recipient_email TEXT,
      recipient_phone TEXT,
      recipient_address TEXT,
      membership_or_emp_id TEXT,
      issue_date TEXT NOT NULL,
      effective_date TEXT,
      service_period TEXT,
      program_department TEXT,
      letter_title TEXT NOT NULL,
      letter_body TEXT NOT NULL,
      authorized_signatory TEXT DEFAULT 'Ms. Shilpa Sunil Umare, Founder & Director',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT UNIQUE NOT NULL,
      donor_name TEXT NOT NULL,
      donor_email TEXT NOT NULL,
      donor_phone TEXT,
      donor_pan TEXT,
      donor_address TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      cause TEXT DEFAULT 'General Charitable Corpus',
      payment_method TEXT DEFAULT 'UPI',
      payment_gateway TEXT DEFAULT 'Direct UPI / QR',
      gateway_payment_id TEXT,
      gateway_order_id TEXT,
      payment_status TEXT DEFAULT 'Completed',
      tax_exemption_note TEXT DEFAULT 'Applied solely to Section 8 charitable objectives under Section 8 of the Companies Act, 2013.',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL DEFAULT 'Ground Activity Report',
      summary TEXT,
      content TEXT NOT NULL,
      featured_image TEXT,
      author TEXT DEFAULT 'Editorial Board, RI8WIN Foundation',
      published_date TEXT NOT NULL,
      is_published INTEGER DEFAULT 1,
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS custom_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      meta_description TEXT,
      content TEXT NOT NULL,
      banner_image TEXT,
      show_in_navbar INTEGER DEFAULT 1,
      navbar_order INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      objectives TEXT,
      target_audience TEXT,
      status TEXT DEFAULT 'Active',
      lead_coordinator TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
      description TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_time TEXT,
      venue_type TEXT DEFAULT 'Offline',
      venue_address TEXT,
      capacity INTEGER DEFAULT 50,
      status TEXT DEFAULT 'Upcoming',
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      volunteer_id INTEGER REFERENCES volunteer_applications(id) ON DELETE SET NULL,
      participant_name TEXT NOT NULL,
      participant_email TEXT NOT NULL,
      participant_mobile TEXT,
      attended INTEGER DEFAULT 0,
      attendance_marked_at DATETIME,
      attendance_marked_by TEXT,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, participant_email)
    );

    CREATE TABLE IF NOT EXISTS organization_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_v_app_ref ON volunteer_applications(application_ref);
    CREATE INDEX IF NOT EXISTS idx_v_mem_id ON volunteer_applications(membership_id);
    CREATE INDEX IF NOT EXISTS idx_v_status ON volunteer_applications(status);
    CREATE INDEX IF NOT EXISTS idx_v_email ON volunteer_applications(email);
    CREATE INDEX IF NOT EXISTS idx_c_num ON certificates(certificate_number);
    CREATE INDEX IF NOT EXISTS idx_c_app_id ON certificates(application_id);
    CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);
    CREATE INDEX IF NOT EXISTS idx_page_slug ON custom_pages(slug);
    CREATE INDEX IF NOT EXISTS idx_donations_receipt ON donations(receipt_number);
    CREATE INDEX IF NOT EXISTS idx_letters_ref ON official_letters(reference_number);
  `);

  // Column migrations for dynamic images and certificates
  try { db.exec("ALTER TABLE programs ADD COLUMN image_url TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE events ADD COLUMN image_url TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE certificates ADD COLUMN certificate_type TEXT DEFAULT 'Volunteer Service'"); } catch (e) {}
  try { db.exec("ALTER TABLE certificates ADD COLUMN role_title TEXT DEFAULT 'Volunteer Service Member'"); } catch (e) {}
  try { db.exec("ALTER TABLE certificates ADD COLUMN tenure_or_hours TEXT DEFAULT '100+ Hours Community Service'"); } catch (e) {}
  try { db.exec("ALTER TABLE certificates ADD COLUMN remarks TEXT"); } catch (e) {}

  seedInitialData();
}

function seedInitialData() {
  // Check if admin user exists
  const adminCheck = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@ri8win.org');
  if (!adminCheck) {
    const adminHash = bcrypt.hashSync('Admin@RI8Win2026!', 10);
    const coordHash = bcrypt.hashSync('Coordinator@2026!', 10);

    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, role, phone)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'admin@ri8win.org',
      adminHash,
      'Director / Super Administrator',
      'super_admin',
      '+91 8691016082'
    );

    insertUser.run(
      'coordinator@ri8win.org',
      coordHash,
      'Volunteer Lead Officer',
      'volunteer_coordinator',
      '+91 9765306928'
    );
  }

  // Seed Organization Settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM organization_settings').get();
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare('INSERT INTO organization_settings (key, value) VALUES (?, ?)');
    
    const settings = {
      org_name: 'RI8WIN NOBEL PATH FOUNDATION',
      org_meaning: 'Ri8NoblePath — Right Noble Path',
      legal_structure: 'Section 8 Company under the Companies Act, 2013, India (Non-Profit, Non-Religious, Non-Political)',
      cin: 'U88900MH2026NPL481549',
      pan: 'AAQCR4085D',
      tan: 'PNER43317B',
      date_of_incorporation: '06 October 2026',
      approving_authority: 'Ministry of Corporate Affairs, Central Registration Centre, Government of India',
      registered_office: 'The Springs 2, 701, Plot No 15, Sector 20, Roadpali, Kalamboli, Navi Mumbai, Maharashtra - 410218, India',
      official_email: 'contact@ri8winnobelpath.org',
      official_phone: '+91 8691016082',
      area_of_operation: 'Pan-India operations across states, with potential for lawful international development collaboration.',
      vision: 'To build a sustainable and inclusive society where education, health, and environmental responsibility are accessible to all.',
      mission: 'To promote community empowerment through education, preventive health awareness, and environmentally sustainable practices based on the Noble RI8 framework.',
      funds_utilization: 'The income and property of the Foundation shall be applied solely towards the promotion of its objectives. No portion shall be distributed as profit to its members. Proper accounts are maintained and audited as required by law.',
      governing_body: JSON.stringify([
        {
          name: 'Ms. Shilpa Sunil Umare',
          role: 'Director & Co-Founder',
          qualification: 'MA Economics, Early Childhood Educator',
          photo: '/assets/Shilpa Photo.jpg',
          contact: 'shilpa.manwatkar@gmail.com'
        },
        {
          name: 'Ms. Sarika Uttamchand Wakde',
          role: 'Director & Co-Founder',
          qualification: 'MA, Entrepreneur & Community Advocate',
          photo: '/assets/Sarika Photo.png',
          contact: 'sarikauwakde1977@gmail.com'
        }
      ]),
      executive_members: JSON.stringify([
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
      ]),
      core_values: JSON.stringify([
        { title: 'Integrity', desc: 'Transparency and accountability in all activities and stewardship of resources.' },
        { title: 'Compassion', desc: 'Service with empathy, dignity, and deep respect for human welfare.' },
        { title: 'Inclusiveness', desc: 'Equal opportunities regardless of gender, social, or economic background.' },
        { title: 'Sustainability', desc: 'Responsible environmental, conservation, and agricultural practices.' },
        { title: 'Empowerment', desc: 'Strengthening youth, farmers, women, and marginalized communities.' },
        { title: 'Collaboration', desc: 'Active partnership with educational institutions, CSR partners, and communities.' },
        { title: 'Social Justice', desc: 'Promoting equality, human rights protection, and social harmony.' }
      ]),
      statutory_objectives: JSON.stringify([
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
      ]),
      ri8_framework: JSON.stringify([
        { id: 1, title: 'Right View', subtitle: 'Understanding sustainability and social responsibility.', education: 'Ethical learning & sustainability awareness.', health: 'Preventive healthcare & healthy lifestyles.', environment: 'Conservation & waste reduction.' },
        { id: 2, title: 'Right Intention', subtitle: 'Commitment to positive, ethical, community-focused actions.', education: 'Inclusive, value-based learning.', health: 'Healthy living & hygiene habits.', environment: 'Waste management & circular recycling.' },
        { id: 3, title: 'Right Speech', subtitle: 'Truthful, constructive, and awareness-driven communication.', education: 'Knowledge-sharing & educational campaigns.', health: 'Accurate health & hygiene information.', environment: 'Responsible climate communication.' },
        { id: 4, title: 'Right Action', subtitle: 'Responsible and impactful action for societal benefit.', education: 'Tutoring programs & practical training.', health: 'Health camps & sanitation initiatives.', environment: 'Clean-up drives & afforestation.' },
        { id: 5, title: 'Right Livelihood', subtitle: 'Ethical and sustainable means of livelihood.', education: 'Vocational skills & self-reliance.', health: 'Community wellness professions.', environment: 'Green jobs & eco enterprises.' },
        { id: 6, title: 'Right Concentration', subtitle: 'Focused efforts towards long-term sustainable impact.', education: 'Structured continuous learning.', health: 'Sustained preventive awareness.', environment: 'Long-term conservation projects.' },
        { id: 7, title: 'Right Mindfulness', subtitle: 'Conscious awareness of our actions and their societal impact.', education: 'Responsible active citizenship.', health: 'Mindful nutrition and wellness.', environment: 'Mindful consumption & zero-waste habits.' },
        { id: 8, title: 'Right Effort', subtitle: 'Consistent dedication towards positive societal change.', education: 'Improving access & quality of learning.', health: 'Persistent health awareness outreach.', environment: 'Sustained drives for cleaner surroundings.' }
      ])
    };

    for (const [k, v] of Object.entries(settings)) {
      insertSetting.run(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
  }

  // Seed Programs
  const progCount = db.prepare('SELECT COUNT(*) as count FROM programs').get();
  if (progCount.count === 0) {
    const insertProg = db.prepare(`
      INSERT INTO programs (title, category, description, objectives, target_audience, status, lead_coordinator)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertProg.run(
      'Shiksha Setu: Career Guidance & Mentorship Initiative',
      'Education and Youth',
      'Empowering underprivileged children and youth through educational tutoring, career counselling, mentorship networks, and skill readiness workshops.',
      'Provide structured mentorship, school support, and industry exposure to first-generation learners.',
      'High school students, college youth, and marginalized communities',
      'Active',
      'Ms. Shilpa Sunil Umare'
    );

    insertProg.run(
      'Yuva Kaushal: Youth Employability & Digital Skills',
      'Education and Youth',
      'Comprehensive vocational training, computer literacy, communication skills, and sports education to foster youth self-reliance and employability.',
      'Enhance digital literacy, professional readiness, and physical wellness.',
      'Unemployed and semi-urban youth',
      'Active',
      'Volunteer Lead Officer'
    );

    insertProg.run(
      'Arogya Chetna: Preventive Healthcare & Nutrition Awareness',
      'Health and Community Welfare',
      'Preventive health drives, nutrition awareness for children and mothers, hygiene workshops, clean drinking water promotion, and medical camps.',
      'Eradicate malnutrition, foster preventive health habits, and build community sanitation awareness.',
      'Mothers, children, rural families, and slum communities',
      'Active',
      'Ms. Sarika Uttamchand Wakde'
    );

    insertProg.run(
      'Harit Dhara: Tree Plantation & Circular Waste Management',
      'Environment and Agriculture',
      'Mass afforestation drives, neighborhood waste segregation, plastic reduction campaigns, and climate change education based on circular economy principles.',
      'Plant native trees, reduce landfill waste, and foster environmental responsibility in neighborhoods.',
      'Schools, resident welfare associations, and urban communities',
      'Active',
      'Volunteer Lead Officer'
    );

    insertProg.run(
      'Kisan Unnati: Sustainable Agriculture & Water Conservation',
      'Environment and Agriculture',
      'Promoting organic farming, soil health testing, micro-irrigation techniques, water harvesting, and direct market capacity building for rural farmers.',
      'Strengthen farmer livelihoods, conserve groundwater, and advocate eco-friendly agricultural practices.',
      'Smallholder farmers and rural farming clusters',
      'Active',
      'Director / Super Administrator'
    );

    insertProg.run(
      'Prerna: Women Empowerment & SHG Livelihood Initiative',
      'Women and Rural Empowerment',
      'Skill training for women, self-help group (SHG) enterprise incubation, financial literacy, and marketing avenues for handmade and organic products.',
      'Facilitate financial independence, leadership development, and entrepreneurial confidence.',
      'Rural and suburban women, SHG collectives',
      'Active',
      'Ms. Sarika Uttamchand Wakde'
    );

    insertProg.run(
      'Samvedna: Elderly Care & Animal Welfare Outreach',
      'Other Public Welfare',
      'Community outreach programs supporting elderly citizens, visits to old-age homes, stray animal care, community vaccination drives, and disaster relief preparedness.',
      'Foster empathy, dignity for senior citizens, and humane treatment of animals.',
      'Senior citizens, community animals, disaster-affected populations',
      'Active',
      'Volunteer Lead Officer'
    );
  }

  // Seed Events
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get();
  if (eventCount.count === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (title, category, program_id, description, event_date, event_time, venue_type, venue_address, capacity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      'Mega Plantation & Clean Earth Drive: Kalamboli Greens',
      'Environment and Agriculture',
      4,
      'Join us in planting 500 indigenous saplings and conducting a community plastic-cleanup drive along Roadpali & Kalamboli.',
      '2026-11-15',
      '07:30 AM - 11:30 AM',
      'Offline',
      'Sector 20 Community Park, Roadpali, Kalamboli, Navi Mumbai',
      100,
      'Upcoming'
    );

    insertEvent.run(
      'Career Guidance & Digital Skills Bootcamp for High School Youth',
      'Education and Youth',
      1,
      'Interactive workshop covering higher education roadmaps, STEM & vocational careers, scholarship opportunities, and basic digital literacy.',
      '2026-11-22',
      '10:00 AM - 02:00 PM',
      'Offline',
      'Community Youth Center, Ballarpur, Dist. Chandrapur, Maharashtra',
      80,
      'Upcoming'
    );

    insertEvent.run(
      'Preventive Healthcare & Pediatric Nutrition Checkup Camp',
      'Health and Community Welfare',
      3,
      'Free general health screening, height-weight-BMI analysis for children, and dietary guidance session by certified healthcare volunteers.',
      '2026-11-29',
      '09:00 AM - 01:00 PM',
      'Offline',
      'Zilla Parishad Primary School Hall, Ballarpur, Chandrapur',
      120,
      'Upcoming'
    );

    insertEvent.run(
      'Webinar: Right Livelihood & Eco-Friendly Micro-Enterprises',
      'Women and Rural Empowerment',
      6,
      'Online orientation session explaining how women and youth can launch sustainable green enterprises in organic composting, cloth bags, and upcycling.',
      '2026-12-06',
      '04:00 PM - 06:00 PM',
      'Online',
      'Zoom Live Meeting (Link sent upon registration)',
      250,
      'Upcoming'
    );
  }

  // Seed a sample verified and approved volunteer for instant demonstration of certificate & verification
  const volCount = db.prepare('SELECT COUNT(*) as count FROM volunteer_applications').get();
  if (volCount.count === 0) {
    const volPasswordHash = bcrypt.hashSync('Volunteer@2026!', 10);
    const userInsert = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, role, phone)
      VALUES (?, ?, ?, ?, ?)
    `).run('aarav.sharma@example.com', volPasswordHash, 'Aarav Sharma', 'volunteer', '9876543210');

    const appInsert = db.prepare(`
      INSERT INTO volunteer_applications (
        application_ref, user_id, full_name, dob, is_minor, gender, email, mobile,
        city, state, address, qualification, institution, occupation, skills,
        experience, interests, availability_mode, preferred_days_times, preferred_location,
        motivation, declaration_accurate, declaration_guidelines, declaration_consent,
        status, verification_remarks, assigned_verifier, verification_date,
        safeguarding_checked, approval_date, approving_officer, membership_id, certificate_status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `).run(
      'APP-2026-00001',
      userInsert.lastInsertRowid,
      'Aarav Sharma',
      '1998-05-14',
      0,
      'Male',
      'aarav.sharma@example.com',
      '9876543210',
      'Navi Mumbai',
      'Maharashtra',
      'Plot 42, Sector 19, Kharghar, Navi Mumbai',
      'B.Tech in Environmental Engineering',
      'Mumbai University',
      'Environmental Consultant & Eco-Educator',
      'Tree plantation, waste management, public speaking, team coordination',
      '2 years active volunteering with urban clean-up groups',
      JSON.stringify(['Environmental sustainability', 'Waste management and recycling', 'Student mentoring']),
      'both',
      'Weekends (Saturday/Sunday mornings)',
      'Navi Mumbai & Online',
      'Committed to building sustainable communities through direct action and empowering children with eco-awareness.',
      1, 1, 1,
      'Approved',
      'Identity and educational credentials verified against government records. Safeguarding guidelines reviewed.',
      'Volunteer Lead Officer',
      '2026-10-12 11:30:00',
      1,
      '2026-10-14 14:00:00',
      'Ms. Shilpa Sunil Umare (Director)',
      'RI8V-2026-00001',
      'Issued'
    );

    const certInsert = db.prepare(`
      INSERT INTO certificates (
        certificate_number, application_id, volunteer_name, membership_id, issue_date, status, authorized_signatory
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'CERT-RI8V-2026-00001',
      appInsert.lastInsertRowid,
      'Aarav Sharma',
      'RI8V-2026-00001',
      '14 October 2026',
      'Issued',
      'Ms. Shilpa Sunil Umare, Founder & Director'
    );

    // Register Aarav for the first event
    db.prepare(`
      INSERT INTO event_registrations (event_id, volunteer_id, participant_name, participant_email, participant_mobile, attended)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(1, appInsert.lastInsertRowid, 'Aarav Sharma', 'aarav.sharma@example.com', '9876543210', 0);

    // Add Audit Log
    db.prepare(`
      INSERT INTO audit_logs (action, actor_name, actor_role, target_type, target_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'INITIAL_SEED',
      'System',
      'System',
      'System',
      '0',
      'Seeded foundational legal disclosures, initial programs, upcoming events, and verified demo volunteer.'
    );
  }

  // Ensure default executive member & staff accounts exist
  ensureMemberAndStaffAccounts();

  // Ensure policy documents & page copy exist in settings
  ensurePolicyAndPageCopySettings();
}

function ensureMemberAndStaffAccounts() {
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, phone)
    VALUES (?, ?, ?, ?, ?)
  `);

  const memberHash = bcrypt.hashSync('Member@RI8Win2026!', 10);
  const staffHash = bcrypt.hashSync('Staff@RI8Win2026!', 10);

  const defaultAccounts = [
    { email: 'member@ri8win.org', name: 'Dr. Rameshwar V. Deshmukh', role: 'executive_member', phone: '+91 9822012345', hash: memberHash },
    { email: 'rameshwar.deshmukh@ri8win.org', name: 'Dr. Rameshwar V. Deshmukh', role: 'executive_member', phone: '+91 9822012345', hash: memberHash },
    { email: 'sunita.patil@ri8win.org', name: 'Adv. Sunita K. Patil', role: 'executive_member', phone: '+91 9822054321', hash: memberHash },
    { email: 'rajesh.agrawal@ri8win.org', name: 'CA Rajesh M. Agrawal', role: 'executive_member', phone: '+91 9822098765', hash: memberHash },
    { email: 'anil.gokhale@ri8win.org', name: 'Mr. Anil S. Gokhale', role: 'executive_member', phone: '+91 9822067890', hash: memberHash },
    { email: 'staff@ri8win.org', name: 'Foundation Program Officer (Honorary)', role: 'employee', phone: '+91 8691016082', hash: staffHash }
  ];

  for (const acc of defaultAccounts) {
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(acc.email);
    if (!existing) {
      insertUser.run(acc.email.toLowerCase(), acc.hash, acc.name, acc.role, acc.phone);
    }
  }
}

function ensurePolicyAndPageCopySettings() {
  const getSetting = db.prepare('SELECT key FROM organization_settings WHERE key = ?');
  const insertSetting = db.prepare('INSERT INTO organization_settings (key, value) VALUES (?, ?)');

  const defaults = {
    volunteer_guidelines: `RI8WIN NOBEL PATH FOUNDATION
VOLUNTEER & PARTICIPANT CODE OF CONDUCT & OPERATIONAL GUIDELINES
(Section 8 of the Companies Act, 2013, Ministry of Corporate Affairs, India)

1. STATUTORY HONORARY STATUS (ZERO SALARY DISCLOSURE)
RI8WIN NOBEL PATH FOUNDATION is a non-profit company registered under Section 8 of the Companies Act, 2013. In accordance with statutory non-profit provisions, all volunteers, members, and field coordinators serve purely in an honorary capacity without salary, stipend, commercial remuneration, or expectation of profit distribution.

2. DIGNITY, RESPECT & NON-DISCRIMINATION
Every volunteer is required to treat fellow volunteers, program participants, beneficiaries, children, and community members with the highest degree of respect, dignity, and courtesy. The Foundation strictly prohibits discrimination, harassment, or prejudice on grounds of caste, religion, gender, sexual orientation, language, disability, or socio-economic standing.

3. CHILD PROTECTION & SAFEGUARDING
The Foundation operates free childhood digital literacy and nutrition camps. All volunteers interacting with minors or vulnerable persons must uphold strict safeguarding standards. Under no circumstances may a volunteer be alone in unmonitored closed spaces with a minor, photograph minors without guardian consent, or engage in abusive or disrespectful behavior.

4. ENVIRONMENTAL & FIELD SAFETY STANDARDS
During outdoor afforestation (tree plantation drives), plastic collection, and health camps, volunteers must prioritize safety protocols, use protective gear where required, respect local community guidelines, and ensure zero littering or environmental harm.

5. CONFIDENTIALITY & DATA PROTECTION
Volunteers with access to beneficiary records, medical screening logs, or administrative data must preserve absolute confidentiality under the Digital Personal Data Protection Act, 2023. Unauthorized dissemination, duplication, or commercial use of Foundation data is strictly prohibited.

6. CERTIFICATION & MEMBERSHIP CREDENTIALS
Official Certificates of Volunteer Service and Membership are issued exclusively upon satisfactory completion of assigned hours, orientation, and positive background verification. Any falsification, alteration, or unauthorized reproduction of Foundation certificates is a punishable offense under Indian statutory law.`,

    privacy_policy: `RI8WIN NOBEL PATH FOUNDATION
PRIVACY POLICY & PERSONAL DATA PROTECTION STATEMENT
(Compliant with the Digital Personal Data Protection Act, 2023 - DPDP Act, India)

1. ORGANIZATIONAL COMMITMENT
RI8WIN NOBEL PATH FOUNDATION (CIN: U88900MH2026NPL481549) is deeply committed to safeguarding the privacy and personal data of our volunteers, executive members, donors, program participants, and website visitors. We collect only data strictly necessary for fulfilling our charitable and non-profit objectives.

2. INFORMATION WE COLLECT
When you register as a volunteer, RSVP for community events, or apply for honorary membership, we collect:
- Full Name, Date of Birth, Gender, and Photograph (for official identification and certificate generation).
- Contact information: Registered Email Address, Mobile Number, Residential City and State.
- Educational qualifications, professional skills, and volunteering interests.
- Attendance and participation records in community drives and health camps.

3. HOW WE USE YOUR INFORMATION
Personal data is utilized exclusively for:
- Processing volunteer applications and conducting statutory safeguarding verifications.
- Issuing official, digitally verifiable Certificates of Membership and Volunteer Service.
- Event coordination, emergency contact, and communicating Foundation newsletters and project updates.
- Maintaining statutory compliance records mandated under the Companies Act, 2013 and MCA regulations.

4. ZERO COMMERCIAL EXPLOITATION (NO SELLING OF DATA)
The Foundation operates strictly as a non-profit entity. We NEVER sell, rent, monetize, trade, or disclose your personal data to commercial advertisers, marketing agencies, or unauthorized third parties.

5. PUBLIC CERTIFICATE VERIFICATION DISCLOSURE
To combat credential fraud, the Foundation maintains a public Certificate Verification Portal. Anyone entering an official Certificate Number or Membership ID may view the certificate holder's name, designation, issue date, and validity status. Sensitive personal details (such as date of birth, home address, or phone number) are never exposed via the public verification portal.

6. DATA RETENTION & SECURITY
We deploy industry-standard encryption, strict database access controls, and secure session tokens to protect your personal information against unauthorized access, alteration, or breach.

7. GRIEVANCE REDRESSAL & CONTACT
For questions regarding your personal data, data correction requests, or privacy concerns, please contact our Data Protection Officer:
Email: contact@ri8winnobelpath.org
Registered Office: The Springs 2, 701, Plot No 15, Sector 20, Roadpali, Kalamboli, Navi Mumbai, Maharashtra - 410218, India.`,

    terms_of_use: `RI8WIN NOBEL PATH FOUNDATION
OFFICIAL TERMS OF USE & STATUTORY DISCLAIMERS
(Governed under the Laws of India & the Companies Act, 2013)

1. LEGAL STATUS & NON-PROFIT NATURE
This website is the official portal of RI8WIN NOBEL PATH FOUNDATION (CIN: U88900MH2026NPL481549), a non-profit company incorporated under Section 8 of the Companies Act, 2013, Ministry of Corporate Affairs, Government of India. By accessing or using this website, you agree to comply with and be bound by these Terms of Use.

2. AUTHORIZED USE OF WEBSITE & INTELLECTUAL PROPERTY
All materials, content, logos, banners, educational curriculums, and software on this website are the intellectual property of RI8WIN NOBEL PATH FOUNDATION. You may access and download materials solely for lawful non-profit, educational, and personal volunteering purposes. Commercial reproduction, scraping, redistribution, or modification without prior written authorization is strictly prohibited.

3. CERTIFICATE INTEGRITY & ANTI-FRAUD NOTICE
The certificates issued by RI8WIN NOBEL PATH FOUNDATION (including Volunteer Membership Certificates and Honorary Executive Member Appointments) contain official registration marks, unique serial numbers, and cryptographic verification links. Any forging, tampering, duplicate issuance, or misrepresentation of Foundation credentials constitutes fraud under the Indian Penal Code and the Information Technology Act, 2000, and will be subjected to immediate legal prosecution.

4. STATUTORY FUNDS & DONATION APPLICATION
All contributions, donations, and institutional grants received by RI8WIN NOBEL PATH FOUNDATION are applied solely towards promoting education, preventive healthcare, and environmental sustainability in direct alignment with our Memorandum of Association. In strict adherence with Section 8(1)(b) of the Companies Act, 2013, no dividend, bonus, or profit share is distributed to any member or director.

5. LIMITATION OF LIABILITY & ACCURACY
While the Foundation undertakes all reasonable endeavors to maintain accurate and up-to-date information, the website content is provided "as is" for public information and charitable engagement. The Foundation assumes no liability for unintended technical interruptions or third-party telecommunication disruptions.

6. GOVERNING LAW & JURISDICTION
These Terms shall be governed by and interpreted in accordance with the laws of the Republic of India. Any disputes arising in connection with the website or Foundation operations shall be subject to the exclusive jurisdiction of the competent courts in Navi Mumbai / Mumbai, Maharashtra, India.`,

    home_hero_title: 'Right Noble Path: Empowering Communities Through Sustainable Action',
    home_hero_subtitle: 'A Section 8 non-profit organization promoting free education, preventive healthcare, and environmental sustainability based on the Noble RI8 framework.',
    about_intro_text: 'RI8WIN NOBEL PATH FOUNDATION is a non-profit company registered under Section 8 of the Companies Act, 2013 by the Central Registration Centre, Ministry of Corporate Affairs, Government of India.',
    about_history_text: 'Founded in October 2026 by founding directors Ms. Shilpa Sunil Umare and Ms. Sarika Uttamchand Wakde, the Foundation was established to build inclusive grassroots social transformation across Maharashtra and India.',
    about_statutory_text: 'Operating with complete statutory transparency, our income and assets are applied 100% towards charitable objectives. In strict compliance with Section 8 rules, directors and members serve in an honorary capacity without salary or profit distribution.',
    contact_page_heading: 'Official Correspondence & Registered Office',
    contact_page_subheading: 'Connect with our directors, executive officers, and project coordinators for partnerships, volunteering, or statutory verification.',
    contact_office_hours: 'Monday to Saturday: 09:30 AM – 06:00 PM IST',
    contact_inquiry_instructions: 'For formal communications, institutional collaborations, CSR initiatives, or certificate verification inquiries, please write to our official email or visit our registered office.',

    // Header & Global Brand
    header_tagline: 'Right Noble Path • Section 8 Non-Profit Co. (MCA India)',
    logo_badge_text: 'R8',

    // Footer Disclosures & Summary
    footer_summary: 'Meaning: Ri8NoblePath — Right Noble Path. A registered Section 8 non-profit organization under the Companies Act, 2013, Ministry of Corporate Affairs, Government of India.',
    footer_copyright: '© 2026 RI8WIN NOBEL PATH FOUNDATION. All rights reserved. Non-Profit, Non-Religious, Non-Political. Income applied solely to objectives. No profit distribution to members.',

    // Home Page Ground Activities & AI Photos
    home_activities_heading: 'Foundation Community Outreach in Action',
    home_activities_subheading: 'Realizing our Section 8 charitable mandate through active on-ground programs in digital education, preventive healthcare camps, and mass community afforestation.',
    home_activities: [
      {
        id: 1,
        title: 'Childhood Digital Literacy & Mentorship',
        category: 'Education & Youth',
        badge_color: 'sky',
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
        badge_color: 'emerald',
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
        badge_color: 'amber',
        description: 'Free doctor consultations, vital screenings, and preventive health awareness workshops for rural mothers, senior citizens, and children.',
        image: '/assets/activity_health_camp.jpg',
        link: '#programs',
        link_text: 'Learn About Health Camps →',
        visible: true
      }
    ],

    // Impact Metrics Counters
    metric_volunteers: '500+',
    metric_villages: '25+',
    metric_beneficiaries: '10,000+',
    metric_trees: '5,000+',

    // Objectives Page Content
    objectives_intro_text: 'Approved under the Memorandum of Association of RI8WIN NOBEL PATH FOUNDATION as a Section 8 non-profit company.',
    objectives_activity_categories: [
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
          'Preventive healthcare awareness workshops',
          'Community health and hygiene camps',
          'Nutrition awareness for mothers and children',
          'Mental wellness and stress reduction programs',
          'Support for senior citizens and persons with disabilities'
        ]
      },
      {
        title: 'Environmental Protection & Circular Economy',
        points: [
          'Tree plantation drives and biodiversity conservation',
          'Waste segregation, recycling, and composting',
          'Climate change and ecological awareness campaigns',
          'Clean water, water body restoration, and conservation',
          'Plastic-free community campaigns and zero-waste lifestyles'
        ]
      },
      {
        title: 'Agriculture, Farmers & Rural Livelihoods',
        points: [
          'Capacity building for small and marginal farmers',
          'Promotion of sustainable and organic farming practices',
          'Water-efficient irrigation and rainwater harvesting awareness',
          'Farmer producer group support and market linkages',
          'Rural women entrepreneurship through allied agro-activities'
        ]
      },
      {
        title: 'Women Empowerment & Social Inclusion',
        points: [
          'Skill training and self-help group facilitation',
          'Financial literacy and digital banking education',
          'Legal awareness and human rights empowerment',
          'Health, menstrual hygiene, and maternal welfare',
          'Support for marginalized and disadvantaged groups'
        ]
      },
      {
        title: 'Volunteerism & Civic Collaboration',
        points: [
          'Mobilizing youth for nation-building activities',
          'Corporate social responsibility (CSR) partnerships',
          'Collaboration with universities, schools, and NGOs',
          'Community disaster relief and crisis volunteer support',
          'Public interest research and civic awareness seminars'
        ]
      }
    ],

    // Other Public Page Texts
    verify_page_title: 'Verify Volunteer & Member Certificate',
    verify_page_subtitle: 'Scan the QR code or enter the Certificate Number to verify authentic issuance by RI8WIN NOBEL PATH FOUNDATION.',
    verify_page_note: 'This public verification service verifies certificate validity against live database records while safeguarding private contact info.',
    volunteer_reg_title: 'Become a Volunteer — Join RI8WIN NOBEL PATH FOUNDATION',
    volunteer_reg_subtitle: 'Contribute to education, health awareness, environmental protection, and community welfare. Applications undergo verification by authorized NGO officers prior to formal membership approval and certificate issuance.',
    transparency_additional_disclosures: 'The Foundation operates in strict accordance with the Companies Act, 2013 and Section 8 non-profit provisions. Audited annual financial statements and Board reports are prepared by statutory Chartered Accountants and filed with the Ministry of Corporate Affairs, Government of India.',

    // Brand Logo & Appearance
    logo_url: '',
    site_font_size: 'normal',

    // Donations & Payment Gateway (Section 8 Non-Profit Compliant)
    donation_enabled: true,
    donation_upi_id: 'ri8winfoundation@upi',
    donation_upi_qr: '',
    donation_bank_name: 'State Bank of India',
    donation_account_name: 'RI8WIN NOBEL PATH FOUNDATION',
    donation_account_number: '4815492026001',
    donation_ifsc: 'SBIN0012345',
    donation_branch: 'Kalamboli, Navi Mumbai, Maharashtra - 410218',
    donation_80g_note: 'RI8WIN NOBEL PATH FOUNDATION is a registered Section 8 non-profit company (CIN: U88900MH2026NPL481549). All contributions are dedicated 100% towards charitable programs in free digital education, preventive health screening, and community afforestation. No profits are distributed to members.',
    razorpay_enabled: false,
    razorpay_key_id: ''
  };

  for (const [key, value] of Object.entries(defaults)) {
    const existing = getSetting.get(key);
    if (!existing) {
      insertSetting.run(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }

  seedNewsCustomPagesAndLetters();
}

function seedNewsCustomPagesAndLetters() {
  // Seed sample news articles if table is empty
  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news_articles').get().count;
  if (newsCount === 0) {
    const insertNews = db.prepare(`
      INSERT INTO news_articles (title, slug, category, summary, content, featured_image, author, published_date, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertNews.run(
      'RI8WIN Foundation Launches Free Digital Literacy Initiative for Underprivileged Children',
      'digital-literacy-initiative-launch',
      'Ground Activity Report',
      'As part of our Section 8 mandate, our volunteer teams have initiated weekend digital literacy camps in Navi Mumbai and Raigad, introducing basic computing skills and online safety to over 150 students.',
      `RI8WIN NOBEL PATH FOUNDATION has officially commenced its flagship Weekend Digital Literacy & Skill Enhancement Drive at community centers across Navi Mumbai and the Raigad belt.

Conducted under the direct mentorship of founding directors Ms. Shilpa Sunil Umare and Ms. Sarika Uttamchand Wakde, the campaign provides underprivileged youth with hands-on computer practice, introductory coding fundamentals, internet hygiene, and basic digital productivity tools.

Key Highlights:
- Over 150 children registered in the initial cohort
- Voluntary instructors providing interactive, self-paced guidance
- 100% free educational material provided without commercial fees
- In strict adherence to Section 8 rules, all trainers serve purely on an honorary, non-remunerative basis

"Education is the most sustainable vehicle for breaking systemic poverty. Our objective is to ensure every underprivileged child receives modern digital capability," stated Director Ms. Shilpa Umare.`,
      '/assets/activity_education_1792920473371.jpg',
      'Education & Outreach Wing',
      '18 October 2026',
      1
    );

    insertNews.run(
      'Mass Community Afforestation Drive: 50+ Native Trees Planted at Roadpali & Kalamboli',
      'mass-tree-plantation-drive-kalamboli',
      'Ground Activity Report',
      'In alignment with the Noble RI8 environmental conservation principles, founding directors and registered volunteers participated in planting native shade and fruit trees.',
      `Demonstrating active ground commitment to the Noble RI8 environmental mandate, RI8WIN NOBEL PATH FOUNDATION organized a community-driven tree plantation and biodiversity drive at Roadpali and Kalamboli sectors.

Coordinated in collaboration with local citizen groups, the campaign involved planting over 50 native Indian tree varieties including Neem, Peepal, Banyan, and Gulmohar saplings equipped with protective tree-guards.

Program Pillars:
- Geo-tagging and volunteer adoption of saplings to ensure high survival rates
- Neighborhood awareness seminars on waste segregation and plastic reduction
- Distribution of seed balls to local school students for home gardening

The Foundation extends its sincere appreciation to all participating volunteers and civic partners who made this drive a resounding environmental success.`,
      '/assets/activity_tree_plantation_1792920495067.jpg',
      'Environmental Action Cell',
      '22 October 2026',
      1
    );

    insertNews.run(
      'Statutory Transparency Update: Foundation Completes MCA Section 8 Incorporations and PAN/TAN Registration',
      'statutory-transparency-mca-registration',
      'Statutory Announcement',
      'RI8WIN NOBEL PATH FOUNDATION has received official Certificate of Incorporation from the Ministry of Corporate Affairs, CRC, Government of India (CIN: U88900MH2026NPL481549).',
      `RI8WIN NOBEL PATH FOUNDATION announces the formal completion and approval of its incorporation as a non-profit company under Section 8 of the Companies Act, 2013, by the Central Registration Centre, Ministry of Corporate Affairs, Government of India.

Statutory Identifiers:
- Corporate Identity Number (CIN): U88900MH2026NPL481549
- Income Tax Permanent Account Number (PAN): AAQCR4085D
- Tax Deduction Account Number (TAN): PNER43317B
- Date of Incorporation: 06 October 2026
- Registered Office: The Springs 2, 701, Plot No 15, Sector 20, Roadpali, Kalamboli, Navi Mumbai, Maharashtra - 410218, India

Operating in strict compliance with Section 8 provisions, the Foundation is legally prohibited from distributing profits or dividends to its members. 100% of receipts, donations, and assets are irrevocably dedicated to public charitable objectives.`,
      '/assets/activity_health_camp_1792920515632.jpg',
      'Statutory Compliance Committee',
      '24 October 2026',
      1
    );
  }

  // Seed sample custom page if table is empty
  const pageCount = db.prepare('SELECT COUNT(*) as count FROM custom_pages').get().count;
  if (pageCount === 0) {
    const insertPage = db.prepare(`
      INSERT INTO custom_pages (title, slug, meta_description, content, banner_image, show_in_navbar, navbar_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPage.run(
      'CSR Partnerships & Institutional Alliances',
      'csr-partnerships',
      'Collaborate with RI8WIN NOBEL PATH FOUNDATION for Corporate Social Responsibility initiatives under Section 135 of the Companies Act.',
      `<h3>Corporate Social Responsibility (CSR) with RI8WIN Foundation</h3>
<p class="text-sm leading-relaxed text-gray-700">RI8WIN NOBEL PATH FOUNDATION partners with public corporations, private enterprises, philanthropic trusts, and institutional donors to execute impactful, statutory-compliant CSR initiatives under Schedule VII of the Companies Act, 2013.</p>

<h4 class="text-base font-bold text-[#0369a1] mt-6 mb-2">Our Key CSR Focus Verticals:</h4>
<ul class="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-700">
  <li><strong>Digital Education & Bridge Learning:</strong> Equipping rural and urban-slum schools with digital tablets, STEM learning kits, and teacher enablement workshops.</li>
  <li><strong>Preventive Healthcare & Diagnostic Camps:</strong> Mobile healthcare units, malnutrition screening for children, and maternal health education.</li>
  <li><strong>Mass Afforestation & Urban Green Corridors:</strong> Native tree plantation, urban Miyawaki forests, rainwater harvesting, and community composting.</li>
  <li><strong>Women Livelihood & Self-Help Clusters:</strong> Vocational tailoring, handicrafts, micro-entrepreneurship training, and financial literacy.</li>
</ul>

<h4 class="text-base font-bold text-[#0369a1] mt-6 mb-2">Governance, Audit & Reporting Integrity:</h4>
<p class="text-sm leading-relaxed text-gray-700">All CSR allocations undergo independent statutory chartered accountant audits, milestone-based utilization reporting, geo-tagged activity documentation, and third-party social impact assessments.</p>

<div class="p-4 bg-sky-50 rounded-xl border border-sky-200 mt-6 text-xs text-sky-900">
  <strong>CSR Inquiries & Proposals:</strong> Write directly to our Governing Board at <a href="mailto:contact@ri8winnobelpath.org" class="font-bold underline">contact@ri8winnobelpath.org</a> or visit our Registered Office at Kalamboli, Navi Mumbai.
</div>`,
      '/assets/Banner.png',
      1,
      1,
      'Published'
    );
  }

  // Seed sample official letter if table is empty
  const letterCount = db.prepare('SELECT COUNT(*) as count FROM official_letters').get().count;
  if (letterCount === 0) {
    const insertLetter = db.prepare(`
      INSERT INTO official_letters (
        reference_number, letter_type, recipient_name, recipient_role, recipient_email,
        recipient_phone, recipient_address, membership_or_emp_id, issue_date, effective_date,
        service_period, program_department, letter_title, letter_body, authorized_signatory, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLetter.run(
      'RI8WIN/HON/2026/001',
      'Honorary Appointment Letter (Section 8 Compliant)',
      'Dr. Rameshwar V. Deshmukh',
      'Vice President (Honorary)',
      'rameshwar.deshmukh@ri8winnobelpath.org',
      '+91 9823012345',
      'Plot 42, Sector 19, Kharghar, Navi Mumbai, Maharashtra - 410210',
      'RI8-EXEC-2026-001',
      '06 October 2026',
      '06 October 2026',
      '3 Years (Honorary Voluntary Service)',
      'Executive Governance & Civic Collaboration',
      'OFFICIAL CONFIRMATION OF APPOINTMENT AS HONORARY VICE PRESIDENT',
      `Dear Dr. Rameshwar V. Deshmukh,

On behalf of the Board of Directors of RI8WIN NOBEL PATH FOUNDATION, we take immense pleasure in confirming your appointment as Honorary Vice President of the Foundation with effect from 06 October 2026.

1. STATUTORY HONORARY NATURE (ZERO SALARY DISCLOSURE)
Pursuant to Section 8(1)(b) & Section 8(1)(c) of the Companies Act, 2013, Ministry of Corporate Affairs, Government of India, RI8WIN NOBEL PATH FOUNDATION is a registered non-profit company. In strict compliance with Section 8 legal provisions, this appointment is entirely in an honorary capacity without salary, commercial remuneration, stipend, bonus, or profit-sharing.

2. CORE RESPONSIBILITIES & CHARITABLE MANDATE
In your esteemed honorary capacity, you shall provide strategic direction and mentorship across:
- Guiding the Foundation's Free Digital Literacy and Youth Skill Development programs.
- Leading civic partnerships with universities, colleges, and voluntary organizations.
- Advising on ethical volunteer management and community safeguarding protocols.
- Representing the Foundation in social forums and institutional seminars.

3. TENURE & ETHICAL COMMITMENT
Your initial tenure shall be for a period of three (3) years, subject to mutual renewal. You agree to uphold the highest standards of integrity, transparency, child safeguarding, and non-discrimination as mandated by our Volunteer & Office Bearer Guidelines.

We warmly welcome you to the RI8WIN NOBEL PATH FOUNDATION family and look forward to advancing our Right Noble Path objectives together.`,
      'Ms. Shilpa Sunil Umare & Ms. Sarika Uttamchand Wakde, Directors',
      'Active'
    );
  }
}

initSchema();

module.exports = {
  db,
  initSchema
};
