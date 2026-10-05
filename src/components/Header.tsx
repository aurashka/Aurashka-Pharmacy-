import React, { useState } from 'react';
import { 
  ShoppingBag, 
  LogIn, 
  LogOut, 
  Settings, 
  Menu, 
  X, 
  Sparkles, 
  MessageCircle, 
  Phone, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SiteSettings } from '../types/pharmacy';
import { formatCompactNumber } from '../utils/numberFormatter';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7DFD1]">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Title & Logo */}
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity group min-w-0"
        >
          {siteSettings.showBrandLogo !== false && siteSettings.brandLogoImage && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#2C5E43]/40 shadow-xs shrink-0 bg-[#E7EFEA] flex items-center justify-center">
              <img
                src={siteSettings.brandLogoImage}
                alt={siteSettings.brandName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              />
            </div>
          )}
          <div className="flex flex-col text-left truncate">
            <span className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#14291D] leading-none truncate">
              {siteSettings.brandName}
            </span>
            {siteSettings.hindiName && (
              <span className="text-[9.5px] sm:text-[11px] font-serif text-[#2C5E43] font-medium leading-tight mt-0.5 truncate">
                {siteSettings.hindiName}
              </span>
            )}
          </div>
        </a>

        {/* Minimalist Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#52493A]">
          <button
            onClick={() => onNavigateSection('deals-catalog')}
            className="hover:text-[#14291D] transition-colors cursor-pointer"
          >
            Formulations & Deals
          </button>
          <button
            onClick={onOpenConsultationModal}
            className="hover:text-[#14291D] transition-colors cursor-pointer"
          >
            Clinical Consultation
          </button>
          <button
            onClick={() => onNavigateSection('contact-us')}
            className="hover:text-[#14291D] transition-colors font-semibold px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#DDD5C5] text-[#14291D] cursor-pointer"
          >
            Contact Page
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* FOR USER ROLE 'ADMIN': PROMINENT ADMIN ACCESS BUTTON IN HEADER */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="hidden sm:flex px-3 py-1.5 text-xs font-bold text-white bg-[#B4741E] hover:bg-[#975f15] rounded-lg transition-colors items-center gap-1.5 shadow-sm border border-[#F4BE77] cursor-pointer"
              title="Open Admin Control Center"
            >
              <Settings className="w-3.5 h-3.5 text-amber-200" />
              <span>Admin</span>
            </button>
          )}

          {/* User Sign In / Account (Desktop) */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-xs font-medium text-[#3C3428] px-2 py-1 bg-[#F4EFE6] rounded-md max-w-[120px] truncate">
                {currentUser.name}
              </span>
              <button
                onClick={logout}
                className="p-1.5 text-[#6B6150] hover:text-red-700 hover:bg-[#EFEAE0] rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-[#292217] hover:bg-[#EFEAE0] border border-[#DDD5C5] rounded-lg transition-colors items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#2C5E43]" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Bag */}
          <button
            onClick={onOpenCart}
            aria-label="View Order Bag"
            className="relative p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-white bg-[#14291D] hover:bg-[#203F2D] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-[#D49838] text-[#14291D] font-bold text-[10px] flex items-center justify-center font-mono">
                {formatCompactNumber(cartCount)}
              </span>
            )}
          </button>

          {/* Mobile Hamburger / Expandable Menu Toggle Button (Visible on Android Phones / Screens < md) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#EFEAE0] text-[#14291D] border border-[#DDD5C5] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-[#14291D]" />
            ) : (
              <Menu className="w-4 h-4 text-[#14291D]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Expandable Menu (Android Screen: Formulations & Deals, Clinical Consultation, Contact Page) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7DFD1] bg-[#FAF8F5] px-4 py-3 space-y-2.5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#716858]">
              Navigation Menu
            </span>
            <span className="text-[10px] text-[#2C5E43] font-semibold">
              Tap to view
            </span>
          </div>

          <div className="space-y-1.5">
            {/* 1. Formulations & Deals */}
            <button
              onClick={() => {
                onNavigateSection('deals-catalog');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50/80 active:bg-emerald-100 border border-[#DDD5C5] hover:border-[#2C5E43] text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#14291D] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#14291D] group-hover:text-[#2C5E43] transition-colors">
                    Formulations & Deals
                  </div>
                  <div className="text-[10px] text-[#716858]">
                    Explore classical apothecary medicines & discounts
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C8270] group-hover:text-[#14291D] transition-colors shrink-0" />
            </button>

            {/* 2. Clinical Consultation */}
            <button
              onClick={() => {
                onOpenConsultationModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50/80 active:bg-emerald-100 border border-[#DDD5C5] hover:border-[#2C5E43] text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#B4741E] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-[#B4741E]" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#14291D] group-hover:text-[#2C5E43] transition-colors">
                    Clinical Consultation
                  </div>
                  <div className="text-[10px] text-[#716858]">
                    Get personalized Ayurvedic dosage advice & guidance
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C8270] group-hover:text-[#14291D] transition-colors shrink-0" />
            </button>

            {/* 3. Contact Page */}
            <button
              onClick={() => {
                onNavigateSection('contact-us');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50/80 active:bg-emerald-100 border border-[#DDD5C5] hover:border-[#2C5E43] text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-[#14291D] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#2C5E43]" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#14291D] group-hover:text-[#2C5E43] transition-colors">
                    Contact Page
                  </div>
                  <div className="text-[10px] text-[#716858]">
                    Store address, timings, WhatsApp & pharmacy helpline
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C8270] group-hover:text-[#14291D] transition-colors shrink-0" />
            </button>
          </div>

          {/* Quick Admin Access & User Account in Mobile Menu */}
          <div className="pt-2 flex items-center gap-2 border-t border-[#EAE3D4]">
            {isAdmin && (
              <button
                onClick={() => {
                  onOpenAdminPanel();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 bg-[#B4741E] hover:bg-[#975f15] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center justify-between flex-1 bg-white px-3 py-1.5 rounded-lg border border-[#DDD5C5] text-xs">
                <span className="font-medium text-[#14291D] truncate">{currentUser.name}</span>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-red-700 font-bold hover:underline text-[11px] ml-2 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 bg-white hover:bg-stone-50 text-[#14291D] border border-[#DDD5C5] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#2C5E43]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
