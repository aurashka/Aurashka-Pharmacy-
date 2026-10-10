import React from 'react';
import { 
  MarqueeConfig, 
  MarqueeItem, 
  HerbalProduct 
} from '../types/pharmacy';
import { 
  Leaf, 
  Sparkles, 
  Star, 
  Flame, 
  Tag, 
  ExternalLink, 
  MessageCircle, 
  ArrowRight,
  Settings,
  Circle
} from 'lucide-react';

interface MarqueeTickerProps {
  config?: MarqueeConfig;
  products: HerbalProduct[];
  onSelectProduct: (product: HerbalProduct) => void;
  onSelectCategory?: (category: string) => void;
  onOpenConsultationModal?: () => void;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({
  config,
  products,
  onSelectProduct,
  onSelectCategory,
  onOpenConsultationModal,
  isAdmin,
  onOpenAdminPanel,
}) => {
  if (!config || !config.enabled) {
    return null;
  }

  const items = config.items || [];
  if (items.length === 0) {
    return null;
  }

  // Size mappings
  const fontSizeClass = {
    small: 'text-[11px] sm:text-xs',
    medium: 'text-xs sm:text-sm font-medium',
    large: 'text-sm sm:text-base font-medium',
  }[config.fontSize || 'medium'];

  const paddingClass = {
    compact: 'py-1 sm:py-1.5',
    regular: 'py-2 sm:py-2.5',
    spacious: 'py-3 sm:py-3.5',
  }[config.paddingSize || 'regular'];

  const speedSeconds = Math.max(8, Number(config.speedSeconds) || 26);
  const directionClass = config.direction === 'right' ? 'animate-marquee-right' : 'animate-marquee-left';
  const pauseClass = config.pauseOnHover ? 'marquee-pause-hover' : '';

  // Render Divider Icon
  const renderDivider = (key: string | number) => {
    const iconType = config.dividerIcon || 'leaf';
    if (iconType === 'none') {
      return (
        <span key={key} className="mx-4 sm:mx-6 opacity-30 select-none">
          |
        </span>
      );
    }

    const iconProps = { className: 'w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60 shrink-0 select-none' };

    return (
      <span key={key} className="mx-3.5 sm:mx-6 flex items-center shrink-0" aria-hidden="true">
        {iconType === 'leaf' && <Leaf {...iconProps} />}
        {iconType === 'sparkles' && <Sparkles {...iconProps} />}
        {iconType === 'star' && <Star {...iconProps} fill="currentColor" />}
        {iconType === 'flame' && <Flame {...iconProps} />}
        {iconType === 'dot' && <Circle {...iconProps} className="w-1.5 h-1.5 opacity-60 fill-current" />}
      </span>
    );
  };

  // Click Handler for an item
  const handleItemClick = (item: MarqueeItem, product?: HerbalProduct) => {
    if (item.type === 'product' && product) {
      onSelectProduct(product);
      return;
    }

    if (item.type === 'text') {
      if (item.linkType === 'product' && item.linkProductId) {
        const p = products.find((prod) => prod.id === item.linkProductId);
        if (p) {
          onSelectProduct(p);
          return;
        }
      }

      if (item.linkType === 'category' && onSelectCategory) {
        onSelectCategory(item.linkCategory || 'all');
        const catalogEl = document.getElementById('deals-catalog') || document.getElementById('catalog');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      if (item.linkType === 'whatsapp') {
        if (onOpenConsultationModal) {
          onOpenConsultationModal();
        } else {
          window.open('https://wa.me/919876543210', '_blank', 'noopener,noreferrer');
        }
        return;
      }

      if (item.linkType === 'url' && item.linkUrl) {
        if (item.linkUrl.startsWith('#')) {
          const el = document.querySelector(item.linkUrl);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
        }
      }
    }
  };

  // Render individual item
  const renderItemContent = (item: MarqueeItem, uniqueKey: string) => {
    if (item.type === 'product') {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;

      const title = item.customLabel || product.name;
      const showImage = item.showImage !== false && product.image;
      const showPrice = item.showPrice !== false;
      const showBadge = item.showBadge !== false && (product.sortBadge && product.sortBadge !== 'none');

      return (
        <button
          key={uniqueKey}
          type="button"
          onClick={() => handleItemClick(item, product)}
          className="group inline-flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1 rounded-full transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer whitespace-nowrap bg-black/15 hover:bg-black/25 dark:bg-white/10 dark:hover:bg-white/20 border border-white/20 shadow-xs"
          style={{ color: item.textColor || config.textColor }}
          title={`Click to view ${product.name}`}
        >
          {showImage && (
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-white/30 border border-white/40 shrink-0 inline-flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </span>
          )}

          <span className="font-semibold tracking-wide group-hover:underline underline-offset-2">
            {title}
          </span>

          {showPrice && (
            <span className="inline-flex items-center gap-1.5 font-bold px-1.5 py-0.2 rounded-md bg-white/20 text-white text-[11px] sm:text-xs">
              <span>₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="line-through opacity-70 text-[10px]">
                  ₹{product.mrp}
                </span>
              )}
            </span>
          )}

          {showBadge && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-900 shadow-2xs">
              {product.sortBadge === 'trending' ? '🔥 Trending' : product.sortBadge === 'top_seller' ? '⭐ Best' : 'Special'}
            </span>
          )}

          <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      );
    }

    // Custom Text item
    const isClickable = item.linkType && item.linkType !== 'none';
    const hasBadge = Boolean(item.badge && item.badge.trim());

    const content = (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        {hasBadge && (
          <span
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-2xs shrink-0 select-none"
            style={{
              backgroundColor: item.badgeColor || '#B4741E',
              color: item.badgeTextColor || '#FFFFFF',
            }}
          >
            {item.badge}
          </span>
        )}

        <span
          className={`${item.textColor ? '' : ''} ${
            isClickable ? 'group-hover:underline underline-offset-2 font-medium' : ''
          }`}
          style={{ color: item.textColor || config.textColor }}
        >
          {item.text}
        </span>

        {isClickable && (
          <span className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">
            {item.linkType === 'whatsapp' ? (
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
            ) : item.linkType === 'url' ? (
              <ExternalLink className="w-3 h-3" />
            ) : (
              <ArrowRight className="w-3 h-3" />
            )}
          </span>
        )}
      </span>
    );

    if (isClickable) {
      return (
        <button
          key={uniqueKey}
          type="button"
          onClick={() => handleItemClick(item)}
          className="group inline-flex items-center transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          title="Click to learn more"
        >
          {content}
        </button>
      );
    }

    return (
      <div key={uniqueKey} className="inline-flex items-center">
        {content}
      </div>
    );
  };

  // Build the repeated list for seamless infinite scroll
  // Ensure enough items so width comfortably spans wider than screen before 50% translation
  let baseItems = [...items];
  while (baseItems.length < 8) {
    baseItems = [...baseItems, ...items];
  }

  // Create two exact identical halves for the loop
  const loopHalfA = baseItems;
  const loopHalfB = baseItems;

  return (
    <div
      className={`relative w-full overflow-hidden select-none z-20 ${paddingClass} ${fontSizeClass} ${pauseClass}`}
      style={{
        backgroundColor: config.backgroundColor || '#14291D',
        color: config.textColor || '#FFFFFF',
        borderTop: config.showBorder ? `1px solid ${config.borderColor || '#244532'}` : 'none',
        borderBottom: config.showBorder ? `1px solid ${config.borderColor || '#244532'}` : 'none',
      }}
      aria-label="Announcement ticker"
    >
      {/* Admin quick edit indicator button on right edge for convenience */}
      {isAdmin && onOpenAdminPanel && (
        <button
          type="button"
          onClick={onOpenAdminPanel}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1 rounded-full bg-black/40 hover:bg-black/70 text-amber-300 text-[10px] opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 px-2 border border-white/20 cursor-pointer shadow-sm"
          title="Customize Marquee Ticker in Admin Panel"
        >
          <Settings className="w-3 h-3" />
          <span className="hidden sm:inline font-mono">Edit Ticker</span>
        </button>
      )}

      {/* Marquee Track Container */}
      <div
        className={directionClass}
        style={{
          animationDuration: `${speedSeconds}s`,
        }}
      >
        {/* First Half */}
        <div className="flex items-center shrink-0">
          {loopHalfA.map((item, idx) => (
            <React.Fragment key={`halfA-${item.id}-${idx}`}>
              {renderItemContent(item, `halfA-content-${item.id}-${idx}`)}
              {renderDivider(`halfA-div-${item.id}-${idx}`)}
            </React.Fragment>
          ))}
        </div>

        {/* Second Half (Exact duplicate for seamless 50% translate infinite loop) */}
        <div className="flex items-center shrink-0" aria-hidden="true">
          {loopHalfB.map((item, idx) => (
            <React.Fragment key={`halfB-${item.id}-${idx}`}>
              {renderItemContent(item, `halfB-content-${item.id}-${idx}`)}
              {renderDivider(`halfB-div-${item.id}-${idx}`)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
