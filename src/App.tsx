/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ServicesSection } from './components/ServicesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AdminModal } from './components/AdminModal';
import { ResumeModal } from './components/ResumeModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { api } from './services/api';
import { Project, Skill, Service, ProfileInfo } from './types';

const DEFAULT_PROFILE: ProfileInfo = {
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

const DEFAULT_SERVICES: Service[] = [
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

const DEFAULT_SKILLS: Skill[] = [
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

const DEFAULT_PROJECTS: Project[] = [];

export default function App() {
  const [profile, setProfile] = useState<ProfileInfo>(DEFAULT_PROFILE);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedServiceForContact, setSelectedServiceForContact] = useState<string>('');

  const loadAllData = async () => {
    try {
      const [profileData, projectsData, skillsData] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getProjects().catch(() => null),
        api.getSkills().catch(() => null),
      ]);

      if (profileData) {
        if (profileData.profile) setProfile(profileData.profile);
        if (Array.isArray(profileData.services)) {
          setServices(profileData.services);
        }
      }
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      }
      if (Array.isArray(skillsData)) {
        setSkills(skillsData);
      }
    } catch (err) {
      console.warn('Initial data loaded with local defaults:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpdatePortrait = (newUrl: string) => {
    setProfile((prev) => ({ ...prev, portraitUrl: newUrl }));
    api.updateProfile({ portraitUrl: newUrl }).catch(() => {
      // ignore if unauthenticated
    });
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedServiceForContact(serviceName);
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#020B1B] text-[#F8FAFC] selection:bg-[#008CFF]/30 selection:text-white relative w-full overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar profile={profile} onOpenAdmin={() => setAdminOpen(true)} />

      {/* Main Portfolio Sections */}
      <main className="w-full overflow-x-hidden">
        {/* Hero Section */}
        <HeroSection profile={profile} />

        {/* About Me Section */}
        <AboutSection
          profile={profile}
          projectsCount={projects.length}
          onOpenResume={() => setResumeOpen(true)}
        />

        {/* My Skills Section */}
        <SkillsSection skills={skills} />

        {/* My Services Section */}
        <ServicesSection
          services={services}
          onSelectService={handleSelectService}
        />

        {/* My Projects Section */}
        <ProjectsSection
          projects={projects}
          onSelectProject={(proj) => setSelectedProject(proj)}
          onOpenAdmin={() => setAdminOpen(true)}
        />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Contact Section */}
        <ContactSection
          profile={profile}
          prefilledSubject={selectedServiceForContact}
        />
      </main>

      {/* Footer */}
      <Footer profile={profile} onOpenAdmin={() => setAdminOpen(true)} />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp
        phoneNumber={profile.whatsappNumber}
        ownerName={profile.name}
      />

      {/* Interactive Project Details Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Interactive Full CV & Resume Viewer Modal */}
      <ResumeModal
        isOpen={resumeOpen}
        onClose={() => setResumeOpen(false)}
        profile={profile}
      />

      {/* Admin Dashboard & Management Modal */}
      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onRefreshData={loadAllData}
        currentProfile={profile}
      />
    </div>
  );
}
