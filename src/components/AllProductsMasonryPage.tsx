import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HerbalProduct, CategoryItem, SiteSettings, ProductCategory } from '../types/pharmacy';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { 
  ArrowLeft, 
  Search, 
  ShoppingBag, 
  Star, 
  Leaf, 
  Sparkles, 
  Filter, 
  SlidersHorizontal, 
  Check, 
  Flame, 
  TrendingUp, 
  RotateCcw,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { ProgressiveImage } from './ProgressiveImage';
import { getCategoryImageUrl, getFormImageUrl, MiniBadgeItem } from '../utils/categoryImageHelper';

interface AllProductsMasonryPageProps {
  products: HerbalProduct[];
  categories: CategoryItem[];
  forms: string[];
  onSelectProduct: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  cartProductIds: Set<string>;
  onBack: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  siteSettings: SiteSettings;
}

export const AllProductsMasonryPage: React.FC<AllProductsMasonryPageProps> = ({
  products,
  categories,
  forms,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  onBack,
  cartCount = 0,
  onOpenCart,
  siteSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'deals' | 'trending' | 'rating' | 'price-asc' | 'price-desc'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortOpen]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedForm !== 'all' && item.form !== selectedForm) {
        return false;
      }
      if (showInStockOnly && !item.inStock) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSanskrit = (item.sanskritName || '').toLowerCase().includes(q);
        const matchesTagline = (item.tagline || '').toLowerCase().includes(q);
        const matchesCategory = (item.categoryLabel || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSanskrit && !matchesTagline && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategory, selectedForm, showInStockOnly, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'deals') {
      list.sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price));
    } else if (sortBy === 'trending') {
      list.sort((a, b) => {
        const aTrend = a.sortBadge === 'trending' ? 1 : 0;
        const bTrend = b.sortBadge === 'trending' ? 1 : 0;
        if (aTrend !== bTrend) return bTrend - aTrend;
        return (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount);
      });
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      // featured / display order
      list.sort((a, b) => {
        const orderA = a.displayOrder !== undefined ? a.displayOrder : 9999;
        const orderB = b.displayOrder !== undefined ? b.displayOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount);
      });
    }
    return list;
  }, [filteredProducts, sortBy]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedForm !== 'all' || searchQuery.trim() !== '' || showInStockOnly || sortBy !== 'featured';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedForm('all');
    setSortBy('featured');
    setShowInStockOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF7] text-[#142B1F] flex flex-col">
      {/* 1. Sticky Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#14291D] text-white border-b border-[#234D34] shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#A5D6B6] hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-mono text-[#A5D6B6] bg-white/10 px-3 py-1 rounded-full border border-white/10">
              {sortedProducts.length} Formulations
            </span>

            {onOpenCart && (
              <button
                type="button"
                onClick={onOpenCart}
                className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                title="View Dispensary Cart"
              >
                <ShoppingBag className="w-4.5 h-4.5 text-amber-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-[#14291D] text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Top Title & Filter Controls Strip */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-3 space-y-4 relative z-30">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#DCEFE3] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E6B47] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Complete Herbal Apothecary</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14291D]">
              All Products & Classical Formulations
            </h1>
            <p className="text-xs sm:text-sm text-[#526B5C] mt-1">
              Explore our complete collection in Pinterest-style masonry grid. Handcrafted classical recipes and modern botanical extracts.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#526B5C] shrink-0">
            <span className="font-mono font-bold text-[#14291D] text-base">
              {sortedProducts.length}
            </span>
            <span>of {products.length} products showing</span>
          </div>
        </div>

        {/* Search, Sort & Quick Filter Bar */}
        <div className="relative z-40 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#DCEFE3] shadow-xs flex flex-col md:flex-row items-stretch gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6B8576] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by formulation name, Sanskrit herb, or ailment..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F4FAF6] border border-[#DCEFE3] text-xs sm:text-sm text-[#142B1F] placeholder-[#6B8576] focus:outline-none focus:ring-2 focus:ring-[#1E6B47]/20 focus:border-[#1E6B47]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown - High z-index popover strictly on top of all elements */}
          <div ref={sortRef} className="relative shrink-0 z-50">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#F4FAF6] hover:bg-[#EAF6EE] text-[#142B1F] border border-[#DCEFE3] text-xs font-bold flex items-center justify-between sm:justify-start gap-2 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#1E6B47]" />
                <span className="text-[#6B8576] font-normal">Sort:</span>
                <span className="capitalize">{sortBy.replace('-', ' ')}</span>
              </div>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white/98 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(20,50,30,0.30)] border border-[#DCEFE3] p-2 z-[100] space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                {[
                  { id: 'featured', label: 'Featured Order' },
                  { id: 'deals', label: 'Highest Discounts / Deals' },
                  { id: 'trending', label: 'Trending & Popular' },
                  { id: 'rating', label: 'Top Rated (4.8★+)' },
                  { id: 'price-asc', label: 'Price: Low to High' },
                  { id: 'price-desc', label: 'Price: High to Low' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id as any);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      sortBy === opt.id
                        ? 'bg-[#143B25] text-white font-bold'
                        : 'text-[#142B1F] hover:bg-[#F4FAF6]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* In-Stock Toggle */}
          <button
            type="button"
            onClick={() => setShowInStockOnly(!showInStockOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer border ${
              showInStockOnly
                ? 'bg-[#1E6B47] text-white border-[#1E6B47]'
                : 'bg-white hover:bg-[#F4FAF6] text-[#142B1F] border-[#DCEFE3]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showInStockOnly ? 'bg-white' : 'bg-emerald-500'}`} />
            <span>In Stock Only</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 text-[#6B8576] hover:text-[#143B25] hover:bg-[#F0FAF4] rounded-xl border border-[#DCEFE3] text-xs transition-colors cursor-pointer flex items-center justify-center"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#143B25] text-white shadow-xs'
                : 'bg-white text-[#142B1F] border border-[#DCEFE3] hover:border-[#1E6B47]'
            }`}
          >
            <MiniBadgeItem
              label={`All Categories (${products.length})`}
              imageUrl={getCategoryImageUrl('all', categories, siteSettings?.categoryAppearance)}
              appearance={siteSettings?.categoryAppearance}
              sizePx={16}
            />
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            const catImg = getCategoryImageUrl(cat.id, categories, siteSettings?.categoryAppearance);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#143B25] text-white font-bold shadow-xs'
                    : 'bg-white text-[#142B1F] border border-[#DCEFE3] hover:border-[#1E6B47]'
                }`}
              >
                <MiniBadgeItem
                  label={cat.label}
                  imageUrl={catImg}
                  appearance={siteSettings?.categoryAppearance}
                  sizePx={16}
                />
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#EBF5EE] text-[#1E6B47]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pinterest-Style Staggered / Masonry Layout Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex-1 relative z-10">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#DCEFE3] p-8 space-y-3">
            <Leaf className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#142B1F]">No formulations found</h3>
            <p className="text-xs sm:text-sm text-[#6B8576] max-w-md mx-auto">
              We couldn't find any remedies matching your criteria. Try adjusting your search query or clear the selected filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-3 px-5 py-2.5 rounded-full bg-[#143B25] hover:bg-[#1E6B47] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-3 lg:columns-4 xl:columns-5 gap-3.5 sm:gap-4.5">
            {sortedProducts.map((prod, idx) => {
              const savings = prod.mrp - prod.price;
              const discountPercent = Math.round((savings / (prod.mrp || 1)) * 100);
              const isInCart = cartProductIds.has(prod.id);

              return (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="break-inside-avoid mb-3.5 sm:mb-4.5 rounded-2xl sm:rounded-3xl bg-white border border-[#DCEFE3] hover:border-[#1E6B47] shadow-[0_4px_20px_rgba(20,50,30,0.04)] hover:shadow-[0_12px_36px_rgba(20,50,30,0.12)] transition-all overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Image Holder with Organic Height */}
                  <div className="relative w-full bg-linear-to-b from-[#F2F9F5] via-[#EBF6F0]/60 to-white overflow-hidden p-2.5 sm:p-3 flex items-center justify-center">
                    <ProgressiveImage
                      src={prod.image || (prod.images && prod.images[0]) || ''}
                      alt={prod.name}
                      className="w-full object-contain max-h-52 sm:max-h-60 group-hover:scale-104 transition-transform duration-300 drop-shadow-sm"
                    />

                    {/* Tags Overlaid on Image */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
                      {!prod.inStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] shadow-xs">
                          OUT OF STOCK
                        </span>
                      ) : savings > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#143B25] text-white font-bold text-[9px] shadow-xs">
                          {discountPercent}% OFF
                        </span>
                      ) : null}

                      {prod.sortBadge === 'trending' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[9px] shadow-xs flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          <span>Hot</span>
                        </span>
                      )}
                    </div>

                    {/* Form Tag Top Right */}
                    {prod.form && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#142B1F] border border-[#DCEFE3] text-[9.5px] font-bold shadow-2xs pointer-events-none">
                        <MiniBadgeItem
                          label={prod.form}
                          imageUrl={getFormImageUrl(prod.form, siteSettings?.categoryAppearance)}
                          appearance={siteSettings?.categoryAppearance}
                          sizePx={11}
                        />
                      </span>
                    )}
                  </div>

                  {/* Card Content with Staggered Natural Content */}
                  <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between space-y-2">
                    <div className="space-y-1">
                      {/* Category Badge with Image */}
                      <div className="text-[9.5px] font-semibold text-[#1E6B47] inline-flex items-center">
                        <MiniBadgeItem
                          label={prod.categoryLabel || prod.category}
                          imageUrl={getCategoryImageUrl(prod.category, categories, siteSettings?.categoryAppearance)}
                          appearance={siteSettings?.categoryAppearance}
                          sizePx={12}
                        />
                      </div>

                      {/* Sanskrit Name if present */}
                      {prod.sanskritName && (
                        <span className="text-[10px] font-serif italic text-[#1E6B47] line-clamp-1 block">
                          {prod.sanskritName}
                        </span>
                      )}

                      {/* Product Name */}
                      <h3 className="font-serif font-bold text-xs sm:text-sm text-[#142B1F] leading-snug group-hover:text-[#1E6B47] transition-colors line-clamp-2">
                        {prod.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 text-[10px] text-[#6B8576]">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-[#142B1F]">{prod.rating}</span>
                        <span>({formatCompactNumber(prod.reviewsCount)})</span>
                      </div>

                      {/* Key Indication Pill (Natural Stagger variation) */}
                      {prod.keyIndications && prod.keyIndications.length > 0 && idx % 2 === 0 && (
                        <p className="text-[10px] text-[#526B5C] bg-[#F4FAF6] px-2 py-1 rounded-lg line-clamp-1 border border-[#DCEFE3]/60 mt-1">
                          🌿 {Array.isArray(prod.keyIndications) ? prod.keyIndications[0] : prod.keyIndications}
                        </p>
                      )}
                    </div>

                    {/* Price and Cart Action */}
                    <div className="pt-2 border-t border-[#EDF5F0] flex items-end justify-between gap-1.5">
                      <div>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-sm sm:text-base text-[#142B1F]">
                            {formatPrice(prod.price)}
                          </span>
                          {prod.mrp > prod.price && (
                            <span className="font-mono text-[10px] text-[#8C8270] line-through">
                              {formatPrice(prod.mrp)}
                            </span>
                          )}
                        </div>

                        {/* B2B Reseller Wholesale Rate if available */}
                        {prod.resellerPrice !== undefined && prod.resellerPrice > 0 && (
                          <span className="text-[9px] font-mono text-[#B4741E] font-bold block">
                            B2B: {formatPrice(prod.resellerPrice)}
                          </span>
                        )}
                      </div>

                      {/* Add to Bag Icon Button */}
                      <button
                        type="button"
                        disabled={!prod.inStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(prod);
                        }}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 ${
                          !prod.inStock
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : isInCart
                            ? 'bg-[#1E6B47] text-white hover:bg-[#143B25]'
                            : 'bg-[#143B25] text-white hover:bg-[#1E6B47] active:scale-90'
                        }`}
                        title={isInCart ? 'Added to Bag' : 'Add to Bag'}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Back Button */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 text-center border-t border-[#DCEFE3]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#14291D] hover:bg-[#1E6B47] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Catalog</span>
        </button>
      </div>
    </div>
  );
};
