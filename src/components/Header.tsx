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
  Phone,
  Search,
  Leaf
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
  onOpenSearch?: () => void;
  siteSettings: SiteSettings;
  categories?: CategoryItem[];
  forms?: string[];
  onSelectCategory?: (category: string) => void;
  onSelectForm?: (form: string) => void;
  isLiveConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenConsultationModal,
  onNavigateSection,
  onOpenAuthModal,
  onOpenAdminPanel,
  onOpenSearch,
  siteSettings,
  isLiveConnected = false,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navMenuPlacement, setNavMenuPlacement] = useState<'left' | 'right'>('left');

  const headerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure Navigation Menu dropdown placement so it always stays inside visible screen bounds
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const menuWidth = 320;
      const windowWidth = window.innerWidth;
      const padding = 16;

      if (rect.left + menuWidth <= windowWidth - padding) {
        setNavMenuPlacement('left');
      } else {
        setNavMenuPlacement('right');
      }
    }
  }, [isDropdownOpen]);

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

  const headerBanner = siteSettings.headerBanner;
  const disableBlur = headerBanner?.showAtmosphereBlur === false;
  const topNavStyle = headerBanner?.topNavBackground || 'default';

  return (
    <header 
      ref={headerRef} 
      className={`sticky top-0 z-40 ${
        topNavStyle === 'match_header' && headerBanner?.backgroundColor
          ? 'border-b border-black/10 shadow-xs'
          : 'bg-white/80 backdrop-blur-xl border-b border-[#D8ECE0] shadow-[0_4px_24px_rgba(20,60,35,0.05)]'
      } ${disableBlur ? 'backdrop-blur-none' : 'backdrop-blur-xl'} transition-all relative`}
      style={topNavStyle === 'match_header' && headerBanner?.backgroundColor ? { backgroundColor: headerBanner.backgroundColor } : undefined}
    >
      {/* Top Header Row with Aurora Glassmorphism */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Zone 1: Brand Title & Leaf Logo from Reference Image */}
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsDropdownOpen(false);
            setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 hover:opacity-95 transition-opacity group min-w-0"
        >
          {siteSettings.showBrandLogo !== false && siteSettings.brandLogoImage ? (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border border-[#A3D9C0]/60 shadow-xs shrink-0 bg-[#E8F6EE] flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src={siteSettings.brandLogoImage}
                alt={siteSettings.brandName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#143B25] to-[#1E6B47] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 shrink-0 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-[#A3D9C0]" />
            </div>
          )}
          <div className="flex flex-col text-left truncate">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#143B25] leading-none truncate">
              {siteSettings.brandName}
            </span>
            {siteSettings.hindiName && (
              <span className="text-[10.5px] sm:text-xs font-serif text-[#1E6B47] font-semibold leading-tight mt-0.5 truncate tracking-wide">
                {siteSettings.hindiName}
              </span>
            )}
          </div>
        </a>

        {/* Zone 2: Navigation Links Pill with Glassmorphism (Desktop) */}
        <div ref={dropdownRef} className="hidden md:flex items-center relative">
          
          <div className="flex items-center gap-1.5 bg-white/70 border border-[#DCEBE0] p-1.5 rounded-full shadow-xs backdrop-blur-md">
            
            {/* Dropdown Menu Trigger Button */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDropdownOpen
                    ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white shadow-sm'
                    : 'bg-[#143B25] text-white hover:bg-[#1E6B47]'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-[#A3D9C0]" />
                <span>Menu</span>
                <ChevronDown 
                  className={`w-3.5 h-3.5 text-emerald-200 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Minimalist Floating Dropdown Menu (Aurora style, always in visible region, z-[100]) */}
              {isDropdownOpen && (
                <div 
                  className={`dropdown-menu absolute top-full mt-2.5 w-76 sm:w-80 max-w-[calc(100vw-24px)] bg-white/95 backdrop-blur-2xl border border-[#DCEFE3] rounded-3xl p-2.5 shadow-[0_20px_50px_rgba(20,50,30,0.18)] z-[100] animate-in fade-in-0 zoom-in-95 duration-150 space-y-1 ${
                    navMenuPlacement === 'left' ? 'left-0 right-auto' : 'right-0 left-auto'
                  }`}
                  style={{ position: 'absolute' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="px-2.5 pt-1 pb-1.5 border-b border-[#EAF4ED] flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#143B25] flex items-center gap-1.5">
                      <Leaf className="w-3 h-3 text-[#1E6B47]" />
                      Navigation
                    </span>
                    <span className="text-[10px] text-[#6B8576] font-medium">
                      Quick Links
                    </span>
                  </div>

                  {/* 1. Products & Prices */}
                  <button
                    type="button"
                    onClick={() => handleNavAction(() => onNavigateSection('deals-catalog'))}
                    className="w-full flex items-start gap-2.5 p-2 rounded-2xl hover:bg-[#F0FAF4] border border-transparent hover:border-[#DCEFE3] text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#14291D] group-hover:text-[#1E6B47] flex items-center justify-between">
                        <span>Products & Prices</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#6B8576] group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[10.5px] text-[#6B8576] leading-tight mt-0.5">
                        Classical formulations, MRP & deals catalog
                      </div>
                    </div>
                  </button>

                  {/* 2. Consultation */}
                  <button
                    type="button"
                    onClick={() => handleNavAction(onOpenConsultationModal)}
                    className="w-full flex items-start gap-2.5 p-2 rounded-2xl hover:bg-[#F0FAF4] border border-transparent hover:border-[#DCEFE3] text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#14291D] group-hover:text-[#1E6B47] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>Consultation</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#1E6B47] text-white leading-tight">
                            Free
                          </span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#6B8576] group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[10.5px] text-[#6B8576] leading-tight mt-0.5">
                        Personalized Ayurvedic dosage guidance
                      </div>
                    </div>
                  </button>

                  {/* 3. Contact */}
                  <button
                    type="button"
                    onClick={() => handleNavAction(() => onNavigateSection('contact-us'))}
                    className="w-full flex items-start gap-2.5 p-2 rounded-2xl hover:bg-[#F0FAF4] border border-transparent hover:border-[#DCEFE3] text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#14291D] group-hover:text-[#1E6B47] flex items-center justify-between">
                        <span>Contact</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#6B8576] group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[10.5px] text-[#6B8576] leading-tight mt-0.5">
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
              className="px-3.5 py-1.5 text-xs font-semibold text-[#143B25] hover:text-[#1E6B47] rounded-full hover:bg-[#E8F6EE] transition-colors cursor-pointer"
            >
              Products & Prices
            </button>

            <button
              type="button"
              onClick={onOpenConsultationModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#143B25] hover:text-[#1E6B47] rounded-full hover:bg-[#E8F6EE] transition-colors cursor-pointer"
            >
              Consultation
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection('contact-us')}
              className="px-3.5 py-1.5 text-xs font-bold text-[#143B25] rounded-full hover:bg-[#E8F6EE] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>

        {/* Zone 3: Actions & Cart Utility with Curbs */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Admin Access Button */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="hidden sm:flex px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#B4741E] to-[#C98424] hover:opacity-90 rounded-full transition-all items-center gap-1.5 shadow-sm border border-[#F4BE77]/60 cursor-pointer"
              title="Open Admin Control Center"
            >
              <Settings className="w-3.5 h-3.5 text-amber-200" />
              <span>Admin</span>
            </button>
          )}

          {/* User Sign In / Account */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1.5 bg-[#EBF6F0] px-3 py-1.5 rounded-full border border-[#CDE6D7]">
              <span className="text-xs font-semibold text-[#143B25] max-w-[120px] truncate">
                {currentUser.name}
              </span>
              <button
                onClick={logout}
                className="p-1 text-[#6B8576] hover:text-red-700 rounded-full transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="hidden sm:flex px-3.5 py-1.5 text-xs font-bold text-[#143B25] bg-white/80 hover:bg-[#E8F6EE] border border-[#CDE5D7] rounded-full transition-all items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-[#1E6B47]" />
              <span>Sign In</span>
            </button>
          )}

          {/* Real-time Firebase Live Sync Pill */}
          {isLiveConnected && (
            <div 
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold text-emerald-800 bg-[#E8F6EE] border border-[#CDE5D7] shadow-2xs select-none"
              title="Firebase Live Realtime Database Connected - Changes sync instantaneously"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Firebase</span>
            </div>
          )}

          {/* Search Button (Next to Cart Bag) */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search Formulations"
              className="p-2 sm:px-3.5 sm:py-1.5 text-xs font-bold text-[#143B25] hover:text-white bg-[#EBF6F0] hover:bg-[#143B25] border border-[#CDE6D7] hover:border-[#143B25] rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs group"
              title="Search all formulations (Opens full search with random discovery)"
            >
              <Search className="w-4 h-4 text-[#1E6B47] group-hover:text-emerald-200 transition-colors" />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}

          {/* Cart Bag */}
          <button
            onClick={onOpenCart}
            aria-label="View Order Bag"
            className="relative px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#143B25] to-[#1E6B47] hover:from-[#19482E] hover:to-[#258257] rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/20 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-[#A3D9C0]" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-[#D49838] text-white font-bold text-[10px] flex items-center justify-center font-mono shadow-xs">
                {formatCompactNumber(cartCount)}
              </span>
            )}
          </button>

          {/* Mobile Floating Dropdown Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/90 hover:bg-[#EBF6F0] text-[#143B25] border border-[#CDE6D7] transition-all flex items-center justify-center cursor-pointer shadow-xs"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-[#143B25]" />
            ) : (
              <Menu className="w-4 h-4 text-[#143B25]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Floating Dropdown Menu: STRICTLY position: absolute, floats on top of page in visible region, z-[100] */}
      {isMobileMenuOpen && (
        <div 
          className="dropdown-menu md:hidden absolute top-full left-3 right-3 mt-2 max-w-[420px] mx-auto bg-white/95 backdrop-blur-2xl p-3 sm:p-4 space-y-2 rounded-3xl border border-[#DCEFE3] shadow-[0_25px_60px_rgba(20,50,30,0.22)] z-[100] animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin"
          style={{ position: 'absolute' }}
        >
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#143B25] flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-[#1E6B47]" />
              Navigation Menu
            </span>
            <span className="text-[10px] text-[#1E6B47] font-bold">
              Quick Links
            </span>
          </div>

          {/* Search Formulations in Mobile Menu */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={() => handleNavAction(onOpenSearch)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F0FAF4] hover:bg-[#E2F5EA] border border-[#DCEFE3] text-left transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#14291D] text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Search className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#14291D] flex items-center gap-1.5">
                    <span>Search Formulations</span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-[#14291D] text-amber-300 leading-tight">
                      Smart Search
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#6B8576]">
                    Explore classical herbs, Sanskrit names & clinical details
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B8576] group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          )}

          {/* 1. Products & Prices */}
          <button
            type="button"
            onClick={() => handleNavAction(() => onNavigateSection('deals-catalog'))}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F0FAF4] border border-[#DCEFE3] text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4 text-[#1E6B47]" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#14291D] group-hover:text-[#1E6B47]">
                  Products & Prices
                </div>
                <div className="text-[10.5px] text-[#6B8576]">
                  Classical formulations, MRP & deals catalog
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B8576] group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* 2. Consultation */}
          <button
            type="button"
            onClick={() => handleNavAction(onOpenConsultationModal)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F0FAF4] border border-[#DCEFE3] text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#14291D] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#14291D] flex items-center gap-1.5 group-hover:text-[#1E6B47]">
                  <span>Consultation</span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-[#1E6B47] text-white leading-tight">
                    Free
                  </span>
                </div>
                <div className="text-[10.5px] text-[#6B8576]">
                  Personalized Ayurvedic dosage guidance
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B8576] group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* 3. Contact */}
          <button
            type="button"
            onClick={() => handleNavAction(() => onNavigateSection('contact-us'))}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F0FAF4] border border-[#DCEFE3] text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4 text-[#1E6B47]" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#14291D] group-hover:text-[#1E6B47]">
                  Contact
                </div>
                <div className="text-[10.5px] text-[#6B8576]">
                  Dispensary address, WhatsApp & helpline
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B8576] group-hover:text-[#14291D] group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* Quick Admin Access & User Account in Mobile Menu */}
          <div className="pt-2 flex items-center gap-2 border-t border-[#EAF4ED]">
            {isAdmin && (
              <button
                onClick={() => {
                  onOpenAdminPanel();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-[#B4741E] to-[#C98424] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-[#F4BE77]/60"
              >
                <Settings className="w-3.5 h-3.5 text-amber-200" />
                <span>Admin Panel</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center justify-between flex-1 bg-[#EBF6F0] px-3 py-1.5 rounded-xl border border-[#CDE6D7] text-xs">
                <span className="font-medium text-[#143B25] truncate">{currentUser.name}</span>
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
                className="flex-1 py-2 px-3 bg-white hover:bg-[#E8F6EE] text-[#143B25] border border-[#CDE5D7] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#1E6B47]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
