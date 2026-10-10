import React, { useState, useRef, useEffect } from 'react';
import { 
  HerbalProduct, 
  ProductMonographTab, 
  MonographDetailItem, 
  MonographPriority 
} from '../types/pharmacy';
import { 
  getEffectiveMonographTabs, 
  getPriorityCardClasses, 
  getPriorityTagClasses,
  parseItemTags,
  resolveEffectiveColors,
  PRIORITY_DARK_HEX_MAP
} from '../utils/monographHelper';
import { 
  ChevronLeft, 
  ChevronRight, 
  Leaf, 
  Sparkles, 
  Clock, 
  Shield, 
  Info, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Layers, 
  Edit3, 
  HelpCircle,
  Quote
} from 'lucide-react';

interface ProductMonographTabsProps {
  product: HerbalProduct;
  isAdmin?: boolean;
  onOpenAdminEdit?: () => void;
  className?: string;
}

export const ProductMonographTabs: React.FC<ProductMonographTabsProps> = ({
  product,
  isAdmin = false,
  onOpenAdminEdit,
  className = '',
}) => {
  const tabs = React.useMemo(() => {
    return getEffectiveMonographTabs(product);
  }, [product]);

  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || 'overview');
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Sync activeTabId if tabs change and active tab is missing
  useEffect(() => {
    if (!tabs.some((t) => t.id === activeTabId) && tabs.length > 0) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 240;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
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

  const getImageSizePx = (item: MonographDetailItem, defaultSize = 34): number => {
    if (typeof item.customImageSizePx === 'number' && item.customImageSizePx > 0) {
      return item.customImageSizePx;
    }
    if (item.imageSize === 'small') return 28;
    if (item.imageSize === 'medium') return 36;
    if (item.imageSize === 'large') return 48;
    return defaultSize;
  };

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-2xl border border-[#D5CCBC] shadow-xs overflow-hidden ${className}`}>
      {/* Horizontal Scrollable Tabs Bar with Integrated Controls (Header text removed as requested) */}
      <div className="border-b border-[#E7DFD1] bg-[#FAF8F5] flex items-center justify-between">
        <div 
          ref={tabsContainerRef}
          className="flex-1 flex overflow-x-auto visible-tabs-scrollbar scroll-smooth py-1 px-1 sm:px-2"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  setActiveTabId(tab.id);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`py-2.5 px-3 sm:px-4 text-xs font-semibold whitespace-nowrap transition-all rounded-lg cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-[#14291D] text-white shadow-2xs font-bold'
                    : 'text-[#6D6353] hover:text-[#14291D] hover:bg-[#EFEAE0]'
                }`}
              >
                <span className={isActive ? 'text-amber-300' : 'text-[#8C806D]'}>
                  {getTabIcon(tab.icon, tab.id)}
                </span>
                <span>{tab.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EAE4D7] text-[#695F4F]'
                }`}>
                  {tab.items?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls: Admin Edit & Left/Right Scroll Arrows */}
        <div className="flex items-center gap-1.5 px-2 sm:px-3 shrink-0 border-l border-[#E7DFD1]">
          {isAdmin && onOpenAdminEdit && (
            <button
              type="button"
              onClick={onOpenAdminEdit}
              className="px-2.5 py-1 rounded-md bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#B4741E] font-semibold text-[11px] border border-[#DFCEB3] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title="Customize Monograph Tabs in Admin Panel"
            >
              <Edit3 className="w-3 h-3" />
              <span className="hidden md:inline">Admin Edit Tabs</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="p-1.5 rounded-md bg-white border border-[#DDD5C5] hover:bg-[#EFEAE0] text-[#14291D] transition-colors cursor-pointer shadow-2xs"
            title="Scroll tabs left"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="p-1.5 rounded-md bg-white border border-[#DDD5C5] hover:bg-[#EFEAE0] text-[#14291D] transition-colors cursor-pointer shadow-2xs"
            title="Scroll tabs right"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Tab Sub-header Callout */}
      {activeTab && (
        <div className="px-4 sm:px-6 py-3 bg-[#FAF7F2] border-b border-[#EAE3D4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2C5E43] text-white">
              {getTabIcon(activeTab.icon, activeTab.id)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#14291D]">
                  {activeTab.title}
                </h3>
                {activeTab.isCustom && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Custom Tab
                  </span>
                )}
              </div>
              {activeTab.subtitle && (
                <p className="text-[11px] text-[#6B6150] mt-0.5">
                  {activeTab.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Priority Codes Legend (Deep dark tones) */}
          <div className="hidden sm:flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-[#DDD5C5] text-[11px] text-[#6E6351]">
            <span className="font-semibold text-[#183624]">Priority:</span>
            <span className="flex items-center gap-1 font-bold text-[#991B1B]">
              <span className="w-2 h-2 rounded-full bg-[#991B1B] inline-block" /> High (Red)
            </span>
            <span className="flex items-center gap-1 font-bold text-[#B45309]">
              <span className="w-2 h-2 rounded-full bg-[#B45309] inline-block" /> Mid (Yellow)
            </span>
            <span className="flex items-center gap-1 font-bold text-[#14532D]">
              <span className="w-2 h-2 rounded-full bg-[#14532D] inline-block" /> Low (Green)
            </span>
          </div>
        </div>
      )}

      {/* Tab Cards Content Grid */}
      <div className="p-3 sm:p-5 lg:p-6 space-y-3">
        {(!activeTab?.items || activeTab.items.length === 0) ? (
          <div className="py-10 text-center text-[#7A705E] space-y-2">
            <Layers className="w-7 h-7 mx-auto text-[#B5A893]" />
            <p className="text-xs font-semibold">No detail items recorded in this tab yet.</p>
            {isAdmin && onOpenAdminEdit && (
              <button
                type="button"
                onClick={onOpenAdminEdit}
                className="mt-2 px-3 py-1.5 rounded-lg bg-[#14291D] text-white text-xs font-semibold cursor-pointer"
              >
                Add Field / Item in Admin Panel
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeTab.items.map((item) => {
              const priority: MonographPriority = item.priority || 'normal';
              const cardClasses = getPriorityCardClasses(priority);
              const tagInfo = getPriorityTagClasses(priority);
              const { bg: accentBg, text: accentText } = resolveEffectiveColors(item, priority);
              const parsedTags = parseItemTags(item);

              // ══════════════════════════════════════════════════════════════
              // 1. Customer Review Card (Feedbacks in quotes)
              // ══════════════════════════════════════════════════════════════
              if (item.isReview) {
                return (
                  <div
                    key={item.id}
                    className={`md:col-span-2 p-4 rounded-xl border transition-all ${cardClasses}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-800 border border-amber-300/40">
                          <Quote className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#14291D]">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < (item.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-stone-200 text-stone-300'
                                }`}
                              />
                            ))}
                            <span className="text-[10px] font-bold text-[#14291D] ml-1">
                              {item.rating || 5}.0
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tag / Badge */}
                      <span
                        style={{ backgroundColor: accentBg, color: accentText }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1.5"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tagInfo.dotColor}`} />
                        <span>{item.customTag || tagInfo.defaultLabel}</span>
                      </span>
                    </div>

                    {/* Review text strictly in quotation marks as requested */}
                    <div className="pl-3 border-l-2 border-amber-400/60 my-2">
                      <p className="font-serif italic text-xs sm:text-sm text-[#2C2419] leading-relaxed">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5 text-[11px] text-[#6D6251]">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="font-bold text-[#14291D]">{item.author || 'Verified Feedback'}</span>
                      </div>
                      {item.date && (
                        <span className="text-[10px] text-[#7C705D]">{item.date}</span>
                      )}
                    </div>
                  </div>
                );
              }

              // ══════════════════════════════════════════════════════════════
              // 2. FAQ Question Card
              // ══════════════════════════════════════════════════════════════
              if (item.isFaq) {
                return (
                  <div
                    key={item.id}
                    className={`md:col-span-2 p-3.5 sm:p-4 rounded-xl border transition-all ${cardClasses}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#2C5E43]/15 text-[#2C5E43] shrink-0 mt-0.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#14291D]">
                            Q: {item.title}
                          </h4>
                          <span
                            style={{ backgroundColor: accentBg, color: accentText }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs"
                          >
                            {item.customTag || 'FAQ'}
                          </span>
                        </div>
                        <p className="text-xs text-[#3E3425] leading-relaxed pt-0.5">
                          <strong className="text-[#2C5E43]">Answer: </strong>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              // ══════════════════════════════════════════════════════════════
              // 3. Composed 1-Line Ingredient Card (Requirement: image & text composed in 1 line, small size)
              // ══════════════════════════════════════════════════════════════
              const isIngredientItem = item.isIngredient || activeTab.id === 'ingredients' || Boolean(item.imageUrl);
              if (isIngredientItem && item.imageUrl) {
                const imgSize = getImageSizePx(item, 34);
                return (
                  <div
                    key={item.id}
                    className="p-2 sm:p-2.5 rounded-xl border bg-white border-[#E7DFD1] hover:border-[#D5CCBC] shadow-2xs transition-all flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Manually sizable small image */}
                      <div 
                        style={{ width: `${imgSize}px`, height: `${imgSize}px` }}
                        className="rounded-lg overflow-hidden border border-[#D5CCBC] shrink-0 bg-stone-100 shadow-2xs"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-[#14291D] truncate">
                            {item.title}
                          </span>
                          {item.botanicalName && (
                            <span className="font-serif italic text-[11px] text-[#716858] truncate">
                              ({item.botanicalName})
                            </span>
                          )}
                        </div>
                        {/* Subline with potency or role */}
                        {(item.quantityOrPotency || item.role || item.text) && (
                          <p className="text-[11px] text-[#635744] truncate max-w-sm">
                            {item.quantityOrPotency ? `${item.quantityOrPotency} · ` : ''}
                            {item.role || item.text}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tag badge with dark tone accent color */}
                    <span
                      style={{ backgroundColor: accentBg, color: accentText }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs shrink-0 whitespace-nowrap"
                    >
                      {item.customTag || item.quantityOrPotency || tagInfo.defaultLabel}
                    </span>
                  </div>
                );
              }

              // ══════════════════════════════════════════════════════════════
              // 4. Standard Detail Card with Separate Tag Badges (ONLY text/tags have color background)
              // ══════════════════════════════════════════════════════════════
              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-xl border bg-white border-[#E7DFD1] hover:border-[#D5CCBC] shadow-2xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Field Title & Priority Badge */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-[#14291D] leading-snug">
                        {item.title}
                      </h4>

                      {/* Right Tag badge */}
                      <span
                        style={{ backgroundColor: accentBg, color: accentText }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs shrink-0 flex items-center gap-1"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tagInfo.dotColor}`} />
                        <span>{item.customTag || tagInfo.defaultLabel}</span>
                      </span>
                    </div>

                    {/* Multiple Tags Display: (Text 1), (T2) etc. rendered as separate background badges */}
                    {parsedTags.length > 0 ? (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {parsedTags.map((tVal, tIdx) => (
                          <span
                            key={tIdx}
                            style={{ backgroundColor: accentBg, color: accentText }}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-2xs"
                          >
                            {tVal}
                          </span>
                        ))}
                      </div>
                    ) : (
                      /* Single text: formatted cleanly without coloring entire card */
                      <div className="mt-2">
                        {item.text && (
                          <span
                            style={{ backgroundColor: accentBg, color: accentText }}
                            className="inline-block text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-md shadow-2xs leading-relaxed max-w-full"
                          >
                            {item.text}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Optional Footer Badges for Potency or Role */}
                  {(item.quantityOrPotency || item.role) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 mt-2 border-t border-black/5 text-[11px]">
                      {item.quantityOrPotency && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px]">
                          {item.quantityOrPotency}
                        </span>
                      )}
                      {item.role && (
                        <span className="text-[#5B503E] italic text-[11px]">
                          {item.role}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
