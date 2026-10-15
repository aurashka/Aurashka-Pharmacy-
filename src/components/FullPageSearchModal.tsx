/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HerbalProduct, SiteSettings, CategoryItem } from '../types/pharmacy';
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
} from 'lucide-react';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS } from '../data/herbalProducts';
import { formatCompactNumber } from '../utils/numberFormatter';

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
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

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

  // Handle ESC key to close modal or sort popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isSortPopupOpen) {
          setIsSortPopupOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSortPopupOpen, onClose]);

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product Search"
      className="fixed inset-0 z-50 bg-[#FAF8F5] text-[#1E2922] flex flex-col w-screen h-[100dvh] overflow-hidden animate-in fade-in duration-150"
    >
      {/* 1. Header Navigation Bar with Search Bar */}
      <div className="bg-[#14291D] text-white px-3 sm:px-6 py-2.5 shrink-0 shadow-md border-b border-[#21432E]">
        <div className="max-w-6xl mx-auto flex items-center gap-2 sm:gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            title="Back (Esc)"
          >
            <ArrowLeft className="w-5 h-5 text-amber-300" />
            <span className="hidden sm:inline text-xs font-semibold">Back</span>
          </button>

          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulations, herbs, Sanskrit, monograph, dosage or price..."
              className="w-full pl-10 sm:pl-11 pr-10 py-2 sm:py-2.5 bg-white/15 hover:bg-white/20 focus:bg-white focus:text-[#14291D] text-white placeholder:text-white/60 rounded-xl text-xs sm:text-sm font-medium border border-white/20 focus:border-amber-300 focus:outline-hidden transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bag / Cart Button */}
          {onOpenCart && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="relative p-2 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              title="View Cart Bag"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">Bag</span>
              {cartCount > 0 && (
                <span className="min-w-4 h-4 px-1 rounded-full bg-[#D49838] text-[#14291D] font-bold text-[10px] flex items-center justify-center font-mono">
                  {formatCompactNumber(cartCount)}
                </span>
              )}
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Bar: Pre-existed Categories Strip & Form Strip + Simple Sort Icon */}
      <div className="bg-white border-b border-[#EAE3D4] px-3 sm:px-6 py-2 shrink-0 shadow-2xs space-y-1.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Categories Pill Strip with Admin Appearance (Position, Size, Style) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs flex-1">
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
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${layoutClasses} ${
                    active
                      ? 'bg-[#14291D] text-white shadow-2xs ring-1 ring-[#14291D]'
                      : 'bg-[#FAF8F5] text-[#554C3E] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
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

          {/* Simple Sort Icon Button */}
          <button
            type="button"
            onClick={() => setIsSortPopupOpen(true)}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center gap-1 shrink-0 ${
              sortBy !== 'default'
                ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                : 'bg-[#FAF8F5] text-[#554C3E] hover:bg-[#F2ECE1] border-[#DDD5C5]'
            }`}
            title="Sort Products"
            aria-label="Sort"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Formulation Forms Strip with Admin Appearance */}
        <div className="max-w-6xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-1.5 border-t border-[#F2ECE1] scrollbar-none text-[11px]">
          <span className="text-[#887E6D] font-medium shrink-0">Form:</span>
          {(() => {
            const isAllActive = selectedForm === 'all';
            const allImgUrl = categoryAppearance.allFormsImageUrl;
            const shouldShowAllImg =
              showImagesGlobally &&
              (categoryAppearance.showAllFormsImage !== false) &&
              Boolean(allImgUrl);
            const allFormLayout = getPillLayoutClass(Boolean(shouldShowAllImg));
            const formImgSizePx = Math.max(16, Math.round(imageSizePx * 0.85));

            return (
              <button
                type="button"
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
            const shouldShowFImg =
              showImagesGlobally &&
              (formConfig?.showImage !== false) &&
              Boolean(fImgUrl);
            const fLayout = getPillLayoutClass(Boolean(shouldShowFImg));
            const formImgSizePx = Math.max(16, Math.round(imageSizePx * 0.85));

            return (
              <button
                key={f}
                type="button"
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

      {/* 3. Simple Sort Popup */}
      {isSortPopupOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-150 animate-in fade-in"
          onClick={() => setIsSortPopupOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl border border-[#DDD5C5] shadow-2xl p-4 text-[#1E2922] space-y-3 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#2C5E43]" />
                <h4 className="font-semibold text-sm text-[#14291D]">Sort Products</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsSortPopupOpen(false)}
                className="p-1 text-[#8C8271] hover:text-[#14291D] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
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
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#14291D] text-white font-semibold'
                        : 'hover:bg-[#FAF8F5] text-[#332C22]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                  </button>
                );
              })}
            </div>

            {sortBy !== 'default' && (
              <div className="pt-2 border-t border-[#F2ECE1]">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('default');
                    setIsSortPopupOpen(false);
                  }}
                  className="w-full text-center text-xs text-[#8C8271] hover:text-[#14291D] flex items-center justify-center gap-1.5 py-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Default</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Products Grid */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          {/* Case 1: When Query is Active */}
          {isQueryActive ? (
            <>
              {sortedMatchedProducts.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {sortedMatchedProducts.map((product) => (
                      <SearchProductCard
                        key={product.id}
                        product={product}
                        isInCart={cartProductIds.has(product.id)}
                        isAddedAnim={addedAnimationId === product.id}
                        onCardClick={() => handleCardClick(product)}
                        onAddToCart={(e) => handleAddToCartWithFeedback(product, e)}
                      />
                    ))}
                  </div>

                  {/* Suggested Products Below */}
                  {suggested.length > 0 && (
                    <div className="pt-6 border-t border-[#EAE3D4] space-y-3">
                      <h4 className="text-xs font-bold text-[#7A705E] uppercase tracking-wider">
                        Suggested Products
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {suggested.slice(0, 8).map((product) => (
                          <SearchProductCard
                            key={product.id}
                            product={product}
                            isInCart={cartProductIds.has(product.id)}
                            isAddedAnim={addedAnimationId === product.id}
                            onCardClick={() => handleCardClick(product)}
                            onAddToCart={(e) => handleAddToCartWithFeedback(product, e)}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {defaultList.map((product) => (
                    <SearchProductCard
                      key={product.id}
                      product={product}
                      isInCart={cartProductIds.has(product.id)}
                      isAddedAnim={addedAnimationId === product.id}
                      onCardClick={() => handleCardClick(product)}
                      onAddToCart={(e) => handleAddToCartWithFeedback(product, e)}
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

// Sub-component: Clean Product Card without noisy text
interface SearchProductCardProps {
  product: HerbalProduct;
  isInCart: boolean;
  isAddedAnim: boolean;
  onCardClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}

const SearchProductCard: React.FC<SearchProductCardProps> = ({
  product,
  isInCart,
  isAddedAnim,
  onCardClick,
  onAddToCart,
}) => {
  const discountPercent =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <div
      onClick={onCardClick}
      className="bg-white rounded-2xl border border-[#E4DCCF] hover:border-[#14291D] p-3 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group relative overflow-hidden"
    >
      <div>
        {/* Top Image & Badges */}
        <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-stone-100 mb-2.5">
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
            {discountPercent > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-amber-950 font-bold text-[10px] shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            {product.sortBadge === 'top_seller' && (
              <span className="px-1.5 py-0.5 rounded-md bg-[#14291D] text-amber-300 font-bold text-[9px] shadow-xs">
                Bestseller
              </span>
            )}
            {product.sortBadge === 'trending' && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-[9px] shadow-xs">
                Trending
              </span>
            )}
          </div>

          {/* Category / Form Pill on image */}
          <div className="absolute bottom-2 right-2 z-10">
            <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold">
              {product.form || product.category}
            </span>
          </div>
        </div>

        {/* Title & Classical Sanskrit Name */}
        <div className="space-y-0.5">
          <h4 className="font-serif text-sm font-bold text-[#14291D] group-hover:text-emerald-900 transition-colors line-clamp-1">
            {product.name}
          </h4>
          {product.sanskritName && (
            <div className="text-[10.5px] font-serif text-[#2C5E43] italic line-clamp-1">
              ({product.sanskritName})
            </div>
          )}
        </div>

        {/* Tagline */}
        <p className="text-[11px] text-[#716757] line-clamp-2 mt-1 leading-snug">
          {product.tagline || (product.keyIndications && product.keyIndications.join(', '))}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-[#14291D]">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-[10px] text-[#8C8271]">
            ({product.reviewsCount})
          </span>
        </div>
      </div>

      {/* Bottom Pricing & Action */}
      <div className="pt-3 mt-2 border-t border-[#F2ECE1] flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-[#14291D] font-mono">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-[11px] text-[#8C8270] line-through font-mono">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
            isAddedAnim
              ? 'bg-emerald-600 text-white scale-95'
              : isInCart
              ? 'bg-emerald-800 text-white hover:bg-emerald-900'
              : 'bg-[#14291D] hover:bg-[#203E2D] text-white'
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
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
