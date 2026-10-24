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
  MessageCircle,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { HerbalProduct, SiteSettings, CategoryItem, ProductCardDisplaySettings } from '../types/pharmacy';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS } from '../data/herbalProducts';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { ProgressiveImage } from './ProgressiveImage';
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
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery(initialQuery || '');
      setSelectedCategory('all');
      setSelectedForm('all');
      setSortBy('default');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 60);
    }
  }, [isOpen, initialQuery]);

  // Click outside listener for category & sort menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(target)) {
        setIsCategoryMenuOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(target)) {
        setIsSortPopupOpen(false);
      }
    };
    if (isCategoryMenuOpen || isSortPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryMenuOpen, isSortPopupOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCategoryMenuOpen) setIsCategoryMenuOpen(false);
        else if (isSortPopupOpen) setIsSortPopupOpen(false);
        else onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isCategoryMenuOpen, isSortPopupOpen, onClose]);

  // Base catalog filter by category and form
  const categoryAndFormFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedForm !== 'all' && p.form !== selectedForm) return false;
      return true;
    });
  }, [products, selectedCategory, selectedForm]);

  const isQueryActive = searchQuery.trim().length > 0;

  // Fuzzy Search Result
  const searchResults = useMemo(() => {
    if (!isQueryActive) {
      return { matchedProducts: categoryAndFormFilteredProducts, suggestedProducts: [] as HerbalProduct[] };
    }
    const res = searchProducts(categoryAndFormFilteredProducts, searchQuery);
    return {
      matchedProducts: res.matched.map((m) => m.product),
      suggestedProducts: res.suggested,
    };
  }, [categoryAndFormFilteredProducts, searchQuery, isQueryActive]);

  const { matchedProducts, suggestedProducts } = searchResults;

  // Sorting logic
  const applySort = (items: HerbalProduct[]) => {
    const list = [...items];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'top_seller':
        return list.sort((a, b) => (b.sortBadge === 'top_seller' ? 1 : 0) - (a.sortBadge === 'top_seller' ? 1 : 0));
      case 'discount':
        return list.sort((a, b) => {
          const discA = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
          const discB = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
          return discB - discA;
        });
      case 'default':
      default:
        return list;
    }
  };

  const sortedMatchedProducts = useMemo(() => {
    if (!isQueryActive) return applySort(matchedProducts);
    return sortBy === 'default' ? matchedProducts : applySort(matchedProducts);
  }, [matchedProducts, sortBy, isQueryActive]);

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
  const totalResultsCount = isQueryActive ? sortedMatchedProducts.length : defaultList.length;

  return (
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen bg-[#F6FAF7] flex flex-col overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Full-Page Formulation Search"
    >
      <AuroraGlowBackground intensity="gentle" />

      {/* 1. TOP HEADER: Back '<', Title 'Search Product', and Cart Icon (Matching Reference Screen 1) */}
      <div className="bg-[#14291D] text-white px-4 sm:px-6 py-3.5 shadow-xs shrink-0 border-b border-[#234D34] relative z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            aria-label="Back to catalog"
            title="Back to catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 className="font-serif text-base sm:text-lg font-bold tracking-tight text-white text-center flex-1">
            Search Product
          </h2>

          <div className="flex items-center gap-2">
            {onOpenCart && (
              <button
                type="button"
                onClick={onOpenCart}
                className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                aria-label="Open Cart"
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

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              aria-label="Close search"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. UNIFIED PILL SEARCH BAR with Category Trigger & Filter Button (Matching Reference Screen 1) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#DCEFE3] shrink-0 relative z-30 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto space-y-2.5">
          <div className="flex items-center gap-2">
            {/* Pill Search Input */}
            <div className="flex-1 bg-[#F4FAF6] border border-[#DCEFE3] focus-within:border-[#1E6B47] focus-within:bg-white rounded-full px-3.5 py-2 flex items-center gap-2.5 transition-all shadow-inner">
              <Search className="w-4 h-4 text-[#1E6B47] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search herbal formulations, Sanskrit herbs, ailments..."
                className="w-full bg-transparent text-[#142B1F] placeholder-[#6B8576] text-xs sm:text-sm font-medium focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-[#6B8576] hover:text-[#142B1F] rounded-full cursor-pointer"
                  aria-label="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Trigger Pill (Matches Reference Screen 1) */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryMenuOpen(!isCategoryMenuOpen);
                  setIsSortPopupOpen(false);
                }}
                className={`h-10 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                  selectedCategory !== 'all'
                    ? 'bg-[#143B25] text-white border-[#143B25]'
                    : 'bg-[#F4FAF6] hover:bg-[#EAF5EE] text-[#142B1F] border-[#DCEFE3]'
                }`}
                title="Select category"
              >
                <Layers className="w-3.5 h-3.5 text-[#1E6B47]" />
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {selectedCategory === 'all'
                    ? 'Categories'
                    : categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Category Dropdown */}
              {isCategoryMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[280px] sm:w-[320px] max-w-[calc(100vw-32px)] bg-white border border-[#DCEFE3] rounded-3xl shadow-[0_20px_50px_rgba(20,50,30,0.2)] p-3 space-y-2 z-[100] animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAF4ED] px-1">
                    <span className="text-xs font-bold text-[#14291D]">Select Category</span>
                    <span className="text-[10px] text-[#6B8576] font-semibold">{categories.length} categories</span>
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setIsCategoryMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-2xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-[#143B25] text-white'
                          : 'hover:bg-[#F0FAF4] text-[#142B1F]'
                      }`}
                    >
                      <span>All Formulations</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-inherit font-bold">
                        {products.length}
                      </span>
                    </button>
                    {categories.filter((c) => c.id !== 'all').map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(isSelected ? 'all' : cat.id);
                            setIsCategoryMenuOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-2xl text-xs flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#143B25] text-white font-semibold'
                              : 'hover:bg-[#F0FAF4] text-[#142B1F]'
                          }`}
                        >
                          <span className="truncate">{cat.label}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E6B47]'} font-bold`}>
                            {categoryCounts[cat.id] || 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Filter / Sort Button (Sliders icon matching reference) */}
            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSortPopupOpen(!isSortPopupOpen);
                  setIsCategoryMenuOpen(false);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
                  sortBy !== 'default' || selectedForm !== 'all'
                    ? 'bg-[#143B25] text-amber-300 border-[#143B25]'
                    : 'bg-[#F4FAF6] hover:bg-[#EAF5EE] text-[#142B1F] border-[#DCEFE3]'
                }`}
                title="Filter & Sort"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#1E6B47]" />
              </button>

              {/* Sort & Form Dropdown */}
              {isSortPopupOpen && (
                <div className="absolute right-0 top-full mt-2 w-[260px] bg-white border border-[#DCEFE3] rounded-3xl shadow-[0_20px_50px_rgba(20,50,30,0.2)] p-3 space-y-2.5 z-[100] animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#EAF4ED] px-1">
                    <span className="text-xs font-bold text-[#14291D]">Sort & Filter</span>
                    <button
                      type="button"
                      onClick={() => setIsSortPopupOpen(false)}
                      className="p-1 text-[#6B8576] hover:text-[#14291D]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsSortPopupOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                          sortBy === opt.id
                            ? 'bg-[#143B25] text-white font-semibold'
                            : 'hover:bg-[#F0FAF4] text-[#142B1F]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-amber-300" />}
                      </button>
                    ))}
                  </div>

                  {/* Form Filter selection inside sort popup */}
                  {forms && forms.length > 0 && (
                    <div className="pt-2 border-t border-[#EAF4ED] space-y-1.5">
                      <span className="text-[11px] font-bold text-[#6B8576] uppercase tracking-wider block">
                        Form / Swaroop:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedForm('all')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            selectedForm === 'all'
                              ? 'bg-[#143B25] text-white border-[#143B25]'
                              : 'bg-white text-[#142B1F] border-[#DCEFE3]'
                          }`}
                        >
                          All
                        </button>
                        {forms.slice(0, 6).map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setSelectedForm(f)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                              selectedForm === f
                                ? 'bg-[#143B25] text-white border-[#143B25]'
                                : 'bg-white text-[#142B1F] border-[#DCEFE3]'
                            }`}
                          >
                            {f.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Counter Heading (e.g. "Found 10 Results" matching reference screen 1) */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EAF4ED]">
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#14291D]">
              Found {totalResultsCount} Results
            </h3>

            {(selectedCategory !== 'all' || selectedForm !== 'all' || sortBy !== 'default' || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#1E6B47] hover:text-[#143B25] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. 2-COLUMN CLEAN RESULTS GRID (Matching Reference Screen 1) */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          {isQueryActive ? (
            <>
              {sortedMatchedProducts.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5">
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

                  {suggestedProducts.length > 0 && (
                    <div className="pt-6 border-t border-[#EAE3D4] space-y-3">
                      <h4 className="text-xs font-bold text-[#7A705E] uppercase tracking-wider">
                        Suggested Formulations
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5">
                        {suggestedProducts.slice(0, 8).map((product) => (
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
                <div className="bg-white border border-[#DCEFE3] rounded-3xl p-8 text-center space-y-3">
                  <h4 className="font-serif text-sm font-semibold text-[#142B1F]">
                    No formulations matched your search
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#143B25] text-white rounded-full text-xs font-bold cursor-pointer"
                  >
                    View All Formulations
                  </button>
                </div>
              )}
            </>
          ) : (
            <div>
              {defaultList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5">
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
                <div className="bg-white border border-[#DCEFE3] rounded-3xl p-8 text-center space-y-3">
                  <h4 className="font-serif text-sm font-semibold text-[#142B1F]">
                    No formulations found in this category
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#143B25] text-white rounded-full text-xs font-bold cursor-pointer"
                  >
                    Show All Formulations
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

// 4. CLEAN SEARCH PRODUCT CARD (Matching Reference Screen 1)
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
  siteSettings,
}) => {
  const discountPercent =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

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

  return (
    <div
      onClick={onCardClick}
      className="bg-white rounded-3xl border border-[#DCEFE3] hover:border-[#1E6B47]/60 p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group relative overflow-hidden"
    >
      <div>
        {/* Centered Product Showcase in soft mint container (Matching reference screen 1) */}
        <div className="relative aspect-square w-full rounded-2xl bg-[#F0FAF4] p-2.5 sm:p-3 flex items-center justify-center overflow-hidden mb-2.5 group-hover:scale-102 transition-transform">
          <ProgressiveImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
          />

          {/* Savings Badge */}
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#143B25] text-white font-bold text-[10px] shadow-xs">
              {discountPercent}% OFF
            </span>
          )}

          {/* Form Tag */}
          {product.form && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[#142B1F] border border-[#DCEFE3] text-[9px] font-semibold shadow-2xs">
              {product.form}
            </span>
          )}

          {/* Star Rating Overlay */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold text-[#14291D] flex items-center gap-1 shadow-2xs border border-[#DCEFE3]/50">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating ? product.rating.toFixed(1) : '4.9'}</span>
          </div>
        </div>

        {/* Product Title & Sanskrit Subtitle */}
        <div className="space-y-0.5">
          <h4 className="font-serif text-xs sm:text-sm font-bold text-[#14291D] group-hover:text-[#1E6B47] transition-colors line-clamp-1 leading-tight">
            {product.name}
          </h4>
          {product.sanskritName && (
            <div className="text-[10px] font-serif text-[#2C5E43] italic line-clamp-1">
              ({product.sanskritName})
            </div>
          )}
        </div>

        {/* Volume & Pack size */}
        {product.volumeOrWeight && (
          <div className="text-[10.5px] text-[#6B8576] font-medium mt-1 truncate">
            {product.volumeOrWeight}
          </div>
        )}

        {/* B2B Reseller Wholesale Rate (preserved strictly!) */}
        {product.resellerPrice !== undefined && product.resellerPrice > 0 && (
          <div className="mt-1 text-[9.5px] bg-[#FAF5EB] text-[#B4741E] px-2 py-0.5 rounded-md font-mono font-bold truncate border border-[#E8DCC2]">
            Reseller: {formatPrice(product.resellerPrice)}
          </div>
        )}
      </div>

      {/* Bottom Pricing & Circular Action Button (Matching reference screen 1) */}
      <div className="pt-2.5 mt-2 border-t border-[#F0FAF4] flex items-center justify-between gap-1">
        <div className="flex flex-col">
          <span className="font-mono font-bold text-sm sm:text-base text-[#14291D]" title={`₹${product.price}`}>
            {formatPrice(product.price)}
          </span>
          {product.mrp > product.price && (
            <span className="font-mono text-[10.5px] text-[#8C8270] line-through -mt-0.5" title={`₹${product.mrp}`}>
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* WhatsApp Consult Button */}
          <button
            type="button"
            onClick={handleWhatsAppConsult}
            className="w-8 h-8 rounded-full border border-[#DCEFE3] text-[#1E6B47] bg-[#F4FAF6] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            title="Ask Doctor via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          {/* Circular Action Button */}
          <button
            type="button"
            onClick={onAddToCart}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 ${
              isAddedAnim
                ? 'bg-[#1E6B47] text-white'
                : isInCart
                ? 'bg-[#1E6B47] text-white hover:bg-[#143B25]'
                : 'bg-[#143B25] hover:bg-[#1E6B47] text-white'
            }`}
            title={isInCart ? 'Already in Dispensary Bag' : 'Add to Dispensary Bag'}
          >
            {isAddedAnim || isInCart ? (
              <Check className="w-4 h-4 text-emerald-200" />
            ) : (
              <Plus className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
