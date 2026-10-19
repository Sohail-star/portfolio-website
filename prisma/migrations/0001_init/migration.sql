-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin');
CREATE TYPE "MessageStatus" AS ENUM ('new', 'read', 'replied');
CREATE TYPE "SkillCategory" AS ENUM ('frontend', 'backend', 'design', 'tools');
CREATE TYPE "ProjectCategory" AS ENUM ('web', 'design', 'app', 'all');

-- CreateTable: Admin Users
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable: Projects
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "longDescription" TEXT,
    "imageUrl" TEXT NOT NULL,
    "technologies" TEXT[] NOT NULL,
    "category" "ProjectCategory" NOT NULL DEFAULT 'web',
    "liveDemoUrl" TEXT,
    "githubUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable: Skills
CREATE TABLE "skills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "icon" TEXT NOT NULL,
    "proficiency" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable: Services
CREATE TABLE "services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "features" TEXT[] NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable: Contact Messages
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'new',
    "ipAddress" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndexes
CREATE INDEX "projects_category_published_idx" ON "projects"("category", "published");
CREATE INDEX "projects_sortOrder_idx" ON "projects"("sortOrder");
CREATE INDEX "skills_category_idx" ON "skills"("category");
CREATE INDEX "skills_sortOrder_idx" ON "skills"("sortOrder");
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");
