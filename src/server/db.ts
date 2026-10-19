import fs from 'fs';
import path from 'path';
import { DatabaseSchema, Project, Skill, Service, ContactMessage, ProfileInfo, AdminUser, Review } from './types';
import { hashPassword } from './auth';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'portfolio-db.json');

const INITIAL_PROFILE: ProfileInfo = {
  name: 'Muhammad Sohail',
  title: 'Web Developer',
  headline: "Hello, I'm Muhammad Sohail",
  bio: "I'm Muhammad Sohail, a Software Engineering student with a strong interest in web development, graphic design, editing and AI. I love turning ideas into real projects and continuously learning new technologies.",
  education: 'BS Software Engineering',
  training: 'Saylani Mass IT Training (SMIT) – Web Development',
  location: 'Warsak Road, Peshawar, Pakistan',
  email: 'Sohailsk7882261@gmail.com',
  phone: '0328 5490043',
  whatsappNumber: '+923285490043',
  githubUrl: 'https://github.com/Sohail-star',
  linkedinUrl: 'https://www.linkedin.com/in/muhammad-sohail-8a32102ab/',
  twitterUrl: 'https://x.com',
  cvUrl: '/downloads/Mohammad_Sohail_Resume.pdf',
  portraitUrl: '/images/31.jpg',
};

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    title: 'Web Development',
    description: 'Responsive and modern websites using latest technologies.',
    icon: 'code',
    features: ['React & Next.js SPAs', 'Full-stack Node/Express APIs', 'Tailwind CSS responsive design', 'Performance & SEO optimization'],
    sortOrder: 1,
  },
  {
    id: 'srv-2',
    title: 'Graphic Design',
    description: 'Logo, banner, social media posts and more.',
    icon: 'palette',
    features: ['Brand Identity & Monograms', 'Social Media Graphics', 'UI/UX Wireframes in Figma', 'Marketing collateral'],
    sortOrder: 2,
  },
  {
    id: 'srv-3',
    title: 'Editing & Video',
    description: 'Video editing, thumbnail design and content creation.',
    icon: 'video',
    features: ['Short-form video editing', 'High-CTR YouTube Thumbnails', 'Motion transitions', 'Color grading & audio clean-up'],
    sortOrder: 3,
  },
  {
    id: 'srv-4',
    title: 'AI & Automation',
    description: 'AI tools, automation and smart solutions.',
    icon: 'bot',
    features: ['LLM workflow integrations', 'Automated data pipelines', 'Custom prompt engineering', 'Productivity scripts'],
    sortOrder: 4,
  },
];

const INITIAL_SKILLS: Skill[] = [
  { id: 'sk-1', name: 'HTML5', category: 'frontend', icon: 'html', proficiency: 95, featured: true, sortOrder: 1 },
  { id: 'sk-2', name: 'CSS3', category: 'frontend', icon: 'css', proficiency: 90, featured: true, sortOrder: 2 },
  { id: 'sk-3', name: 'JavaScript', category: 'frontend', icon: 'javascript', proficiency: 88, featured: true, sortOrder: 3 },
  { id: 'sk-4', name: 'React', category: 'frontend', icon: 'react', proficiency: 85, featured: true, sortOrder: 4 },
  { id: 'sk-5', name: 'Tailwind CSS', category: 'frontend', icon: 'tailwind', proficiency: 92, featured: true, sortOrder: 5 },
  { id: 'sk-6', name: 'Node.js', category: 'backend', icon: 'nodejs', proficiency: 80, featured: true, sortOrder: 6 },
  { id: 'sk-7', name: 'PostgreSQL', category: 'backend', icon: 'postgresql', proficiency: 75, featured: true, sortOrder: 7 },
  { id: 'sk-8', name: 'Figma', category: 'design', icon: 'figma', proficiency: 85, featured: true, sortOrder: 8 },
  { id: 'sk-9', name: 'Git & GitHub', category: 'tools', icon: 'git', proficiency: 82, featured: true, sortOrder: 9 },
  { id: 'sk-10', name: 'UI/UX Design', category: 'design', icon: 'layout', proficiency: 80, featured: true, sortOrder: 10 },
  { id: 'sk-11', name: 'AI Tools', category: 'tools', icon: 'sparkles', proficiency: 85, featured: true, sortOrder: 11 },
];

const INITIAL_PROJECTS: Project[] = [];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Usman Tariq',
    role: 'Fellow Student & SMIT Cohort Lead',
    quote:
      'Mohammad Sohail demonstrates exceptional commitment to frontend code clarity and modern UI design. His attention to detail in React and Tailwind CSS makes him stand out.',
    rating: 5,
    published: true,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'rev-2',
    name: 'Farhan Ali',
    role: 'Local Business Owner, Peshawar',
    quote:
      'Sohail developed a responsive website prototype that exceeded our expectations. Fast communication, clean design, and great technical problem-solving skills.',
    rating: 5,
    published: true,
    createdAt: '2026-02-20T14:30:00.000Z',
  },
  {
    id: 'rev-3',
    name: 'Zubair Shah',
    role: 'Senior Software Engineer & Mentor',
    quote:
      'A very dedicated Software Engineering student with a genuine hunger for building real-world projects. His proactive attitude and full-stack mindset are remarkable.',
    rating: 5,
    published: true,
    createdAt: '2026-03-05T09:15:00.000Z',
  },
];

class Database {
  private memoryData: DatabaseSchema;
  private initialized = false;

  constructor() {
    this.memoryData = this.getInitialSchema();
  }

  private getInitialSchema(): DatabaseSchema {
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass2026!';
    const adminEmail = process.env.ADMIN_EMAIL || 'sohailsk7882261@gmail.com';

    const defaultAdmin: AdminUser = {
      id: 'admin-1',
      name: 'Mohammad Sohail',
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      users: [defaultAdmin],
      projects: INITIAL_PROJECTS,
      skills: INITIAL_SKILLS,
      services: INITIAL_SERVICES,
      messages: [
        {
          id: 'msg-sample-1',
          name: 'Ahmed Khan',
          email: 'ahmed.k@example.com',
          phone: '+92 312 9876543',
          subject: 'Website Redesign Inquiry',
          message: 'Hello Sohail, I saw your portfolio and would like to discuss building a modern web application for our local business in Peshawar.',
          status: 'new',
          emailSent: true,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
      ],
      reviews: INITIAL_REVIEWS,
      profile: INITIAL_PROFILE,
    };
  }

  public init(): void {
    if (this.initialized) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
        const initial = this.getInitialSchema();
        this.memoryData = {
          users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : initial.users,
          projects: Array.isArray(parsed.projects) ? parsed.projects : initial.projects,
          skills: Array.isArray(parsed.skills) ? parsed.skills : initial.skills,
          services: Array.isArray(parsed.services) ? parsed.services : initial.services,
          messages: Array.isArray(parsed.messages) ? parsed.messages : initial.messages,
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : initial.reviews,
          profile: { ...initial.profile, ...(parsed.profile || {}) },
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('[DB] Could not load persisted data from disk, using in-memory store:', err);
    }

    this.initialized = true;
    console.log('[DB] Database initialized successfully');
  }

  private save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substr(2, 4)}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.memoryData, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Error saving data to disk:', err);
    }
  }

  // Profile Methods
  public getProfile(): ProfileInfo {
    this.init();
    return this.memoryData.profile;
  }

  public updateProfile(updates: Partial<ProfileInfo>): ProfileInfo {
    this.init();
    this.memoryData.profile = { ...this.memoryData.profile, ...updates };
    this.save();
    return this.memoryData.profile;
  }

  // Services Methods
  public getServices(): Service[] {
    this.init();
    return this.memoryData.services.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Projects Methods
  public getProjects(includeUnpublished = false): Project[] {
    this.init();
    let projects = this.memoryData.projects;
    if (!includeUnpublished) {
      projects = projects.filter((p) => p.published);
    }
    return projects.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getProjectBySlug(slug: string): Project | undefined {
    this.init();
    return this.memoryData.projects.find((p) => p.slug === slug);
  }

  public createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    this.init();
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memoryData.projects.push(newProject);
    this.save();
    return newProject;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    this.init();
    const index = this.memoryData.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.memoryData.projects[index] = {
      ...this.memoryData.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.memoryData.projects[index];
  }

  public deleteProject(id: string): boolean {
    this.init();
    const prevLength = this.memoryData.projects.length;
    this.memoryData.projects = this.memoryData.projects.filter((p) => p.id !== id);
    this.save();
    return this.memoryData.projects.length < prevLength;
  }

  // Skills Methods
  public getSkills(): Skill[] {
    this.init();
    return this.memoryData.skills.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public createSkill(skill: Omit<Skill, 'id'>): Skill {
    this.init();
    const newSkill: Skill = {
      ...skill,
      id: `sk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    this.memoryData.skills.push(newSkill);
    this.save();
    return newSkill;
  }

  public updateSkill(id: string, updates: Partial<Skill>): Skill | null {
    this.init();
    const index = this.memoryData.skills.findIndex((s) => s.id === id);
    if (index === -1) return null;

    this.memoryData.skills[index] = {
      ...this.memoryData.skills[index],
      ...updates,
    };
    this.save();
    return this.memoryData.skills[index];
  }

  public deleteSkill(id: string): boolean {
    this.init();
    const prevLength = this.memoryData.skills.length;
    this.memoryData.skills = this.memoryData.skills.filter((s) => s.id !== id);
    this.save();
    return this.memoryData.skills.length < prevLength;
  }

  // Messages Methods
  public getMessages(statusFilter?: 'new' | 'read' | 'replied', search?: string): ContactMessage[] {
    this.init();
    let messages = [...this.memoryData.messages];

    if (statusFilter) {
      messages = messages.filter((m) => m.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      messages = messages.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }

    return messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createMessage(data: Omit<ContactMessage, 'id' | 'createdAt' | 'status' | 'emailSent'> & { emailSent?: boolean }): ContactMessage {
    this.init();
    const newMessage: ContactMessage = {
      ...data,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'new',
      emailSent: data.emailSent ?? false,
      createdAt: new Date().toISOString(),
    };
    this.memoryData.messages.unshift(newMessage);
    this.save();
    return newMessage;
  }

  public updateMessageStatus(id: string, status: 'new' | 'read' | 'replied'): ContactMessage | null {
    this.init();
    const msg = this.memoryData.messages.find((m) => m.id === id);
    if (!msg) return null;
    msg.status = status;
    this.save();
    return msg;
  }

  public deleteMessage(id: string): boolean {
    this.init();
    const prevLength = this.memoryData.messages.length;
    this.memoryData.messages = this.memoryData.messages.filter((m) => m.id !== id);
    this.save();
    return this.memoryData.messages.length < prevLength;
  }

  // Reviews Methods
  public getReviews(
    publishedOnly: boolean = false,
    search?: string,
    rating?: number,
    status?: 'all' | 'published' | 'unpublished'
  ): Review[] {
    this.init();
    let list = [...(this.memoryData.reviews || [])];

    if (publishedOnly || status === 'published') {
      list = list.filter((r) => r.published);
    } else if (status === 'unpublished') {
      list = list.filter((r) => !r.published);
    }

    if (rating && rating > 0) {
      list = list.filter((r) => r.rating === rating);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q) ||
          r.quote.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getReviewById(id: string): Review | undefined {
    this.init();
    return this.memoryData.reviews.find((r) => r.id === id);
  }

  public createReview(data: {
    name: string;
    role: string;
    quote: string;
    rating: number;
    published?: boolean;
    avatarUrl?: string;
  }): Review {
    this.init();
    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name.trim(),
      role: data.role.trim(),
      quote: data.quote.trim(),
      rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
      published: data.published ?? true,
      avatarUrl: data.avatarUrl?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!this.memoryData.reviews) this.memoryData.reviews = [];
    this.memoryData.reviews.unshift(newReview);
    this.save();
    return newReview;
  }

  public updateReview(id: string, updates: Partial<Review>): Review | null {
    this.init();
    if (!this.memoryData.reviews) return null;
    const index = this.memoryData.reviews.findIndex((r) => r.id === id);
    if (index === -1) return null;

    this.memoryData.reviews[index] = {
      ...this.memoryData.reviews[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.memoryData.reviews[index];
  }

  public togglePublishReview(id: string): Review | null {
    this.init();
    if (!this.memoryData.reviews) return null;
    const review = this.memoryData.reviews.find((r) => r.id === id);
    if (!review) return null;
    review.published = !review.published;
    review.updatedAt = new Date().toISOString();
    this.save();
    return review;
  }

  public deleteReview(id: string): boolean {
    this.init();
    if (!this.memoryData.reviews) return false;
    const prevLength = this.memoryData.reviews.length;
    this.memoryData.reviews = this.memoryData.reviews.filter((r) => r.id !== id);
    this.save();
    return this.memoryData.reviews.length < prevLength;
  }

  // User Auth Methods
  public findUserByEmail(email: string): AdminUser | undefined {
    this.init();
    return this.memoryData.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public updateUserPassword(email: string, newPassword: string): boolean {
    this.init();
    const user = this.memoryData.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    user.passwordHash = hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  // Dashboard Stats
  public getStats() {
    this.init();
    const totalMessages = this.memoryData.messages.length;
    const newMessages = this.memoryData.messages.filter((m) => m.status === 'new').length;
    const totalProjects = this.memoryData.projects.length;
    const totalSkills = this.memoryData.skills.length;
    const totalReviews = this.memoryData.reviews ? this.memoryData.reviews.length : 0;
    const publishedReviews = this.memoryData.reviews
      ? this.memoryData.reviews.filter((r) => r.published).length
      : 0;
    return {
      totalMessages,
      newMessages,
      totalProjects,
      totalSkills,
      totalReviews,
      publishedReviews,
    };
  }
}

export const db = new Database();
