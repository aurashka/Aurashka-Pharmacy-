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
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';
import { getProductOverlayConfig } from '../utils/gradientHelper';

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

  // Branded badge configuration without emojis
  const renderSortBadge = () => {
    if (!hasSortBadge) return null;
    const badge = product.sortBadge;
    if (badge === 'trending') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs bg-red-600 text-white flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-200" />
          <span>Trending</span>
        </span>
      );
    }
    if (badge === 'top_seller') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs bg-amber-600 text-white flex items-center gap-1">
          <Trophy className="w-3 h-3 text-amber-100" />
          <span>Top Seller</span>
        </span>
      );
    }
    if (badge === 'best_deal') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs bg-emerald-700 text-white flex items-center gap-1">
          <Tag className="w-3 h-3 text-emerald-200" />
          <span>Best Deal</span>
        </span>
      );
    }
    if (badge === 'new_launch') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs bg-blue-600 text-white flex items-center gap-1">
          <Rocket className="w-3 h-3 text-blue-100" />
          <span>New Launch</span>
        </span>
      );
    }
    if (badge === 'featured') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs bg-indigo-700 text-white flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-200" />
          <span>Featured</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs bg-[#B4741E] text-white">
        {badge}
      </span>
    );
  };

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

  return (
    <div 
      onClick={() => onOpenDetail(product)}
      className="group bg-white rounded-xl border border-[#E4DDD0] hover:border-[#2C5E43] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image Slot - ONLY PRIMARY SET IMAGE SHOWS HERE */}
      <div className="relative aspect-4/3 bg-[#F2EDE1] overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />

        {/* Optional Configurable Bottom Gradient / Blur Glass Overlay with Smooth Top Fade */}
        {overlayConfig.hasOverlay && (
          <div 
            className={overlayConfig.overlayClass}
            style={overlayConfig.overlayStyleObj}
          />
        )}
        
        {/* Sort & Deal Badges (Branded Icons without emojis) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {!product.inStock && (
            <span className="bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs w-fit">
              Out of Stock
            </span>
          )}
          {product.customTag?.text && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs w-fit flex items-center gap-1 tracking-wide"
              style={{
                backgroundColor: product.customTag.bgColor || '#14291D',
                color: product.customTag.textColor || '#FFFFFF',
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{product.customTag.text}</span>
            </span>
          )}
          {renderSortBadge()}

          {discountPercent > 0 && product.inStock && (
            <span className="bg-[#B4741E] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs w-fit">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Top-Right Badge: Admin Edit Button + Rating Stars */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {isAdmin && onEditProduct && (
            <button
              onClick={handleAdminEdit}
              title="Admin: Edit this product"
              className="px-2 py-1 bg-[#14291D] hover:bg-[#B4741E] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-md transition-colors"
            >
              <Edit3 className="w-3 h-3 text-amber-300" />
              <span>Edit</span>
            </button>
          )}

          <div className="bg-white/95 backdrop-blur-xs text-[#2C5E43] text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1 border border-[#DDD5C5]">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span className="font-bold">{product.rating}</span>
            {product.reviewsCount > 0 && (
              <span className="text-[10px] text-[#7A705E]">({formatCompactNumber(product.reviewsCount)})</span>
            )}
          </div>
        </div>

        {/* Multiple Photos & Video Indicator Pills on Card bottom */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {totalImagesCount > 1 && (
            <div className="bg-black/65 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Camera className="w-3 h-3 text-[#A5D6B6]" />
              <span>{totalImagesCount} Photos</span>
            </div>
          )}
          {hasVideo && (
            <div className="bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>Video</span>
            </div>
          )}
        </div>

        {/* Hover preview pill */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <span className="px-3 py-1.5 rounded-lg bg-white text-[#14291D] text-xs font-semibold shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>View All Photos & Uses</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#6E6352]">
            <span>{product.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{product.volumeOrWeight}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#2C5E43] font-medium">{product.form}</span>
          </div>

          <h3 className="font-serif text-base font-bold text-[#14291D] group-hover:text-[#2C5E43] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-[#635A4B] line-clamp-1 italic">
            {product.sanskritName}
          </p>

          {/* RATING STARS & REVIEW COUNT (WITH CLEAN BRANDED SVG ICONS) */}
          <div className="flex items-center gap-1.5 text-xs pt-0.5">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < ratingStars
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-[#14291D] text-[11px]">{product.rating}</span>
            <span className="text-[11px] text-[#7A705E]">
              ({product.reviewsCount > 0 ? `${formatCompactNumber(product.reviewsCount)} reviews` : 'Verified'})
            </span>
          </div>

          <p className="text-xs text-[#524A3D] line-clamp-2 pt-0.5 leading-relaxed">
            {product.tagline}
          </p>

          {/* CUSTOM FIELDS HIGHLIGHT (NAME & VALUE IN DISPLAY POSITION ORDER) */}
          {sortedCustomFields.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sortedCustomFields.slice(0, 2).map((cf) => (
                <span
                  key={cf.id}
                  className="px-2 py-0.5 bg-[#FAF6F0] border border-[#E7DFD1] text-[10px] text-[#554C3E] rounded font-medium"
                >
                  <strong className="text-[#14291D]">{cf.name}:</strong> {cf.value}
                </span>
              ))}
            </div>
          )}

          {/* RESELLER PRICE PILL (IN PRODUCT LIST VIEW) */}
          {product.resellerPrice !== undefined && product.resellerPrice > 0 ? (
            <div className="pt-1">
              <div className="px-2.5 py-1.5 rounded-lg bg-[#EBF5EF] border border-[#BBDDC7] flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#183624] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse" />
                  Reseller Price:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#183624] text-xs">
                    {formatPrice(product.resellerPrice)}
                  </span>
                  {product.price > product.resellerPrice && (
                    <span className="text-[10px] text-emerald-800 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200 shadow-2xs">
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
                  className="px-2 py-1 rounded bg-amber-50/80 border border-amber-200/80 text-[10px] text-amber-800 flex items-center justify-between cursor-pointer hover:bg-amber-100"
                >
                  <span>Reseller Rate: Not Set</span>
                  <span className="underline font-semibold flex items-center gap-0.5">
                    <Edit3 className="w-2.5 h-2.5" /> + Set Price
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-[#F0EAE0] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#14291D] tabular-nums" title={`₹${product.price}`}>
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-[#8A7F6E] line-through tabular-nums" title={`₹${product.mrp}`}>
                {formatPrice(product.mrp)}
              </span>
            </div>
            {savings > 0 && (
              <span className="text-[10px] text-[#2C5E43] font-semibold block">
                Save {formatPrice(savings)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleWhatsAppConsult}
              title={product.customLink ? "Open Custom Link" : "Quick WhatsApp order"}
              aria-label={product.customLink ? "Open Custom Link" : "Quick WhatsApp order"}
              className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#1E7E34] hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer"
            >
              {product.customLink ? (
                <ExternalLink className="w-4 h-4 text-[#2C5E43]" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
            </button>

            <button
              disabled={!product.inStock}
              onClick={(e) => {
                e.stopPropagation();
                if (product.inStock) onAddToCart(product);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                !product.inStock
                  ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                  : isInCart
                    ? 'bg-[#2C5E43] text-white cursor-pointer'
                    : 'bg-[#14291D] text-white hover:bg-[#203E2D] cursor-pointer'
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
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
