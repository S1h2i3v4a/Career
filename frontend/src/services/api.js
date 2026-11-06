/**
 * DevRadar Backend API Client
 * Connects Frontend directly to Live Node/Express + MongoDB Atlas Backend on Render
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://career-644s.onrender.com/api';

function getAuthHeader() {
  const token = localStorage.getItem('devradar_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // ================= AUTH =================
  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    if (data.token) localStorage.setItem('devradar_auth_token', data.token);
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    if (data.token) localStorage.setItem('devradar_auth_token', data.token);
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.user;
  },

  // ================= TRACKERS (MongoDB Isolated by User) =================
  async getTrackers(type = null) {
    const url = type ? `${API_BASE_URL}/trackers?type=${type}` : `${API_BASE_URL}/trackers`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async createTracker(item) {
    const res = await fetch(`${API_BASE_URL}/trackers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async updateTracker(id, updates) {
    const res = await fetch(`${API_BASE_URL}/trackers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async deleteTracker(id) {
    const res = await fetch(`${API_BASE_URL}/trackers/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // ================= WEBHOOK (Live Inbound Email) =================
  async triggerInboundEmailWebhook({ userEmail, sender, subject, hackathonName }) {
    const res = await fetch(`${API_BASE_URL}/webhook/email-inbound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, sender, subject, hackathonName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // ================= DIRECT GMAIL SYNC (Google App Password / IMAP) =================
  async syncGmail({ userEmail, appPassword, trackerItems }) {
    const res = await fetch(`${API_BASE_URL}/sync-gmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, appPassword, trackerItems })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gmail sync failed');
    return data;
  },

  // ================= SMART LINK SCRAPER (Live Meta & Dates) =================
  async scrapeLink(url, preferredType = null) {
    const res = await fetch(`${API_BASE_URL}/scrape-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, preferredType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Scrape link failed');
    return data;
  }
};
