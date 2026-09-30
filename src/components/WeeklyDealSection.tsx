import React, { useRef } from 'react';
import { 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  Eye, 
  Settings, 
  ShieldCheck,
  Percent,
  Flame
} from 'lucide-react';
import { HerbalProduct, SiteSettings, WeeklyDealItem } from '../types/pharmacy';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';

interface WeeklyDealSectionProps {
  siteSettings?: SiteSettings;
  products: HerbalProduct[];
  onSelectProduct: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  cartProductIds: Set<string>;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

export const WeeklyDealSection: React.FC<WeeklyDealSectionProps> = ({
  siteSettings,
  products,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  isAdmin,
  onOpenAdminPanel,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  const weeklyDeals = siteSettings?.weeklyDeals;

  // If section is explicitly disabled/deleted or has no items, do not render anything
  if (!weeklyDeals || weeklyDeals.enabled === false || !weeklyDeals.items || weeklyDeals.items.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 360;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleWhatsAppDeal = (product: HerbalProduct, deal: WeeklyDealItem) => {
    const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);
    const template = siteSettings?.messageTemplates?.productInquiryWhatsApp || DEFAULT_MESSAGE_TEMPLATES.productInquiryWhatsApp;
    const includeUserInfo = siteSettings?.messageTemplates?.includeUserInfo ?? true;
    const dealPrice = deal.dealPrice ?? product.price;

    const resellerInfo = product.resellerPrice
      ? ` (Reseller Tier: ₹${product.resellerPrice}/unit)`
      : '';

    const formattedMsg = formatCustomMessage(
      template,
      {
        brandName: siteSettings?.brandName,
        productName: `${deal.customTitle || product.name} [Deal of the Week]`,
        productPrice: dealPrice,
        resellerInfo,
      },
      currentUser,
      includeUserInfo
    );

    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  return (
    <section id="deal-of-the-week" className="py-8 sm:py-12 bg-linear-to-b from-[#F7F4EC] to-[#F3EDE2] border-y border-[#E5DECF] relative overflow-hidden">
      {/* Background Decorative subtle watermarks */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#2C5E43]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#B4741E]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Header Ribbon & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#183624] text-white text-[11px] font-semibold uppercase tracking-wider shadow-xs">
                <Flame className="w-3.5 h-3.5 text-[#FBBF24]" />
                {weeklyDeals.badgeText || 'Deal of the Week'}
              </span>

              {weeklyDeals.bannerTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-medium">
                  <Percent className="w-3 h-3 text-amber-700" />
                  {weeklyDeals.bannerTag}
                </span>
              )}

              {weeklyDeals.dealEndNotice && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#695F4F]">
                  <Clock className="w-3 h-3 text-[#B4741E]" />
                  {weeklyDeals.dealEndNotice}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14291D] tracking-tight">
              {weeklyDeals.title || 'Deal of the Week'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5344]">
              {weeklyDeals.subtitle || 'Handpicked classical formulations and pure Rasayanas at exclusive apothecary rates.'}
            </p>
          </div>

          {/* Navigation Controls & Admin Shortcut */}
          <div className="flex items-center gap-2 self-start md:self-end shrink-0">
            {isAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="px-3 py-1.5 text-xs font-semibold text-[#183624] bg-white hover:bg-[#F2ECE1] border border-[#C8BEAB] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Manage weekly deal products & settings"
              >
                <Settings className="w-3.5 h-3.5 text-[#2C5E43]" />
                <span>Edit Deals (Admin)</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-white/80 p-1 rounded-lg border border-[#DCD5C5] shadow-2xs">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="p-1.5 rounded-md text-[#4A4133] hover:text-[#14291D] hover:bg-[#EFEAE0] transition-colors cursor-pointer"
                aria-label="Scroll deals left"
                title="Previous deals"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-medium text-[#7D7363] px-1">
                {weeklyDeals.items.length} {weeklyDeals.items.length === 1 ? 'deal' : 'deals'}
              </span>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="p-1.5 rounded-md text-[#4A4133] hover:text-[#14291D] hover:bg-[#EFEAE0] transition-colors cursor-pointer"
                aria-label="Scroll deals right"
                title="Next deals"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile notice */}
        {weeklyDeals.dealEndNotice && (
          <div className="sm:hidden mb-3 text-[11px] text-[#695F4F] flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#B4741E] shrink-0" />
            <span>{weeklyDeals.dealEndNotice}</span>
          </div>
        )}

        {/* Horizontal Scrollable Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth focus:outline-hidden"
          style={{ scrollbarWidth: 'thin' }}
        >
          {weeklyDeals.items.map((deal) => {
            const baseProduct = products.find((p) => p.id === deal.productId) || products[0];
            if (!baseProduct) return null;

            const product: HerbalProduct = {
              ...baseProduct,
              name: deal.customTitle || baseProduct.name,
              tagline: deal.customSubtitle || baseProduct.tagline,
              price: deal.dealPrice ?? baseProduct.price,
              image: deal.customImage || baseProduct.image,
            };

            const finalPrice = deal.dealPrice ?? product.price;
            const mrp = product.mrp > finalPrice ? product.mrp : Math.round(finalPrice * 1.3);
            const savings = mrp - finalPrice;
            const discountPercent = Math.round((savings / mrp) * 100);
            const displayTitle = deal.customTitle || product.name;
            const displaySubtitle = deal.customSubtitle || product.tagline;
            const isInCart = cartProductIds.has(product.id);
            const dealBadge = deal.dealBadge || `Deal of the Week · ${discountPercent}% Off`;
            const imageSrc = deal.customImage || product.image;

            return (
              <div
                key={deal.id}
                className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start bg-[#FAF8F5] rounded-xl border border-[#DCD5C5] hover:border-[#183624]/40 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Top Image & Deal Banner */}
                <div className="relative aspect-4/3 overflow-hidden bg-[#ECE6D9]">
                  <img
                    src={imageSrc}
                    alt={displayTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Deal Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-[#25D366] text-black font-bold text-[11px] tracking-wide flex items-center gap-1 shadow-md">
                      <Tag className="w-3 h-3 text-black" />
                      {dealBadge}
                    </span>
                  </div>

                  {/* Ayush & GMP Badges */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded-sm bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-[#A5D6B6]" />
                      GMP
                    </span>
                  </div>

                  {/* Savings Ribbon */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-sm bg-black/70 backdrop-blur-xs">
                      Save ₹{savings} ({discountPercent}% OFF)
                    </span>
                    <span className="text-[10px] text-white/90 font-mono">
                      {product.volumeOrWeight}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#7A705E]">
                      <span className="font-serif italic font-medium text-[#2C5E43] truncate max-w-[180px]">
                        {product.sanskritName}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-[#EAE4D6] px-1.5 py-0.5 rounded-xs">
                        {product.form}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="font-serif font-bold text-base text-[#14291D] hover:text-[#2C5E43] transition-colors cursor-pointer line-clamp-1"
                      title={displayTitle}
                    >
                      {displayTitle}
                    </h3>

                    <p className="text-xs text-[#5C5344] line-clamp-2 leading-relaxed">
                      {displaySubtitle}
                    </p>

                    {/* Highlight Points */}
                    {deal.highlightPoints && deal.highlightPoints.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {deal.highlightPoints.map((pt, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] bg-[#EFEAE0] text-[#423A2C] px-2 py-0.5 rounded-sm border border-[#E0D7C6]"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#B4741E]" />
                            {pt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="pt-2 border-t border-[#E8E2D4] space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="space-x-2">
                        <span className="font-bold text-lg text-[#14291D]">
                          ₹{finalPrice}
                        </span>
                        <span className="text-xs text-[#8A8070] line-through font-mono">
                          ₹{mrp}
                        </span>
                      </div>
                      {product.resellerPrice && (
                        <span className="text-[10px] font-mono font-medium text-[#183624] bg-[#E1EDE5] px-1.5 py-0.5 rounded-xs">
                          Reseller: ₹{product.resellerPrice}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => onAddToCart(product)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                          isInCart
                            ? 'bg-[#183624] text-white hover:bg-[#20442E]'
                            : 'bg-[#2C5E43] text-white hover:bg-[#234D37]'
                        }`}
                        title={isInCart ? 'Inquiry bag already includes this item' : 'Add deal product to inquiry'}
                      >
                        {isInCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>In Cart</span>
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
                        onClick={() => handleWhatsAppDeal(product, deal)}
                        className="py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                        title="Inquire directly on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="w-full py-1 text-center text-[11px] font-medium text-[#675C4B] hover:text-[#14291D] hover:underline flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-[#8D8270]" />
                      <span>View Classical Uses & Dosages</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
