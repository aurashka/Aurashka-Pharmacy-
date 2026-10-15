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
    <div className={`space-y-2 ${className}`}>
      {/* Admin Quick Action Button (Minimal, no noisy headers) */}
      {isAdmin && onOpenAdminEdit && (
        <div className="flex justify-end px-0.5 mb-1">
          <button
            type="button"
            onClick={onOpenAdminEdit}
            className="px-2.5 py-1 rounded-lg bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#B4741E] font-medium text-xs border border-[#DFCEB3] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Edit Monograph Accordions & Content Blocks"
          >
            <Edit3 className="w-3 h-3" />
            <span>Customize Monograph</span>
          </button>
        </div>
      )}

      {/* Minimal Accordion List: Preset Icon + Name + Arrow */}
      <div className="space-y-2">
        {tabs.map((tab: ProductMonographTab) => {
          const isExpanded = expandedTabId === tab.id;
          const blocks: MonographContentBlock[] = getEffectiveTabBlocks(tab);
          const iconElement = getTabIcon(tab.icon, tab.id);

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
              containerClass = 'border-[#DDD5C5] shadow-xs bg-white';
              headerBgClass = 'bg-white hover:bg-[#FAF8F5]';
              titleClass = 'text-[#1E261F]';
              subtitleClass = 'text-[#6F6452]';
              iconBadgeClass = 'bg-[#EFEAE0] text-[#3D3425]';
              if (tab.iconColor) {
                iconBadgeStyle = { color: tab.iconColor };
              }
            } else if (isCustomColor) {
              if (tab.activeBorderColor) {
                containerBorderStyle = { borderColor: tab.activeBorderColor };
                containerClass = 'shadow-xs bg-white';
              } else {
                containerClass = 'border-[#C2B7A3] shadow-xs bg-white';
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

              iconBadgeStyle = {
                backgroundColor: tab.activeIconBgColor || tab.activeBgColor || '#14291D',
                color: tab.activeIconColor || '#FFFFFF',
              };
            } else {
              // Theme Highlight
              containerClass = 'border-[#C8BDAA] shadow-xs bg-white';
              if (tab.bgColor) {
                headerBgStyle = hexToRgba(tab.bgColor, tab.bgOpacity ?? 100);
                titleColorStyle = tab.textColor;
              } else {
                headerBgClass = 'bg-[#FAF7F2]';
                titleClass = 'text-[#14291D]';
              }
              subtitleClass = 'text-[#6F6452]';
              iconBadgeClass = tab.bgColor ? '' : 'bg-[#14291D] text-amber-300';
              if (tab.bgColor) {
                iconBadgeStyle = { backgroundColor: tab.bgColor, color: tab.textColor || '#FFFFFF' };
              }
            }
          } else {
            // Collapsed state - minimal & clean
            containerClass = 'border-[#E7DFD3] bg-[#FAF8F5]/90 hover:bg-[#F5F0E6] hover:border-[#D5C9B7]';
            if (tab.bgColor) {
              headerBgStyle = hexToRgba(tab.bgColor, Math.min(tab.bgOpacity ?? 100, 15));
            } else {
              headerBgClass = '';
            }
            titleClass = 'text-[#2D261A]';
            subtitleClass = 'text-[#7A705E]';
            iconBadgeClass = 'bg-[#EFEAE0] text-[#4A4031]';
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
              {/* Accordion Header Bar: Preset Icon + Name + Arrow (Minimal, Simple) */}
              <button
                type="button"
                onClick={() => toggleTab(tab.id)}
                aria-expanded={isExpanded}
                style={headerBgStyle ? { backgroundColor: headerBgStyle } : undefined}
                className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none ${headerBgClass}`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Preset Icon */}
                  {iconElement && (
                    <span
                      style={iconBadgeStyle}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0 flex items-center justify-center transition-colors ${iconBadgeClass}`}
                    >
                      {iconElement}
                    </span>
                  )}

                  {/* Name (Title) + Subtitle */}
                  <div className="min-w-0 flex-1">
                    <h4
                      style={titleColorStyle ? { color: titleColorStyle } : undefined}
                      className={`font-serif font-semibold text-xs sm:text-sm tracking-tight leading-snug ${titleClass}`}
                    >
                      {tab.title}
                    </h4>

                    {tab.subtitle && (
                      <p
                        style={subtitleColorStyle ? { color: subtitleColorStyle } : undefined}
                        className={`text-[11px] mt-0.5 line-clamp-1 ${subtitleClass}`}
                      >
                        {tab.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Minimal Arrow */}
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-[#14291D]' : 'text-[#8A7D6A]'
                  }`}
                />
              </button>

              {/* Accordion Content Panel: Content blocks rendered as created in admin */}
              {isExpanded && (
                <div className="px-3.5 sm:px-5 py-3.5 sm:py-4 border-t border-[#EDE5D8] bg-[#FFFFFF] animate-in fade-in duration-150">
                  {blocks.length === 0 ? (
                    <div className="py-4 text-center text-[#7A705E] space-y-1">
                      <p className="text-xs">No content added to this section yet.</p>
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
                    <div className="space-y-3">
                      {blocks.map((block: MonographContentBlock) => (
                        <div key={block.id}>
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
