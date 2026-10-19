export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  technologies: string[];
  category: 'web' | 'design' | 'app' | 'all';
  liveDemoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'design' | 'tools';
  icon: string;
  proficiency?: number;
  featured: boolean;
  sortOrder: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  sortOrder: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  ipAddress?: string;
  emailSent: boolean;
  createdAt: string;
}

export interface ProfileInfo {
  name: string;
  title: string;
  headline: string;
  bio: string;
  education: string;
  training: string;
  location: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  cvUrl?: string;
  portraitUrl?: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  published: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DatabaseSchema {
  users: AdminUser[];
  projects: Project[];
  skills: Skill[];
  services: Service[];
  messages: ContactMessage[];
  reviews: Review[];
  profile: ProfileInfo;
}
