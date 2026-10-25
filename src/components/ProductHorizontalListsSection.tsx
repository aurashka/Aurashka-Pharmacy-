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
  Leaf
} from 'lucide-react';
import { HerbalProduct, ProductHorizontalList, SiteSettings, CategoryItem } from '../types/pharmacy';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { getProductBottomOverlayClasses } from '../utils/gradientHelper';
import { ProgressiveImage } from './ProgressiveImage';
import { HorizontalShelfSkeleton } from './ShimmerSkeletons';
import { getCategoryImageUrl, MiniBadgeItem } from '../utils/categoryImageHelper';

interface ProductHorizontalListsSectionProps {
  lists?: ProductHorizontalList[];
  products: HerbalProduct[];
  categories?: CategoryItem[];
  siteSettings?: SiteSettings;
  onSelectProduct: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  cartProductIds?: Set<string>;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
  isLoading?: boolean;
}

export const ProductHorizontalListsSection: React.FC<ProductHorizontalListsSectionProps> = ({
  lists = [],
  products = [],
  categories = [],
  siteSettings,
  onSelectProduct,
  onAddToCart,
  cartProductIds = new Set(),
  isAdmin = false,
  onOpenAdminPanel,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div id="curated-shelves" className="space-y-8 sm:space-y-12 py-4 scroll-mt-20">
        <HorizontalShelfSkeleton />
      </div>
    );
  }

  // Filter active lists and sort by displayOrder
  const listArray: ProductHorizontalList[] = Array.isArray(lists) 
    ? lists 
    : (Object.values(lists || {}) as ProductHorizontalList[]);
  const activeLists = listArray
    .filter((l) => l && l.enabled !== false)
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  if (activeLists.length === 0) return null;

  return (
    <div id="curated-shelves" className="space-y-10 sm:space-y-14 py-4 sm:py-6 scroll-mt-20">
      {activeLists.map((list) => (
        <SingleHorizontalShelf
          key={list.id}
          list={list}
          allProducts={products}
          categories={categories}
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
  categories?: CategoryItem[];
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
  categories = [],
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
      const ordered: HerbalProduct[] = [];
      list.selectedProductIds.forEach((id) => {
        const found = allProducts.find((p) => p.id === id);
        if (found) ordered.push(found);
      });
      return ordered.length > 0 ? ordered : allProducts.filter((p) => selectedSet.has(p.id));
    } else if (list.category && list.category !== 'all') {
      const filtered = allProducts.filter((p) => p.category === list.category);
      const limit = list.maxProducts && list.maxProducts > 0 ? list.maxProducts : 12;
      return filtered.slice(0, limit);
    } else {
      const limit = list.maxProducts && list.maxProducts > 0 ? list.maxProducts : 10;
      return allProducts.slice(0, limit);
    }
  }, [list, allProducts]);

  if (shelfProducts.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -340 : 340;
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
    <section className="w-full relative my-2 sm:my-4">
      {/* 
        =============================================================
        SHELF HEADER: Pure Text, Badges, Formulation Count & Controls
        No bounding card, no container outlines, completely transparent.
        ============================================================= 
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2.5 border-b border-[#E2EBE5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {list.badgeText ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#143B25] text-emerald-100 text-[10.5px] font-bold uppercase tracking-wider shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{list.badgeText}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCF3E7] text-[#12452B] text-[10.5px] font-bold uppercase tracking-wider border border-[#BDE8D1]">
                  <Leaf className="w-3 h-3 text-[#1E6B47]" />
                  <span>Curated Formulations</span>
                </div>
              )}
            </div>

            <h3 className="font-serif text-xl sm:text-2xl md:text-[26px] font-bold text-[#142B1F] tracking-tight">
              {list.title}
            </h3>

            {list.subtitle && (
              <p className="text-xs sm:text-sm text-[#526B5C] max-w-2xl leading-relaxed">
                {list.subtitle}
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs text-[#526B5C] font-semibold bg-white/80 px-2.5 py-1 rounded-full border border-[#DCEFE3] shadow-2xs">
              {formatCompactNumber(shelfProducts.length)} items
            </span>

            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F0FAF4] text-[#143B25] border border-[#D0E5D9] shadow-xs hover:shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group"
              aria-label="Scroll shelf left"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F0FAF4] text-[#143B25] border border-[#D0E5D9] shadow-xs hover:shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group"
              aria-label="Scroll shelf right"
            >
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 
        =============================================================
        FULL HORIZONTAL SCROLLER: No outer outline, no container curve.
        Products resting cleanly on the 3D wooden shelf base.
        ============================================================= 
      */}
      <div className="relative group/track w-full">
        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex items-end gap-3.5 sm:gap-5 overflow-x-auto pt-3 pb-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-smooth snap-x snap-mandatory touch-pan-x cursor-grab active:cursor-grabbing no-scrollbar relative z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {shelfProducts.map((prod) => {
            const isInCart = cartProductIds.has(prod.id);
            const discountPercent = prod.mrp && prod.mrp > prod.price 
              ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)
              : 0;

            {/* 
              =============================================================
              NORMAL CURVED SHADE: MODERN STYLE CARD (Side-by-side)
              Clean rounded-2xl, soft shadow shade, NO weird custom curves
              ============================================================= 
            */}
            if (cardStyle === 'modern') {
              return (
                <div
                  key={prod.id}
                  className="group/shelf-item shrink-0 snap-start flex flex-col items-center"
                >
                  {/* Floating Product Card with Normal Rounded Corners and Soft Shade */}
                  <div
                    onClick={() => onSelectProduct(prod)}
                    className="w-[285px] sm:w-[325px] md:w-[350px] bg-white rounded-2xl border border-[#DCEFE3] hover:border-[#1E6B47] shadow-[0_4px_16px_rgba(20,50,30,0.06)] group-hover/shelf-item:shadow-[0_12px_28px_rgba(20,50,30,0.14)] transition-all duration-300 ease-out transform group-hover/shelf-item:-translate-y-2.5 cursor-pointer flex flex-row overflow-hidden relative"
                  >
                    {/* Left Column: Details & Actions */}
                    <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0 pr-2 bg-white">
                      <div className="space-y-1">
                        {/* Rating, Badge & Category */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {showRating && (
                            <div className="flex items-center text-amber-500 bg-[#FEF9EE] px-2 py-0.5 rounded-full border border-[#FDE68A] shadow-2xs">
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1] capitalize shrink-0">
                              <Tag className="w-2.5 h-2.5 text-[#1E6B47]" />
                              <span>{prod.sortBadge.replace('_', ' ')}</span>
                            </span>
                          )}

                          {prod.category && (
                            <span className="inline-flex items-center text-[9px] font-medium text-[#1E6B47] bg-[#EAF7EE] px-1.5 py-0.5 rounded-full border border-[#BDE8D1]/70 shrink-0">
                              <MiniBadgeItem
                                label={prod.categoryLabel || prod.category}
                                imageUrl={getCategoryImageUrl(prod.category, categories, siteSettings?.categoryAppearance)}
                                appearance={siteSettings?.categoryAppearance}
                                fallbackIcon={<Leaf className="w-2.5 h-2.5 text-[#1E6B47]" />}
                                className="font-medium"
                              />
                            </span>
                          )}
                        </div>

                        {/* Product Name */}
                        {showName && (
                          <h4 className="font-serif text-xs sm:text-sm font-bold text-[#142B1F] group-hover/shelf-item:text-[#1E6B47] transition-colors line-clamp-2 leading-tight pt-0.5">
                            {prod.name}
                          </h4>
                        )}

                        {/* Sanskrit Name */}
                        {showSanskritName && prod.sanskritName && (
                          <p className="text-[10px] text-[#6B8576] italic line-clamp-1">
                            {prod.sanskritName}
                          </p>
                        )}

                        {/* Seller */}
                        {showSeller && (
                          <div className="flex items-center gap-1 text-[10px] text-[#1E6B47] font-medium truncate pt-0.5">
                            <span className="text-[#8EA396] text-[9.5px]">Seller:</span>
                            <span className="font-semibold truncate">
                              {prod.brand || prod.sellerName || siteSettings?.brandName || 'Shree Ayur Pharma'}
                            </span>
                          </div>
                        )}

                        {/* Volume */}
                        {showVolume && prod.volumeOrWeight && (
                          <div className="text-[9.5px] text-[#6B8576] font-medium truncate">
                            {prod.volumeOrWeight}
                          </div>
                        )}
                      </div>

                      {/* Bottom Area: Price & Action */}
                      <div className="mt-2.5 space-y-2">
                        {(showPrice || showMrpAndOffer || showResellerPrice) && (
                          <div className="pt-1.5 border-t border-[#EDF5F0]">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              {showPrice && (
                                <span className="font-bold text-sm sm:text-base text-[#142B1F] tabular-nums">
                                  {formatPrice(prod.price)}
                                </span>
                              )}
                              {showMrpAndOffer && prod.mrp && prod.mrp > prod.price && (
                                <span className="text-[10.5px] text-[#8EA396] line-through tabular-nums">
                                  {formatPrice(prod.mrp)}
                                </span>
                              )}
                              {showMrpAndOffer && discountPercent > 0 && (
                                <span className="text-[9.5px] font-bold text-[#1E6B47] bg-[#EAF7EE] px-1.5 py-0.2 rounded-full border border-[#BDE8D1]">
                                  Save {discountPercent}%
                                </span>
                              )}
                            </div>

                            {showResellerPrice && prod.resellerPrice && prod.resellerPrice > 0 && (
                              <div className="mt-0.5 text-[9.5px] bg-[#EAF5EE] text-[#12452B] px-2 py-0.5 rounded-lg font-semibold truncate border border-[#DCEFE3] flex items-center justify-between">
                                <span>Reseller: {formatPrice(prod.resellerPrice)}</span>
                                {prod.price > prod.resellerPrice && (
                                  <span className="font-bold text-[#1E6B47]">
                                    Margin {formatPrice(prod.price - prod.resellerPrice)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {(showAddToCart || showQuickView) && (
                          <div className="flex items-center gap-1.5">
                            {showAddToCart && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(prod);
                                }}
                                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs ${
                                  isInCart
                                    ? 'bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1]'
                                    : 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white hover:brightness-110'
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

                    {/* Right Column: Full Image (Flush, clean rounded right) */}
                    {showImage && (
                      <div className="w-[115px] sm:w-[130px] md:w-[145px] shrink-0 relative bg-transparent overflow-hidden flex items-center justify-center border-l border-[#E6F0EB]/60 p-0">
                        <ProgressiveImage
                          src={prod.image || (prod.images && prod.images[0]) || ''}
                          alt={prod.name}
                          className="w-full h-full object-cover rounded-none group-hover/shelf-item:scale-106 transition-transform duration-500 bg-transparent"
                        />

                        {getProductBottomOverlayClasses(prod.primaryImageGradient, siteSettings?.productImageGradient) && (
                          <div className={getProductBottomOverlayClasses(prod.primaryImageGradient, siteSettings?.productImageGradient)!} />
                        )}

                        {showMrpAndOffer && discountPercent > 0 && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#143B25] text-white shadow-xs border border-white/20">
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Physical 3D floor contact shadow on the wooden shelf */}
                  <div className="w-3/4 h-3.5 mt-1.5 ayurvedic-shelf-shadow rounded-full transition-all duration-300 group-hover/shelf-item:scale-75 group-hover/shelf-item:opacity-30 group-hover/shelf-item:blur-[2px]" />
                </div>
              );
            }

            {/* 
              =============================================================
              NORMAL CURVED SHADE: CLASSIC STYLE CARD (Vertical)
              Clean rounded-2xl, soft shadow shade, NO weird custom curves
              ============================================================= 
            */}
            return (
              <div
                key={prod.id}
                className="group/shelf-item shrink-0 snap-start flex flex-col items-center"
              >
                {/* Floating Product Card with Normal Rounded Corners and Soft Shade */}
                <div
                  onClick={() => onSelectProduct(prod)}
                  className="w-[195px] sm:w-[215px] md:w-[230px] bg-white rounded-2xl border border-[#DCEFE3] hover:border-[#1E6B47] shadow-[0_4px_16px_rgba(20,50,30,0.06)] group-hover/shelf-item:shadow-[0_12px_28px_rgba(20,50,30,0.14)] transition-all duration-300 ease-out transform group-hover/shelf-item:-translate-y-2.5 cursor-pointer flex flex-col justify-between overflow-hidden relative"
                >
                  <div>
                    {/* Top Image Container (Flush, clean rounded-t-2xl) */}
                    {showImage && (
                      <div className="relative aspect-4/3 sm:aspect-square bg-transparent rounded-t-2xl overflow-hidden flex items-center justify-center p-0">
                        <ProgressiveImage
                          src={prod.image || (prod.images && prod.images[0]) || ''}
                          alt={prod.name}
                          className="w-full h-full object-cover rounded-none group-hover/shelf-item:scale-106 transition-transform duration-500 bg-transparent"
                        />

                        {getProductBottomOverlayClasses(prod.primaryImageGradient, siteSettings?.productImageGradient) && (
                          <div className={getProductBottomOverlayClasses(prod.primaryImageGradient, siteSettings?.productImageGradient)!} />
                        )}

                        {/* Tag / Badge */}
                        {showTag && prod.sortBadge && prod.sortBadge !== 'none' && (
                          <div className="absolute top-2 left-2 z-10">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1] shadow-2xs capitalize">
                              <Tag className="w-2.5 h-2.5 text-[#1E6B47]" />
                              <span>{prod.sortBadge.replace('_', ' ')}</span>
                            </span>
                          </div>
                        )}

                        {/* Offer discount badge */}
                        {showMrpAndOffer && discountPercent > 0 && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#143B25] text-white shadow-2xs border border-white/20">
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Content Details */}
                    <div className="p-3 sm:p-3.5 space-y-1 bg-white">
                      {/* Category & Rating */}
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        {prod.category && (
                          <span className="inline-flex items-center text-[9px] font-medium text-[#1E6B47] bg-[#EAF7EE] px-1.5 py-0.5 rounded-full border border-[#BDE8D1]/70 shrink-0">
                            <MiniBadgeItem
                              label={prod.categoryLabel || prod.category}
                              imageUrl={getCategoryImageUrl(prod.category, categories, siteSettings?.categoryAppearance)}
                              appearance={siteSettings?.categoryAppearance}
                              fallbackIcon={<Leaf className="w-2.5 h-2.5 text-[#1E6B47]" />}
                              className="font-medium"
                            />
                          </span>
                        )}

                        {showRating && (
                          <div className="flex items-center gap-1 text-[11px] text-[#526B5C] ml-auto">
                            <div className="flex items-center text-amber-500">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-[#142B1F] ml-0.5">{prod.rating ? prod.rating.toFixed(1) : '4.9'}</span>
                            </div>
                            <span className="text-[#A4B5AC]">·</span>
                            <span className="text-[10px]">({formatCompactNumber(prod.reviewsCount || 100)})</span>
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      {showName && (
                        <h4 className="font-serif text-xs sm:text-sm font-bold text-[#142B1F] group-hover/shelf-item:text-[#1E6B47] transition-colors line-clamp-1 leading-tight pt-0.5">
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
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            {showPrice && (
                              <span className="font-bold text-sm sm:text-base text-[#142B1F] tabular-nums">
                                {formatPrice(prod.price)}
                              </span>
                            )}

                            {showMrpAndOffer && prod.mrp && prod.mrp > prod.price && (
                              <span className="text-xs text-[#8EA396] line-through tabular-nums">
                                {formatPrice(prod.mrp)}
                              </span>
                            )}

                            {showMrpAndOffer && discountPercent > 0 && (
                              <span className="text-[9.5px] font-bold text-[#1E6B47] bg-[#EAF7EE] px-1.5 py-0.2 rounded-full border border-[#BDE8D1]">
                                Save {discountPercent}%
                              </span>
                            )}
                          </div>

                          {/* Reseller Wholesale Price with Margin */}
                          {showResellerPrice && prod.resellerPrice && prod.resellerPrice > 0 && (
                            <div className="flex items-center justify-between text-[10px] bg-[#EAF5EE] px-2 py-0.5 rounded-lg border border-[#DCEFE3]">
                              <span className="text-[#143B25] font-semibold">Reseller: {formatPrice(prod.resellerPrice)}</span>
                              {prod.price > prod.resellerPrice && (
                                <span className="font-bold text-[#1E6B47]">
                                  Margin {formatPrice(prod.price - prod.resellerPrice)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  {(showAddToCart || showQuickView) && (
                    <div className="p-3 sm:p-3.5 pt-0 flex items-center gap-1.5 relative z-10 bg-white">
                      {showAddToCart && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(prod);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs ${
                            isInCart
                              ? 'bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1]'
                              : 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white hover:brightness-110'
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
                          className="w-8 h-8 rounded-full border border-[#DCEFE3] text-[#143B25] hover:bg-[#DCF3E7] bg-white flex items-center justify-center cursor-pointer shadow-2xs"
                          title="View Full Monograph & Formulation Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Physical 3D floor contact shadow on the wooden shelf */}
                <div className="w-3/4 h-3.5 mt-1.5 ayurvedic-shelf-shadow rounded-full transition-all duration-300 group-hover/shelf-item:scale-75 group-hover/shelf-item:opacity-30 group-hover/shelf-item:blur-[2px]" />
              </div>
            );
          })}
        </div>

        {/* 
          =============================================================
          PHYSICAL 3D WOODEN SHELF BASE: Horizontally Full Screen
          Runs edge-to-edge horizontally across the entire width.
          Top plank for items to stand on + Beveled front board with brass rivets.
          =============================================================
        */}
        <div className="w-full pointer-events-none select-none mt-0.5">
          {/* Shelf Top Platform (where items stand) */}
          <div className="h-3 sm:h-3.5 w-full ayurvedic-shelf-top border-t border-[#F2D4A8]/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Shelf Front Board (beveled 3D thickness with antique brass rivets) */}
          <div className="h-3.5 sm:h-4 w-full ayurvedic-shelf-front relative flex items-center justify-between px-6 sm:px-12 border-t border-[#4A260A]">
            {/* Brass screw studs / rivets along the wooden beam */}
            <div className="flex items-center gap-16 sm:gap-24 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] hidden sm:inline-block" />
            </div>

            {/* Central royal brass crest plate */}
            <div className="h-1.5 px-3 rounded-xs bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 opacity-60 flex items-center justify-center shadow-xs">
              <span className="w-8 h-[1px] bg-amber-900/40" />
            </div>

            <div className="flex items-center gap-16 sm:gap-24 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] hidden sm:inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
