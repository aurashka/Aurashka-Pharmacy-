import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  LogIn, 
  LogOut, 
  Settings, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Package, 
  Stethoscope, 
  Phone 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SiteSettings, CategoryItem } from '../types/pharmacy';
import { formatCompactNumber } from '../utils/numberFormatter';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenConsultationModal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAuthModal: () => void;
  onOpenAdminPanel: () => void;
  siteSettings: SiteSettings;
  categories?: CategoryItem[];
  forms?: string[];
  onSelectCategory?: (category: string) => void;
  onSelectForm?: (form: string) => void;
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close floating dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleNavAction = (action: () => void) => {
    action();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      ref={headerRef} 
      className="sticky top-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-xl border-b border-[#E7DFD1]/85 shadow-2xs transition-all relative"
    >
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Zone 1: Brand Title & Circular Logo with Curbs */}
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsDropdownOpen(false);
            setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 sm:gap-3 hover:opacity-95 transition-opacity group min-w-0"
        >
          {siteSettings.showBrandLogo !== false && siteSettings.brandLogoImage && (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#2C5E43]/40 shadow-xs shrink-0 bg-[#E7EFEA] flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src={siteSettings.brandLogoImage}
                alt={siteSettings.brandName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              />
            </div>
          )}
          <div className="flex flex-col text-left truncate">
            <span className="font-serif text-xl sm:text-2xl md:text-[26px] font-bold tracking-tight text-[#14291D] leading-none truncate">
              {siteSettings.brandName}
            </span>
            {siteSettings.hindiName && (
              <span className="text-[10px] sm:text-[11.5px] font-serif text-[#2C5E43] font-medium leading-tight mt-0.5 truncate tracking-wide">
                {siteSettings.hindiName}
              </span>
            )}
          </div>
        </a>

        {/* Zone 2: Simple Floating Dropdown Navigation with Curbs & 2% Blur Opaque Effect (Desktop) */}
        <div ref={dropdownRef} className="hidden md:flex items-center relative">
          
          <div className="flex items-center gap-1 bg-white/80 border border-[#DDD5C5] p-1 rounded-full shadow-2xs backdrop-blur-md">
            
            {/* Simple Floating Dropdown Menu Trigger Button */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDropdownOpen
                    ? 'bg-[#14291D] text-white shadow-xs'
                    : 'bg-[#14291D] text-white hover:bg-[#203E2D]'
                }`}
              >
                <span>Menu</span>
                <ChevronDown 
                  className={`w-3.5 h-3.5 text-amber-300 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Floating Dropdown: position absolute, floats over page, 2% transparent + blur opaque + luxury curbs */}
              {isDropdownOpen && (
                <div 
                  className="dropdown-menu absolute top-full left-0 sm:left-1/2 sm:-translate-x-1/2 mt-2.5 w-76 sm:w-80 bg-white/98 backdrop-blur-2xl border border-[#DDD5C5]/90 rounded-2xl sm:rounded-3xl p-3 shadow-2xl shadow-emerald-950/10 ring-1 ring-black/5 z-50 animate-in fade-in-0 zoom-in-95 duration-150 space-y-2"
                  style={{ position: 'absolute' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="px-2 pt-1 pb-1.5 border-b border-[#F0EAE1] flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#716858]">
                      Quick Navigation
                    </span>
                    <span className="text-[10px] text-[#2C5E43] font-semibold">
                      Select section
                    </span>
                  </div>

                  {/* 1. Products & Prices */}
                  <button
                    type="button"
                    onClick={() => handleNavAction(() => onNavigateSection('deals-catalog'))}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FAF8F5] border border-transparent hover:border-[#DDD5C5] text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#14291D] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Package className="w-4 h-4 text-[#2C5E43]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#14291D] group-hover:text-[#2C5E43] flex items-center justify-between">
                        <span>Products & Prices</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8C8270] group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[10.5px] text-[#716858] leading-tight mt-0.5">
                        Classical formulations, MRP & deals catalog
                      </div>
                    </div>
                  </button>

                  {/* 2. Consultation */}
                  <button
                    type="button"
                    onClick={() => handleNavAction(onOpenConsultationModal)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#14291D] text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Stethoscope className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#14291D] group-hover:text-[#2C5E43] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>Consultation</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-700 text-white leading-tight">
                            Free
                          </span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-700 group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[10.5px] text-[#554C3E] leading-tight mt-0.5">
                        Personalized Ayurvedic dosage & health advice
                      </div>
                    </div>
                  </button>

                  {/* 3. Contact */}
                  <button
                    type="button"
                    onClick={() => handleNavAction(() => onNavigateSection('contact-us'))}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FAF8F5] border border-transparent hover:border-[#DDD5C5] text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-stone-100 text-[#14291D] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Phone className="w-4 h-4 text-[#2C5E43]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#14291D] group-hover:text-[#2C5E43] flex items-center justify-between">
                        <span>Contact</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8C8270] group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[10.5px] text-[#716858] leading-tight mt-0.5">
                        Dispensary address, WhatsApp & helpline
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Simple Direct Links inside the Curved Floating Pill */}
            <button
              type="button"
              onClick={() => onNavigateSection('deals-catalog')}
              className="px-3 py-1.5 text-xs font-medium text-[#4A4132] hover:text-[#14291D] rounded-full hover:bg-[#F2EDE2]/70 transition-colors cursor-pointer"
            >
              Products & Prices
            </button>

            <button
              type="button"
              onClick={onOpenConsultationModal}
              className="px-3 py-1.5 text-xs font-medium text-[#4A4132] hover:text-[#14291D] rounded-full hover:bg-[#F2EDE2]/70 transition-colors cursor-pointer"
            >
              Consultation
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection('contact-us')}
              className="px-3 py-1.5 text-xs font-semibold text-[#14291D] rounded-full hover:bg-[#F2EDE2]/70 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>

        {/* Zone 3: Actions & Cart Utility with Curbs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Admin Access Button */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="hidden sm:flex px-3.5 py-1.5 text-xs font-bold text-white bg-[#B4741E] hover:bg-[#975f15] rounded-xl transition-all items-center gap-1.5 shadow-sm border border-[#F4BE77] cursor-pointer"
              title="Open Admin Control Center"
            >
              <Settings className="w-3.5 h-3.5 text-amber-200" />
              <span>Admin</span>
            </button>
          )}

          {/* User Sign In / Account */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1 bg-[#F4EFE6] px-2 py-1 rounded-xl border border-[#DDD5C5]">
              <span className="text-xs font-medium text-[#3C3428] max-w-[120px] truncate">
                {currentUser.name}
              </span>
              <button
                onClick={logout}
                className="p-1 text-[#6B6150] hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-[#292217] hover:bg-[#EFEAE0] border border-[#DDD5C5] rounded-xl transition-all items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#2C5E43]" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Bag */}
          <button
            onClick={onOpenCart}
            aria-label="View Order Bag"
            className="relative p-2 sm:px-3.5 sm:py-1.5 text-xs font-semibold text-white bg-[#14291D] hover:bg-[#203F2D] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-[#D49838] text-[#14291D] font-bold text-[10px] flex items-center justify-center font-mono">
                {formatCompactNumber(cartCount)}
              </span>
            )}
          </button>

          {/* Mobile Floating Dropdown Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFEAE0] text-[#14291D] border border-[#DDD5C5] transition-all flex items-center justify-center cursor-pointer shadow-2xs"
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

      {/* Mobile Floating Dropdown Menu: STRICTLY position: absolute, floats on top of page, does not push page down */}
      {isMobileMenuOpen && (
        <div 
          className="dropdown-menu md:hidden absolute top-full left-3 right-3 mt-2 bg-white/98 backdrop-blur-2xl p-3.5 space-y-2 rounded-3xl border border-[#DDD5C5] shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200"
          style={{ position: 'absolute' }}
        >
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#716858]">
              Navigation Menu
            </span>
            <span className="text-[10px] text-[#2C5E43] font-bold">
              Tap to view
            </span>
          </div>

          {/* 1. Products & Prices */}
          <button
            type="button"
            onClick={() => handleNavAction(() => onNavigateSection('deals-catalog'))}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-emerald-50/80 active:bg-emerald-100 border border-[#DDD5C5] text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#14291D] flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-[#2C5E43]" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#14291D]">
                  Products & Prices
                </div>
                <div className="text-[10.5px] text-[#716858]">
                  Classical formulations, MRP & deals catalog
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C8270] shrink-0" />
          </button>

          {/* 2. Consultation */}
          <button
            type="button"
            onClick={() => handleNavAction(onOpenConsultationModal)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-emerald-50/80 active:bg-emerald-100 border border-[#DDD5C5] text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#14291D] text-white flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#14291D] flex items-center gap-1.5">
                  <span>Consultation</span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-700 text-white leading-tight">
                    Free
                  </span>
                </div>
                <div className="text-[10.5px] text-[#716858]">
                  Personalized Ayurvedic dosage guidance
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C8270] shrink-0" />
          </button>

          {/* 3. Contact */}
          <button
            type="button"
            onClick={() => handleNavAction(() => onNavigateSection('contact-us'))}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-emerald-50/80 active:bg-emerald-100 border border-[#DDD5C5] text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-100 text-[#14291D] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#2C5E43]" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#14291D]">
                  Contact
                </div>
                <div className="text-[10.5px] text-[#716858]">
                  Dispensary address, WhatsApp & helpline
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C8270] shrink-0" />
          </button>

          {/* Quick Admin Access & User Account in Mobile Menu */}
          <div className="pt-2 flex items-center gap-2 border-t border-[#EAE3D4]">
            {isAdmin && (
              <button
                onClick={() => {
                  onOpenAdminPanel();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 bg-[#B4741E] hover:bg-[#975f15] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center justify-between flex-1 bg-white px-3 py-1.5 rounded-xl border border-[#DDD5C5] text-xs">
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
                className="flex-1 py-2 px-3 bg-white hover:bg-stone-50 text-[#14291D] border border-[#DDD5C5] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
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
