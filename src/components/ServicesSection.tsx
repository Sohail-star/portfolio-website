import React from 'react';
import { Globe, Palette, Video, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Service } from '../types';

interface ServicesSectionProps {
  services: Service[];
  onSelectService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services, onSelectService }) => {
  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'code':
      case 'globe':
        return <Globe className="w-6 h-6 text-[#00CFFF]" />;
      case 'palette':
        return <Palette className="w-6 h-6 text-[#00CFFF]" />;
      case 'video':
        return <Video className="w-6 h-6 text-[#00CFFF]" />;
      case 'bot':
      case 'sparkles':
        return <Bot className="w-6 h-6 text-[#00CFFF]" />;
      default:
        return <Globe className="w-6 h-6 text-[#00CFFF]" />;
    }
  };

  return (
    <section id="services" className="py-14 sm:py-16 md:py-28 relative bg-[#020B1B]/70 overflow-hidden w-full isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center sm:text-left space-y-1 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            My Services
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#008CFF] tracking-wide">
            What I offer
          </p>
        </div>

        {/* 4 Premium Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => onSelectService(service.title)}
              className="group p-4 sm:p-6 rounded-2xl bg-[#06162D] border border-[#008CFF]/20 hover:border-[#00CFFF]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#008CFF]/15 flex flex-col justify-between cursor-pointer hover:-translate-y-1 relative min-w-0"
            >
              <div className="space-y-3.5 sm:space-y-4">
                {/* Icon box */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0B1F3F] border border-[#008CFF]/30 flex items-center justify-center group-hover:scale-105 group-hover:border-[#00CFFF] transition-all shrink-0">
                  {getIcon(service.icon)}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] group-hover:text-[#00CFFF] transition-colors leading-snug">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#A9B9D0] leading-relaxed">
                  {service.description}
                </p>

                {/* Features list */}
                {service.features && service.features.length > 0 && (
                  <ul className="pt-2 space-y-1.5 text-xs text-[#A9B9D0]/90">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008CFF] shrink-0 mt-0.5" />
                        <span className="break-words leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Bottom arrow CTA */}
              <div className="pt-5 sm:pt-6 flex items-center justify-between border-t border-[#008CFF]/10 mt-5 sm:mt-6">
                <span className="text-xs font-semibold text-[#008CFF] group-hover:text-[#00CFFF] transition-colors">
                  Inquire Now
                </span>
                <div className="w-8 h-8 rounded-full bg-[#0B1F3F] group-hover:bg-[#008CFF] text-[#00CFFF] group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
