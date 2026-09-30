import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  ArrowRight, 
  Tag, 
  Star, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Check, 
  Sparkles,
  Flame
} from 'lucide-react';
import { HerbalProduct, SiteSettings, WeeklyDealItem } from '../types/pharmacy';
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
  products?: HerbalProduct[];
  onAddToCart?: (product: HerbalProduct) => void;
  cartProductIds?: Set<string>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreProducts,
  onSelectProduct,
  isAdmin = false,
  onOpenAdminPanel,
  siteSettings,
  featuredDeal,
  products = [],
  onAddToCart,
  cartProductIds = new Set(),
}) => {
  const { currentUser } = useAuth();
  const [activeDealIndex, setActiveDealIndex] = useState(0);

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

  // Check Deal of the Week configuration from Admin Panel
  const weeklyDealsConfig = siteSettings.weeklyDeals;
  const isDealsSectionEnabled = weeklyDealsConfig ? weeklyDealsConfig.enabled !== false : true;

  // Prepare active deal items
  let dealItems: WeeklyDealItem[] = [];
  if (isDealsSectionEnabled) {
    if (weeklyDealsConfig?.items && weeklyDealsConfig.items.length > 0) {
      dealItems = weeklyDealsConfig.items;
    } else if (featuredDeal) {
      dealItems = [
        {
          id: 'default-hero-deal',
          productId: featuredDeal.id,
          customTitle: featuredDeal.name,
          customSubtitle: featuredDeal.tagline,
          dealPrice: featuredDeal.price,
          dealBadge: `Deal of the Week · Save ${Math.round(((featuredDeal.mrp - featuredDeal.price) / featuredDeal.mrp) * 100)}%`,
        },
      ];
    }
  }

  // Current active deal item
  const currentDealItem: WeeklyDealItem | undefined = dealItems[activeDealIndex] || dealItems[0];
  
  // Find matching catalog product
  const currentProduct: HerbalProduct | undefined = currentDealItem
    ? (products.find((p) => p.id === currentDealItem.productId) || featuredDeal || products[0])
    : (featuredDeal || products[0]);

  const nextDeal = () => {
    if (dealItems.length <= 1) return;
    setActiveDealIndex((prev) => (prev + 1) % dealItems.length);
  };

  const prevDeal = () => {
    if (dealItems.length <= 1) return;
    setActiveDealIndex((prev) => (prev - 1 + dealItems.length) % dealItems.length);
  };

  const handleWhatsAppDirectDeal = (e: React.MouseEvent, prod: HerbalProduct, deal: WeeklyDealItem) => {
    e.stopPropagation();
    const dealPrice = deal.dealPrice ?? prod.price;
    const template = siteSettings.messageTemplates?.productInquiryWhatsApp || DEFAULT_MESSAGE_TEMPLATES.productInquiryWhatsApp;
    const msg = formatCustomMessage(
      template,
      {
        brandName: siteSettings.brandName,
        productName: `${deal.customTitle || prod.name} [Deal of the Week]`,
        productPrice: dealPrice,
        resellerInfo: prod.resellerPrice ? ` (Reseller Rate: ₹${prod.resellerPrice})` : '',
      },
      currentUser,
      includeUserInfo
    );
    window.open(buildWhatsAppUrl(primaryWhatsApp.number, msg), '_blank');
  };

  return (
    <section className="relative bg-[#14291D] text-white pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 border-b border-[#234D34] overflow-hidden">
      {/* Decorative Atmosphere Watermarks */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#2C5E43]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#B4741E]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand & Hero Copy */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C3A27] border border-[#2D5A3D] text-[11px] font-medium tracking-wide text-[#A5D6B6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A5D6B6] animate-pulse" />
              <span>Registered Ayurvedic Formulations & Classical Rasayanas</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {siteSettings.heroTitle}
            </h1>

            <p className="text-xs sm:text-sm text-[#C2D6C9] max-w-2xl leading-relaxed">
              {siteSettings.heroSubtitle}
            </p>

            {/* Admin Launch app banner */}
            {isAdmin && onOpenAdminPanel && (
              <div className="p-3 bg-amber-500/15 border border-amber-400/40 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Admin Access Active: Manage Catalog, Deal of the Week & Site Texts</span>
                </div>
                <button
                  onClick={onOpenAdminPanel}
                  className="px-3.5 py-1.5 font-bold bg-[#B4741E] hover:bg-[#975f15] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Launch Admin App</span>
                </button>
              </div>
            )}

            {/* Call to action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreProducts}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#E7EFEA] text-[#14291D] hover:bg-white transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Browse Products & Deals</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppClick}
                className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
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

          {/* Right Column: Custom Added Deal of the Week (Horizontal Carousel View directly under WhatsApp button) */}
          {isDealsSectionEnabled && currentProduct && currentDealItem && (
            <div className="lg:col-span-5">
              <div 
                onClick={() => onSelectProduct(currentProduct)}
                className="bg-white/95 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-xl text-[#1E2922] cursor-pointer hover:border-[#2C5E43] transition-all group relative overflow-hidden"
              >
                {/* Header ribbon with Deal badge and Horizontal Navigation */}
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D4]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A46714] flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>
                        {currentDealItem.dealBadge || 
                          `Deal of the Week · Save ${Math.round(((currentProduct.mrp - (currentDealItem.dealPrice ?? currentProduct.price)) / (currentProduct.mrp || 1)) * 100)}%`}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Horizontal switcher if multiple products in Deal of the Week */}
                    {dealItems.length > 1 && (
                      <div className="flex items-center gap-1 bg-[#F5EFE6] px-1.5 py-0.5 rounded-lg border border-[#DDD5C5]" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); prevDeal(); }}
                          className="p-1 rounded text-[#4A4133] hover:text-[#14291D] hover:bg-[#EAE2D2] transition-colors cursor-pointer"
                          title="Previous weekly deal"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-[#6D6251] px-1">
                          {activeDealIndex + 1}/{dealItems.length}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); nextDeal(); }}
                          className="p-1 rounded text-[#4A4133] hover:text-[#14291D] hover:bg-[#EAE2D2] transition-colors cursor-pointer"
                          title="Next weekly deal"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#183624]">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{currentProduct.rating}</span>
                    </div>

                    {isAdmin && onOpenAdminPanel && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAdminPanel();
                        }}
                        className="p-1 text-[#645A4B] hover:text-[#14291D] hover:bg-stone-100 rounded cursor-pointer"
                        title="Edit Deal of the Week in Admin Panel"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Product details */}
                <div className="grid grid-cols-12 gap-4 items-center pt-3">
                  <div className="col-span-4 aspect-square rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#DDD5C5] relative">
                    <img
                      src={currentDealItem.customImage || currentProduct.image}
                      alt={currentDealItem.customTitle || currentProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                    />
                    {currentProduct.images && currentProduct.images.length > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                        +{currentProduct.images.length - 1}
                      </span>
                    )}
                  </div>

                  <div className="col-span-8 space-y-1">
                    <h3 className="font-serif text-lg font-bold text-[#14291D] group-hover:text-[#2C5E43] transition-colors line-clamp-1">
                      {currentDealItem.customTitle || currentProduct.name}
                    </h3>
                    <p className="text-xs text-[#635A4B] line-clamp-1 italic font-serif">
                      {currentProduct.sanskritName}
                    </p>
                    <p className="text-xs text-[#4F4638] line-clamp-2 leading-relaxed">
                      {currentDealItem.customSubtitle || currentProduct.tagline}
                    </p>

                    {/* Highlight pills */}
                    {currentDealItem.highlightPoints && currentDealItem.highlightPoints.length > 0 && (
                      <div className="pt-0.5 flex flex-wrap gap-1">
                        {currentDealItem.highlightPoints.slice(0, 2).map((pt, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[9px] bg-[#EFEAE0] text-[#423A2C] px-1.5 py-0.2 rounded border border-[#E0D7C6]"
                          >
                            <Sparkles className="w-2 h-2 text-[#B4741E]" />
                            {pt}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-bold text-[#14291D] tabular-nums font-mono">
                        ₹{currentDealItem.dealPrice ?? currentProduct.price}
                      </span>
                      <span className="text-xs text-[#877E6F] line-through tabular-nums font-mono">
                        ₹{currentProduct.mrp}
                      </span>
                      <span className="text-[11px] font-semibold text-[#2C5E43]">
                        Save ₹{currentProduct.mrp - (currentDealItem.dealPrice ?? currentProduct.price)}
                      </span>
                      {currentProduct.resellerPrice && (
                        <span className="text-[10px] text-[#183624] bg-emerald-50 border border-emerald-200 px-1 rounded font-mono">
                          Reseller: ₹{currentProduct.resellerPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom link row */}
                <div className="mt-3 pt-3 border-t border-[#EAE3D4] flex items-center justify-between text-xs text-[#2C5E43] font-semibold">
                  <span className="hover:underline">View clinical uses & dosage schedule →</span>
                  <span className="text-[11px] text-[#766C5B] font-normal font-mono">
                    {currentProduct.volumeOrWeight}
                  </span>
                </div>

                {/* Quick actions for Deal: Add to Cart and WhatsApp */}
                <div className="mt-2.5 pt-2 border-t border-[#EAE3D4] grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) onAddToCart(currentProduct);
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                      cartProductIds.has(currentProduct.id)
                        ? 'bg-[#183624] text-white hover:bg-[#20442E]'
                        : 'bg-[#2C5E43] text-white hover:bg-[#234D37]'
                    }`}
                  >
                    {cartProductIds.has(currentProduct.id) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>In Inquiry Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleWhatsAppDirectDeal(e, currentProduct, currentDealItem)}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Deal</span>
                  </button>
                </div>

                {/* Horizontal Scroll Progress Indicators if multiple deals */}
                {dealItems.length > 1 && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                    {dealItems.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDealIndex(dotIdx);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          dotIdx === activeDealIndex ? 'w-5 bg-[#183624]' : 'w-1.5 bg-[#D5CCBC] hover:bg-[#9E927F]'
                        }`}
                        aria-label={`Go to deal ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
