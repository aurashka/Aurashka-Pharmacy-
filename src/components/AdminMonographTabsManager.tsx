import React, { useState, useMemo } from 'react';
import { 
  HerbalProduct, 
  ProductMonographTab, 
  MonographDetailItem, 
  MonographPriority 
} from '../types/pharmacy';
import { 
  buildDefaultMonographTabs, 
  getEffectiveMonographTabs, 
  getPriorityCardClasses, 
  getPriorityTagClasses,
  parseItemTags,
  resolveEffectiveColors,
  PRIORITY_DARK_HEX_MAP,
  HERB_IMAGE_MAP 
} from '../utils/monographHelper';
import { ProductMonographTabs } from './ProductMonographTabs';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Eye, 
  Layers, 
  X, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Leaf, 
  Clock, 
  Shield, 
  Star, 
  MessageSquare, 
  Info, 
  Quote, 
  HelpCircle,
  Palette,
  Hash
} from 'lucide-react';
import { backupProductToFirebase } from '../utils/firebaseSync';

interface AdminMonographTabsManagerProps {
  products: HerbalProduct[];
  selectedProductId?: string;
  onUpdateProduct: (product: HerbalProduct) => void;
  onPreviewProduct?: (product: HerbalProduct) => void;
  onNotify?: (message: string) => void;
  hideProductPicker?: boolean;
}

export const AdminMonographTabsManager: React.FC<AdminMonographTabsManagerProps> = ({
  products,
  selectedProductId,
  onUpdateProduct,
  onPreviewProduct,
  onNotify,
  hideProductPicker = false,
}) => {
  const [activeProductId, setActiveProductId] = useState<string>(
    selectedProductId || products[0]?.id || ''
  );

  // Sync if selectedProductId prop changes
  React.useEffect(() => {
    if (selectedProductId) {
      setActiveProductId(selectedProductId);
    }
  }, [selectedProductId]);

  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === activeProductId) || products[0];
  }, [products, activeProductId]);

  const monographTabs: ProductMonographTab[] = useMemo(() => {
    if (!currentProduct) return [];
    return getEffectiveMonographTabs(currentProduct);
  }, [currentProduct]);

  const [activeTabId, setActiveTabId] = useState<string>('overview');

  // Ensure activeTabId is valid
  React.useEffect(() => {
    if (!monographTabs.some((t) => t.id === activeTabId) && monographTabs.length > 0) {
      setActiveTabId(monographTabs[0].id);
    }
  }, [monographTabs, activeTabId]);

  const activeTab = monographTabs.find((t) => t.id === activeTabId) || monographTabs[0];

  // Tab meta edit & add states
  const [isAddingCustomTab, setIsAddingCustomTab] = useState(false);
  const [newCustomTabTitle, setNewCustomTabTitle] = useState('');
  const [newCustomTabSubtitle, setNewCustomTabSubtitle] = useState('');
  const [newCustomTabIcon, setNewCustomTabIcon] = useState('sparkles');

  const [editingTabMetaId, setEditingTabMetaId] = useState<string | null>(null);
  const [editingTabTitle, setEditingTabTitle] = useState('');
  const [editingTabSubtitle, setEditingTabSubtitle] = useState('');
  const [deleteConfirmTabId, setDeleteConfirmTabId] = useState<string | null>(null);

  // Item edit & add states
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemText, setItemText] = useState('');
  const [itemPriority, setItemPriority] = useState<MonographPriority>('normal');
  const [itemCustomTag, setItemCustomTag] = useState('');
  const [itemCustomTagBgColor, setItemCustomTagBgColor] = useState('#1F2937');
  const [itemCustomTagTextColor, setItemCustomTagTextColor] = useState('#FFFFFF');

  // Multi-tags input e.g. "(Text 1), (T2)" or "Text 1, Text 2"
  const [itemTagsInput, setItemTagsInput] = useState('');

  // Botanical / Ingredient additions (composed 1-line with manual size in px)
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemImageSize, setItemImageSize] = useState<'small' | 'medium' | 'large'>('small');
  const [itemCustomImageSizePx, setItemCustomImageSizePx] = useState<number | ''>(32);
  const [itemBotanicalName, setItemBotanicalName] = useState('');
  const [itemPotency, setItemPotency] = useState('');
  const [itemRole, setItemRole] = useState('');
  const [itemIsIngredient, setItemIsIngredient] = useState(false);

  // Review / Feedback extras
  const [itemIsReview, setItemIsReview] = useState(false);
  const [itemAuthor, setItemAuthor] = useState('');
  const [itemRating, setItemRating] = useState(5);
  const [itemDate, setItemDate] = useState('');

  // FAQ extra
  const [itemIsFaq, setItemIsFaq] = useState(false);

  // Quick dark tone swatches
  const DARK_PALETTE = [
    { label: 'Wine Red', hex: '#991B1B' },
    { label: 'Amber', hex: '#B45309' },
    { label: 'Forest Green', hex: '#14532D' },
    { label: 'Slate Charcoal', hex: '#1F2937' },
    { label: 'Deep Crimson', hex: '#7F1D1D' },
    { label: 'Cinnamon', hex: '#78350F' },
    { label: 'Deep Emerald', hex: '#064E3B' },
    { label: 'Midnight', hex: '#0F172A' },
  ];

  // Save changes to current product
  const saveUpdatedTabs = async (updatedTabs: ProductMonographTab[], successMessage?: string) => {
    if (!currentProduct) return;
    const updatedProd: HerbalProduct = {
      ...currentProduct,
      monographTabs: updatedTabs,
    };
    onUpdateProduct(updatedProd);
    await backupProductToFirebase(updatedProd);
    if (onNotify) {
      onNotify(successMessage || `Saved monograph tabs for "${currentProduct.name}"!`);
    }
  };

  // Add custom tab
  const handleAddCustomTab = () => {
    if (!newCustomTabTitle.trim() || !currentProduct) return;
    const newTab: ProductMonographTab = {
      id: `tab_custom_${Date.now()}`,
      title: newCustomTabTitle.trim(),
      subtitle: newCustomTabSubtitle.trim() || undefined,
      icon: newCustomTabIcon || 'sparkles',
      items: [],
      isCustom: true,
      enabled: true,
      order: monographTabs.length + 1,
    };
    const updated = [...monographTabs, newTab];
    saveUpdatedTabs(updated, `Added custom tab "${newTab.title}"!`);
    setActiveTabId(newTab.id);
    setIsAddingCustomTab(false);
    setNewCustomTabTitle('');
    setNewCustomTabSubtitle('');
  };

  // Update tab meta
  const handleUpdateTabMeta = (tabId: string) => {
    if (!editingTabTitle.trim() || !currentProduct) return;
    const updated = monographTabs.map((t) => {
      if (t.id === tabId) {
        return {
          ...t,
          title: editingTabTitle.trim(),
          subtitle: editingTabSubtitle.trim() || undefined,
        };
      }
      return t;
    });
    saveUpdatedTabs(updated, `Updated tab title for "${editingTabTitle.trim()}"!`);
    setEditingTabMetaId(null);
  };

  // Delete tab (works on ANY tab, pre-existed 1-6 or custom)
  const handleDeleteTab = (tabId: string) => {
    if (!currentProduct) return;
    const targetTitle = monographTabs.find((t) => t.id === tabId)?.title || 'Tab';
    const updated = monographTabs.filter((t) => t.id !== tabId);
    saveUpdatedTabs(updated, `Deleted "${targetTitle}" from "${currentProduct.name}"!`);
    if (activeTabId === tabId && updated.length > 0) {
      setActiveTabId(updated[0].id);
    }
    setDeleteConfirmTabId(null);
  };

  // Reset to classical default 6 tabs
  const handleResetToDefault = () => {
    if (!currentProduct) return;
    const defaults = buildDefaultMonographTabs(currentProduct);
    saveUpdatedTabs(defaults, `Restored classical 6 default monograph tabs for "${currentProduct.name}"!`);
    setActiveTabId(defaults[0]?.id || 'overview');
  };

  // Parse multi-tags from input or text
  const computeTagsToSave = (): string[] => {
    if (itemTagsInput.trim()) {
      // Look for (Text 1), (T2) patterns first
      const parenMatches = itemTagsInput.match(/\(([^)]+)\)/g);
      if (parenMatches && parenMatches.length > 0) {
        return parenMatches.map((m) => m.replace(/^\(|\)$/g, '').trim()).filter(Boolean);
      }
      // Comma-separated fallback
      return itemTagsInput.split(',').map((s) => s.trim()).filter(Boolean);
    }
    // Also parse parenthetical tags inside itemText if present
    if (itemText.trim()) {
      const parenMatches = itemText.match(/\(([^)]+)\)/g);
      if (parenMatches && parenMatches.length > 1) {
        return parenMatches.map((m) => m.replace(/^\(|\)$/g, '').trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Save detail item (create or update)
  const handleSaveItem = (tabId: string) => {
    if (!itemTitle.trim() && !itemText.trim() && !itemTagsInput.trim()) return;
    if (!currentProduct) return;

    const parsedTags = computeTagsToSave();
    const isIngredient = Boolean(
      itemIsIngredient || 
      activeTab.id === 'ingredients' || 
      Boolean(itemImageUrl.trim())
    );

    const newItem: MonographDetailItem = {
      id: editingItemId || `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: itemTitle.trim() || 'Specification Item',
      text: itemText.trim(),
      priority: itemPriority,
      customTag: itemCustomTag.trim() || undefined,
      customTagBgColor: itemCustomTagBgColor.trim() || undefined,
      customTagTextColor: itemCustomTagTextColor.trim() || '#FFFFFF',
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      imageUrl: itemImageUrl.trim() || undefined,
      imageSize: itemImageSize,
      customImageSizePx: itemCustomImageSizePx ? Number(itemCustomImageSizePx) : undefined,
      botanicalName: itemBotanicalName.trim() || undefined,
      quantityOrPotency: itemPotency.trim() || undefined,
      role: itemRole.trim() || undefined,
      isIngredient,
      isReview: Boolean(itemIsReview),
      author: itemAuthor.trim() || undefined,
      rating: itemRating,
      date: itemDate.trim() || undefined,
      isFaq: Boolean(itemIsFaq),
    };

    const updated = monographTabs.map((t) => {
      if (t.id === tabId) {
        let updatedItems: MonographDetailItem[];
        if (editingItemId) {
          updatedItems = (t.items || []).map((it) => (it.id === editingItemId ? newItem : it));
        } else {
          updatedItems = [...(t.items || []), newItem];
        }
        return { ...t, items: updatedItems };
      }
      return t;
    });

    saveUpdatedTabs(updated, `Saved item "${newItem.title}" in tab!`);
    setIsAddingItem(false);
    setEditingItemId(null);
    resetItemInputs();
  };

  const handleStartEditItem = (item: MonographDetailItem) => {
    setEditingItemId(item.id);
    setIsAddingItem(true);
    setItemTitle(item.title || '');
    setItemText(item.text || '');
    setItemPriority(item.priority || 'normal');
    setItemCustomTag(item.customTag || '');
    setItemCustomTagBgColor(item.customTagBgColor || PRIORITY_DARK_HEX_MAP[item.priority || 'normal'] || '#1F2937');
    setItemCustomTagTextColor(item.customTagTextColor || '#FFFFFF');
    setItemTagsInput(item.tags?.length ? item.tags.map((t) => `(${t})`).join(', ') : '');
    setItemImageUrl(item.imageUrl || '');
    setItemImageSize((item.imageSize as 'small' | 'medium' | 'large') || 'small');
    setItemCustomImageSizePx(item.customImageSizePx || (item.imageSize === 'small' ? 28 : item.imageSize === 'large' ? 48 : 34));
    setItemBotanicalName(item.botanicalName || '');
    setItemPotency(item.quantityOrPotency || '');
    setItemRole(item.role || '');
    setItemIsIngredient(Boolean(item.isIngredient));
    setItemIsReview(Boolean(item.isReview));
    setItemAuthor(item.author || '');
    setItemRating(item.rating || 5);
    setItemDate(item.date || '');
    setItemIsFaq(Boolean(item.isFaq));
  };

  const handleDeleteItem = (tabId: string, itemId: string) => {
    if (!currentProduct) return;
    const updated = monographTabs.map((t) => {
      if (t.id === tabId) {
        return {
          ...t,
          items: (t.items || []).filter((it) => it.id !== itemId),
        };
      }
      return t;
    });
    saveUpdatedTabs(updated, 'Item removed from tab!');
    if (editingItemId === itemId) {
      setEditingItemId(null);
      setIsAddingItem(false);
    }
  };

  const handleMoveItem = (tabId: string, idx: number, direction: 'up' | 'down') => {
    if (!currentProduct) return;
    const targetTab = monographTabs.find((t) => t.id === tabId);
    if (!targetTab || !targetTab.items) return;
    const items = [...targetTab.items];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[idx];
    items[idx] = items[targetIdx];
    items[targetIdx] = temp;
    const updated = monographTabs.map((t) => (t.id === tabId ? { ...t, items } : t));
    saveUpdatedTabs(updated, 'Item reordered!');
  };

  const resetItemInputs = () => {
    setItemTitle('');
    setItemText('');
    setItemPriority('normal');
    setItemCustomTag('');
    setItemCustomTagBgColor(PRIORITY_DARK_HEX_MAP.normal);
    setItemCustomTagTextColor('#FFFFFF');
    setItemTagsInput('');
    setItemImageUrl('');
    setItemImageSize('small');
    setItemCustomImageSizePx(32);
    setItemBotanicalName('');
    setItemPotency('');
    setItemRole('');
    setItemIsIngredient(false);
    setItemIsReview(false);
    setItemAuthor('');
    setItemRating(5);
    setItemDate('');
    setItemIsFaq(false);
  };

  // When clicking a priority preset, set priority AND default dark tone color
  const selectPriorityWithDarkTone = (p: MonographPriority) => {
    setItemPriority(p);
    setItemCustomTagBgColor(PRIORITY_DARK_HEX_MAP[p]);
    setItemCustomTagTextColor('#FFFFFF');
  };

  if (!currentProduct) {
    return <div className="p-4 text-xs text-stone-500">No products available.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Product Selector Dropdown & Quick Summary (Only shown if hideProductPicker is false) */}
      {!hideProductPicker && (
        <div className="p-4 bg-white rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#14291D] mb-1">
                Select Formulation to Configure Monograph Tabs:
              </label>
              <select
                value={activeProductId}
                onChange={(e) => {
                  setActiveProductId(e.target.value);
                  setActiveTabId('overview');
                  setIsAddingItem(false);
                  setEditingItemId(null);
                }}
                className="w-full py-2 px-3 bg-[#FAF8F5] border border-[#C8BEAB] rounded-lg text-xs font-semibold text-[#183624] shadow-2xs focus:outline-hidden focus:border-[#2C5E43] cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.categoryLabel} ({p.volumeOrWeight} · ₹{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 p-2 bg-[#FAF8F5] rounded-xl border border-[#E7DFD1] shrink-0">
              <img
                src={currentProduct.image || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=120&q=80'}
                alt={currentProduct.name}
                className="w-12 h-12 rounded-lg object-cover border border-[#DDD5C5]"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h4 className="font-serif font-bold text-xs text-[#14291D] line-clamp-1 max-w-[200px]">
                  {currentProduct.name}
                </h4>
                <p className="text-[11px] text-[#786E5E]">
                  {currentProduct.volumeOrWeight} · Form: {currentProduct.form}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-[#2C5E43] bg-emerald-100 px-1.5 py-0.2 rounded">
                    ₹{currentProduct.price} · {monographTabs.length} Tabs Configured
                  </span>
                  {onPreviewProduct && (
                    <button
                      type="button"
                      onClick={() => onPreviewProduct(currentProduct)}
                      className="text-[10px] text-blue-700 underline font-semibold cursor-pointer"
                    >
                      Preview Popup
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Workspace */}
      <div className="bg-white rounded-xl border border-[#D5CCBC] shadow-xs overflow-hidden">
        {/* Top Control Bar with Reset & Add Custom Tab */}
        <div className="p-3 bg-[#FAF8F5] border-b border-[#E7DFD1] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2C5E43] animate-pulse" />
            <span className="font-bold text-[#14291D]">
              Horizontal Tabs ({monographTabs.length} Active Sections)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#554C3E] hover:text-[#14291D] bg-white hover:bg-[#F2ECE1] border border-[#DDD5C5] rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Reset all tabs for this product to classical 6 defaults"
            >
              <RotateCcw className="w-3 h-3 text-[#2C5E43]" />
              <span>Reset 6 Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAddingCustomTab(!isAddingCustomTab);
                setNewCustomTabTitle('');
                setNewCustomTabSubtitle('');
              }}
              className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Add Custom Tab</span>
            </button>
          </div>
        </div>

        {/* Add Custom Tab Drawer */}
        {isAddingCustomTab && (
          <div className="p-4 bg-[#F5EFE6] border-b border-[#E7DFD1] space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#14291D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Create New Custom Monograph Tab for &ldquo;{currentProduct.name}&rdquo;</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                  Tab Title *
                </label>
                <input
                  type="text"
                  value={newCustomTabTitle}
                  onChange={(e) => setNewCustomTabTitle(e.target.value)}
                  placeholder="e.g. Clinical Studies, Herbal Extraction..."
                  className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={newCustomTabSubtitle}
                  onChange={(e) => setNewCustomTabSubtitle(e.target.value)}
                  placeholder="e.g. Observational evidence, research citations..."
                  className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                  Icon
                </label>
                <select
                  value={newCustomTabIcon}
                  onChange={(e) => setNewCustomTabIcon(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                >
                  <option value="sparkles">✨ Sparkles (Special)</option>
                  <option value="leaf">🍃 Leaf (Botanical)</option>
                  <option value="clock">⏱️ Clock (Dosage)</option>
                  <option value="shield">🛡️ Shield (Verification)</option>
                  <option value="star">⭐ Star (Ratings & Feedback)</option>
                  <option value="message">💬 Message (Guidance)</option>
                  <option value="info">ℹ️ Info (General Overview)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingCustomTab(false)}
                className="px-3 py-1.5 text-xs text-[#635A4B] hover:bg-[#EAE4D7] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomTab}
                disabled={!newCustomTabTitle.trim()}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg text-white shadow-xs cursor-pointer ${
                  newCustomTabTitle.trim() ? 'bg-[#183624] hover:bg-[#20442E]' : 'bg-stone-300 cursor-not-allowed'
                }`}
              >
                Create Custom Tab
              </button>
            </div>
          </div>
        )}

        {/* Horizontal Scrollable Tabs Strip */}
        <div className="p-2.5 border-b border-[#E7DFD1] bg-[#FAF8F5] overflow-x-auto visible-tabs-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {monographTabs.map((tab) => {
              const isSelected = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  className={`group relative flex items-center rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs'
                      : 'bg-white text-[#3C3224] border-[#DDD5C5] hover:border-[#14291D]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTabId(tab.id);
                      setIsAddingItem(false);
                      setEditingItemId(null);
                    }}
                    className="py-2 px-3 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span>{tab.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#EAE4D7] text-[#695F4F]'
                    }`}>
                      {tab.items?.length || 0}
                    </span>
                  </button>

                  {/* Delete Tab Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmTabId(tab.id);
                    }}
                    className={`p-1.5 mr-1 rounded-md transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-red-300 hover:text-white hover:bg-red-700/50'
                        : 'text-stone-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={`Delete "${tab.title}" from this product`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Delete Confirmation Banner */}
        {deleteConfirmTabId && (
          <div className="p-3 bg-red-50 border-b border-red-200 flex items-center justify-between gap-3 text-xs text-red-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                Delete tab <strong>&ldquo;{monographTabs.find((t) => t.id === deleteConfirmTabId)?.title}&rdquo;</strong> for this product?
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteConfirmTabId(null)}
                className="px-2.5 py-1 text-xs rounded bg-white border border-red-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTab(deleteConfirmTabId)}
                className="px-3 py-1 text-xs font-bold rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-xs"
              >
                Confirm Delete Tab
              </button>
            </div>
          </div>
        )}

        {/* Active Tab Body & Details Cards */}
        {activeTab && (
          <div className="p-3 sm:p-5 space-y-4">
            {/* Tab Meta Header (Rename & Add Item) */}
            <div className="p-3 sm:p-4 bg-[#FAF7F2] rounded-xl border border-[#E7DFD1] flex flex-wrap items-center justify-between gap-2.5">
              <div>
                {editingTabMetaId === activeTab.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={editingTabTitle}
                      onChange={(e) => setEditingTabTitle(e.target.value)}
                      className="px-2.5 py-1 text-xs font-bold bg-white border border-[#DDD5C5] rounded-md"
                      placeholder="Tab Title"
                    />
                    <input
                      type="text"
                      value={editingTabSubtitle}
                      onChange={(e) => setEditingTabSubtitle(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-white border border-[#DDD5C5] rounded-md"
                      placeholder="Tab Subtitle"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateTabMeta(activeTab.id)}
                      className="px-2.5 py-1 bg-[#183624] text-white text-xs font-semibold rounded-md cursor-pointer"
                    >
                      Save Title
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTabMetaId(null)}
                      className="px-2 py-1 text-xs text-stone-600 hover:bg-stone-200 rounded-md cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#14291D]">
                        {activeTab.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTabMetaId(activeTab.id);
                          setEditingTabTitle(activeTab.title);
                          setEditingTabSubtitle(activeTab.subtitle || '');
                        }}
                        className="p-1 text-[#645A4B] hover:text-[#14291D] hover:bg-white rounded cursor-pointer"
                        title="Rename Tab Title"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                    {activeTab.subtitle && (
                      <p className="text-[11px] text-[#716757] mt-0.5">
                        {activeTab.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingItem(true);
                    setEditingItemId(null);
                    resetItemInputs();
                  }}
                  className="px-3 py-1.5 bg-[#183624] hover:bg-[#20442E] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Add Field / Detail Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmTabId(activeTab.id)}
                  className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Delete this entire tab from this product"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Tab</span>
                </button>
              </div>
            </div>

            {/* Add / Edit Detail Item Form */}
            {isAddingItem && (
              <div className="p-4 sm:p-5 bg-white rounded-xl border-2 border-[#183624] space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E0D7C6] pb-2">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#2C5E43]" />
                    <h5 className="font-serif font-bold text-sm text-[#14291D]">
                      {editingItemId ? 'Edit Detail Card' : 'Add New Field / Detail Card to'} &ldquo;{activeTab.title}&rdquo;
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingItem(false);
                      setEditingItemId(null);
                    }}
                    className="text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Field Title */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#14291D] mb-1">
                      Field Title / Headline *
                    </label>
                    <input
                      type="text"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      placeholder="e.g. Standard Dosage, Classical Anupana, Ashwagandha KSM-66, Lab Certificate..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-bold text-[#14291D]"
                    />
                  </div>

                  {/* Multiple Tags Input (Requirement: tags like (Text1), (T2) so each shows as separate tag with background color) */}
                  <div className="sm:col-span-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-[#14291D]">
                        🏷️ Multiple Tags / Multi-Text Values (Optional):
                      </label>
                      <span className="text-[10px] text-[#716858]">
                        Like ( Text1 ) , ( T2 ) or comma-separated
                      </span>
                    </div>
                    <input
                      type="text"
                      value={itemTagsInput}
                      onChange={(e) => setItemTagsInput(e.target.value)}
                      placeholder="e.g. ( Text1 ) , ( T2 ) or Immunity, Vital Energy, Rasayana"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                    />
                    <p className="text-[11px] text-[#6E6351]">
                      Har ek text alag se background tag me show hoga ek hi field ke andar.
                    </p>

                    {/* Live Tags Preview */}
                    {computeTagsToSave().length > 0 && (
                      <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#14291D] mr-1">Preview Tags:</span>
                        {computeTagsToSave().map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            style={{
                              backgroundColor: itemCustomTagBgColor || PRIORITY_DARK_HEX_MAP[itemPriority],
                              color: itemCustomTagTextColor || '#FFFFFF',
                            }}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-2xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Standard Detailed Content / Text */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#14291D] mb-1">
                      Detailed Content / Description Text (If not using tags)
                    </label>
                    <textarea
                      rows={2}
                      value={itemText}
                      onChange={(e) => setItemText(e.target.value)}
                      placeholder="Write formulation details, directions for use, clinical indications, precautions, or authentic review..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs leading-relaxed"
                    />
                  </div>

                  {/* Priority Level & Dark Tone Background Accent (Requirement: Dark tone, manually select & type color code) */}
                  <div className="sm:col-span-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block font-bold text-[#14291D]">
                        🎨 Priority Level & Tag Background Color Accent (Dark Tone):
                      </label>
                      <span className="text-[10px] text-[#716858]">
                        Card neutral rahega, kewal text/tag me background color hoga
                      </span>
                    </div>

                    {/* Dark tone priority presets */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => selectPriorityWithDarkTone('high')}
                        className={`p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer ${
                          itemPriority === 'high' 
                            ? 'border-[#991B1B] bg-red-50/80 ring-2 ring-red-500/20' 
                            : 'border-stone-200 bg-white hover:border-red-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#991B1B] shrink-0" />
                          <span className="font-bold text-xs text-[#991B1B]">High (Red)</span>
                        </div>
                        <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">#991B1B</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => selectPriorityWithDarkTone('mid')}
                        className={`p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer ${
                          itemPriority === 'mid' 
                            ? 'border-[#B45309] bg-amber-50/80 ring-2 ring-amber-500/20' 
                            : 'border-stone-200 bg-white hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#B45309] shrink-0" />
                          <span className="font-bold text-xs text-[#B45309]">Mid (Yellow)</span>
                        </div>
                        <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">#B45309</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => selectPriorityWithDarkTone('low')}
                        className={`p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer ${
                          itemPriority === 'low' 
                            ? 'border-[#14532D] bg-emerald-50/80 ring-2 ring-emerald-500/20' 
                            : 'border-stone-200 bg-white hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#14532D] shrink-0" />
                          <span className="font-bold text-xs text-[#14532D]">Low (Green)</span>
                        </div>
                        <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">#14532D</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => selectPriorityWithDarkTone('normal')}
                        className={`p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer ${
                          itemPriority === 'normal' 
                            ? 'border-[#1F2937] bg-stone-100 ring-2 ring-stone-500/20' 
                            : 'border-stone-200 bg-white hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#1F2937] shrink-0" />
                          <span className="font-bold text-xs text-[#1F2937]">Normal</span>
                        </div>
                        <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">#1F2937</span>
                      </button>
                    </div>

                    {/* Manual Color Picker & Type Custom HEX code */}
                    <div className="pt-2 border-t border-[#E7DFD1] grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#14291D] mb-1 flex items-center gap-1">
                          <Palette className="w-3 h-3 text-[#2C5E43]" />
                          <span>Manually Select / Type Color Code (HEX):</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={itemCustomTagBgColor.startsWith('#') && itemCustomTagBgColor.length === 7 ? itemCustomTagBgColor : '#1F2937'}
                            onChange={(e) => setItemCustomTagBgColor(e.target.value)}
                            className="w-9 h-8 rounded border border-[#DDD5C5] cursor-pointer shrink-0"
                            title="Open interactive color palette"
                          />
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-2 text-stone-400 text-xs font-mono">#</span>
                            <input
                              type="text"
                              value={itemCustomTagBgColor.replace(/^#/, '')}
                              onChange={(e) => {
                                const val = e.target.value.trim();
                                setItemCustomTagBgColor(val ? (val.startsWith('#') ? val : `#${val}`) : '');
                              }}
                              placeholder="991B1B"
                              className="w-full pl-6 pr-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono font-bold text-[#14291D]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dark tone palette quick swatches */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#716858] mb-1">
                          Quick Dark Tone Swatches:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {DARK_PALETTE.map((swatch) => (
                            <button
                              key={swatch.hex}
                              type="button"
                              onClick={() => {
                                setItemCustomTagBgColor(swatch.hex);
                                setItemCustomTagTextColor('#FFFFFF');
                              }}
                              style={{ backgroundColor: swatch.hex }}
                              className="w-6 h-6 rounded-md border border-black/20 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                              title={`${swatch.label} (${swatch.hex})`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Swatch Preview */}
                    <div className="p-2.5 bg-white rounded-lg border border-[#DDD5C5] flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] font-bold text-[#14291D]">Accent Preview:</span>
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            backgroundColor: itemCustomTagBgColor || PRIORITY_DARK_HEX_MAP[itemPriority],
                            color: itemCustomTagTextColor || '#FFFFFF',
                          }}
                          className="px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs"
                        >
                          {itemCustomTag || (itemPriority === 'high' ? 'High Priority' : itemPriority === 'mid' ? 'Important' : itemPriority === 'low' ? 'Verified' : 'Standard')}
                        </span>
                        <span
                          style={{
                            backgroundColor: itemCustomTagBgColor || PRIORITY_DARK_HEX_MAP[itemPriority],
                            color: itemCustomTagTextColor || '#FFFFFF',
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold shadow-2xs"
                        >
                          (Text1)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custom Tag Label (Optional) */}
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Right Badge Label Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={itemCustomTag}
                      onChange={(e) => setItemCustomTag(e.target.value)}
                      placeholder="e.g. Strict Dosage, 100% Pure, Ayush License, 500mg..."
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  {/* Botanical / Ingredient Additions (Composed 1-line layout & manual typed image size) */}
                  <div className="sm:col-span-2 p-3 bg-white rounded-xl border border-[#DDD5C5] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#14291D] flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-[#2C5E43]" />
                        <span>🌿 Botanical Ingredient Options (Composed 1-Line Item):</span>
                      </span>
                      <label className="flex items-center gap-1.5 text-[11px] text-[#2C5E43] font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemIsIngredient}
                          onChange={(e) => setItemIsIngredient(e.target.checked)}
                          className="rounded text-[#2C5E43]"
                        />
                        <span>Enable Composed 1-Line Layout</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                          Herb Photo Link (URL)
                        </label>
                        <input
                          type="text"
                          value={itemImageUrl}
                          onChange={(e) => setItemImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                        />
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span className="text-[10px] text-stone-500 mr-1">Presets:</span>
                          {['ashwagandha', 'shilajit', 'amla', 'brahmi', 'tulsi', 'turmeric', 'ghee'].map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                setItemImageUrl(HERB_IMAGE_MAP[k] || '');
                                setItemIsIngredient(true);
                              }}
                              className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] capitalize cursor-pointer"
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Manual Typed Image Size (Requirement: image ka size aur jyada chhota kar pae manually type karke) */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                          Manually Type Image Size (px)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={16}
                            max={120}
                            value={itemCustomImageSizePx}
                            onChange={(e) => setItemCustomImageSizePx(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g. 28"
                            className="w-24 px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-mono font-bold"
                          />
                          <span className="text-xs text-stone-500">px</span>

                          {/* Quick size preset buttons */}
                          <div className="flex items-center gap-1 ml-auto">
                            {[24, 28, 32, 40].map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setItemCustomImageSizePx(sz)}
                                className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                                  itemCustomImageSizePx === sz
                                    ? 'bg-[#183624] text-white'
                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                }`}
                              >
                                {sz}px
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1">
                          Type any number (e.g. 24 for ultra-small) so multiple herbs fit in 1 line without taking space.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                          Botanical Latin Species (Italics)
                        </label>
                        <input
                          type="text"
                          value={itemBotanicalName}
                          onChange={(e) => setItemBotanicalName(e.target.value)}
                          placeholder="e.g. Withania somnifera (KSM-66)"
                          className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs italic font-serif"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                          Potency / Quantity (Mg / %)
                        </label>
                        <input
                          type="text"
                          value={itemPotency}
                          onChange={(e) => setItemPotency(e.target.value)}
                          placeholder="e.g. 450 mg, 15% Fulvic Acid"
                          className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Feedback / Review */}
                  <div className="sm:col-span-2 p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemIsReview}
                        onChange={(e) => setItemIsReview(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span className="font-bold text-xs text-amber-950">
                        ⭐ Mark as Customer Review / Feedback (Displayed in &ldquo;&rdquo; quotes)
                      </span>
                    </label>

                    {itemIsReview && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                            Reviewer Name / Author
                          </label>
                          <input
                            type="text"
                            value={itemAuthor}
                            onChange={(e) => setItemAuthor(e.target.value)}
                            placeholder="e.g. Vaidya Rajesh Sharma, Pune"
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                            Rating Stars (1 to 5)
                          </label>
                          <select
                            value={itemRating}
                            onChange={(e) => setItemRating(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-bold"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                            <option value={3}>⭐⭐⭐ (3 Stars)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                            Date / Verification
                          </label>
                          <input
                            type="text"
                            value={itemDate}
                            onChange={(e) => setItemDate(e.target.value)}
                            placeholder="e.g. Verified Ayurvedic Practitioner"
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDD5C5]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingItem(false);
                      setEditingItemId(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#DDD5C5] hover:bg-[#EAE4D7] text-stone-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveItem(activeTab.id)}
                    disabled={!itemTitle.trim() && !itemText.trim() && !itemTagsInput.trim()}
                    className={`px-5 py-2 text-xs font-bold rounded-lg text-white shadow-md cursor-pointer ${
                      (itemTitle.trim() || itemText.trim() || itemTagsInput.trim()) 
                        ? 'bg-[#183624] hover:bg-[#20442E]' 
                        : 'bg-stone-300 cursor-not-allowed'
                    }`}
                  >
                    {editingItemId ? 'Update Card' : 'Save Item to Tab'}
                  </button>
                </div>
              </div>
            )}

            {/* Detail Cards List Inside This Tab */}
            {(!activeTab.items || activeTab.items.length === 0) ? (
              <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD5C5] space-y-2">
                <p className="text-xs text-stone-600 font-semibold">
                  Abhi is tab ke andar koi detail items/cards nahi hain.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingItem(true);
                    setEditingItemId(null);
                    resetItemInputs();
                  }}
                  className="px-3.5 py-1.5 bg-[#183624] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  + Add First Detail Card
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeTab.items.map((item, idx) => {
                  const priority = item.priority || 'normal';
                  const cardClasses = getPriorityCardClasses(priority);
                  const tagInfo = getPriorityTagClasses(priority);
                  const { bg: accentBg, text: accentText } = resolveEffectiveColors(item, priority);
                  const parsedTags = parseItemTags(item);
                  const isIngredientItem = item.isIngredient || activeTab.id === 'ingredients' || Boolean(item.imageUrl);
                  const imgSize = item.customImageSizePx || (item.imageSize === 'small' ? 28 : item.imageSize === 'large' ? 48 : 34);

                  // 1. Composed 1-line layout for ingredients in Admin
                  if (isIngredientItem && item.imageUrl) {
                    return (
                      <div
                        key={item.id}
                        className="p-2 sm:p-2.5 rounded-xl border bg-white border-[#E7DFD1] hover:border-[#D5CCBC] shadow-2xs transition-all flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            style={{ width: `${imgSize}px`, height: `${imgSize}px` }}
                            className="rounded-lg object-cover border border-[#DDD5C5] shrink-0 bg-stone-100"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-serif font-bold text-xs sm:text-sm text-[#14291D] truncate">
                                {item.title}
                              </span>
                              {item.botanicalName && (
                                <span className="text-[11px] font-serif italic text-stone-600 truncate">
                                  ({item.botanicalName})
                                </span>
                              )}
                            </div>
                            {(item.quantityOrPotency || item.role || item.text) && (
                              <p className="text-[11px] text-[#635744] truncate max-w-xs">
                                {item.quantityOrPotency ? `${item.quantityOrPotency} · ` : ''}
                                {item.role || item.text}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controls & Tag */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            style={{ backgroundColor: accentBg, color: accentText }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs whitespace-nowrap"
                          >
                            {item.customTag || item.quantityOrPotency || tagInfo.defaultLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEditItem(item)}
                            className="p-1 rounded text-blue-700 hover:bg-blue-100 cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(activeTab.id, item.id)}
                            className="p-1 rounded text-red-700 hover:bg-red-100 cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 2. Standard Card with clean white container and color-accented text/tags
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between shadow-2xs transition-all ${cardClasses}`}
                    >
                      <div>
                        {/* Header & Item Actions */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <h5 className="font-serif font-bold text-xs sm:text-sm text-[#14291D]">
                              {item.title}
                            </h5>
                            {item.botanicalName && (
                              <p className="text-[11px] font-serif italic text-stone-600">
                                {item.botanicalName}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveItem(activeTab.id, idx, 'up')}
                              disabled={idx === 0}
                              className={`p-1 rounded cursor-pointer ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black/10'}`}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(activeTab.id, idx, 'down')}
                              disabled={idx === activeTab.items.length - 1}
                              className={`p-1 rounded cursor-pointer ${idx === activeTab.items.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black/10'}`}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEditItem(item)}
                              className="p-1 rounded text-blue-700 hover:bg-blue-100 cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(activeTab.id, item.id)}
                              className="p-1 rounded text-red-700 hover:bg-red-100 cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span
                            style={{ backgroundColor: accentBg, color: accentText }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs"
                          >
                            <span>{item.customTag || tagInfo.defaultLabel}</span>
                          </span>

                          {item.quantityOrPotency && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold">
                              Potency: {item.quantityOrPotency}
                            </span>
                          )}
                          {item.role && (
                            <span className="text-[10px] text-stone-500 italic">
                              Role: {item.role}
                            </span>
                          )}
                        </div>

                        {/* Multiple Tags or Single Text with color background (Card is white, text is colored) */}
                        {parsedTags.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {parsedTags.map((tVal, tIdx) => (
                              <span
                                key={tIdx}
                                style={{ backgroundColor: accentBg, color: accentText }}
                                className="text-[11px] font-semibold px-2 py-0.5 rounded shadow-2xs"
                              >
                                {tVal}
                              </span>
                            ))}
                          </div>
                        ) : item.isReview ? (
                          <div className="pl-3 border-l-2 border-amber-400 my-2">
                            <p className="font-serif italic text-xs text-[#2C2419]">
                              &ldquo;{item.text}&rdquo;
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-600">
                              <span className="font-bold text-[#14291D]">{item.author || 'Verified Buyer'}</span>
                              <span>· {item.rating || 5} Stars</span>
                              {item.date && <span>· {item.date}</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <span
                              style={{ backgroundColor: accentBg, color: accentText }}
                              className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded shadow-2xs"
                            >
                              {item.text}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live Storefront Visual Preview of this Product's Tabs */}
            <div className="pt-5 border-t border-[#DDD5C5] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-[#14291D] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <span>Live Storefront Preview of &ldquo;{currentProduct.name}&rdquo;</span>
                </h4>
                <span className="text-[11px] text-[#786E5E]">
                  (Tabs are horizontal, ingredients are composed 1-line, tags have dark priority accent)
                </span>
              </div>

              <ProductMonographTabs product={currentProduct} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
