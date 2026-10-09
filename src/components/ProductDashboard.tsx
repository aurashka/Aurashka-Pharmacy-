import React, { useState, useMemo, useEffect } from 'react';
import { HerbalProduct, ProductCategory, CategoryItem, SiteSettings } from '../types/pharmacy';
import { ProductCard } from './ProductCard';
import {
  Search,
  X,
  RefreshCw,
  Tag,
  SlidersHorizontal,
  Plus,
  Settings,
  ShieldAlert,
  Sparkles,
  Flame,
  Trophy,
  Percent,
  Star,
  ArrowUpDown,
  ChevronDown,
  Check,
  RotateCcw,
  TrendingUp,
  BadgePercent,
  Rocket,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from 'lucide-react';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS } from '../data/herbalProducts';
import { formatCompactNumber } from '../utils/numberFormatter';

export type SortOptionKey =
  | 'featured'
  | 'deals'
  | 'trending'
  | 'top_seller'
  | 'rating'
  | 'reseller'
  | 'new_launch'
  | 'price-asc'
  | 'price-desc';

interface SortOptionDef {
  id: SortOptionKey;
  label: string;
  shortLabel: string;
  badge?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SORT_OPTIONS: SortOptionDef[] = [
  {
    id: 'featured',
    label: 'Catalog Order (Admin Set)',
    shortLabel: 'Catalog Order',
    badge: 'Admin Set',
    description: 'Curated herbal formulation order arranged in the Apothecary Admin Panel.',
    icon: Sparkles,
  },
  {
    id: 'deals',
    label: 'Best Deals & Discounts',
    shortLabel: 'Best Deals',
    badge: 'Offers',
    description: 'Formulations with highest promotional savings and apothecary offers.',
    icon: Flame,
  },
  {
    id: 'trending',
    label: 'Trending First',
    shortLabel: 'Trending',
    badge: 'Popular',
    description: 'Herbal remedies with highest patient inquiries and recent activity.',
    icon: TrendingUp,
  },
  {
    id: 'top_seller',
    label: 'Top Sellers',
    shortLabel: 'Top Sellers',
    badge: 'Bestseller',
    description: 'Time-tested Ayurvedic preparations with frequent patient reorders.',
    icon: Trophy,
  },
  {
    id: 'rating',
    label: 'Highest Rated',
    shortLabel: 'Highest Rated',
    badge: '4.8★+',
    description: 'Top-reviewed classical herbs and clinical practitioner ratings.',
    icon: Star,
  },
  {
    id: 'reseller',
    label: 'Reseller Margin Tier',
    shortLabel: 'Reseller Margin',
    badge: 'B2B',
    description: 'Optimized margin tiers for Ayurvedic doctors, Vaidyas, and clinics.',
    icon: BadgePercent,
  },
  {
    id: 'new_launch',
    label: 'New Launches',
    shortLabel: 'New Launches',
    badge: 'Fresh Batch',
    description: 'Freshly formulated apothecary batches and seasonal botanical extracts.',
    icon: Rocket,
  },
  {
    id: 'price-asc',
    label: 'Price: Low to High',
    shortLabel: 'Price: Low to High',
    description: 'Affordable daily wellness remedies, powders, and teas first.',
    icon: ArrowUpNarrowWide,
  },
  {
    id: 'price-desc',
    label: 'Price: High to Low',
    shortLabel: 'Price: High to Low',
    description: 'Premium Rasayanas, Swarna-Bhasmas, and concentrated extracts first.',
    icon: ArrowDownWideNarrow,
  },
];

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
  selectedForm?: string;
  onSelectForm?: (form: string) => void;
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
  selectedForm: externalSelectedForm,
  onSelectForm: externalOnSelectForm,
}) => {
  const [internalSelectedForm, setInternalSelectedForm] = useState<string>('all');
  const selectedForm = externalSelectedForm !== undefined ? externalSelectedForm : internalSelectedForm;
  const setSelectedForm = (newForm: string) => {
    if (externalOnSelectForm) {
      externalOnSelectForm(newForm);
    } else {
      setInternalSelectedForm(newForm);
    }
  };

  const categoryAppearance = siteSettings?.categoryAppearance || {
    showImages: true,
    imagePosition: 'left',
    imageSize: 'medium',
    customImageSizePx: 26,
    imageShape: 'circle',
    allProductsImageUrl: '',
    showAllProductsImage: true,
    allFormsImageUrl: '',
    showAllFormsImage: true,
    formImages: {},
  };

  const showImagesGlobally = categoryAppearance.showImages !== false;
  const imagePosition = categoryAppearance.imagePosition || 'left';
  const imageShape = categoryAppearance.imageShape || 'circle';

  const getImageSizePx = () => {
    switch (categoryAppearance.imageSize) {
      case 'small': return 18;
      case 'large': return 36;
      case 'extra_large': return 46;
      case 'custom': return categoryAppearance.customImageSizePx || 26;
      case 'medium':
      default: return 26;
    }
  };
  const imageSizePx = getImageSizePx();
  const shapeClass = imageShape === 'circle' ? 'rounded-full' : imageShape === 'rounded' ? 'rounded-md' : 'rounded-none';

  const getPillLayoutClass = (hasImage: boolean) => {
    if (!hasImage) return 'flex items-center justify-center';
    switch (imagePosition) {
      case 'top':
        return 'flex flex-col items-center justify-center gap-1 py-1.5 text-center min-w-[62px]';
      case 'bottom':
        return 'flex flex-col-reverse items-center justify-center gap-1 py-1.5 text-center min-w-[62px]';
      case 'right':
        return 'flex flex-row-reverse items-center justify-center gap-1.5';
      case 'left':
      default:
        return 'flex flex-row items-center justify-center gap-1.5';
    }
  };

  const [sortBy, setSortBy] = useState<SortOptionKey>('featured');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);

  const currentSortDef = useMemo(() => {
    return SORT_OPTIONS.find((o) => o.id === sortBy) || SORT_OPTIONS[0];
  }, [sortBy]);

  // Lock body scroll and listen for Escape key when Sort Popup is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSortPopupOpen(false);
      }
    };
    if (isSortPopupOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSortPopupOpen]);

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
    showInStockOnly ||
    sortBy !== 'featured';

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
            {/* Minimal & Professional Sort Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSortPopupOpen(true)}
              className={`h-9 px-3 sm:px-3.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] active:bg-[#EAE2D2] border ${
                sortBy !== 'featured'
                  ? 'border-[#2C5E43] ring-1 ring-[#2C5E43]/20 bg-[#F3F8F5]'
                  : 'border-[#DDD5C5]'
              } rounded-xl text-xs font-medium text-[#2F281E] flex items-center gap-2 transition-all cursor-pointer shadow-2xs group shrink-0`}
              aria-label="Sort catalog formulations"
              title="Sort: Change catalog ordering"
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  sortBy !== 'featured' ? 'bg-[#2C5E43] text-white' : 'bg-[#EAE2D2] text-[#2C5E43]'
                }`}
              >
                <ArrowUpDown className="w-3 h-3" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[#7A705E] font-normal hidden md:inline">Sort:</span>
                <span className="font-semibold text-[#14291D] truncate max-w-[130px] sm:max-w-none">
                  {currentSortDef.shortLabel}
                </span>
                {currentSortDef.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EAE2D2] text-[#4A3D2A] border border-[#D5C9B7] hidden sm:inline leading-none">
                    {currentSortDef.badge}
                  </span>
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8A8070] ml-0.5 group-hover:text-[#14291D] transition-transform group-hover:translate-y-0.5" />
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-[#645A4A] hover:text-[#14291D] hover:bg-[#F2ECE1] rounded-xl border border-[#DDD5C5] text-xs transition-colors cursor-pointer"
                title="Reset filters and restore catalog order"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Curved Popup Card View for Sort Selection */}
        {isSortPopupOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsSortPopupOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full sm:max-w-xl max-h-[90vh] bg-[#FBF9F5] border-t sm:border border-[#DCD5C5] rounded-t-3xl sm:rounded-3xl shadow-2xl text-[#1E2922] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Curved Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#EAE3D4] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#14291D] text-amber-300 flex items-center justify-center shadow-2xs">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-[#14291D]">
                        Sort Formulations
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#695D4A] border border-[#E0D7C6]">
                        Catalog Order
                      </span>
                    </div>
                    <p className="text-[11px] text-[#786D5C] mt-0.5">
                      Choose how products and herbal remedies are arranged in the store
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSortPopupOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#EFEAE0] border border-[#DDD5C5] text-[#554C3E] hover:text-[#14291D] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close sort popup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Card View Grid */}
              <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-3 max-h-[62vh] scrollbar-thin">
                <div className="text-[11px] font-semibold text-[#8A7E6B] uppercase tracking-wider flex items-center justify-between">
                  <span>Select Ordering Preference</span>
                  <span className="text-[10px] font-normal normal-case">
                    {SORT_OPTIONS.length} ordering modes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.id;
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsSortPopupOpen(false);
                        }}
                        className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-left group ${
                          isSelected
                            ? 'bg-white border-[#14291D] ring-2 ring-[#14291D]/15 shadow-sm'
                            : 'bg-white hover:bg-[#FAF8F5] border-[#E2DAD0] hover:border-[#2C5E43]/40 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-[#14291D] text-amber-300 shadow-2xs'
                                  : 'bg-[#FAF6EE] text-[#2C5E43] group-hover:bg-[#EAE2D2]'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs font-bold leading-tight ${
                                    isSelected ? 'text-[#14291D]' : 'text-[#2F281E]'
                                  }`}
                                >
                                  {opt.label}
                                </span>
                              </div>
                              {opt.badge && (
                                <span
                                  className={`inline-block text-[9.5px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 leading-none ${
                                    isSelected
                                      ? 'bg-[#14291D] text-amber-300'
                                      : 'bg-[#EFE9DC] text-[#5A4D39] border border-[#DDD5C5]'
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Radio / Check indicator */}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-[#14291D] text-white scale-100 ring-2 ring-[#14291D]/20'
                                : 'border border-[#CFC5B4] bg-[#FAF8F5] group-hover:border-[#2C5E43]'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#2C5E43]/30" />
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-[#716757] leading-relaxed pl-10.5">
                          {opt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Curved Footer */}
              <div className="px-5 py-3.5 bg-white border-t border-[#EAE3D4] flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('featured');
                    setIsSortPopupOpen(false);
                  }}
                  className="text-xs font-medium text-[#645A4A] hover:text-[#14291D] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#887E6D]" />
                  <span>Reset to Catalog Order (Admin Set)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSortPopupOpen(false)}
                  className="px-4 py-2 bg-[#14291D] hover:bg-[#224430] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Categories Strip (Admin can add/edit/delete categories & set custom images) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              const isAll = cat.id === 'all';
              const rawImgUrl = isAll ? (cat.imageUrl || categoryAppearance.allProductsImageUrl) : cat.imageUrl;
              const isItemShow = isAll
                ? (cat.showImage !== false && (categoryAppearance.showAllProductsImage ?? true))
                : (cat.showImage !== false);
              const shouldShowImage = showImagesGlobally && isItemShow && Boolean(rawImgUrl);
              const layoutClasses = getPillLayoutClass(Boolean(shouldShowImage));

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${layoutClasses} ${
                    active
                      ? 'bg-[#14291D] text-white shadow-xs ring-1 ring-[#14291D]'
                      : 'bg-[#FAF8F5] text-[#554C3E] hover:bg-[#EFEAE0] border border-[#E7DFD1]'
                  }`}
                >
                  {shouldShowImage && (
                    <img
                      src={rawImgUrl}
                      alt={cat.label}
                      style={{ width: `${imageSizePx}px`, height: `${imageSizePx}px` }}
                      className={`${shapeClass} object-cover shrink-0 shadow-2xs border border-white/20`}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Formulation Forms Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 border-t border-[#F2ECE1] scrollbar-none text-[11px]">
            <span className="text-[#887E6D] font-medium shrink-0">Form:</span>
            {(() => {
              const isAllActive = selectedForm === 'all';
              const allImgUrl = categoryAppearance.allFormsImageUrl;
              const shouldShowAllImg = showImagesGlobally && (categoryAppearance.showAllFormsImage !== false) && Boolean(allImgUrl);
              const allFormLayout = getPillLayoutClass(Boolean(shouldShowAllImg));
              const formImgSizePx = Math.max(16, Math.round(imageSizePx * 0.85));

              return (
                <button
                  onClick={() => setSelectedForm('all')}
                  className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${allFormLayout} ${
                    isAllActive
                      ? 'bg-[#2C5E43] text-white shadow-xs'
                      : 'bg-white text-[#554C3E] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {shouldShowAllImg && (
                    <img
                      src={allImgUrl}
                      alt="All Forms"
                      style={{ width: `${formImgSizePx}px`, height: `${formImgSizePx}px` }}
                      className={`${shapeClass} object-cover shrink-0 shadow-2xs`}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span>All Forms</span>
                </button>
              );
            })()}

            {forms.map((f) => {
              const active = selectedForm === f;
              const formConfig = categoryAppearance.formImages?.[f];
              const fImgUrl = formConfig?.imageUrl;
              const shouldShowFImg = showImagesGlobally && (formConfig?.showImage !== false) && Boolean(fImgUrl);
              const fLayout = getPillLayoutClass(Boolean(shouldShowFImg));
              const formImgSizePx = Math.max(16, Math.round(imageSizePx * 0.85));

              return (
                <button
                  key={f}
                  onClick={() => setSelectedForm(f)}
                  className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${fLayout} ${
                    active
                      ? 'bg-[#2C5E43] text-white shadow-xs'
                      : 'bg-white text-[#554C3E] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {shouldShowFImg && (
                    <img
                      src={fImgUrl}
                      alt={f}
                      style={{ width: `${formImgSizePx}px`, height: `${formImgSizePx}px` }}
                      className={`${shapeClass} object-cover shrink-0 shadow-2xs`}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span>{f}</span>
                </button>
              );
            })}
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
