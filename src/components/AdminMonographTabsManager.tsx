import React, { useState, useMemo, useEffect } from 'react';
import { 
  HerbalProduct, 
  ProductMonographTab, 
  MonographContentBlock,
  BlockDesignSettings,
  TagItem,
  CardBlockData,
  CardElementType,
  CardElementItem
} from '../types/pharmacy';
import { 
  getEffectiveMonographTabs, 
  getEffectiveTabBlocks,
  hexToRgba,
  HERB_IMAGE_MAP 
} from '../utils/monographHelper';
import { MonographBlockRenderer, renderCardIcon } from './MonographBlockRenderer';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Check, 
  Layers, 
  Tag as TagIcon, 
  Image as ImageIcon, 
  Type, 
  Eye, 
  Sparkles,
  Info,
  Leaf,
  Clock,
  Shield,
  Palette,
  Heart,
  Beaker,
  Award,
  BookOpen,
  Pill,
  CheckCircle,
  Star,
  Feather,
  MessageSquare,
  Bookmark,
  Package,
  HelpCircle,
  Sliders,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Table as TableIcon,
  List as ListIcon,
  Minus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { backupProductToFirebase } from '../utils/firebaseSync';

interface AdminMonographTabsManagerProps {
  products: HerbalProduct[];
  selectedProductId?: string;
  controlledTabs?: ProductMonographTab[];
  onTabsChange?: (tabs: ProductMonographTab[]) => void;
  onUpdateProduct?: (product: HerbalProduct) => void;
  onNotify?: (msg: string) => void;
  onPreviewProduct?: (product: HerbalProduct) => void;
  hideProductPicker?: boolean;
  productTitle?: string;
}

// Icon options for Tab Collapsible Headers
export const TAB_HEADER_ICON_OPTIONS = [
  { id: 'leaf', label: 'Leaf (Botanical)', icon: Leaf },
  { id: 'sparkles', label: 'Sparkles (Benefits)', icon: Sparkles },
  { id: 'clock', label: 'Clock (Dosage)', icon: Clock },
  { id: 'shield', label: 'Shield (Quality)', icon: Shield },
  { id: 'info', label: 'Info (Overview)', icon: Info },
  { id: 'message', label: 'Message (FAQs)', icon: MessageSquare },
  { id: 'bookmark', label: 'Bookmark', icon: Bookmark },
  { id: 'star', label: 'Star (Rating)', icon: Star },
  { id: 'heart', label: 'Heart (Wellness)', icon: Heart },
  { id: 'beaker', label: 'Beaker (Lab)', icon: Beaker },
  { id: 'award', label: 'Award (Grade)', icon: Award },
  { id: 'book', label: 'Book (Classical)', icon: BookOpen },
  { id: 'pill', label: 'Pill / Capsule', icon: Pill },
  { id: 'check', label: 'Check Circle', icon: CheckCircle2 },
  { id: 'feather', label: 'Feather', icon: Feather },
  { id: 'package', label: 'Package (Supply)', icon: Package },
  { id: 'help', label: 'Help Circle', icon: HelpCircle },
  { id: 'sliders', label: 'Sliders', icon: Sliders },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'none', label: 'No Icon', icon: X },
];

export const renderTabHeaderIcon = (iconName?: string, className = "w-4 h-4") => {
  const key = (iconName || '').toLowerCase();
  switch (key) {
    case 'leaf': return <Leaf className={className} />;
    case 'sparkles': return <Sparkles className={className} />;
    case 'clock': return <Clock className={className} />;
    case 'shield': return <Shield className={className} />;
    case 'info': return <Info className={className} />;
    case 'message':
    case 'faqs_reviews': return <MessageSquare className={className} />;
    case 'bookmark': return <Bookmark className={className} />;
    case 'star': return <Star className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'beaker': return <Beaker className={className} />;
    case 'award': return <Award className={className} />;
    case 'book':
    case 'bookopen': return <BookOpen className={className} />;
    case 'pill': return <Pill className={className} />;
    case 'check':
    case 'checkcircle': return <CheckCircle2 className={className} />;
    case 'feather': return <Feather className={className} />;
    case 'package': return <Package className={className} />;
    case 'help': return <HelpCircle className={className} />;
    case 'sliders': return <Sliders className={className} />;
    case 'none': return null;
    default: return <Sparkles className={className} />;
  }
};

/**
 * Ensures a card's content is transformed into structured CardElementItem[]
 * so that both existing cards and new cards are 100% compatible.
 */
export const ensureCardElements = (cardData?: CardBlockData): CardElementItem[] => {
  if (!cardData) return [];
  if (cardData.elements && Array.isArray(cardData.elements) && cardData.elements.length > 0) {
    return cardData.elements;
  }

  // Synthesize from legacy fields
  const synthesized: CardElementItem[] = [];

  // 1. Tags
  if (cardData.tags && cardData.tags.length > 0) {
    synthesized.push({
      id: `el_${Date.now()}_tags`,
      type: 'tag',
      tags: cardData.tags,
      tagsTitle: cardData.tagsTitle,
      tagsAlignment: 'left',
    });
  }

  // 2. Title & Description
  if (cardData.title || cardData.description) {
    synthesized.push({
      id: `el_${Date.now()}_txt_title`,
      type: 'text',
      text: cardData.title ? `**${cardData.title}**${cardData.description ? `\n${cardData.description}` : ''}` : (cardData.description || ''),
      textSize: '15px',
      textColor: cardData.titleColor || '#14291D',
      textBold: true,
      textAlignment: 'left',
    });
  }

  // 3. Image Only OR Image + Text horizontal row
  if (cardData.layoutMode === 'image_only' && cardData.imageUrl) {
    synthesized.push({
      id: `el_${Date.now()}_img`,
      type: 'image',
      imageUrl: cardData.imageUrl,
      imageSize: '160px',
      imageRounded: '12px',
      imageAlignment: cardData.imagePosition === 'right' ? 'right' : 'left',
      imageLinkUrl: cardData.imageLinkUrl,
    });
  } else if (cardData.showHorizontalRow && (cardData.imageUrl || cardData.rowText)) {
    synthesized.push({
      id: `el_${Date.now()}_imgtxt`,
      type: 'image_text',
      horizontalImageUrl: cardData.imageUrl,
      horizontalImagePosition: cardData.imagePosition === 'right' ? 'right' : 'left',
      horizontalImageSize: '80px',
      horizontalImageRounded: '12px',
      horizontalImageLinkUrl: cardData.imageLinkUrl,
      horizontalText: cardData.rowText,
      horizontalTextSize: '14px',
      horizontalTextColor: cardData.rowTextColor || '#14291D',
      horizontalLinkUrl: cardData.rowLinkUrl,
      horizontalLinkLabel: cardData.rowLinkLabel || 'Learn More',
      horizontalAlignment: 'center',
    });
  } else if (cardData.imageUrl) {
    synthesized.push({
      id: `el_${Date.now()}_img`,
      type: 'image',
      imageUrl: cardData.imageUrl,
      imageSize: '160px',
      imageRounded: '12px',
      imageAlignment: 'left',
      imageLinkUrl: cardData.imageLinkUrl,
    });
  }

  // 4. Rich text content
  if (cardData.content) {
    const lines = cardData.content.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.some(l => l.startsWith('-') || l.startsWith('•'))) {
      synthesized.push({
        id: `el_${Date.now()}_rt_list`,
        type: 'rich_text_list',
        listStyle: 'bullet',
        listItems: lines.map(l => l.replace(/^[-•]\s*/, '')),
        listFontSize: '13px',
        listTextColor: '#2D261A',
        listIconColor: '#16A34A',
        listSpacing: 'normal',
      });
    } else {
      synthesized.push({
        id: `el_${Date.now()}_rt_text`,
        type: 'text',
        text: cardData.content,
        textSize: '13px',
        textColor: '#3F3729',
        textAlignment: 'left',
      });
    }
  }

  return synthesized;
};

export const AdminMonographTabsManager: React.FC<AdminMonographTabsManagerProps> = ({
  products,
  selectedProductId,
  controlledTabs,
  onTabsChange,
  onUpdateProduct,
  onNotify,
}) => {
  const currentProduct = useMemo(() => {
    if (selectedProductId) {
      return products.find((p) => p.id === selectedProductId) || products[0];
    }
    return products[0];
  }, [products, selectedProductId]);

  const rawTabs = useMemo(() => {
    if (controlledTabs && controlledTabs.length > 0) {
      return controlledTabs;
    }
    if (currentProduct) {
      return getEffectiveMonographTabs(currentProduct);
    }
    return [];
  }, [controlledTabs, currentProduct]);

  // Ensure tabs have unified cards with elements
  const monographTabs = useMemo(() => {
    return rawTabs.map((tab) => {
      const existingBlocks = tab.blocks || [];
      const unifiedBlocks: MonographContentBlock[] = existingBlocks.map((blk) => {
        const elements = ensureCardElements(blk.cardData);
        return {
          id: blk.id,
          type: 'card',
          design: blk.design || {
            bgColor: '#FFFFFF',
            textColor: '#14291D',
            bgOpacity: 100,
            padding: 'md',
            margin: 'sm',
            border: 'solid',
            borderRadius: 'xl',
            alignment: 'left',
            width: 'full',
          },
          cardData: {
            ...(blk.cardData || {}),
            elements,
          },
        };
      });

      return {
        ...tab,
        blocks: unifiedBlocks,
      };
    });
  }, [rawTabs]);

  const [activeTabId, setActiveTabId] = useState<string>('overview');

  useEffect(() => {
    if (!monographTabs.some((t) => t.id === activeTabId) && monographTabs.length > 0) {
      setActiveTabId(monographTabs[0].id);
    }
  }, [monographTabs, activeTabId]);

  const activeTab = monographTabs.find((t) => t.id === activeTabId) || monographTabs[0];
  const activeTabIdx = monographTabs.findIndex((t) => t.id === (activeTab?.id || activeTabId));

  // ─────────────────────────────────────────────────────────────
  // Tab Management State
  // ─────────────────────────────────────────────────────────────
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabTitle, setNewTabTitle] = useState('');
  const [newTabSubtitle, setNewTabSubtitle] = useState('');
  const [newTabIcon, setNewTabIcon] = useState('sparkles');
  const [newTabActiveColorMode, setNewTabActiveColorMode] = useState<'color' | 'no_color' | 'theme'>('theme');

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTabTitle, setEditTabTitle] = useState('');

  // Delete confirmation state for Tabs and Cards
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    isOpen: boolean;
    type: 'tab' | 'card';
    id: string;
    title: string;
  } | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Active Tab Collapsible Header & Expand State
  // ─────────────────────────────────────────────────────────────
  const [isEditingTabHeader, setIsEditingTabHeader] = useState(false);
  const [tabHeaderTitle, setTabHeaderTitle] = useState('');
  const [tabHeaderSubtitle, setTabHeaderSubtitle] = useState('');
  const [tabHeaderIcon, setTabHeaderIcon] = useState('leaf');
  const [tabHeaderIconColor, setTabHeaderIconColor] = useState('');
  const [tabActiveColorMode, setTabActiveColorMode] = useState<'color' | 'no_color' | 'theme'>('theme');
  const [tabActiveBgColor, setTabActiveBgColor] = useState('#FAF6F0');
  const [tabActiveTextColor, setTabActiveTextColor] = useState('#14291D');
  const [tabActiveSubtitleColor, setTabActiveSubtitleColor] = useState('#6F6452');
  const [tabActiveIconBgColor, setTabActiveIconBgColor] = useState('#14291D');
  const [tabActiveIconColor, setTabActiveIconColor] = useState('#FCD34D');
  const [tabActiveBorderColor, setTabActiveBorderColor] = useState('#C2B7A3');

  const [headerPreviewExpanded, setHeaderPreviewExpanded] = useState(true);

  // Synchronize header state when active tab changes
  useEffect(() => {
    if (activeTab) {
      setTabHeaderTitle(activeTab.title || '');
      setTabHeaderSubtitle(activeTab.subtitle || '');
      setTabHeaderIcon(activeTab.icon || 'leaf');
      setTabHeaderIconColor(activeTab.iconColor || '');
      setTabActiveColorMode(activeTab.activeColorMode || 'theme');
      setTabActiveBgColor(activeTab.activeBgColor || '#FAF6F0');
      setTabActiveTextColor(activeTab.activeTextColor || '#14291D');
      setTabActiveSubtitleColor(activeTab.activeSubtitleColor || '#6F6452');
      setTabActiveIconBgColor(activeTab.activeIconBgColor || '#14291D');
      setTabActiveIconColor(activeTab.activeIconColor || '#FCD34D');
      setTabActiveBorderColor(activeTab.activeBorderColor || '#C2B7A3');
    }
  }, [activeTabId, activeTab]);

  // Card style accordion toggle per card id
  const [cardStylingExpanded, setCardStylingExpanded] = useState<Record<string, boolean>>({});

  // ─────────────────────────────────────────────────────────────
  // POPUP MODAL STATE: Edit Element inside Card
  // ─────────────────────────────────────────────────────────────
  const [activeElementModal, setActiveElementModal] = useState<{
    cardId: string;
    elementIndex?: number; // undefined means adding new
    element: CardElementItem;
  } | null>(null);

  // Helper to save tabs
  const saveUpdatedTabs = (newTabs: ProductMonographTab[], notifyMsg?: string) => {
    if (onTabsChange) {
      onTabsChange(newTabs);
    }
    if (currentProduct && onUpdateProduct) {
      const updatedProduct: HerbalProduct = {
        ...currentProduct,
        monographTabs: newTabs,
      };
      onUpdateProduct(updatedProduct);
      backupProductToFirebase(updatedProduct);
    }
    if (notifyMsg && onNotify) {
      onNotify(notifyMsg);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // TAB ACTIONS
  // ─────────────────────────────────────────────────────────────
  const handleCreateNewTab = () => {
    if (!newTabTitle.trim()) return;
    const tabId = `tab_${Date.now()}`;
    const newTab: ProductMonographTab = {
      id: tabId,
      title: newTabTitle.trim(),
      subtitle: newTabSubtitle.trim() || undefined,
      icon: newTabIcon !== 'none' ? newTabIcon : undefined,
      activeColorMode: newTabActiveColorMode,
      isCustom: true,
      enabled: true,
      items: [],
      blocks: [
        {
          id: `card_${Date.now()}_1`,
          type: 'card',
          design: {
            bgColor: '#FFFFFF',
            textColor: '#14291D',
            bgOpacity: 100,
            padding: 'md',
            margin: 'sm',
            border: 'solid',
            borderRadius: 'xl',
            alignment: 'left',
            width: 'full',
          },
          cardData: {
            elements: [
              {
                id: `el_${Date.now()}_1`,
                type: 'text',
                text: 'New Card details and clinical formulation info.',
                textSize: '15px',
                textColor: '#14291D',
                textBold: true,
                textAlignment: 'left',
              },
            ],
          },
        },
      ],
    };

    const updated = [...monographTabs, newTab];
    saveUpdatedTabs(updated, `Created tab "${newTab.title}"`);
    setActiveTabId(tabId);
    setNewTabTitle('');
    setNewTabSubtitle('');
    setIsAddingTab(false);
  };

  const handleSaveTabHeaderSettings = () => {
    if (!tabHeaderTitle.trim()) {
      if (onNotify) onNotify('Tab title cannot be empty.');
      return;
    }
    const updated = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        return {
          ...t,
          title: tabHeaderTitle.trim(),
          subtitle: tabHeaderSubtitle.trim() || undefined,
          icon: tabHeaderIcon !== 'none' ? tabHeaderIcon : undefined,
          iconColor: tabHeaderIconColor.trim() || undefined,
          activeColorMode: tabActiveColorMode,
          activeBgColor: tabActiveColorMode === 'color' ? tabActiveBgColor : undefined,
          activeTextColor: tabActiveColorMode === 'color' ? tabActiveTextColor : undefined,
          activeSubtitleColor: tabActiveColorMode === 'color' ? tabActiveSubtitleColor : undefined,
          activeIconBgColor: tabActiveColorMode === 'color' ? tabActiveIconBgColor : undefined,
          activeIconColor: tabActiveColorMode === 'color' ? tabActiveIconColor : undefined,
          activeBorderColor: tabActiveColorMode === 'color' ? tabActiveBorderColor : undefined,
        };
      }
      return t;
    });
    saveUpdatedTabs(updated, `Saved collapsible tab header "${tabHeaderTitle}"`);
    setIsEditingTabHeader(false);
  };

  const handleUpdateTabTitle = (tabId: string) => {
    if (!editTabTitle.trim()) return;
    const updated = monographTabs.map((t) =>
      t.id === tabId ? { ...t, title: editTabTitle.trim() } : t
    );
    saveUpdatedTabs(updated, 'Tab title updated');
    setEditingTabId(null);
  };

  const requestDeleteTab = (tabId: string) => {
    if (monographTabs.length <= 1) {
      if (onNotify) onNotify('At least one tab must remain.');
      return;
    }
    const tabToDelete = monographTabs.find((t) => t.id === tabId);
    setDeleteConfirmTarget({
      isOpen: true,
      type: 'tab',
      id: tabId,
      title: tabToDelete?.title || 'Untitled Tab',
    });
  };

  const confirmDeleteTab = (tabId: string) => {
    const tabToDelete = monographTabs.find((t) => t.id === tabId);
    const updated = monographTabs.filter((t) => t.id !== tabId);
    saveUpdatedTabs(updated, `Deleted tab "${tabToDelete?.title}"`);
    setActiveTabId(updated[0]?.id || '');
    setDeleteConfirmTarget(null);
  };

  const handleMoveTab = (tabId: string, direction: 'left' | 'right') => {
    const idx = monographTabs.findIndex((t) => t.id === tabId);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= monographTabs.length) return;

    const copy = [...monographTabs];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    saveUpdatedTabs(copy, `Moved tab "${moved.title}" to position ${targetIdx + 1}`);
  };

  // ─────────────────────────────────────────────────────────────
  // CARD LEVEL ACTIONS (Create Card, Move Card, Duplicate, Delete)
  // ─────────────────────────────────────────────────────────────
  const handleAddNewCard = () => {
    if (!activeTab) return;
    const newCardId = `card_${Date.now()}`;
    const newCardBlock: MonographContentBlock = {
      id: newCardId,
      type: 'card',
      design: {
        bgColor: '#FFFFFF',
        textColor: '#14291D',
        bgOpacity: 100,
        padding: 'md',
        margin: 'sm',
        border: 'solid',
        borderRadius: 'xl',
        alignment: 'left',
        width: 'full',
      },
      cardData: {
        showHeader: false,
        elements: [
          {
            id: `el_${Date.now()}_txt`,
            type: 'text',
            text: 'Card title or highlight paragraph.',
            textSize: '15px',
            textColor: '#14291D',
            textBold: true,
            textAlignment: 'left',
          },
        ],
      },
    };

    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        return {
          ...t,
          blocks: [...(t.blocks || []), newCardBlock],
        };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, `Added new card to ${activeTab.title}`);
  };

  const handleMoveCard = (cardId: string, direction: 'up' | 'down') => {
    const targetTab = monographTabs.find((t) => t.id === activeTabId);
    if (!targetTab) return;

    const currentBlocks = [...(targetTab.blocks || [])];
    const idx = currentBlocks.findIndex((b) => b.id === cardId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentBlocks.length) return;

    const [moved] = currentBlocks.splice(idx, 1);
    currentBlocks.splice(targetIdx, 0, moved);

    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        return { ...t, blocks: currentBlocks };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Reordered cards');
  };

  const handleDuplicateCard = (cardId: string) => {
    const targetTab = monographTabs.find((t) => t.id === activeTabId);
    if (!targetTab) return;

    const currentBlocks = targetTab.blocks || [];
    const blockToClone = currentBlocks.find((b) => b.id === cardId);
    if (!blockToClone) return;

    const clonedElements = (ensureCardElements(blockToClone.cardData) || []).map((el) => ({
      ...el,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    const clonedBlock: MonographContentBlock = {
      ...blockToClone,
      id: `card_${Date.now()}_copy`,
      cardData: {
        ...(blockToClone.cardData || {}),
        title: blockToClone.cardData?.title ? `${blockToClone.cardData.title} (Copy)` : undefined,
        elements: clonedElements,
      },
    };

    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        return {
          ...t,
          blocks: [...(t.blocks || []), clonedBlock],
        };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Card duplicated');
  };

  const requestDeleteCard = (cardId: string, cardNum: number, cardTitle?: string) => {
    setDeleteConfirmTarget({
      isOpen: true,
      type: 'card',
      id: cardId,
      title: cardTitle ? `Card #${cardNum} (${cardTitle})` : `Card #${cardNum}`,
    });
  };

  const confirmDeleteCard = (cardId: string) => {
    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        return {
          ...t,
          blocks: (t.blocks || []).filter((b) => b.id !== cardId),
        };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Card deleted');
    setDeleteConfirmTarget(null);
  };

  const handleUpdateCardDesign = (cardId: string, updates: Partial<BlockDesignSettings>) => {
    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        const updatedBlocks = (t.blocks || []).map((b) => {
          if (b.id === cardId) {
            return {
              ...b,
              design: {
                ...(b.design || {}),
                ...updates,
              },
            };
          }
          return b;
        });
        return { ...t, blocks: updatedBlocks };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs);
  };

  // ─────────────────────────────────────────────────────────────
  // ELEMENT ACTIONS INSIDE CARD
  // ─────────────────────────────────────────────────────────────
  const openNewElementModal = (cardId: string, type: CardElementType) => {
    let initialElement: CardElementItem;

    switch (type) {
      case 'image':
        initialElement = {
          id: `el_${Date.now()}`,
          type: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
          imageSize: '160px',
          imageRounded: '12px',
          imageAlignment: 'left',
          imageCaption: '',
        };
        break;

      case 'text':
        initialElement = {
          id: `el_${Date.now()}`,
          type: 'text',
          text: 'Standardized classical botanical extract processed in GMP cleanrooms.',
          textSize: '14px',
          textColor: '#14291D',
          textStyle: 'normal',
          textBold: false,
          textUnderline: false,
          textAlignment: 'left',
        };
        break;

      case 'tag':
        initialElement = {
          id: `el_${Date.now()}`,
          type: 'tag',
          tagsTitle: '',
          tagsAlignment: 'left',
          tags: [
            {
              id: `tag_1`,
              text: '100% Herbal',
              bgColor: '#14291D',
              textColor: '#FFFFFF',
              bgOpacity: 100,
              style: 'rounded',
              fontSize: 'xs',
            },
            {
              id: `tag_2`,
              text: 'Apothecary Verified',
              bgColor: '#B4741E',
              textColor: '#FFFFFF',
              bgOpacity: 100,
              style: 'rounded',
              fontSize: 'xs',
            },
          ],
        };
        break;

      case 'image_text':
        initialElement = {
          id: `el_${Date.now()}`,
          type: 'image_text',
          horizontalImageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
          horizontalImagePosition: 'left',
          horizontalImageSize: '80px',
          horizontalImageRounded: '12px',
          horizontalText: 'Full-spectrum active polyphenols standardized to classical ratios.',
          horizontalTextSize: '14px',
          horizontalTextColor: '#14291D',
          horizontalTextBold: false,
          horizontalTextItalic: false,
          horizontalLinkUrl: '',
          horizontalLinkLabel: 'View Research',
          horizontalAlignment: 'center',
        };
        break;

      case 'rich_text_list':
        initialElement = {
          id: `el_${Date.now()}`,
          type: 'rich_text_list',
          listStyle: 'check',
          listItems: [
            'Standardized bio-active alkaloid concentration',
            'Heavy metals tested under Ayurvedic Pharmacopoeia limits',
            'Zero synthetic artificial binders or preservatives',
          ],
          listFontSize: '13px',
          listTextColor: '#2D261A',
          listIconColor: '#16A34A',
          listSpacing: 'normal',
        };
        break;

      case 'custom_table':
        initialElement = {
          id: `el_${Date.now()}`,
          type: 'custom_table',
          tableHeaders: ['Parameter', 'Specification', 'Result'],
          tableRows: [
            ['Moisture Content', 'NMT 5.0% w/w', '3.1% w/w'],
            ['Total Ash Value', 'NMT 7.0% w/w', '4.6% w/w'],
            ['Active Assay %', 'Min 2.5%', '3.8%'],
          ],
          tableHeaderBgColor: '#FAF6F0',
          tableHeaderTextColor: '#14291D',
          tableCellTextColor: '#2D261A',
          tableBorderColor: '#DDD5C5',
          tableFontSize: '12px',
          tableZebra: true,
        };
        break;

      case 'divider':
        initialElement = {
          id: `el_${Date.now()}`,
          type: 'divider',
          dividerStyle: 'line',
          dividerColor: '#E2D9CB',
          dividerThickness: 1,
          dividerHeightPx: 16,
        };
        break;

      default:
        return;
    }

    setActiveElementModal({
      cardId,
      elementIndex: undefined,
      element: initialElement,
    });
  };

  const openEditElementModal = (cardId: string, elementIndex: number, element: CardElementItem) => {
    setActiveElementModal({
      cardId,
      elementIndex,
      element: { ...element },
    });
  };

  const handleSaveElementModal = (elementToSave: CardElementItem) => {
    if (!activeElementModal) return;
    const { cardId, elementIndex } = activeElementModal;

    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        const updatedBlocks = (t.blocks || []).map((b) => {
          if (b.id === cardId) {
            const currentElements = [...ensureCardElements(b.cardData)];
            if (typeof elementIndex === 'number' && elementIndex >= 0) {
              currentElements[elementIndex] = elementToSave;
            } else {
              currentElements.push(elementToSave);
            }
            return {
              ...b,
              cardData: {
                ...(b.cardData || {}),
                elements: currentElements,
              },
            };
          }
          return b;
        });
        return { ...t, blocks: updatedBlocks };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Saved element in card');
    setActiveElementModal(null);
  };

  const handleMoveElement = (cardId: string, elementIndex: number, direction: 'up' | 'down') => {
    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        const updatedBlocks = (t.blocks || []).map((b) => {
          if (b.id === cardId) {
            const currentElements = [...ensureCardElements(b.cardData)];
            const targetIdx = direction === 'up' ? elementIndex - 1 : elementIndex + 1;
            if (targetIdx < 0 || targetIdx >= currentElements.length) return b;
            const [moved] = currentElements.splice(elementIndex, 1);
            currentElements.splice(targetIdx, 0, moved);
            return {
              ...b,
              cardData: {
                ...(b.cardData || {}),
                elements: currentElements,
              },
            };
          }
          return b;
        });
        return { ...t, blocks: updatedBlocks };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Reordered elements');
  };

  const handleDeleteElement = (cardId: string, elementIndex: number) => {
    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        const updatedBlocks = (t.blocks || []).map((b) => {
          if (b.id === cardId) {
            const currentElements = [...ensureCardElements(b.cardData)];
            currentElements.splice(elementIndex, 1);
            return {
              ...b,
              cardData: {
                ...(b.cardData || {}),
                elements: currentElements,
              },
            };
          }
          return b;
        });
        return { ...t, blocks: updatedBlocks };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Deleted element');
  };

  const handleDuplicateElement = (cardId: string, elementIndex: number) => {
    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTabId) {
        const updatedBlocks = (t.blocks || []).map((b) => {
          if (b.id === cardId) {
            const currentElements = [...ensureCardElements(b.cardData)];
            const toClone = currentElements[elementIndex];
            if (!toClone) return b;
            const cloned: CardElementItem = {
              ...toClone,
              id: `el_${Date.now()}_copy`,
            };
            currentElements.splice(elementIndex + 1, 0, cloned);
            return {
              ...b,
              cardData: {
                ...(b.cardData || {}),
                elements: currentElements,
              },
            };
          }
          return b;
        });
        return { ...t, blocks: updatedBlocks };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Duplicated element');
  };

  return (
    <div className="space-y-5 font-sans text-[#2C2416]">
      {/* ─────────────────────────────────────────────────────────────
          1. TABS NAVIGATION & MANAGEMENT ROW
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DEC9] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#14291D]">
                Collapsible Monograph Tabs ({monographTabs.length})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#14291D]/10 text-[#14291D] font-bold">
                Live Accordion System
              </span>
            </div>
            <p className="text-xs text-[#6F6452] mt-0.5">
              Click tab to switch sections. Each tab can contain multiple cards with custom colors & opacities.
            </p>
          </div>

          {/* "+ Add New Tab" button */}
          {!isAddingTab ? (
            <button
              type="button"
              onClick={() => setIsAddingTab(true)}
              className="px-3 py-1.5 rounded-lg bg-[#14291D] text-amber-300 hover:bg-[#203E2D] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add New Tab</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTab(false)}
                className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Panel for Adding New Tab */}
        {isAddingTab && (
          <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-2.5 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-[#14291D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B4741E]" />
              <span>Create New Collapsible Tab</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#14291D] mb-1">
                  Tab Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clinical Pharmacology, Traditional Uses"
                  value={newTabTitle}
                  onChange={(e) => setNewTabTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#14291D] mb-1">
                  Description below Title (Subtitle)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanism of action & bio-absorption parameters"
                  value={newTabSubtitle}
                  onChange={(e) => setNewTabSubtitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Icon selection for new tab */}
            <div>
              <label className="block text-[11px] font-semibold text-[#14291D] mb-1">
                Tab Icon
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#FAF8F5] rounded-lg border border-[#DDD5C5]">
                {TAB_HEADER_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNewTabIcon(opt.id)}
                    className={`p-1 rounded flex items-center justify-center gap-1 text-[10px] cursor-pointer transition-all ${
                      newTabIcon === opt.id
                        ? 'bg-[#14291D] text-amber-300 font-bold ring-1 ring-amber-400'
                        : 'bg-white text-stone-700 hover:bg-stone-100'
                    }`}
                    title={opt.label}
                  >
                    {renderTabHeaderIcon(opt.id, "w-3 h-3")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAddingTab(false)}
                className="px-3 py-1 rounded text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewTab}
                className="px-3.5 py-1 rounded bg-[#14291D] text-amber-300 text-xs font-semibold hover:bg-[#203E2D] cursor-pointer shadow-2xs"
              >
                Create Tab
              </button>
            </div>
          </div>
        )}

        {/* Tab Buttons Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
          {monographTabs.map((tab, idx) => {
            const isActive = tab.id === activeTabId;
            const cardsCount = tab.blocks?.length || 0;

            return (
              <div
                key={tab.id}
                className={`flex items-center rounded-xl border transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs'
                    : 'bg-white text-[#2C2416] border-[#DDD5C5] hover:border-[#C2B7A3]'
                }`}
              >
                {editingTabId === tab.id ? (
                  <div className="flex items-center gap-1 px-2 py-1">
                    <input
                      type="text"
                      value={editTabTitle}
                      onChange={(e) => setEditTabTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateTabTitle(tab.id)}
                      autoFocus
                      className="text-xs px-2 py-0.5 rounded border border-amber-400 bg-white text-[#14291D] font-medium w-32 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateTabTitle(tab.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTabId(null)}
                      className="p-1 text-stone-400 hover:text-stone-300 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTabId(tab.id)}
                      className="px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isActive ? 'bg-amber-400/25 text-amber-300' : 'bg-stone-200/80 text-stone-700'
                      }`}>
                        #{idx + 1}
                      </span>
                      {tab.icon && tab.icon !== 'none' && (
                        <span className="opacity-80">
                          {renderTabHeaderIcon(tab.icon, "w-3.5 h-3.5")}
                        </span>
                      )}
                      <span>{tab.title}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {cardsCount} {cardsCount === 1 ? 'card' : 'cards'}
                      </span>
                    </button>

                    <div className="flex items-center pr-1.5 gap-0.5 border-l border-black/10 pl-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveTab(tab.id, 'left')}
                        className="p-1 hover:bg-black/10 rounded cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title={`Move Tab Left (Current Position: #${idx + 1} of ${monographTabs.length})`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === monographTabs.length - 1}
                        onClick={() => handleMoveTab(tab.id, 'right')}
                        className="p-1 hover:bg-black/10 rounded cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title={`Move Tab Right (Current Position: #${idx + 1} of ${monographTabs.length})`}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTabId(tab.id);
                          setEditTabTitle(tab.title);
                        }}
                        className="p-1 hover:bg-black/10 rounded cursor-pointer transition-colors"
                        title="Rename Tab"
                      >
                        <Edit3 className="w-3 h-3 opacity-70" />
                      </button>
                      {monographTabs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => requestDeleteTab(tab.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                          title="Delete Tab"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ACTIVE TAB: HEADER & EXPAND COLOR SETTINGS
      ───────────────────────────────────────────────────────────── */}
      {activeTab && (
        <div className="space-y-4 p-4 bg-white rounded-xl border border-[#E2D9CB]">
          {/* Active Tab Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D4]">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#14291D] text-amber-300 border border-[#14291D] shadow-2xs">
                {renderTabHeaderIcon(activeTab.icon, "w-4 h-4")}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-serif font-bold text-sm sm:text-base text-[#14291D]">
                    {activeTab.title}
                  </h5>
                  {activeTab.activeColorMode === 'no_color' ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300">
                      ⚪ No Color Change (Neutral)
                    </span>
                  ) : activeTab.activeColorMode === 'color' ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      🎨 Custom Expand Color
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      🟢 Theme Accent (Ayurvedic Green & Gold)
                    </span>
                  )}
                </div>
                {activeTab.subtitle && (
                  <p className="text-xs text-[#6F6452] mt-0.5">
                    {activeTab.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {/* Tab Position Order Control */}
              <div className="flex items-center rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-0.5 text-xs shadow-2xs" title="Tab Position Sequence">
                <button
                  type="button"
                  disabled={activeTabIdx <= 0}
                  onClick={() => handleMoveTab(activeTab.id, 'left')}
                  className="p-1 hover:bg-stone-200 text-stone-700 disabled:opacity-25 disabled:cursor-not-allowed rounded cursor-pointer transition-colors"
                  title="Move tab left (previous)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono font-bold text-[#14291D]">
                  Tab #{activeTabIdx + 1} of {monographTabs.length}
                </span>
                <button
                  type="button"
                  disabled={activeTabIdx >= monographTabs.length - 1}
                  onClick={() => handleMoveTab(activeTab.id, 'right')}
                  className="p-1 hover:bg-stone-200 text-stone-700 disabled:opacity-25 disabled:cursor-not-allowed rounded cursor-pointer transition-colors"
                  title="Move tab right (next)"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingTabHeader(!isEditingTabHeader)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-all ${
                  isEditingTabHeader
                    ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                    : 'bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#14291D] border-[#DDD5C5]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isEditingTabHeader ? 'Close Header Settings' : 'Customize Tab Header & Expand Color'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddNewCard}
                className="px-3.5 py-1.5 rounded-lg bg-[#14291D] hover:bg-[#203E2D] text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add New Card</span>
              </button>

              {monographTabs.length > 1 && (
                <button
                  type="button"
                  onClick={() => requestDeleteTab(activeTab.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer transition-colors"
                  title="Delete this Tab"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Header Settings Drawer */}
          {isEditingTabHeader && (
            <div className="p-4 rounded-xl border border-amber-300 bg-[#FAF8F5] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
                <span className="text-xs font-bold text-[#14291D] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#B4741E]" />
                  <span>Collapsible Tab Header, Description, Icon & Expand Color</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTabHeader(false)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left side: Title, Subtitle, Icon */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#14291D] mb-1">
                      Tab Title (Accordion Header)
                    </label>
                    <input
                      type="text"
                      value={tabHeaderTitle}
                      onChange={(e) => setTabHeaderTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs font-medium text-[#14291D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#14291D] mb-1">
                      Description below Title (Collapsible Subtitle)
                    </label>
                    <textarea
                      rows={2}
                      value={tabHeaderSubtitle}
                      onChange={(e) => setTabHeaderSubtitle(e.target.value)}
                      placeholder="e.g. Verified Ayurvedic Pharmacopoeia composition, ratio & role."
                      className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs text-[#2C2416]"
                    />
                  </div>

                  {/* Icon Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-[#14291D] mb-1.5 flex items-center justify-between">
                      <span>Header Icon</span>
                      <span className="text-[10px] font-mono text-[#7A705E] capitalize">{tabHeaderIcon}</span>
                    </label>
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white rounded-lg border border-[#DDD5C5]">
                      {TAB_HEADER_ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTabHeaderIcon(opt.id)}
                          className={`p-1.5 rounded flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            tabHeaderIcon === opt.id
                              ? 'bg-[#14291D] text-amber-300 ring-2 ring-amber-400 shadow-2xs'
                              : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                          title={opt.label}
                        >
                          {renderTabHeaderIcon(opt.id, "w-3.5 h-3.5")}
                          <span className="text-[9px] truncate w-full text-center">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side: Expand Color Selection */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#14291D] mb-1.5">
                      Expand Color Mode (When Customer Clicks to Open Accordion)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTabActiveColorMode('no_color')}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          tabActiveColorMode === 'no_color'
                            ? 'bg-white border-[#14291D] ring-2 ring-[#14291D]/20 shadow-xs'
                            : 'bg-stone-50/70 border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#14291D]">
                          <span className="w-3.5 h-3.5 rounded-full border border-stone-400 bg-white inline-block shrink-0" />
                          <span>No Color</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                          Neutral clean; no background change on expand.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTabActiveColorMode('color')}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          tabActiveColorMode === 'color'
                            ? 'bg-white border-[#14291D] ring-2 ring-[#14291D]/20 shadow-xs'
                            : 'bg-stone-50/70 border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#14291D]">
                          <Palette className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Custom Color</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                          Custom header background, text & icon.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTabActiveColorMode('theme')}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          tabActiveColorMode === 'theme'
                            ? 'bg-white border-[#14291D] ring-2 ring-[#14291D]/20 shadow-xs'
                            : 'bg-stone-50/70 border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#14291D]">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#14291D] border border-amber-300 inline-block shrink-0" />
                          <span>Theme Accent</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                          Forest green `#14291D` with warm amber.
                        </p>
                      </button>
                    </div>
                  </div>

                  {tabActiveColorMode === 'color' && (
                    <div className="p-3 bg-white rounded-xl border border-[#DDD5C5] space-y-2.5">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Expanded Bg Color</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={tabActiveBgColor}
                              onChange={(e) => setTabActiveBgColor(e.target.value)}
                              className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={tabActiveBgColor}
                              onChange={(e) => setTabActiveBgColor(e.target.value)}
                              className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Expanded Title Color</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={tabActiveTextColor}
                              onChange={(e) => setTabActiveTextColor(e.target.value)}
                              className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={tabActiveTextColor}
                              onChange={(e) => setTabActiveTextColor(e.target.value)}
                              className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Header preview toggle */}
                  <div className="pt-2 border-t border-[#DDD5C5] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Preview State:</span>
                    </span>
                    <div className="inline-flex rounded-lg border border-stone-300 bg-white p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setHeaderPreviewExpanded(false)}
                        className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                          !headerPreviewExpanded ? 'bg-stone-800 text-white' : 'text-stone-600'
                        }`}
                      >
                        Collapsed
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeaderPreviewExpanded(true)}
                        className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                          headerPreviewExpanded ? 'bg-[#14291D] text-amber-300' : 'text-stone-600'
                        }`}
                      >
                        Expanded (Active)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE3D4]">
                <button
                  type="button"
                  onClick={() => setIsEditingTabHeader(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#DDD5C5] bg-white text-[#554C3E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTabHeaderSettings}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#14291D] hover:bg-[#203E2D] text-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Collapsible Tab Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              3. CARDS LIST INSIDE ACTIVE TAB
          ───────────────────────────────────────────────────────────── */}
          {(!activeTab.blocks || activeTab.blocks.length === 0) ? (
            <div className="p-8 text-center border-2 border-dashed border-[#DDD5C5] rounded-xl bg-[#FAF8F5] space-y-3">
              <Layers className="w-8 h-8 text-[#A89C89] mx-auto" />
              <div>
                <p className="text-xs font-bold text-[#14291D]">
                  No cards in this tab yet.
                </p>
                <p className="text-xs text-[#6F6452] mt-0.5">
                  Click "+ Add New Card" to create multiple cards with custom colors, opacity, and elements.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddNewCard}
                className="px-4 py-2 bg-[#14291D] hover:bg-[#203E2D] text-amber-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add First Card in {activeTab.title}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {activeTab.blocks.map((block, cardIdx) => {
                const elements = ensureCardElements(block.cardData);
                const isStyleOpen = !!cardStylingExpanded[block.id];
                const design = block.design || {};
                const bgColor = design.bgColor || '#FFFFFF';
                const bgOpacity = design.bgOpacity ?? 100;
                const borderStyle = design.border || 'solid';
                const borderColor = design.borderColor || '#E2D9CB';
                const borderRadius = design.borderRadius || 'xl';
                const cardPadding = design.padding || 'md';

                return (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-[#DDD5C5] bg-[#FAF8F5] shadow-xs overflow-hidden transition-all hover:border-[#14291D]/40"
                  >
                    {/* Card Top Header & Action Controls */}
                    <div className="p-3.5 sm:p-4 bg-white border-b border-[#EAE3D4] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#14291D] text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {cardIdx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif font-bold text-xs sm:text-sm text-[#14291D]">
                              Card #{cardIdx + 1}
                            </span>
                            {/* Color & Opacity preview pill */}
                            <span 
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-black/10"
                              style={{ backgroundColor: hexToRgba(bgColor, bgOpacity), color: design.textColor || '#14291D' }}
                            >
                              <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: bgColor }} />
                              <span>{bgColor} ({bgOpacity}% opacity)</span>
                            </span>
                            <span className="text-[10px] font-mono text-[#6F6452] bg-stone-100 px-1.5 py-0.5 rounded">
                              {elements.length} {elements.length === 1 ? 'element' : 'elements'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Reordering & Actions */}
                      <div className="flex items-center gap-1.5">
                        {/* Move Card Up/Down */}
                        <div className="flex items-center rounded-lg border border-[#DDD5C5] bg-white p-0.5">
                          <button
                            type="button"
                            disabled={cardIdx === 0}
                            onClick={() => handleMoveCard(block.id, 'up')}
                            className="p-1 text-stone-600 hover:text-[#14291D] disabled:opacity-20 cursor-pointer"
                            title="Move Card Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={cardIdx === (activeTab.blocks?.length || 0) - 1}
                            onClick={() => handleMoveCard(block.id, 'down')}
                            className="p-1 text-stone-600 hover:text-[#14291D] disabled:opacity-20 cursor-pointer"
                            title="Move Card Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Card Styling & Opacity Drawer Toggle */}
                        <button
                          type="button"
                          onClick={() => setCardStylingExpanded((prev) => ({ ...prev, [block.id]: !prev[block.id] }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 cursor-pointer transition-colors ${
                            isStyleOpen
                              ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                              : 'bg-white hover:bg-stone-50 text-[#14291D] border-[#DDD5C5]'
                          }`}
                        >
                          <Palette className="w-3 h-3" />
                          <span>Card Color & Opacity</span>
                        </button>

                        {/* Duplicate Card */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateCard(block.id)}
                          className="p-1.5 rounded-lg bg-white border border-[#DDD5C5] text-stone-600 hover:text-[#14291D] cursor-pointer"
                          title="Duplicate Card"
                        >
                          <Copy className="w-3 h-3" />
                        </button>

                        {/* Delete Card */}
                        <button
                          type="button"
                          onClick={() => requestDeleteCard(block.id, cardIdx + 1, block.cardData?.title)}
                          className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Card Design, Color & Opacity Controls */}
                    {isStyleOpen && (
                      <div className="p-3.5 bg-[#FAF6F0] border-b border-[#EAE3D4] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
                        {/* Background Color */}
                        <div>
                          <label className="block text-[11px] font-semibold text-[#14291D] mb-1">
                            Card Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => handleUpdateCardDesign(block.id, { bgColor: e.target.value })}
                              className="w-8 h-8 rounded border border-stone-300 cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={bgColor}
                              onChange={(e) => handleUpdateCardDesign(block.id, { bgColor: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded font-mono text-xs"
                            />
                          </div>
                          {/* Quick swatches */}
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {['#FFFFFF', '#FAF8F5', '#F5F0E6', '#F0FDF4', '#FEF3C7', '#EFF6FF', '#14291D'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleUpdateCardDesign(block.id, { bgColor: c })}
                                style={{ backgroundColor: c }}
                                className="w-4 h-4 rounded-full border border-stone-300 cursor-pointer"
                                title={c}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Background Opacity */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-[#14291D]">
                              Card Opacity: <span className="font-mono">{bgOpacity}%</span>
                            </label>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={bgOpacity}
                            onChange={(e) => handleUpdateCardDesign(block.id, { bgOpacity: Number(e.target.value) })}
                            className="w-full accent-[#14291D] mt-1"
                          />
                          <p className="text-[10px] text-stone-500 mt-1">
                            Sets transparent background opacity.
                          </p>
                        </div>

                        {/* Card Border Style & Color */}
                        <div>
                          <label className="block text-[11px] font-semibold text-[#14291D] mb-1">
                            Border Style & Color
                          </label>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={borderStyle}
                              onChange={(e) => handleUpdateCardDesign(block.id, { border: e.target.value as any })}
                              className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs"
                            >
                              <option value="solid">Solid Border</option>
                              <option value="dashed">Dashed Border</option>
                              <option value="none">No Border</option>
                            </select>
                            <input
                              type="color"
                              value={borderColor}
                              onChange={(e) => handleUpdateCardDesign(block.id, { borderColor: e.target.value })}
                              className="w-7 h-7 rounded border border-stone-300 cursor-pointer shrink-0"
                            />
                          </div>
                        </div>

                        {/* Corner Curve (Border Radius) */}
                        <div>
                          <label className="block text-[11px] font-semibold text-[#14291D] mb-1">
                            Card Curve (Corners)
                          </label>
                          <select
                            value={borderRadius}
                            onChange={(e) => handleUpdateCardDesign(block.id, { borderRadius: e.target.value as any })}
                            className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs"
                          >
                            <option value="none">Straight (0px)</option>
                            <option value="sm">Subtle Curve (4px)</option>
                            <option value="md">Medium Curve (8px)</option>
                            <option value="lg">Card Curve (12px)</option>
                            <option value="xl">Smooth Curve (16px)</option>
                            <option value="2xl">Deep Curve (24px)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* ══════════════════════════════════════════════════
                        TOP OF CARD: ELEMENT CREATION TOOLBAR
                    ══════════════════════════════════════════════════ */}
                    <div className="px-3.5 py-2.5 bg-[#FAF6F0] border-b border-[#EAE3D4] flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[#14291D] uppercase tracking-wider mr-1 flex items-center gap-1">
                        <Plus className="w-3 h-3 text-[#B4741E]" />
                        <span>Add to Card:</span>
                      </span>

                      {/* 1) Image */}
                      <button
                        type="button"
                        onClick={() => openNewElementModal(block.id, 'image')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-[#14291D] border border-[#DDD5C5] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#14291D]"
                      >
                        <ImageIcon className="w-3 h-3 text-blue-600" />
                        <span>+ Image</span>
                      </button>

                      {/* 2) Text */}
                      <button
                        type="button"
                        onClick={() => openNewElementModal(block.id, 'text')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-[#14291D] border border-[#DDD5C5] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#14291D]"
                      >
                        <Type className="w-3 h-3 text-amber-700" />
                        <span>+ Text</span>
                      </button>

                      {/* 3) Tag */}
                      <button
                        type="button"
                        onClick={() => openNewElementModal(block.id, 'tag')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-[#14291D] border border-[#DDD5C5] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#14291D]"
                      >
                        <TagIcon className="w-3 h-3 text-emerald-600" />
                        <span>+ Tag</span>
                      </button>

                      {/* 4) Image + Text (Horizontal Line) */}
                      <button
                        type="button"
                        onClick={() => openNewElementModal(block.id, 'image_text')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-[#14291D] border border-[#DDD5C5] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#14291D]"
                      >
                        <span className="flex items-center text-teal-700">
                          <ImageIcon className="w-3 h-3" />
                          <span className="text-[10px] mx-0.5">+</span>
                          <Type className="w-3 h-3" />
                        </span>
                        <span>+ Image + Text</span>
                      </button>

                      {/* 5) Rich Text List */}
                      <button
                        type="button"
                        onClick={() => openNewElementModal(block.id, 'rich_text_list')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-[#14291D] border border-[#DDD5C5] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#14291D]"
                      >
                        <ListIcon className="w-3 h-3 text-indigo-600" />
                        <span>+ Rich Text List</span>
                      </button>

                      {/* 6) Custom Table */}
                      <button
                        type="button"
                        onClick={() => openNewElementModal(block.id, 'custom_table')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-[#14291D] border border-[#DDD5C5] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#14291D]"
                      >
                        <TableIcon className="w-3 h-3 text-purple-600" />
                        <span>+ Custom Table</span>
                      </button>

                      {/* 7) Divider */}
                      <button
                        type="button"
                        onClick={() => openNewElementModal(block.id, 'divider')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-[#14291D] border border-[#DDD5C5] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#14291D]"
                      >
                        <Minus className="w-3 h-3 text-stone-600" />
                        <span>+ Divider</span>
                      </button>
                    </div>

                    {/* ══════════════════════════════════════════════════
                        INSIDE CARD: REORDERABLE ELEMENTS SEQUENCE LIST
                    ══════════════════════════════════════════════════ */}
                    <div className="p-3.5 sm:p-4 space-y-3">
                      {elements.length === 0 ? (
                        <div className="py-6 text-center text-[#7A705E] bg-white rounded-xl border border-dashed border-[#DDD5C5]">
                          <p className="text-xs font-semibold">Card is empty.</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Click any element button above (+ Image, + Text, + Tag, + Image+Text, + List, + Table, + Divider) to add content.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                            Card Elements Sequence (Adjust sequence with Up/Down arrows):
                          </span>

                          {elements.map((el, elIdx) => {
                            // Element Type Badge label
                            let typeBadge = '';
                            let typeIcon = null;

                            switch (el.type) {
                              case 'image':
                                typeBadge = `Image (${el.imageSize || '160px'}, ${el.imageAlignment || 'left'})`;
                                typeIcon = <ImageIcon className="w-3.5 h-3.5 text-blue-600" />;
                                break;
                              case 'text':
                                typeBadge = `Text (${el.textSize || '14px'}, ${el.textAlignment || 'left'})`;
                                typeIcon = <Type className="w-3.5 h-3.5 text-amber-700" />;
                                break;
                              case 'tag':
                                typeBadge = `Tags (${el.tags?.length || 0} badges)`;
                                typeIcon = <TagIcon className="w-3.5 h-3.5 text-emerald-600" />;
                                break;
                              case 'image_text':
                                typeBadge = `Image + Text (${el.horizontalImagePosition === 'right' ? 'Right' : 'Left'}, ${el.horizontalImageSize || '80px'})`;
                                typeIcon = <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700" />;
                                break;
                              case 'rich_text_list':
                                typeBadge = `Rich Text List (${el.listItems?.length || 0} items, ${el.listStyle || 'bullet'})`;
                                typeIcon = <ListIcon className="w-3.5 h-3.5 text-indigo-600" />;
                                break;
                              case 'custom_table':
                                typeBadge = `Custom Table (${el.tableHeaders?.length || 0} cols x ${el.tableRows?.length || 0} rows)`;
                                typeIcon = <TableIcon className="w-3.5 h-3.5 text-purple-600" />;
                                break;
                              case 'divider':
                                typeBadge = `Divider (${el.dividerStyle || 'line'}, ${el.dividerHeightPx || 16}px)`;
                                typeIcon = <Minus className="w-3.5 h-3.5 text-stone-600" />;
                                break;
                            }

                            return (
                              <div
                                key={el.id || elIdx}
                                className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#E2D9CB] hover:border-[#14291D] flex items-center justify-between gap-3 transition-all shadow-2xs"
                              >
                                {/* Left: Sequence Position Arrows & Type Badge */}
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  {/* Position Arrow Buttons */}
                                  <div className="flex items-center rounded-md border border-[#DDD5C5] bg-[#FAF8F5] p-0.5 shrink-0">
                                    <button
                                      type="button"
                                      disabled={elIdx === 0}
                                      onClick={() => handleMoveElement(block.id, elIdx, 'up')}
                                      className="p-1 text-stone-600 hover:text-[#14291D] disabled:opacity-20 cursor-pointer"
                                      title="Move Element Up"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={elIdx === elements.length - 1}
                                      onClick={() => handleMoveElement(block.id, elIdx, 'down')}
                                      className="p-1 text-stone-600 hover:text-[#14291D] disabled:opacity-20 cursor-pointer"
                                      title="Move Element Down"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Sequence index */}
                                  <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">
                                    #{elIdx + 1}
                                  </span>

                                  {/* Type Icon & Badge */}
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="p-1 rounded bg-stone-100 shrink-0">
                                      {typeIcon}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#14291D]">
                                          {typeBadge}
                                        </span>
                                      </div>

                                      {/* Snippet preview */}
                                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                                        {el.type === 'text' && el.text}
                                        {el.type === 'image' && (el.imageUrl || 'No image URL')}
                                        {el.type === 'image_text' && (el.horizontalText || el.horizontalImageUrl)}
                                        {el.type === 'rich_text_list' && el.listItems?.join(' · ')}
                                        {el.type === 'tag' && el.tags?.map(t => t.text).join(', ')}
                                        {el.type === 'custom_table' && el.tableHeaders?.join(' | ')}
                                        {el.type === 'divider' && `Height: ${el.dividerHeightPx}px`}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Edit, Duplicate, Delete */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openEditElementModal(block.id, elIdx, el)}
                                    className="px-2.5 py-1 rounded-md bg-[#14291D] text-amber-300 hover:bg-[#203E2D] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Edit in Popup"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateElement(block.id, elIdx)}
                                    className="p-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                                    title="Duplicate Element"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteElement(block.id, elIdx)}
                                    className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                                    title="Delete Element"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Live In-Situ Customer Preview of Card */}
                      <div className="pt-2 border-t border-[#DDD5C5]">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Live Customer Preview (Exact appearance):</span>
                        </span>
                        <div className="rounded-xl overflow-hidden border border-[#DDD5C5]">
                          <MonographBlockRenderer block={block} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. POPUP EDIT MODAL (POPUP ME HAR ELEMENT KA EDIT OPTION)
      ───────────────────────────────────────────────────────────── */}
      {activeElementModal && (
        <ElementEditPopupModal
          modalState={activeElementModal}
          onClose={() => setActiveElementModal(null)}
          onSave={handleSaveElementModal}
        />
      )}
      {/* ─────────────────────────────────────────────────────────────
          5. DELETE CONFIRMATION MODAL (TABS & CARDS WITH CONFIRM BUTTON)
      ───────────────────────────────────────────────────────────── */}
      {deleteConfirmTarget && deleteConfirmTarget.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-300 space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <div>
                <h4 className="font-serif font-bold text-base text-[#14291D]">
                  Confirm {deleteConfirmTarget.type === 'tab' ? 'Tab' : 'Card'} Deletion
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <strong className="text-stone-900 font-semibold">{deleteConfirmTarget.title}</strong>?
                  {deleteConfirmTarget.type === 'tab'
                    ? ' All cards and custom elements inside this tab will be permanently removed.'
                    : ' This card and all its custom elements will be permanently removed from this tab.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmTarget.type === 'tab') {
                    confirmDeleteTab(deleteConfirmTarget.id);
                  } else {
                    confirmDeleteCard(deleteConfirmTarget.id);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete {deleteConfirmTarget.type === 'tab' ? 'Tab' : 'Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENT: ElementEditPopupModal
// ─────────────────────────────────────────────────────────────
interface ElementEditPopupModalProps {
  modalState: {
    cardId: string;
    elementIndex?: number;
    element: CardElementItem;
  };
  onClose: () => void;
  onSave: (element: CardElementItem) => void;
}

const ElementEditPopupModal: React.FC<ElementEditPopupModalProps> = ({
  modalState,
  onClose,
  onSave,
}) => {
  const [element, setElement] = useState<CardElementItem>({ ...modalState.element });
  const [selectedTagIdx, setSelectedTagIdx] = useState<number>(0);

  // Update field helper
  const updateField = <K extends keyof CardElementItem>(key: K, val: CardElementItem[K]) => {
    setElement((prev) => ({ ...prev, [key]: val }));
  };

  const isNew = typeof modalState.elementIndex !== 'number';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#DDD5C5] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#E5DEC9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#14291D] text-amber-300">
              {element.type === 'image' && <ImageIcon className="w-4 h-4" />}
              {element.type === 'text' && <Type className="w-4 h-4" />}
              {element.type === 'tag' && <TagIcon className="w-4 h-4" />}
              {element.type === 'image_text' && <SlidersHorizontal className="w-4 h-4" />}
              {element.type === 'rich_text_list' && <ListIcon className="w-4 h-4" />}
              {element.type === 'custom_table' && <TableIcon className="w-4 h-4" />}
              {element.type === 'divider' && <Minus className="w-4 h-4" />}
            </span>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#14291D]">
                {isNew ? 'Add' : 'Edit'}{' '}
                {element.type === 'image' && 'Image Element'}
                {element.type === 'text' && 'Text Element'}
                {element.type === 'tag' && 'Tags Element'}
                {element.type === 'image_text' && 'Image + Text (Single Horizontal Line)'}
                {element.type === 'rich_text_list' && 'Rich Text List Element'}
                {element.type === 'custom_table' && 'Custom Table Element'}
                {element.type === 'divider' && 'Divider Element'}
              </h4>
              <p className="text-xs text-[#6F6452]">
                Customize custom typeable sizes, colors, alignment, curves, and link settings.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* ══════════════════════════════════════════════════
              1) IMAGE ELEMENT CONTROLS
          ══════════════════════════════════════════════════ */}
          {element.type === 'image' && (
            <div className="space-y-4">
              {/* Image URL & preview */}
              <div>
                <label className="block text-xs font-semibold text-[#14291D] mb-1">
                  Image URL / Link *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={element.imageUrl || ''}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                />
              </div>

              {/* Quick Botanical Presets */}
              <div>
                <span className="text-[10px] font-semibold text-stone-500 block mb-1">
                  Quick Botanical Herbal Photo Presets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {['ashwagandha', 'tulsi', 'amla', 'turmeric', 'triphala', 'shilajit', 'brahmi', 'guggulu', 'neem', 'giloy'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => updateField('imageUrl', HERB_IMAGE_MAP[h] || '')}
                      className="px-2 py-0.5 text-[10px] rounded bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-stone-200 font-medium capitalize cursor-pointer"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Custom Typed Image Size */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Image Size (Custom Type)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 180px, 240px, 100%"
                    value={element.imageSize || ''}
                    onChange={(e) => updateField('imageSize', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {['80px', '120px', '180px', '260px', '100%'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateField('imageSize', s)}
                        className="text-[10px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Curve (Border Radius) */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Card Curve / Corner Radius
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12px, 16px, full"
                    value={element.imageRounded || ''}
                    onChange={(e) => updateField('imageRounded', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {[
                      { l: '0px', val: 'none' },
                      { l: '8px', val: 'md' },
                      { l: '16px', val: 'xl' },
                      { l: 'Circle', val: 'full' },
                    ].map((c) => (
                      <button
                        key={c.val}
                        type="button"
                        onClick={() => updateField('imageRounded', c.val)}
                        className="text-[10px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 cursor-pointer"
                      >
                        {c.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Alignment
                  </label>
                  <div className="flex items-center gap-1">
                    {[
                      { l: 'Left', val: 'left' },
                      { l: 'Center', val: 'center' },
                      { l: 'Right', val: 'right' },
                    ].map((a) => (
                      <button
                        key={a.val}
                        type="button"
                        onClick={() => updateField('imageAlignment', a.val as any)}
                        className={`flex-1 py-1.5 rounded text-xs font-semibold cursor-pointer border ${
                          (element.imageAlignment || 'left') === a.val
                            ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {a.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clickable Link & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Clickable Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (Opens when image is clicked)"
                    value={element.imageLinkUrl || ''}
                    onChange={(e) => updateField('imageLinkUrl', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Caption / Alt Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Standardized Withania somnifera root extraction"
                    value={element.imageCaption || ''}
                    onChange={(e) => updateField('imageCaption', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              2) TEXT ELEMENT CONTROLS
          ══════════════════════════════════════════════════ */}
          {element.type === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#14291D] mb-1">
                  Text Content *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter text, clinical monograph statements, botanical notes..."
                  value={element.text || ''}
                  onChange={(e) => updateField('text', e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Size Custom Typed */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Font Size (Custom Type)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14px, 16px, 18px"
                    value={element.textSize || ''}
                    onChange={(e) => updateField('textSize', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {['12px', '14px', '16px', '18px', '22px'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateField('textSize', s)}
                        className="text-[10px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={element.textColor || '#14291D'}
                      onChange={(e) => updateField('textColor', e.target.value)}
                      className="w-7 h-7 rounded border border-[#DDD5C5] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={element.textColor || '#14291D'}
                      onChange={(e) => updateField('textColor', e.target.value)}
                      className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {['#14291D', '#2D261A', '#B4741E', '#166534', '#991B1B', '#1E40AF', '#FFFFFF'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateField('textColor', c)}
                        style={{ backgroundColor: c }}
                        className="w-4 h-4 rounded-full border border-stone-300 cursor-pointer"
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Formatting: Bold, Italic, Underline */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Formatting
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateField('textBold', !element.textBold)}
                      className={`p-2 rounded border cursor-pointer ${
                        element.textBold ? 'bg-[#14291D] text-amber-300 border-[#14291D]' : 'bg-white text-stone-700 border-stone-300'
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('textStyle', element.textStyle === 'italic' ? 'normal' : 'italic')}
                      className={`p-2 rounded border cursor-pointer ${
                        element.textStyle === 'italic' ? 'bg-[#14291D] text-amber-300 border-[#14291D]' : 'bg-white text-stone-700 border-stone-300'
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('textUnderline', !element.textUnderline)}
                      className={`p-2 rounded border cursor-pointer ${
                        element.textUnderline ? 'bg-[#14291D] text-amber-300 border-[#14291D]' : 'bg-white text-stone-700 border-stone-300'
                      }`}
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-xs font-semibold text-[#14291D] mb-1">
                  Text Alignment
                </label>
                <div className="flex items-center gap-1 w-fit">
                  {[
                    { l: 'Left', val: 'left', icon: AlignLeft },
                    { l: 'Center', val: 'center', icon: AlignCenter },
                    { l: 'Right', val: 'right', icon: AlignRight },
                    { l: 'Justify', val: 'justify', icon: AlignJustify },
                  ].map((a) => {
                    const IconComp = a.icon;
                    return (
                      <button
                        key={a.val}
                        type="button"
                        onClick={() => updateField('textAlignment', a.val as any)}
                        className={`p-1.5 rounded border text-xs flex items-center gap-1 cursor-pointer ${
                          (element.textAlignment || 'left') === a.val
                            ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{a.l}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              3) TAG ELEMENT CONTROLS (CUSTOM TAGS WITH BG COLOR, TEXT COLOR, OPACITY & SIZE)
          ══════════════════════════════════════════════════ */}
          {element.type === 'tag' && (() => {
            const tags = element.tags || [];
            const currentTagIdx = (selectedTagIdx >= 0 && selectedTagIdx < tags.length) ? selectedTagIdx : 0;
            const currentTag: TagItem | undefined = tags[currentTagIdx];

            const updateTagField = <TK extends keyof TagItem>(field: TK, val: TagItem[TK]) => {
              if (!currentTag) return;
              const copy = [...tags];
              copy[currentTagIdx] = {
                ...copy[currentTagIdx],
                [field]: val,
              };
              updateField('tags', copy);
            };

            const applyStyleToAllTags = () => {
              if (!currentTag) return;
              const copy = tags.map((t) => ({
                ...t,
                bgColor: currentTag.bgColor,
                bgOpacity: currentTag.bgOpacity,
                textColor: currentTag.textColor,
                textColorOpacity: currentTag.textColorOpacity,
                fontSize: currentTag.fontSize,
                customFontSize: currentTag.customFontSize,
                size: currentTag.size,
                style: currentTag.style,
              }));
              updateField('tags', copy);
            };

            return (
              <div className="space-y-4">
                {/* Section Title & Alignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#14291D] mb-1">
                      Tag Section Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Standard Quality Certifications"
                      value={element.tagsTitle || ''}
                      onChange={(e) => updateField('tagsTitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#14291D] mb-1">
                      Tags Alignment
                    </label>
                    <div className="flex items-center gap-1">
                      {[
                        { l: 'Left', val: 'left', icon: AlignLeft },
                        { l: 'Center', val: 'center', icon: AlignCenter },
                        { l: 'Right', val: 'right', icon: AlignRight },
                      ].map((a) => {
                        const IconComp = a.icon;
                        return (
                          <button
                            key={a.val}
                            type="button"
                            onClick={() => updateField('tagsAlignment', a.val as any)}
                            className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                              (element.tagsAlignment || 'left') === a.val
                                ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                            <span>{a.l}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tag Selection Row / Pills */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#14291D] flex items-center gap-1.5">
                      <TagIcon className="w-3.5 h-3.5 text-[#B4741E]" />
                      <span>Tags in this Section ({tags.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newTag: TagItem = {
                          id: `tag_${Date.now()}`,
                          text: `Tag ${tags.length + 1}`,
                          bgColor: currentTag?.bgColor || '#14291D',
                          bgOpacity: currentTag?.bgOpacity ?? 100,
                          textColor: currentTag?.textColor || '#FFFFFF',
                          textColorOpacity: currentTag?.textColorOpacity ?? 100,
                          customFontSize: currentTag?.customFontSize || '12px',
                          style: currentTag?.style || 'rounded',
                          size: currentTag?.size || 'normal',
                        };
                        const nextTags = [...tags, newTag];
                        updateField('tags', nextTags);
                        setSelectedTagIdx(nextTags.length - 1);
                      }}
                      className="px-2.5 py-1 bg-[#14291D] hover:bg-[#203E2D] text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add Tag</span>
                    </button>
                  </div>

                  {tags.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-500">
                      No tags yet. Click "+ Add Tag" above to create custom tags.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tags.map((t, idx) => {
                        const isSelected = idx === currentTagIdx;
                        const bgRgba = t.bgColor ? hexToRgba(t.bgColor, t.bgOpacity ?? 100) : hexToRgba('#14291D', t.bgOpacity ?? 100);
                        const textRgba = t.textColor ? hexToRgba(t.textColor, t.textColorOpacity ?? 100) : hexToRgba('#FFFFFF', t.textColorOpacity ?? 100);
                        const fs = t.customFontSize || (t.fontSize === 'sm' ? '12px' : '11px');

                        return (
                          <button
                            key={t.id || idx}
                            type="button"
                            onClick={() => setSelectedTagIdx(idx)}
                            style={{ backgroundColor: bgRgba, color: textRgba, fontSize: fs }}
                            className={`px-3 py-1 font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              isSelected
                                ? 'ring-2 ring-amber-400 ring-offset-2 scale-105'
                                : 'opacity-85 hover:opacity-100'
                            }`}
                          >
                            <span>{t.text || `Tag ${idx + 1}`}</span>
                            {isSelected && (
                              <Check className="w-3 h-3 ml-0.5 opacity-90" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ACTIVE TAG FULL CUSTOMIZER */}
                {currentTag && (
                  <div className="p-4 bg-white rounded-xl border-2 border-[#14291D]/20 shadow-xs space-y-4 animate-in fade-in duration-150">
                    {/* Header with Title & Position Reorder & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#EAE3D4]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#14291D] text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center">
                          {currentTagIdx + 1}
                        </span>
                        <span className="font-serif font-bold text-xs sm:text-sm text-[#14291D]">
                          Editing Tag #{currentTagIdx + 1}: "{currentTag.text}"
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Move Tag Left/Right */}
                        <div className="flex items-center rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-0.5">
                          <button
                            type="button"
                            disabled={currentTagIdx <= 0}
                            onClick={() => {
                              const copy = [...tags];
                              const [moved] = copy.splice(currentTagIdx, 1);
                              copy.splice(currentTagIdx - 1, 0, moved);
                              updateField('tags', copy);
                              setSelectedTagIdx(currentTagIdx - 1);
                            }}
                            className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                            title="Move tag left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={currentTagIdx >= tags.length - 1}
                            onClick={() => {
                              const copy = [...tags];
                              const [moved] = copy.splice(currentTagIdx, 1);
                              copy.splice(currentTagIdx + 1, 0, moved);
                              updateField('tags', copy);
                              setSelectedTagIdx(currentTagIdx + 1);
                            }}
                            className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                            title="Move tag right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Duplicate tag */}
                        <button
                          type="button"
                          onClick={() => {
                            const cloned: TagItem = {
                              ...currentTag,
                              id: `tag_${Date.now()}`,
                              text: `${currentTag.text} (Copy)`,
                            };
                            const copy = [...tags];
                            copy.splice(currentTagIdx + 1, 0, cloned);
                            updateField('tags', copy);
                            setSelectedTagIdx(currentTagIdx + 1);
                          }}
                          className="p-1.5 rounded-lg border border-[#DDD5C5] bg-white hover:bg-stone-50 text-stone-600 cursor-pointer"
                          title="Duplicate Tag"
                        >
                          <Copy className="w-3 h-3" />
                        </button>

                        {/* Delete tag */}
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...tags];
                            copy.splice(currentTagIdx, 1);
                            updateField('tags', copy);
                            setSelectedTagIdx(Math.max(0, currentTagIdx - 1));
                          }}
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                          title="Delete Tag"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Tag Text Input */}
                    <div>
                      <label className="block text-xs font-semibold text-[#14291D] mb-1">
                        Tag Text *
                      </label>
                      <input
                        type="text"
                        value={currentTag.text}
                        onChange={(e) => updateTagField('text', e.target.value)}
                        placeholder="e.g. Standardized 5% Withanolides"
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-medium"
                      />
                    </div>

                    {/* COLOR & OPACITY SETTINGS (BACKGROUND + TEXT) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DEC9]">
                      {/* Background Color & Opacity */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-[#14291D]">
                          🎨 Tag Background Color & Opacity
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentTag.bgColor || '#14291D'}
                            onChange={(e) => updateTagField('bgColor', e.target.value)}
                            className="w-8 h-8 rounded border border-stone-300 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={currentTag.bgColor || '#14291D'}
                            onChange={(e) => updateTagField('bgColor', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded font-mono text-xs"
                          />
                        </div>

                        {/* Background Opacity Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 mb-1">
                            <span>Background Opacity</span>
                            <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {currentTag.bgOpacity ?? 100}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentTag.bgOpacity ?? 100}
                            onChange={(e) => updateTagField('bgOpacity', Number(e.target.value))}
                            className="w-full accent-[#14291D] cursor-pointer"
                          />
                        </div>

                        {/* Quick Background Swatches */}
                        <div className="flex items-center gap-1 pt-1 flex-wrap">
                          {['#14291D', '#B4741E', '#2C5E43', '#991B1B', '#1E3A8A', '#4B5563', '#FAF5EE', '#FFFFFF'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateTagField('bgColor', c)}
                              style={{ backgroundColor: c }}
                              className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Text Color & Opacity */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-[#14291D]">
                          ✍️ Tag Text Color & Opacity
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentTag.textColor || '#FFFFFF'}
                            onChange={(e) => updateTagField('textColor', e.target.value)}
                            className="w-8 h-8 rounded border border-stone-300 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={currentTag.textColor || '#FFFFFF'}
                            onChange={(e) => updateTagField('textColor', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded font-mono text-xs"
                          />
                        </div>

                        {/* Text Color Opacity Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 mb-1">
                            <span>Text Color Opacity</span>
                            <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {currentTag.textColorOpacity ?? 100}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={currentTag.textColorOpacity ?? 100}
                            onChange={(e) => updateTagField('textColorOpacity', Number(e.target.value))}
                            className="w-full accent-[#14291D] cursor-pointer"
                          />
                        </div>

                        {/* Quick Text Swatches */}
                        <div className="flex items-center gap-1 pt-1 flex-wrap">
                          {['#FFFFFF', '#FCD34D', '#14291D', '#111827', '#DC2626', '#E5E7EB'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateTagField('textColor', c)}
                              style={{ backgroundColor: c }}
                              className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SIZE, FONT SIZE & SHAPE */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Font Size */}
                      <div>
                        <label className="block font-semibold text-[#14291D] mb-1">
                          Font Size (Custom Type)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 11px, 12px, 14px"
                          value={currentTag.customFontSize || ''}
                          onChange={(e) => updateTagField('customFontSize', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                        />
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {['10px', '11px', '12px', '13px', '14px', '16px'].map((fs) => (
                            <button
                              key={fs}
                              type="button"
                              onClick={() => updateTagField('customFontSize', fs)}
                              className="text-[10px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 cursor-pointer"
                            >
                              {fs}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Padding Size */}
                      <div>
                        <label className="block font-semibold text-[#14291D] mb-1">
                          Tag Padding / Size
                        </label>
                        <div className="flex items-center gap-1">
                          {[
                            { l: 'Compact', val: 'compact' },
                            { l: 'Normal', val: 'normal' },
                            { l: 'Spacious', val: 'spacious' },
                          ].map((sz) => (
                            <button
                              key={sz.val}
                              type="button"
                              onClick={() => updateTagField('size', sz.val as any)}
                              className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                                (currentTag.size || 'normal') === sz.val
                                  ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                                  : 'bg-white text-stone-700 border-stone-300'
                              }`}
                            >
                              {sz.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tag Shape */}
                      <div>
                        <label className="block font-semibold text-[#14291D] mb-1">
                          Tag Shape / Curve
                        </label>
                        <div className="flex items-center gap-1">
                          {[
                            { l: 'Pill', val: 'pill' },
                            { l: 'Rounded', val: 'rounded' },
                            { l: 'Square', val: 'square' },
                          ].map((sh) => (
                            <button
                              key={sh.val}
                              type="button"
                              onClick={() => updateTagField('style', sh.val as any)}
                              className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                                (currentTag.style || 'rounded') === sh.val
                                  ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                                  : 'bg-white text-stone-700 border-stone-300'
                              }`}
                            >
                              {sh.l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Apply to All Tags Button */}
                    {tags.length > 1 && (
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-[11px] text-stone-500">
                          Want all tags in this section to have identical colors, opacity, and size?
                        </span>
                        <button
                          type="button"
                          onClick={applyStyleToAllTags}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-[#14291D] border border-stone-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Apply This Style to All Tags
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════
              4) IMAGE + TEXT (IN A SINGLE HORIZONTAL LINE)
          ══════════════════════════════════════════════════ */}
          {element.type === 'image_text' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                💡 <strong>Single Horizontal Line Layout:</strong> Image & Text appear together side-by-side in one row.
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-[#14291D] mb-1">
                  Image URL / Link *
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={element.horizontalImageUrl || ''}
                  onChange={(e) => updateField('horizontalImageUrl', e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Image Position (Left or Right of text) */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Image Position (Left vs Right of Text)
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateField('horizontalImagePosition', 'left')}
                      className={`flex-1 py-1.5 rounded font-bold border cursor-pointer ${
                        (element.horizontalImagePosition || 'left') === 'left'
                          ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                          : 'bg-white text-stone-700 border-stone-300'
                      }`}
                    >
                      Left of Text
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('horizontalImagePosition', 'right')}
                      className={`flex-1 py-1.5 rounded font-bold border cursor-pointer ${
                        element.horizontalImagePosition === 'right'
                          ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                          : 'bg-white text-stone-700 border-stone-300'
                      }`}
                    >
                      Right of Text
                    </button>
                  </div>
                </div>

                {/* Custom Image Size */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Image Size (Custom Type)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 70px, 90px, 120px"
                    value={element.horizontalImageSize || ''}
                    onChange={(e) => updateField('horizontalImageSize', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="flex items-center gap-1 mt-1">
                    {['60px', '80px', '100px', '120px'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateField('horizontalImageSize', s)}
                        className="text-[10px] px-1.5 py-0.5 bg-stone-100 rounded border border-stone-300 cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Curve */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Image Curve / Radius
                  </label>
                  <select
                    value={element.horizontalImageRounded || '12px'}
                    onChange={(e) => updateField('horizontalImageRounded', e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  >
                    <option value="none">Straight (0px)</option>
                    <option value="md">Rounded (8px)</option>
                    <option value="12px">Card Curve (12px)</option>
                    <option value="xl">Smooth (16px)</option>
                    <option value="full">Full Circle</option>
                  </select>
                </div>
              </div>

              {/* Text content in the horizontal line */}
              <div>
                <label className="block text-xs font-semibold text-[#14291D] mb-1">
                  Text beside Image (Single Line) *
                </label>
                <textarea
                  rows={2}
                  placeholder="Full-spectrum active polyphenols standardized to classical ratios."
                  value={element.horizontalText || ''}
                  onChange={(e) => updateField('horizontalText', e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Text Size */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Text Size (Custom Type)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14px, 16px"
                    value={element.horizontalTextSize || ''}
                    onChange={(e) => updateField('horizontalTextSize', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={element.horizontalTextColor || '#14291D'}
                      onChange={(e) => updateField('horizontalTextColor', e.target.value)}
                      className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={element.horizontalTextColor || '#14291D'}
                      onChange={(e) => updateField('horizontalTextColor', e.target.value)}
                      className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Text Formatting */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Formatting
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateField('horizontalTextBold', !element.horizontalTextBold)}
                      className={`p-2 rounded border cursor-pointer ${
                        element.horizontalTextBold ? 'bg-[#14291D] text-amber-300 border-[#14291D]' : 'bg-white text-stone-700 border-stone-300'
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('horizontalTextItalic', !element.horizontalTextItalic)}
                      className={`p-2 rounded border cursor-pointer ${
                        element.horizontalTextItalic ? 'bg-[#14291D] text-amber-300 border-[#14291D]' : 'bg-white text-stone-700 border-stone-300'
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Clickable Link next to text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-stone-200">
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Clickable Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={element.horizontalLinkUrl || ''}
                    onChange={(e) => updateField('horizontalLinkUrl', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Link Button Label
                  </label>
                  <input
                    type="text"
                    placeholder="View Details"
                    value={element.horizontalLinkLabel || ''}
                    onChange={(e) => updateField('horizontalLinkLabel', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              5) RICH TEXT LIST ELEMENT CONTROLS
          ══════════════════════════════════════════════════ */}
          {element.type === 'rich_text_list' && (
            <div className="space-y-4">
              {/* List Style selection */}
              <div>
                <label className="block text-xs font-semibold text-[#14291D] mb-1">
                  List Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'bullet', label: '• Bullets' },
                    { id: 'numbered', label: '1. Numbered' },
                    { id: 'check', label: '✓ Checkmarks' },
                    { id: 'dash', label: '— Dashes' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => updateField('listStyle', s.id as any)}
                      className={`p-2 rounded-lg border text-xs font-bold cursor-pointer text-center ${
                        (element.listStyle || 'bullet') === s.id
                          ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                          : 'bg-white text-stone-700 border-stone-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multiline Items Input */}
              <div>
                <label className="block text-xs font-semibold text-[#14291D] mb-1">
                  List Items (Type each item on a separate line) *
                </label>
                <textarea
                  rows={4}
                  placeholder="Standardized bio-active alkaloid concentration&#10;Tested under API limits&#10;Zero artificial binders"
                  value={element.listItems?.join('\n') || ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    updateField('listItems', lines);
                  }}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs leading-relaxed"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Tip: Press Enter to create a new list bullet item.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Font Size */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Font Size (Custom Type)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 13px, 14px"
                    value={element.listFontSize || ''}
                    onChange={(e) => updateField('listFontSize', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={element.listTextColor || '#2D261A'}
                      onChange={(e) => updateField('listTextColor', e.target.value)}
                      className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={element.listTextColor || '#2D261A'}
                      onChange={(e) => updateField('listTextColor', e.target.value)}
                      className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Bullet / Checkmark Icon Color */}
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Bullet / Check Icon Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={element.listIconColor || '#16A34A'}
                      onChange={(e) => updateField('listIconColor', e.target.value)}
                      className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={element.listIconColor || '#16A34A'}
                      onChange={(e) => updateField('listIconColor', e.target.value)}
                      className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              6) CUSTOM TABLE ELEMENT CONTROLS
          ══════════════════════════════════════════════════ */}
          {element.type === 'custom_table' && (
            <div className="space-y-4">
              {/* Columns Header editor */}
              <div>
                <label className="block text-xs font-semibold text-[#14291D] mb-1">
                  Table Column Headers
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {element.tableHeaders?.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-1 bg-[#FAF8F5] border border-[#DDD5C5] px-2 py-1 rounded">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const copy = [...(element.tableHeaders || [])];
                          copy[hIdx] = e.target.value;
                          updateField('tableHeaders', copy);
                        }}
                        className="text-xs bg-transparent outline-none w-24 font-bold"
                      />
                      {(element.tableHeaders?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...(element.tableHeaders || [])];
                            copy.splice(hIdx, 1);
                            // Also splice columns from rows
                            const updatedRows = (element.tableRows || []).map(r => {
                              const rCopy = [...r];
                              rCopy.splice(hIdx, 1);
                              return rCopy;
                            });
                            updateField('tableHeaders', copy);
                            updateField('tableRows', updatedRows);
                          }}
                          className="text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const newCol = `Col ${(element.tableHeaders?.length || 0) + 1}`;
                      const copy = [...(element.tableHeaders || []), newCol];
                      const updatedRows = (element.tableRows || []).map(r => [...r, '-']);
                      updateField('tableHeaders', copy);
                      updateField('tableRows', updatedRows);
                    }}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-xs font-semibold cursor-pointer border border-stone-300"
                  >
                    + Add Column
                  </button>
                </div>
              </div>

              {/* Rows Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#14291D]">
                    Table Rows & Cells
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const numCols = element.tableHeaders?.length || 2;
                      const newRow = Array(numCols).fill('Sample Data');
                      updateField('tableRows', [...(element.tableRows || []), newRow]);
                    }}
                    className="text-xs font-semibold text-[#14291D] hover:underline cursor-pointer"
                  >
                    + Add New Row
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 bg-stone-50 rounded-lg border border-stone-200">
                  {element.tableRows?.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-stone-200">
                      <span className="text-[10px] font-mono text-stone-400 w-4">{rIdx + 1}</span>
                      {row.map((cell, cIdx) => (
                        <input
                          key={cIdx}
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const copyRows = [...(element.tableRows || [])];
                            const copyRow = [...copyRows[rIdx]];
                            copyRow[cIdx] = e.target.value;
                            copyRows[rIdx] = copyRow;
                            updateField('tableRows', copyRows);
                          }}
                          className="flex-1 px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs"
                        />
                      ))}
                      {(element.tableRows?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const copyRows = [...(element.tableRows || [])];
                            copyRows.splice(rIdx, 1);
                            updateField('tableRows', copyRows);
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Colors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Header Bg</label>
                  <input
                    type="color"
                    value={element.tableHeaderBgColor || '#FAF6F0'}
                    onChange={(e) => updateField('tableHeaderBgColor', e.target.value)}
                    className="w-full h-7 rounded border border-stone-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Header Text</label>
                  <input
                    type="color"
                    value={element.tableHeaderTextColor || '#14291D'}
                    onChange={(e) => updateField('tableHeaderTextColor', e.target.value)}
                    className="w-full h-7 rounded border border-stone-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Cell Text</label>
                  <input
                    type="color"
                    value={element.tableCellTextColor || '#2D261A'}
                    onChange={(e) => updateField('tableCellTextColor', e.target.value)}
                    className="w-full h-7 rounded border border-stone-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Border Color</label>
                  <input
                    type="color"
                    value={element.tableBorderColor || '#DDD5C5'}
                    onChange={(e) => updateField('tableBorderColor', e.target.value)}
                    className="w-full h-7 rounded border border-stone-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              7) DIVIDER ELEMENT CONTROLS
          ══════════════════════════════════════════════════ */}
          {element.type === 'divider' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'line', label: 'Solid Line' },
                  { id: 'dashed', label: 'Dashed Line' },
                  { id: 'dots', label: 'Dotted Line' },
                  { id: 'spacing_only', label: 'Blank Spacing' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateField('dividerStyle', s.id as any)}
                    className={`p-2 rounded-lg border text-xs font-bold cursor-pointer text-center ${
                      (element.dividerStyle || 'line') === s.id
                        ? 'bg-[#14291D] text-amber-300 border-[#14291D]'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Divider Color
                  </label>
                  <input
                    type="color"
                    value={element.dividerColor || '#E2D9CB'}
                    onChange={(e) => updateField('dividerColor', e.target.value)}
                    className="w-full h-8 rounded border border-stone-300 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Thickness (px)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={element.dividerThickness || 1}
                    onChange={(e) => updateField('dividerThickness', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#14291D] mb-1">
                    Height / Vertical Spacing (px)
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="64"
                    value={element.dividerHeightPx || 16}
                    onChange={(e) => updateField('dividerHeightPx', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Real-time Preview Box in Modal */}
          <div className="pt-3 border-t border-[#EAE3D4]">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Real-time Preview of this element:</span>
            </span>
            <div className="p-3 rounded-xl border border-[#DDD5C5] bg-[#FAF8F5]">
              <MonographBlockRenderer
                block={{
                  id: 'preview_card',
                  type: 'card',
                  design: {
                    bgColor: '#FFFFFF',
                    textColor: '#14291D',
                    bgOpacity: 100,
                    padding: 'md',
                    border: 'solid',
                    borderRadius: 'xl',
                  },
                  cardData: {
                    elements: [element],
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#DDD5C5] bg-white text-[#554C3E] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(element)}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#14291D] hover:bg-[#203E2D] text-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Element</span>
          </button>
        </div>
      </div>
    </div>
  );
};
