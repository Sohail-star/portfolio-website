import { Project, Skill, Service, ContactMessage, ProfileInfo, AdminStats, AuthUser, Review } from '../types';

const TOKEN_KEY = 'sohail_admin_jwt';

// Safe JSON fetch wrapper that guards against HTML error pages and non-JSON payloads
async function safeJsonFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const rawText = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(
        `Server error (${res.status}): ${rawText.slice(0, 140) || res.statusText}`
      );
    }
    throw new Error('Server returned an unexpected non-JSON response.');
  }

  let json: any;
  try {
    json = await res.json();
  } catch (parseErr: any) {
    throw new Error(parseErr?.message || 'Failed to parse JSON response from server');
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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Login failed');
    }
    this.setToken(json.token);
    return { token: json.token, user: json.user };
  },

  async getMe(): Promise<AuthUser> {
    const res = await fetch('/api/auth/me', {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) {
      this.removeToken();
      throw new Error(json.error || 'Not authenticated');
    }
    return json.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to change password');
    return json.message;
  },

  async logout(): Promise<void> {
    this.removeToken();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  },

  // Admin Endpoints
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/contact/admin/stats', {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch admin stats');
    return json.data;
  },

  async getAdminMessages(status?: string, search?: string): Promise<ContactMessage[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`/api/contact/admin?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch messages');
    return json.data;
  },

  async updateMessageStatus(id: string, status: 'new' | 'read' | 'replied'): Promise<ContactMessage> {
    const res = await fetch(`/api/contact/admin/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update message');
    return json.data;
  },

  async deleteMessage(id: string): Promise<void> {
    const res = await fetch(`/api/contact/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete message');
  },

  async getAdminProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects/admin/all', {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch all projects');
    return json.data;
  },

  async createProject(project: Partial<Project>): Promise<Project> {
    const res = await fetch('/api/projects/admin', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(project),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create project');
    return json.data;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const res = await fetch(`/api/projects/admin/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update project');
    return json.data;
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`/api/projects/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete project');
  },

  async updateProfile(updates: Partial<ProfileInfo>): Promise<ProfileInfo> {
    const res = await fetch('/api/profile/admin', {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update profile');
    return json.data;
  },

  async uploadPhoto(imageBase64: string): Promise<string> {
    const res = await fetch('/api/profile/upload-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to upload photo');
    return json.data.portraitUrl;
  },

  async createSkill(skill: Partial<Skill>): Promise<Skill> {
    const res = await fetch('/api/skills/admin', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(skill),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create skill');
    return json.data;
  },

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    const res = await fetch(`/api/skills/admin/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update skill');
    return json.data;
  },

  async deleteSkill(id: string): Promise<void> {
    const res = await fetch(`/api/skills/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete skill');
  },

  // Public Review Endpoints
  async getReviews(): Promise<Review[]> {
    const res = await fetch('/api/reviews');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch reviews');
    return json.data;
  },

  async submitReview(review: {
    name: string;
    role: string;
    quote: string;
    rating: number;
  }): Promise<Review> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to submit review');
    return json.data;
  },

  // Admin Review Endpoints
  async getAdminReviews(search?: string, rating?: number, status?: 'all' | 'published' | 'unpublished'): Promise<Review[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (rating) params.append('rating', rating.toString());
    if (status && status !== 'all') params.append('status', status);

    const res = await fetch(`/api/reviews/admin/all?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch admin reviews');
    return json.data;
  },

  async createAdminReview(review: Partial<Review>): Promise<Review> {
    const res = await fetch('/api/reviews/admin', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(review),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create review');
    return json.data;
  },

  async updateAdminReview(id: string, updates: Partial<Review>): Promise<Review> {
    const res = await fetch(`/api/reviews/admin/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update review');
    return json.data;
  },

  async togglePublishReview(id: string): Promise<Review> {
    const res = await fetch(`/api/reviews/admin/${id}/toggle-publish`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to toggle publish status');
    return json.data;
  },

  async deleteAdminReview(id: string): Promise<void> {
    const res = await fetch(`/api/reviews/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete review');
  },
};
