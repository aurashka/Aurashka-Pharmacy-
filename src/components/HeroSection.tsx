import React from 'react';
import { Phone, MessageCircle, ArrowRight, Tag, Star, Settings } from 'lucide-react';
import { HerbalProduct, SiteSettings } from '../types/pharmacy';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryPhone, 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES,
  buildWhatsAppUrl 
} from '../utils/messageFormatter';

interface HeroSectionProps {
  onOpenConsultationModal: () => void;
  onExploreProducts: () => void;
  onSelectProduct: (product: HerbalProduct) => void;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
  siteSettings: SiteSettings;
  featuredDeal?: HerbalProduct | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreProducts,
  onSelectProduct,
  isAdmin = false,
  onOpenAdminPanel,
  siteSettings,
  featuredDeal,
}) => {
  const { currentUser } = useAuth();
  const primaryPhone = getPrimaryPhone(siteSettings);
  const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);

  const heroTemplate = siteSettings.messageTemplates?.heroWhatsApp || DEFAULT_MESSAGE_TEMPLATES.heroWhatsApp;
  const includeUserInfo = siteSettings.messageTemplates?.includeUserInfo ?? true;

  const formattedMsg = formatCustomMessage(
    heroTemplate,
    { brandName: siteSettings.brandName },
    currentUser,
    includeUserInfo
  );

  const handleWhatsAppClick = () => {
    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  return (
    <section className="relative bg-[#14291D] text-white overflow-hidden border-b border-[#21432E]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/src/assets/images/herbal_pharmacy_hero_1790596659189.jpg"
          alt={siteSettings.brandName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-20"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#112418] via-[#112418]/95 to-[#112418]/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Headline & Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#A5D6B6]">
              <span>{siteSettings.brandName}</span>
              <span aria-hidden="true">·</span>
              <span className="text-white/60">{siteSettings.hindiName}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {siteSettings.heroTitle}
            </h1>

            <p className="text-sm text-[#D1E0D7] leading-relaxed max-w-lg">
              {siteSettings.heroSubtitle}
            </p>

            {/* FOR USER ROLE 'ADMIN': PROMINENT ADMIN ACCESS CALLOUT ON MAIN PAGE FRONT */}
            {isAdmin && onOpenAdminPanel && (
              <div className="p-3 bg-[#B4741E]/30 border border-[#B4741E] rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block shrink-0" />
                  <span className="font-semibold text-amber-200">Admin Mode Active: Edit all titles, multiple images, and contacts</span>
                </div>
                <button
                  onClick={onOpenAdminPanel}
                  className="px-3.5 py-1.5 font-bold bg-[#B4741E] hover:bg-[#975f15] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Launch Admin App</span>
                </button>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreProducts}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#E7EFEA] text-[#14291D] hover:bg-white transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Browse Products & Deals</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppClick}
                className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {primaryWhatsApp.displayNumber}</span>
              </button>

              <a
                href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
                className="px-3.5 py-2.5 text-xs sm:text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#A5D6B6]" />
                <span className="font-mono tabular-nums">{primaryPhone}</span>
              </a>
            </div>
          </div>

          {/* Deal Spotlight Card */}
          {featuredDeal && (
            <div className="lg:col-span-5">
              <div 
                onClick={() => onSelectProduct(featuredDeal)}
                className="bg-white/95 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-xl text-[#1E2922] cursor-pointer hover:border-[#2C5E43] transition-all group"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D4]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A46714] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Deal of the Week · Save {Math.round(((featuredDeal.mrp - featuredDeal.price) / featuredDeal.mrp) * 100)}%
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#183624]">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{featuredDeal.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center pt-3">
                  <div className="col-span-4 aspect-square rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#DDD5C5] relative">
                    <img
                      src={featuredDeal.image}
                      alt={featuredDeal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                    />
                    {featuredDeal.images && featuredDeal.images.length > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                        +{featuredDeal.images.length - 1}
                      </span>
                    )}
                  </div>

                  <div className="col-span-8 space-y-1">
                    <h3 className="font-serif text-lg font-bold text-[#14291D] group-hover:text-[#2C5E43] transition-colors line-clamp-1">
                      {featuredDeal.name}
                    </h3>
                    <p className="text-xs text-[#635A4B] line-clamp-1 italic">
                      {featuredDeal.sanskritName}
                    </p>
                    <p className="text-xs text-[#4F4638] line-clamp-2">
                      {featuredDeal.tagline}
                    </p>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-bold text-[#14291D] tabular-nums">
                        ₹{featuredDeal.price}
                      </span>
                      <span className="text-xs text-[#877E6F] line-through tabular-nums">
                        ₹{featuredDeal.mrp}
                      </span>
                      <span className="text-[11px] font-semibold text-[#2C5E43]">
                        Save ₹{featuredDeal.mrp - featuredDeal.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#EAE3D4] flex items-center justify-between text-xs text-[#2C5E43] font-semibold">
                  <span>View clinical uses & dosage schedule →</span>
                  <span className="text-[11px] text-[#766C5B] font-normal font-mono">{featuredDeal.volumeOrWeight}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
