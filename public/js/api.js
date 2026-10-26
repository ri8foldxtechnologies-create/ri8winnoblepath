// API Client for RI8WIN NOBEL PATH FOUNDATION Portal

const API = {
  token: localStorage.getItem('ri8win_token') || '',

  setToken(t) {
    this.token = t || '';
    if (t) {
      localStorage.setItem('ri8win_token', t);
    } else {
      localStorage.removeItem('ri8win_token');
    }
  },

  async request(endpoint, options = {}) {
    const headers = options.headers || {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Do not set Content-Type if FormData (e.g. file upload)
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        return data;
      } else {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Request failed with status ${response.status}`);
        }
        return response;
      }
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Auth Endpoints
  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) this.setToken(data.token);
    return data;
  },

  async register(full_name, email, password, phone) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name, email, password, phone })
    });
    if (data.token) this.setToken(data.token);
    return data;
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    this.setToken('');
  },

  async trackStatus(application_ref, email) {
    return this.request('/api/auth/track-status', {
      method: 'POST',
      body: JSON.stringify({ application_ref, email })
    });
  },

  // Volunteer Endpoints
  async submitVolunteerApplication(formData) {
    return this.request('/api/volunteer/register', {
      method: 'POST',
      body: formData
    });
  },

  async getMyProfile() {
    return this.request('/api/volunteer/my-profile');
  },

  async getMyEvents() {
    return this.request('/api/volunteer/my-events');
  },

  async registerEvent(event_id) {
    return this.request('/api/volunteer/register-event', {
      method: 'POST',
      body: JSON.stringify({ event_id })
    });
  },

  // Certificate Endpoints
  async verifyCertificate(certNumber) {
    return this.request(`/api/certificate/verify/${encodeURIComponent(certNumber)}`);
  },

  getCertificateDownloadUrl(certNumber) {
    return `/api/certificate/download/${encodeURIComponent(certNumber)}`;
  },

  // Programs Endpoints
  async getPrograms(category, status) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    return this.request(`/api/programs?${params.toString()}`);
  },

  async getProgram(id) {
    return this.request(`/api/programs/${id}`);
  },

  async createProgram(programData) {
    return this.request('/api/programs', {
      method: 'POST',
      body: JSON.stringify(programData)
    });
  },

  async updateProgram(id, programData) {
    return this.request(`/api/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(programData)
    });
  },

  async archiveProgram(id) {
    return this.request(`/api/programs/${id}`, {
      method: 'DELETE'
    });
  },

  // Events Endpoints
  async getEvents(category, status) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    return this.request(`/api/events?${params.toString()}`);
  },

  async getEvent(id) {
    return this.request(`/api/events/${id}`);
  },

  async createEvent(eventData) {
    return this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async updateEvent(id, eventData) {
    return this.request(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  async cancelEvent(id) {
    return this.request(`/api/events/${id}`, {
      method: 'DELETE'
    });
  },

  async rsvpEvent(eventId, rsvpData) {
    return this.request(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(rsvpData)
    });
  },

  async getEventAttendees(eventId) {
    return this.request(`/api/events/${eventId}/attendees`);
  },

  async markAttendance(eventId, registration_id, attended) {
    return this.request(`/api/events/${eventId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ registration_id, attended })
    });
  },

  // Admin Portal Endpoints
  async getAdminStats() {
    return this.request('/api/admin/dashboard-stats');
  },

  async getVolunteers(status, search, limit = 50, offset = 0) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    params.append('limit', limit);
    params.append('offset', offset);
    return this.request(`/api/admin/volunteers?${params.toString()}`);
  },

  async getVolunteer(id) {
    return this.request(`/api/admin/volunteers/${id}`);
  },

  async verifyVolunteer(id, data) {
    return this.request(`/api/admin/volunteers/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async approveVolunteer(id, remarks) {
    return this.request(`/api/admin/volunteers/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks })
    });
  },

  async revokeCertificate(certId, reason) {
    return this.request(`/api/admin/certificates/${certId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async reissueCertificate(certId) {
    return this.request(`/api/admin/certificates/${certId}/reissue`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  getExportVolunteersUrl() {
    return '/api/admin/export-volunteers';
  },

  async getAuditLogs() {
    return this.request('/api/admin/audit-logs');
  },

  // Settings
  async getSettings() {
    return this.request('/api/settings');
  },

  async updateSettings(settings) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  async uploadImage(file, target) {
    const formData = new FormData();
    formData.append('image', file);
    if (target) formData.append('target', target);
    return this.request('/api/settings/upload-image', {
      method: 'POST',
      body: formData
    });
  },

  // News & Activities Endpoints
  async getNews(category, search, all = 0) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (all) params.append('all', '1');
    return this.request(`/api/news?${params.toString()}`);
  },

  async getArticle(identifier) {
    return this.request(`/api/news/${encodeURIComponent(identifier)}`);
  },

  async createNews(articleData) {
    return this.request('/api/news', {
      method: 'POST',
      body: JSON.stringify(articleData)
    });
  },

  async updateNews(id, articleData) {
    return this.request(`/api/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData)
    });
  },

  async deleteNews(id) {
    return this.request(`/api/news/${id}`, {
      method: 'DELETE'
    });
  },

  // Custom Dynamic Pages Endpoints
  async getPages() {
    return this.request('/api/pages');
  },

  async getPage(slug) {
    return this.request(`/api/pages/${encodeURIComponent(slug)}`);
  },

  async getAllPagesAdmin() {
    return this.request('/api/pages/admin/all');
  },

  async createPage(pageData) {
    return this.request('/api/pages', {
      method: 'POST',
      body: JSON.stringify(pageData)
    });
  },

  async updatePage(id, pageData) {
    return this.request(`/api/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pageData)
    });
  },

  async deletePage(id) {
    return this.request(`/api/pages/${id}`, {
      method: 'DELETE'
    });
  },

  // Donation & Payment Endpoints
  async getDonationConfig() {
    return this.request('/api/donations/config');
  },

  async recordDonation(donationData) {
    return this.request('/api/donations/record', {
      method: 'POST',
      body: JSON.stringify(donationData)
    });
  },

  async getDonationReceipt(receiptNumber) {
    return this.request(`/api/donations/receipt/${encodeURIComponent(receiptNumber)}`);
  },

  async getAllDonationsAdmin() {
    return this.request('/api/donations/admin/all');
  },

  async deleteDonation(id) {
    return this.request(`/api/donations/${id}`, {
      method: 'DELETE'
    });
  },

  // Official Letters Endpoints
  async getLetters(type, search) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    return this.request(`/api/letters?${params.toString()}`);
  },

  async getLetter(id) {
    return this.request(`/api/letters/${id}`);
  },

  async createLetter(letterData) {
    return this.request('/api/letters', {
      method: 'POST',
      body: JSON.stringify(letterData)
    });
  },

  async updateLetter(id, letterData) {
    return this.request(`/api/letters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(letterData)
    });
  },

  async deleteLetter(id) {
    return this.request(`/api/letters/${id}`, {
      method: 'DELETE'
    });
  },

  // Direct Certificates Management Endpoints
  async getAllCertificatesAdmin(type, search) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    return this.request(`/api/certificate/admin/all?${params.toString()}`);
  },

  async issueCertificateDirectly(certData) {
    return this.request('/api/certificate/admin/issue', {
      method: 'POST',
      body: JSON.stringify(certData)
    });
  },

  async deleteCertificateAdmin(id) {
    return this.request(`/api/certificate/admin/${id}`, {
      method: 'DELETE'
    });
  }
};
