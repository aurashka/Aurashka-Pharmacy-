import React from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  Stethoscope, 
  ExternalLink, 
  Globe, 
  Sparkles,
  Tag,
  ArrowUpRight
} from 'lucide-react';
import { 
  HerbalProduct, 
  ProductVariant, 
  SiteSettings, 
  ProductAvailabilityLink, 
  AvailabilityPlatformId 
} from '../types/pharmacy';
import { formatPrice } from '../utils/numberFormatter';

export interface PlatformPreset {
  id: AvailabilityPlatformId;
  name: string;
  defaultBadge: string;
  badgeBg: string;
  badgeText: string;
  cardGradient: string;
  borderColor: string;
  hoverBorder: string;
  textColor: string;
  iconBg: string;
  iconText: string;
  tagline: string;
}

export const PLATFORM_PRESETS: Record<AvailabilityPlatformId, PlatformPreset> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    defaultBadge: 'Prime',
    badgeBg: '#FF9900',
    badgeText: '#000000',
    cardGradient: 'from-[#FFFBF5] via-[#FFF6EB] to-[#FFEDD5]',
    borderColor: '#FED7AA',
    hoverBorder: '#F97316',
    textColor: '#14291D',
    iconBg: '#232F3E',
    iconText: '#FF9900',
    tagline: 'Amazon Store',
  },
  meesho: {
    id: 'meesho',
    name: 'Meesho',
    defaultBadge: 'Best Price',
    badgeBg: '#9A1663',
    badgeText: '#FFFFFF',
    cardGradient: 'from-[#FFF5F8] via-[#FFEBF2] to-[#FED7E2]',
    borderColor: '#FECDD3',
    hoverBorder: '#E11D48',
    textColor: '#14291D',
    iconBg: '#9A1663',
    iconText: '#FFFFFF',
    tagline: 'Lowest Price',
  },
  flipkart: {
    id: 'flipkart',
    name: 'Flipkart',
    defaultBadge: 'Assured',
    badgeBg: '#2874F0',
    badgeText: '#FFFFFF',
    cardGradient: 'from-[#F4F8FF] via-[#EBF3FF] to-[#DBEAFE]',
    borderColor: '#BFDBFE',
    hoverBorder: '#3B82F6',
    textColor: '#14291D',
    iconBg: '#2874F0',
    iconText: '#FFE500',
    tagline: 'Flipkart Assured',
  },
  tata_1mg: {
    id: 'tata_1mg',
    name: 'Tata 1mg',
    defaultBadge: 'Verified',
    badgeBg: '#FF6F61',
    badgeText: '#FFFFFF',
    cardGradient: 'from-[#FFF5F5] via-[#FFEBE9] to-[#FECDD3]',
    borderColor: '#FECACA',
    hoverBorder: '#EF4444',
    textColor: '#14291D',
    iconBg: '#FF6F61',
    iconText: '#FFFFFF',
    tagline: 'Online Pharmacy',
  },
  netmeds: {
    id: 'netmeds',
    name: 'Netmeds',
    defaultBadge: 'Genuine',
    badgeBg: '#24AEB1',
    badgeText: '#FFFFFF',
    cardGradient: 'from-[#F2FCFA] via-[#E6F9F6] to-[#CCFBF1]',
    borderColor: '#99F6E4',
    hoverBorder: '#0D9488',
    textColor: '#14291D',
    iconBg: '#24AEB1',
    iconText: '#FFFFFF',
    tagline: 'Pharmacy Link',
  },
  apollo: {
    id: 'apollo',
    name: 'Apollo Pharmacy',
    defaultBadge: 'Apollo 24|7',
    badgeBg: '#0288D1',
    badgeText: '#FFFFFF',
    cardGradient: 'from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]',
    borderColor: '#BAE6FD',
    hoverBorder: '#0284C7',
    textColor: '#14291D',
    iconBg: '#0288D1',
    iconText: '#FFFFFF',
    tagline: '24/7 Delivery',
  },
  jiomart: {
    id: 'jiomart',
    name: 'JioMart',
    defaultBadge: 'Deal',
    badgeBg: '#0078AD',
    badgeText: '#FFFFFF',
    cardGradient: 'from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]',
    borderColor: '#BAE6FD',
    hoverBorder: '#0284C7',
    textColor: '#14291D',
    iconBg: '#0078AD',
    iconText: '#FFFFFF',
    tagline: 'Direct Store',
  },
  custom: {
    id: 'custom',
    name: 'Partner Store',
    defaultBadge: 'Special Offer',
    badgeBg: '#1E6B47',
    badgeText: '#FFFFFF',
    cardGradient: 'from-[#F4FAF6] via-[#EEF8F2] to-[#DCF3E7]',
    borderColor: '#DCEFE3',
    hoverBorder: '#1E6B47',
    textColor: '#14291D',
    iconBg: '#143B25',
    iconText: '#A3D9C0',
    tagline: 'Direct Purchase',
  },
};

/**
 * Small SVG Platform Brand Logos for Instant Visual Recognition
 */
export const PlatformLogo: React.FC<{ platform: AvailabilityPlatformId; className?: string }> = ({ platform, className = 'w-4 h-4' }) => {
  switch (platform) {
    case 'amazon':
      return (
        <span className={`inline-flex items-center justify-center font-black tracking-tighter text-[11px] leading-none ${className}`}>
          <span className="text-[#FF9900]">a</span>
          <span className="text-stone-300 text-[8px] -ml-0.5 font-sans">✓</span>
        </span>
      );
    case 'meesho':
      return (
        <span className={`inline-flex items-center justify-center font-black text-[11px] text-[#9A1663] leading-none ${className}`}>
          m
        </span>
      );
    case 'flipkart':
      return (
        <span className={`inline-flex items-center justify-center font-black italic text-[11px] text-[#2874F0] leading-none ${className}`}>
          <span className="text-[#2874F0]">F</span>
          <span className="text-amber-400 text-[9px]">★</span>
        </span>
      );
    case 'tata_1mg':
      return (
        <span className={`inline-flex items-center justify-center font-extrabold text-[9px] text-[#FF6F61] leading-none ${className}`}>
          1mg
        </span>
      );
    case 'apollo':
      return (
        <span className={`inline-flex items-center justify-center font-black text-[9px] text-[#0288D1] leading-none ${className}`}>
          +A
        </span>
      );
    case 'netmeds':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[9px] text-[#24AEB1] leading-none ${className}`}>
          Nm
        </span>
      );
    case 'jiomart':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[9px] text-[#0078AD] leading-none ${className}`}>
          Jio
        </span>
      );
    default:
      return <Globe className={className} />;
  }
};

export interface ProductActionHubProps {
  product: HerbalProduct;
  selectedVariant?: ProductVariant | null;
  currentPrice: number;
  currentMrp: number;
  currentReseller?: number;
  isInCart: boolean;
  isAvailableInStock: boolean;
  onAddToCart: (product: HerbalProduct) => void;
  onOpenConsultationModal: (productName?: string) => void;
  onWhatsAppOrder: () => void;
  siteSettings: SiteSettings;
  className?: string;
  isModal?: boolean;
}

export const ProductActionHub: React.FC<ProductActionHubProps> = ({
  product,
  selectedVariant,
  currentPrice,
  currentMrp,
  currentReseller,
  isInCart,
  isAvailableInStock,
  onAddToCart,
  onOpenConsultationModal,
  onWhatsAppOrder,
  siteSettings,
  className = '',
  isModal = false,
}) => {
  // Filter active external availability links
  const activeAvailabilityLinks = (product.availabilityLinks || []).filter(
    (link) => link.isActive !== false && link.url && link.url.trim().length > 0
  );

  const handleAddToCartClick = () => {
    onAddToCart({
      ...product,
      price: currentPrice,
      mrp: currentMrp,
      resellerPrice: currentReseller,
      volumeOrWeight: selectedVariant ? `${selectedVariant.size} ${selectedVariant.unit}` : product.volumeOrWeight,
      image: (selectedVariant?.image) || product.image,
    });
  };

  const handleOpenPlatformLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    let destination = url.trim();
    if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
      destination = `https://${destination}`;
    }
    window.open(destination, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`relative rounded-3xl p-3 sm:p-3.5 bg-gradient-to-br from-white/95 via-[#F6FAF8]/95 to-white/90 backdrop-blur-xl border border-[#D0EADB] shadow-[0_10px_30px_rgba(20,50,30,0.06)] space-y-2.5 overflow-hidden ${className}`}
    >
      {/* Ambient Aurora Glow Effects in Background */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-emerald-300/35 via-teal-200/25 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse duration-3000" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-amber-200/30 via-emerald-100/25 to-transparent rounded-full blur-xl pointer-events-none" />

      {/* Row 1: Two buttons on a single horizontal line (One expanded flex-[1.25], other bold flex-1) */}
      <div className="relative z-10 flex items-center gap-2 w-full">
        
        {/* 1. Add to Inquiry Cart Button (Expanded) */}
        <button
          type="button"
          disabled={!isAvailableInStock}
          onClick={handleAddToCartClick}
          className={`flex-[1.25] sm:flex-[1.3] min-w-0 h-10 sm:h-11 px-3 sm:px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs relative overflow-hidden group/btn ${
            !isAvailableInStock
              ? 'bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed shadow-none'
              : isInCart
                ? 'bg-[#EAF7EE] text-[#143B25] border border-[#A5D6B6] hover:bg-[#DCF3E7] shadow-xs active:scale-[0.99]'
                : 'bg-gradient-to-r from-[#143B25] via-[#1B5234] to-[#1E6B47] text-white hover:shadow-md hover:shadow-emerald-950/20 active:scale-[0.99]'
          }`}
          title={!isAvailableInStock ? 'Product currently out of stock' : isInCart ? 'In Inquiry Cart' : 'Add to Inquiry Cart'}
        >
          {/* Subtle aurora sheen on button */}
          {isAvailableInStock && !isInCart && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
          )}

          {!isAvailableInStock ? (
            <span className="font-semibold text-stone-500 truncate">Out of Stock</span>
          ) : isInCart ? (
            <>
              <div className="w-4.5 h-4.5 rounded-full bg-[#1E6B47] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="font-bold text-[#143B25] truncate">In Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-[#A3D9C0] shrink-0" />
              <span className="truncate">Add to Inquiry Cart</span>
            </>
          )}
        </button>

        {/* 2. Instant WhatsApp Order Button (Compact/Bold) */}
        <button
          type="button"
          onClick={onWhatsAppOrder}
          className="flex-1 min-w-0 h-10 sm:h-11 px-3 sm:px-4 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#128C7E] via-[#20BA68] to-[#25D366] hover:from-[#0E7A6E] hover:to-[#1EAA5A] text-white flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-xs hover:shadow-md hover:shadow-emerald-700/25 active:scale-[0.99] cursor-pointer relative overflow-hidden group/wa"
          title="Instant WhatsApp Order & Direct Inquiry"
        >
          {/* Aurora sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/wa:translate-x-full transition-transform duration-700 pointer-events-none" />
          
          <div className="w-4.5 h-4.5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="truncate"><span className="hidden sm:inline">Instant </span>WhatsApp Order</span>
        </button>
      </div>

      {/* Row 2: Request Free Dosage & Classical Routine Advice (Clean Minimalist Aurora Glass Pill) */}
      <div className="relative z-10">
        <button
          type="button"
          onClick={() => onOpenConsultationModal(product.name)}
          className="w-full h-8.5 px-3 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/70 via-white/95 to-teal-50/60 hover:bg-emerald-50 text-[#14291D] text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-2xs group/consult relative overflow-hidden"
          title="Consult Ayurvedic Vaidya for dosage and classical routine advice"
        >
          {/* Aurora shimmer line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent -translate-x-full group-hover/consult:translate-x-full transition-transform duration-1000 pointer-events-none" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-lg bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center shrink-0 group-hover/consult:scale-105 transition-transform shadow-2xs">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <span className="truncate text-left text-[11px] sm:text-xs text-[#14291D] font-bold">
              Request Free Dosage & Classical Routine Advice
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#1E6B47] to-[#128C7E] text-white leading-none shadow-xs">
              Free
            </span>
            <span className="text-[10px] text-[#2C5E43] font-semibold hidden sm:inline">
              Vaidya Advice →
            </span>
          </div>
        </button>
      </div>

      {/* Row 3: Other Platforms Availability (Amazon / Meesho / Flipkart / 1mg etc. with price & floating offer badges) */}
      {activeAvailabilityLinks.length > 0 && (
        <div className="relative z-10 pt-2 border-t border-[#EAF4ED] space-y-1.5">
          
          {/* Header Title with Aurora Accent */}
          <div className="flex items-center justify-between text-[11px] px-0.5">
            <span className="font-bold text-[#14291D] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#1E6B47]" />
              <span>Also Available On</span>
            </span>
            <span className="text-[10px] text-[#6B8576] font-medium">
              Verified Marketplace Stores
            </span>
          </div>

          {/* Grid of Platform Availability Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeAvailabilityLinks.map((link) => {
              const preset = PLATFORM_PRESETS[link.platform] || PLATFORM_PRESETS.custom;
              const displayName = link.platformName?.trim() || preset.name;
              const hasPrice = link.price !== undefined && link.price > 0;
              const hasBadge = Boolean(link.badgeText && link.badgeText.trim());
              const badgeBg = link.badgeColor?.trim() || preset.badgeBg;
              const badgeTextColor = link.badgeTextColor?.trim() || preset.badgeText;

              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={(e) => handleOpenPlatformLink(e, link.url)}
                  className={`relative group/platform p-2 rounded-xl border transition-all text-left flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] cursor-pointer shadow-2xs hover:shadow-xs bg-gradient-to-br ${preset.cardGradient} ${preset.borderColor} hover:border-[#1E6B47]`}
                  title={`Buy ${product.name} on ${displayName}`}
                >
                  {/* Floating Offer / Deal Badge (Top Right Pill with Aurora Glow) */}
                  {hasBadge && (
                    <span
                      className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-xs leading-none ring-2 ring-white animate-in zoom-in-95 duration-150 z-20"
                      style={{
                        backgroundColor: badgeBg,
                        color: badgeTextColor,
                      }}
                    >
                      {link.badgeText}
                    </span>
                  )}

                  {/* Top Bar: Brand Icon + Platform Name + Arrow */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 border border-black/5 shadow-2xs font-bold"
                        style={{
                          backgroundColor: preset.iconBg,
                          color: preset.iconText,
                        }}
                      >
                        <PlatformLogo platform={link.platform} className="w-2.5 h-2.5" />
                      </div>
                      <span className="font-bold text-[11px] text-[#14291D] truncate leading-tight">
                        {displayName}
                      </span>
                    </div>

                    <ArrowUpRight className="w-3 h-3 text-[#6B8576] group-hover/platform:text-[#14291D] group-hover/platform:translate-x-0.5 group-hover/platform:-translate-y-0.5 transition-transform shrink-0" />
                  </div>

                  {/* Bottom: Price (if provided) & Direct Link CTA */}
                  <div className="flex items-baseline justify-between gap-1 mt-1 pt-1 border-t border-black/5 w-full">
                    {hasPrice ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-[11px] font-black font-mono text-[#14291D]">
                          {formatPrice(link.price!)}
                        </span>
                        {link.originalPrice && link.originalPrice > (link.price || 0) && (
                          <span className="text-[9px] text-[#7E7464] line-through font-mono">
                            {formatPrice(link.originalPrice)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9.5px] text-[#6B8576] font-medium">
                        View Store
                      </span>
                    )}

                    <span className="text-[9px] font-bold text-[#1E6B47] flex items-center gap-0.5 group-hover/platform:underline">
                      Buy Now
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
