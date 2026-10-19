import React, { useState } from 'react';
import { ExternalLink, Github, ArrowUpRight, FolderGit2, Plus, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface ProjectsSectionProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenAdmin?: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, onSelectProject, onOpenAdmin }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'web' | 'design' | 'app'>('all');

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'all') return true;
    return project.category === activeFilter;
  });

  return (
    <section id="projects" className="py-14 sm:py-16 md:py-28 relative bg-[#020B1B] overflow-hidden w-full isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-12">
          <div className="space-y-1 text-center md:text-left min-w-0">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              My Projects
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#008CFF] tracking-wide">
              Some of my recent work
            </p>
          </div>

          {/* Filter Tabs (shown when projects exist) */}
          {projects.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1 rounded-2xl sm:rounded-full bg-[#06162D] border border-[#008CFF]/25 self-center md:self-auto max-w-full">
              {(['all', 'web', 'design', 'app'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-[#008CFF] text-white shadow-md shadow-[#008CFF]/40'
                      : 'text-[#A9B9D0] hover:text-[#F8FAFC] hover:bg-[#0B1F3F]'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Cards Grid */}
        <div
          className={`grid gap-4 sm:gap-6 md:gap-8 ${
            filteredProjects.length === 1
              ? 'grid-cols-1 max-w-md mx-auto'
              : filteredProjects.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : filteredProjects.length === 3
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl bg-[#06162D] border border-[#008CFF]/20 hover:border-[#00CFFF]/60 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#008CFF]/20 hover:-translate-y-1 relative min-w-0"
            >
              {/* Thumbnail Container */}
              <div
                onClick={() => onSelectProject(project)}
                className="relative aspect-[16/10] overflow-hidden bg-[#020B1B] cursor-pointer"
              >
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to weather or placeholder if missing
                    e.currentTarget.src = '/images/project_weather.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06162D] via-transparent to-transparent opacity-60" />
              </div>

              {/* Content Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4 min-w-0">
                <div className="space-y-1.5 sm:space-y-2 min-w-0">
                  <h3
                    onClick={() => onSelectProject(project)}
                    className="font-bold text-base sm:text-lg text-[#F8FAFC] group-hover:text-[#00CFFF] transition-colors cursor-pointer line-clamp-1 truncate"
                  >
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#A9B9D0] line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Technology Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 sm:px-2.5 py-0.5 rounded-md bg-[#0B1F3F] border border-[#008CFF]/25 text-[10px] sm:text-[11px] font-medium text-[#00CFFF]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Bottom Action Links & Modal Trigger */}
                <div className="pt-3 border-t border-[#008CFF]/15 flex items-center justify-between text-xs gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-wrap">
                    {project.liveDemoUrl && (
                      <a
                        href={project.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#A9B9D0] hover:text-[#00CFFF] font-medium transition-colors text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#A9B9D0] hover:text-[#00CFFF] font-medium transition-colors text-xs"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectProject(project)}
                    title="View Project Details"
                    className="w-7 h-7 rounded-full bg-[#0B1F3F] text-[#00CFFF] group-hover:bg-[#008CFF] group-hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty States */}
        {projects.length === 0 ? (
          <div className="text-center py-10 sm:py-16 px-4 sm:px-8 bg-[#06162D] rounded-2xl border border-[#008CFF]/20 max-w-2xl mx-auto space-y-4 sm:space-y-6 shadow-xl shadow-[#008CFF]/5 min-w-0 w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#0B1F3F] border border-[#008CFF]/30 flex items-center justify-center text-[#00CFFF] mx-auto shadow-lg shadow-[#008CFF]/20">
              <FolderGit2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1F3F] border border-[#008CFF]/30 text-[#00CFFF] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Showcase Updating</span>
              </span>
              <h3 className="text-base sm:text-2xl font-bold text-[#F8FAFC]">
                Curating New Featured Projects
              </h3>
              <p className="text-xs sm:text-sm text-[#A9B9D0] max-w-lg mx-auto leading-relaxed">
                I am currently preparing live demos and production builds of my latest web development applications. In the meantime, explore my technical skills above or get in touch for custom project walkthroughs.
              </p>
            </div>

            {/* Public Visitor Action Links */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full max-w-sm sm:max-w-md mx-auto">
              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#00CFFF] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#008CFF]/25 hover:shadow-[#008CFF]/45 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Get In Touch</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Sohail-star"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1F3F] border border-[#008CFF]/30 hover:border-[#00CFFF] text-[#F8FAFC] text-xs sm:text-sm font-semibold transition-all hover:bg-[#06162D]"
              >
                <Github className="w-4 h-4" />
                <span>Explore GitHub</span>
              </a>
            </div>

            {/* Admin Quick Upload Link (Available if logged in as Admin or to access Admin Panel) */}
            {onOpenAdmin && (
              <div className="pt-4 border-t border-[#008CFF]/15">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-[#008CFF] hover:text-[#00CFFF] transition-colors cursor-pointer text-center max-w-full"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="break-words">Admin: Upload new project from Admin Panel</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#06162D] rounded-2xl border border-[#008CFF]/20 max-w-md mx-auto space-y-3">
            <p className="text-sm text-[#A9B9D0]">No projects found in this category.</p>
            <button
              onClick={() => setActiveFilter('all')}
              className="text-xs text-[#00CFFF] hover:underline cursor-pointer"
            >
              Show all projects
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};
