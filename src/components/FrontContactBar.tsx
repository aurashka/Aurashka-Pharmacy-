import React from 'react';
import { Phone, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { SiteSettings } from '../types/pharmacy';

interface FrontContactBarProps {
  onOpenConsultationModal: () => void;
  onScrollToContact: () => void;
  siteSettings: SiteSettings;
}

export const FrontContactBar: React.FC<FrontContactBarProps> = ({
  onOpenConsultationModal,
  onScrollToContact,
  siteSettings,
}) => {
  const primaryPhone = siteSettings.contacts.phones[0]?.number || '+91 98765 43210';
  const primaryWhatsApp = siteSettings.contacts.whatsapps[0] || {
    number: '919876543210',
    displayNumber: '+91 98765 43210',
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Namaste, I would like to contact ${siteSettings.brandName} for medicine inquiries.`
    );
    window.open(`https://wa.me/${primaryWhatsApp.number}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-[#F6F3EC] border-b border-[#E7DFD1] py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#463D30]">
          <span className="font-semibold text-[#14291D]">Apothecary Helplines:</span>
          <a
            href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
            className="font-mono font-medium hover:text-[#14291D] transition-colors"
          >
            {primaryPhone}
          </a>
          <span aria-hidden="true" className="text-[#C5BBA9]">·</span>
          <span className="hidden md:inline text-[#6B6150]">{siteSettings.storeTimings}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsApp}
            className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-medium text-xs hover:bg-[#20bd5a] transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp: {primaryWhatsApp.displayNumber}</span>
          </button>

          <button
            onClick={onOpenConsultationModal}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#D5CCBC] text-[#292218] hover:bg-[#FAF8F5] font-medium text-xs transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>Consultation</span>
          </button>

          <button
            onClick={onScrollToContact}
            className="hidden lg:flex px-2.5 py-1.5 text-xs text-[#5E5445] hover:text-[#14291D] transition-colors items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>Store Address</span>
          </button>
        </div>
      </div>
    </div>
  );
};
