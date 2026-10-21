import React, { useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  Star, 
  Eye, 
  Tag, 
  Layers
} from 'lucide-react';
import { HerbalProduct, ProductHorizontalList, SiteSettings } from '../types/pharmacy';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { getProductBottomOverlayClasses } from '../utils/gradientHelper';

interface ProductHorizontalListsSectionProps {
  lists?: ProductHorizontalList[];
  products: HerbalProduct[];
  siteSettings?: SiteSettings;
  onSelectProduct: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  cartProductIds?: Set<string>;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

export const ProductHorizontalListsSection: React.FC<ProductHorizontalListsSectionProps> = ({
  lists = [],
  products = [],
  siteSettings,
  onSelectProduct,
  onAddToCart,
  cartProductIds = new Set(),
  isAdmin = false,
  onOpenAdminPanel,
}) => {
  // Filter active lists and sort by displayOrder
  const listArray: ProductHorizontalList[] = Array.isArray(lists) 
    ? lists 
    : (Object.values(lists || {}) as ProductHorizontalList[]);
  const activeLists = listArray
    .filter((l) => l && l.enabled !== false)
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  if (activeLists.length === 0) return null;

  return (
    <div id="curated-shelves" className="space-y-6 sm:space-y-8 pt-4 pb-2 sm:pt-5 sm:pb-3 scroll-mt-20">
      {activeLists.map((list) => (
        <SingleHorizontalShelf
          key={list.id}
          list={list}
          allProducts={products}
          siteSettings={siteSettings}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
          cartProductIds={cartProductIds}
          isAdmin={isAdmin}
          onOpenAdminPanel={onOpenAdminPanel}
        />
      ))}
    </div>
  );
};

interface SingleHorizontalShelfProps {
  list: ProductHorizontalList;
  allProducts: HerbalProduct[];
  siteSettings?: SiteSettings;
  onSelectProduct: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  cartProductIds: Set<string>;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

const SingleHorizontalShelf: React.FC<SingleHorizontalShelfProps> = ({
  list,
  allProducts,
  siteSettings,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Derive products for this shelf
  const shelfProducts: HerbalProduct[] = React.useMemo(() => {
    if (list.sourceType === 'manual' && Array.isArray(list.selectedProductIds)) {
      const selectedSet = new Set(list.selectedProductIds);
      // Preserve the order of selectedProductIds
      const ordered: HerbalProduct[] = [];
      list.selectedProductIds.forEach((id) => {
        const found = allProducts.find((p) => p.id === id);
        if (found) ordered.push(found);
      });
      // Fallback for any matched
      return ordered.length > 0 ? ordered : allProducts.filter((p) => selectedSet.has(p.id));
    } else if (list.category && list.category !== 'all') {
      const filtered = allProducts.filter((p) => p.category === list.category);
      const limit = list.maxProducts && list.maxProducts > 0 ? list.maxProducts : 12;
      return filtered.slice(0, limit);
    } else {
      // Default: top products up to limit
      const limit = list.maxProducts && list.maxProducts > 0 ? list.maxProducts : 10;
      return allProducts.slice(0, limit);
    }
  }, [list, allProducts]);

  if (shelfProducts.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const fields = list.cardFields || {};
  const showImage = fields.showImage !== false;
  const showName = fields.showName !== false;
  const showSanskritName = fields.showSanskritName !== false;
  const showPrice = fields.showPrice !== false;
  const showResellerPrice = fields.showResellerPrice !== false;
  const showMrpAndOffer = fields.showMrpAndOffer !== false;
  const showTag = fields.showTag !== false;
  const showRating = fields.showRating !== false;
  const showAddToCart = fields.showAddToCart !== false;
  const showQuickView = fields.showQuickView !== false;
  const showSeller = fields.showSeller === true;
  const showVolume = fields.showVolume === true;
  const cardStyle = list.cardStyle || siteSettings?.defaultHorizontalShelfCardStyle || 'classic';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 relative">
      {/* Shelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-2.5 border-b border-[#DDD5C5]/60 pb-2">
        <div className="space-y-0.5">
          {list.badgeText && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#14291D]/10 text-[#14291D] text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3 text-[#B4741E]" />
              <span>{list.badgeText}</span>
            </div>
          )}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#14291D] tracking-tight">
            {list.title}
          </h3>
          {list.subtitle && (
            <p className="text-[11px] sm:text-xs text-[#635A4B] max-w-2xl leading-relaxed">
              {list.subtitle}
            </p>
          )}
        </div>

        {/* Navigation & Count Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <span className="text-[11px] text-[#7A705E] font-medium mr-1">
            {formatCompactNumber(shelfProducts.length)} items
          </span>
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-full bg-white hover:bg-stone-100 text-[#14291D] border border-[#DDD5C5] shadow-2xs flex items-center justify-center transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-full bg-white hover:bg-stone-100 text-[#14291D] border border-[#DDD5C5] shadow-2xs flex items-center justify-center transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="relative group/track">
        <div
          ref={scrollRef}
          className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto pb-2.5 pt-1 px-1 scroll-smooth snap-x snap-mandatory touch-pan-x touch-pan-y cursor-grab active:cursor-grabbing no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x pan-y' }}
        >
          {shelfProducts.map((prod) => {
            const isInCart = cartProductIds.has(prod.id);
            const discountPercent = prod.mrp && prod.mrp > prod.price 
              ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)
              : 0;

            {/* MODERN SHOWCASE CARD (Left Details: Top Rating Star, Name, Price, Buy + Right Full Image) */}
            if (cardStyle === 'modern') {
              return (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="w-[285px] sm:w-[320px] md:w-[345px] shrink-0 snap-start bg-white rounded-3xl border border-[#DCEFE3] hover:border-[#1E6B47] shadow-[0_4px_20px_rgba(20,50,30,0.04)] hover:shadow-[0_12px_32px_rgba(20,50,30,0.1)] transition-all duration-300 cursor-pointer flex flex-row overflow-hidden group/card relative z-10"
                >
                  {/* Left Column: Details & Actions */}
                  <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0 pr-2 bg-white">
                    <div className="space-y-1">
                      {/* Top Row: Star Rating & Optional Tag */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {showRating && (
                          <div className="flex items-center text-amber-500 bg-[#FEF9EE] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                            <span className="font-bold text-[11px] text-[#142B1F] ml-1">
                              {prod.rating ? prod.rating.toFixed(1) : '4.9'}
                            </span>
                            <span className="text-[#A4B5AC] mx-0.5">·</span>
                            <span className="text-[10px] text-[#526B5C]">
                              ({formatCompactNumber(prod.reviewsCount || 100)})
                            </span>
                          </div>
                        )}

                        {showTag && prod.sortBadge && prod.sortBadge !== 'none' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1] capitalize shrink-0">
                            <Tag className="w-2.5 h-2.5 text-[#1E6B47]" />
                            <span>{prod.sortBadge.replace('_', ' ')}</span>
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      {showName && (
                        <h4 className="font-serif text-xs sm:text-sm font-bold text-[#142B1F] group-hover/card:text-[#1E6B47] transition-colors line-clamp-2 leading-tight">
                          {prod.name}
                        </h4>
                      )}

                      {/* Sanskrit Name */}
                      {showSanskritName && prod.sanskritName && (
                        <p className="text-[10px] text-[#6B8576] italic line-clamp-1">
                          {prod.sanskritName}
                        </p>
                      )}

                      {/* Seller / Brand */}
                      {showSeller && (
                        <div className="flex items-center gap-1 text-[10px] text-[#1E6B47] font-medium truncate">
                          <span className="text-[#8EA396] text-[9.5px]">Seller:</span>
                          <span className="font-semibold truncate">
                            {prod.brand || prod.sellerName || siteSettings?.brandName || 'Shree Ayur Pharma'}
                          </span>
                        </div>
                      )}

                      {/* Volume / Pack Size */}
                      {showVolume && prod.volumeOrWeight && (
                        <div className="text-[9.5px] text-[#6B8576] font-medium truncate">
                          {prod.volumeOrWeight}
                        </div>
                      )}
                    </div>

                    {/* Bottom Area: Price & Buy Button */}
                    <div className="mt-2.5 space-y-2">
                      {(showPrice || showMrpAndOffer || showResellerPrice) && (
                        <div className="pt-1.5 border-t border-[#EDF5F0]">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            {showPrice && (
                              <span className="font-bold text-sm sm:text-base text-[#142B1F]">
                                {formatPrice(prod.price)}
                              </span>
                            )}
                            {showMrpAndOffer && prod.mrp && prod.mrp > prod.price && (
                              <span className="text-[10.5px] text-[#8EA396] line-through">
                                {formatPrice(prod.mrp)}
                              </span>
                            )}
                          </div>

                          {showResellerPrice && prod.resellerPrice && prod.resellerPrice > 0 && (
                            <div className="mt-0.5 text-[9.5px] bg-[#EAF5EE] text-[#12452B] px-2 py-0.5 rounded-full font-semibold truncate border border-[#DCEFE3]">
                              Reseller: {formatPrice(prod.resellerPrice)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Buy Action Buttons with Reference Styling */}
                      {(showAddToCart || showQuickView) && (
                        <div className="flex items-center gap-1.5">
                          {showAddToCart && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(prod);
                              }}
                              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs ${
                                isInCart
                                  ? 'bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1]'
                                  : 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white hover:shadow-md'
                              }`}
                            >
                              {isInCart ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#1E6B47]" />
                                  <span>In Cart</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>Buy</span>
                                </>
                              )}
                            </button>
                          )}

                          {showQuickView && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProduct(prod);
                              }}
                              className="w-8 h-8 rounded-full border border-[#DCEFE3] bg-white text-[#143B25] hover:bg-[#DCF3E7] flex items-center justify-center cursor-pointer shadow-2xs"
                              title="View Monograph"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Full Image (Neutral background, no green tint) */}
                  {showImage && (
                    <div className="w-[110px] sm:w-[125px] md:w-[135px] shrink-0 relative bg-[#F8FAF9] overflow-hidden flex items-center justify-center border-l border-[#E6F0EB]">
                      <img
                        src={prod.image || (prod.images && prod.images[0]) || ''}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover/card:scale-106 transition-transform duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />

                      {/* Optional Configurable Bottom Gradient / Blur Glass Overlay */}
                      {getProductBottomOverlayClasses(prod.primaryImageGradient, siteSettings?.productImageGradient) && (
                        <div className={getProductBottomOverlayClasses(prod.primaryImageGradient, siteSettings?.productImageGradient)!} />
                      )}

                      {/* Offer Discount Badge on Image */}
                      {showMrpAndOffer && discountPercent > 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#143B25] text-white shadow-xs border border-white/20">
                            {discountPercent}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            {/* CLASSIC / NORMAL CARD (Vertical Image on Top, Details Below) */}
            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className="w-[200px] sm:w-[220px] md:w-[240px] shrink-0 snap-start bg-white/95 backdrop-blur-xs rounded-3xl border border-[#DCEFE3] hover:border-[#1E6B47] shadow-[0_4px_20px_rgba(20,50,30,0.04)] hover:shadow-[0_12px_32px_rgba(20,50,30,0.1)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group/card"
              >
                <div>
                  {/* Image Container */}
                  {showImage && (
                    <div className="relative aspect-4/3 sm:aspect-square bg-gradient-to-b from-[#F4FAF6] to-[#EAF5EE] overflow-hidden rounded-t-3xl border-0">
                      <img
                        src={prod.image || (prod.images && prod.images[0]) || ''}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover/card:scale-106 transition-transform duration-500 bg-transparent"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />

                      {/* Optional Configurable Bottom Gradient / Blur Glass Overlay */}
                      {getProductBottomOverlayClasses(prod.primaryImageGradient, siteSettings?.productImageGradient) && (
                        <div className={getProductBottomOverlayClasses(prod.primaryImageGradient, siteSettings?.productImageGradient)!} />
                      )}

                      {/* Tag / Badge */}
                      {showTag && prod.sortBadge && prod.sortBadge !== 'none' && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1] shadow-xs capitalize">
                            <Tag className="w-2.5 h-2.5 text-[#1E6B47]" />
                            <span>{prod.sortBadge.replace('_', ' ')}</span>
                          </span>
                        </div>
                      )}

                      {/* Offer Discount Badge */}
                      {showMrpAndOffer && discountPercent > 0 && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#143B25] text-white shadow-xs border border-white/20">
                            {discountPercent}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content Details */}
                  <div className="p-3.5 space-y-1.5">
                    {/* Rating & Review */}
                    {showRating && (
                      <div className="flex items-center gap-1 text-[11px] text-[#526B5C]">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-[#142B1F] ml-0.5">{prod.rating}</span>
                        </div>
                        <span className="text-[#A4B5AC]">·</span>
                        <span>({formatCompactNumber(prod.reviewsCount)})</span>
                      </div>
                    )}

                    {/* Product Name */}
                    {showName && (
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#142B1F] group-hover/card:text-[#1E6B47] transition-colors line-clamp-1">
                        {prod.name}
                      </h4>
                    )}

                    {/* Sanskrit / Botanical Name */}
                    {showSanskritName && prod.sanskritName && (
                      <p className="text-[10.5px] text-[#6B8576] italic line-clamp-1">
                        {prod.sanskritName}
                      </p>
                    )}

                    {/* Seller / Brand */}
                    {showSeller && (
                      <div className="flex items-center gap-1 text-[10px] text-[#1E6B47] font-medium truncate">
                        <span className="text-[#8EA396] text-[9.5px]">Seller:</span>
                        <span className="font-semibold truncate">
                          {prod.brand || prod.sellerName || siteSettings?.brandName || 'Shree Ayur Pharma'}
                        </span>
                      </div>
                    )}

                    {/* Volume / Pack Size */}
                    {showVolume && prod.volumeOrWeight && (
                      <div className="text-[10px] text-[#6B8576] font-medium truncate">
                        {prod.volumeOrWeight}
                      </div>
                    )}

                    {/* Price and Reseller Section */}
                    {(showPrice || showMrpAndOffer || showResellerPrice) && (
                      <div className="pt-1.5 border-t border-[#EDF5F0] space-y-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          {showPrice && (
                            <span className="font-bold text-sm sm:text-base text-[#142B1F]">
                              {formatPrice(prod.price)}
                            </span>
                          )}

                          {showMrpAndOffer && prod.mrp && prod.mrp > prod.price && (
                            <span className="text-xs text-[#8EA396] line-through">
                              {formatPrice(prod.mrp)}
                            </span>
                          )}
                        </div>

                        {/* Reseller Wholesale Price */}
                        {showResellerPrice && prod.resellerPrice && prod.resellerPrice > 0 && (
                          <div className="flex items-center justify-between text-[10px] bg-[#EAF5EE] px-2 py-0.5 rounded-full border border-[#DCEFE3]">
                            <span className="text-[#1E6B47] font-semibold">Reseller:</span>
                            <span className="font-bold text-[#12452B]">
                              {formatPrice(prod.resellerPrice)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                {(showAddToCart || showQuickView) && (
                  <div className="p-3.5 pt-0 flex items-center gap-1.5">
                    {showAddToCart && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(prod);
                        }}
                        className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs ${
                          isInCart
                            ? 'bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1]'
                            : 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white hover:shadow-md'
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#1E6B47]" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    )}

                    {showQuickView && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(prod);
                        }}
                        className="w-8 h-8 rounded-full border border-[#DCEFE3] text-[#143B25] hover:bg-[#DCF3E7] flex items-center justify-center cursor-pointer shadow-2xs"
                        title="View Full Monograph & Formulation Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
