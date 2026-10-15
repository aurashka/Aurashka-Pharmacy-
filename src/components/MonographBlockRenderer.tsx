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
import { 
  ExternalLink,
  Sparkles,
  Leaf,
  Shield,
  Clock,
  Info,
  Heart,
  Beaker,
  Award,
  BookOpen,
  Pill,
  CheckCircle,
  Star,
  Feather,
  Eye,
  Tag as TagIcon
} from 'lucide-react';

interface MonographBlockRendererProps {
  block: MonographContentBlock;
  className?: string;
  isProductView?: boolean;
}

export const renderCardIcon = (iconName?: string, customColor?: string) => {
  if (!iconName) return null;
  const props = { className: "w-4 h-4 shrink-0", style: customColor ? { color: customColor } : undefined };
  switch (iconName.toLowerCase()) {
    case 'leaf': return <Leaf {...props} />;
    case 'sparkles': return <Sparkles {...props} />;
    case 'shield': return <Shield {...props} />;
    case 'clock': return <Clock {...props} />;
    case 'info': return <Info {...props} />;
    case 'heart': return <Heart {...props} />;
    case 'beaker': return <Beaker {...props} />;
    case 'award': return <Award {...props} />;
    case 'book':
    case 'bookopen': return <BookOpen {...props} />;
    case 'pill': return <Pill {...props} />;
    case 'check':
    case 'checkcircle': return <CheckCircle {...props} />;
    case 'star': return <Star {...props} />;
    case 'feather': return <Feather {...props} />;
    case 'eye': return <Eye {...props} />;
    case 'tag': return <TagIcon {...props} />;
    default: return <Sparkles {...props} />;
  }
};

export const MonographBlockRenderer: React.FC<MonographBlockRendererProps> = ({
  block,
  className = '',
  isProductView = false,
}) => {
  let containerClasses = getBlockContainerClasses(block.design);
  const containerStyle = resolveBlockCustomStyle(block.design);

  if (isProductView) {
    // Keep margins clean without stripping custom borders, backgrounds, or styling created in admin
    containerClasses = containerClasses.replace(/my-[0-9\.]+/g, 'my-1');
  }

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
      <div className="space-y-1.5">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {tags.map((tag: TagItem, idx: number) => {
              const bg = tag.bgColor ? hexToRgba(tag.bgColor, tag.bgOpacity ?? 100) : hexToRgba('#14291D', tag.bgOpacity ?? 100);
              const textCol = tag.textColor ? hexToRgba(tag.textColor, tag.textColorOpacity ?? 100) : hexToRgba('#FFFFFF', tag.textColorOpacity ?? 100);
              const roundedClass = 
                tag.style === 'square' ? 'rounded-xs' :
                tag.style === 'pill' ? 'rounded-full' : 'rounded-md';

              const customStyle: React.CSSProperties = {
                backgroundColor: bg,
                color: textCol,
              };

              if (tag.customFontSize) {
                const fs = tag.customFontSize.trim();
                customStyle.fontSize = fs.endsWith('px') || fs.endsWith('rem') || fs.endsWith('em') ? fs : `${fs}px`;
              } else if (tag.fontSize && (tag.fontSize.endsWith('px') || tag.fontSize.endsWith('rem'))) {
                customStyle.fontSize = tag.fontSize;
              }

              const paddingClass = 
                tag.size === 'compact' ? 'px-2 py-0.5 text-[10.5px]' :
                tag.size === 'spacious' ? 'px-3.5 py-1.5 text-xs sm:text-sm' :
                'px-2.5 py-1 text-xs';

              const textFontSize = (!tag.customFontSize && !tag.fontSize?.endsWith('px'))
                ? (tag.fontSize === 'sm' ? 'text-xs sm:text-[13px]' : tag.fontSize === 'base' ? 'text-sm' : tag.fontSize === 'lg' ? 'text-sm sm:text-base' : 'text-[11px] sm:text-xs')
                : '';

              return (
                <span
                  key={tag.id || idx}
                  style={customStyle}
                  className={`inline-flex items-center font-semibold shadow-2xs transition-transform hover:scale-[1.02] ${roundedClass} ${paddingClass} ${textFontSize}`}
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

    // 1. Icon & Header (Title & Description)
    const cardTitle = card.title;
    const cardDescription = card.description || card.subtitle;
    const hasHeader = card.showHeader !== false && !!(card.icon || cardTitle || cardDescription);

    const iconNode = card.icon && card.icon !== 'none' ? (
      <span 
        className="p-1.5 rounded-lg shrink-0 inline-flex items-center justify-center bg-black/5"
        style={card.iconColor ? { color: card.iconColor } : undefined}
      >
        {renderCardIcon(card.icon, card.iconColor)}
      </span>
    ) : null;

    const titleStyle = card.titleColor ? { color: card.titleColor } : undefined;
    const descriptionStyle = card.descriptionColor ? { color: card.descriptionColor } : undefined;

    const headerElement = hasHeader ? (
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-2">
          {iconNode}
          {cardTitle && (
            card.headerLevel === 'h2' ? (
              <h2 style={titleStyle} className="font-serif font-bold text-lg sm:text-xl tracking-tight leading-snug">
                {cardTitle}
              </h2>
            ) : card.headerLevel === 'h4' ? (
              <h4 style={titleStyle} className="font-serif font-bold text-xs sm:text-sm tracking-tight leading-snug">
                {cardTitle}
              </h4>
            ) : (
              <h3 style={titleStyle} className="font-serif font-bold text-sm sm:text-base tracking-tight leading-snug">
                {cardTitle}
              </h3>
            )
          )}
        </div>

        {cardDescription && (
          <p style={descriptionStyle} className="text-xs sm:text-[13px] opacity-80 leading-relaxed font-sans">
            {cardDescription}
          </p>
        )}

        {card.showAccentBorder && (
          <div className="pt-1">
            <div 
              className="h-0.5 w-10 rounded-full" 
              style={{ backgroundColor: card.titleColor || block.design?.textColor || '#B4741E' }} 
            />
          </div>
        )}
      </div>
    ) : null;

    // Helper to render individual CardElementItem
    const renderElementItem = (item: any, idx: number) => {
      switch (item.type) {
        // 1) IMAGE
        case 'image': {
          if (!item.imageUrl) return null;
          const sizeStyle: React.CSSProperties = {};
          if (item.imageSize) {
            const rawSize = String(item.imageSize).trim();
            if (rawSize.endsWith('px') || rawSize.endsWith('%') || rawSize.endsWith('rem')) {
              sizeStyle.width = rawSize;
            } else if (rawSize === 'compact') sizeStyle.width = '80px';
            else if (rawSize === 'small') sizeStyle.width = '120px';
            else if (rawSize === 'medium') sizeStyle.width = '200px';
            else if (rawSize === 'large') sizeStyle.width = '320px';
            else if (rawSize === 'full') sizeStyle.width = '100%';
            else if (!isNaN(Number(rawSize))) sizeStyle.width = `${rawSize}px`;
            else sizeStyle.width = rawSize;
          } else {
            sizeStyle.width = '160px';
          }
          sizeStyle.maxWidth = '100%';

          const roundedStyle: React.CSSProperties = {};
          if (item.imageRounded) {
            const r = String(item.imageRounded).trim();
            if (r === 'none') roundedStyle.borderRadius = '0px';
            else if (r === 'sm') roundedStyle.borderRadius = '4px';
            else if (r === 'md') roundedStyle.borderRadius = '8px';
            else if (r === 'lg') roundedStyle.borderRadius = '12px';
            else if (r === 'xl') roundedStyle.borderRadius = '16px';
            else if (r === '2xl') roundedStyle.borderRadius = '24px';
            else if (r === 'full') roundedStyle.borderRadius = '9999px';
            else if (r.endsWith('px') || r.endsWith('rem')) roundedStyle.borderRadius = r;
            else if (!isNaN(Number(r))) roundedStyle.borderRadius = `${r}px`;
            else roundedStyle.borderRadius = '12px';
          } else {
            roundedStyle.borderRadius = '12px';
          }

          const alignClass = 
            item.imageAlignment === 'right' ? 'justify-end' :
            item.imageAlignment === 'center' ? 'justify-center' : 'justify-start';

          return (
            <div key={item.id || idx} className={`flex flex-col ${item.imageAlignment === 'right' ? 'items-end' : item.imageAlignment === 'center' ? 'items-center' : 'items-start'} my-2`}>
              <div 
                style={{ ...sizeStyle, ...roundedStyle }} 
                className="overflow-hidden border border-black/10 shadow-2xs bg-stone-100 shrink-0 relative group/img transition-all"
              >
                {item.imageLinkUrl ? (
                  <a
                    href={item.imageLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full relative"
                    title="Open link in new tab"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt || 'Card image'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
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
                    src={item.imageUrl}
                    alt={item.imageAlt || 'Card image'}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                )}
              </div>
              {item.imageCaption && (
                <p className="text-[11px] text-stone-500 mt-1 italic font-sans max-w-sm">
                  {item.imageCaption}
                </p>
              )}
            </div>
          );
        }

        // 2) TEXT
        case 'text': {
          if (!item.text) return null;
          const textStyleObj: React.CSSProperties = {};
          if (item.textSize) {
            const rawSize = String(item.textSize).trim();
            textStyleObj.fontSize = rawSize.endsWith('px') || rawSize.endsWith('rem') || rawSize.endsWith('em') ? rawSize : `${rawSize}px`;
          }
          if (item.textColor) {
            textStyleObj.color = item.textColor;
          }

          const textClasses = [
            item.textBold ? 'font-bold' : 'font-normal',
            item.textStyle === 'italic' ? 'italic' : '',
            item.textUnderline ? 'underline' : '',
            item.textAlignment === 'center' ? 'text-center' :
            item.textAlignment === 'right' ? 'text-right' :
            item.textAlignment === 'justify' ? 'text-justify' : 'text-left',
            'leading-relaxed font-sans'
          ].filter(Boolean).join(' ');

          return (
            <div key={item.id || idx} className="my-1.5">
              <p style={textStyleObj} className={textClasses}>
                {item.text}
              </p>
            </div>
          );
        }

        // 3) TAG
        case 'tag': {
          if (!item.tags || item.tags.length === 0) return null;
          const tagAlign = 
            item.tagsAlignment === 'center' ? 'justify-center' :
            item.tagsAlignment === 'right' ? 'justify-end' : 'justify-start';

          return (
            <div key={item.id || idx} className="my-1">
              {item.tagsTitle && (
                <h5 className="font-serif font-bold text-xs opacity-80 mb-1">{item.tagsTitle}</h5>
              )}
              <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${tagAlign}`}>
                {item.tags.map((tag: TagItem, tIdx: number) => {
                  const bg = tag.bgColor ? hexToRgba(tag.bgColor, tag.bgOpacity ?? 100) : hexToRgba('#14291D', tag.bgOpacity ?? 100);
                  const textCol = tag.textColor ? hexToRgba(tag.textColor, tag.textColorOpacity ?? 100) : hexToRgba('#FFFFFF', tag.textColorOpacity ?? 100);
                  const roundedClass = 
                    tag.style === 'square' ? 'rounded-xs' :
                    tag.style === 'pill' ? 'rounded-full' : 'rounded-md';

                  const customStyle: React.CSSProperties = {
                    backgroundColor: bg,
                    color: textCol,
                  };

                  if (tag.customFontSize) {
                    const fs = tag.customFontSize.trim();
                    customStyle.fontSize = fs.endsWith('px') || fs.endsWith('rem') || fs.endsWith('em') ? fs : `${fs}px`;
                  } else if (tag.fontSize && (tag.fontSize.endsWith('px') || tag.fontSize.endsWith('rem'))) {
                    customStyle.fontSize = tag.fontSize;
                  }

                  const paddingClass = 
                    tag.size === 'compact' ? 'px-2 py-0.5 text-[10.5px]' :
                    tag.size === 'spacious' ? 'px-3.5 py-1.5 text-xs sm:text-sm' :
                    'px-2.5 py-1 text-xs';

                  const textFontSize = (!tag.customFontSize && !tag.fontSize?.endsWith('px'))
                    ? (tag.fontSize === 'sm' ? 'text-xs sm:text-[13px]' : tag.fontSize === 'base' ? 'text-sm' : tag.fontSize === 'lg' ? 'text-sm sm:text-base' : 'text-[11px] sm:text-xs')
                    : '';

                  return (
                    <span
                      key={tag.id || tIdx}
                      style={customStyle}
                      className={`inline-flex items-center font-semibold shadow-2xs transition-transform hover:scale-[1.02] ${roundedClass} ${paddingClass} ${textFontSize}`}
                    >
                      {tag.text}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        }

        // 4) IMAGE + TEXT (IN A SINGLE HORIZONTAL LINE)
        case 'image_text': {
          const isRight = item.horizontalImagePosition === 'right';
          const vAlign = 
            item.horizontalAlignment === 'start' ? 'items-start' :
            item.horizontalAlignment === 'end' ? 'items-end' : 'items-center';

          const imgSizeStyle: React.CSSProperties = {};
          if (item.horizontalImageSize) {
            const rawSize = String(item.horizontalImageSize).trim();
            imgSizeStyle.width = rawSize.endsWith('px') || rawSize.endsWith('rem') ? rawSize : `${rawSize}px`;
            imgSizeStyle.height = imgSizeStyle.width;
          } else {
            imgSizeStyle.width = '72px';
            imgSizeStyle.height = '72px';
          }

          const imgRoundedStyle: React.CSSProperties = {};
          if (item.horizontalImageRounded) {
            const r = String(item.horizontalImageRounded).trim();
            if (r === 'none') imgRoundedStyle.borderRadius = '0px';
            else if (r === 'sm') imgRoundedStyle.borderRadius = '4px';
            else if (r === 'md') imgRoundedStyle.borderRadius = '8px';
            else if (r === 'lg') imgRoundedStyle.borderRadius = '12px';
            else if (r === 'xl') imgRoundedStyle.borderRadius = '16px';
            else if (r === 'full') imgRoundedStyle.borderRadius = '9999px';
            else if (r.endsWith('px')) imgRoundedStyle.borderRadius = r;
            else imgRoundedStyle.borderRadius = '12px';
          } else {
            imgRoundedStyle.borderRadius = '12px';
          }

          const txtStyleObj: React.CSSProperties = {};
          if (item.horizontalTextSize) {
            const rawSize = String(item.horizontalTextSize).trim();
            txtStyleObj.fontSize = rawSize.endsWith('px') || rawSize.endsWith('rem') ? rawSize : `${rawSize}px`;
          }
          if (item.horizontalTextColor) {
            txtStyleObj.color = item.horizontalTextColor;
          }

          const txtClass = [
            item.horizontalTextBold ? 'font-bold' : 'font-normal',
            item.horizontalTextItalic ? 'italic' : '',
            item.horizontalTextUnderline ? 'underline' : '',
            'leading-relaxed font-sans'
          ].filter(Boolean).join(' ');

          const imgNode = item.horizontalImageUrl ? (
            <div 
              style={{ ...imgSizeStyle, ...imgRoundedStyle }} 
              className="overflow-hidden border border-black/10 shadow-2xs bg-stone-100 shrink-0 relative group/himg"
            >
              {item.horizontalImageLinkUrl ? (
                <a
                  href={item.horizontalImageLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full relative"
                  title="Open link in new tab"
                >
                  <img
                    src={item.horizontalImageUrl}
                    alt="Herb imagery"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/himg:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <span className="absolute bottom-1 right-1 p-0.5 rounded bg-black/60 text-white opacity-0 group-hover/himg:opacity-100 transition-opacity">
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </a>
              ) : (
                <img
                  src={item.horizontalImageUrl}
                  alt="Herb imagery"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              )}
            </div>
          ) : null;

          return (
            <div key={item.id || idx} className={`flex flex-row ${vAlign} gap-3 sm:gap-4 my-2`}>
              {!isRight && imgNode}
              <div className="flex-1 min-w-0 space-y-1">
                {item.horizontalText && (
                  <p style={txtStyleObj} className={txtClass}>
                    {item.horizontalText}
                  </p>
                )}
                {item.horizontalLinkUrl && (
                  <a
                    href={item.horizontalLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#14291D] text-amber-300 hover:bg-[#203E2D] transition-colors w-fit shadow-2xs mt-1"
                  >
                    <span>{item.horizontalLinkLabel || 'View Link'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {isRight && imgNode}
            </div>
          );
        }

        // 5) RICH TEXT LIST
        case 'rich_text_list': {
          if (!item.listItems || item.listItems.length === 0) return null;
          const listFontObj: React.CSSProperties = {};
          if (item.listFontSize) {
            const rawSize = String(item.listFontSize).trim();
            listFontObj.fontSize = rawSize.endsWith('px') || rawSize.endsWith('rem') ? rawSize : `${rawSize}px`;
          }
          if (item.listTextColor) {
            listFontObj.color = item.listTextColor;
          }

          const spaceClass = 
            item.listSpacing === 'compact' ? 'space-y-1' :
            item.listSpacing === 'relaxed' ? 'space-y-2.5' : 'space-y-1.5';

          return (
            <ul key={item.id || idx} className={`${spaceClass} my-2 font-sans`} style={listFontObj}>
              {item.listItems.map((li: string, lIdx: number) => (
                <li key={lIdx} className="flex items-start gap-2">
                  {item.listStyle === 'numbered' ? (
                    <span 
                      className="font-mono font-bold text-xs shrink-0 mt-0.5" 
                      style={item.listIconColor ? { color: item.listIconColor } : undefined}
                    >
                      {lIdx + 1}.
                    </span>
                  ) : item.listStyle === 'check' ? (
                    <span 
                      className="shrink-0 mt-0.5 inline-flex items-center justify-center"
                      style={item.listIconColor ? { color: item.listIconColor } : { color: '#16A34A' }}
                    >
                      ✓
                    </span>
                  ) : item.listStyle === 'dash' ? (
                    <span 
                      className="font-bold text-xs shrink-0 mt-0.5" 
                      style={item.listIconColor ? { color: item.listIconColor } : undefined}
                    >
                      —
                    </span>
                  ) : (
                    <span 
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-2" 
                      style={item.listIconColor ? { backgroundColor: item.listIconColor } : { backgroundColor: 'currentColor' }} 
                    />
                  )}
                  <span className="flex-1 leading-relaxed">{li}</span>
                </li>
              ))}
            </ul>
          );
        }

        // 6) CUSTOM TABLE
        case 'custom_table': {
          const tableFontSizeObj: React.CSSProperties = {};
          if (item.tableFontSize) {
            const rawSize = String(item.tableFontSize).trim();
            tableFontSizeObj.fontSize = rawSize.endsWith('px') || rawSize.endsWith('rem') ? rawSize : `${rawSize}px`;
          }

          return (
            <div 
              key={item.id || idx} 
              className="overflow-x-auto my-2.5 rounded-lg border shadow-2xs" 
              style={{ borderColor: item.tableBorderColor || '#DDD5C5' }}
            >
              <table className="w-full border-collapse font-sans text-xs" style={tableFontSizeObj}>
                {item.tableHeaders && item.tableHeaders.length > 0 && (
                  <thead>
                    <tr style={{ backgroundColor: item.tableHeaderBgColor || '#FAF6F0', color: item.tableHeaderTextColor || '#14291D' }}>
                      {item.tableHeaders.map((h: string, hIdx: number) => (
                        <th key={hIdx} className="px-3 py-2 text-left font-bold border-b" style={{ borderColor: item.tableBorderColor || '#DDD5C5' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {item.tableRows?.map((row: string[], rIdx: number) => (
                    <tr
                      key={rIdx}
                      className={item.tableZebra && rIdx % 2 === 1 ? 'bg-black/[0.02]' : 'bg-transparent'}
                      style={{ color: item.tableCellTextColor || '#2D261A' }}
                    >
                      {row.map((cell: string, cIdx: number) => (
                        <td key={cIdx} className="px-3 py-2 border-b" style={{ borderColor: item.tableBorderColor || '#EAE3D4' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // 7) DIVIDER
        case 'divider': {
          const thickness = item.dividerThickness || 1;
          const heightPx = item.dividerHeightPx || 16;
          const divColor = item.dividerColor || '#E2D9CB';

          if (item.dividerStyle === 'spacing_only') {
            return <div key={item.id || idx} style={{ height: `${heightPx}px` }} />;
          }

          return (
            <div 
              key={item.id || idx} 
              className="w-full flex items-center justify-center" 
              style={{ height: `${heightPx}px` }}
            >
              <hr
                className="w-full"
                style={{
                  borderTopWidth: `${thickness}px`,
                  borderColor: divColor,
                  borderStyle: item.dividerStyle === 'dashed' ? 'dashed' : item.dividerStyle === 'dots' ? 'dotted' : 'solid',
                }}
              />
            </div>
          );
        }

        default:
          return null;
      }
    };

    // If card has structured elements array, render header + elements
    if (card.elements && card.elements.length > 0) {
      return (
        <div 
          style={containerStyle} 
          className={`${containerClasses} ${className}`}
        >
          {headerElement}
          <div className="space-y-1">
            {card.elements.map((el, i) => renderElementItem(el, i))}
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // BACKWARD COMPATIBLE FALLBACK (Legacy card format)
    // ─────────────────────────────────────────────────────────────
    // Image sizing & rendering
    const sizeClasses = {
      compact: 'w-16 h-16 sm:w-20 sm:h-20 shrink-0',
      small: 'w-20 h-20 sm:w-28 sm:h-28 shrink-0',
      medium: 'w-28 h-28 sm:w-36 sm:h-36 shrink-0',
      large: 'w-36 h-36 sm:w-48 sm:h-48 shrink-0',
      full: 'w-full max-w-sm',
    }[card.imageSize || 'small'] || 'w-20 h-20 sm:w-28 sm:h-28 shrink-0';

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
      <div className={`${sizeClasses} overflow-hidden ${roundedClass} border border-black/10 shadow-2xs bg-stone-100 shrink-0 relative group/img`}>
        {card.imageLinkUrl ? (
          <a
            href={card.imageLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full relative overflow-hidden"
            title="Open link in new tab"
          >
            <img
              src={card.imageUrl}
              alt={card.imageAlt || card.title || 'Card imagery'}
              className={`w-full h-full ${aspectClass} object-cover transition-transform duration-300 group-hover/img:scale-105`}
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
            className={`w-full h-full ${aspectClass} object-cover transition-transform duration-300 hover:scale-105`}
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

    // Text & Link inside horizontal row
    const rowTextSizeClass = 
      card.rowTextSize === 'xs' ? 'text-xs' :
      card.rowTextSize === 'base' ? 'text-sm sm:text-base' :
      card.rowTextSize === 'lg' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm';

    const rowTextColorStyle = card.rowTextColor ? { color: card.rowTextColor } : undefined;

    const rowLinkElement = card.rowLinkUrl ? (
      <a
        href={card.rowLinkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#14291D] text-amber-300 hover:bg-[#203E2D] transition-colors w-fit shadow-2xs mt-1"
      >
        <span>{card.rowLinkLabel || 'View Link'}</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    ) : null;

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

    // Mode determination: "Only image" vs "( Image - Text ) in a single horizontal line"
    const isImageOnly = card.layoutMode === 'image_only' || (!card.rowText && !card.rowLinkUrl && card.showImage && !!card.imageUrl);

    // 1. Only Image block
    const onlyImageElement = isImageOnly && card.showImage && card.imageUrl ? (
      <div className={`py-1 flex ${card.imagePosition === 'right' ? 'justify-end' : card.imagePosition === 'top' || card.imagePosition === 'bottom' ? 'justify-center' : 'justify-start'}`}>
        {imageElement}
      </div>
    ) : null;

    // 2. Horizontal Row (Image & Text together in a SINGLE horizontal line)
    const hasHorizontalRow = !isImageOnly && card.showHorizontalRow !== false && (
      (card.showImage && card.imageUrl) || 
      card.rowText || 
      card.rowLinkUrl
    );

    const horizontalRowElement = hasHorizontalRow ? (
      <div className="flex flex-row items-center gap-3 sm:gap-4 py-1">
        {/* If image position is left (default) */}
        {card.imagePosition !== 'right' && imageElement}

        {/* Text and Clickable Link in the same horizontal line */}
        <div className="flex-1 min-w-0 space-y-1">
          {card.rowText && (
            <p 
              style={rowTextColorStyle} 
              className={`font-sans font-medium leading-relaxed ${rowTextSizeClass}`}
            >
              {card.rowText}
            </p>
          )}
          {rowLinkElement}
        </div>

        {/* If image position is right */}
        {card.imagePosition === 'right' && imageElement}
      </div>
    ) : null;

    return (
      <div 
        style={containerStyle} 
        className={`${containerClasses} ${className}`}
      >
        <div className="space-y-3">
          {/* 1. Tags at TOP of card */}
          {card.tagsPosition !== 'bottom' && card.tagsPosition !== 'middle' && tagsElement}

          {/* 2. Optional Card Header (Icon, Title & Description) */}
          {headerElement}

          {/* 3. Horizontal Row (Image & Text in single line) OR Only Image */}
          {isImageOnly ? onlyImageElement : horizontalRowElement}

          {/* Tags in middle if explicitly chosen */}
          {card.tagsPosition === 'middle' && tagsElement}

          {/* 4. Rich Text (if enabled) */}
          {richTextElement}

          {/* Tags at bottom if explicitly chosen */}
          {card.tagsPosition === 'bottom' && tagsElement}

          {/* 5. Action button if present */}
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
