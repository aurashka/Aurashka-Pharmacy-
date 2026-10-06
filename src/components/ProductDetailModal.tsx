import React, { useEffect, useState } from 'react';
import { HerbalProduct, SiteSettings, ProductVariant } from '../types/pharmacy';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { 
  X, 
  Leaf, 
  ShieldCheck, 
  Clock, 
  MessageCircle, 
  ShoppingBag, 
  Check, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  Camera,
  Star,
  Flame,
  Trophy,
  Tag,
  Rocket,
  Sliders,
  Play,
  Video,
  Film
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';
import { buildProductMediaList, ProductMediaItem, getYouTubeEmbedUrl, detectVideoType, getYouTubeThumbnail } from '../utils/videoHelper';
import { getProductBottomOverlayClasses } from '../utils/gradientHelper';

interface ProductDetailModalProps {
  product: HerbalProduct | null;
  onClose: () => void;
  onAddToCart: (product: HerbalProduct) => void;
  isInCart?: boolean;
  siteSettings?: SiteSettings;
  allProducts?: HerbalProduct[];
  onSelectProduct?: (product: HerbalProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isInCart = false,
  siteSettings,
  allProducts = [],
  onSelectProduct,
}) => {
  const { currentUser } = useAuth();
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Combined product and selected variety media (images + video)
  const mediaList: ProductMediaItem[] = React.useMemo(() => {
    return buildProductMediaList(product, selectedVariant);
  }, [product, selectedVariant]);

  // For zoom / lightbox or image-only fallbacks
  const imagesList: string[] = React.useMemo(() => {
    return mediaList
      .filter((m): m is ProductMediaItem & { type: 'image' } => m.type === 'image')
      .map((m) => m.url);
  }, [mediaList]);

  // Bottom Other Product Suggestions: Priority Same Category > Others, randomized
  const suggestedProducts = React.useMemo(() => {
    if (!product || !allProducts || allProducts.length === 0) return [];
    const sameCat = allProducts.filter((p) => p.category === product.category && p.id !== product.id);
    const otherCat = allProducts.filter((p) => p.category !== product.category && p.id !== product.id);

    const shuffle = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    return [...shuffle(sameCat), ...shuffle(otherCat)];
  }, [allProducts, product]);

  useEffect(() => {
    setCurrentMediaIndex(0);
    setIsZoomed(false);
    setSelectedVariant(product?.variants && product.variants.length > 0 ? product.variants[0] : null);
  }, [product]);

  // Keyboard navigation for gallery & closing modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && mediaList.length > 1) {
        setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
      } else if (e.key === 'ArrowLeft' && mediaList.length > 1) {
        setCurrentMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
      }
    };

    if (product) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose, isZoomed, mediaList.length]);

  const isBadgesMasterVisible = () => {
    if (!product) return false;
    if (product.assuranceBadges?.showBadges === false) return false;
    if (product.assuranceBadges?.showBadges === true) return true;
    return siteSettings?.productAssuranceBadges?.showBadges !== false;
  };

  const isBadge1Visible = () => {
    if (!isBadgesMasterVisible() || !product) return false;
    if (product.assuranceBadges?.showBadge1 === false) return false;
    if (product.assuranceBadges?.showBadge1 === true) return true;
    return siteSettings?.productAssuranceBadges?.showBadge1 !== false;
  };

  const isBadge2Visible = () => {
    if (!isBadgesMasterVisible() || !product) return false;
    if (product.assuranceBadges?.showBadge2 === false) return false;
    if (product.assuranceBadges?.showBadge2 === true) return true;
    return siteSettings?.productAssuranceBadges?.showBadge2 !== false;
  };

  const hasAnyBadgeVisible = isBadge1Visible() || isBadge2Visible();

  if (!product) return null;

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentMrp = selectedVariant?.mrp ?? product.mrp;
  const currentReseller = selectedVariant?.resellerPrice ?? product.resellerPrice;
  const isAvailableInStock = selectedVariant?.inStock !== undefined ? selectedVariant.inStock : product.inStock;
  const savings = Math.max(0, currentMrp - currentPrice);
  const discountPercent = currentMrp > 0 ? Math.round((savings / currentMrp) * 100) : 0;

  const activeMedia = mediaList[currentMediaIndex] || mediaList[0] || { type: 'image', url: product.image };
  const isPrimary = currentMediaIndex === 0 && activeMedia.type === 'image';

  const handlePrevMedia = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleNextMedia = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handleWhatsAppConsult = () => {
    if (product.customLink) {
      window.open(product.customLink, '_blank');
      return;
    }
    const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);
    const template = siteSettings?.messageTemplates?.productInquiryWhatsApp || DEFAULT_MESSAGE_TEMPLATES.productInquiryWhatsApp;
    const includeUserInfo = siteSettings?.messageTemplates?.includeUserInfo ?? true;
    const formattedMsg = formatCustomMessage(
      template,
      {
        brandName: siteSettings?.brandName,
        productName: `${product.name} (${product.sanskritName})`,
        productPrice: product.price,
        resellerInfo: product.resellerPrice ? `, Reseller Wholesale: ₹${product.resellerPrice}` : '',
      },
      currentUser,
      includeUserInfo
    );
    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#FBF9F5] border border-[#DDD5C5] rounded-2xl shadow-2xl text-[#1E2922]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7DFD1]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2C5E43] uppercase tracking-wider">
              <span>Apothecary Monograph & Gallery</span>
              <span aria-hidden="true" className="text-[#BDB19C]">·</span>
              <span className="font-mono text-[#6E6352]">{product.ayushLicenseNo}</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 text-[#665D4D] hover:text-[#14291D] hover:bg-[#EFEAE0] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Top Section: Multiple Image Gallery + Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Rich Interactive Multiple Images & Video Gallery */}
              <div className="md:col-span-5 space-y-3">
                {/* Main Large Image / Video Frame with Controls */}
                {activeMedia.type === 'video' ? (
                  <div className="relative rounded-xl overflow-hidden bg-black border border-[#DDD5C5] aspect-4/3 group shadow-xs flex items-center justify-center">
                    {activeMedia.videoType === 'youtube' ? (
                      <iframe
                        src={getYouTubeEmbedUrl(activeMedia.url, true) || ''}
                        title={`${product.name} Video`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={activeMedia.url}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    )}

                    {/* Video Type Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>{activeMedia.videoType === 'youtube' ? 'YouTube Video' : 'Video Player'}</span>
                      </span>
                      {activeMedia.label && (
                        <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                          {activeMedia.label}
                        </span>
                      )}
                    </div>

                    {/* Media Counter Badge */}
                    {mediaList.length > 1 && (
                      <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1.5 z-10 pointer-events-none">
                        <Video className="w-3 h-3 text-red-400" />
                        <span>{currentMediaIndex + 1} / {mediaList.length}</span>
                      </div>
                    )}

                    {/* Previous / Next Arrow Controls */}
                    {mediaList.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevMedia}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14291D] shadow-md flex items-center justify-center opacity-85 hover:opacity-100 transition-all z-10 cursor-pointer active:scale-95"
                          aria-label="Previous Media"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMedia}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14291D] shadow-md flex items-center justify-center opacity-85 hover:opacity-100 transition-all z-10 cursor-pointer active:scale-95"
                          aria-label="Next Media"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div 
                    className="relative rounded-xl overflow-hidden bg-[#EFEAE0] border border-[#DDD5C5] aspect-4/3 group shadow-xs cursor-zoom-in"
                    onClick={() => setIsZoomed(true)}
                    title="Click to view full photo in popup"
                  >
                    <img
                      src={activeMedia.url}
                      alt={`${product.name} - view ${currentMediaIndex + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />

                    {/* Primary Badge or Image Position Tag */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {discountPercent > 0 && (
                        <div className="bg-[#B4741E] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                          Save {discountPercent}%
                        </div>
                      )}
                      {isPrimary ? (
                        <div className="bg-[#14291D]/85 backdrop-blur-xs text-[#A5D6B6] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <Star className="w-3 h-3 fill-emerald-300 text-emerald-300" />
                          <span>Primary View</span>
                        </div>
                      ) : (
                        <div className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
                          Photo #{currentMediaIndex + 1}
                        </div>
                      )}
                    </div>

                    {/* Media Counter Badge */}
                    {mediaList.length > 1 && (
                      <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1.5 z-10">
                        <Camera className="w-3 h-3 text-[#A5D6B6]" />
                        <span>{currentMediaIndex + 1} / {mediaList.length}</span>
                      </div>
                    )}

                    {/* Zoom Full Size Button */}
                    <button
                      type="button"
                      onClick={() => setIsZoomed(true)}
                      className="absolute bottom-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/85 text-white rounded-lg opacity-80 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-xs"
                      title="View Full Resolution"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Previous / Next Arrow Controls */}
                    {mediaList.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevMedia}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14291D] shadow-md flex items-center justify-center opacity-85 hover:opacity-100 transition-all z-10 cursor-pointer active:scale-95"
                          aria-label="Previous Media"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMedia}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14291D] shadow-md flex items-center justify-center opacity-85 hover:opacity-100 transition-all z-10 cursor-pointer active:scale-95"
                          aria-label="Next Media"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Multiple Media (Images + Video) Thumbnails Strip */}
                {mediaList.length > 1 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#766C5B] px-0.5">
                      <span className="font-semibold text-[#183624]">
                        Product Gallery ({mediaList.length} Items)
                      </span>
                      <span>Click thumbnail to switch photo / video</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                      {mediaList.map((item, idx) => {
                        const isSelected = currentMediaIndex === idx;
                        if (item.type === 'video') {
                          const poster = item.poster || (item.videoType === 'youtube' ? getYouTubeThumbnail(item.url) : null);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentMediaIndex(idx)}
                              className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-black flex items-center justify-center ${
                                isSelected
                                  ? 'border-red-600 ring-2 ring-red-400/40 shadow-md scale-102'
                                  : 'border-[#DDD5C5] opacity-80 hover:opacity-100 hover:border-red-500'
                              }`}
                              title={`Watch ${item.label || 'Video'}`}
                            >
                              {poster ? (
                                <img src={poster} alt="Video thumbnail" className="w-full h-full object-cover opacity-80" />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-stone-900 to-black flex items-center justify-center">
                                  <Film className="w-5 h-5 text-stone-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                                  <Play className="w-3 h-3 fill-white ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[7.5px] font-bold text-center py-0.2">
                                VIDEO
                              </span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentMediaIndex(idx)}
                            className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#2C5E43] ring-2 ring-[#2C5E43]/30 shadow-md scale-102'
                                : 'border-[#DDD5C5] opacity-75 hover:opacity-100 hover:border-[#8E8371]'
                            }`}
                            title={`View photo ${idx + 1}${idx === 0 ? ' (Primary)' : ''}`}
                          >
                            <img
                              src={item.url}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-0 inset-x-0 bg-[#14291D]/80 text-[#A5D6B6] text-[8px] font-bold text-center py-0.5">
                                Primary
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      {mediaList.map((m, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => setCurrentMediaIndex(dotIdx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentMediaIndex === dotIdx
                              ? m.type === 'video' ? 'w-5 bg-red-600' : 'w-5 bg-[#2C5E43]'
                              : 'w-1.5 bg-[#DDD5C5] hover:bg-[#A89D8B]'
                          }`}
                          aria-label={`Go to media ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality & Ayush Assurance Box */}
                {hasAnyBadgeVisible && (
                  <div className={`p-3 bg-white rounded-xl border border-[#D5CCBC] grid ${isBadge1Visible() && isBadge2Visible() ? 'grid-cols-2 gap-2' : 'grid-cols-1'} text-xs mt-3 shadow-2xs`}>
                    {isBadge1Visible() && (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#2C5E43] shrink-0" />
                        <div>
                          <span className="font-bold text-[#14291D] block text-[10.5px]">
                            {product.assuranceBadges?.badge1Title || siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified'}
                          </span>
                          <span className="text-[9.5px] text-[#716858] block">
                            {product.assuranceBadges?.badge1Subtitle || siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified'}
                          </span>
                        </div>
                      </div>
                    )}
                    {isBadge2Visible() && (
                      <div className="flex items-center gap-1.5">
                        <Leaf className="w-4 h-4 text-[#2C5E43] shrink-0" />
                        <div>
                          <span className="font-bold text-[#14291D] block text-[10.5px]">
                            {product.assuranceBadges?.badge2Title || siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical'}
                          </span>
                          <span className="text-[9.5px] text-[#716858] block">
                            {product.assuranceBadges?.badge2Subtitle || siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Formulation Metadata & Buy/Order Actions */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#6E6352]">
                  <span className="font-semibold text-[#2C5E43]">{product.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.volumeOrWeight}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">In Stock & Verified</span>
                </div>

                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#14291D] leading-tight">
                  {product.name}
                </h2>

                <p className="text-sm font-serif italic text-[#6A604F]">
                  {product.sanskritName}
                </p>

                {/* Rating stars & Sort Badge */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-2.5 py-1 rounded-lg border border-[#E7DFD1]">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(product.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-xs text-[#14291D]">{product.rating}</span>
                    <span className="text-[11px] text-[#7A705E]">({formatCompactNumber(product.reviewsCount)} customer reviews)</span>
                  </div>

                  {product.sortBadge && product.sortBadge !== 'none' && (
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg text-white shadow-2xs flex items-center gap-1.5 ${
                      product.sortBadge === 'trending' ? 'bg-red-600' :
                      product.sortBadge === 'top_seller' ? 'bg-amber-600' :
                      product.sortBadge === 'best_deal' ? 'bg-emerald-700' :
                      product.sortBadge === 'new_launch' ? 'bg-blue-600' :
                      product.sortBadge === 'featured' ? 'bg-indigo-700' :
                      'bg-[#B4741E]'
                    }`}>
                      {product.sortBadge === 'trending' && <Flame className="w-3.5 h-3.5 text-amber-200" />}
                      {product.sortBadge === 'top_seller' && <Trophy className="w-3.5 h-3.5 text-amber-100" />}
                      {product.sortBadge === 'best_deal' && <Tag className="w-3.5 h-3.5 text-emerald-200" />}
                      {product.sortBadge === 'new_launch' && <Rocket className="w-3.5 h-3.5 text-blue-100" />}
                      {product.sortBadge === 'featured' && <Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
                      <span>
                        {product.sortBadge === 'trending' ? 'Trending' :
                         product.sortBadge === 'top_seller' ? 'Top Seller' :
                         product.sortBadge === 'best_deal' ? 'Best Deal' :
                         product.sortBadge === 'new_launch' ? 'New Launch' :
                         product.sortBadge === 'featured' ? 'Featured Choice' :
                         product.sortBadge}
                      </span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#4F4638] leading-relaxed">
                  {product.description}
                </p>

                {/* Packaging / Size Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#14291D]">Size / Pack Variant:</span>
                      <span className="text-[#645A4B] text-[11px] font-medium">
                        {selectedVariant ? `${selectedVariant.size} ${selectedVariant.unit}` : product.volumeOrWeight}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setSelectedVariant(v);
                              setCurrentMediaIndex(0);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs'
                                : 'bg-white text-[#2C2419] border-[#DDD5C5] hover:border-[#14291D]'
                            }`}
                          >
                            <span>{v.size} {v.unit}</span>
                            {v.price !== undefined && (
                              <span className={`text-[10px] ${isSelected ? 'text-emerald-300' : 'text-[#2C5E43]'}`}>
                                {formatPrice(v.price)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Deal Pricing Callout */}
                <div className="pt-3 border-t border-[#EAE3D4] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#14291D] tabular-nums" title={`₹${currentPrice}`}>
                        {formatPrice(currentPrice)}
                      </span>
                      <span className="text-sm text-[#877E6F] line-through tabular-nums" title={`₹${currentMrp}`}>
                        {formatPrice(currentMrp)}
                      </span>
                      {savings > 0 && (
                        <span className="text-xs font-bold text-[#2C5E43] bg-[#E7EFEA] px-2 py-0.5 rounded">
                          Save {formatPrice(savings)}
                        </span>
                      )}
                      {currentReseller !== undefined && currentReseller > 0 && (
                        <span className="text-[11px] font-bold text-[#183624] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                          Reseller: {formatPrice(currentReseller)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] text-[#7E7464]">
                        Pack: <strong>{selectedVariant ? `${selectedVariant.size} ${selectedVariant.unit}` : product.volumeOrWeight}</strong>
                      </span>
                      <span className="text-stone-300">·</span>
                      {isAvailableInStock ? (
                        <span className="text-[11px] text-emerald-700 font-semibold">In Stock</span>
                      ) : (
                        <span className="text-[11px] text-rose-600 font-semibold">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={!isAvailableInStock}
                      onClick={() => onAddToCart({
                        ...product,
                        price: currentPrice,
                        mrp: currentMrp,
                        resellerPrice: currentReseller,
                        volumeOrWeight: selectedVariant ? `${selectedVariant.size} ${selectedVariant.unit}` : product.volumeOrWeight,
                        image: (selectedVariant?.image) || product.image,
                      })}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                        !isAvailableInStock
                          ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                          : isInCart
                            ? 'bg-[#2C5E43] text-white cursor-pointer'
                            : 'bg-[#14291D] text-white hover:bg-[#203E2D] cursor-pointer'
                      }`}
                    >
                      {!isAvailableInStock ? (
                        <span>Out of Stock</span>
                      ) : isInCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Order Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleWhatsAppConsult}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {product.customLink ? (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Order Link</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Reseller / B2B Wholesale Pricing Callout */}
                {product.resellerPrice !== undefined && product.resellerPrice > 0 && (
                  <div className="p-3 bg-[#EBF5EF] rounded-xl border border-[#BBDDC7] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#1F5435] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                        Verified Reseller / B2B Rate
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-bold font-mono text-[#183624]">
                          {formatPrice(product.resellerPrice)}
                        </span>
                        <span className="text-[11px] text-[#4F6858]">per unit</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-md border border-[#A5D6B6] shadow-2xs inline-block">
                        Reseller Margin: {formatPrice(product.price - product.resellerPrice)} ({Math.round(((product.price - product.resellerPrice) / product.price) * 100)}%)
                      </span>
                      <span className="text-[10px] text-[#527760] block mt-0.5">
                        Direct wholesale price for ayurvedic resellers & clinics
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Specifications / Fields (Name, Value & Display Position Order) */}
            {product.customFields && product.customFields.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-[#E4DDD0] space-y-2.5">
                <h3 className="font-serif text-base font-bold text-[#14291D] flex items-center gap-2 border-b border-[#F0EAE0] pb-1.5">
                  <Sliders className="w-4 h-4 text-[#2C5E43]" />
                  <span>Custom Formulation Specifications</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  {[...product.customFields]
                    .sort((a, b) => a.position - b.position)
                    .map((field) => (
                      <div key={field.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5] text-xs">
                        <span className="text-[11px] text-[#7A705E] block font-medium uppercase tracking-wider">{field.name}</span>
                        <span className="font-bold text-[#14291D] mt-0.5 block">{field.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Uses & Dosage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Uses */}
              <div className="bg-white p-4 rounded-xl border border-[#E4DDD0] space-y-2">
                <h3 className="font-serif text-base font-bold text-[#14291D] flex items-center gap-1.5 border-b border-[#F0EAE0] pb-1.5">
                  <Leaf className="w-4 h-4 text-[#2C5E43]" />
                  <span>Therapeutic Uses & Clinical Benefits</span>
                </h3>
                <ul className="space-y-1 text-xs text-[#4F4638] list-disc list-inside">
                  {product.detailedUses.primaryBenefits.map((b, i) => (
                    <li key={i} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
                <div className="text-[11px] text-[#2C5E43] font-medium pt-1">
                  Dosha Action: {product.detailedUses.doshaEffect}
                </div>
              </div>

              {/* Dosage */}
              <div className="bg-white p-4 rounded-xl border border-[#E4DDD0] space-y-2">
                <h3 className="font-serif text-base font-bold text-[#14291D] flex items-center gap-1.5 border-b border-[#F0EAE0] pb-1.5">
                  <Clock className="w-4 h-4 text-[#2C5E43]" />
                  <span>Prescribed Dosage & Anupana</span>
                </h3>
                <div className="space-y-1.5 text-xs text-[#4F4638]">
                  <p><span className="font-semibold text-[#14291D]">Dosage:</span> {product.dosageAndAnupana.standardDosage}</p>
                  <p><span className="font-semibold text-[#14291D]">Timing:</span> {product.dosageAndAnupana.bestTiming}</p>
                  <p><span className="font-semibold text-[#14291D]">Anupana (Carrier):</span> <span className="text-[#2C5E43] font-semibold">{product.dosageAndAnupana.anupanaCarrier}</span></p>
                  <p><span className="font-semibold text-[#14291D]">Duration:</span> {product.dosageAndAnupana.duration}</p>
                </div>
              </div>
            </div>

            {/* Active Herbal Composition */}
            <div className="bg-white p-4 rounded-xl border border-[#E4DDD0] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#14291D] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2C5E43]" />
                <span>Active Herbal Composition ({product.keyIngredients.length} Ingredients)</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EAE3D4] text-[#736856]">
                      <th className="py-1.5 px-2 font-semibold">Herb</th>
                      <th className="py-1.5 px-2 font-semibold">Botanical Species</th>
                      <th className="py-1.5 px-2 font-semibold">Potency</th>
                      <th className="py-1.5 px-2 font-semibold">Therapeutic Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFE6]">
                    {product.keyIngredients.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 font-medium text-[#1E2922]">{item.herb}</td>
                        <td className="py-1.5 px-2 italic text-[#6E6352]">{item.botanicalName}</td>
                        <td className="py-1.5 px-2 font-mono text-[#2C5E43]">{item.potencyOrMg}</td>
                        <td className="py-1.5 px-2 text-[#554C3D]">{item.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Other Product Suggestions (Horizontal Scroll, Same Category > Others, Random) */}
            {suggestedProducts.length > 0 && (
              <div className="pt-4 border-t border-[#DDD5C5] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm sm:text-base font-bold text-[#14291D] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#B4741E]" />
                    <span>Other Product Suggestions</span>
                  </h4>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar touch-pan-x">
                  {suggestedProducts.map((rel) => {
                    const isSameCat = rel.category === product.category;
                    return (
                      <div
                        key={rel.id}
                        onClick={() => {
                          if (onSelectProduct) {
                            onSelectProduct(rel);
                          }
                        }}
                        className="w-[150px] sm:w-[170px] shrink-0 snap-start bg-[#FAF8F5] hover:bg-white rounded-xl border border-[#D5CCBC] hover:border-[#14291D] p-2.5 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-white border border-[#E8E2D5]">
                            <img
                              src={rel.image || (rel.images && rel.images[0]) || ''}
                              alt={rel.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                            />
                            {isSameCat ? (
                              <span className="absolute top-1 left-1 text-[8px] font-bold bg-[#14291D] text-white px-1.5 py-0.5 rounded shadow-xs">
                                Same Category
                              </span>
                            ) : (
                              <span className="absolute top-1 left-1 text-[8px] font-medium bg-black/60 backdrop-blur-xs text-white px-1.5 py-0.5 rounded shadow-xs">
                                {rel.categoryLabel}
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[9px] font-serif italic text-[#2C5E43] block truncate">
                              {rel.sanskritName}
                            </span>
                            <h5 className="font-serif font-bold text-xs text-[#14291D] line-clamp-1 group-hover:text-[#2C5E43] transition-colors">
                              {rel.name}
                            </h5>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-[#EAE3D4] flex items-center justify-between mt-1.5">
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono font-bold text-xs text-[#14291D]" title={`₹${rel.price}`}>
                              {formatPrice(rel.price)}
                            </span>
                            {rel.mrp > rel.price && (
                              <span className="font-mono text-[9px] text-[#887E6D] line-through" title={`₹${rel.mrp}`}>
                                {formatPrice(rel.mrp)}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-[#2C5E43] group-hover:underline">
                            View →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Lightbox (when user clicks zoom) */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 text-white">
            <span className="text-xs text-white/80">
              Media {currentMediaIndex + 1} of {mediaList.length}
            </span>
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div 
            className="relative max-w-4xl max-h-[85vh] flex items-center justify-center w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {activeMedia.type === 'video' ? (
              <div className="w-[90vw] max-w-4xl aspect-16/9 bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-2xl">
                {activeMedia.videoType === 'youtube' ? (
                  <iframe
                    src={getYouTubeEmbedUrl(activeMedia.url, true) || ''}
                    title="Fullscreen Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <img
                src={activeMedia.url}
                alt="Zoomed view"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            )}

            {mediaList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
