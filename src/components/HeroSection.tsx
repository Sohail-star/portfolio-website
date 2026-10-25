import React from 'react';
import { ArrowRight, Mail, Github, Linkedin, MessageCircle } from 'lucide-react';
import { ProfileInfo } from '../types';

interface HeroSectionProps {
  profile: ProfileInfo;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ profile }) => {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const whatsappUrl = profile.whatsappNumber
    ? `https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        "Hello Muhammad Sohail, I visited your portfolio and would like to connect!"
      )}`
    : '#contact';

  return (
    <section
      id="home"
      className="relative pt-24 pb-14 sm:pt-28 sm:pb-16 md:pt-36 md:pb-28 overflow-hidden w-full isolate bg-[radial-gradient(ellipse_at_top,_rgba(0,140,255,0.12)_0%,_rgba(2,11,27,0)_70%)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-center">
          {/* Left Column: Text Hierarchy */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left min-w-0">
            {/* Greeting badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06162D] border border-[#008CFF]/30 text-xs sm:text-sm font-medium text-[#00CFFF] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00CFFF] animate-pulse" />
              <span>Hello, I&apos;m</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1 sm:space-y-1.5">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC] break-words">
                {profile.name || 'Muhammad Sohail'}
              </h1>
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#008CFF] tracking-tight break-words">
                {profile.title}
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-[#A9B9D0] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              I&apos;m a Software Engineering student and passionate web developer, graphic designer and problem solver. I build modern websites and digital experiences that make an impact.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 w-full max-w-sm sm:max-w-md mx-auto lg:mx-0">
              <button
                onClick={() => scrollTo('#projects')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00A3FF] hover:from-[#00A3FF] hover:to-[#00CFFF] transition-all duration-200 shadow-lg shadow-[#008CFF]/30 hover:shadow-[#008CFF]/50 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>View Projects</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollTo('#contact')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-[#F8FAFC] bg-[#06162D] hover:bg-[#0B1F3F] border border-[#008CFF]/40 hover:border-[#00CFFF] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Contact Me</span>
                <Mail className="w-4 h-4 text-[#00CFFF]" />
              </button>
            </div>

            {/* Social Links with Official Logos */}
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-3.5 pt-2 flex-wrap">
              <a
                href={profile.githubUrl || 'https://github.com/Sohail-star'}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub (Sohail-star)"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#06162D] border border-[#008CFF]/25 hover:border-white hover:bg-[#0B1F3F] text-[#A9B9D0] hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm group"
                aria-label="GitHub Profile"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a
                href={profile.linkedinUrl || 'https://www.linkedin.com/in/muhammad-sohail-8a32102ab/'}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn (Muhammad Sohail)"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#06162D] border border-[#008CFF]/25 hover:border-[#0A66C2] hover:bg-[#0B1F3F] text-[#A9B9D0] hover:text-[#0A66C2] flex items-center justify-center transition-all hover:scale-110 shadow-sm group"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp (03285490043)"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#06162D] border border-[#008CFF]/25 hover:border-[#25D366] hover:bg-[#0B1F3F] text-[#A9B9D0] hover:text-[#25D366] flex items-center justify-center transition-all hover:scale-110 shadow-sm group"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: User Uploaded Portrait Photo */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full min-w-0">
            <div className="relative w-full max-w-[270px] sm:max-w-sm md:max-w-md mx-auto aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#008CFF]/50 hover:border-[#00CFFF] shadow-xl shadow-[#008CFF]/20 transition-all duration-500 group/photo bg-[#06162D]">
              {/* Portrait Image */}
              <img
                src={profile.portraitUrl || '/images/31.jpg'}
                alt="Muhammad Sohail - Web Developer"
                className="w-full h-full object-cover object-top group-hover/photo:scale-105 transition-transform duration-700"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.src = '/images/31.jpg';
                }}
              />

              {/* Subtle bottom-only gradient overlay for card contrast */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#020B1B]/90 to-transparent pointer-events-none" />

              {/* Top Floating Badge: Status & Tech */}
              <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-1.5 z-10 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#020B1B]/90 border border-[#008CFF]/40 text-[10px] sm:text-xs font-semibold text-[#F8FAFC] shadow-md min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="truncate">Available for Hire</span>
                </div>

                <div className="px-2.5 py-0.5 rounded-full bg-[#06162D]/95 border border-[#00CFFF]/40 text-[10px] sm:text-[11px] font-mono text-[#00CFFF] font-semibold shrink-0">
                  Full-Stack
                </div>
              </div>

              {/* Bottom Floating Card with Title & Tagline */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#06162D]/95 border border-[#008CFF]/40 shadow-lg z-10 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-xs sm:text-base md:text-lg text-[#F8FAFC] tracking-tight truncate">
                      {profile.name || 'Muhammad Sohail'}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#00CFFF] font-medium truncate">
                      {profile.title}
                    </p>
                  </div>

                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#008CFF] to-[#00CFFF] flex items-center justify-center text-white shadow-md shadow-[#008CFF]/40 font-mono text-xs font-bold shrink-0">
                    &lt;/&gt;
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#008CFF]/20 text-[10px] sm:text-[11px] text-[#A9B9D0] gap-1 min-w-0">
                  <span className="truncate">Peshawar, PK</span>
                  <span className="text-emerald-400 font-semibold font-mono shrink-0">BS Software Eng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
