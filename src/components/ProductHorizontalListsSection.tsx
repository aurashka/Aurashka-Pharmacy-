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
import { HerbalProduct, ProductHorizontalList } from '../types/pharmacy';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';

interface ProductHorizontalListsSectionProps {
  lists?: ProductHorizontalList[];
  products: HerbalProduct[];
  onSelectProduct: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  cartProductIds?: Set<string>;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

export const ProductHorizontalListsSection: React.FC<ProductHorizontalListsSectionProps> = ({
  lists = [],
  products = [],
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
    <div className="space-y-6 sm:space-y-8 pt-4 pb-2 sm:pt-5 sm:pb-3">
      {activeLists.map((list) => (
        <SingleHorizontalShelf
          key={list.id}
          list={list}
          allProducts={products}
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
  onSelectProduct: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  cartProductIds: Set<string>;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

const SingleHorizontalShelf: React.FC<SingleHorizontalShelfProps> = ({
  list,
  allProducts,
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
          className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto pb-2.5 pt-1 px-1 scroll-smooth snap-x snap-mandatory touch-pan-x cursor-grab active:cursor-grabbing no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {shelfProducts.map((prod) => {
            const isInCart = cartProductIds.has(prod.id);
            const discountPercent = prod.mrp && prod.mrp > prod.price 
              ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)
              : 0;

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className="w-[200px] sm:w-[220px] md:w-[240px] shrink-0 snap-start bg-white rounded-xl border border-[#D5CCBC] hover:border-[#2C5E43] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden group/card"
              >
                <div>
                  {/* Image Container */}
                  {showImage && (
                    <div className="relative aspect-4/3 sm:aspect-square bg-[#FAF8F5] overflow-hidden border-b border-[#E8E2D5]">
                      <img
                        src={prod.image || (prod.images && prod.images[0]) || ''}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover/card:scale-104 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />

                      {/* Tag / Badge */}
                      {showTag && prod.sortBadge && prod.sortBadge !== 'none' && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#14291D] text-white shadow-xs capitalize">
                            <Tag className="w-2.5 h-2.5 text-amber-300" />
                            <span>{prod.sortBadge.replace('_', ' ')}</span>
                          </span>
                        </div>
                      )}

                      {/* Offer Discount Badge */}
                      {showMrpAndOffer && discountPercent > 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B4741E] text-white shadow-xs">
                            {discountPercent}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content Details */}
                  <div className="p-3 space-y-1.5">
                    {/* Rating & Review */}
                    {showRating && (
                      <div className="flex items-center gap-1 text-[11px] text-[#716858]">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-[#14291D] ml-0.5">{prod.rating}</span>
                        </div>
                        <span className="text-stone-300">·</span>
                        <span>({formatCompactNumber(prod.reviewsCount)})</span>
                      </div>
                    )}

                    {/* Product Name */}
                    {showName && (
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#14291D] group-hover/card:text-[#2C5E43] transition-colors line-clamp-1">
                        {prod.name}
                      </h4>
                    )}

                    {/* Sanskrit / Botanical Name */}
                    {showSanskritName && prod.sanskritName && (
                      <p className="text-[10.5px] text-[#716858] italic line-clamp-1">
                        {prod.sanskritName}
                      </p>
                    )}

                    {/* Price and Reseller Section */}
                    {(showPrice || showMrpAndOffer || showResellerPrice) && (
                      <div className="pt-1 border-t border-[#F2ECE1] space-y-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          {showPrice && (
                            <span className="font-mono font-bold text-sm sm:text-base text-[#14291D]">
                              {formatPrice(prod.price)}
                            </span>
                          )}

                          {showMrpAndOffer && prod.mrp && prod.mrp > prod.price && (
                            <span className="font-mono text-xs text-[#8C8270] line-through">
                              {formatPrice(prod.mrp)}
                            </span>
                          )}
                        </div>

                        {/* Reseller Wholesale Price */}
                        {showResellerPrice && prod.resellerPrice && prod.resellerPrice > 0 && (
                          <div className="flex items-center justify-between text-[10px] bg-[#E7EFEA]/80 px-1.5 py-0.5 rounded border border-[#B5D6C4]">
                            <span className="text-[#2C5E43] font-semibold">Reseller:</span>
                            <span className="font-mono font-bold text-[#183624]">
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
                  <div className="p-3 pt-0 flex items-center gap-1.5">
                    {showAddToCart && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(prod);
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isInCart
                            ? 'bg-[#E7EFEA] text-[#14291D] border border-[#A5D6B6]'
                            : 'bg-[#14291D] hover:bg-[#203E2D] text-white shadow-2xs'
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#2C5E43]" />
                            <span>In Bag</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
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
                        className="p-1.5 rounded-lg border border-[#DDD5C5] text-[#554B3B] hover:text-[#14291D] hover:bg-stone-50 cursor-pointer"
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
