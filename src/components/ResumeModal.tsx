import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  GraduationCap,
  Award,
  Layers,
  FolderKanban,
  CheckCircle2,
  Globe,
  Loader2,
} from 'lucide-react';
import { ProfileInfo } from '../types';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileInfo;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, profile }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (isPrinting) return;
    setIsPrinting(true);

    const printableEl = document.getElementById('resume-printable-area');
    if (!printableEl) {
      document.body.style.overflow = 'visible';
      window.print();
      setTimeout(() => {
        document.body.style.overflow = 'hidden';
        setIsPrinting(false);
      }, 500);
      return;
    }

    try {
      // Create isolated invisible iframe to print purely the CV document
      const oldFrame = document.getElementById('cv-print-frame');
      if (oldFrame) oldFrame.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'cv-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${profile.name || 'Mohammad Sohail'} - Curriculum Vitae</title>
              <meta charset="utf-8" />
              <style>
                @page {
                  size: A4;
                  margin: 12mm 15mm;
                }
                * {
                  box-sizing: border-box;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background: #ffffff !important;
                  color: #0f172a !important;
                  font-size: 13px;
                  line-height: 1.5;
                }
                h1, h2, h3, h4, p, span, div, a {
                  color: inherit;
                }
                a {
                  color: #008CFF !important;
                  text-decoration: none;
                }
                /* Section headers */
                h2 {
                  font-size: 12px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  color: #008CFF !important;
                  border-bottom: 1.5px solid #e2e8f0;
                  padding-bottom: 4px;
                  margin-top: 18px;
                  margin-bottom: 10px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                }
                /* Cards */
                .print-card, div[class*="rounded-xl"] {
                  background: #f8fafc !important;
                  border: 1px solid #e2e8f0 !important;
                  border-radius: 8px !important;
                  padding: 12px 14px !important;
                  margin-bottom: 8px !important;
                }
                /* Text color overrides for print */
                span[class*="text-[#F8FAFC]"], p[class*="text-[#F8FAFC]"], h1, h3 {
                  color: #0f172a !important;
                }
                span[class*="text-[#A9B9D0]"], p[class*="text-[#A9B9D0]"] {
                  color: #475569 !important;
                }
                span[class*="text-[#00CFFF]"], p[class*="text-[#00CFFF]"], span[class*="text-[#008CFF]"] {
                  color: #008CFF !important;
                }
                span[class*="text-emerald-400"] {
                  color: #059669 !important;
                  font-weight: 600;
                }
                /* Photo frame */
                img {
                  border-radius: 8px;
                  object-fit: cover;
                }
                /* Grid layouts */
                .grid {
                  display: grid !important;
                }
                .grid-cols-2, .sm\\:grid-cols-2 {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                  gap: 10px !important;
                }
                .flex {
                  display: flex !important;
                }
                .items-center {
                  align-items: center !important;
                }
                .justify-between {
                  justify-content: space-between !important;
                }
                .gap-4 { gap: 16px !important; }
                .gap-3 { gap: 12px !important; }
                .gap-2 { gap: 8px !important; }
                .gap-1\\.5 { gap: 6px !important; }
                .border-b {
                  border-bottom: 1px solid #e2e8f0 !important;
                  padding-bottom: 14px !important;
                }
                /* SVG icons styling in print */
                svg {
                  display: inline-block;
                  vertical-align: middle;
                  width: 14px;
                  height: 14px;
                }
              </style>
            </head>
            <body>
              <div style="padding: 12px 16px;">
                ${printableEl.innerHTML}
              </div>
            </body>
          </html>
        `);
        frameDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print failed, falling back to window.print():', e);
            document.body.style.overflow = 'visible';
            window.print();
            setTimeout(() => {
              document.body.style.overflow = 'hidden';
            }, 600);
          } finally {
            setTimeout(() => {
              try {
                iframe.remove();
              } catch {
                // ignore
              }
              setIsPrinting(false);
            }, 1200);
          }
        }, 350);
        return;
      }
    } catch (err) {
      console.warn('Print iframe error:', err);
    }

    // Direct fallback
    document.body.style.overflow = 'visible';
    window.print();
    setTimeout(() => {
      document.body.style.overflow = 'hidden';
      setIsPrinting(false);
    }, 600);
  };

  return (
    <div className="resume-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div
        className="resume-modal-container relative w-full max-w-4xl bg-[#06162D] border border-[#008CFF]/40 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-h-none print:bg-white print:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#008CFF]/20 bg-[#020B1B]/90 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#008CFF] to-[#00CFFF] flex items-center justify-center font-bold text-white text-xs">
              CV
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#F8FAFC]">
                Curriculum Vitae — {profile.name}
              </h3>
              <p className="text-xs text-[#00CFFF]">Web Developer &amp; Software Engineering Student</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-3 py-1.5 rounded-lg bg-[#0B1F3F] border border-[#008CFF]/30 text-xs font-semibold text-[#F8FAFC] hover:border-[#00CFFF] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Print CV"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00CFFF]" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5 text-[#00CFFF]" />
                  <span className="hidden sm:inline">Print</span>
                </>
              )}
            </button>

            <a
              href="/api/cv/download"
              download="Mohammad_Sohail_Resume.pdf"
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#008CFF] to-[#00CFFF] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-[#008CFF]/30"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A9B9D0] hover:text-white hover:bg-[#0B1F3F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable CV Body */}
        <div id="resume-printable-area" className="overflow-y-auto p-6 sm:p-10 space-y-8 bg-[#041024] print:bg-white print:text-black print:p-8 print:overflow-visible print:h-auto">
          {/* 1. Header / Personal Info */}
          <div className="border-b border-[#008CFF]/20 pb-6 print:border-gray-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#008CFF] bg-[#020B1B] shadow-lg shrink-0 print:border-gray-400">
                  <img
                    src={profile.portraitUrl || '/images/31.jpg'}
                    alt={profile.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.src = '/images/sohail_portrait.png';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight print:text-black">
                    {profile.name}
                  </h1>
                  <p className="text-sm sm:text-base font-semibold text-[#008CFF] mt-0.5 print:text-blue-600">
                    {profile.title} &bull; {profile.education}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col gap-2 sm:gap-1.5 text-xs text-[#A9B9D0] print:text-gray-700 sm:text-right">
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00CFFF] print:text-blue-600" />
                  <a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#25D366] print:text-green-600" />
                  <span>{profile.phone || '0328 5490043'}</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#008CFF] print:text-blue-600" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Github className="w-3.5 h-3.5 text-white print:text-black" />
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    github.com/Sohail-star
                  </a>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] print:text-blue-700" />
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    linkedin.com/in/muhammad-sohail
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Professional Summary */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#00CFFF] flex items-center gap-2 print:text-blue-700">
              <span className="w-2 h-2 rounded-full bg-[#00CFFF] print:bg-blue-600" />
              Professional Summary
            </h2>
            <p className="text-sm text-[#A9B9D0] leading-relaxed print:text-gray-800">
              Enthusiastic and motivated Software Engineering student with strong hands-on experience in modern frontend development, backend APIs, and UI/UX design. Proficient in HTML5, CSS3, JavaScript (ES6+), React 19, and Tailwind CSS with full-stack Node.js and PostgreSQL understanding. Passionate about writing clean, maintainable code, building responsive web applications, and leveraging modern AI workflows to solve real-world problems.
            </p>
          </div>

          {/* 3. Education */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#00CFFF] flex items-center gap-2 print:text-blue-700">
              <GraduationCap className="w-4 h-4 text-[#00CFFF] print:text-blue-600" />
              Education
            </h2>
            <div className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/20 space-y-1 print:bg-gray-50 print:border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-bold text-sm text-[#F8FAFC] print:text-black">
                  Bachelor of Science in Software Engineering (BS SE)
                </h3>
                <span className="text-xs font-semibold text-[#008CFF] print:text-blue-600">
                  In Progress
                </span>
              </div>
              <p className="text-xs text-[#A9B9D0] print:text-gray-600">
                Peshawar, Pakistan &bull; Key Focus: Software Architecture, Algorithms, Web Technologies, Database Systems
              </p>
            </div>
          </div>

          {/* 4. Professional Training & Certifications */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#00CFFF] flex items-center gap-2 print:text-blue-700">
              <Award className="w-4 h-4 text-[#00CFFF] print:text-blue-600" />
              Training &amp; Certifications
            </h2>
            <div className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/20 space-y-1.5 print:bg-gray-50 print:border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-bold text-sm text-[#F8FAFC] print:text-black">
                  Saylani Mass IT Training (SMIT) — Web Development
                </h3>
                <span className="text-xs font-semibold text-emerald-400 print:text-green-700">
                  Certified
                </span>
              </div>
              <p className="text-xs text-[#A9B9D0] print:text-gray-700 leading-relaxed">
                Comprehensive training covering frontend architecture, HTML5, CSS3, JavaScript ES6+, React.js components, responsive layout techniques, and modern version control workflows.
              </p>
            </div>
          </div>

          {/* 5. Core Technical Skills */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#00CFFF] flex items-center gap-2 print:text-blue-700">
              <Layers className="w-4 h-4 text-[#00CFFF] print:text-blue-600" />
              Technical Skills
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#06162D] border border-[#008CFF]/15 print:bg-gray-50 print:border-gray-200">
                <span className="font-bold text-[#F8FAFC] print:text-black block mb-1">Frontend Development</span>
                <p className="text-[#A9B9D0] print:text-gray-700">
                  HTML5, CSS3, JavaScript (ES6+), React 19, Tailwind CSS, Responsive Web Design, Component Architecture
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#06162D] border border-[#008CFF]/15 print:bg-gray-50 print:border-gray-200">
                <span className="font-bold text-[#F8FAFC] print:text-black block mb-1">Backend &amp; Databases</span>
                <p className="text-[#A9B9D0] print:text-gray-700">
                  Node.js, Express.js, PostgreSQL, RESTful APIs, JSON Storage, Prisma ORM, JWT Authentication
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#06162D] border border-[#008CFF]/15 print:bg-gray-50 print:border-gray-200">
                <span className="font-bold text-[#F8FAFC] print:text-black block mb-1">Design &amp; Media</span>
                <p className="text-[#A9B9D0] print:text-gray-700">
                  Figma UI/UX Prototyping, Graphic Design, Brand Identity &amp; Logos, Video Editing, Thumbnail Creation
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#06162D] border border-[#008CFF]/15 print:bg-gray-50 print:border-gray-200">
                <span className="font-bold text-[#F8FAFC] print:text-black block mb-1">Tools &amp; Workflows</span>
                <p className="text-[#A9B9D0] print:text-gray-700">
                  Git &amp; GitHub, VS Code, Linux Shell, Vite, AI Automation Tools &amp; Prompt Engineering
                </p>
              </div>
            </div>
          </div>

          {/* 6. Featured Projects */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#00CFFF] flex items-center gap-2 print:text-blue-700">
              <FolderKanban className="w-4 h-4 text-[#00CFFF] print:text-blue-600" />
              Featured Projects
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/20 print:bg-gray-50 print:border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <h3 className="font-bold text-sm text-[#F8FAFC] print:text-black">
                    Portfolio Website &amp; Admin CMS
                  </h3>
                  <span className="text-xs text-[#008CFF] font-mono print:text-blue-600">
                    React 19 &bull; TypeScript &bull; Tailwind &bull; Node.js
                  </span>
                </div>
                <p className="text-xs text-[#A9B9D0] print:text-gray-700 mt-1">
                  Full-stack responsive developer portfolio featuring dark neon aesthetic, authenticated admin management console, real-time contact notification processing, and project showcase.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/20 print:bg-gray-50 print:border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <h3 className="font-bold text-sm text-[#F8FAFC] print:text-black">
                    SkyCast Weather Application
                  </h3>
                  <span className="text-xs text-[#008CFF] font-mono print:text-blue-600">
                    React &bull; OpenWeather API &bull; Tailwind CSS
                  </span>
                </div>
                <p className="text-xs text-[#A9B9D0] print:text-gray-700 mt-1">
                  Real-time weather tracking application with live atmospheric forecasts, location searching, temperature analytics, and adaptive weather conditions visualization.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/20 print:bg-gray-50 print:border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <h3 className="font-bold text-sm text-[#F8FAFC] print:text-black">
                    TaskFlow Modern Todo App
                  </h3>
                  <span className="text-xs text-[#008CFF] font-mono print:text-blue-600">
                    HTML5 &bull; JavaScript &bull; CSS3 &bull; LocalStorage
                  </span>
                </div>
                <p className="text-xs text-[#A9B9D0] print:text-gray-700 mt-1">
                  Productivity management tool featuring category filtering, state persistence, clean task completion workflows, and intuitive user interface.
                </p>
              </div>
            </div>
          </div>

          {/* 7. Languages */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#00CFFF] flex items-center gap-2 print:text-blue-700">
              <Globe className="w-4 h-4 text-[#00CFFF] print:text-blue-600" />
              Languages
            </h2>
            <div className="flex flex-wrap gap-4 text-xs text-[#A9B9D0] print:text-gray-700">
              <span className="px-3 py-1.5 rounded-lg bg-[#06162D] border border-[#008CFF]/20 print:bg-gray-100">
                <strong className="text-white print:text-black">English:</strong> Professional Working Proficiency
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-[#06162D] border border-[#008CFF]/20 print:bg-gray-100">
                <strong className="text-white print:text-black">Urdu:</strong> Native / Bilingual
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-[#06162D] border border-[#008CFF]/20 print:bg-gray-100">
                <strong className="text-white print:text-black">Pashto:</strong> Native / Bilingual
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#008CFF]/20 bg-[#020B1B]/90 flex items-center justify-between print:hidden">
          <p className="text-xs text-[#A9B9D0]">
            Mohammad Sohail &bull; BS Software Engineering &bull; 2026
          </p>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-[#A9B9D0] hover:text-white bg-[#0B1F3F] hover:bg-[#06162D] border border-[#008CFF]/30 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
