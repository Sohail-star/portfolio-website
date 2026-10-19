import React from 'react';
import { ArrowUp, Github, Linkedin, MessageCircle, Heart } from 'lucide-react';
import { ProfileInfo } from '../types';

interface FooterProps {
  profile: ProfileInfo;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ profile, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020713] border-t border-[#008CFF]/20 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#008CFF]/15">
          {/* Brand & Monogram */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008CFF] to-[#00CFFF] flex items-center justify-center font-extrabold text-white text-base tracking-wider shadow-lg shadow-[#008CFF]/20">
                MS
              </div>
              <div>
                <span className="font-bold text-lg text-[#F8FAFC]">Mohammad Sohail</span>
                <p className="text-xs text-[#008CFF] font-medium">Web Developer &amp; Tech Enthusiast</p>
              </div>
            </div>

            <p className="text-sm text-[#A9B9D0] max-w-sm leading-relaxed">
              Computer Science student building responsive, modern websites and practical digital experiences with clean architecture and contemporary design.
            </p>

            {/* Social Links with Official Logos */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={profile.githubUrl || 'https://github.com/Sohail-star'}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub (Sohail-star)"
                className="w-9 h-9 rounded-lg bg-[#06162D] border border-[#008CFF]/25 hover:border-white text-[#A9B9D0] hover:text-white flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={profile.linkedinUrl || 'https://www.linkedin.com/in/muhammad-sohail-8a32102ab/'}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn (Muhammad Sohail)"
                className="w-9 h-9 rounded-lg bg-[#06162D] border border-[#008CFF]/25 hover:border-[#0A66C2] text-[#A9B9D0] hover:text-[#0A66C2] flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              {profile.whatsappNumber && (
                <a
                  href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp (03285490043)"
                  className="w-9 h-9 rounded-lg bg-[#06162D] border border-[#008CFF]/25 hover:border-[#25D366] text-[#A9B9D0] hover:text-[#25D366] flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00CFFF]">
              Quick Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-[#A9B9D0]">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-[#F8FAFC] hover:underline underline-offset-4 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin & Location info */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00CFFF]">
              Portfolio System
            </h4>
            <p className="text-xs text-[#A9B9D0] leading-relaxed">
              Based in {profile.location}. Fully responsive and powered by Express, TypeScript &amp; React.
            </p>
            <button
              onClick={onOpenAdmin}
              className="text-xs font-mono text-[#008CFF] hover:text-[#00CFFF] underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Admin Access &amp; Messages</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A9B9D0]">
          <p>© {currentYear} Mohammad Sohail. All rights reserved.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#06162D] border border-[#008CFF]/25 hover:border-[#00CFFF] text-[#F8FAFC] hover:text-[#00CFFF] transition-all cursor-pointer group"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};
