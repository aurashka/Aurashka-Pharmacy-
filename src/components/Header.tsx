import React from 'react';
import { Phone, MessageSquare, ShoppingBag, LogIn, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SiteSettings } from '../types/pharmacy';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenConsultationModal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAuthModal: () => void;
  onOpenAdminPanel: () => void;
  siteSettings: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenConsultationModal,
  onNavigateSection,
  onOpenAuthModal,
  onOpenAdminPanel,
  siteSettings,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();

  const primaryPhone = siteSettings.contacts.phones[0]?.number || '+91 98765 43210';
  const primaryWhatsApp = siteSettings.contacts.whatsapps[0] || {
    number: '919876543210',
    displayNumber: '+91 98765 43210',
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7DFD1]">
      {/* Top Helpline Ribbon */}
      <div className="bg-[#14291D] text-[#E7EFEA] text-[11px] px-4 py-1.5 border-b border-[#1E3B2A]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#A5D6B6]">{siteSettings.brandName} Apothecary</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span className="hidden sm:inline text-white/70">{siteSettings.storeTimings}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-[#A5D6B6]" />
              <span className="font-mono tabular-nums">{primaryPhone}</span>
            </a>

            <span aria-hidden="true" className="text-white/30">·</span>

            <a
              href={`https://wa.me/${primaryWhatsApp.number}?text=Namaste,%20I%20want%20to%20inquire%20about%20${encodeURIComponent(siteSettings.brandName)}%20herbal%20formulations.`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#4ADE80] hover:text-[#86efac] font-medium transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp: {primaryWhatsApp.displayNumber}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Title */}
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#14291D] hover:opacity-90 transition-opacity"
        >
          {siteSettings.brandName}
        </a>

        {/* Minimalist Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#52493A]">
          <button
            onClick={() => onNavigateSection('deals-catalog')}
            className="hover:text-[#14291D] transition-colors"
          >
            Formulations & Deals
          </button>
          <button
            onClick={() => onNavigateSection('ailment-guide')}
            className="hover:text-[#14291D] transition-colors"
          >
            Remedy Finder
          </button>
          <button
            onClick={() => onNavigateSection('dosage-uses')}
            className="hover:text-[#14291D] transition-colors"
          >
            Dosage & Uses
          </button>
          <button
            onClick={() => onNavigateSection('contact-us')}
            className="hover:text-[#14291D] transition-colors font-semibold"
          >
            Contacts & Helpline
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* FOR USER ROLE 'ADMIN': PROMINENT ADMIN ACCESS BUTTON IN HEADER */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#B4741E] hover:bg-[#975f15] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm border border-[#F4BE77]"
              title="Open Admin Control Center"
            >
              <Settings className="w-3.5 h-3.5 text-amber-200" />
              <span>⚡ Admin Access</span>
            </button>
          )}

          {/* User Sign In / Account */}
          {currentUser ? (
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline-block text-xs font-medium text-[#3C3428] px-2 py-1 bg-[#F4EFE6] rounded-md">
                {currentUser.name}
              </span>
              <button
                onClick={logout}
                className="p-1.5 text-[#6B6150] hover:text-red-700 hover:bg-[#EFEAE0] rounded-lg transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 text-xs font-medium text-[#292217] hover:bg-[#EFEAE0] border border-[#DDD5C5] rounded-lg transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5 text-[#2C5E43]" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Bag */}
          <button
            onClick={onOpenCart}
            aria-label="View Order Bag"
            className="relative p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-white bg-[#14291D] hover:bg-[#203F2D] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#D49838] text-[#14291D] font-bold text-[10px] flex items-center justify-center font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
