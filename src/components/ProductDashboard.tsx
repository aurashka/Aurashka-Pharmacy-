import React, { useState, useMemo } from 'react';
import { HerbalProduct, ProductCategory, ProductForm } from '../types/pharmacy';
import { ProductCard } from './ProductCard';
import { Search, X, RefreshCw, Tag, SlidersHorizontal, Plus, Settings, ShieldAlert } from 'lucide-react';

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
}) => {
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'deals'>('deals');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: 'All Products' },
    { id: 'immunity', label: 'Immunity' },
    { id: 'digestion', label: 'Digestion' },
    { id: 'joint_pain', label: 'Joint & Pain' },
    { id: 'mind_sleep', label: 'Mind & Sleep' },
    { id: 'skin_hair', label: 'Skin & Hair' },
    { id: 'vitality', label: 'Vitality' },
  ];

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

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'deals') {
      list.sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
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
    setSortBy('deals');
  };

  return (
    <section id="deals-catalog" className="py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
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
                You can add, edit, or delete every single product text, link, and direct image URL with live Firebase backup.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdminPanel}
              className="px-3.5 py-2 bg-[#14291D] hover:bg-[#224431] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-amber-300" />
              <span>Open Admin Panel</span>
            </button>
            <button
              onClick={onOpenAdminPanel}
              className="px-3.5 py-2 bg-[#B4741E] hover:bg-[#975f15] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Product</span>
            </button>
          </div>
        </div>
      )}

      {/* Clean Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E7DFD1] pb-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14291D]">
            Products & Apothecary Deals
          </h2>
          <p className="text-xs sm:text-sm text-[#615748] mt-0.5">
            Authentic herbal formulations. Click any item for clinical uses, ingredients & dosage.
          </p>
        </div>

        <div className="text-xs text-[#635A4B] font-medium">
          <span className="font-bold text-[#14291D] tabular-nums">{sortedProducts.length}</span> formulations available
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
              placeholder="Search by product, herb (e.g. Ashwagandha, Triphala), or symptom..."
              className="w-full pl-9 pr-8 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs text-[#1E2922] placeholder:text-[#8A8070] focus:outline-hidden focus:border-[#2C5E43] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-[#887E6D] hover:text-[#14291D]"
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
              <option value="deals">Sort: Best Deals</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-[#645A4A] hover:text-[#14291D] hover:bg-[#F2ECE1] rounded-lg border border-[#DDD5C5] text-xs transition-colors"
                title="Reset filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
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
            className="px-4 py-2 text-xs font-medium text-white bg-[#14291D] hover:bg-[#203E2D] rounded-lg transition-colors"
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
            />
          ))}
        </div>
      )}
    </section>
  );
};
