/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { searchProducts } from '../utils/fuzzySearch';
import {
  Search,
  X,
  ArrowLeft,
  Star,
  ShoppingBag,
  Check,
  Plus,
  SlidersHorizontal,
  RotateCcw,
  Eye,
  Tag,
  MessageCircle,
  Layers,
  FlaskConical,
  ChevronDown,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { HerbalProduct, SiteSettings, CategoryItem, ProductCardDisplaySettings } from '../types/pharmacy';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS } from '../data/herbalProducts';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';
import { AuroraGlowBackground } from './AuroraGlowBackground';

interface FullPageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: HerbalProduct[];
  categories?: CategoryItem[];
  forms?: string[];
  onSelectProduct: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  cartProductIds: Set<string>;
  siteSettings: SiteSettings;
  initialQuery?: string;
  cartCount?: number;
  onOpenCart?: () => void;
}

type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'top_seller'
  | 'discount';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Default Catalog Order' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'top_seller', label: 'Top Sellers' },
  { id: 'discount', label: 'Best Discounts' },
];

const DEFAULT_FORM_FALLBACK_IMAGES: Record<string, string> = {
  'Churna (Powder)': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=120&q=80',
  'Vati / Tablet': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=120&q=80',
  'Taila (Oil)': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=120&q=80',
  'Swaras & Asava (Liquid)': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80',
  'Resin & Lehyam': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=120&q=80',
  'Veg Capsule': 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=120&q=80',
  'Kashayam (Decoction)': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=120&q=80',
  'Avaleha (Paste)': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=120&q=80',
  'Ghrita (Herbal Ghee)': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=120&q=80',
};

const ALL_FORMS_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=120&q=80';
const ALL_CATEGORIES_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&q=80';

export const FullPageSearchModal: React.FC<FullPageSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  categories = DEFAULT_CATEGORIES,
  forms = DEFAULT_FORMS,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  siteSettings,
  initialQuery = '',
  cartCount = 0,
  onOpenCart,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isFormMenuOpen, setIsFormMenuOpen] = useState(false);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [sortMenuPlacement, setSortMenuPlacement] = useState<'left' | 'right'>('left');
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const formMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Measure Sort popup placement to ensure it always stays inside visible screen region and aligns cleanly with the button
  useEffect(() => {
    if (isSortPopupOpen && sortMenuRef.current) {
      const rect = sortMenuRef.current.getBoundingClientRect();
      const popupWidth = 260;
      const windowWidth = window.innerWidth;
      const padding = 16;

      // Prefer opening rightwards (left-0) so it does not shift way to the left of the button,
      // as long as it fits inside the visible viewport width
      if (rect.left + popupWidth <= windowWidth - padding) {
        setSortMenuPlacement('left');
      } else {
        setSortMenuPlacement('right');
      }
    }
  }, [isSortPopupOpen]);

  // Category & Form Appearance configured from Admin Panel
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
  const shapeClass =
    imageShape === 'circle'
      ? 'rounded-full'
      : imageShape === 'rounded'
      ? 'rounded-md'
      : 'rounded-none';

  const getPillLayoutClass = (hasImage: boolean) => {
    if (!hasImage) return 'flex items-center justify-center';
    switch (imagePosition) {
      case 'top':
        return 'flex flex-col items-center justify-center gap-1 py-1.5 text-center min-w-[58px]';
      case 'bottom':
        return 'flex flex-col-reverse items-center justify-center gap-1 py-1.5 text-center min-w-[58px]';
      case 'right':
        return 'flex flex-row-reverse items-center justify-center gap-1.5';
      case 'left':
      default:
        return 'flex flex-row items-center justify-center gap-1.5';
    }
  };

  // Product counts per category and form
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const formCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      if (p.form) {
        counts[p.form] = (counts[p.form] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const getFormImageUrl = (formName: string): string => {
    if (formName === 'all') {
      return categoryAppearance.allFormsImageUrl || ALL_FORMS_FALLBACK_IMAGE;
    }
    const config = categoryAppearance.formImages?.[formName];
    if (config?.imageUrl && config.imageUrl.trim().length > 0) {
      return config.imageUrl;
    }
    if (DEFAULT_FORM_FALLBACK_IMAGES[formName]) {
      return DEFAULT_FORM_FALLBACK_IMAGES[formName];
    }
    const matchingProd = products.find((p) => p.form === formName && p.image);
    return matchingProd?.image || ALL_FORMS_FALLBACK_IMAGE;
  };

  const getCategoryImageUrl = (cat: CategoryItem): string => {
    if (cat.id === 'all') {
      return categoryAppearance.allProductsImageUrl || cat.imageUrl || ALL_CATEGORIES_FALLBACK_IMAGE;
    }
    if (cat.imageUrl && cat.imageUrl.trim().length > 0) {
      return cat.imageUrl;
    }
    const matchingProd = products.find((p) => p.category === cat.id && p.image);
    return matchingProd?.image || ALL_CATEGORIES_FALLBACK_IMAGE;
  };

  useEffect(() => {
    if (isOpen) {
      setSearchQuery(initialQuery || '');
      setSelectedCategory('all');
      setSelectedForm('all');
      setSortBy('default');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Handle click outside to close floating menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(target)) {
        setIsCategoryMenuOpen(false);
      }
      if (formMenuRef.current && !formMenuRef.current.contains(target)) {
        setIsFormMenuOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(target)) {
        setIsSortPopupOpen(false);
      }
    };
    if (isCategoryMenuOpen || isFormMenuOpen || isSortPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryMenuOpen, isFormMenuOpen, isSortPopupOpen]);

  // Handle ESC key to close open menus or the full-screen modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isCategoryMenuOpen) {
          setIsCategoryMenuOpen(false);
        } else if (isFormMenuOpen) {
          setIsFormMenuOpen(false);
        } else if (isSortPopupOpen) {
          setIsSortPopupOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCategoryMenuOpen, isFormMenuOpen, isSortPopupOpen, onClose]);

  // Lock body scroll when search modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Filter products by selected category and form
  const categoryAndFormFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (selectedForm !== 'all' && p.form !== selectedForm) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedForm]);

  // Smart fuzzy search matching
  const isQueryActive = searchQuery.trim().length > 0;

  const { matched, suggested } = useMemo(() => {
    if (!isQueryActive) {
      return { matched: [], suggested: [] };
    }
    return searchProducts(categoryAndFormFilteredProducts, searchQuery);
  }, [categoryAndFormFilteredProducts, searchQuery, isQueryActive]);

  // Apply sorting helper
  const applySort = (list: HerbalProduct[]) => {
    const res = [...list];
    if (sortBy === 'price-asc') {
      res.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      res.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      res.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'top_seller') {
      res.sort((a, b) => {
        const aTop = a.sortBadge === 'top_seller' ? 1 : 0;
        const bTop = b.sortBadge === 'top_seller' ? 1 : 0;
        if (aTop !== bTop) return bTop - aTop;
        return b.reviewsCount - a.reviewsCount;
      });
    } else if (sortBy === 'discount') {
      res.sort((a, b) => {
        const discA = a.mrp > a.price ? a.mrp - a.price : 0;
        const discB = b.mrp > b.price ? b.mrp - b.price : 0;
        return discB - discA;
      });
    }
    return res;
  };

  const sortedMatchedProducts = useMemo(() => {
    if (!isQueryActive) return [];
    if (sortBy === 'default') {
      return matched.map((m) => m.product);
    }
    return applySort(matched.map((m) => m.product));
  }, [matched, sortBy, isQueryActive]);

  const defaultList = useMemo(() => {
    return applySort(categoryAndFormFilteredProducts);
  }, [categoryAndFormFilteredProducts, sortBy]);

  const handleAddToCartWithFeedback = (p: HerbalProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(p);
    setAddedAnimationId(p.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1200);
  };

  const handleCardClick = (p: HerbalProduct) => {
    onSelectProduct(p);
    onClose();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedForm('all');
    setSortBy('default');
  };

  if (!isOpen) return null;

  const displaySettings: ProductCardDisplaySettings = siteSettings?.productCardDisplay || {};
  const isModern = displaySettings.searchCardStyle === 'modern';
  const gridLayoutClass = isModern
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4.5'
    : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4';

  return (
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen bg-[#F6FAF7] flex flex-col overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Full-Page Formulation Search"
    >
      {/* Ambient Aurora Glow Effect (Light green, blue, red, yellow) */}
      <AuroraGlowBackground intensity="gentle" />

      {/* 1. Top Search Header with Frosted Glass & Blur */}
      <div className="bg-[#14291D]/90 backdrop-blur-2xl text-white px-3 sm:px-6 py-3.5 sm:py-4 shadow-md shrink-0 border-b border-white/10 relative z-20">
        <div className="max-w-6xl mx-auto flex items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 -ml-1 text-[#DDD5C5] hover:text-white hover:bg-white/10 backdrop-blur-xl rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/15"
            aria-label="Back to catalog"
            title="Back to catalog"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#A5C0AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulations, Sanskrit herbs, ailments, indications..."
              className="w-full bg-white/15 backdrop-blur-xl text-white placeholder-[#B2C7B9] pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-medium border border-white/20 focus:border-amber-300 focus:bg-white/20 focus:outline-none focus:ring-1 focus:ring-amber-300 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A5C0AF] hover:text-white rounded-lg cursor-pointer"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 sm:p-2.5 text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
              aria-label="Open Cart"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-[#14291D] text-[10px] font-bold w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-[#DDD5C5] hover:text-white hover:bg-white/10 backdrop-blur-xl border border-transparent hover:border-white/15 rounded-xl transition-all cursor-pointer"
            aria-label="Close search"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* 2. Sleek Minimalist Filter Bar with Separate Expandable Floating Menus (relative z-50 ensures popovers stay on top of all product cards) */}
      <div className="bg-white/90 backdrop-blur-2xl border-b border-[#DCEFE3] shrink-0 relative z-50 shadow-xs px-3 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          
          {/* Left: Separate Floating Category & Form Triggers */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* A. SEPARATE FLOATING CATEGORY SELECTOR */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryMenuOpen(!isCategoryMenuOpen);
                  setIsFormMenuOpen(false);
                  setIsSortPopupOpen(false);
                }}
                className={`h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
                  selectedCategory !== 'all'
                    ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white border-[#143B25] shadow-emerald-950/20'
                    : 'bg-white hover:bg-[#F0FAF4] text-[#14291D] border-[#DCEFE3]'
                }`}
                title="Filter by category"
                aria-expanded={isCategoryMenuOpen}
              >
                {/* Category Thumbnail Image respecting Admin Settings */}
                {showImagesGlobally && (
                  <div
                    style={{ width: `${Math.min(imageSizePx, 24)}px`, height: `${Math.min(imageSizePx, 24)}px` }}
                    className={`${shapeClass} overflow-hidden shrink-0 border border-black/10 bg-white/30 flex items-center justify-center`}
                  >
                    <img
                      src={
                        selectedCategory === 'all'
                          ? getCategoryImageUrl({ id: 'all', label: 'All Products' })
                          : getCategoryImageUrl(categories.find((c) => c.id === selectedCategory) || { id: selectedCategory, label: selectedCategory })
                      }
                      alt="Category"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  {selectedCategory === 'all'
                    ? 'Category: All'
                    : categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                    selectedCategory !== 'all' ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E6B47]'
                  }`}
                >
                  {categoryCounts[selectedCategory] || products.length}
                </span>
                {selectedCategory !== 'all' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory('all');
                    }}
                    className="p-0.5 hover:bg-white/25 rounded-full cursor-pointer ml-0.5"
                    title="Clear category"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                ) : (
                  <ChevronDown className={`w-3.5 h-3.5 text-[#6B8576] transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180 text-[#143B25]' : ''}`} />
                )}
              </button>

              {/* Floating Category Menu Dropdown (z-[100] ensures it is on top of every card) */}
              {isCategoryMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-[310px] sm:w-[380px] max-w-[calc(100vw-32px)] bg-white/98 backdrop-blur-2xl border border-[#DCEFE3] rounded-3xl shadow-[0_25px_60px_rgba(20,50,30,0.25)] p-3 sm:p-4 space-y-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAF4ED]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#14291D]">Select Category</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#6B8576]">
                      {categories.length} categories
                    </span>
                  </div>

                  <div className="max-h-[58vh] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {/* All Categories Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setIsCategoryMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white shadow-xs'
                          : 'hover:bg-[#F0FAF4] text-[#142B1F]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {showImagesGlobally && (
                          <div
                            style={{ width: `${imageSizePx}px`, height: `${imageSizePx}px` }}
                            className={`${shapeClass} overflow-hidden shrink-0 border border-black/10 bg-stone-100 flex items-center justify-center`}
                          >
                            <img
                              src={getCategoryImageUrl({ id: 'all', label: 'All Products' })}
                              alt="All"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <span className="truncate">All Categories</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                            selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E6B47]'
                          }`}
                        >
                          {products.length}
                        </span>
                        {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-emerald-200" />}
                      </div>
                    </button>

                    {/* Presets / Admin Defined Categories */}
                    {categories
                      .filter((c) => c.id !== 'all')
                      .map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        const catImg = getCategoryImageUrl(cat);
                        const layoutClass = getPillLayoutClass(showImagesGlobally);

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(isSelected ? 'all' : cat.id);
                              setIsCategoryMenuOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-2xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white font-semibold shadow-xs'
                                : 'hover:bg-[#F0FAF4] text-[#142B1F]'
                            }`}
                          >
                            <div className={`${layoutClass} min-w-0`}>
                              {showImagesGlobally && (
                                <div
                                  style={{ width: `${imageSizePx}px`, height: `${imageSizePx}px` }}
                                  className={`${shapeClass} overflow-hidden shrink-0 border border-black/10 bg-stone-100 flex items-center justify-center`}
                                >
                                  <img
                                    src={catImg}
                                    alt={cat.label}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <span className="truncate">{cat.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E6B47]'
                                }`}
                              >
                                {categoryCounts[cat.id] || 0}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-200" />}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* B. SEPARATE FLOATING FORM / SWAROOP SELECTOR */}
            <div className="relative" ref={formMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsFormMenuOpen(!isFormMenuOpen);
                  setIsCategoryMenuOpen(false);
                  setIsSortPopupOpen(false);
                }}
                className={`h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
                  selectedForm !== 'all'
                    ? 'bg-gradient-to-r from-[#1E6B47] to-[#2C5E43] text-white border-[#1E6B47] shadow-emerald-950/20'
                    : 'bg-white hover:bg-[#F0FAF4] text-[#14291D] border-[#DCEFE3]'
                }`}
                title="Filter by formulation form"
                aria-expanded={isFormMenuOpen}
              >
                {/* Form Thumbnail Image */}
                {showImagesGlobally && (
                  <div
                    style={{ width: `${Math.min(imageSizePx, 24)}px`, height: `${Math.min(imageSizePx, 24)}px` }}
                    className={`${shapeClass} overflow-hidden shrink-0 border border-black/10 bg-white/30 flex items-center justify-center`}
                  >
                    <img
                      src={getFormImageUrl(selectedForm)}
                      alt="Form"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <span className="truncate max-w-[120px] sm:max-w-[160px]">
                  {selectedForm === 'all' ? 'Form: All' : selectedForm}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                    selectedForm !== 'all' ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E6B47]'
                  }`}
                >
                  {formCounts[selectedForm] || products.length}
                </span>
                {selectedForm !== 'all' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedForm('all');
                    }}
                    className="p-0.5 hover:bg-white/25 rounded-full cursor-pointer ml-0.5"
                    title="Clear form"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                ) : (
                  <ChevronDown className={`w-3.5 h-3.5 text-[#6B8576] transition-transform duration-200 ${isFormMenuOpen ? 'rotate-180 text-[#143B25]' : ''}`} />
                )}
              </button>

              {/* Floating Form Menu Dropdown (opens inwards on mobile and z-[100] on top of cards) */}
              {isFormMenuOpen && (
                <div className="absolute left-auto right-0 sm:right-auto sm:left-0 top-full mt-2 w-[290px] sm:w-[360px] max-w-[calc(100vw-32px)] bg-white/98 backdrop-blur-2xl border border-[#DCEFE3] rounded-3xl shadow-[0_25px_60px_rgba(20,50,30,0.25)] p-3 sm:p-4 space-y-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAF4ED]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FAF0E1] text-[#B4741E] flex items-center justify-center">
                        <FlaskConical className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#14291D]">Select Form / Swaroop</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#6B8576]">
                      {forms.length} forms
                    </span>
                  </div>

                  <div className="max-h-[58vh] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {/* All Forms Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedForm('all');
                        setIsFormMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        selectedForm === 'all'
                          ? 'bg-gradient-to-r from-[#1E6B47] to-[#2C5E43] text-white shadow-xs'
                          : 'hover:bg-[#F0FAF4] text-[#142B1F]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {showImagesGlobally && (
                          <div
                            style={{ width: `${imageSizePx}px`, height: `${imageSizePx}px` }}
                            className={`${shapeClass} overflow-hidden shrink-0 border border-black/10 bg-stone-100 flex items-center justify-center`}
                          >
                            <img
                              src={getFormImageUrl('all')}
                              alt="All"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <span className="truncate">All Forms</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                            selectedForm === 'all' ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E6B47]'
                          }`}
                        >
                          {products.length}
                        </span>
                        {selectedForm === 'all' && <Check className="w-3.5 h-3.5 text-emerald-200" />}
                      </div>
                    </button>

                    {/* Presets / Admin Defined Forms */}
                    {forms
                      .filter((f) => f !== 'all')
                      .map((formName) => {
                        const isSelected = selectedForm === formName;
                        const formImg = getFormImageUrl(formName);

                        return (
                          <button
                            key={formName}
                            type="button"
                            onClick={() => {
                              setSelectedForm(isSelected ? 'all' : formName);
                              setIsFormMenuOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-2xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#1E6B47] to-[#2C5E43] text-white font-semibold shadow-xs'
                                : 'hover:bg-[#F0FAF4] text-[#142B1F]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {showImagesGlobally && (
                                <div
                                  style={{ width: `${imageSizePx}px`, height: `${imageSizePx}px` }}
                                  className={`${shapeClass} overflow-hidden shrink-0 border border-black/10 bg-stone-100 flex items-center justify-center`}
                                >
                                  <img
                                    src={formImg}
                                    alt={formName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <span className="truncate">{formName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E6B47]'
                                }`}
                              >
                                {formCounts[formName] || 0}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-200" />}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right: Separate Floating Sort Menu & Quick Reset */}
          <div className="flex items-center gap-2">
            
            {/* C. FLOATING SORT DROPDOWN */}
            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSortPopupOpen(!isSortPopupOpen);
                  setIsCategoryMenuOpen(false);
                  setIsFormMenuOpen(false);
                }}
                className={`h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                  sortBy !== 'default'
                    ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                    : 'bg-white hover:bg-[#F0FAF4] text-[#14291D] border-[#DCEFE3]'
                }`}
                title="Sort formulations"
                aria-expanded={isSortPopupOpen}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="font-bold truncate max-w-[100px] sm:max-w-[130px]">
                  {SORT_OPTIONS.find((s) => s.id === sortBy)?.label.replace('Default Catalog Order', 'Default') || 'Sort'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#6B8576] transition-transform duration-200 ${isSortPopupOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Sort Dropdown Popover (dynamically placed so it stays in visible region and never shifts awkwardly to the left) */}
              {isSortPopupOpen && (
                <div
                  className={`absolute top-full mt-2 w-64 max-w-[calc(100vw-24px)] bg-white/98 backdrop-blur-2xl border border-[#DCEFE3] rounded-2xl shadow-[0_25px_60px_rgba(20,50,30,0.25)] p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 space-y-1 ${
                    sortMenuPlacement === 'left' ? 'left-0 right-auto' : 'right-0 left-auto'
                  }`}
                >
                  <div className="px-2.5 py-1.5 border-b border-[#EAF4ED] flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#14291D]">
                      Sort Catalog
                    </span>
                    <span className="text-[10px] text-[#6B8576]">
                      {SORT_OPTIONS.length} modes
                    </span>
                  </div>
                  <div className="py-1 space-y-0.5">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.id);
                            setIsSortPopupOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white font-semibold'
                              : 'text-[#142B1F] hover:bg-[#F0FAF4]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-200" />}
                        </button>
                      );
                    })}
                  </div>
                  {sortBy !== 'default' && (
                    <div className="pt-1 border-t border-[#EAF4ED]">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('default');
                          setIsSortPopupOpen(false);
                        }}
                        className="w-full text-center text-xs text-[#6B8576] hover:text-[#14291D] py-1 cursor-pointer font-medium flex items-center justify-center gap-1 hover:bg-[#F0FAF4] rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Sort</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Reset All Filters Button */}
            {(selectedCategory !== 'all' || selectedForm !== 'all' || sortBy !== 'default' || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-9 px-2.5 sm:px-3 text-xs font-semibold text-[#6B8576] hover:text-[#14291D] bg-white hover:bg-[#F0FAF4] rounded-full border border-[#DCEFE3] shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

          </div>
        </div>

        {/* Active Filter Chips (Clean & Minimalist 1-Line Status) */}
        {(selectedCategory !== 'all' || selectedForm !== 'all') && (
          <div className="max-w-6xl mx-auto pt-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[10px] font-bold text-[#6B8576] uppercase tracking-wider">Active:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#14291D] text-white shadow-xs">
                <span>Category: {categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="p-0.5 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                  title="Clear category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedForm !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1E6B47] text-white shadow-xs">
                <span>Form: {selectedForm}</span>
                <button
                  type="button"
                  onClick={() => setSelectedForm('all')}
                  className="p-0.5 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                  title="Clear form filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedForm('all');
              }}
              className="text-[11px] font-medium text-[#6B8576] hover:text-[#14291D] hover:underline cursor-pointer ml-1"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Products Grid */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          {/* Case 1: When Query is Active */}
          {isQueryActive ? (
            <>
              {sortedMatchedProducts.length > 0 ? (
                <div className="space-y-4">
                  <div className={gridLayoutClass}>
                    {sortedMatchedProducts.map((product) => (
                      <SearchProductCard
                        key={product.id}
                        product={product}
                        isInCart={cartProductIds.has(product.id)}
                        isAddedAnim={addedAnimationId === product.id}
                        onCardClick={() => handleCardClick(product)}
                        onAddToCart={(e) => handleAddToCartWithFeedback(product, e)}
                        displaySettings={displaySettings}
                        siteSettings={siteSettings}
                      />
                    ))}
                  </div>

                  {/* Suggested Products Below */}
                  {suggested.length > 0 && (
                    <div className="pt-6 border-t border-[#EAE3D4] space-y-3">
                      <h4 className="text-xs font-bold text-[#7A705E] uppercase tracking-wider">
                        Suggested Products
                      </h4>
                      <div className={gridLayoutClass}>
                        {suggested.slice(0, 8).map((product) => (
                          <SearchProductCard
                            key={product.id}
                            product={product}
                            isInCart={cartProductIds.has(product.id)}
                            isAddedAnim={addedAnimationId === product.id}
                            onCardClick={() => handleCardClick(product)}
                            onAddToCart={(e) => handleAddToCartWithFeedback(product, e)}
                            displaySettings={displaySettings}
                            siteSettings={siteSettings}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-[#EAE3D4] rounded-2xl p-8 text-center space-y-3">
                  <h4 className="text-sm font-semibold text-[#14291D]">
                    No formulations found
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-1.5 bg-[#14291D] text-white rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Case 2: When Query is Empty -> Show filtered products */
            <div>
              {defaultList.length > 0 ? (
                <div className={gridLayoutClass}>
                  {defaultList.map((product) => (
                    <SearchProductCard
                      key={product.id}
                      product={product}
                      isInCart={cartProductIds.has(product.id)}
                      isAddedAnim={addedAnimationId === product.id}
                      onCardClick={() => handleCardClick(product)}
                      onAddToCart={(e) => handleAddToCartWithFeedback(product, e)}
                      displaySettings={displaySettings}
                      siteSettings={siteSettings}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#EAE3D4] rounded-2xl p-8 text-center space-y-3">
                  <h4 className="text-sm font-semibold text-[#14291D]">
                    No formulations found in this category
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-1.5 bg-[#14291D] text-white rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Show All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component: Search Product Card supporting Classic & Modern Showcase Style
interface SearchProductCardProps {
  product: HerbalProduct;
  isInCart: boolean;
  isAddedAnim: boolean;
  onCardClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
  displaySettings?: ProductCardDisplaySettings;
  siteSettings?: SiteSettings;
}

const SearchProductCard: React.FC<SearchProductCardProps> = ({
  product,
  isInCart,
  isAddedAnim,
  onCardClick,
  onAddToCart,
  displaySettings,
  siteSettings,
}) => {
  const discountPercent =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const isModern = displaySettings?.searchCardStyle === 'modern';
  const showImage = displaySettings?.showImage !== false;
  const showName = displaySettings?.showName !== false;
  const showSanskritName = displaySettings?.showSanskritName !== false;
  const showPrice = displaySettings?.showPrice !== false;
  const showResellerPrice = displaySettings?.showResellerPrice !== false;
  const showMrpAndOffer = displaySettings?.showMrpAndOffer !== false;
  const showTag = displaySettings?.showTag !== false;
  const showRating = displaySettings?.showRating !== false;
  const showAddToCart = displaySettings?.showAddToCart !== false;
  const showQuickView = displaySettings?.showQuickView !== false;
  const showSeller = displaySettings?.showSeller !== false;
  const showVolume = displaySettings?.showVolume !== false;
  const showTagline = displaySettings?.showTagline !== false;
  const showWhatsApp = displaySettings?.showWhatsApp !== false;

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
      undefined,
      includeUserInfo
    );
    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  {/* MODERN ATTACHED IMAGE STYLE (Left Content: Rating, Name, Price, Buy + Right Full Image) */}
  if (isModern) {
    return (
      <div
        onClick={onCardClick}
        className="w-full bg-white/85 hover:bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/80 hover:border-white shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] flex flex-row justify-between transition-all duration-300 cursor-pointer group relative overflow-hidden min-h-[165px] sm:min-h-[185px]"
      >
        {/* Left Column: Details & Actions */}
        <div className="flex-1 p-3 sm:p-3.5 flex flex-col justify-between min-w-0 pr-2">
          <div className="space-y-1">
            {/* Top Row: Star Rating & Tag */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {showRating && (
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs text-[#14291D] ml-1">
                    {product.rating ? product.rating.toFixed(1) : '4.9'}
                  </span>
                  <span className="text-stone-300 mx-0.5">·</span>
                  <span className="text-[10px] text-[#716858]">
                    ({formatCompactNumber(product.reviewsCount || 100)})
                  </span>
                </div>
              )}

              {showTag && product.sortBadge && product.sortBadge !== 'none' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#14291D]/10 text-[#14291D] capitalize shrink-0">
                  <Tag className="w-2.5 h-2.5 text-[#B4741E]" />
                  <span>{product.sortBadge.replace('_', ' ')}</span>
                </span>
              )}
            </div>

            {/* Product Name */}
            {showName && (
              <h4 className="font-serif text-xs sm:text-sm font-bold text-[#14291D] group-hover:text-emerald-900 transition-colors line-clamp-2 leading-tight">
                {product.name}
              </h4>
            )}

            {/* Sanskrit Name */}
            {showSanskritName && product.sanskritName && (
              <p className="text-[10px] font-serif text-[#2C5E43] italic line-clamp-1">
                ({product.sanskritName})
              </p>
            )}

            {/* Seller / Brand */}
            {showSeller && (
              <div className="flex items-center gap-1 text-[10px] text-[#2C5E43] font-medium truncate">
                <span className="text-[#8C8270] text-[9.5px]">Seller:</span>
                <span className="font-semibold truncate">
                  {product.brand || product.sellerName || siteSettings?.brandName || 'Shree Ayur Pharma'}
                </span>
              </div>
            )}

            {/* Volume / Pack Size */}
            {showVolume && product.volumeOrWeight && (
              <div className="text-[9.5px] text-stone-500 font-medium truncate">
                {product.volumeOrWeight}
              </div>
            )}

            {/* Tagline / Indications */}
            {showTagline && (product.tagline || (product.keyIndications && product.keyIndications.length > 0)) && (
              <p className="text-[10.5px] text-[#716757] line-clamp-1 leading-snug">
                {product.tagline || product.keyIndications?.join(', ')}
              </p>
            )}
          </div>

          {/* Bottom Area: Pricing & Buy Button */}
          <div className="mt-2 space-y-1.5">
            {(showPrice || showMrpAndOffer || (showResellerPrice && product.resellerPrice)) && (
              <div className="pt-1.5 border-t border-white/60">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  {showPrice && (
                    <span className="font-mono font-bold text-sm sm:text-base text-[#14291D]">
                      ₹{product.price}
                    </span>
                  )}
                  {showMrpAndOffer && product.mrp > product.price && (
                    <span className="font-mono text-[10.5px] text-[#8C8270] line-through">
                      ₹{product.mrp}
                    </span>
                  )}
                </div>

                {showResellerPrice && product.resellerPrice && product.resellerPrice > 0 && (
                  <div className="mt-0.5 text-[9.5px] bg-[#E7EFEA] text-[#183624] px-1.5 py-0.5 rounded font-mono font-semibold truncate border border-[#B5D6C4]/60">
                    Reseller: {formatPrice(product.resellerPrice)}
                  </div>
                )}
              </div>
            )}

            {/* Buy Action Buttons with High Blur Frosted Glass */}
            {(showAddToCart || showQuickView) && (
              <div className="flex items-center gap-1.5">
                {showAddToCart && (
                  <button
                    type="button"
                    onClick={onAddToCart}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs backdrop-blur-xl border border-white/25 active:scale-95 ${
                      isAddedAnim
                        ? 'bg-emerald-600/90 text-white'
                        : isInCart
                        ? 'bg-emerald-800/90 text-white hover:bg-emerald-900'
                        : 'bg-[#14291D]/90 hover:bg-[#14291D] text-white hover:shadow-md'
                    }`}
                  >
                    {isAddedAnim ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Added!</span>
                      </>
                    ) : isInCart ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>In Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                        <span>Buy</span>
                      </>
                    )}
                  </button>
                )}

                {showWhatsApp && (
                  <button
                    type="button"
                    onClick={handleWhatsAppConsult}
                    className="p-1.5 rounded-xl border border-white/80 text-emerald-800 bg-white/85 hover:bg-[#25D366] hover:text-white backdrop-blur-xl transition-all cursor-pointer shrink-0 shadow-xs"
                    title="WhatsApp Consult / Order"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                )}

                {showQuickView && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardClick();
                    }}
                    className="p-1.5 rounded-xl border border-white/80 text-[#554B3B] bg-white/85 hover:bg-white backdrop-blur-xl transition-all cursor-pointer shadow-xs"
                    title="View Monograph"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Image */}
        {showImage && (
          <div className="w-[110px] sm:w-[130px] md:w-[145px] shrink-0 relative bg-linear-to-b from-[#FAF8F5]/80 via-[#F4EEE4]/80 to-[#ECE5D8]/80 overflow-hidden flex items-center justify-center border-l border-white/60">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Discount Badge on Image */}
            {showMrpAndOffer && discountPercent > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#B4741E] text-white shadow-xs">
                  {discountPercent}% OFF
                </span>
              </div>
            )}

            {product.form && (
              <div className="absolute bottom-2 right-2 z-10">
                <span className="px-1.5 py-0.5 rounded-md bg-white/85 backdrop-blur-md text-[#14291D] border border-white/60 text-[8.5px] font-semibold shadow-xs">
                  {product.form}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  {/* CLASSIC VERTICAL CARD with Frosted White Glass & High Blur */}
  return (
    <div
      onClick={onCardClick}
      className="bg-white/85 hover:bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/80 hover:border-white p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] cursor-pointer group relative overflow-hidden"
    >
      <div>
        {/* Top Image & Badges */}
        {showImage && (
          <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-stone-100/80 mb-2.5 border border-white/60">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Badges Overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {showMrpAndOffer && discountPercent > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-amber-950 font-bold text-[10px] shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
              {showTag && product.sortBadge === 'top_seller' && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#14291D] text-amber-300 font-bold text-[9px] shadow-xs">
                  Bestseller
                </span>
              )}
              {showTag && product.sortBadge === 'trending' && (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-[9px] shadow-xs">
                  Trending
                </span>
              )}
            </div>

            {/* Category / Form Pill on image */}
            {product.form && (
              <div className="absolute bottom-2 right-2 z-10">
                <span className="px-1.5 py-0.5 rounded-md bg-white/85 backdrop-blur-md text-[#14291D] border border-white/60 text-[9px] font-semibold shadow-xs">
                  {product.form || product.category}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Title & Classical Sanskrit Name */}
        <div className="space-y-0.5">
          {showName && (
            <h4 className="font-serif text-sm font-bold text-[#14291D] group-hover:text-emerald-900 transition-colors line-clamp-1">
              {product.name}
            </h4>
          )}
          {showSanskritName && product.sanskritName && (
            <div className="text-[10.5px] font-serif text-[#2C5E43] italic line-clamp-1">
              ({product.sanskritName})
            </div>
          )}
        </div>

        {/* Seller / Brand */}
        {showSeller && (
          <div className="flex items-center gap-1 text-[10px] text-[#2C5E43] font-medium truncate mt-1">
            <span className="text-[#8C8270] text-[9.5px]">Seller:</span>
            <span className="font-semibold truncate">
              {product.brand || product.sellerName || siteSettings?.brandName || 'Shree Ayur Pharma'}
            </span>
          </div>
        )}

        {/* Volume / Pack Size */}
        {showVolume && product.volumeOrWeight && (
          <div className="text-[9.5px] text-stone-500 font-medium truncate mt-0.5">
            {product.volumeOrWeight}
          </div>
        )}

        {/* Tagline */}
        {showTagline && (product.tagline || (product.keyIndications && product.keyIndications.length > 0)) && (
          <p className="text-[11px] text-[#716757] line-clamp-2 mt-1 leading-snug">
            {product.tagline || product.keyIndications?.join(', ')}
          </p>
        )}

        {/* Rating */}
        {showRating && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-[#14291D]">
                {product.rating ? product.rating.toFixed(1) : '4.9'}
              </span>
            </div>
            <span className="text-[10px] text-[#8C8271]">
              ({formatCompactNumber(product.reviewsCount || 100)})
            </span>
          </div>
        )}
      </div>

      {/* Bottom Pricing & Action with High Blur Frosted Buttons */}
      <div className="pt-3 mt-2 border-t border-white/60 space-y-1.5">
        {(showPrice || showMrpAndOffer || (showResellerPrice && product.resellerPrice)) && (
          <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              {showPrice && (
                <span className="text-sm font-bold text-[#14291D] font-mono">
                  ₹{product.price}
                </span>
              )}
              {showMrpAndOffer && product.mrp > product.price && (
                <span className="text-[11px] text-[#8C8270] line-through font-mono">
                  ₹{product.mrp}
                </span>
              )}
            </div>

            {showResellerPrice && product.resellerPrice && product.resellerPrice > 0 && (
              <span className="text-[9.5px] bg-[#E7EFEA] text-[#183624] px-1.5 py-0.5 rounded font-mono font-semibold border border-[#B5D6C4]/60">
                Reseller: {formatPrice(product.resellerPrice)}
              </span>
            )}
          </div>
        )}

        {(showAddToCart || showQuickView) && (
          <div className="flex items-center gap-1.5">
            {showAddToCart && (
              <button
                type="button"
                onClick={onAddToCart}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs backdrop-blur-xl border border-white/25 active:scale-95 ${
                  isAddedAnim
                    ? 'bg-emerald-600/90 text-white'
                    : isInCart
                    ? 'bg-emerald-800/90 text-white hover:bg-emerald-900'
                    : 'bg-[#14291D]/90 hover:bg-[#14291D] text-white hover:shadow-md'
                }`}
                title={isInCart ? 'In Bag - Click to Add More' : 'Add to Bag'}
              >
                {isAddedAnim ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Added!</span>
                  </>
                ) : isInCart ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
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

            {showWhatsApp && (
              <button
                type="button"
                onClick={handleWhatsAppConsult}
                className="p-1.5 rounded-xl border border-white/80 text-emerald-800 bg-white/85 hover:bg-[#25D366] hover:text-white backdrop-blur-xl transition-all cursor-pointer shrink-0 shadow-xs"
                title="WhatsApp Consult / Order"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
            )}

            {showQuickView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCardClick();
                }}
                className="p-1.5 rounded-xl border border-white/80 text-[#554B3B] bg-white/85 hover:bg-white backdrop-blur-xl transition-all cursor-pointer shadow-xs"
                title="View Monograph"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
