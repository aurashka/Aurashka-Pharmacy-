import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { BannerSliderConfig, HerbalProduct } from '../types/pharmacy';
import { getScrollerOverlayConfig } from '../utils/gradientHelper';

interface ImageBannerScrollerProps {
  config?: BannerSliderConfig;
  products?: HerbalProduct[];
  onSelectProduct?: (product: HerbalProduct) => void;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export const ImageBannerScroller: React.FC<ImageBannerScrollerProps> = ({
  config,
  products = [],
  onSelectProduct,
  onSelectCategory,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const mouseStartX = useRef<number>(0);
  const hasDragged = useRef<boolean>(false);

  const isEnabled = config?.enabled !== false;
  const overlayConfig = getScrollerOverlayConfig(config?.overlayStyle);
  const rawItems = config?.items;
  const items = Array.isArray(rawItems)
    ? rawItems.filter((item) => item && item.imageUrl && item.imageUrl.trim().length > 0)
    : (rawItems && typeof rawItems === 'object'
      ? (Object.values(rawItems) as any[]).filter((item) => item && item.imageUrl && item.imageUrl.trim().length > 0)
      : []);

  const total = items.length;
  const intervalSeconds = Math.max(2, config?.autoScrollSeconds || 4);

  // Auto-scroll loop
  useEffect(() => {
    if (!isEnabled || total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [isEnabled, total, isPaused, intervalSeconds]);

  // Adjust active index if items change
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    hasDragged.current = false;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchEndX.current - touchStartX.current) > 10) {
      hasDragged.current = true;
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
    hasDragged.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    if (Math.abs(e.clientX - mouseStartX.current) > 8) {
      hasDragged.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const diff = mouseStartX.current - e.clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Click on slide action
  const handleSlideClick = (slide: typeof items[0]) => {
    if (hasDragged.current) return;

    if (slide.linkType === 'product' && slide.productId) {
      const found = products.find((p) => p.id === slide.productId);
      if (found && onSelectProduct) {
        onSelectProduct(found);
      }
    } else if (slide.linkType === 'category' && slide.category) {
      if (onSelectCategory) {
        onSelectCategory(slide.category);
        const catalogEl = document.getElementById('deals-catalog') || document.getElementById('catalog');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (slide.linkType === 'custom' && slide.customUrl) {
      if (slide.customUrl.startsWith('#')) {
        const target = document.querySelector(slide.customUrl);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.hash = slide.customUrl;
        }
      } else {
        window.location.href = slide.customUrl;
      }
    }
  };

  if (!isEnabled || total === 0) return null;

  // Aspect ratio helper
  const getAspectRatioClasses = () => {
    if (config?.customHeightPx && config.customHeightPx > 0) {
      return ''; // Height explicitly controlled by customHeightPx in style
    }
    switch (config?.aspectRatio) {
      case 'compact':
        return 'h-28 sm:h-32 md:h-36';
      case 'standard':
        return 'h-36 sm:h-44 md:h-52';
      case 'wide':
        return 'h-48 sm:h-56 md:h-64';
      case 'tall':
        return 'h-60 sm:h-72 md:h-84';
      case 'extra_tall':
        return 'h-72 sm:h-96 md:h-[420px]';
      case 'auto':
      default:
        return 'h-32 sm:h-40 md:h-48';
    }
  };

  return (
    <div className={`w-full group/slider relative ${className}`}>
      {/* Outer Slider Shell */}
      <div
        className={`w-full ${getAspectRatioClasses()} rounded-xl overflow-hidden relative border border-white/20 shadow-lg select-none cursor-grab active:cursor-grabbing bg-[#14291D]`}
        style={
          config?.customHeightPx && config.customHeightPx > 0
            ? { height: `${config.customHeightPx}px` }
            : undefined
        }
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          isMouseDown.current = false;
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Track */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((slide, idx) => {
            const hasLink = slide.linkType && slide.linkType !== 'none';
            return (
              <div
                key={slide.id || idx}
                onClick={() => handleSlideClick(slide)}
                className={`w-full h-full shrink-0 relative overflow-hidden ${
                  hasLink ? 'cursor-pointer' : ''
                }`}
                title={
                  slide.linkType === 'product'
                    ? 'Click to open product monograph'
                    : slide.linkType === 'category'
                    ? `Click to view ${slide.category} formulations`
                    : slide.linkType === 'custom'
                    ? 'Click to view link'
                    : undefined
                }
              >
                {/* Background Image */}
                <img
                  src={slide.imageUrl}
                  alt={slide.altText || slide.title || `Banner ${idx + 1}`}
                  className="w-full h-full object-cover object-center transform group-hover/slider:scale-102 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback to botanical gradient if image fails
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Optional Configurable Gradient or Frosted Glass Overlay */}
                {overlayConfig.hasOverlay && (
                  <div className={overlayConfig.overlayClass} />
                )}

                {/* Optional Title & Subtitle Badge */}
                {(slide.title || slide.subtitle) && (
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 z-10 pointer-events-none">
                    <div className={`space-y-0.5 ${overlayConfig.titleBoxClass}`}>
                      {slide.title && (
                        <div className="flex items-center gap-1.5">
                          <Sparkles className={`w-3 h-3 shrink-0 ${overlayConfig.isLightText ? 'text-amber-300' : 'text-amber-600'}`} />
                          <h4 className={`font-serif text-xs sm:text-sm font-bold tracking-wide line-clamp-1 ${overlayConfig.isLightText ? 'text-white' : 'text-[#14291D]'}`}>
                            {slide.title}
                          </h4>
                        </div>
                      )}
                      {slide.subtitle && (
                        <p className={`text-[10px] sm:text-[11px] line-clamp-1 max-w-xl ${overlayConfig.isLightText ? 'text-[#E1EADF]' : 'text-[#483F30]'}`}>
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Previous / Next Arrow Controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/45 hover:bg-black/75 text-white/90 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover/slider:opacity-100 z-20 cursor-pointer backdrop-blur-xs"
              aria-label="Previous image slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/45 hover:bg-black/75 text-white/90 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover/slider:opacity-100 z-20 cursor-pointer backdrop-blur-xs"
              aria-label="Next image slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Bottom Dot Indicators */}
        {total > 1 && (
          <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1.5">
            {items.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(dotIdx);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  currentIndex === dotIdx
                    ? 'w-4 h-1.5 bg-emerald-400'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
