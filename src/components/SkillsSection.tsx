import React from 'react';
import { Skill } from '../types';

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  // Helper to render official brand icons or fallback SVGs
  const renderSkillIcon = (icon: string, name: string) => {
    // If it's an uploaded image (data URL or web URL)
    if (icon && (icon.startsWith('data:image') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/'))) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#008CFF]/10 border border-[#008CFF]/30 flex items-center justify-center p-2 overflow-hidden shadow-inner group-hover:border-[#00CFFF]/50 transition-colors">
          <img src={icon} alt={name} className="w-full h-full object-contain" />
        </div>
      );
    }

    const key = (icon || name || '').toLowerCase();
    switch (key) {
      case 'html':
      case 'html5':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#E34F26]/10 border border-[#E34F26]/30 flex items-center justify-center text-[#E34F26] font-extrabold text-sm">
            <span className="text-xl">5</span>
          </div>
        );
      case 'css':
      case 'css3':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#1572B6]/10 border border-[#1572B6]/30 flex items-center justify-center text-[#1572B6] font-extrabold text-sm">
            <span className="text-xl">3</span>
          </div>
        );
      case 'javascript':
      case 'js':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#F7DF1E]/15 border border-[#F7DF1E]/30 flex items-center justify-center text-[#F7DF1E] font-bold text-sm">
            <span>JS</span>
          </div>
        );
      case 'typescript':
      case 'ts':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#3178C6]/15 border border-[#3178C6]/30 flex items-center justify-center text-[#3178C6] font-bold text-sm">
            <span>TS</span>
          </div>
        );
      case 'react':
      case 'reactjs':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#61DAFB]/10 border border-[#61DAFB]/30 flex items-center justify-center text-[#61DAFB]">
            <svg className="w-7 h-7 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
        );
      case 'tailwind':
      case 'tailwindcss':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
            </svg>
          </div>
        );
      case 'nodejs':
      case 'node':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#339933]/15 border border-[#339933]/30 flex items-center justify-center text-[#339933] font-bold text-xs">
            <span>Node</span>
          </div>
        );
      case 'postgresql':
      case 'postgres':
      case 'sql':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#4169E1]/15 border border-[#4169E1]/30 flex items-center justify-center text-[#648FFC]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
        );
      case 'figma':
        return (
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
            <span>Fg</span>
          </div>
        );
      case 'git':
      case 'github':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#F05032]/15 border border-[#F05032]/30 flex items-center justify-center text-[#F05032] font-bold text-xs">
            <span>Git</span>
          </div>
        );
      case 'python':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#3776AB]/15 border border-[#3776AB]/30 flex items-center justify-center text-[#FFD43B] font-bold text-xs">
            <span>Py</span>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-[#008CFF]/10 border border-[#008CFF]/30 flex items-center justify-center text-[#00CFFF] font-semibold text-sm">
            {name.slice(0, 2).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <section id="skills" className="py-20 md:py-28 relative bg-[#020B1B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center sm:text-left space-y-1 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            My Skills
          </h2>
          <p className="text-sm font-semibold text-[#008CFF] tracking-wide">
            Technologies I work with
          </p>
        </div>

        {/* Responsive Skill Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="group p-5 rounded-2xl bg-[#06162D] border border-[#008CFF]/20 hover:border-[#00CFFF]/60 transition-all duration-300 hover:shadow-xl hover:shadow-[#008CFF]/15 flex flex-col items-center text-center justify-center gap-3 relative hover:-translate-y-1"
            >
              {renderSkillIcon(skill.icon, skill.name)}

              <span className="font-semibold text-sm sm:text-base text-[#F8FAFC] group-hover:text-[#00CFFF] transition-colors">
                {skill.name}
              </span>

              {/* Optional proficiency meter bar */}
              {skill.proficiency && (
                <div className="w-full bg-[#020B1B] rounded-full h-1.5 overflow-hidden mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <div
                    className="bg-gradient-to-r from-[#008CFF] to-[#00CFFF] h-full rounded-full transition-all duration-500"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
