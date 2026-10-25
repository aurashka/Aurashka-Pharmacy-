import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Calendar, 
  X, 
  Sparkles, 
  User, 
  Clock, 
  Headphones, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

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

  // Close when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleWhatsApp = () => {
    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleConsult = () => {
    onOpenConsultationModal();
    setIsOpen(false);
  };

  return (
    <aside 
      ref={widgetRef}
      aria-label="Quick Contact Helpline"
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex flex-col items-end gap-2.5 select-none"
    >
      {/* Expanded Quick Contact Panel (Appears on click with smooth animation) */}
      {isOpen && (
        <div 
          className="w-72 sm:w-80 bg-white/98 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(20,50,30,0.28)] border border-[#DCEFE3] p-4 text-[#142B1F] animate-in fade-in slide-in-from-bottom-3 duration-200 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#EAF4EE]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center border border-[#BDE8D1]">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif text-xs font-bold text-[#14291D] block">
                  Apothecary Helpline
                </span>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Pharmacist On Duty
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full cursor-pointer transition-colors"
              title="Close menu"
              aria-label="Close contact menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Actions List */}
          <div className="space-y-2">
            {/* 1. WhatsApp Instant Consultation */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#19a550] text-white flex items-center justify-between shadow-sm cursor-pointer transition-transform active:scale-98 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block leading-tight">
                    Chat on WhatsApp
                  </span>
                  <span className="text-[10px] text-white/80 leading-tight">
                    Instant advice & order inquiry
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 2. Direct Call Helpline */}
            <a
              href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
              onClick={() => setIsOpen(false)}
              className="w-full p-2.5 rounded-2xl bg-[#F6FAF7] hover:bg-[#EEF7F1] border border-[#DCEFE3] text-[#142B1F] flex items-center justify-between cursor-pointer transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DCF3E7] text-[#1E6B47] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block leading-tight text-[#14291D]">
                    Call Helpline
                  </span>
                  <span className="text-[10px] text-[#526B5C] font-mono leading-tight">
                    {primaryPhone}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* 3. Book Doctor / Vaidya Consultation */}
            <button
              type="button"
              onClick={handleConsult}
              className="w-full p-2.5 rounded-2xl bg-[#F6FAF7] hover:bg-[#EEF7F1] border border-[#DCEFE3] text-[#142B1F] flex items-center justify-between cursor-pointer transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DCF3E7] text-[#1E6B47] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block leading-tight text-[#14291D]">
                    Book Free Consultation
                  </span>
                  <span className="text-[10px] text-[#526B5C] leading-tight">
                    Dosage & health guidance
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Pharmacist Info Note */}
          <div className="pt-1 border-t border-[#EAF4EE] flex items-center justify-between text-[10px] text-[#6B8576]">
            <span>Head Pharmacist: <strong className="text-[#142B1F]">{siteSettings.headPharmacist || 'Vaidya team'}</strong></span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          </div>
        </div>
      )}

      {/* Premium Minimized Floating Contact Icon Button (With Live Pulse & Luxury Styling) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close contact menu' : 'Open contact helpline options'}
        title={isOpen ? 'Close contact menu' : 'Helpline & WhatsApp Support'}
        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-[0_10px_35px_rgba(20,50,30,0.30)] cursor-pointer transition-all duration-300 relative group active:scale-90 border-2 ${
          isOpen
            ? 'bg-[#14291D] border-emerald-400 rotate-90'
            : 'bg-gradient-to-tr from-[#143B25] via-[#1E6B47] to-[#2E8B5E] border-emerald-300/60 hover:scale-108 hover:shadow-[0_12px_40px_rgba(20,50,30,0.40)]'
        }`}
      >
        {/* Live beacon indicator when closed */}
        {!isOpen && (
          <>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-xs z-10 animate-pulse" />
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
          </>
        )}

        {/* Icon toggle */}
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 sm:w-6.5 sm:h-6.5 text-white fill-white/10 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </aside>
  );
};
