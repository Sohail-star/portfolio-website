import React from 'react';
import { GraduationCap, MapPin, Mail, Award, Download, ArrowUpRight, FileText, CheckCircle2 } from 'lucide-react';
import { ProfileInfo } from '../types';

interface AboutSectionProps {
  profile: ProfileInfo;
  projectsCount?: number;
  onOpenResume?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile, projectsCount = 0, onOpenResume }) => {
  return (
    <section id="about" className="py-14 sm:py-16 md:py-28 relative overflow-hidden w-full isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Column: Details & Bio */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 min-w-0">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
                About Me
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#008CFF] tracking-wide">
                Let me introduce myself &amp; my credentials
              </p>
            </div>

            <p className="text-xs sm:text-base md:text-lg text-[#A9B9D0] leading-relaxed">
              {profile.bio || "I'm Muhammad Sohail, a Software Engineering student with a strong interest in web development, graphic design, editing and AI. I love turning ideas into real projects and continuously learning new technologies."}
            </p>

            {/* Profile Information List */}
            <div className="space-y-3 pt-1">
              {/* Education */}
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 text-xs sm:text-base min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#06162D] border border-[#008CFF]/30 flex items-center justify-center shrink-0 text-[#00CFFF]">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0 flex-1">
                  <span className="font-semibold text-[#F8FAFC] shrink-0 text-xs sm:text-sm">Education:</span>
                  <span className="text-[#A9B9D0] break-words text-xs sm:text-sm">{profile.education}</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 text-xs sm:text-base min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#06162D] border border-[#008CFF]/30 flex items-center justify-center shrink-0 text-[#00CFFF]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0 flex-1">
                  <span className="font-semibold text-[#F8FAFC] shrink-0 text-xs sm:text-sm">Location:</span>
                  <span className="text-[#A9B9D0] break-words text-xs sm:text-sm">{profile.location}</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 text-xs sm:text-base min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#06162D] border border-[#008CFF]/30 flex items-center justify-center shrink-0 text-[#00CFFF]">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0 flex-1">
                  <span className="font-semibold text-[#F8FAFC] shrink-0 text-xs sm:text-sm">Email:</span>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-[#008CFF] hover:text-[#00CFFF] transition-colors underline-offset-4 hover:underline break-all text-xs sm:text-sm"
                  >
                    {profile.email}
                  </a>
                </div>
              </div>

              {/* Trainings */}
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 text-xs sm:text-base min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#06162D] border border-[#008CFF]/30 flex items-center justify-center shrink-0 text-[#00CFFF]">
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0 flex-1">
                  <span className="font-semibold text-[#F8FAFC] shrink-0 text-xs sm:text-sm">Trainings:</span>
                  <span className="text-[#A9B9D0] break-words text-xs sm:text-sm">{profile.training}</span>
                </div>
              </div>
            </div>

            {/* CV & Resume Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 pt-2 w-full max-w-md">
              {onOpenResume && (
                <button
                  onClick={onOpenResume}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00A3FF] hover:from-[#00A3FF] hover:to-[#00CFFF] transition-all shadow-md shadow-[#008CFF]/25 hover:shadow-[#008CFF]/45 hover:scale-[1.02] cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Full CV &amp; Resume</span>
                </button>
              )}

              <a
                href="/api/cv/download"
                download="Mohammad_Sohail_Resume.pdf"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-[#F8FAFC] bg-[#06162D] hover:bg-[#0B1F3F] border border-[#008CFF]/40 hover:border-[#00CFFF] transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Download CV (PDF)</span>
                <Download className="w-4 h-4 text-[#00CFFF]" />
              </a>
            </div>
          </div>

          {/* Right Column: Wide Showcase Card with Developer Stats & Highlights */}
          <div className="lg:col-span-5 min-w-0">
            <div className="relative rounded-2xl overflow-hidden bg-[#06162D] border border-[#008CFF]/30 shadow-xl shadow-[#008CFF]/10 group p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 min-w-0">
              {/* Top Accent Pill - Responsive flex-wrap */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-[#0B1F3F] border border-[#008CFF]/30 text-[#00CFFF] max-w-full truncate">
                  Software Engineering Student
                </span>
                <span className="text-[10px] sm:text-xs text-[#A9B9D0] shrink-0">Peshawar, PK</span>
              </div>

              {/* Developer Motto / Core Philosophy */}
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-lg sm:text-2xl font-bold text-[#F8FAFC] leading-snug">
                  Turning Ideas into Real Projects
                </h3>
                <p className="text-xs sm:text-sm text-[#A9B9D0] leading-relaxed">
                  Dedicated to engineering responsive, modern, and high-performance digital solutions with scalable architecture and attention to UX detail.
                </p>
              </div>

              {/* Mini Highlights Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#020B1B] border border-[#008CFF]/20 min-w-0">
                  <p className="text-xl sm:text-2xl font-extrabold text-[#00CFFF]">
                    {projectsCount > 0 ? `${projectsCount}+` : 'Full-Stack'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#A9B9D0] mt-0.5 truncate">
                    {projectsCount > 0 ? 'Featured Projects' : 'Modern Web Dev'}
                  </p>
                </div>
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#020B1B] border border-[#008CFF]/20 min-w-0">
                  <p className="text-xl sm:text-2xl font-extrabold text-[#008CFF]">11+</p>
                  <p className="text-[10px] sm:text-xs text-[#A9B9D0] mt-0.5 truncate">Technologies</p>
                </div>
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#020B1B] border border-[#008CFF]/20 min-w-0">
                  <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">SMIT</p>
                  <p className="text-[10px] sm:text-xs text-[#A9B9D0] mt-0.5 truncate">Certified Web Dev</p>
                </div>
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#020B1B] border border-[#008CFF]/20 min-w-0">
                  <p className="text-xl sm:text-2xl font-extrabold text-amber-300">100%</p>
                  <p className="text-[10px] sm:text-xs text-[#A9B9D0] mt-0.5 truncate">Responsive UI</p>
                </div>
              </div>

              {/* Action Banner */}
              <div className="pt-1">
                <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-[#0B1F3F] to-[#06162D] border border-[#008CFF]/30 flex items-center justify-between gap-2.5 sm:gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#F8FAFC] truncate">Looking for a developer?</p>
                    <p className="text-[10px] sm:text-[11px] text-[#00CFFF] truncate">Ready for freelance &amp; full-time roles</p>
                  </div>
                  <a
                    href="#contact"
                    className="w-8 h-8 rounded-lg bg-[#008CFF] hover:bg-[#00A3FF] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#008CFF]/40 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
