import { Project, Skill, Service, ContactMessage, ProfileInfo, AdminStats, AuthUser, Review } from '../types';

const TOKEN_KEY = 'sohail_admin_jwt';

// Safe JSON fetch wrapper that guards against HTML error pages and non-JSON payloads
export async function safeJsonFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const rawText = await res.text().catch(() => '');

  if (!contentType.includes('application/json')) {
    const trimmed = rawText.trim();
    if (res.status === 404 || trimmed.startsWith('The page')) {
      throw new Error(
        `API endpoint not found (${res.status} on ${url}). Ensure backend API routes are running and deployed.`
      );
    }
    if (!res.ok) {
      const cleanSnippet = trimmed.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
      throw new Error(
        `Server error (${res.status}): ${cleanSnippet || res.statusText || 'Unexpected server response'}`
      );
    }
    throw new Error('Server returned an unexpected non-JSON response.');
  }

  let json: any;
  try {
    json = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error(
      `Invalid JSON response from server (${res.status}). Please try again.`
    );
  }

  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.message || `Request failed with status ${res.status}`);
  }

  return json;
}

export const api = {
  // Auth Token helpers
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },

  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  // Public Endpoints
  async getProfile(): Promise<{ profile: ProfileInfo; services: Service[] }> {
    const json = await safeJsonFetch('/api/profile');
    return json.data;
  },

  async getProjects(): Promise<Project[]> {
    const json = await safeJsonFetch('/api/projects');
    return json.data;
  },

  async getSkills(): Promise<Skill[]> {
    const json = await safeJsonFetch('/api/skills');
    return json.data;
  },

  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    honeypot?: string;
  }): Promise<{ message: string; id: string }> {
    const json = await safeJsonFetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return { message: json.message, id: json.data?.id };
  },

  // Auth Endpoints
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const json = await safeJsonFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    this.setToken(json.token);
    return { token: json.token, user: json.user };
  },

  async getMe(): Promise<AuthUser> {
    try {
      const json = await safeJsonFetch('/api/auth/me', {
        headers: this.getAuthHeaders(),
      });
      return json.user;
    } catch (err) {
      this.removeToken();
      throw err;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const json = await safeJsonFetch('/api/auth/change-password', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return json.message;
  },

  async logout(): Promise<void> {
    this.removeToken();
    try {
      await safeJsonFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  },

  // Admin Endpoints
  async getAdminStats(): Promise<AdminStats> {
    const json = await safeJsonFetch('/api/contact/admin/stats', {
      headers: this.getAuthHeaders(),
    });
    return json.data;
  },

  async getAdminMessages(status?: string, search?: string): Promise<ContactMessage[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const json = await safeJsonFetch(`/api/contact/admin?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    return json.data;
  },

  async updateMessageStatus(id: string, status: 'new' | 'read' | 'replied'): Promise<ContactMessage> {
    const json = await safeJsonFetch(`/api/contact/admin/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return json.data;
  },

  async deleteMessage(id: string): Promise<void> {
    await safeJsonFetch(`/api/contact/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  },

  async getAdminProjects(): Promise<Project[]> {
    const json = await safeJsonFetch('/api/projects/admin/all', {
      headers: this.getAuthHeaders(),
    });
    return json.data;
  },

  async createProject(project: Partial<Project>): Promise<Project> {
    const json = await safeJsonFetch('/api/projects/admin', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(project),
    });
    return json.data;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const json = await safeJsonFetch(`/api/projects/admin/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return json.data;
  },

  async deleteProject(id: string): Promise<void> {
    await safeJsonFetch(`/api/projects/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  },

  async updateProfile(updates: Partial<ProfileInfo>): Promise<ProfileInfo> {
    const json = await safeJsonFetch('/api/profile/admin', {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return json.data;
  },

  async uploadPhoto(imageBase64: string): Promise<string> {
    const json = await safeJsonFetch('/api/profile/upload-photo', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ imageBase64 }),
    });
    return json.data.portraitUrl;
  },

  async createSkill(skill: Partial<Skill>): Promise<Skill> {
    const json = await safeJsonFetch('/api/skills/admin', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(skill),
    });
    return json.data;
  },

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    const json = await safeJsonFetch(`/api/skills/admin/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return json.data;
  },

  async deleteSkill(id: string): Promise<void> {
    await safeJsonFetch(`/api/skills/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  },

  // Public Review Endpoints
  async getReviews(): Promise<Review[]> {
    const json = await safeJsonFetch('/api/reviews');
    return json.data;
  },

  async submitReview(review: {
    name: string;
    role: string;
    quote: string;
    rating: number;
  }): Promise<Review> {
    const json = await safeJsonFetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    return json.data;
  },

  // Admin Review Endpoints
  async getAdminReviews(search?: string, rating?: number, status?: 'all' | 'published' | 'unpublished'): Promise<Review[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (rating) params.append('rating', rating.toString());
    if (status && status !== 'all') params.append('status', status);

    const json = await safeJsonFetch(`/api/reviews/admin/all?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    return json.data;
  },

  async createAdminReview(review: Partial<Review>): Promise<Review> {
    const json = await safeJsonFetch('/api/reviews/admin', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(review),
    });
    return json.data;
  },

  async updateAdminReview(id: string, updates: Partial<Review>): Promise<Review> {
    const json = await safeJsonFetch(`/api/reviews/admin/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return json.data;
  },

  async togglePublishReview(id: string): Promise<Review> {
    const json = await safeJsonFetch(`/api/reviews/admin/${id}/toggle-publish`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return json.data;
  },

  async deleteAdminReview(id: string): Promise<void> {
    await safeJsonFetch(`/api/reviews/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  },
};
