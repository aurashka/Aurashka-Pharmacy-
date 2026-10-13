import React from 'react';
import { 
  MonographContentBlock, 
  BlockDesignSettings,
  TagItem,
  CardBlockData
} from '../types/pharmacy';
import { 
  resolveBlockCustomStyle, 
  getBlockContainerClasses, 
  hexToRgba 
} from '../utils/monographHelper';
import { ExternalLink } from 'lucide-react';

interface MonographBlockRendererProps {
  block: MonographContentBlock;
  className?: string;
}

export const MonographBlockRenderer: React.FC<MonographBlockRendererProps> = ({
  block,
  className = '',
}) => {
  const containerClasses = getBlockContainerClasses(block.design);
  const containerStyle = resolveBlockCustomStyle(block.design);

  // Helper to render markdown bold and line breaks safely
  const formatRichText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      // Check for bullet list item
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Parse bold **text**
      const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0 mt-2" />
            <span className="flex-1 leading-relaxed">{renderedParts}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="leading-relaxed my-0.5">
          {renderedParts}
        </p>
      );
    });
  };

  // Helper for rendering tag badges
  const renderTagsList = (tags: TagItem[] = [], detailedContent?: string) => {
    if ((!tags || tags.length === 0) && !detailedContent) return null;

    return (
      <div className="space-y-2">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {tags.map((tag: TagItem, idx: number) => {
              const bg = tag.bgColor ? hexToRgba(tag.bgColor, tag.bgOpacity ?? 100) : '#14291D';
              const textCol = tag.textColor || '#FFFFFF';
              const roundedClass = 
                tag.style === 'square' ? 'rounded-xs' :
                tag.style === 'pill' ? 'rounded-full' : 'rounded-md';
              const textFontSize = tag.fontSize === 'sm' ? 'text-xs sm:text-[13px]' : 'text-[11px] sm:text-xs';

              return (
                <span
                  key={tag.id || idx}
                  style={{ backgroundColor: bg, color: textCol }}
                  className={`inline-flex items-center font-semibold px-2.5 py-1 shadow-2xs transition-transform hover:scale-[1.02] ${roundedClass} ${textFontSize}`}
                >
                  {tag.text}
                </span>
              );
            })}
          </div>
        )}

        {/* Detailed Content / Monograph Paragraph below tags */}
        {detailedContent && (
          <div className="mt-2 pt-2 border-t border-black/10 text-xs sm:text-[13px] leading-relaxed opacity-90 font-sans">
            {formatRichText(detailedContent)}
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // 0. UNIFIED COMPOSED CARD BLOCK (All-In-One Custom Card)
  // ══════════════════════════════════════════════════════════════
  if (block.type === 'card' && block.cardData) {
    const card = block.cardData;

    // Header element
    const headerElement = card.showHeader && card.title ? (
      <div className="space-y-1">
        {card.headerLevel === 'h2' ? (
          <h2 className="font-serif font-bold text-lg sm:text-xl tracking-tight leading-snug">
            {card.title}
          </h2>
        ) : card.headerLevel === 'h4' ? (
          <h4 className="font-serif font-bold text-xs sm:text-sm tracking-tight leading-snug">
            {card.title}
          </h4>
        ) : (
          <h3 className="font-serif font-bold text-sm sm:text-base tracking-tight leading-snug">
            {card.title}
          </h3>
        )}

        {card.subtitle && (
          <p className="text-xs opacity-75 leading-relaxed font-sans">
            {card.subtitle}
          </p>
        )}

        {card.showAccentBorder && (
          <div className="pt-1">
            <div 
              className="h-0.5 w-10 rounded-full" 
              style={{ backgroundColor: block.design?.textColor || '#B4741E' }} 
            />
          </div>
        )}
      </div>
    ) : null;

    // Image element
    const sizeClasses = {
      compact: 'w-20 sm:w-24 shrink-0',
      small: 'w-24 sm:w-28 shrink-0',
      medium: 'w-32 sm:w-44 shrink-0',
      large: 'w-full sm:w-56 shrink-0',
      full: 'w-full',
    }[card.imageSize || 'small'] || 'w-24 shrink-0';

    const aspectClass = {
      square: 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-4/3',
      natural: 'h-auto',
    }[card.aspectRatio || 'square'] || 'aspect-square';

    const roundedClass = {
      none: 'rounded-none',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    }[card.imageRounded || 'xl'] || 'rounded-xl';

    const imageElement = card.showImage && card.imageUrl ? (
      <div className={`${card.imagePosition === 'top' || card.imagePosition === 'bottom' ? 'w-full max-w-md mx-auto' : sizeClasses} overflow-hidden ${roundedClass} border border-black/10 shadow-2xs bg-stone-100 shrink-0 relative group/img`}>
        {card.imageLinkUrl ? (
          <a
            href={card.imageLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative overflow-hidden"
            title="Open link in new tab"
          >
            <img
              src={card.imageUrl}
              alt={card.imageAlt || card.title || 'Card imagery'}
              className={`w-full ${aspectClass} object-cover transition-transform duration-300 group-hover/img:scale-105`}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <span className="absolute bottom-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        ) : (
          <img
            src={card.imageUrl}
            alt={card.imageAlt || card.title || 'Card imagery'}
            className={`w-full ${aspectClass} object-cover transition-transform duration-300 hover:scale-105`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80';
            }}
          />
        )}
      </div>
    ) : null;

    // Rich text element
    const sizeClass = 
      card.fontSize === 'xs' ? 'text-xs' :
      card.fontSize === 'base' ? 'text-sm sm:text-base' :
      card.fontSize === 'lg' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm';

    const leadingClass =
      card.lineHeight === 'loose' ? 'leading-loose' :
      card.lineHeight === 'normal' ? 'leading-normal' : 'leading-relaxed';

    const richTextElement = card.showRichText && card.content ? (
      <div className={`space-y-2 font-sans ${sizeClass} ${leadingClass}`}>
        <div>{formatRichText(card.content)}</div>
        {card.secondaryContent && (
          <div className="mt-2 pt-2 border-t border-black/10 text-xs opacity-85 italic bg-black/[0.02] p-2 rounded-lg">
            {formatRichText(card.secondaryContent)}
          </div>
        )}
      </div>
    ) : null;

    // Tags element
    const tagsElement = card.showTags && (card.tags || card.detailedContent) ? (
      <div>
        {card.tagsTitle && (
          <h5 className="font-serif font-bold text-xs opacity-80 mb-1.5">{card.tagsTitle}</h5>
        )}
        {renderTagsList(card.tags, card.detailedContent)}
      </div>
    ) : null;

    // Action button / link
    const actionElement = card.actionLinkUrl && card.actionLinkLabel ? (
      <div className="pt-2">
        <a
          href={card.actionLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-current shadow-2xs hover:opacity-85 transition-opacity"
        >
          <span>{card.actionLinkLabel}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    ) : null;

    const isHorizontal = imageElement && (card.imagePosition === 'left' || card.imagePosition === 'right' || !card.imagePosition);
    const isImageLeft = card.imagePosition === 'left' || !card.imagePosition;

    return (
      <div 
        style={containerStyle} 
        className={`${containerClasses} ${className}`}
      >
        <div className="space-y-3">
          {/* Header at top if present */}
          {headerElement}

          {/* Tags at top if positioned top */}
          {card.tagsPosition === 'top' && tagsElement}

          {/* Middle Body: Image & Text layout */}
          {imageElement ? (
            <div className={`flex ${isHorizontal ? 'flex-col sm:flex-row' : 'flex-col'} gap-3.5 sm:gap-4 items-start`}>
              {/* Image first if position is left or top */}
              {(isImageLeft || card.imagePosition === 'top') && imageElement}

              {/* Text & internal tags */}
              <div className="flex-1 min-w-0 space-y-2.5">
                {card.tagsPosition === 'middle' && tagsElement}
                {richTextElement}
                {card.tagsPosition === 'bottom' && tagsElement}
              </div>

              {/* Image second if position is right or bottom */}
              {(card.imagePosition === 'right' || card.imagePosition === 'bottom') && imageElement}
            </div>
          ) : (
            <div className="space-y-2.5">
              {card.tagsPosition === 'middle' && tagsElement}
              {richTextElement}
              {card.tagsPosition === 'bottom' && tagsElement}
            </div>
          )}

          {/* Action button if present */}
          {actionElement}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 1. HEADER BLOCK
  // ══════════════════════════════════════════════════════════════
  if (block.type === 'header' && block.headerData) {
    const { text, subtitle, level = 'h3', showAccentBorder = true } = block.headerData;

    return (
      <div 
        style={containerStyle} 
        className={`${containerClasses} ${className}`}
      >
        <div className="space-y-1">
          {level === 'h2' && (
            <h2 className="font-serif font-bold text-xl sm:text-2xl tracking-tight leading-snug">
              {text}
            </h2>
          )}
          {level === 'h3' && (
            <h3 className="font-serif font-bold text-base sm:text-lg tracking-tight leading-snug">
              {text}
            </h3>
          )}
          {level === 'h4' && (
            <h4 className="font-serif font-bold text-sm sm:text-base tracking-tight leading-snug">
              {text}
            </h4>
          )}

          {subtitle && (
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-sans">
              {subtitle}
            </p>
          )}

          {showAccentBorder && (
            <div className="pt-1.5">
              <div 
                className="h-0.5 w-12 rounded-full" 
                style={{ backgroundColor: block.design?.textColor || '#B4741E' }} 
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 2. RICH TEXT BLOCK
  // ══════════════════════════════════════════════════════════════
  if (block.type === 'rich_text' && block.richTextData) {
    const { content, secondaryContent, fontSize = 'sm', lineHeight = 'relaxed' } = block.richTextData;

    const sizeClass = 
      fontSize === 'xs' ? 'text-xs' :
      fontSize === 'base' ? 'text-sm sm:text-base' :
      fontSize === 'lg' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm';

    const leadingClass =
      lineHeight === 'loose' ? 'leading-loose' :
      lineHeight === 'normal' ? 'leading-normal' : 'leading-relaxed';

    return (
      <div 
        style={containerStyle} 
        className={`${containerClasses} ${className}`}
      >
        <div className={`space-y-2.5 font-sans ${sizeClass} ${leadingClass}`}>
          <div>{formatRichText(content)}</div>

          {secondaryContent && (
            <div className="mt-3 pt-2.5 border-t border-black/10 text-xs opacity-85 italic bg-black/[0.02] p-2.5 rounded-lg">
              {formatRichText(secondaryContent)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 3. TAGS / BADGES BLOCK
  // ══════════════════════════════════════════════════════════════
  if (block.type === 'tags' && block.tagsData) {
    const { title, tags = [], detailedContent } = block.tagsData;

    return (
      <div 
        style={containerStyle} 
        className={`${containerClasses} ${className}`}
      >
        <div className="space-y-3">
          {title && (
            <h4 className="font-serif font-bold text-xs sm:text-sm tracking-wide opacity-90">
              {title}
            </h4>
          )}

          {/* Badges / Tags list */}
          {renderTagsList(tags, detailedContent)}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 4. IMAGE + TEXT BLOCK
  // ══════════════════════════════════════════════════════════════
  if (block.type === 'image_text' && block.imageTextData) {
    const { 
      title, 
      text, 
      detailedContent, 
      imageUrl, 
      imageAlt = 'Herb illustration',
      imageLinkUrl,
      imagePosition = 'left',
      imageSize = 'small',
      aspectRatio = 'square',
      spacing = 'md',
      alignment = 'center'
    } = block.imageTextData;

    const sizeClasses = {
      small: 'w-20 sm:w-24 md:w-28 shrink-0',
      medium: 'w-28 sm:w-36 md:w-44 shrink-0',
      large: 'w-full sm:w-48 md:w-60 shrink-0',
    }[imageSize] || 'w-24 shrink-0';

    const aspectClass = {
      square: 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-4/3',
      natural: 'h-auto',
    }[aspectRatio] || 'aspect-square';

    const spacingClass = {
      sm: 'gap-3',
      md: 'gap-4 sm:gap-5',
      lg: 'gap-5 sm:gap-6',
    }[spacing] || 'gap-4';

    const alignClass = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    }[alignment] || 'items-center';

    const isHorizontal = imagePosition === 'left' || imagePosition === 'right';
    const isImageFirst = imagePosition === 'left' || imagePosition === 'top';

    const imageInner = (
      <img
        src={imageUrl}
        alt={imageAlt || title || 'Monograph image'}
        className={`w-full ${aspectClass} object-cover transition-transform duration-300 hover:scale-105`}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80';
        }}
      />
    );

    const imageElement = (
      <div className={`${isHorizontal ? sizeClasses : 'w-full max-w-md mx-auto'} overflow-hidden rounded-xl border border-black/10 shadow-2xs bg-stone-100 shrink-0 relative group/img`}>
        {imageLinkUrl ? (
          <a
            href={imageLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative overflow-hidden"
            title="Open link"
          >
            {imageInner}
            <span className="absolute bottom-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        ) : (
          imageInner
        )}
      </div>
    );

    const contentElement = (
      <div className="flex-1 min-w-0 space-y-1.5">
        {title && (
          <h4 className="font-serif font-bold text-sm sm:text-base tracking-tight leading-snug">
            {title}
          </h4>
        )}
        <div className="text-xs sm:text-sm leading-relaxed font-sans opacity-90">
          {formatRichText(text)}
        </div>
        {detailedContent && (
          <div className="pt-1.5 text-xs opacity-80 leading-relaxed font-sans italic border-t border-black/5 mt-1.5">
            {formatRichText(detailedContent)}
          </div>
        )}
      </div>
    );

    return (
      <div 
        style={containerStyle} 
        className={`${containerClasses} ${className}`}
      >
        <div className={`flex ${isHorizontal ? 'flex-col sm:flex-row' : 'flex-col'} ${spacingClass} ${alignClass}`}>
          {isImageFirst ? (
            <>
              {imageElement}
              {contentElement}
            </>
          ) : (
            <>
              {contentElement}
              {imageElement}
            </>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 5. IMAGE-ONLY BLOCK
  // ══════════════════════════════════════════════════════════════
  if (block.type === 'image_only' && block.imageOnlyData) {
    const { 
      imageUrl, 
      caption, 
      imageLinkUrl,
      aspectRatio = '16:9', 
      imageSize = 'medium',
      rounded = 'xl' 
    } = block.imageOnlyData;

    const aspectClass = {
      square: 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-4/3',
      '21:9': 'aspect-[21/9]',
      natural: 'h-auto',
    }[aspectRatio] || 'aspect-video';

    const widthClass = {
      small: 'max-w-xs mx-auto',
      medium: 'max-w-md mx-auto',
      large: 'max-w-2xl mx-auto',
      full: 'w-full',
    }[imageSize] || 'max-w-md mx-auto';

    const roundedClass = {
      none: 'rounded-none',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
    }[rounded] || 'rounded-xl';

    const imgInner = (
      <img
        src={imageUrl}
        alt={caption || 'Monograph imagery'}
        className={`w-full ${aspectClass} object-cover transition-transform duration-300 hover:scale-[1.02]`}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
        }}
      />
    );

    return (
      <div 
        style={containerStyle} 
        className={`${containerClasses} ${className}`}
      >
        <div className={`space-y-2 ${widthClass}`}>
          <div className={`overflow-hidden ${roundedClass} border border-black/10 shadow-xs bg-stone-100 relative group/img`}>
            {imageLinkUrl ? (
              <a
                href={imageLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative overflow-hidden"
              >
                {imgInner}
                <span className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </a>
            ) : (
              imgInner
            )}
          </div>
          {caption && (
            <p className="text-center text-[11px] sm:text-xs opacity-75 font-serif italic pt-1">
              {caption}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 6. CUSTOM SPACING OR DIVIDER BLOCK
  // ══════════════════════════════════════════════════════════════
  if (block.type === 'divider' && block.dividerData) {
    const { 
      style = 'line', 
      lineColor = '#DDD5C5', 
      thickness = 1, 
      heightPx = 20 
    } = block.dividerData;

    if (style === 'spacing_only') {
      return (
        <div 
          style={{ height: `${heightPx || 20}px` }} 
          className="w-full pointer-events-none" 
          aria-hidden="true" 
        />
      );
    }

    return (
      <div 
        style={containerStyle} 
        className={`${containerClasses} py-2 ${className}`}
      >
        <div 
          style={{ 
            height: `${heightPx ? Math.max(heightPx / 2, 8) : 12}px`,
          }}
          className="flex items-center justify-center w-full"
        >
          {style === 'line' && (
            <div 
              style={{ backgroundColor: lineColor, height: `${thickness}px` }} 
              className="w-full" 
            />
          )}
          {style === 'dashed' && (
            <div 
              style={{ borderColor: lineColor, borderWidth: `${thickness}px` }} 
              className="w-full border-dashed" 
            />
          )}
          {style === 'dots' && (
            <div className="flex items-center justify-center gap-2">
              <span style={{ backgroundColor: lineColor }} className="w-1.5 h-1.5 rounded-full" />
              <span style={{ backgroundColor: lineColor }} className="w-1.5 h-1.5 rounded-full" />
              <span style={{ backgroundColor: lineColor }} className="w-1.5 h-1.5 rounded-full" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback if empty block or unrecognized type
  return null;
};
