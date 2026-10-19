import React from 'react';
import { ArrowRight, Mail, Github, Linkedin, MessageCircle, Terminal, Code2, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background radial glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#008CFF]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#00CFFF]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text Hierarchy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Greeting pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06162D] border border-[#008CFF]/30 text-xs sm:text-sm font-medium text-[#00CFFF] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00CFFF] animate-pulse" />
              Hello, I&apos;m
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC]">
                {profile.name || 'Muhammad Sohail'}
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#008CFF] tracking-tight">
                {profile.title}
              </h2>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#A9B9D0] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              I&apos;m a Software Engineering student and passionate web developer, graphic designer and problem solver. I build modern websites and digital experiences that make an impact.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => scrollTo('#projects')}
                className="px-6 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00A3FF] hover:from-[#00A3FF] hover:to-[#00CFFF] transition-all duration-200 shadow-lg shadow-[#008CFF]/30 hover:shadow-[#008CFF]/50 flex items-center gap-2 group cursor-pointer"
              >
                <span>View Projects</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollTo('#contact')}
                className="px-6 py-3.5 rounded-full text-sm font-semibold text-[#F8FAFC] bg-[#06162D] hover:bg-[#0B1F3F] border border-[#008CFF]/40 hover:border-[#00CFFF] transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Contact Me</span>
                <Mail className="w-4 h-4 text-[#00CFFF]" />
              </button>
            </div>

            {/* Social Links with Official Logos */}
            <div className="flex items-center justify-center lg:justify-start gap-3.5 pt-4">
              <a
                href={profile.githubUrl || 'https://github.com/Sohail-star'}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub (Sohail-star)"
                className="w-11 h-11 rounded-xl bg-[#06162D] border border-[#008CFF]/25 hover:border-white hover:bg-[#0B1F3F] text-[#A9B9D0] hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm group"
                aria-label="GitHub Profile"
              >
                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a
                href={profile.linkedinUrl || 'https://www.linkedin.com/in/muhammad-sohail-8a32102ab/'}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn (Muhammad Sohail)"
                className="w-11 h-11 rounded-xl bg-[#06162D] border border-[#008CFF]/25 hover:border-[#0A66C2] hover:bg-[#0B1F3F] text-[#A9B9D0] hover:text-[#0A66C2] flex items-center justify-center transition-all hover:scale-110 shadow-sm group"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp (03285490043)"
                className="w-11 h-11 rounded-xl bg-[#06162D] border border-[#008CFF]/25 hover:border-[#25D366] hover:bg-[#0B1F3F] text-[#A9B9D0] hover:text-[#25D366] flex items-center justify-center transition-all hover:scale-110 shadow-sm group"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: User Uploaded Portrait Photo 31.jpg */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
            <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4] rounded-3xl overflow-hidden border-2 border-[#008CFF]/50 hover:border-[#00CFFF] shadow-2xl shadow-[#008CFF]/25 hover:shadow-[#00CFFF]/40 transition-all duration-500 group/photo bg-[#06162D]">
              {/* Outer decorative ambient glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#008CFF]/20 via-[#00CFFF]/10 to-transparent rounded-3xl blur-xl pointer-events-none -z-10" />

              {/* Portrait Image */}
              <img
                src={profile.portraitUrl || '/images/31.jpg'}
                alt="Muhammad Sohail - Web Developer"
                className="w-full h-full object-cover object-center group-hover/photo:scale-105 transition-transform duration-700"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.src = '/images/31.jpg';
                }}
              />

              {/* Subtle cinematic gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020B1B]/95 via-black/20 to-black/10 pointer-events-none" />

              {/* Top Floating Badge: Status & Tech */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#020B1B]/80 backdrop-blur-md border border-[#008CFF]/40 text-xs font-semibold text-[#F8FAFC] shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Available for Hire</span>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-[#06162D]/85 backdrop-blur-md border border-[#00CFFF]/40 text-[11px] font-mono text-[#00CFFF] font-semibold">
                  Full-Stack
                </div>
              </div>

              {/* Bottom Floating Glass Card with Title & Tagline */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#06162D]/90 backdrop-blur-md border border-[#008CFF]/40 shadow-xl z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#F8FAFC] tracking-tight">
                      {profile.name || 'Muhammad Sohail'}
                    </h3>
                    <p className="text-xs text-[#00CFFF] font-medium">
                      {profile.title}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#008CFF] to-[#00CFFF] flex items-center justify-center text-white shadow-md shadow-[#008CFF]/40 font-mono text-xs font-bold shrink-0">
                    &lt;/&gt;
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#008CFF]/20 text-[11px] text-[#A9B9D0]">
                  <span>Peshawar, Pakistan</span>
                  <span className="text-emerald-400 font-semibold font-mono">BS Software Eng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

