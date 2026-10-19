import React, { useState, useEffect } from 'react';
import { Quote, Star, MessageSquarePlus, X, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { Testimonial } from '../types';
import { api } from '../services/api';

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Usman Tariq',
    role: 'Fellow Student & SMIT Cohort Lead',
    quote:
      'Mohammad Sohail demonstrates exceptional commitment to frontend code clarity and modern UI design. His attention to detail in React and Tailwind CSS makes him stand out.',
    rating: 5,
    published: true,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 't-2',
    name: 'Farhan Ali',
    role: 'Local Business Owner, Peshawar',
    quote:
      'Sohail developed a responsive website prototype that exceeded our expectations. Fast communication, clean design, and great technical problem-solving skills.',
    rating: 5,
    published: true,
    createdAt: '2026-02-20T14:30:00.000Z',
  },
  {
    id: 't-3',
    name: 'Zubair Shah',
    role: 'Senior Software Engineer & Mentor',
    quote:
      'A very dedicated Software Engineering student with a genuine hunger for building real-world projects. His proactive attitude and full-stack mindset are remarkable.',
    rating: 5,
    published: true,
    createdAt: '2026-03-05T09:15:00.000Z',
  },
];

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [quote, setQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Load reviews directly from backend database API
  const loadReviews = async () => {
    try {
      const data = await api.getReviews();
      if (Array.isArray(data)) {
        setTestimonials(data);
      }
    } catch (err) {
      console.warn('Could not load reviews from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !quote.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const created = await api.submitReview({
        name: name.trim(),
        role: role.trim(),
        quote: quote.trim(),
        rating,
      });

      if (created) {
        setTestimonials((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
      } else {
        await loadReviews();
      }

      setSubmittedSuccess(true);
      setName('');
      setRole('');
      setRating(5);
      setQuote('');

      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsModalOpen(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return '5 Stars — Exceptional / Highly Recommended';
      case 4:
        return '4 Stars — Great Work';
      case 3:
        return '3 Stars — Good Experience';
      case 2:
        return '2 Stars — Fair';
      case 1:
        return '1 Star — Needs Improvement';
      default:
        return '';
    }
  };

  return (
    <section id="testimonials" className="py-20 md:py-24 relative bg-[#020B1B]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with "Add Feedback" button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              What People Say
            </h2>
            <p className="text-sm font-semibold text-[#008CFF] tracking-wide">
              Feedback from my clients, mentors, and peers
            </p>
          </div>

          {/* Attractive "Leave a Review" / "Add Feedback" Button */}
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00CFFF] hover:from-[#00A3FF] hover:to-[#00D9FF] shadow-lg shadow-[#008CFF]/25 hover:shadow-[#008CFF]/45 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Leave a Review</span>
            </button>
          </div>
        </div>

        {/* Testimonials Grid or Empty State */}
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-[#06162D] border border-[#008CFF]/20 hover:border-[#00CFFF]/50 transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1 shadow-lg shadow-black/40 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                      {[...Array(5 - item.rating)].map((_, i) => (
                        <Star key={i + item.rating} className="w-4 h-4 text-gray-600" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-[#008CFF]/40 group-hover:text-[#00CFFF]/70 transition-colors" />
                  </div>

                  <p className="text-sm text-[#A9B9D0] leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[#008CFF]/15 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#008CFF] to-[#00CFFF] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md shadow-[#008CFF]/30">
                    {item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F8FAFC]">{item.name}</h4>
                    <p className="text-xs text-[#00CFFF]">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-[#06162D] rounded-2xl border border-[#008CFF]/20 max-w-xl mx-auto space-y-3">
            <Quote className="w-10 h-10 text-[#008CFF]/40 mx-auto" />
            <h3 className="text-base font-bold text-[#F8FAFC]">No Reviews Yet</h3>
            <p className="text-xs text-[#A9B9D0]">
              Have you worked with Muhammad Sohail on a project? Be the first to share your feedback!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1F3F] text-xs font-semibold text-[#00CFFF] hover:bg-[#008CFF] hover:text-white transition-all border border-[#008CFF]/30 cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Leave the First Review</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Feedback / Review Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="relative w-full max-w-lg bg-[#06162D] border border-[#008CFF]/40 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#008CFF]/20 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0B1F3F] border border-[#008CFF]/30 flex items-center justify-center text-[#00CFFF]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#F8FAFC]">
                    Leave a Review
                  </h3>
                  <p className="text-xs text-[#A9B9D0]">
                    Share your experience working with Mohammad Sohail
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#A9B9D0] hover:text-white hover:bg-[#0B1F3F] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State Notification */}
            {submittedSuccess ? (
              <div className="py-10 text-center space-y-3 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-[#F8FAFC]">Thank You for Your Feedback!</h4>
                <p className="text-xs text-[#A9B9D0]">
                  Your review has been added to the testimonials section.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#A9B9D0] mb-1.5">
                    Your Full Name <span className="text-[#00CFFF]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020B1B] text-xs sm:text-sm text-[#F8FAFC] border border-[#008CFF]/30 focus:border-[#00CFFF] focus:outline-none"
                  />
                </div>

                {/* Role / Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#A9B9D0] mb-1.5">
                    Role / Title <span className="text-[#00CFFF]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020B1B] text-xs sm:text-sm text-[#F8FAFC] border border-[#008CFF]/30 focus:border-[#00CFFF] focus:outline-none"
                  />
                </div>

                {/* Star Rating (Interactive 1 to 5 Stars) */}
                <div className="p-3.5 rounded-xl bg-[#020B1B] border border-[#008CFF]/20 space-y-2">
                  <label className="block text-xs font-semibold text-[#A9B9D0]">
                    Star Rating <span className="text-[#00CFFF]">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = (hoveredRating || rating) >= starValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onMouseEnter={() => setHoveredRating(starValue)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(starValue)}
                          className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                          aria-label={`Rate ${starValue} star`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFilled
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-600 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] font-medium text-[#00CFFF]">
                    {getRatingLabel(hoveredRating || rating)}
                  </p>
                </div>

                {/* Feedback Message */}
                <div>
                  <label className="block text-xs font-semibold text-[#A9B9D0] mb-1.5">
                    Feedback Message <span className="text-[#00CFFF]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020B1B] text-xs sm:text-sm text-[#F8FAFC] border border-[#008CFF]/30 focus:border-[#00CFFF] focus:outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#008CFF]/20">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A9B9D0] hover:text-white bg-[#020B1B] hover:bg-[#0B1F3F] border border-[#008CFF]/20 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00CFFF] hover:from-[#00A3FF] hover:to-[#00D9FF] shadow-md shadow-[#008CFF]/30 hover:shadow-[#008CFF]/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting Review...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
