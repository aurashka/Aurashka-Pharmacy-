import React from 'react';
import { Phone, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { SiteSettings } from '../types/pharmacy';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryPhone, 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES,
  buildWhatsAppUrl 
} from '../utils/messageFormatter';

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
  const { currentUser } = useAuth();
  const primaryPhone = getPrimaryPhone(siteSettings);
  const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);

  const frontTemplate = siteSettings.messageTemplates?.frontContactBarWhatsApp || DEFAULT_MESSAGE_TEMPLATES.frontContactBarWhatsApp;
  const includeUserInfo = siteSettings.messageTemplates?.includeUserInfo ?? true;

  const formattedMsg = formatCustomMessage(
    frontTemplate,
    { brandName: siteSettings.brandName },
    currentUser,
    includeUserInfo
  );

  const handleWhatsApp = () => {
    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#F6F3EC] border-b border-[#E7DFD1] py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#463D30]">
          <span className="font-semibold text-[#14291D]">Apothecary Helplines:</span>
          <a
            href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
            title="Call Pharmacist"
            className="inline-flex items-center gap-1 font-medium text-[#14291D] hover:underline transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>Call Pharmacist</span>
          </a>
          <span aria-hidden="true" className="text-[#C5BBA9]">·</span>
          <span className="hidden md:inline text-[#6B6150]">{siteSettings.storeTimings}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsApp}
            title="WhatsApp Helpline"
            className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-medium text-xs hover:bg-[#20bd5a] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={onOpenConsultationModal}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#D5CCBC] text-[#292218] hover:bg-[#FAF8F5] font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>Consultation</span>
          </button>

          <button
            onClick={onScrollToContact}
            className="hidden lg:flex px-2.5 py-1.5 text-xs text-[#5E5445] hover:text-[#14291D] transition-colors items-center gap-1 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>Store Address</span>
          </button>
        </div>
      </div>
    </div>
  );
};
