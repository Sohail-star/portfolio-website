import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  ownerName: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ phoneNumber, ownerName }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!phoneNumber) return null;

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const chatMessage = encodeURIComponent(
    `Hello ${ownerName}, I came across your portfolio website and would like to discuss a project with you!`
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${chatMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip bubble on hover */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#06162D] border border-[#008CFF]/30 text-xs text-[#F8FAFC] shadow-xl animate-fade-in whitespace-nowrap">
          <span>Chat directly on WhatsApp</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-[#A9B9D0] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Chat with Mohammad Sohail on WhatsApp"
        className="w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all duration-300 relative group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#020B1B] rounded-full" />
      </a>
    </div>
  );
};
