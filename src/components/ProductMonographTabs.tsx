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
  CheckCircle2
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
    switch (iconName || tabId) {
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
      case 'star':
        return <MessageSquare className="w-4 h-4 shrink-0" />;
      default:
        return <Layers className="w-4 h-4 shrink-0" />;
    }
  };

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Header / Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#14291D] text-amber-300 shadow-2xs">
            <Bookmark className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#14291D] tracking-tight">
                Product Monograph & Formulation Details
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#EAE4D7] text-[#554C3E] border border-[#D5CCBC]">
                {tabs.length} Sections
              </span>
            </div>
            <p className="text-xs text-[#6B6150] mt-0.5">
              Verified Ayurvedic Classical Pharmacopoeia Standards · Collapsible Sections
            </p>
          </div>
        </div>

        {/* Admin Quick Action Button */}
        {isAdmin && onOpenAdminEdit && (
          <button
            type="button"
            onClick={onOpenAdminEdit}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#B4741E] font-semibold text-xs border border-[#DFCEB3] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Edit Monograph Accordions & Content Blocks"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Customize Collapsible Blocks</span>
          </button>
        )}
      </div>

      {/* Accordion Container: ONLY ONE TAB EXPANDED AT A TIME */}
      <div className="space-y-3">
        {tabs.map((tab: ProductMonographTab, index: number) => {
          const isExpanded = expandedTabId === tab.id;
          const blocks: MonographContentBlock[] = getEffectiveTabBlocks(tab);

          // Custom colors
          const customHeaderBg = tab.bgColor 
            ? hexToRgba(tab.bgColor, isExpanded ? (tab.bgOpacity ?? 100) : Math.min(tab.bgOpacity ?? 100, 20))
            : undefined;
          const customHeaderText = isExpanded && tab.textColor ? tab.textColor : undefined;

          return (
            <div
              key={tab.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded 
                  ? 'border-[#C2B7A3] shadow-md bg-white ring-1 ring-black/5' 
                  : 'border-[#E2D9CB] bg-[#FAF8F5] hover:border-[#D5CCBC] shadow-2xs'
              }`}
            >
              {/* Accordion Header Bar */}
              <button
                type="button"
                onClick={() => toggleTab(tab.id)}
                aria-expanded={isExpanded}
                style={customHeaderBg ? { backgroundColor: customHeaderBg } : undefined}
                className={`w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none ${
                  !customHeaderBg && (isExpanded ? 'bg-[#FAF6F0]' : 'hover:bg-[#F5F0E6]')
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Icon badge */}
                  <span
                    style={
                      tab.bgColor && isExpanded
                        ? { backgroundColor: tab.bgColor, color: tab.textColor || '#FFFFFF' }
                        : undefined
                    }
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      isExpanded
                        ? tab.bgColor ? '' : 'bg-[#14291D] text-amber-300'
                        : 'bg-[#EAE3D5] text-[#4F4638]'
                    }`}
                  >
                    {getTabIcon(tab.icon, tab.id)}
                  </span>

                  {/* Title and Subtitle */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 
                        style={customHeaderText ? { color: customHeaderText } : undefined}
                        className={`font-serif font-bold text-sm sm:text-base tracking-tight leading-snug ${
                          !customHeaderText && (isExpanded ? 'text-[#14291D]' : 'text-[#2D261A]')
                        }`}
                      >
                        {tab.title}
                      </h4>

                      {tab.isCustom && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300">
                          Custom
                        </span>
                      )}

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 text-[#6E6351]">
                        {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>

                    {tab.subtitle && (
                      <p className="text-xs text-[#6F6452] mt-0.5 line-clamp-1">
                        {tab.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Chevron Indicator */}
                <div className="flex items-center gap-2 shrink-0">
                  <span 
                    className={`p-1.5 rounded-lg border transition-transform duration-200 ${
                      isExpanded 
                        ? 'bg-white border-[#D5CCBC] text-[#14291D] rotate-180' 
                        : 'bg-[#EFEAE0] border-[#DDD5C5] text-[#6F6452]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </button>

              {/* Accordion Content Panel (Rendered when expanded) */}
              {isExpanded && (
                <div className="px-4 sm:px-6 py-5 border-t border-[#EAE3D4] bg-[#FFFFFF] animate-in fade-in slide-in-from-top-1 duration-200">
                  {blocks.length === 0 ? (
                    <div className="py-8 text-center text-[#7A705E] space-y-2">
                      <Layers className="w-6 h-6 mx-auto text-[#B5A893]" />
                      <p className="text-xs font-semibold">No content blocks added to this section yet.</p>
                      {isAdmin && onOpenAdminEdit && (
                        <button
                          type="button"
                          onClick={onOpenAdminEdit}
                          className="mt-2 px-3 py-1.5 rounded-lg bg-[#14291D] text-white text-xs font-semibold cursor-pointer"
                        >
                          Add Content Blocks in Admin
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Render every block as a separate component according to its own settings */
                    <div className="space-y-3.5">
                      {blocks.map((block: MonographContentBlock) => (
                        <MonographBlockRenderer 
                          key={block.id} 
                          block={block} 
                        />
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
