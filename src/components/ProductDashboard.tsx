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
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS } from '../data/herbalProducts';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';

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
  onOpenFullSearch?: () => void;
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
  onOpenFullSearch,
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedForm, searchQuery, sortBy, showInStockOnly]);

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

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

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

      {/* Category Filter Tabs with Smooth Tab Indicator (From Reference Image: Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white shadow-emerald-950/20'
              : 'bg-white/80 hover:bg-[#DCF3E7] text-[#143B25] border border-[#DCEFE3]'
          }`}
        >
          All Formulations
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id as ProductCategory)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white shadow-emerald-950/20'
                  : 'bg-white/80 hover:bg-[#DCF3E7] text-[#143B25] border border-[#DCEFE3]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search & Layout Controls Bar with Aurora Glassmorphic Card */}
      <div className="bg-white/90 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-[#DCEFE3] shadow-[0_8px_30px_rgba(20,50,30,0.04)]">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div
            onClick={() => onOpenFullSearch && onOpenFullSearch()}
            className="relative flex-1 cursor-pointer"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#1E6B47]" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              onClick={() => onOpenFullSearch && onOpenFullSearch()}
              placeholder="Search formulations, herbs, Sanskrit, monograph, dosage or price..."
              className="w-full pl-10 pr-10 py-2 bg-[#F6FAF7] hover:bg-[#EEF7F1] border border-[#DCEFE3] hover:border-[#1E6B47]/40 rounded-full text-xs text-[#142B1F] placeholder:text-[#6B8576] focus:outline-hidden transition-all cursor-pointer shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange('');
                }}
                className="absolute right-3 top-2.5 text-[#6B8576] hover:text-[#142B1F] cursor-pointer p-0.5"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Grid vs Table View Mode Switcher from Reference Design */}
            <div className="flex items-center bg-[#F0FAF4] p-1 rounded-full border border-[#DCEFE3]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#143B25] text-white shadow-xs'
                    : 'text-[#143B25] hover:text-[#1E6B47]'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#143B25] text-white shadow-xs'
                    : 'text-[#143B25] hover:text-[#1E6B47]'
                }`}
                title="Clean Table View"
                aria-label="Clean Table View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Minimal & Professional Sort Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSortPopupOpen(true)}
              className={`h-9 px-3.5 bg-white hover:bg-[#F0FAF4] active:bg-[#DCF3E7] border ${
                sortBy !== 'featured'
                  ? 'border-[#1E6B47] ring-1 ring-[#1E6B47]/20 bg-[#F0FAF4]'
                  : 'border-[#DCEFE3]'
              } rounded-full text-xs font-semibold text-[#143B25] flex items-center gap-2 transition-all cursor-pointer shadow-xs group shrink-0`}
              aria-label="Sort catalog formulations"
              title="Sort: Change catalog ordering"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  sortBy !== 'featured' ? 'bg-[#1E6B47] text-white' : 'bg-[#DCF3E7] text-[#1E6B47]'
                }`}
              >
                <ArrowUpDown className="w-3 h-3" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[#6B8576] font-normal hidden md:inline">Sort:</span>
                <span className="font-bold text-[#143B25] truncate max-w-[130px] sm:max-w-none">
                  {currentSortDef.shortLabel}
                </span>
                {currentSortDef.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] hidden sm:inline leading-none">
                    {currentSortDef.badge}
                  </span>
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B8576] ml-0.5 group-hover:text-[#143B25] transition-transform group-hover:translate-y-0.5" />
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-[#6B8576] hover:text-[#143B25] hover:bg-[#F0FAF4] rounded-full border border-[#DCEFE3] text-xs transition-colors cursor-pointer shadow-2xs"
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
      </div>

      {/* Product Display: Clean Table View OR Grid View (From Reference Image) */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#DCEFE3] p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#DCF3E7] text-[#143B25] flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#142B1F]">
            No Formulations Found
          </h3>
          <p className="text-xs sm:text-sm text-[#526B5C] max-w-md mx-auto leading-relaxed">
            We couldn't find any herbal remedies matching your query. Try searching by Sanskrit name, botanical name, therapeutic ailment, or reset the filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="aurora-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Show All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Reference Clean Table View with Subtle Row Hover */
        <div className="space-y-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#DCEFE3] shadow-[0_8px_30px_rgba(20,50,30,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E3EFE7] bg-[#F4FAF6]/70 text-[11px] font-bold uppercase tracking-wider text-[#4A6B56]">
                    <th className="py-3.5 px-4 sm:px-6">Product</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF5F0] text-xs">
                  {paginatedProducts.map((product) => {
                    const priceFormatted = formatPrice(product.price);
                    const isInCart = cartProductIds.has(product.id);
                    return (
                      <tr
                        key={product.id}
                        onClick={() => onOpenProductDetail(product)}
                        className="group hover:bg-[#F2FAF5]/80 transition-colors cursor-pointer"
                      >
                        {/* Product Info */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EE] overflow-hidden shrink-0 border border-[#DCEFE3] relative">
                              <img
                                src={product.image || (product.images && product.images[0]) || ''}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#142B1F] group-hover:text-[#1E6B47] transition-colors truncate max-w-xs">
                                {product.name}
                              </div>
                              <div className="text-[11px] text-[#6B8576] italic truncate">
                                {product.sanskritName || product.categoryLabel || product.category}
                              </div>
                              <div className="text-[10px] text-[#8EA396] mt-0.5">
                                {product.volumeOrWeight} • {product.form}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-[#142B1F] text-sm">
                            {priceFormatted}
                          </div>
                          {product.mrp && product.mrp > product.price && (
                            <div className="text-[10px] text-[#8EA396] line-through">
                              {formatPrice(product.mrp)}
                            </div>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {product.inStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B47] animate-pulse" />
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
                              Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Status (Reference design Active/Draft pill) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF7EE] text-[#1E6B47] border border-[#C6ECD3]">
                            Active
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenProductDetail(product)}
                              className="w-8 h-8 rounded-full border border-[#DCEFE3] bg-white hover:bg-[#DCF3E7] text-[#143B25] flex items-center justify-center transition-colors shadow-2xs"
                              title="View formulation monograph & therapeutic guide"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {product.inStock && (
                              <button
                                type="button"
                                onClick={() => onAddToCart(product)}
                                className={`h-8 px-3.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                  isInCart
                                    ? 'bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1]'
                                    : 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white hover:shadow-md'
                                }`}
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>{isInCart ? 'In Cart' : 'Add to Cart'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reference List / Pagination Controls: Circular & Soft-Pill Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 px-2 flex-wrap gap-3">
              <div className="text-xs text-[#526B5C]">
                Showing page <span className="font-bold text-[#142B1F]">{currentPage}</span> of{' '}
                <span className="font-bold text-[#142B1F]">{totalPages}</span> ({sortedProducts.length} items)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-full border border-[#DCEFE3] bg-white text-[#143B25] hover:bg-[#DCF3E7] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white shadow-xs'
                        : 'bg-white border border-[#DCEFE3] text-[#143B25] hover:bg-[#DCF3E7]'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-full border border-[#DCEFE3] bg-white text-[#143B25] hover:bg-[#DCF3E7] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Reference Grid Card Layout */
        <div className={
          siteSettings?.productCardDisplay?.catalogCardStyle === 'modern'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
        }>
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
