import React, { useState } from 'react';
import { Mail, MapPin, Send, MessageCircle, CheckCircle, AlertCircle, Loader2, Github, Linkedin, ExternalLink } from 'lucide-react';
import { ProfileInfo } from '../types';
import { api } from '../services/api';

interface ContactSectionProps {
  profile: ProfileInfo;
  prefilledSubject?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile, prefilledSubject = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: prefilledSubject || '',
    message: '',
    honeypot: '', // anti-bot spam trap
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync prefilled subject if provided
  React.useEffect(() => {
    if (prefilledSubject) {
      setFormData((prev) => ({ ...prev, subject: `Inquiry regarding ${prefilledSubject}` }));
    }
  }, [prefilledSubject]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please provide your full name (at least 2 characters).';
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      errs.subject = 'Please enter a subject (at least 3 characters).';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Please provide a message of at least 10 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.submitContact(formData);
      setSuccessMessage(response.message);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        honeypot: '',
      });
      setErrors({});
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit contact message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = profile.whatsappNumber
    ? `https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hello Mohammad Sohail, I would like to inquire about working together on a project.`
      )}`
    : null;

  return (
    <section id="contact" className="py-14 sm:py-16 md:py-28 relative bg-[#020B1B] overflow-hidden w-full isolate">
      {/* Decorative gradient glow contained within viewport */}
      <div className="absolute bottom-10 left-0 w-56 sm:w-96 h-56 sm:h-96 bg-[#008CFF]/10 rounded-full blur-[80px] sm:blur-[140px] pointer-events-none z-0 max-w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
          {/* Left Column: Contact Info & Value Proposition */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 min-w-0">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
                Contact
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#008CFF] tracking-wide">
                Have a project in mind? Let's work together!
              </p>
            </div>

            <p className="text-xs sm:text-base text-[#A9B9D0] leading-relaxed">
              Whether you need a modern web application, frontend revamp, graphic design, or AI automation solutions, feel free to drop a message. I'm actively open to freelance projects and full-time opportunities.
            </p>

            {/* Quick Contact & Social Profile Cards */}
            <div className="space-y-2.5 sm:space-y-3 pt-1">
              <a
                href={`mailto:${profile.email}`}
                className="p-3 sm:p-3.5 rounded-xl bg-[#06162D] border border-[#008CFF]/20 hover:border-[#00CFFF]/60 flex items-center justify-between gap-2.5 sm:gap-4 transition-all group min-w-0 w-full"
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#0B1F3F] flex items-center justify-center text-[#00CFFF] group-hover:scale-105 transition-transform shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[#A9B9D0]">Email Address</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] group-hover:text-[#00CFFF] transition-colors truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#A9B9D0] group-hover:text-[#00CFFF] opacity-60 group-hover:opacity-100 transition-all shrink-0" />
              </a>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 sm:p-3.5 rounded-xl bg-[#06162D] border border-[#008CFF]/20 hover:border-[#25D366] flex items-center justify-between gap-3 sm:gap-4 transition-all group min-w-0"
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#0B1F3F] flex items-center justify-center text-[#25D366] group-hover:scale-105 transition-transform shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-[#A9B9D0]">WhatsApp Direct</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] group-hover:text-[#25D366] transition-colors truncate">
                        {profile.phone || '0328 5490043'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#A9B9D0] group-hover:text-[#25D366] opacity-60 group-hover:opacity-100 transition-all shrink-0" />
                </a>
              )}

              <a
                href={profile.githubUrl || 'https://github.com/Sohail-star'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-xl bg-[#06162D] border border-[#008CFF]/20 hover:border-white flex items-center justify-between gap-3 sm:gap-4 transition-all group min-w-0"
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#0B1F3F] flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                    <Github className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[#A9B9D0]">GitHub Profile</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] group-hover:text-white transition-colors truncate">
                      github.com/Sohail-star
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#A9B9D0] group-hover:text-white opacity-60 group-hover:opacity-100 transition-all shrink-0" />
              </a>

              <a
                href={profile.linkedinUrl || 'https://www.linkedin.com/in/muhammad-sohail-8a32102ab/'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-xl bg-[#06162D] border border-[#008CFF]/20 hover:border-[#0A66C2] flex items-center justify-between gap-3 sm:gap-4 transition-all group min-w-0"
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#0B1F3F] flex items-center justify-center text-[#0A66C2] group-hover:scale-105 transition-transform shrink-0">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[#A9B9D0]">LinkedIn Profile</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] group-hover:text-[#0A66C2] transition-colors truncate">
                      Muhammad Sohail
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#A9B9D0] group-hover:text-[#0A66C2] opacity-60 group-hover:opacity-100 transition-all shrink-0" />
              </a>
            </div>
          </div>

          {/* Right Column: Full-Stack Contact Form */}
          <div className="lg:col-span-7 min-w-0">
            <div className="p-4 sm:p-8 rounded-2xl bg-[#06162D] border border-[#008CFF]/30 shadow-2xl shadow-black/40 relative min-w-0">
              {/* Feedback messages */}
              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-sm flex items-start gap-3 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-300">Message Delivered!</h4>
                    <p className="text-xs text-emerald-200/90 mt-0.5">{successMessage}</p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-rose-300">Submission Error</h4>
                    <p className="text-xs text-rose-200/90 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot hidden input */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#A9B9D0]">
                      Full Name <span className="text-[#00CFFF]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-xl bg-[#020B1B] text-[#F8FAFC] border transition-all text-sm focus:outline-none ${
                        errors.name
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-[#008CFF]/25 focus:border-[#00CFFF] focus:ring-1 focus:ring-[#00CFFF]'
                      }`}
                    />
                    {errors.name && <p className="text-[11px] text-rose-400">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#A9B9D0]">
                      Email Address <span className="text-[#00CFFF]">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-xl bg-[#020B1B] text-[#F8FAFC] border transition-all text-sm focus:outline-none ${
                        errors.email
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-[#008CFF]/25 focus:border-[#00CFFF] focus:ring-1 focus:ring-[#00CFFF]'
                      }`}
                    />
                    {errors.email && <p className="text-[11px] text-rose-400">{errors.email}</p>}
                  </div>
                </div>

                {/* Phone & Subject Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#A9B9D0]">
                      Phone Number <span className="text-xs text-[#A9B9D0]/60">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#020B1B] text-[#F8FAFC] border border-[#008CFF]/25 focus:border-[#00CFFF] focus:ring-1 focus:ring-[#00CFFF] transition-all text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#A9B9D0]">
                      Subject <span className="text-[#00CFFF]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => {
                        setFormData({ ...formData, subject: e.target.value });
                        if (errors.subject) setErrors({ ...errors, subject: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-xl bg-[#020B1B] text-[#F8FAFC] border transition-all text-sm focus:outline-none ${
                        errors.subject
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-[#008CFF]/25 focus:border-[#00CFFF] focus:ring-1 focus:ring-[#00CFFF]'
                      }`}
                    />
                    {errors.subject && <p className="text-[11px] text-rose-400">{errors.subject}</p>}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#A9B9D0]">
                    Your Message <span className="text-[#00CFFF]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-[#020B1B] text-[#F8FAFC] border transition-all text-sm focus:outline-none resize-none ${
                      errors.message
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-[#008CFF]/25 focus:border-[#00CFFF] focus:ring-1 focus:ring-[#00CFFF]'
                    }`}
                  />
                  {errors.message && <p className="text-[11px] text-rose-400">{errors.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#008CFF] to-[#00CFFF] hover:from-[#00A3FF] hover:to-[#00D9FF] transition-all duration-200 shadow-lg shadow-[#008CFF]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
