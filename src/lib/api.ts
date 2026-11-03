// ArchiFind Unified API Client

export const API_BASE =
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'http://localhost:5000';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('archifind_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('archifind_token', token);
    } else {
      localStorage.removeItem('archifind_token');
    }
  } catch (err) {
    console.error('Failed to set auth token in localStorage', err);
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getAuthToken();

  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// ---------------- TYPED API METHODS ----------------

export const api = {
  // Auth
  auth: {
    async register(data: { name?: string; fullName?: string; username: string; password: string; role?: string }) {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async login(data: { username: string; password: string }) {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async me() {
      const res = await fetchWithAuth('/api/auth/me');
      return res.json();
    },
    async updateProfile(profileData: { fullName?: string; phone?: string; bio?: string; location?: string; avatar?: string }) {
      const res = await fetchWithAuth('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return res.json();
    },
  },

  // Professionals
  professionals: {
    async list(params?: { search?: string; category?: string; location?: string; verified?: boolean; available?: boolean; minRating?: number; minExp?: number }) {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.category) query.append('category', params.category);
      if (params?.location) query.append('location', params.location);
      if (params?.verified) query.append('verified', 'true');
      if (params?.available) query.append('available', 'true');
      if (params?.minRating) query.append('minRating', String(params.minRating));
      if (params?.minExp) query.append('minExp', String(params.minExp));

      const res = await fetch(`${API_BASE}/api/professionals?${query.toString()}`);
      return res.json();
    },
    async get(id: string) {
      const res = await fetch(`${API_BASE}/api/professionals/${encodeURIComponent(id)}`);
      return res.json();
    },
    async saveProfile(formData: FormData) {
      const res = await fetchWithAuth('/api/professionals', {
        method: 'POST',
        body: formData,
      });
      return res.json();
    },
    async toggleAvailability(id: string, isAvailable?: boolean) {
      const res = await fetchWithAuth(`/api/professionals/${encodeURIComponent(id)}/availability`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable }),
      });
      return res.json();
    },
    async addPortfolio(id: string, data: FormData | { title: string; description: string; category: string; cost: string; imageUrl?: string }) {
      const isForm = data instanceof FormData;
      const res = await fetchWithAuth(`/api/professionals/${encodeURIComponent(id)}/portfolio`, {
        method: 'POST',
        body: isForm ? data : JSON.stringify(data),
      });
      return res.json();
    },
    async deletePortfolio(id: string, portfolioId: string) {
      const res = await fetchWithAuth(`/api/professionals/${encodeURIComponent(id)}/portfolio/${encodeURIComponent(portfolioId)}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    async submitVerification(formData: FormData) {
      const res = await fetchWithAuth('/api/professionals/verify-request', {
        method: 'POST',
        body: formData,
      });
      return res.json();
    },
  },

  // Favorites
  favorites: {
    async list() {
      const res = await fetchWithAuth('/api/user/favorites');
      return res.json();
    },
    async toggle(professionalId: string) {
      const res = await fetchWithAuth(`/api/user/favorites/${encodeURIComponent(professionalId)}`, {
        method: 'POST',
      });
      return res.json();
    },
  },

  // Quotes
  quotes: {
    async request(data: {
      professionalId: string;
      projectType: string;
      description: string;
      location?: string;
      budget?: string;
      timeline?: string;
      userPhone?: string;
    }) {
      const res = await fetchWithAuth('/api/quotes/request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async list() {
      const res = await fetchWithAuth('/api/quotes');
      return res.json();
    },
    async respond(id: string, data: { quoteAmount?: number; quoteNotes?: string; estimatedDays?: number; action?: 'accept' | 'reject' }) {
      const res = await fetchWithAuth(`/api/quotes/${encodeURIComponent(id)}/respond`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async updateStatus(id: string, status: 'accepted' | 'rejected' | 'in_progress' | 'completed') {
      const res = await fetchWithAuth(`/api/quotes/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
  },

  // Escrow & Payments
  payments: {
    async depositEscrow(data: { quoteId: string; amount?: number; cardNumber?: string; cardExpiry?: string; cardCvc?: string }) {
      const res = await fetchWithAuth('/api/payments/escrow/deposit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async releaseEscrow(quoteId: string) {
      const res = await fetchWithAuth('/api/payments/escrow/release', {
        method: 'POST',
        body: JSON.stringify({ quoteId }),
      });
      return res.json();
    },
    async list() {
      const res = await fetchWithAuth('/api/payments');
      return res.json();
    },
  },

  // Reviews
  reviews: {
    async list(professionalId: string) {
      const res = await fetch(`${API_BASE}/api/reviews/${encodeURIComponent(professionalId)}`);
      return res.json();
    },
    async submit(data: { professionalId: string; rating: number; comment: string }) {
      const res = await fetchWithAuth('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  // Chat
  chat: {
    async threads() {
      const res = await fetchWithAuth('/api/chat/threads');
      return res.json();
    },
    async getMessages(userId: string, professionalId: string) {
      const res = await fetch(`${API_BASE}/api/chat/${encodeURIComponent(userId)}/${encodeURIComponent(professionalId)}`);
      return res.json();
    },
    async send(data: { from: string; to: string; message: string }) {
      const res = await fetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async markRead(partnerId: string) {
      const res = await fetchWithAuth('/api/chat/mark-read', {
        method: 'PUT',
        body: JSON.stringify({ partnerId }),
      });
      return res.json();
    },
  },

  // Notifications
  notifications: {
    async list() {
      const res = await fetchWithAuth('/api/notifications');
      return res.json();
    },
    async markRead(id: string) {
      const res = await fetchWithAuth(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PUT',
      });
      return res.json();
    },
    async markAllRead() {
      const res = await fetchWithAuth('/api/notifications/read-all', {
        method: 'PUT',
      });
      return res.json();
    },
  },

  // Admin
  admin: {
    async stats() {
      const res = await fetchWithAuth('/api/admin/stats');
      return res.json();
    },
    async users() {
      const res = await fetchWithAuth('/api/admin/users');
      return res.json();
    },
    async toggleUserStatus(id: string, status?: string) {
      const res = await fetchWithAuth(`/api/admin/users/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    async deleteUser(id: string) {
      const res = await fetchWithAuth(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    async professionals() {
      const res = await fetchWithAuth('/api/admin/professionals');
      return res.json();
    },
    async verifyProfessional(id: string, action: 'approved' | 'rejected') {
      const res = await fetchWithAuth(`/api/admin/professionals/${encodeURIComponent(id)}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
      });
      return res.json();
    },
    async categories() {
      const res = await fetch(`${API_BASE}/api/admin/categories`);
      return res.json();
    },
    async addCategory(name: string, description?: string) {
      const res = await fetchWithAuth('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      return res.json();
    },
    async deleteCategory(id: string) {
      const res = await fetchWithAuth(`/api/admin/categories/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    async reports() {
      const res = await fetchWithAuth('/api/admin/reports');
      return res.json();
    },
    async resolveReport(id: string, resolution?: string) {
      const res = await fetchWithAuth(`/api/admin/reports/${encodeURIComponent(id)}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ resolution }),
      });
      return res.json();
    },
  },

  // Reports
  reports: {
    async submit(data: { targetId: string; targetName?: string; targetType: 'user' | 'professional'; reason: string; details?: string }) {
      const res = await fetchWithAuth('/api/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
};
