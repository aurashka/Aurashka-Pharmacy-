import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HerbalProduct, ProductCategory, CategoryItem, SiteSettings } from '../types/pharmacy';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './ShimmerSkeletons';
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
  ArrowRight,
  Leaf,
  Filter,
  Layers
} from 'lucide-react';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS } from '../data/herbalProducts';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { getCategoryImageUrl, getFormImageUrl, MiniBadgeItem } from '../utils/categoryImageHelper';

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
  isLoading?: boolean;
  onViewAllProducts?: () => void;
  hideCategoryAndFormStrips?: boolean;
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
  isLoading = false,
  onViewAllProducts,
  hideCategoryAndFormStrips = false,
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

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [sortMenuPlacement, setSortMenuPlacement] = useState<'left' | 'right'>('left');

  // Measure Sort popup placement to ensure it always stays inside visible screen region and aligns cleanly with the button
  useEffect(() => {
    if (isSortPopupOpen && sortMenuRef.current) {
      const rect = sortMenuRef.current.getBoundingClientRect();
      const popupWidth = 300;
      const windowWidth = window.innerWidth;
      const padding = 16;

      if (rect.left + popupWidth <= windowWidth - padding) {
        setSortMenuPlacement('left');
      } else {
        setSortMenuPlacement('right');
      }
    }
  }, [isSortPopupOpen]);

  // Close floating sort menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setIsSortPopupOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSortPopupOpen(false);
      }
    };
    if (isSortPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
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

        <div className="flex items-center gap-3 shrink-0">
          {onViewAllProducts && (
            <button
              type="button"
              onClick={onViewAllProducts}
              className="text-xs sm:text-sm font-semibold text-[#1E6B47] hover:text-[#143B25] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all products</span>
              <span>→</span>
            </button>
          )}

          <div className="text-xs text-[#635A4B] font-medium hidden sm:flex items-center gap-1">
            <span className="font-bold text-[#14291D] tabular-nums" title={`${sortedProducts.length} formulations`}>
              ({formatCompactNumber(sortedProducts.length)})
            </span>
          </div>
        </div>
      </div>

      {/* Search & Layout Controls Bar with Aurora Glassmorphic Card (relative z-40 ensures floating menus sit strictly above all cards) */}
      <div className="relative z-40 bg-white/90 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-[#DCEFE3] shadow-[0_8px_30px_rgba(20,50,30,0.04)]">
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

            {/* Minimalist Floating Catalog Order Menu */}
            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => setIsSortPopupOpen(!isSortPopupOpen)}
                className={`h-9 px-3.5 bg-white hover:bg-[#F0FAF4] active:bg-[#DCF3E7] border ${
                  sortBy !== 'featured'
                    ? 'border-[#1E6B47] ring-1 ring-[#1E6B47]/20 bg-[#F0FAF4]'
                    : 'border-[#DCEFE3]'
                } rounded-full text-xs font-semibold text-[#143B25] flex items-center gap-2 transition-all cursor-pointer shadow-xs group shrink-0`}
                aria-label="Sort catalog formulations"
                title="Sort: Change catalog ordering"
                aria-expanded={isSortPopupOpen}
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
                <ChevronDown className={`w-3.5 h-3.5 text-[#6B8576] ml-0.5 transition-transform duration-200 ${isSortPopupOpen ? 'rotate-180 text-[#143B25]' : 'group-hover:text-[#143B25]'}`} />
              </button>

              {/* Minimalist Floating Dropdown Popover (dynamically placed so it stays in visible region and never shifts awkwardly to the left) */}
              {isSortPopupOpen && (
                <div
                  className={`absolute top-full mt-2 w-[270px] sm:w-80 max-w-[calc(100vw-24px)] bg-white/95 backdrop-blur-xl border border-[#DCEFE3] rounded-2xl shadow-[0_20px_50px_rgba(20,50,30,0.22)] p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 space-y-1 ${
                    sortMenuPlacement === 'left' ? 'left-0 right-auto' : 'right-0 left-auto'
                  }`}
                >
                  <div className="px-3 py-2 border-b border-[#EAF4ED] flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#143B25] flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#1E6B47]" />
                      Catalog Order
                    </span>
                    <span className="text-[10px] text-[#6B8576] font-medium">
                      {SORT_OPTIONS.length} options
                    </span>
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto space-y-0.5 scrollbar-thin">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.id;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.id);
                            setIsSortPopupOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer group ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white font-semibold shadow-xs'
                              : 'text-[#142B1F] hover:bg-[#F0FAF4] hover:text-[#143B25]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E6B47] group-hover:bg-[#DCF3E7]'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs truncate leading-tight">{opt.label}</p>
                              <p className={`text-[10px] truncate leading-tight mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#6B8576]'}`}>{opt.description}</p>
                            </div>
                          </div>
                          {isSelected ? (
                            <Check className="w-4 h-4 text-emerald-200 shrink-0 ml-2" />
                          ) : opt.badge ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#786D5C] border border-[#E0D7C6] shrink-0 ml-2">
                              {opt.badge}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  {sortBy !== 'featured' && (
                    <div className="pt-1.5 border-t border-[#EAF4ED] px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('featured');
                          setIsSortPopupOpen(false);
                        }}
                        className="w-full text-center text-xs text-[#6B8576] hover:text-[#143B25] py-1 cursor-pointer font-medium flex items-center justify-center gap-1.5 hover:bg-[#F0FAF4] rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to Default Order</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

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

        {/* 1, 2, 3 Filter Strips: Category, Form & Quick Sort (Hidden on home page per user request, clean view) */}
        {!hideCategoryAndFormStrips && (
          <>
            {/* 1. Category Pills Bar (Horizontal Scroll with native app smooth glide) */}
            <div className="pt-3 border-t border-[#EDF5F0]">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#143B25] flex items-center gap-1.5">
                  <Leaf className="w-3 h-3 text-[#1E6B47]" />
                  <span>Apothecary Categories</span>
                </span>
                <span className="text-[10px] text-[#6B8576] font-medium hidden sm:inline">
                  Swipe to explore categories
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x">
                {/* All Categories Option */}
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F0FAF4] text-[#142B1F] border border-[#DCEFE3] hover:border-[#1E6B47]/40'
                  }`}
                >
                  <MiniBadgeItem
                    label="All Formulations"
                    imageUrl={getCategoryImageUrl('all', categories, siteSettings?.categoryAppearance)}
                    appearance={siteSettings?.categoryAppearance}
                    sizePx={16}
                  />
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-[#EBF5EE] text-[#1E6B47]'
                  }`}>
                    {products.length}
                  </span>
                </button>

                {/* Dynamic Categories */}
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = products.filter((p) => p.category === cat.id).length;
                  const catImageUrl = getCategoryImageUrl(cat.id, categories, siteSettings?.categoryAppearance);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onSelectCategory(cat.id as ProductCategory)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white shadow-xs'
                          : 'bg-white hover:bg-[#F0FAF4] text-[#142B1F] border border-[#DCEFE3] hover:border-[#1E6B47]/40'
                      }`}
                    >
                      <MiniBadgeItem
                        label={cat.label}
                        imageUrl={catImageUrl}
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

            {/* 2. Physical Ayurvedic Forms Filter Strip */}
            {forms && forms.length > 0 && (
              <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar touch-pan-x">
                <span className="text-[10.5px] font-bold text-[#6B8576] shrink-0 mr-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#1E6B47]" />
                  <span>Form:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedForm('all')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                    selectedForm === 'all'
                      ? 'bg-[#1E6B47] text-white font-bold shadow-2xs'
                      : 'bg-[#F4FAF6] hover:bg-[#E8F5ED] text-[#2C4836] border border-[#DCEFE3]'
                  }`}
                >
                  <MiniBadgeItem
                    label="All Forms"
                    imageUrl={getFormImageUrl('all', siteSettings?.categoryAppearance)}
                    appearance={siteSettings?.categoryAppearance}
                    sizePx={13}
                  />
                </button>
                {forms.map((form) => {
                  const isSelected = selectedForm === form;
                  const formImageUrl = getFormImageUrl(form, siteSettings?.categoryAppearance);
                  return (
                    <button
                      key={form}
                      type="button"
                      onClick={() => setSelectedForm(form)}
                      className={`px-2.5 py-1 rounded-full text-[11px] transition-all shrink-0 cursor-pointer capitalize ${
                        isSelected
                          ? 'bg-[#1E6B47] text-white font-bold shadow-2xs'
                          : 'bg-[#F4FAF6] hover:bg-[#E8F5ED] text-[#2C4836] border border-[#DCEFE3]'
                      }`}
                    >
                      <MiniBadgeItem
                        label={form}
                        imageUrl={formImageUrl}
                        appearance={siteSettings?.categoryAppearance}
                        sizePx={13}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. Quick One-Tap Algorithm Sort & Stock Filter Chips (App-like pills) */}
            <div className="pt-2 border-t border-[#EDF5F0] flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar touch-pan-x">
              <span className="text-[10.5px] font-bold text-[#6B8576] shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#1E6B47]" />
                <span>Quick:</span>
              </span>

              {/* Quick Best Deals */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'deals' ? 'featured' : 'deals')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  sortBy === 'deals'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-[#FEF9EE] hover:bg-[#FEF3C7] text-amber-900 border border-amber-200'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Best Deals</span>
              </button>

              {/* Quick Trending */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'trending' ? 'featured' : 'trending')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  sortBy === 'trending'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-[#EAF7EE] hover:bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1]'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Trending</span>
              </button>

              {/* Quick Top Sellers */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'top_seller' ? 'featured' : 'top_seller')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  sortBy === 'top_seller'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-[#FEF9EE] hover:bg-[#FEF3C7] text-amber-900 border border-amber-200'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>Top Sellers</span>
              </button>

              {/* Quick Highest Rated */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'rating' ? 'featured' : 'rating')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  sortBy === 'rating'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-[#FEF9EE] hover:bg-[#FEF3C7] text-amber-900 border border-amber-200'
                }`}
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>4.8★+ Rated</span>
              </button>

              {/* Quick Reseller Margin Tier */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'reseller' ? 'featured' : 'reseller')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  sortBy === 'reseller'
                    ? 'bg-[#143B25] text-white shadow-2xs'
                    : 'bg-[#EBF5EE] hover:bg-[#DCF3E7] text-[#143B25] border border-[#CCE8D6]'
                }`}
              >
                <BadgePercent className="w-3 h-3 text-[#1E6B47]" />
                <span>B2B Margin</span>
              </button>

              {/* In Stock Only Toggle */}
              <button
                type="button"
                onClick={() => setShowInStockOnly(!showInStockOnly)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  showInStockOnly
                    ? 'bg-[#1E6B47] text-white shadow-2xs'
                    : 'bg-white hover:bg-[#F0FAF4] text-[#142B1F] border border-[#DCEFE3]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showInStockOnly ? 'bg-white' : 'bg-emerald-500'}`} />
                <span>In Stock Only</span>
              </button>

              {/* Reset button if active */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shrink-0 cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Active Filter Chips & Formulation Count Row */}
      <div className="flex items-center justify-between gap-3 text-xs text-[#526B5C] px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#142B1F]">
            Showing <span className="text-[#1E6B47] font-bold">{sortedProducts.length}</span> formulations
          </span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] text-[#12452B] border border-[#BDE8D1] text-[11px] font-medium shadow-2xs">
              <MiniBadgeItem
                label={`Category: ${categories.find(c => c.id === selectedCategory)?.label || selectedCategory}`}
                imageUrl={getCategoryImageUrl(selectedCategory, categories, siteSettings?.categoryAppearance)}
                appearance={siteSettings?.categoryAppearance}
                sizePx={13}
              />
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
                aria-label="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedForm !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] text-[#12452B] border border-[#BDE8D1] text-[11px] font-medium shadow-2xs">
              <MiniBadgeItem
                label={`Form: ${selectedForm}`}
                imageUrl={getFormImageUrl(selectedForm, siteSettings?.categoryAppearance)}
                appearance={siteSettings?.categoryAppearance}
                sizePx={13}
              />
              <button
                type="button"
                onClick={() => setSelectedForm('all')}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
                aria-label="Remove form filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF9EE] text-[#92400E] border border-[#FDE68A] text-[11px] font-medium">
              <span>Search: "{searchQuery}"</span>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {showInStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCF3E7] text-[#12452B] border border-[#BDE8D1] text-[11px] font-medium">
              <span>In Stock Only</span>
              <button
                type="button"
                onClick={() => setShowInStockOnly(false)}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
                aria-label="Remove in stock filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {sortBy !== 'featured' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[11px] font-medium">
              <span>Order: {currentSortDef.shortLabel}</span>
              <button
                type="button"
                onClick={() => setSortBy('featured')}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
                aria-label="Reset sort order"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onViewAllProducts && (
            <button
              type="button"
              onClick={onViewAllProducts}
              className="text-xs font-semibold text-[#1E6B47] hover:text-[#143B25] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all products</span>
              <span>→</span>
            </button>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-[#1E6B47] hover:underline cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Product Display: Shimmer Skeleton during live load OR Clean Table / Grid View */}
      {isLoading ? (
        <ProductGridSkeleton 
          count={6} 
          isModern={siteSettings?.productCardDisplay?.catalogCardStyle === 'modern'} 
        />
      ) : sortedProducts.length === 0 ? (
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
                            <div className="w-12 h-12 rounded-none bg-transparent overflow-hidden shrink-0 border-0 relative flex items-center justify-center">
                              <img
                                src={product.image || (product.images && product.images[0]) || ''}
                                alt={product.name}
                                className="w-full h-full object-contain rounded-none group-hover:scale-105 transition-transform duration-300 bg-transparent"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#142B1F] group-hover:text-[#1E6B47] transition-colors truncate max-w-xs">
                                {product.name}
                              </div>
                              <div className="text-[11px] text-[#6B8576] flex items-center gap-1.5 flex-wrap mt-0.5">
                                <MiniBadgeItem
                                  label={product.categoryLabel || product.category}
                                  imageUrl={getCategoryImageUrl(product.category, categories, siteSettings?.categoryAppearance)}
                                  appearance={siteSettings?.categoryAppearance}
                                  sizePx={12}
                                />
                                {product.sanskritName && (
                                  <span className="italic text-[#1E6B47]">({product.sanskritName})</span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#8EA396] mt-0.5 flex items-center gap-1.5">
                                {product.volumeOrWeight && <span>{product.volumeOrWeight} •</span>}
                                {product.form && (
                                  <MiniBadgeItem
                                    label={product.form}
                                    imageUrl={getFormImageUrl(product.form, siteSettings?.categoryAppearance)}
                                    appearance={siteSettings?.categoryAppearance}
                                    sizePx={11}
                                  />
                                )}
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
