import React from 'react';
import { SiteSettings } from '../types/pharmacy';
import { Phone, MessageSquare, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenConsultationModal: () => void;
  siteSettings: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenConsultationModal,
  siteSettings,
}) => {
  return (
    <footer className="bg-[#14291D] text-[#BACEC2] text-xs border-t border-[#1C3A27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Col 1: Brand Info */}
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
              {siteSettings.brandName}
            </h3>
            <p className="font-serif italic text-xs text-[#A5D6B6]">
              {siteSettings.hindiName}
            </p>
            <p className="text-[#96AEA0] text-xs leading-relaxed">
              Standardized classical botanical formulations crafted with clinical precision and therapeutic purity.
            </p>
            <p className="text-[11px] text-[#A5D6B6] pt-1">
              Pharmacist: {siteSettings.headPharmacist}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Catalog & Deals
            </h4>
            <ul className="space-y-1.5 text-[#96AEA0]">
              <li>
                <button
                  onClick={() => onNavigateSection('deals-catalog')}
                  className="hover:text-white transition-colors"
                >
                  All Products & Deals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('ailment-guide')}
                  className="hover:text-white transition-colors"
                >
                  Remedy Quick Finder
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('dosage-uses')}
                  className="hover:text-white transition-colors"
                >
                  Dosage & Anupana Science
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenConsultationModal}
                  className="hover:text-white transition-colors"
                >
                  Vaidya Consultation
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Multiple Contact Channels */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Direct Contacts
            </h4>
            <ul className="space-y-2 text-[#96AEA0]">
              {/* Phones */}
              {siteFormPhone(siteSettings)}

              {/* WhatsApps */}
              {siteSettings.contacts.whatsapps.slice(0, 2).map((w, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                  <a 
                    href={`https://wa.me/${w.number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white truncate"
                  >
                    {w.label}: {w.displayNumber || w.number}
                  </a>
                </li>
              ))}

              {/* Emails */}
              {siteSettings.contacts.emails.slice(0, 2).map((e, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#A5D6B6] shrink-0" />
                  <a 
                    href={`mailto:${e.email}`}
                    className="hover:text-white truncate"
                  >
                    {e.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Dispensary Store */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Dispensary
            </h4>
            <p className="text-[11px] text-[#96AEA0] leading-relaxed">
              {siteSettings.storeAddress}
            </p>
            <div className="text-[11px] text-[#A5D6B6] pt-1">
              Timing: {siteSettings.storeTimings}
            </div>
            <div className="text-[11px] text-[#A5D6B6]">
              AYUSH Reg: {siteSettings.regNumber}
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-4 border-t border-[#1C3A27] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#718D7D]">
          <span>
            © {new Date().getFullYear()} {siteSettings.brandName}. All rights reserved.
          </span>
          <span>
            100% Verified Botanical Formulations & Deals
          </span>
        </div>
      </div>
    </footer>
  );
};

function siteFormPhone(settings: SiteSettings) {
  return settings.contacts.phones.slice(0, 2).map((p, idx) => (
    <li key={idx} className="flex items-center gap-2">
      <Phone className="w-3.5 h-3.5 text-[#A5D6B6] shrink-0" />
      <a 
        href={`tel:${p.number.replace(/\s+/g, '')}`}
        className="hover:text-white font-mono tabular-nums"
      >
        {p.label}: {p.number}
      </a>
    </li>
  ));
}
