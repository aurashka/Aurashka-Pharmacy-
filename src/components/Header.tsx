import React from 'react';
import { ShoppingBag, LogIn, LogOut, Settings } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7DFD1]">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Title & Logo */}
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity group"
        >
          {siteSettings.showBrandLogo !== false && siteSettings.brandLogoImage && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#2C5E43]/40 shadow-xs shrink-0 bg-[#E7EFEA] flex items-center justify-center">
              <img
                src={siteSettings.brandLogoImage}
                alt={siteSettings.brandName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              />
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#14291D] leading-none">
              {siteSettings.brandName}
            </span>
            {siteSettings.hindiName && (
              <span className="text-[10px] sm:text-[11px] font-serif text-[#2C5E43] font-medium leading-tight mt-0.5">
                {siteSettings.hindiName}
              </span>
            )}
          </div>
        </a>

        {/* Minimalist Navigation */}
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
        <div className="flex items-center gap-2">
          {/* FOR USER ROLE 'ADMIN': PROMINENT ADMIN ACCESS BUTTON IN HEADER */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#B4741E] hover:bg-[#975f15] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm border border-[#F4BE77] cursor-pointer"
              title="Open Admin Control Center"
            >
              <Settings className="w-3.5 h-3.5 text-amber-200" />
              <span>Admin Access</span>
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
