/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProductCustomDetailItem } from '../types/pharmacy';
import { Check, Dot, Hash, Minus, ExternalLink } from 'lucide-react';

interface CustomDetailsRendererProps {
  items?: ProductCustomDetailItem[];
  className?: string;
  isPreview?: boolean;
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, opacityPercent: number = 100): string {
  if (!hex) return 'transparent';
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return hex;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const alpha = Math.max(0, Math.min(1, opacityPercent / 100));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const CustomDetailsRenderer: React.FC<CustomDetailsRendererProps> = ({
  items,
  className = '',
  isPreview = false,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, idx) => {
        const type = item.type || (item.image && item.text ? 'image_text' : 'card');
        const containerBg = item.bgColor
          ? hexToRgba(item.bgColor, item.bgOpacity ?? 100)
          : undefined;

        // ==========================================
        // 1. IMAGE + TEXT ELEMENT
        // ==========================================
        // ==========================================
        // 1. IMAGE + TEXT ELEMENT (Single Horizontal Line: (Image Text))
        // ==========================================
        if (type === 'image_text') {
          const isRight = item.imagePosition === 'right';
          const isInline = item.imageTextInline !== false; // Default true: title & text flow inline in the single line

          // Image size
          let imgSizeClass = 'w-11 h-11 sm:w-12 sm:h-12';
          if (item.imageSize === 'tiny' || item.imageSize === 'extra_small') imgSizeClass = 'w-7 h-7 sm:w-8 sm:h-8';
          else if (item.imageSize === 'small') imgSizeClass = 'w-9 h-9 sm:w-10 sm:h-10';
          else if (item.imageSize === 'large') imgSizeClass = 'w-14 h-14 sm:w-16 sm:h-16';

          const roundedClass =
            item.imageRounded === 'full'
              ? 'rounded-full'
              : item.imageRounded === 'xl'
              ? 'rounded-2xl'
              : item.imageRounded === 'md'
              ? 'rounded-lg'
              : item.imageRounded === 'none'
              ? 'rounded-none'
              : 'rounded-xl';

          const imgElement = item.image ? (
            <div
              className={`shrink-0 overflow-hidden ${imgSizeClass} ${roundedClass} border border-black/10 bg-white/60 shadow-2xs flex items-center justify-center`}
              style={
                item.customImageSizePx
                  ? { width: `${item.customImageSizePx}px`, height: `${item.customImageSizePx}px` }
                  : undefined
              }
            >
              {item.imageLinkUrl ? (
                <a
                  href={item.imageLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full relative group"
                  title="Open Link"
                >
                  <img
                    src={item.image}
                    alt={item.title || 'Product Highlight'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              ) : (
                <img
                  src={item.image}
                  alt={item.title || 'Product Highlight'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          ) : null;

          return (
            <div
              key={item.id || idx}
              style={{
                backgroundColor: containerBg || '#FAF6F0',
                color: item.textColor || '#14291D',
              }}
              className={`rounded-2xl p-3 sm:p-3.5 border border-black/10 shadow-xs flex flex-row items-center gap-2.5 sm:gap-3.5 flex-nowrap ${
                isRight ? 'flex-row-reverse justify-between' : 'justify-start'
              }`}
            >
              {imgElement}

              <div className="min-w-0 flex-1">
                {isInline ? (
                  <div className="leading-snug" style={{ fontSize: item.textSize || '13px' }}>
                    {item.title && (
                      <span
                        className="font-serif font-bold text-xs sm:text-sm mr-1.5 inline"
                        style={{ color: item.textColor || '#14291D' }}
                      >
                        {item.title}{item.text ? ':' : ''}
                      </span>
                    )}
                    {item.text && (
                      <span
                        className="opacity-90 inline"
                        style={{ color: item.textColor || '#2D281F' }}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    {item.title && (
                      <h4
                        className="font-serif font-bold text-xs sm:text-sm leading-tight mb-0.5"
                        style={{ color: item.textColor || '#14291D' }}
                      >
                        {item.title}
                      </h4>
                    )}
                    {item.text && (
                      <p
                        className="leading-snug opacity-90 text-[11.5px] sm:text-xs"
                        style={{
                          fontSize: item.textSize || '12.5px',
                          color: item.textColor || '#2D281F',
                        }}
                      >
                        {item.text}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // ==========================================
        // 2. TEXT ELEMENT
        // ==========================================
        if (type === 'text') {
          return (
            <div
              key={item.id || idx}
              style={{
                backgroundColor: containerBg,
                color: item.textColor || '#14291D',
                textAlign: item.textAlignment || 'left',
              }}
              className={`rounded-2xl ${
                containerBg ? 'p-4 sm:p-5 border border-black/10 shadow-xs' : 'py-2 px-1'
              }`}
            >
              {item.title && (
                <h4
                  className="font-serif font-bold text-sm sm:text-base mb-1"
                  style={{ color: item.textColor || '#14291D' }}
                >
                  {item.title}
                </h4>
              )}
              <div
                style={{
                  fontSize: item.textSize || '14px',
                  fontWeight: item.textBold ? 'bold' : 'normal',
                  fontStyle: item.textItalic ? 'italic' : 'normal',
                  color: item.textColor || '#14291D',
                  lineHeight: '1.65',
                }}
                className="whitespace-pre-line"
              >
                {item.text || 'Text element content...'}
              </div>
            </div>
          );
        }

        // ==========================================
        // 3. IMAGE ELEMENT
        // ==========================================
        if (type === 'image') {
          let alignClass = 'justify-center text-center';
          if (item.imageAlignment === 'left') alignClass = 'justify-start text-left';
          if (item.imageAlignment === 'right') alignClass = 'justify-end text-right';

          let sizeClass = 'max-w-md w-full';
          if (item.imageSize === 'compact') sizeClass = 'max-w-[120px] w-full';
          else if (item.imageSize === 'small') sizeClass = 'max-w-[200px] w-full';
          else if (item.imageSize === 'large') sizeClass = 'max-w-xl w-full';
          else if (item.imageSize === 'full') sizeClass = 'w-full';

          return (
            <div
              key={item.id || idx}
              style={{ backgroundColor: containerBg }}
              className={`rounded-2xl ${containerBg ? 'p-4 border border-black/10 shadow-xs' : 'py-2'} flex flex-col ${alignClass}`}
            >
              {item.image && (
                <div
                  className={`inline-block overflow-hidden rounded-xl border border-black/10 bg-white/60 shadow-2xs ${sizeClass}`}
                  style={
                    item.customImageSizePx
                      ? { maxWidth: `${item.customImageSizePx}px` }
                      : undefined
                  }
                >
                  <img
                    src={item.image}
                    alt={item.imageCaption || 'Product Highlight'}
                    className="w-full h-auto object-cover max-h-[420px]"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {item.imageCaption && (
                <p className="text-xs text-[#6F6452] mt-1.5 italic max-w-lg">
                  {item.imageCaption}
                </p>
              )}
            </div>
          );
        }

        // ==========================================
        // 4. RICH TEXT LIST ELEMENT
        // ==========================================
        if (type === 'rich_text_list') {
          const listType = item.listType || 'bullet';
          const itemsList = item.listItems && item.listItems.length > 0 ? item.listItems : ['Item 1', 'Item 2'];
          const spacingClass =
            item.listSpacing === 'compact'
              ? 'space-y-1'
              : item.listSpacing === 'relaxed'
              ? 'space-y-3'
              : 'space-y-2';

          return (
            <div
              key={item.id || idx}
              style={{
                backgroundColor: containerBg || '#FAF7F2',
                color: item.listTextColor || '#14291D',
              }}
              className="rounded-2xl p-4 sm:p-5 border border-black/10 shadow-xs"
            >
              {item.listTitle && (
                <h4
                  className="font-serif font-bold text-sm sm:text-base mb-3 pb-1.5 border-b border-black/10"
                  style={{ color: item.listTextColor || '#14291D' }}
                >
                  {item.listTitle}
                </h4>
              )}

              <ul className={spacingClass}>
                {itemsList.map((li, lIdx) => (
                  <li
                    key={lIdx}
                    className="flex items-start gap-2.5"
                    style={{
                      fontSize: item.listFontSize || '13.5px',
                      color: item.listTextColor || '#2C2519',
                    }}
                  >
                    {listType === 'check' && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: item.listIconColor ? `${item.listIconColor}20` : '#2C5E4320',
                          color: item.listIconColor || '#2C5E43',
                        }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}

                    {listType === 'numbered' && (
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-bold font-mono mt-0.5"
                        style={{
                          backgroundColor: item.listIconColor || '#14291D',
                          color: '#FFFFFF',
                        }}
                      >
                        {lIdx + 1}
                      </span>
                    )}

                    {listType === 'dash' && (
                      <span
                        className="shrink-0 font-bold mt-0.5"
                        style={{ color: item.listIconColor || '#C2933C' }}
                      >
                        —
                      </span>
                    )}

                    {listType === 'bullet' && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0 mt-2"
                        style={{ backgroundColor: item.listIconColor || '#2C5E43' }}
                      />
                    )}

                    <span className="leading-relaxed flex-1">{li}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // ==========================================
        // 5. TABLE ELEMENT
        // ==========================================
        if (type === 'table') {
          const headers = item.tableHeaders && item.tableHeaders.length > 0 ? item.tableHeaders : ['Column 1', 'Column 2'];
          const rows = item.tableRows && item.tableRows.length > 0 ? item.tableRows : [['Value 1', 'Value 2']];
          const isStriped = item.tableStyle !== 'minimal';
          const fontSize = item.tableFontSize || '12.5px';

          return (
            <div
              key={item.id || idx}
              style={{ backgroundColor: containerBg || '#FFFFFF' }}
              className="rounded-2xl p-4 sm:p-5 border border-black/10 shadow-xs space-y-2.5 overflow-hidden"
            >
              {item.tableTitle && (
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#14291D]">
                  {item.tableTitle}
                </h4>
              )}

              <div className="overflow-x-auto rounded-xl border border-[#DDD5C5] scrollbar-thin">
                <table
                  className="w-full text-left border-collapse"
                  style={{ fontSize }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: item.tableHeaderBgColor || '#14291D',
                        color: item.tableHeaderTextColor || '#FFFFFF',
                      }}
                    >
                      {headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] border-b border-[#C8BEAD]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`transition-colors ${
                          isStriped && rIdx % 2 === 1 ? 'bg-[#FAF7F2]' : 'bg-white'
                        } hover:bg-[#F2ECE1]/60`}
                        style={{
                          borderBottom:
                            rIdx < rows.length - 1
                              ? `1px solid ${item.tableBorderColor || '#EAE3D4'}`
                              : 'none',
                        }}
                      >
                        {headers.map((_, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-3.5 py-2.5 font-medium"
                            style={{ color: item.tableCellTextColor || '#272015' }}
                          >
                            {row[cIdx] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // ==========================================
        // 6. LEGACY CARD ELEMENT (Backwards Compatibility)
        // ==========================================
        const isLarge = item.size === 'large';
        const isSmall = item.size === 'small';

        return (
          <div
            key={item.id || idx}
            style={{
              backgroundColor: containerBg || '#FAF5EE',
              color: item.textColor || '#14291D',
            }}
            className={`rounded-2xl border border-black/10 shadow-xs transition-all flex ${
              isLarge
                ? 'p-4 sm:p-5 flex-col sm:flex-row items-start sm:items-center gap-4'
                : isSmall
                ? 'p-3 items-center gap-3'
                : 'p-4 flex-col sm:flex-row items-center gap-3.5'
            }`}
          >
            {item.image && (
              <div
                className={`overflow-hidden rounded-xl shrink-0 border border-black/10 bg-white/60 shadow-2xs ${
                  isLarge
                    ? 'w-16 h-16 sm:w-20 sm:h-20'
                    : isSmall
                    ? 'w-9 h-9'
                    : 'w-12 h-12 sm:w-14 sm:h-14'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title || 'Detail'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4
                className={`font-serif font-bold leading-snug ${
                  isLarge ? 'text-base sm:text-lg' : isSmall ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                }`}
              >
                {item.title || 'Detail Card'}
              </h4>
              {item.text && (
                <p
                  className={`mt-0.5 opacity-90 leading-relaxed ${
                    isLarge ? 'text-xs sm:text-sm' : isSmall ? 'text-[11px]' : 'text-xs'
                  }`}
                >
                  {item.text}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
