import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, Moon, Sun, ArrowUpRight } from 'lucide-react';
import { ProfileInfo } from '../types';

interface NavbarProps {
  onOpenAdmin: () => void;
  profile?: ProfileInfo;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, profile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['home', 'about', 'skills', 'projects', 'services', 'contact'];
      const scrollPos = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#020B1B]/90 backdrop-blur-md border-b border-[#008CFF]/20 shadow-lg shadow-black/40 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-6 md:gap-8">
          {/* Brand Logo, Photo & Name */}
          <a
            href="#home"
            className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 max-w-[calc(100%-80px)] md:max-w-none"
          >
            {/* Brand Developer Portrait Photo Avatar */}
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-gradient-to-br from-[#008CFF] to-[#00CFFF] p-[2px] shadow-[0_0_15px_rgba(0,163,255,0.4)] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,207,255,0.7)] transition-all shrink-0">
              <div className="w-full h-full rounded-[9px] overflow-hidden bg-[#020B1B] relative flex items-center justify-center">
                <img
                  src={profile?.portraitUrl || '/images/31.jpg'}
                  alt={profile?.name || 'Muhammad Sohail'}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.brand-monogram-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <span className="brand-monogram-fallback hidden w-full h-full text-[#00CFFF] group-hover:text-white font-mono font-extrabold text-xs items-center justify-center">
                  &lt;MS/&gt;
                </span>
              </div>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-xs xs:text-sm sm:text-base md:text-lg text-[#F8FAFC] tracking-tight group-hover:text-[#00CFFF] transition-colors leading-snug truncate">
                {profile?.name || 'Muhammad Sohail'}
              </span>
              <span className="text-[10px] xs:text-[11px] sm:text-xs text-[#008CFF] font-medium tracking-wide truncate">
                {profile?.title || 'Web Developer'}
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.href)}
                  className={`relative py-1 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-[#00CFFF] font-semibold'
                      : 'text-[#A9B9D0] hover:text-[#F8FAFC]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00CFFF] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Zone: Admin Access, Theme Icon, Hire Me */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Admin Dashboard Trigger */}
            <button
              onClick={onOpenAdmin}
              title="Admin Control Panel"
              className="p-2 rounded-lg text-[#A9B9D0] hover:text-[#00CFFF] hover:bg-[#06162D] border border-transparent hover:border-[#008CFF]/30 transition-all text-xs flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span className="text-[11px] font-mono">Admin</span>
            </button>

            {/* Hire Me CTA */}
            <button
              onClick={() => handleLinkClick('#contact')}
              className="px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00A3FF] hover:from-[#00A3FF] hover:to-[#00CFFF] transition-all shadow-md shadow-[#008CFF]/30 hover:shadow-[#008CFF]/50 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              Hire Me
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={onOpenAdmin}
              title="Admin Control Panel"
              className="p-2 text-[#A9B9D0] hover:text-[#00CFFF] rounded-lg hover:bg-[#06162D]"
              aria-label="Admin Control Panel"
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#A9B9D0] hover:text-white hover:bg-[#06162D] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-[#00CFFF]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#020B1B]/95 backdrop-blur-xl border-b border-[#008CFF]/20 px-5 pt-3 pb-6 space-y-3 shadow-2xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.href)}
                  className={`text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#06162D] text-[#00CFFF] border-l-2 border-[#00CFFF]'
                      : 'text-[#A9B9D0] hover:text-white hover:bg-[#06162D]/50'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#008CFF]/15 flex flex-wrap items-center justify-between gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center gap-2 text-xs text-[#A9B9D0] hover:text-[#00CFFF]"
            >
              <Shield className="w-4 h-4 text-[#008CFF]" />
              <span>Admin Dashboard</span>
            </button>
            <button
              onClick={() => handleLinkClick('#contact')}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00CFFF] shrink-0"
            >
              Hire Me
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
