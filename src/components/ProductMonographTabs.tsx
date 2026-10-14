import React, { useState, useEffect } from 'react';
import { 
  HerbalProduct, 
  ProductMonographTab, 
  MonographContentBlock 
} from '../types/pharmacy';
import { 
  getEffectiveMonographTabs, 
  getEffectiveTabBlocks,
  hexToRgba
} from '../utils/monographHelper';
import { MonographBlockRenderer } from './MonographBlockRenderer';
import { 
  ChevronDown, 
  ChevronUp, 
  Leaf, 
  Sparkles, 
  Clock, 
  Shield, 
  Info, 
  MessageSquare, 
  Layers, 
  Edit3,
  Bookmark,
  CheckCircle2,
  Heart,
  Beaker,
  Pill,
  Star,
  Award,
  Feather,
  BookOpen,
  Package,
  HelpCircle
} from 'lucide-react';

interface ProductMonographTabsProps {
  product: HerbalProduct;
  isAdmin?: boolean;
  onOpenAdminEdit?: () => void;
  className?: string;
  defaultExpandedIndex?: number;
}

export const ProductMonographTabs: React.FC<ProductMonographTabsProps> = ({
  product,
  isAdmin = false,
  onOpenAdminEdit,
  className = '',
  defaultExpandedIndex = 0,
}) => {
  const tabs = React.useMemo(() => {
    return getEffectiveMonographTabs(product);
  }, [product]);

  // Accordion rule: Only one tab can be expanded at a time
  const [expandedTabId, setExpandedTabId] = useState<string | null>(
    tabs[defaultExpandedIndex]?.id || tabs[0]?.id || null
  );

  // Sync if tabs change
  useEffect(() => {
    if (tabs.length > 0 && (!expandedTabId || !tabs.some(t => t.id === expandedTabId))) {
      setExpandedTabId(tabs[0].id);
    }
  }, [tabs]);

  const toggleTab = (tabId: string) => {
    // Accordion rule: clicking the open tab closes it, clicking another opens ONLY that one
    setExpandedTabId(prev => (prev === tabId ? null : tabId));
  };

  const getTabIcon = (iconName?: string, tabId?: string) => {
    const key = (iconName || tabId || '').toLowerCase();
    switch (key) {
      case 'none':
        return null;
      case 'overview':
      case 'info':
        return <Info className="w-4 h-4 shrink-0" />;
      case 'benefits':
      case 'sparkles':
        return <Sparkles className="w-4 h-4 shrink-0" />;
      case 'ingredients':
      case 'leaf':
        return <Leaf className="w-4 h-4 shrink-0" />;
      case 'dosage':
      case 'clock':
        return <Clock className="w-4 h-4 shrink-0" />;
      case 'specifications':
      case 'shield':
        return <Shield className="w-4 h-4 shrink-0" />;
      case 'faqs_reviews':
      case 'message':
        return <MessageSquare className="w-4 h-4 shrink-0" />;
      case 'star':
        return <Star className="w-4 h-4 shrink-0" />;
      case 'heart':
        return <Heart className="w-4 h-4 shrink-0" />;
      case 'beaker':
        return <Beaker className="w-4 h-4 shrink-0" />;
      case 'pill':
        return <Pill className="w-4 h-4 shrink-0" />;
      case 'bookmark':
        return <Bookmark className="w-4 h-4 shrink-0" />;
      case 'check':
      case 'checkcircle':
        return <CheckCircle2 className="w-4 h-4 shrink-0" />;
      case 'award':
        return <Award className="w-4 h-4 shrink-0" />;
      case 'feather':
        return <Feather className="w-4 h-4 shrink-0" />;
      case 'book':
        return <BookOpen className="w-4 h-4 shrink-0" />;
      case 'package':
        return <Package className="w-4 h-4 shrink-0" />;
      case 'help':
        return <HelpCircle className="w-4 h-4 shrink-0" />;
      default:
        return <Layers className="w-4 h-4 shrink-0" />;
    }
  };

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Top Header / Bar - Compact & Sleek */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5 py-0.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#14291D] text-amber-300 shadow-2xs">
            <Bookmark className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-sm sm:text-base font-bold text-[#14291D] tracking-tight">
                Product Monograph & Formulation Details
              </h3>
              <span className="text-[9.5px] font-mono font-semibold px-2 py-0.2 rounded-full bg-[#EAE4D7] text-[#554C3E] border border-[#D5CCBC]">
                {tabs.length} Sections
              </span>
            </div>
            <p className="text-[11px] text-[#6B6150] mt-0.2 leading-tight">
              Verified Ayurvedic Classical Pharmacopoeia Standards · Collapsible Sections
            </p>
          </div>
        </div>

        {/* Admin Quick Action Button */}
        {isAdmin && onOpenAdminEdit && (
          <button
            type="button"
            onClick={onOpenAdminEdit}
            className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#B4741E] font-semibold text-xs border border-[#DFCEB3] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Edit Monograph Accordions & Content Blocks"
          >
            <Edit3 className="w-3 h-3" />
            <span>Customize Collapsible Blocks</span>
          </button>
        )}
      </div>

      {/* Accordion Container: Compact, minimal whitespace */}
      <div className="space-y-2">
        {tabs.map((tab: ProductMonographTab) => {
          const isExpanded = expandedTabId === tab.id;
          const blocks: MonographContentBlock[] = getEffectiveTabBlocks(tab);
          const iconElement = getTabIcon(tab.icon, tab.id);

          // ─────────────────────────────────────────────────────────────
          // Active / Expand Color Mode Resolution ("Color or No Color")
          // ─────────────────────────────────────────────────────────────
          const colorMode = tab.activeColorMode || 'theme';
          const isNoColor = colorMode === 'no_color';
          const isCustomColor = colorMode === 'color';

          // Header Background styling
          let headerBgStyle: string | undefined = undefined;
          let headerBgClass = '';

          // Text / Title & Subtitle styling
          let titleColorStyle: string | undefined = undefined;
          let titleClass = '';
          let subtitleColorStyle: string | undefined = undefined;
          let subtitleClass = '';

          // Icon Badge styling
          let iconBadgeStyle: React.CSSProperties | undefined = undefined;
          let iconBadgeClass = '';

          // Container border styling
          let containerBorderStyle: React.CSSProperties | undefined = undefined;
          let containerClass = '';

          if (isExpanded) {
            if (isNoColor) {
              // ⚪ NO COLOR: Keep clean neutral without switching background or icon colors
              containerClass = 'border-[#DDD5C5] shadow-xs bg-white';
              headerBgClass = 'bg-white hover:bg-[#FAF8F5]';
              titleClass = 'text-[#2D261A]';
              subtitleClass = 'text-[#6F6452]';
              iconBadgeClass = 'bg-[#EAE3D5] text-[#4F4638]';
              if (tab.iconColor) {
                iconBadgeStyle = { color: tab.iconColor };
              }
            } else if (isCustomColor) {
              // 🎨 CUSTOM COLOR: User-specified expand background, text, icon, and border
              if (tab.activeBorderColor) {
                containerBorderStyle = { borderColor: tab.activeBorderColor };
                containerClass = 'shadow-xs bg-white ring-1 ring-black/5';
              } else {
                containerClass = 'border-[#C2B7A3] shadow-xs bg-white ring-1 ring-black/5';
              }

              if (tab.activeBgColor) {
                headerBgStyle = hexToRgba(tab.activeBgColor, tab.bgOpacity ?? 100);
              } else {
                headerBgClass = 'bg-[#FAF6F0]';
              }

              if (tab.activeTextColor) {
                titleColorStyle = tab.activeTextColor;
              } else {
                titleClass = 'text-[#14291D]';
              }

              if (tab.activeSubtitleColor) {
                subtitleColorStyle = tab.activeSubtitleColor;
              } else {
                subtitleClass = 'text-[#6F6452]';
              }

              // Custom icon badge
              iconBadgeStyle = {
                backgroundColor: tab.activeIconBgColor || tab.activeBgColor || '#14291D',
                color: tab.activeIconColor || '#FFFFFF',
              };
            } else {
              // 🟢 THEME HIGHLIGHT (Classic Ayurvedic Green & Gold)
              containerClass = 'border-[#C2B7A3] shadow-xs bg-white ring-1 ring-black/5';
              if (tab.bgColor) {
                headerBgStyle = hexToRgba(tab.bgColor, tab.bgOpacity ?? 100);
                titleColorStyle = tab.textColor;
              } else {
                headerBgClass = 'bg-[#FAF6F0]';
                titleClass = 'text-[#14291D]';
              }
              subtitleClass = 'text-[#6F6452]';
              iconBadgeClass = tab.bgColor ? '' : 'bg-[#14291D] text-amber-300';
              if (tab.bgColor) {
                iconBadgeStyle = { backgroundColor: tab.bgColor, color: tab.textColor || '#FFFFFF' };
              }
            }
          } else {
            // Collapsed state
            containerClass = 'border-[#E2D9CB] bg-[#FAF8F5] hover:border-[#D5CCBC] shadow-2xs';
            if (tab.bgColor) {
              headerBgStyle = hexToRgba(tab.bgColor, Math.min(tab.bgOpacity ?? 100, 20));
            } else {
              headerBgClass = 'hover:bg-[#F5F0E6]';
            }
            titleClass = 'text-[#2D261A]';
            subtitleClass = 'text-[#6F6452]';
            iconBadgeClass = 'bg-[#EAE3D5] text-[#4F4638]';
            if (tab.iconColor) {
              iconBadgeStyle = { color: tab.iconColor };
            }
          }

          return (
            <div
              key={tab.id}
              style={containerBorderStyle}
              className={`rounded-xl border transition-all duration-150 overflow-hidden ${containerClass}`}
            >
              {/* Accordion Header Bar - Compact padding */}
              <button
                type="button"
                onClick={() => toggleTab(tab.id)}
                aria-expanded={isExpanded}
                style={headerBgStyle ? { backgroundColor: headerBgStyle } : undefined}
                className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer select-none ${headerBgClass}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Icon badge (if icon is set and not 'none') */}
                  {iconElement && (
                    <span
                      style={iconBadgeStyle}
                      className={`p-1.5 rounded-lg shrink-0 transition-colors ${iconBadgeClass}`}
                    >
                      {iconElement}
                    </span>
                  )}

                  {/* Title and Subtitle / Description below Title */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 
                        style={titleColorStyle ? { color: titleColorStyle } : undefined}
                        className={`font-serif font-bold text-xs sm:text-sm tracking-tight leading-snug ${titleClass}`}
                      >
                        {tab.title}
                      </h4>
                    </div>

                    {tab.subtitle && (
                      <p 
                        style={subtitleColorStyle ? { color: subtitleColorStyle } : undefined}
                        className={`text-[11px] mt-0.5 line-clamp-2 ${subtitleClass}`}
                      >
                        {tab.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Chevron Indicator */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span 
                    className={`p-1 rounded-md border transition-transform duration-150 ${
                      isExpanded 
                        ? (isNoColor ? 'bg-[#FAF8F5] border-[#D5CCBC] text-[#4F4638] rotate-180' : 'bg-white border-[#D5CCBC] text-[#14291D] rotate-180')
                        : 'bg-[#EFEAE0] border-[#DDD5C5] text-[#6F6452]'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>

              {/* Accordion Content Panel - Compact & Borderless Cards with Divides */}
              {isExpanded && (
                <div className="px-3 sm:px-4 py-3 sm:py-3.5 border-t border-[#EDE5D8] bg-[#FFFFFF] animate-in fade-in duration-150">
                  {blocks.length === 0 ? (
                    <div className="py-5 text-center text-[#7A705E] space-y-1.5">
                      <Layers className="w-5 h-5 mx-auto text-[#B5A893]" />
                      <p className="text-xs font-semibold">No content blocks added to this section yet.</p>
                      {isAdmin && onOpenAdminEdit && (
                        <button
                          type="button"
                          onClick={onOpenAdminEdit}
                          className="mt-1 px-3 py-1 rounded-lg bg-[#14291D] text-white text-xs font-semibold cursor-pointer"
                        >
                          Add Content Blocks in Admin
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Simple cards with borders removed, separated cleanly by subtle divides */
                    <div className="divide-y divide-[#EDE5D8]/80 space-y-2">
                      {blocks.map((block: MonographContentBlock) => (
                        <div key={block.id} className="pt-2 first:pt-0">
                          <MonographBlockRenderer 
                            block={block} 
                            isProductView={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
