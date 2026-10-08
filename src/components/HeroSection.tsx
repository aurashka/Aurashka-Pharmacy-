import React, { useState, useEffect, useRef } from 'react';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { 
  Phone, 
  MessageCircle, 
  ArrowRight, 
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
import { ImageBannerScroller } from './ImageBannerScroller';
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
  onSelectCategory?: (category: string) => void;
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
  onSelectCategory,
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
  const [isPaused, setIsPaused] = useState(false);

  // Swipe & Drag gesture refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isMouseDown = useRef<boolean>(false);
  const hasSwiped = useRef<boolean>(false);

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
    const rawDeals = weeklyDealsConfig?.items;
    const cleanItems: WeeklyDealItem[] = Array.isArray(rawDeals)
      ? rawDeals
      : (rawDeals && typeof rawDeals === 'object'
        ? (Object.values(rawDeals) as WeeklyDealItem[])
        : []);

    if (cleanItems.length > 0) {
      dealItems = cleanItems;
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

  // Ensure active index is within bounds if deals count changes
  useEffect(() => {
    if (activeDealIndex >= dealItems.length && dealItems.length > 0) {
      setActiveDealIndex(0);
    }
  }, [dealItems.length, activeDealIndex]);

  // Next / Previous helpers
  const nextDeal = () => {
    if (dealItems.length <= 1) return;
    setActiveDealIndex((prev) => (prev + 1) % dealItems.length);
  };

  const prevDeal = () => {
    if (dealItems.length <= 1) return;
    setActiveDealIndex((prev) => (prev - 1 + dealItems.length) % dealItems.length);
  };

  // 1. Auto-scroll / Auto-rotate Effect (every 4.5 seconds when not hovered/touched)
  useEffect(() => {
    if (dealItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setActiveDealIndex((prev) => (prev + 1) % dealItems.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [dealItems.length, isPaused]);

  // 2. Touch Swipe Event Handlers (Mobile Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    hasSwiped.current = false;
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    if (touchStartX.current !== null) {
      const diffX = Math.abs(touchStartX.current - touchEndX.current);
      if (diffX > 15) {
        hasSwiped.current = true;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diffX = touchStartX.current - touchEndX.current;
      const minSwipeDistance = 45;
      if (diffX > minSwipeDistance) {
        // Swiped Left -> show next deal
        nextDeal();
      } else if (diffX < -minSwipeDistance) {
        // Swiped Right -> show previous deal
        prevDeal();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // 3. Mouse Drag Event Handlers (Desktop Drag-to-Swipe)
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    hasSwiped.current = false;
    mouseStartX.current = e.clientX;
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;
    const diffX = Math.abs(mouseStartX.current - e.clientX);
    if (diffX > 15) {
      hasSwiped.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    setIsPaused(false);
    if (mouseStartX.current !== null) {
      const diffX = mouseStartX.current - e.clientX;
      const minDragDistance = 45;
      if (diffX > minDragDistance) {
        nextDeal();
      } else if (diffX < -minDragDistance) {
        prevDeal();
      }
    }
    mouseStartX.current = null;
  };

  const handleCardClick = (product: HerbalProduct) => {
    // If the user was swiping/dragging, don't trigger product detail click
    if (hasSwiped.current) {
      hasSwiped.current = false;
      return;
    }
    onSelectProduct(product);
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
    <section id="deal-spotlight" className="relative bg-[#14291D] text-white pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 border-b border-[#234D34] overflow-hidden scroll-mt-20">
      {/* Decorative Atmosphere Watermarks */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#2C5E43]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#B4741E]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Brand & Hero Copy */}
          <div className={`${
            ((siteSettings.bannerSlider?.enabled !== false && (siteSettings.bannerSlider?.items?.length ?? 0) > 0) || (isDealsSectionEnabled && dealItems.length > 0))
              ? 'lg:col-span-7'
              : 'lg:col-span-12 max-w-3xl'
          } space-y-3.5`}>
            {siteSettings.showHeroBadge !== false && (siteSettings.heroBadgeText ?? 'Registered Ayurvedic Formulations & Classical Rasayanas').trim() !== '' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C3A27] border border-[#2D5A3D] text-[11px] font-medium tracking-wide text-[#A5D6B6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A5D6B6] animate-pulse" />
                <span>{siteSettings.heroBadgeText || 'Registered Ayurvedic Formulations & Classical Rasayanas'}</span>
              </div>
            )}

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {siteSettings.heroTitle}
            </h1>

            <p className="text-xs sm:text-sm text-[#C2D6C9] max-w-2xl leading-relaxed">
              {siteSettings.heroSubtitle}
            </p>

            {/* Admin Launch app banner */}
            {isAdmin && onOpenAdminPanel && (
              <div className="p-2.5 bg-amber-500/15 border border-amber-400/40 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200">
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
            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <button
                onClick={onExploreProducts}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#E7EFEA] text-[#14291D] hover:bg-white transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Browse Products & Deals</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppClick}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <a
                href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
                className="px-3 py-2 text-xs sm:text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
                title="Call Helpline"
              >
                <Phone className="w-3.5 h-3.5 text-[#A5D6B6]" />
                <span>Call Helpline</span>
              </a>
            </div>
          </div>

          {/* Right Column: Image Banner Auto-Scroller & Custom Added Deal of the Week */}
          {((siteSettings.bannerSlider?.enabled !== false && (siteSettings.bannerSlider?.items?.length ?? 0) > 0) || (isDealsSectionEnabled && dealItems.length > 0)) && (
            <div className="lg:col-span-5 space-y-2.5">
              {/* Horizontal Image auto Scroller / Swip slider (above Weekly Deal) */}
              {siteSettings.bannerSlider?.enabled !== false && (siteSettings.bannerSlider?.items?.length ?? 0) > 0 && (
                <ImageBannerScroller
                  config={siteSettings.bannerSlider}
                  products={products}
                  onSelectProduct={onSelectProduct}
                  onSelectCategory={onSelectCategory}
                />
              )}

              {/* Deal of the Week Carousel Card */}
              {isDealsSectionEnabled && dealItems.length > 0 && (
                <div 
                  className="bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-xl text-[#1E2922] relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => {
                    setIsPaused(false);
                    isMouseDown.current = false;
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                {/* Auto-Scroll Subtle Progress Bar Indicator */}
                {dealItems.length > 1 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 z-20 overflow-hidden">
                    <div 
                      key={activeDealIndex}
                      className={`h-full bg-emerald-600 transition-all ${isPaused ? 'opacity-50' : 'animate-[progress_4.5s_linear_forwards]'}`}
                      style={{
                        animationDuration: '4.5s',
                        animationTimingFunction: 'linear',
                        animationPlayState: isPaused ? 'paused' : 'running',
                      }}
                    />
                  </div>
                )}

                {/* Sliding Horizontal Track for Smooth Swiping & Auto-Scrolling */}
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${activeDealIndex * 100}%)` }}
                >
                  {dealItems.map((deal) => {
                    const product: HerbalProduct = (
                      products.find((p) => p.id === deal.productId) || 
                      featuredDeal || 
                      products[0]
                    );

                    if (!product) return null;

                    const finalPrice = deal.dealPrice ?? product.price;
                    const mrp = product.mrp > finalPrice ? product.mrp : Math.round(finalPrice * 1.3);
                    const savings = mrp - finalPrice;
                    const discountPercent = Math.round((savings / (mrp || 1)) * 100);
                    const dealBadge = deal.dealBadge || `Deal of the Week · Save ${discountPercent}%`;

                    return (
                      <div 
                        key={deal.id}
                        className="w-full shrink-0 p-5 flex flex-col justify-between"
                        onClick={() => handleCardClick(product)}
                      >
                        {/* Header ribbon with Deal badge and Clean Navigation Arrows (No 1 / 2 / 3 text) */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D4]">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A46714] flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs">
                              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                              <span>{dealBadge}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* Previous / Next clean circular arrow buttons (NO page 1/2/3 numbers) */}
                            {dealItems.length > 1 && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); prevDeal(); }}
                                  className="w-6 h-6 rounded-full bg-[#FAF8F5] hover:bg-[#EAE2D2] text-[#4A4133] border border-[#DDD5C5] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                                  title="Previous deal (or swipe right)"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); nextDeal(); }}
                                  className="w-6 h-6 rounded-full bg-[#FAF8F5] hover:bg-[#EAE2D2] text-[#4A4133] border border-[#DDD5C5] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                                  title="Next deal (or swipe left)"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#183624] ml-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{product.rating}</span>
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
                              src={deal.customImage || product.image}
                              alt={deal.customTitle || product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                              draggable={false}
                            />
                            {product.images && product.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                                +{product.images.length - 1}
                              </span>
                            )}
                          </div>

                          <div className="col-span-8 space-y-1">
                            <h3 className="font-serif text-lg font-bold text-[#14291D] group-hover:text-[#2C5E43] transition-colors line-clamp-1">
                              {deal.customTitle || product.name}
                            </h3>
                            <p className="text-xs text-[#635A4B] line-clamp-1 italic font-serif">
                              {product.sanskritName}
                            </p>
                            <p className="text-xs text-[#4F4638] line-clamp-2 leading-relaxed">
                              {deal.customSubtitle || product.tagline}
                            </p>

                            {/* Highlight pills */}
                            {deal.highlightPoints && deal.highlightPoints.length > 0 && (
                              <div className="pt-0.5 flex flex-wrap gap-1">
                                {deal.highlightPoints.slice(0, 2).map((pt, i) => (
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
                              <span className="text-lg font-bold text-[#14291D] tabular-nums font-mono" title={`₹${finalPrice}`}>
                                {formatPrice(finalPrice)}
                              </span>
                              <span className="text-xs text-[#877E6F] line-through tabular-nums font-mono" title={`₹${mrp}`}>
                                {formatPrice(mrp)}
                              </span>
                              <span className="text-[11px] font-semibold text-[#2C5E43]">
                                Save {formatPrice(savings)}
                              </span>
                              {product.resellerPrice && (
                                <span className="text-[10px] text-[#183624] bg-emerald-50 border border-emerald-200 px-1 rounded font-mono">
                                  Reseller: {formatPrice(product.resellerPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom link row */}
                        <div className="mt-3 pt-3 border-t border-[#EAE3D4] flex items-center justify-between text-xs text-[#2C5E43] font-semibold">
                          <span className="hover:underline flex items-center gap-1">
                            <span>View clinical uses & dosage schedule</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[11px] text-[#766C5B] font-normal font-mono">
                            {product.volumeOrWeight}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sleek Horizontal Dots Navigation (No 1 / 2 / 3 text numbers) */}
                {dealItems.length > 1 && (
                  <div className="pb-3 flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {dealItems.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDealIndex(dotIdx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          dotIdx === activeDealIndex 
                            ? 'w-6 bg-[#183624]' 
                            : 'w-1.5 bg-[#D5CCBC] hover:bg-[#9E927F]'
                        }`}
                        aria-label={`Go to deal slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
