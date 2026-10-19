# Mohammad Sohail - Full-Stack Developer Portfolio

A production-grade, responsive developer portfolio and content management system for **Mohammad Sohail**, Computer Science student, web developer, graphic designer, and technology enthusiast.

Built with a dark navy & electric blue aesthetic matching the design reference, featuring interactive project showcases, real-time inquiry processing, and a protected admin control panel.

---

## 🎨 Visual Design & Theme System

- **Primary Background:** Dark Navy (`#020B1B`)
- **Secondary Background:** Deep Blue (`#06162D`)
- **Surface Elevation:** Indigo Navy (`#0B1F3F`)
- **Primary Accent:** Electric Blue (`#008CFF`)
- **Secondary Accent:** Cyan (`#00CFFF`)
- **Primary Text:** White (`#F8FAFC`)
- **Muted Text:** Blue Gray (`#A9B9D0`)
- **Borders & Glows:** Subtle Electric Blue (`rgba(0, 140, 255, 0.25)`)
- **Portrait:** Authentic black-and-white portrait framed in organic neon blue glowing contours with "Build Create Innovate" script.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS (v4) with custom glow & glassmorphism utilities
- **Icons:** Lucide React
- **Typography:** Plus Jakarta Sans & JetBrains Mono

### Backend & API
- **Runtime:** Node.js (v20+) with TypeScript via `tsx`
- **Server:** Express.js 4
- **Validation:** Zod schema validation
- **Authentication:** Salted PBKDF2 / scrypt password hashing + JWT Bearer token authorization
- **Database Layer:** Multi-engine persistent database (PostgreSQL with Prisma schema & migrations, plus resilient disk-persisted JSON store for immediate local execution)
- **Email Notifications:** Resend API & SMTP notification handling with zero-crash fallbacks

---

## 🚀 Quick Start & Local Development

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment variables:
```env
PORT=3000
NODE_ENV="development"
JWT_SECRET="your-secure-jwt-secret-here"
ADMIN_EMAIL="sohailsk7882261@gmail.com"
ADMIN_PASSWORD="your-strong-admin-password"
CONTACT_NOTIFICATION_EMAIL="Sohailsk7882261@gmail.com"
WHATSAPP_PHONE_NUMBER="+923285490043"
DATABASE_URL="postgresql://postgres:password@localhost:5432/portfolio"
```

### 3. Start Development Server
```bash
npm run dev
```
The full-stack server starts at `http://localhost:3000` with Express handling `/api/*` routes and Vite serving frontend assets.

### 4. Run Test Suite
```bash
npm run test
```
Executes the comprehensive automated test suite verifying password cryptography, JWT verification, database operations, contact form handling, and project mutations.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📡 REST API Documentation

### Public Endpoints
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and uptime |
| `GET` | `/api/profile` | Mohammad Sohail's bio, education, location, services |
| `GET` | `/api/projects` | List of published projects |
| `GET` | `/api/projects/:slug` | Single project details by slug |
| `GET` | `/api/skills` | Technical skills with categories and proficiencies |
| `POST` | `/api/contact` | Submit contact message (with rate limiting & validation) |

### Protected Admin Endpoints (`Authorization: Bearer <token>`)
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate admin credentials and receive JWT |
| `GET` | `/api/auth/me` | Fetch authenticated admin details |
| `POST` | `/api/auth/change-password` | Update admin password securely |
| `GET` | `/api/contact/admin/stats` | Dashboard statistics (total messages, projects, skills) |
| `GET` | `/api/contact/admin` | List all inquiries with status & search filters |
| `PATCH` | `/api/contact/admin/:id` | Update inquiry status (`new`, `read`, `replied`) |
| `DELETE` | `/api/contact/admin/:id` | Delete inquiry message |
| `GET` | `/api/projects/admin/all` | List all projects (including drafts) |
| `POST` | `/api/projects/admin` | Create a new project |
| `PATCH` | `/api/projects/admin/:id` | Update project details |
| `DELETE` | `/api/projects/admin/:id` | Delete a project |
| `PATCH` | `/api/profile/admin` | Update portfolio biography, location, and social links |

---

## 🔐 Admin Dashboard Access

Click the **Admin** shield icon in the top navigation bar or footer to access the dashboard.

- **Admin Account:** Access using your administrator email (`sohailsk7882261@gmail.com`) and your secure password. Password can be updated directly from **Settings > Security**.

Inside the admin panel:
1. **Overview:** Live KPI metrics (total inquiries, unread messages, projects, skills).
2. **Messages:** Search messages, view full contents, update status to `read` or `replied`, or delete.
3. **Projects:** Add new projects, edit links and technology tags, toggle published state.
4. **Skills:** Review and adjust technical proficiencies.
5. **Settings:** Update profile bio, phone number, WhatsApp link, and change login password.

---

## 🗄️ Database Architecture (Prisma & PostgreSQL)

The schema is defined in `prisma/schema.prisma` and includes:
- `admin_users`: Secure credentials, roles, and timestamps
- `projects`: Project thumbnails, categories (`web`, `design`, `app`), tags, and URLs
- `skills`: Categorized technical competencies
- `services`: Service offerings and capabilities
- `contact_messages`: Inquiries with status tracking and delivery indicators

To migrate against a real PostgreSQL instance:
```bash
npx prisma migrate deploy
```

---

## 🚢 Deployment Guide

### Deploying Frontend + Backend on a Single Container (Render, Railway, or Cloud Run)
1. Set Environment Variables: `PORT=3000`, `NODE_ENV=production`, `JWT_SECRET`, `ADMIN_PASSWORD`.
2. Build command: `npm run build`
3. Start command: `npm start`
4. The server serves both `/api/*` and the compiled static SPA from `dist/`.

### Deploying with Managed PostgreSQL
1. Create a PostgreSQL instance on Neon, Supabase, or AWS RDS.
2. Provide `DATABASE_URL` in environment variables.
3. Run `npx prisma db push` or apply `prisma/migrations/0001_init/migration.sql`.
