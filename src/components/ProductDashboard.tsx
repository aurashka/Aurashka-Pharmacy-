import React, { useState, useMemo } from 'react';
import { HerbalProduct, ProductCategory, CategoryItem, SiteSettings } from '../types/pharmacy';
import { ProductCard } from './ProductCard';
import { Search, X, RefreshCw, Tag, SlidersHorizontal, Plus, Settings, ShieldAlert, Sparkles, Flame, Trophy, Percent, Star } from 'lucide-react';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS } from '../data/herbalProducts';
import { formatCompactNumber } from '../utils/numberFormatter';

interface ProductDashboardProps {
  products: HerbalProduct[];
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenProductDetail: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  cartProductIds: Set<string>;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
  onEditProduct?: (product: HerbalProduct) => void;
  categories?: CategoryItem[];
  forms?: string[];
  siteSettings?: SiteSettings;
}

export const ProductDashboard: React.FC<ProductDashboardProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenProductDetail,
  onAddToCart,
  cartProductIds,
  isAdmin = false,
  onOpenAdminPanel,
  onEditProduct,
  categories = DEFAULT_CATEGORIES,
  forms = DEFAULT_FORMS,
  siteSettings,
}) => {
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'deals' | 'trending' | 'top_seller' | 'rating' | 'reseller' | 'new_launch' | 'price-asc' | 'price-desc'>('featured');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Filtering Logic
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
        const matchesSanskrit = item.sanskritName.toLowerCase().includes(q);
        const matchesTagline = item.tagline.toLowerCase().includes(q);
        const matchesIndications = item.keyIndications.some((ind) => ind.toLowerCase().includes(q));
        const matchesIngredients = item.keyIngredients.some(
          (ing) => ing.herb.toLowerCase().includes(q) || ing.botanicalName.toLowerCase().includes(q)
        );

        if (!matchesName && !matchesSanskrit && !matchesTagline && !matchesIndications && !matchesIngredients) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategory, selectedForm, showInStockOnly, searchQuery]);

  // Sorting Logic: Featured / Admin Order, Trending, Top Sellers, Best Deals, Rating, Reseller Margin, Price
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'featured') {
      list.sort((a, b) => {
        const orderA = a.displayOrder !== undefined ? a.displayOrder : 9999;
        const orderB = b.displayOrder !== undefined ? b.displayOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount);
      });
    } else if (sortBy === 'deals') {
      list.sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price));
    } else if (sortBy === 'trending') {
      list.sort((a, b) => {
        const aTrend = a.sortBadge === 'trending' ? 1 : 0;
        const bTrend = b.sortBadge === 'trending' ? 1 : 0;
        if (aTrend !== bTrend) return bTrend - aTrend;
        return (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount);
      });
    } else if (sortBy === 'top_seller') {
      list.sort((a, b) => {
        const aTop = a.sortBadge === 'top_seller' ? 1 : 0;
        const bTop = b.sortBadge === 'top_seller' ? 1 : 0;
        if (aTop !== bTop) return bTop - aTop;
        return b.reviewsCount - a.reviewsCount;
      });
    } else if (sortBy === 'new_launch') {
      list.sort((a, b) => {
        const aNew = a.sortBadge === 'new_launch' ? 1 : 0;
        const bNew = b.sortBadge === 'new_launch' ? 1 : 0;
        return bNew - aNew;
      });
    } else if (sortBy === 'reseller') {
      list.sort((a, b) => {
        const marginB = (b.price - (b.resellerPrice || b.price));
        const marginA = (a.price - (a.resellerPrice || a.price));
        return marginB - marginA;
      });
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [filteredProducts, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedForm !== 'all' ||
    searchQuery.trim() !== '' ||
    showInStockOnly;

  const handleResetFilters = () => {
    onSelectCategory('all');
    setSelectedForm('all');
    onSearchChange('');
    setShowInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <section id="deals-catalog" className="pt-3 pb-8 sm:pt-4 sm:pb-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-4 sm:space-y-5">
      {/* Anchor alias */}
      <div id="products-catalog" className="-top-20 relative" />

      {/* Main Page Admin Toolbar Banner (Only for user role 'admin') */}
      {isAdmin && (
        <div className="bg-[#FAF6F0] border-2 border-[#B4741E]/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B4741E] text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#14291D] text-sm block">
                Admin Panel Quick Access
              </span>
              <span className="text-[#685D4E]">
                Add custom categories & forms, edit/delete presets, set Reseller prices, rating stars, and sorting badges (Trending, Top Seller, Best Deal).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdminPanel}
              className="px-3.5 py-2 bg-[#14291D] hover:bg-[#224431] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-300" />
              <span>Open Admin Panel</span>
            </button>
            <button
              onClick={onOpenAdminPanel}
              className="px-3.5 py-2 bg-[#B4741E] hover:bg-[#975f15] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Product</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E7DFD1] pb-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14291D]">
            {siteSettings?.catalogSectionTitle || 'Products, Formulations & Apothecary Deals'}
          </h2>
          <p className="text-xs sm:text-sm text-[#615748] mt-0.5">
            {siteSettings?.catalogSectionSubtitle || 'Authentic herbal remedies with retail discounts, verified reseller rates & dosage charts.'}
          </p>
        </div>

        <div className="text-xs text-[#635A4B] font-medium flex items-center gap-2">
          <span className="font-bold text-[#14291D] tabular-nums" title={`${sortedProducts.length} formulations`}>
            {formatCompactNumber(sortedProducts.length)}
          </span> formulations available
        </div>
      </div>

      {/* Streamlined Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#E4DDD0] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#8A8070]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by product, herb (e.g. Ashwagandha, Shilajit), or therapeutic indication..."
              className="w-full pl-9 pr-8 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs text-[#1E2922] placeholder:text-[#8A8070] focus:outline-hidden focus:border-[#2C5E43] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-[#887E6D] hover:text-[#14291D] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-medium text-[#2F281E] focus:outline-hidden focus:border-[#2C5E43]"
            >
              <option value="featured">Sort: Catalog Order (Admin Set)</option>
              <option value="deals">Sort: Best Deals</option>
              <option value="trending">Sort: Trending First</option>
              <option value="top_seller">Sort: Top Sellers</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="reseller">Sort: Reseller Margin</option>
              <option value="new_launch">Sort: New Launches</option>
              <option value="price-asc">Sort: Price: Low to High</option>
              <option value="price-desc">Sort: Price: High to Low</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-[#645A4A] hover:text-[#14291D] hover:bg-[#F2ECE1] rounded-lg border border-[#DDD5C5] text-xs transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Categories Strip (Admin can add/edit/delete categories) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#14291D] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-[#554C3E] hover:bg-[#EFEAE0] border border-[#E7DFD1]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Formulation Forms Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[#F2ECE1] scrollbar-none text-[11px]">
            <span className="text-[#887E6D] font-medium shrink-0">Form:</span>
            <button
              onClick={() => setSelectedForm('all')}
              className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedForm === 'all'
                  ? 'bg-[#2C5E43] text-white'
                  : 'bg-white text-[#554C3E] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
              }`}
            >
              All Forms
            </button>
            {forms.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedForm(f)}
                className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedForm === f
                    ? 'bg-[#2C5E43] text-white'
                    : 'bg-white text-[#554C3E] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E4DDD0] p-10 text-center space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#14291D]">
            No Formulations Found
          </h3>
          <p className="text-xs text-[#635A4B] max-w-sm mx-auto">
            Try adjusting your search query or reset the filter to view all products.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-medium text-white bg-[#14291D] hover:bg-[#203E2D] rounded-lg transition-colors cursor-pointer"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductDetail}
              onAddToCart={onAddToCart}
              isInCart={cartProductIds.has(product.id)}
              isAdmin={isAdmin}
              onEditProduct={onEditProduct}
              siteSettings={siteSettings}
            />
          ))}
        </div>
      )}
    </section>
  );
};
