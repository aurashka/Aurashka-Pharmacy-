import React from 'react';
import { HerbalProduct, SiteSettings } from '../types/pharmacy';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { 
  MessageCircle, 
  Eye, 
  ShoppingBag, 
  Check, 
  Edit3, 
  ExternalLink, 
  Camera, 
  Star,
  Flame,
  Trophy,
  Tag,
  Rocket,
  Sparkles,
  Play,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';
import { getProductOverlayConfig } from '../utils/gradientHelper';
import { ProgressiveImage } from './ProgressiveImage';

interface ProductCardProps {
  product: HerbalProduct;
  onOpenDetail: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  isInCart?: boolean;
  isAdmin?: boolean;
  onEditProduct?: (product: HerbalProduct) => void;
  siteSettings?: SiteSettings;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
  onAddToCart,
  isInCart = false,
  isAdmin = false,
  onEditProduct,
  siteSettings,
}) => {
  const { currentUser } = useAuth();
  const savings = product.mrp - product.price;
  const discountPercent = Math.round((savings / product.mrp) * 100);

  // STRICT REQUIREMENT: Only the primary set image shows on product list view
  const primaryImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : '');
  const totalImagesCount = product.images && product.images.length > 0 ? product.images.length : 1;
  const hasVideo = Boolean(
    (product.videoUrl && product.videoUrl.trim().length > 0) ||
    (product.variants && product.variants.some((v) => v.videoUrl && v.videoUrl.trim().length > 0))
  );

  const handleWhatsAppConsult = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        productName: product.name,
        productPrice: product.price,
        resellerInfo: product.resellerPrice ? `, Reseller Wholesale: ₹${product.resellerPrice}` : '',
      },
      currentUser,
      includeUserInfo
    );
    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  const handleAdminEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditProduct) {
      onEditProduct(product);
    }
  };

  const hasSortBadge = product.sortBadge && product.sortBadge !== 'none';
  const ratingStars = Math.round(product.rating || 5);

  // Soft badges with natural tones from reference image
  const renderSortBadge = () => {
    if (!hasSortBadge) return null;
    const badge = product.sortBadge;
    if (badge === 'trending') {
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-600" />
          <span>Trending</span>
        </span>
      );
    }
    if (badge === 'top_seller') {
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1">
          <Trophy className="w-3 h-3 text-amber-600" />
          <span>Best Seller</span>
        </span>
      );
    }
    if (badge === 'best_deal') {
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs bg-[#DCF3E7] text-[#12452B] border border-[#BCE8D1] flex items-center gap-1">
          <Tag className="w-3 h-3 text-[#1E6B47]" />
          <span>Best Deal</span>
        </span>
      );
    }
    if (badge === 'new_launch') {
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs bg-[#D7F4E6] text-[#105634] border border-[#B5E9CF] flex items-center gap-1">
          <Rocket className="w-3 h-3 text-[#1E6B47]" />
          <span>New</span>
        </span>
      );
    }
    if (badge === 'featured') {
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs bg-[#E8F1FC] text-[#1D4ED8] border border-[#BFDBFE] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Featured</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs bg-[#DCF3E7] text-[#12452B] border border-[#BCE8D1]">
        {badge}
      </span>
    );
  };

  const displaySettings = siteSettings?.productCardDisplay || {};
  const isModern = displaySettings.catalogCardStyle === 'modern';
  const showImage = displaySettings.showImage !== false;
  const showName = displaySettings.showName !== false;
  const showSanskritName = displaySettings.showSanskritName !== false;
  const showPrice = displaySettings.showPrice !== false;
  const showResellerPrice = displaySettings.showResellerPrice !== false;
  const showMrpAndOffer = displaySettings.showMrpAndOffer !== false;
  const showTag = displaySettings.showTag !== false;
  const showRating = displaySettings.showRating !== false;
  const showAddToCart = displaySettings.showAddToCart !== false;
  const showQuickView = displaySettings.showQuickView !== false;
  const showSeller = displaySettings.showSeller !== false;
  const showVolume = displaySettings.showVolume !== false;
  const showTagline = displaySettings.showTagline !== false;
  const showWhatsApp = displaySettings.showWhatsApp !== false;

  // Sorted custom fields for display
  const sortedCustomFields = product.customFields && product.customFields.length > 0
    ? [...product.customFields].sort((a, b) => a.position - b.position)
    : [];

  const overlayConfig = getProductOverlayConfig(
    product.primaryImageGradient,
    siteSettings?.productImageGradient,
    product.primaryImageOverlayOpacity,
    siteSettings?.productImageOverlayOpacity,
    product.primaryImageOverlayCoveragePercent,
    siteSettings?.productImageOverlayCoveragePercent,
    product.primaryImageOverlayFadeSoftness,
    siteSettings?.productImageOverlayFadeSoftness
  );

  // 1. MODERN ATTACHED IMAGE STYLE (Left Content: Rating, Name, Price, Buy + Right Full Image)
  if (isModern) {
    return (
      <div 
        onClick={() => onOpenDetail(product)}
        className="group bg-white rounded-3xl border border-[#DCEFE3] hover:border-[#1E6B47] shadow-[0_8px_30px_rgba(20,50,30,0.04)] hover:shadow-[0_16px_40px_rgba(20,60,35,0.1)] transition-all duration-300 flex flex-row justify-between overflow-hidden cursor-pointer relative min-h-[180px] sm:min-h-[200px] z-10"
      >
        {/* Left Column: Details & Actions */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0 pr-2 bg-white">
          <div className="space-y-1">
            {/* Top Row: Star Rating & Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {showRating && (
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs text-[#143B25] ml-1">
                    {product.rating ? product.rating.toFixed(1) : '4.9'}
                  </span>
                  {product.reviewsCount > 0 && (
                    <>
                      <span className="text-stone-300 mx-0.5">·</span>
                      <span className="text-[10px] text-[#6B8576]">
                        ({formatCompactNumber(product.reviewsCount)})
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Status / Deal Badges */}
              {showTag && (
                <>
                  {!product.inStock && (
                    <span className="bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                      Out of Stock
                    </span>
                  )}
                  {product.isDraft && (
                    <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                      Draft
                    </span>
                  )}
                  {product.customTag?.text && (
                    <span
                      className="text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-2xs shrink-0 flex items-center gap-1"
                      style={{
                        backgroundColor: product.customTag.bgColor || '#143B25',
                        color: product.customTag.textColor || '#FFFFFF',
                      }}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{product.customTag.text}</span>
                    </span>
                  )}
                  {renderSortBadge()}
                </>
              )}
            </div>

            {/* Product Name */}
            {showName && (
              <h3 className="font-serif text-sm sm:text-base font-bold text-[#14291D] group-hover:text-emerald-900 transition-colors line-clamp-2 leading-tight">
                {product.name}
              </h3>
            )}

            {/* Sanskrit Name */}
            {showSanskritName && product.sanskritName && (
              <p className="text-[10px] font-serif text-[#2C5E43] italic line-clamp-1">
                ({product.sanskritName})
              </p>
            )}

            {/* Seller / Brand */}
            {showSeller && (
              <div className="flex items-center gap-1 text-[10px] text-[#2C5E43] font-medium truncate">
                <span className="text-[#8C8270] text-[9.5px]">Seller:</span>
                <span className="font-semibold truncate">
                  {product.brand || product.sellerName || siteSettings?.brandName || 'Shree Ayur Pharma'}
                </span>
              </div>
            )}

            {/* Volume / Pack Size */}
            {showVolume && product.volumeOrWeight && (
              <div className="text-[9.5px] text-stone-500 font-medium truncate">
                {product.volumeOrWeight}
              </div>
            )}

            {/* Tagline */}
            {showTagline && (product.tagline || (product.keyIndications && product.keyIndications.length > 0)) && (
              <p className="text-[10.5px] text-[#716757] line-clamp-1 leading-snug">
                {product.tagline || product.keyIndications?.join(', ')}
              </p>
            )}
          </div>

          {/* Bottom Area: Pricing & Actions */}
          <div className="mt-2 space-y-1.5">
            {(showPrice || showMrpAndOffer || (showResellerPrice && product.resellerPrice)) && (
              <div className="pt-1.5 border-t border-[#F2ECE1] space-y-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  {showPrice && (
                    <span className="font-bold text-sm sm:text-base text-[#14291D] tabular-nums">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  {showMrpAndOffer && product.mrp > product.price && (
                    <span className="text-[10.5px] text-[#8C8270] line-through tabular-nums">
                      {formatPrice(product.mrp)}
                    </span>
                  )}
                  {showMrpAndOffer && discountPercent > 0 && (
                    <span className="text-[9.5px] font-bold text-[#1E6B47] bg-[#EAF7EE] px-1.5 py-0.2 rounded-full border border-[#BDE8D1]">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>

                {showResellerPrice && product.resellerPrice && product.resellerPrice > 0 && (
                  <div className="text-[9.5px] bg-[#E8F6EE] text-[#143B25] px-2 py-0.5 rounded-lg font-semibold truncate border border-[#BDE3CC] flex items-center justify-between">
                    <span>Reseller: {formatPrice(product.resellerPrice)}</span>
                    {product.price > product.resellerPrice && (
                      <span className="font-bold text-[#1E6B47]">
                        Margin {formatPrice(product.price - product.resellerPrice)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Buttons Row with Reference Primary & Secondary styles */}
            <div className="flex items-center gap-2 flex-wrap">
              {showAddToCart && (
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.inStock) onAddToCart(product);
                  }}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                    !product.inStock
                      ? 'bg-stone-200 text-stone-500 cursor-not-allowed shadow-none'
                      : isInCart
                      ? 'bg-[#1E6B47] text-white shadow-emerald-950/20'
                      : 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] hover:from-[#19482E] hover:to-[#258257] text-white shadow-emerald-950/20 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {!product.inStock ? (
                    <span>Out of Stock</span>
                  ) : isInCart ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>In Bag</span>
                    </>
                  ) : (
                    <>
                      <span>Add to Cart</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}

              {showWhatsApp && (
                <button
                  type="button"
                  onClick={handleWhatsAppConsult}
                  title={product.customLink ? "Open Custom Link" : "Quick WhatsApp order"}
                  className="p-2 rounded-full border border-emerald-300 text-[#12452B] bg-[#DCF3E7] hover:bg-[#25D366] hover:text-white transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  {product.customLink ? (
                    <ExternalLink className="w-3.5 h-3.5 text-[#143B25]" />
                  ) : (
                    <MessageCircle className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {showQuickView && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetail(product);
                  }}
                  className="p-2 rounded-full border border-[#DCEFE3] text-[#143B25] hover:bg-[#DCF3E7]/40 cursor-pointer shrink-0 transition-colors"
                  title="View Monograph"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}

              {isAdmin && onEditProduct && (
                <button
                  type="button"
                  onClick={handleAdminEdit}
                  title="Admin: Edit product"
                  className="p-2 rounded-full border border-amber-300 text-[#143B25] bg-amber-50 hover:bg-amber-100 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Image Holder (Flush edge-to-edge, transparent background, no rounded corners, supports transparent PNGs) */}
        {showImage && (
          <div className="w-[120px] sm:w-[145px] md:w-[160px] shrink-0 relative bg-transparent rounded-none overflow-hidden flex items-center justify-center border-l border-[#E6F0EB]/60 p-0">
            <ProgressiveImage
              src={primaryImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-none group-hover:scale-106 transition-transform duration-500 bg-transparent"
            />

            {/* Discount Badge on Image */}
            {showMrpAndOffer && discountPercent > 0 && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-[#D49B37] text-white shadow-xs">
                  {discountPercent}% OFF
                </span>
              </div>
            )}

            {product.form && (
              <div className="absolute bottom-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold">
                  {product.form}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. CLASSIC VERTICAL CARD (Clean Card with Soft Shadow & Rounded Corners from Reference Image)
  return (
    <div 
      onClick={() => onOpenDetail(product)}
      className="group bg-white rounded-3xl border border-[#DCEFE3] hover:border-[#1E6B47] shadow-[0_8px_30px_rgba(20,50,30,0.04)] hover:shadow-[0_18px_42px_rgba(20,60,35,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative z-10"
    >
      {/* Product Image Slot with Transparent Background & No Rounded Corners (Flush edge-to-edge, zero margin/padding) */}
      {showImage && (
        <div className="relative aspect-4/3 bg-transparent rounded-none overflow-hidden border-0 flex items-center justify-center p-0">
          <ProgressiveImage
            src={primaryImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-400 bg-transparent"
          />

          {/* Optional Configurable Bottom Gradient / Blur Glass Overlay with Smooth Top Fade */}
          {overlayConfig.hasOverlay && (
            <div 
              className={overlayConfig.overlayClass}
              style={overlayConfig.overlayStyleObj}
            />
          )}
          
          {/* Sort & Deal Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {showTag && (
              <>
                {!product.inStock && (
                  <span className="bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs w-fit">
                    Out of Stock
                  </span>
                )}
                {product.isDraft && (
                  <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs w-fit">
                    Draft
                  </span>
                )}
                {product.customTag?.text && (
                  <span
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs w-fit flex items-center gap-1 tracking-wide"
                    style={{
                      backgroundColor: product.customTag.bgColor || '#143B25',
                      color: product.customTag.textColor || '#FFFFFF',
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{product.customTag.text}</span>
                  </span>
                )}
                {renderSortBadge()}
              </>
            )}

            {showMrpAndOffer && discountPercent > 0 && product.inStock && (
              <span className="bg-[#D49B37] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs w-fit">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Top-Right Badge: Admin Edit Button + Rating Stars */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {isAdmin && onEditProduct && (
              <button
                onClick={handleAdminEdit}
                title="Admin: Edit this product"
                className="px-2.5 py-1 bg-[#143B25] hover:bg-[#1E6B47] text-white rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-md transition-colors"
              >
                <Edit3 className="w-3 h-3 text-amber-300" />
                <span>Edit</span>
              </button>
            )}

            {showRating && (
              <div className="bg-white/90 backdrop-blur-md text-[#143B25] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-[#DCEFE3]">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{product.rating}</span>
                {product.reviewsCount > 0 && (
                  <span className="text-[10px] text-[#6B8576]">({formatCompactNumber(product.reviewsCount)})</span>
                )}
              </div>
            )}
          </div>

          {/* Multiple Photos & Video Indicator Pills on Card bottom */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
            {totalImagesCount > 1 && (
              <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                <Camera className="w-3 h-3 text-[#A3D9C0]" />
                <span>{totalImagesCount} Photos</span>
              </div>
            )}
            {hasVideo && (
              <div className="bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                <Play className="w-2.5 h-2.5 fill-white" />
                <span>Video</span>
              </div>
            )}
          </div>

          {/* Hover preview pill */}
          {showQuickView && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 rounded-none backdrop-blur-2xs">
              <span className="px-3.5 py-1.5 rounded-full bg-white text-[#143B25] text-xs font-bold shadow-lg flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#1E6B47]" />
                <span>Quick View</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Card Content with Clean Typography */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#6B8576] flex-wrap">
            <span className="font-semibold text-[#1E6B47]">{product.categoryLabel}</span>
            {showVolume && product.volumeOrWeight && (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.volumeOrWeight}</span>
              </>
            )}
            {product.form && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#143B25] font-semibold">{product.form}</span>
              </>
            )}
          </div>

          {showName && (
            <h3 className="font-serif text-base font-bold text-[#143B25] group-hover:text-[#1E6B47] transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          )}

          {showSanskritName && product.sanskritName && (
            <p className="text-xs text-[#527863] line-clamp-1 italic font-serif">
              {product.sanskritName}
            </p>
          )}

          {/* Seller / Brand */}
          {showSeller && (
            <div className="flex items-center gap-1 text-[11px] text-[#1E6B47] font-medium truncate pt-0.5">
              <span className="text-[#7A9887] text-[10px]">Seller:</span>
              <span className="font-bold truncate">
                {product.brand || product.sellerName || siteSettings?.brandName || 'VedaVriksha Pharmacy'}
              </span>
            </div>
          )}

          {showTagline && (product.tagline || (product.keyIndications && product.keyIndications.length > 0)) && (
            <p className="text-xs text-[#526B5D] line-clamp-2 pt-0.5 leading-relaxed">
              {product.tagline || product.keyIndications?.join(', ')}
            </p>
          )}

          {/* CUSTOM FIELDS HIGHLIGHT */}
          {sortedCustomFields.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sortedCustomFields.slice(0, 2).map((cf) => (
                <span
                  key={cf.id}
                  className="px-2.5 py-0.5 bg-[#F0FAF4] border border-[#D2EBDC] text-[10px] text-[#143B25] rounded-full font-medium"
                >
                  <strong>{cf.name}:</strong> {cf.value}
                </span>
              ))}
            </div>
          )}

          {/* RESELLER PRICE PILL */}
          {showResellerPrice && product.resellerPrice !== undefined && product.resellerPrice > 0 ? (
            <div className="pt-1">
              <div className="px-3 py-1.5 rounded-xl bg-[#E8F6EE] border border-[#BDE3CC] flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#143B25] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B47] inline-block animate-pulse" />
                  Reseller Rate:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#143B25] text-xs">
                    {formatPrice(product.resellerPrice)}
                  </span>
                  {product.price > product.resellerPrice && (
                    <span className="text-[10px] text-[#143B25] font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      Margin {formatPrice(product.price - product.resellerPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            isAdmin && (
              <div className="pt-1">
                <div 
                  onClick={handleAdminEdit}
                  className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-center justify-between cursor-pointer hover:bg-amber-100"
                >
                  <span>Reseller Rate: Not Set</span>
                  <span className="underline font-bold flex items-center gap-0.5">
                    <Edit3 className="w-2.5 h-2.5" /> + Set Price
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        {/* Pricing & Add to Cart Action Styled from Reference Image */}
        <div className="pt-3 border-t border-[#E8F3EC] flex items-center justify-between gap-3">
          {(showPrice || showMrpAndOffer) && (
            <div>
              <div className="flex items-baseline gap-1.5">
                {showPrice && (
                  <span className="text-lg font-bold text-[#143B25] tabular-nums" title={`₹${product.price}`}>
                    {formatPrice(product.price)}
                  </span>
                )}
                {showMrpAndOffer && product.mrp > product.price && (
                  <span className="text-xs text-[#7A9887] line-through tabular-nums" title={`₹${product.mrp}`}>
                    {formatPrice(product.mrp)}
                  </span>
                )}
              </div>
              {showMrpAndOffer && savings > 0 && (
                <span className="text-[10.5px] text-[#1E6B47] font-bold block">
                  Save {formatPrice(savings)}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            {showWhatsApp && (
              <button
                onClick={handleWhatsAppConsult}
                title={product.customLink ? "Open Custom Link" : "Quick WhatsApp order"}
                aria-label={product.customLink ? "Open Custom Link" : "Quick WhatsApp order"}
                className="p-2 rounded-full bg-[#DCF3E7] text-[#12452B] hover:bg-[#25D366] hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                {product.customLink ? (
                  <ExternalLink className="w-4 h-4 text-[#143B25]" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
              </button>
            )}

            {showAddToCart && (
              <button
                disabled={!product.inStock}
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.inStock) onAddToCart(product);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/15 ${
                  !product.inStock
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed shadow-none'
                    : isInCart
                      ? 'bg-[#1E6B47] text-white cursor-pointer'
                      : 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] hover:from-[#19482E] hover:to-[#258257] text-white cursor-pointer hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {!product.inStock ? (
                  <span>Out of Stock</span>
                ) : isInCart ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <span>Add to Cart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
