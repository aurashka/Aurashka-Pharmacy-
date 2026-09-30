import React, { useEffect, useState } from 'react';
import { HerbalProduct, SiteSettings } from '../types/pharmacy';
import { 
  X, 
  Leaf, 
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
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';

interface ProductDetailModalProps {
  product: HerbalProduct | null;
  onClose: () => void;
  onAddToCart: (product: HerbalProduct) => void;
  isInCart?: boolean;
  siteSettings?: SiteSettings;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isInCart = false,
  siteSettings,
}) => {
  const { currentUser } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Clean images list from product
  const imagesList: string[] = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      // filter empty strings
      const valid = product.images.filter((img) => img && img.trim().length > 0);
      if (valid.length > 0) return valid;
    }
    return product.image ? [product.image] : [];
  }, [product]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setIsZoomed(false);
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
      } else if (e.key === 'ArrowRight' && imagesList.length > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
      } else if (e.key === 'ArrowLeft' && imagesList.length > 1) {
        setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
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
  }, [product, onClose, isZoomed, imagesList.length]);

  if (!product) return null;

  const savings = product.mrp - product.price;
  const discountPercent = Math.round((savings / product.mrp) * 100);

  const activeImage = imagesList[currentImageIndex] || product.image;
  const isPrimary = currentImageIndex === 0;

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
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
              
              {/* Left Column: Rich Interactive Multiple Images Gallery */}
              <div className="md:col-span-5 space-y-3">
                {/* Main Large Image Frame with Controls */}
                <div className="relative rounded-xl overflow-hidden bg-[#EFEAE0] border border-[#DDD5C5] aspect-4/3 group shadow-xs">
                  <img
                    src={activeImage}
                    alt={`${product.name} - view ${currentImageIndex + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-opacity duration-300"
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
                        Angle #{currentImageIndex + 1}
                      </div>
                    )}
                  </div>

                  {/* Multiple Images Counter Badge */}
                  {imagesList.length > 1 && (
                    <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1.5 z-10">
                      <Camera className="w-3 h-3 text-[#A5D6B6]" />
                      <span>{currentImageIndex + 1} / {imagesList.length}</span>
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

                  {/* Previous / Next Arrow Controls (When multiple images exist) */}
                  {imagesList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14291D] shadow-md flex items-center justify-center opacity-85 hover:opacity-100 transition-all z-10 cursor-pointer active:scale-95"
                        aria-label="Previous Image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14291D] shadow-md flex items-center justify-center opacity-85 hover:opacity-100 transition-all z-10 cursor-pointer active:scale-95"
                        aria-label="Next Image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Multiple Images Thumbnails Strip */}
                {imagesList.length > 1 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#766C5B] px-0.5">
                      <span className="font-semibold text-[#183624]">
                        Product Gallery ({imagesList.length} Images)
                      </span>
                      <span>Click thumbnail to switch view</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                      {imagesList.map((img, idx) => {
                        const isSelected = currentImageIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#2C5E43] ring-2 ring-[#2C5E43]/30 shadow-md scale-102'
                                : 'border-[#DDD5C5] opacity-75 hover:opacity-100 hover:border-[#8E8371]'
                            }`}
                            title={`View image ${idx + 1}${idx === 0 ? ' (Primary)' : ''}`}
                          >
                            <img
                              src={img}
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
                      {imagesList.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => setCurrentImageIndex(dotIdx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentImageIndex === dotIdx
                              ? 'w-5 bg-[#2C5E43]'
                              : 'w-1.5 bg-[#DDD5C5] hover:bg-[#A89D8B]'
                          }`}
                          aria-label={`Go to image ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
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
                    <span className="text-[11px] text-[#7A705E]">({product.reviewsCount} customer reviews)</span>
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

                {/* Deal Pricing Callout */}
                <div className="pt-3 border-t border-[#EAE3D4] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#14291D] tabular-nums">
                        ₹{product.price}
                      </span>
                      <span className="text-sm text-[#877E6F] line-through tabular-nums">
                        ₹{product.mrp}
                      </span>
                      {savings > 0 && (
                        <span className="text-xs font-bold text-[#2C5E43] bg-[#E7EFEA] px-2 py-0.5 rounded">
                          Save ₹{savings}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#7E7464]">Inclusive of all taxes & free shipping available</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                        isInCart
                          ? 'bg-[#2C5E43] text-white'
                          : 'bg-[#14291D] text-white hover:bg-[#203E2D]'
                      }`}
                    >
                      {isInCart ? (
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
                          ₹{product.resellerPrice}
                        </span>
                        <span className="text-[11px] text-[#4F6858]">per unit</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-md border border-[#A5D6B6] shadow-2xs inline-block">
                        Reseller Margin: ₹{product.price - product.resellerPrice} ({Math.round(((product.price - product.resellerPrice) / product.price) * 100)}%)
                      </span>
                      <span className="text-[10px] text-[#527760] block mt-0.5">
                        Direct wholesale price for ayurvedic resellers & clinics
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Indications */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs font-semibold text-[#14291D] mr-1">Target Health Concerns:</span>
              {product.keyIndications.map((ind, i) => (
                <span key={i} className="text-xs px-2.5 py-0.5 bg-white border border-[#DDD5C5] rounded text-[#433B2F]">
                  {ind}
                </span>
              ))}
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

            {/* Key Ingredients Table */}
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
              Photo {currentImageIndex + 1} of {imagesList.length}
            </span>
            <button
              onClick={() => setIsZoomed(false)}
              className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div 
            className="relative max-w-4xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt="Zoomed view"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />

            {imagesList.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center"
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
