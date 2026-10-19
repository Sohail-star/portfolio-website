import React, { useEffect } from 'react';
import { X, ExternalLink, Github, Layers, Calendar } from 'lucide-react';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#06162D] border border-[#008CFF]/40 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-[#008CFF]/20 bg-[#020B1B]/80 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00CFFF] shrink-0" />
            <h3 className="font-bold text-base sm:text-lg text-[#F8FAFC] truncate">{project.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A9B9D0] hover:text-white hover:bg-[#0B1F3F] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-[#008CFF]/25 bg-[#020B1B] aspect-video">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/project_portfolio.svg';
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#00CFFF]">
              Project Overview
            </h4>
            <p className="text-sm text-[#A9B9D0] leading-relaxed">
              {project.longDescription || project.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#00CFFF] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Technologies & Tools</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-[#0B1F3F] border border-[#008CFF]/30 text-xs font-semibold text-[#F8FAFC]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-[#A9B9D0]/70 pt-2 border-t border-[#008CFF]/15">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#008CFF]" />
              <span>Added: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <span className="capitalize">Category: {project.category}</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-5 border-t border-[#008CFF]/20 bg-[#020B1B]/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#00CFFF] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-md shadow-[#008CFF]/30"
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
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#0B1F3F] border border-[#008CFF]/30 text-[#F8FAFC] text-xs font-semibold flex items-center gap-1.5 hover:border-[#00CFFF]"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Source Code</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#A9B9D0] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
