import React, { useState } from 'react';
import { Phone, MessageCircle, Calendar, X, Sparkles, User, Clock } from 'lucide-react';
import { SiteSettings } from '../types/pharmacy';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryPhone, 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES,
  buildWhatsAppUrl 
} from '../utils/messageFormatter';

interface FloatingContactWidgetProps {
  onOpenConsultationModal: () => void;
  siteSettings: SiteSettings;
}

export const FloatingContactWidget: React.FC<FloatingContactWidgetProps> = ({
  onOpenConsultationModal,
  siteSettings,
}) => {
  const { currentUser } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  const primaryPhone = getPrimaryPhone(siteSettings);
  const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);

  const floatingTemplate = siteSettings.messageTemplates?.floatingWhatsApp || DEFAULT_MESSAGE_TEMPLATES.floatingWhatsApp;
  const includeUserInfo = siteSettings.messageTemplates?.includeUserInfo ?? true;

  const formattedMsg = formatCustomMessage(
    floatingTemplate,
    { brandName: siteSettings.brandName },
    currentUser,
    includeUserInfo
  );

  const handleWhatsApp = () => {
    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  return (
    <aside 
      aria-label="Quick Contact Helpline"
      className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end gap-2"
    >
      {/* Interactive Tooltip Card on Hover / Toggle */}
      {showTooltip && (
        <div className="w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#D5CCBC] p-4 text-[#1E2922] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D4]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-serif text-xs font-bold text-[#14291D]">
                {siteSettings.brandName} Helpline
              </span>
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              className="p-1 text-[#786D5C] hover:text-[#14291D] rounded cursor-pointer"
              title="Close tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5 space-y-2 text-xs">
            <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#EDE5D6] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#635948]">
                <span>Pharmacist On Duty:</span>
                <span className="font-bold text-[#14291D]">{siteSettings.headPharmacist}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#635948]">
                <span>WhatsApp:</span>
                <span className="font-mono font-bold text-emerald-700">{primaryWhatsApp.displayNumber}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#635948]">
                <span>Phone Helpline:</span>
                <span className="font-mono font-bold text-[#14291D]">{primaryPhone}</span>
              </div>
            </div>

            {/* Custom Message Preview */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#807563] block">
                Custom Message Sent to WhatsApp:
              </span>
              <p className="text-[11px] text-[#4A4133] italic bg-[#F2EDE1]/60 p-2 rounded border border-[#E3DBD0] max-h-20 overflow-y-auto whitespace-pre-wrap">
                "{formattedMsg}"
              </p>
            </div>

            {currentUser && (
              <div className="flex items-center gap-1 text-[10px] text-[#2C5E43] font-medium">
                <User className="w-3 h-3" />
                <span>Patient info ({currentUser.name}) attached automatically</span>
              </div>
            )}
          </div>

          <div className="pt-1 flex gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex-1 py-1.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Launch Chat Now</span>
            </button>
            <a
              href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
              className="py-1.5 px-3 bg-[#14291D] hover:bg-[#203F2D] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Pill */}
      <div className="bg-[#183624]/95 backdrop-blur-md text-white p-1.5 sm:p-2 rounded-full shadow-2xl border border-[#2D6043] flex items-center gap-1.5 sm:gap-2">
        {/* Info / Tooltip Toggle Button */}
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          title="Preview Helpline Numbers & Custom Message"
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#A5D6B6] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        {/* Direct Call Button */}
        <a
          href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
          aria-label={`Call Pharmacist: ${primaryPhone}`}
          title={`Direct Call: ${primaryPhone}`}
          className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#D8EADB] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-[#A5D6B6]" />
          <span className="hidden md:inline font-mono">Call: {primaryPhone}</span>
        </a>

        {/* Book Consultation Modal */}
        <button
          onClick={onOpenConsultationModal}
          className="hidden sm:flex px-3 py-2 rounded-full bg-[#E7EFEA] text-[#14291D] hover:bg-[#d5e4db] transition-colors items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-[#2C5E43]" />
          <span>Consult Vaidya</span>
        </button>

        {/* Direct WhatsApp Instant Consultation */}
        <button
          onClick={handleWhatsApp}
          title={`WhatsApp: ${primaryWhatsApp.displayNumber}\nClick to send custom message`}
          className="px-3.5 py-2 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-md cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp: {primaryWhatsApp.displayNumber}</span>
        </button>
      </div>
    </aside>
  );
};
