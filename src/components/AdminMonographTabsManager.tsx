import React, { useState, useMemo, useEffect } from 'react';
import { 
  HerbalProduct, 
  ProductMonographTab, 
  MonographContentBlock,
  MonographBlockType,
  BlockDesignSettings,
  TagItem,
  CardBlockData,
  HeaderBlockData,
  RichTextBlockData,
  TagsBlockData,
  ImageTextBlockData,
  ImageOnlyBlockData,
  DividerBlockData
} from '../types/pharmacy';
import { 
  buildDefaultMonographTabs, 
  getEffectiveMonographTabs, 
  getEffectiveTabBlocks,
  hexToRgba,
  HERB_IMAGE_MAP 
} from '../utils/monographHelper';
import { ProductMonographTabs } from './ProductMonographTabs';
import { MonographBlockRenderer } from './MonographBlockRenderer';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
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
  Info, 
  MessageSquare, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Tag as TagIcon, 
  Minus, 
  Check, 
  Bookmark,
  Settings,
  ExternalLink,
  CreditCard,
  LayoutGrid
} from 'lucide-react';
import { backupProductToFirebase } from '../utils/firebaseSync';

interface AdminMonographTabsManagerProps {
  products: HerbalProduct[];
  selectedProductId?: string;
  onUpdateProduct?: (product: HerbalProduct) => void;
  onPreviewProduct?: (product: HerbalProduct) => void;
  onNotify?: (message: string) => void;
  hideProductPicker?: boolean;
  controlledTabs?: ProductMonographTab[];
  onTabsChange?: (tabs: ProductMonographTab[]) => void;
  productTitle?: string;
}

// Default design settings for new cards/blocks
const DEFAULT_BLOCK_DESIGN: BlockDesignSettings = {
  bgColor: '#FFFFFF',
  textColor: '#14291D',
  bgOpacity: 100,
  padding: 'md',
  margin: 'sm',
  border: 'solid',
  borderColor: '#EAE3D4',
  borderRadius: 'xl',
  alignment: 'left',
  width: 'full',
};

export const AdminMonographTabsManager: React.FC<AdminMonographTabsManagerProps> = ({
  products,
  selectedProductId,
  onUpdateProduct,
  onPreviewProduct,
  onNotify,
  hideProductPicker = false,
  controlledTabs,
  onTabsChange,
  productTitle,
}) => {
  const [activeProductId, setActiveProductId] = useState<string>(
    selectedProductId || products[0]?.id || ''
  );

  useEffect(() => {
    if (selectedProductId) {
      setActiveProductId(selectedProductId);
    }
  }, [selectedProductId]);

  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === activeProductId) || products[0];
  }, [products, activeProductId]);

  const rawTabs: ProductMonographTab[] = useMemo(() => {
    if (controlledTabs && controlledTabs.length > 0) return controlledTabs;
    if (!currentProduct) return [];
    return getEffectiveMonographTabs(currentProduct);
  }, [controlledTabs, currentProduct]);

  // Ensure each tab has initialized blocks
  const monographTabs: ProductMonographTab[] = useMemo(() => {
    return rawTabs.map((tab) => {
      if (tab.blocks && tab.blocks.length > 0) return tab;
      return {
        ...tab,
        blocks: getEffectiveTabBlocks(tab),
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

  // ─────────────────────────────────────────────────────────────
  // Tab Management State
  // ─────────────────────────────────────────────────────────────
  const [editingTabMetaId, setEditingTabMetaId] = useState<string | null>(null);
  const [editingTabTitle, setEditingTabTitle] = useState('');
  const [editingTabSubtitle, setEditingTabSubtitle] = useState('');
  const [editingTabBgColor, setEditingTabBgColor] = useState('');
  const [editingTabTextColor, setEditingTabTextColor] = useState('');
  const [editingTabBgOpacity, setEditingTabBgOpacity] = useState<number>(100);
  const [deleteConfirmTabId, setDeleteConfirmTabId] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Card / Block Visual Editor State
  // ─────────────────────────────────────────────────────────────
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blockType, setBlockType] = useState<MonographBlockType>('card');
  const [editorActiveSubtab, setEditorActiveSubtab] = useState<'content' | 'design'>('content');

  // Block Design State
  const [blockDesign, setBlockDesign] = useState<BlockDesignSettings>(DEFAULT_BLOCK_DESIGN);

  // ─────────────────────────────────────────────────────────────
  // COMPOSED CARD Specific State (Toggles & Fields)
  // ─────────────────────────────────────────────────────────────
  const [cardShowHeader, setCardShowHeader] = useState(true);
  const [cardTitle, setCardTitle] = useState('');
  const [cardSubtitle, setCardSubtitle] = useState('');
  const [cardHeaderLevel, setCardHeaderLevel] = useState<'h2' | 'h3' | 'h4'>('h3');
  const [cardHeaderAccentBorder, setCardHeaderAccentBorder] = useState(true);

  const [cardShowImage, setCardShowImage] = useState(true);
  const [cardImageUrl, setCardImageUrl] = useState('');
  const [cardImageAlt, setCardImageAlt] = useState('');
  const [cardImageLinkUrl, setCardImageLinkUrl] = useState(''); // Clickable image link
  const [cardImagePosition, setCardImagePosition] = useState<'left' | 'right' | 'top' | 'bottom'>('left');
  const [cardImageSize, setCardImageSize] = useState<'compact' | 'small' | 'medium' | 'large' | 'full'>('small');
  const [cardImageAspectRatio, setCardImageAspectRatio] = useState<'square' | '16:9' | '4:3' | 'natural'>('square');
  const [cardImageRounded, setCardImageRounded] = useState<'none' | 'md' | 'lg' | 'xl' | '2xl' | 'full'>('xl');

  const [cardShowRichText, setCardShowRichText] = useState(true);
  const [cardContent, setCardContent] = useState('');
  const [cardSecondaryContent, setCardSecondaryContent] = useState('');
  const [cardFontSize, setCardFontSize] = useState<'xs' | 'sm' | 'base' | 'lg'>('sm');
  const [cardLineHeight, setCardLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');

  const [cardShowTags, setCardShowTags] = useState(true);
  const [cardTagsTitle, setCardTagsTitle] = useState('');
  const [cardTagsList, setCardTagsList] = useState<TagItem[]>([]);
  const [cardTagsPosition, setCardTagsPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [cardTagsDetailedContent, setCardTagsDetailedContent] = useState('');

  const [cardActionLinkUrl, setCardActionLinkUrl] = useState('');
  const [cardActionLinkLabel, setCardActionLinkLabel] = useState('');

  // Interactive tag adder inside editor
  const [newTagName, setNewTagName] = useState('');
  const [newTagBgColor, setNewTagBgColor] = useState('#14291D');
  const [newTagTextColor, setNewTagTextColor] = useState('#FFFFFF');
  const [newTagOpacity, setNewTagOpacity] = useState<number>(100);
  const [newTagFontSize, setNewTagFontSize] = useState<'xs' | 'sm'>('xs');
  const [newTagStyle, setNewTagStyle] = useState<'rounded' | 'square' | 'pill'>('rounded');

  // Divider block specific
  const [dividerStyle, setDividerStyle] = useState<'line' | 'dashed' | 'dots' | 'spacing_only'>('line');
  const [dividerColor, setDividerColor] = useState('#DDD5C5');
  const [dividerThickness, setDividerThickness] = useState(1);
  const [dividerHeightPx, setDividerHeightPx] = useState(24);

  // Delete confirm block
  const [deleteConfirmBlockId, setDeleteConfirmBlockId] = useState<string | null>(null);

  // Quick swatches
  const DARK_PALETTE = [
    { label: 'Forest Green', hex: '#14291D' },
    { label: 'Wine Red', hex: '#991B1B' },
    { label: 'Ochre Amber', hex: '#B45309' },
    { label: 'Charcoal', hex: '#1F2937' },
    { label: 'Deep Emerald', hex: '#064E3B' },
    { label: 'Golden Ochre', hex: '#854D0E' },
    { label: 'Apothecary Tan', hex: '#FAF7F2' },
    { label: 'Pure White', hex: '#FFFFFF' },
  ];

  // ─────────────────────────────────────────────────────────────
  // Persistence Handlers
  // ─────────────────────────────────────────────────────────────
  const saveUpdatedTabs = async (updatedTabs: ProductMonographTab[], successMessage?: string) => {
    if (onTabsChange) {
      onTabsChange(updatedTabs);
    }
    if (currentProduct && onUpdateProduct) {
      const updatedProd: HerbalProduct = {
        ...currentProduct,
        monographTabs: updatedTabs,
      };
      onUpdateProduct(updatedProd);
      await backupProductToFirebase(updatedProd);
    }
    if (onNotify) {
      onNotify(successMessage || `Updated collapsible tabs!`);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Tab Actions: Instant Create Collapsible
  // ─────────────────────────────────────────────────────────────
  const handleInstantCreateCollapsible = (preset: 'blank' | 'overview' | 'herbs' | 'dosage' | 'specs') => {
    let title = 'New Collapsible Section';
    let subtitle = 'Custom monograph section';
    let icon = 'sparkles';
    let bgColor = '#14291D';
    let textColor = '#FFFFFF';
    let blocks: MonographContentBlock[] = [];

    const now = Date.now();

    if (preset === 'overview') {
      title = 'Clinical Overview & Pharmacopoeia';
      subtitle = 'Primary medicinal profile and historical usage';
      icon = 'info';
      bgColor = '#14291D';
      blocks = [
        {
          id: `blk_${now}_card1`,
          type: 'card',
          design: { ...DEFAULT_BLOCK_DESIGN, bgColor: '#FFFFFF', padding: 'md' },
          cardData: {
            showHeader: true,
            title: 'Classical Formulation Profile',
            subtitle: 'Standardized under Ayurvedic Pharmacopoeia of India (API)',
            headerLevel: 'h3',
            showAccentBorder: true,
            showImage: false,
            showRichText: true,
            content: '**Therapeutic Indications**\nClinically formulated to balance Tridosha with primary focus on Vata-Pitta pacification.\n\n- Pure standardized plant extracts\n- Classical cold-processing method (Bhavana)\n- Free from heavy metals, synthetic binders, or additives.',
            secondaryContent: 'Historical reference: Charaka Samhita, Chikitsa Sthana, Chapter 1.',
            fontSize: 'sm',
            lineHeight: 'relaxed',
            showTags: true,
            tagsTitle: 'Pharmacological Classifications',
            tagsPosition: 'bottom',
            tags: [
              { id: 't1', text: 'Rasayana (Rejuvenator)', bgColor: '#14291D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
              { id: 't2', text: 'Tridoshic Balancer', bgColor: '#14532D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
              { id: 't3', text: '100% Herbal Purity', bgColor: '#B45309', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'pill' },
            ],
            detailedContent: 'Detailed Content / Monograph Paragraph: Administered under traditional guidance to strengthen Ojas and restore cellular equilibrium.',
          },
        },
      ];
    } else if (preset === 'herbs') {
      title = 'Botanical Active Ingredients';
      subtitle = 'Standardized phytocompounds and Latin botanical species';
      icon = 'leaf';
      bgColor = '#14532D';
      blocks = [
        {
          id: `blk_${now}_card1`,
          type: 'card',
          design: { ...DEFAULT_BLOCK_DESIGN, bgColor: '#FFFFFF', padding: 'md' },
          cardData: {
            showHeader: true,
            title: 'Ashwagandha (Withania somnifera)',
            subtitle: 'Standardized Adaptogenic Root Extract',
            headerLevel: 'h3',
            showAccentBorder: true,
            showImage: true,
            imageUrl: HERB_IMAGE_MAP.ashwagandha,
            imageLinkUrl: '',
            imagePosition: 'left',
            imageSize: 'small',
            aspectRatio: 'square',
            imageRounded: 'xl',
            showRichText: true,
            content: 'Standardized to min. 5% Withanolides. Adaptogenic root that helps mitigate cortisol spikes, calm neurological stress, and rebuild physical stamina.',
            secondaryContent: 'Botanical Part: Dried root extract · Potency: 500 mg per serving.',
            fontSize: 'sm',
            lineHeight: 'relaxed',
            showTags: true,
            tagsPosition: 'bottom',
            tags: [
              { id: 't1', text: '5% Withanolides', bgColor: '#14291D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
              { id: 't2', text: 'Stress Resilience', bgColor: '#14532D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'pill' },
            ],
            detailedContent: 'Detailed Content / Monograph: Classical Rasashastra reference confirms sustained bioavailability when paired with anupana.',
          },
        },
        {
          id: `blk_${now}_card2`,
          type: 'card',
          design: { ...DEFAULT_BLOCK_DESIGN, bgColor: '#FFFFFF', padding: 'md' },
          cardData: {
            showHeader: true,
            title: 'Amalaki (Phyllanthus emblica)',
            subtitle: 'Wild Forest Pericarp Extract',
            headerLevel: 'h3',
            showAccentBorder: true,
            showImage: true,
            imageUrl: HERB_IMAGE_MAP.amla,
            imageLinkUrl: '',
            imagePosition: 'left',
            imageSize: 'small',
            aspectRatio: 'square',
            imageRounded: 'xl',
            showRichText: true,
            content: 'Rich natural source of bioavailable Vitamin C and heat-stable polyphenols (emblicanin A & B). Promotes immune defense and tissue longevity.',
            secondaryContent: 'Botanical Part: Fresh wild fruit pericarp · Role: Metabolic catalyst and antioxidant.',
            fontSize: 'sm',
            lineHeight: 'relaxed',
            showTags: true,
            tagsPosition: 'bottom',
            tags: [
              { id: 't3', text: 'High Vitamin C', bgColor: '#B45309', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
              { id: 't4', text: 'Immuno-Modulator', bgColor: '#14532D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'pill' },
            ],
          },
        },
      ];
    } else if (preset === 'dosage') {
      title = 'Dosage & Anupana (Carrier Vehicle)';
      subtitle = 'Clinical administration schedule and optimal vehicles';
      icon = 'clock';
      bgColor = '#B45309';
      blocks = [
        {
          id: `blk_${now}_card1`,
          type: 'card',
          design: { ...DEFAULT_BLOCK_DESIGN, bgColor: '#FFFFFF', padding: 'md' },
          cardData: {
            showHeader: true,
            title: 'Dosage Guidelines & Anupana Carrier',
            subtitle: 'Recommended administration protocol',
            headerLevel: 'h3',
            showAccentBorder: true,
            showImage: false,
            showRichText: true,
            content: '**Recommended Dosage**\nTake 1 to 2 units (or 3-5 grams) twice daily, preferably 30 minutes after meals or as advised by an Ayurvedic physician.\n\n**Optimal Anupana Vehicles:**\n- Lukewarm Cow\'s Milk with a pinch of nutmeg\n- Warm purified water\n- Classical A2 Cow\'s Ghee or raw forest honey',
            secondaryContent: 'Anupana acts as a biological vector to transport medicinal phytonutrients deeper into subtle bodily channels (Srotas).',
            fontSize: 'sm',
            lineHeight: 'relaxed',
            showTags: true,
            tagsPosition: 'bottom',
            tags: [
              { id: 't1', text: 'Twice Daily (Post-Meal)', bgColor: '#14291D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
              { id: 't2', text: 'With Warm Milk / Ghee', bgColor: '#B45309', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'pill' },
            ],
            detailedContent: 'Detailed Content / Monograph Paragraph: Do not exceed recommended dosage unless directed by an Ayurvedic doctor.',
          },
        },
      ];
    } else if (preset === 'specs') {
      title = 'Apothecary Lab Specifications';
      subtitle = 'Quality certifications, safety indices, and shelf life';
      icon = 'shield';
      bgColor = '#1F2937';
      blocks = [
        {
          id: `blk_${now}_card1`,
          type: 'card',
          design: { ...DEFAULT_BLOCK_DESIGN, bgColor: '#FFFFFF', padding: 'md' },
          cardData: {
            showHeader: true,
            title: 'Quality & Safety Verification',
            subtitle: 'Apothecary lab certified standards',
            headerLevel: 'h3',
            showAccentBorder: true,
            showImage: false,
            showRichText: true,
            content: 'Every batch undergoes rigorous phytochemical testing, microbiological assay, and heavy metal screening conforming to pharmacopoeial benchmarks.',
            fontSize: 'sm',
            lineHeight: 'relaxed',
            showTags: true,
            tagsPosition: 'bottom',
            tags: [
              { id: 't1', text: 'GMP Certified Lab', bgColor: '#14291D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
              { id: 't2', text: 'Heavy Metals Screened', bgColor: '#14532D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
              { id: 't3', text: 'ISO 9001:2015', bgColor: '#1F2937', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'pill' },
              { id: 't4', text: 'Non-GMO & Vegan', bgColor: '#B45309', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
            ],
            detailedContent: 'Detailed Content / Monograph: Certified free from pesticides and micro-contaminants by third-party NABL accredited laboratory.',
          },
        },
      ];
    } else {
      // Blank
      title = `Custom Section ${monographTabs.length + 1}`;
      subtitle = 'Collapsible accordion section';
      blocks = [
        {
          id: `blk_${now}_card1`,
          type: 'card',
          design: DEFAULT_BLOCK_DESIGN,
          cardData: {
            showHeader: true,
            title: 'Card Title',
            subtitle: 'Optional subtitle',
            headerLevel: 'h3',
            showAccentBorder: true,
            showImage: false,
            showRichText: true,
            content: 'Write clinical information, instructions, or ingredients here.\n\n- Key Point 1\n- Key Point 2',
            fontSize: 'sm',
            lineHeight: 'relaxed',
            showTags: true,
            tagsPosition: 'bottom',
            tags: [
              { id: 't1', text: 'Standard Badge', bgColor: '#14291D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
            ],
          },
        },
      ];
    }

    const newTab: ProductMonographTab = {
      id: `tab_collab_${now}`,
      title,
      subtitle,
      icon,
      items: [],
      isCustom: true,
      enabled: true,
      order: monographTabs.length + 1,
      bgColor,
      textColor,
      bgOpacity: 100,
      blocks,
    };

    const updated = [...monographTabs, newTab];
    saveUpdatedTabs(updated, `Created collapsible section "${title}"!`);
    setActiveTabId(newTab.id);
  };

  // Reorder tabs
  const handleMoveTab = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= monographTabs.length) return;

    const copy = [...monographTabs];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const updated = copy.map((t, idx) => ({ ...t, order: idx + 1 }));
    saveUpdatedTabs(updated, `Reordered sections!`);
  };

  // Delete Tab
  const handleDeleteTab = (tabId: string) => {
    const targetTitle = monographTabs.find((t) => t.id === tabId)?.title || 'Tab';
    const updated = monographTabs.filter((t) => t.id !== tabId);
    saveUpdatedTabs(updated, `Deleted section "${targetTitle}"!`);
    if (activeTabId === tabId && updated.length > 0) {
      setActiveTabId(updated[0].id);
    }
    setDeleteConfirmTabId(null);
  };

  // Update Tab Meta
  const handleUpdateTabMeta = (tabId: string) => {
    if (!editingTabTitle.trim()) return;
    const updated = monographTabs.map((t) => {
      if (t.id === tabId) {
        return {
          ...t,
          title: editingTabTitle.trim(),
          subtitle: editingTabSubtitle.trim() || undefined,
          bgColor: editingTabBgColor ? editingTabBgColor.trim() : undefined,
          textColor: editingTabTextColor ? editingTabTextColor.trim() : undefined,
          bgOpacity: editingTabBgOpacity,
        };
      }
      return t;
    });
    saveUpdatedTabs(updated, `Updated section settings for "${editingTabTitle.trim()}"!`);
    setEditingTabMetaId(null);
  };

  // Reset to default
  const handleResetToDefault = () => {
    const dummyProduct: HerbalProduct = currentProduct || {
      id: 'prod_temp',
      name: productTitle || 'Formulation',
      sanskritName: '',
      category: 'immunity',
      categoryLabel: 'Immunity',
      form: 'Churna',
      tagline: '',
      description: '',
      price: 0,
      mrp: 0,
      volumeOrWeight: '100g',
      rating: 4.9,
      reviewsCount: 1,
      inStock: true,
      stockCount: 50,
      badges: [],
      images: [],
      mainImage: '',
    };
    const defaultTabs = buildDefaultMonographTabs(dummyProduct);
    const convertedTabs = defaultTabs.map((t) => ({
      ...t,
      blocks: getEffectiveTabBlocks(t),
    }));
    saveUpdatedTabs(convertedTabs, `Reset collapsible tabs to classical 6 standards!`);
    if (convertedTabs.length > 0) {
      setActiveTabId(convertedTabs[0].id);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Card / Block Actions: Add, Edit, Duplicate, Delete, Reorder
  // ─────────────────────────────────────────────────────────────
  const openAddCardModal = (preset: 'composed' | 'rich_image' | 'tags_para' | 'image_tags' | 'divider' = 'composed') => {
    setEditingBlockId(null);
    setBlockDesign({ ...DEFAULT_BLOCK_DESIGN });

    if (preset === 'divider') {
      setBlockType('divider');
      setDividerStyle('line');
      setDividerColor('#DDD5C5');
      setDividerThickness(1);
      setDividerHeightPx(24);
    } else {
      setBlockType('card');

      if (preset === 'rich_image') {
        // Rich text + Image with link
        setCardShowHeader(true);
        setCardTitle('Active Botanical Formulation');
        setCardSubtitle('Phytochemical extraction profile');
        setCardHeaderLevel('h3');
        setCardHeaderAccentBorder(true);

        setCardShowImage(true);
        setCardImageUrl(HERB_IMAGE_MAP.ashwagandha);
        setCardImageAlt('Herb image');
        setCardImageLinkUrl('');
        setCardImagePosition('left');
        setCardImageSize('small');
        setCardImageAspectRatio('square');
        setCardImageRounded('xl');

        setCardShowRichText(true);
        setCardContent('Key medicinal properties with active withanolides.\n\n- Standardized root fraction\n- Synergistic absorption with warm milk or ghee\n- Clinically tested purity');
        setCardSecondaryContent('Botanical Part: Dried root extract · Potency: 500mg');
        setCardFontSize('sm');
        setCardLineHeight('relaxed');

        setCardShowTags(false);
        setCardTagsList([]);
        setCardTagsPosition('bottom');
        setCardTagsDetailedContent('');
        setCardActionLinkUrl('');
        setCardActionLinkLabel('');
      } else if (preset === 'tags_para') {
        // Tags + Monograph Paragraph
        setCardShowHeader(true);
        setCardTitle('Pharmacological Classifications & Standards');
        setCardSubtitle('Ayurvedic Pharmacopoeia classifications');
        setCardHeaderLevel('h3');
        setCardHeaderAccentBorder(true);

        setCardShowImage(false);
        setCardImageUrl('');
        setCardImageLinkUrl('');

        setCardShowRichText(false);
        setCardContent('');
        setCardSecondaryContent('');

        setCardShowTags(true);
        setCardTagsTitle('Quality Certifications');
        setCardTagsPosition('bottom');
        setCardTagsList([
          { id: 't1', text: 'Rasayana (Rejuvenator)', bgColor: '#14291D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
          { id: 't2', text: '100% Ayurvedic Standard', bgColor: '#14532D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'pill' },
          { id: 't3', text: 'Heavy Metals Screened', bgColor: '#B45309', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
        ]);
        setCardTagsDetailedContent('Detailed Content / Monograph Paragraph: Classical texts specify this formulation to pacify Pitta and Vata imbalances, preserving vitality across age groups.');
        setCardActionLinkUrl('');
        setCardActionLinkLabel('');
      } else if (preset === 'image_tags') {
        // Only Image with link + Tags
        setCardShowHeader(true);
        setCardTitle('Wild Forest Harvest');
        setCardSubtitle('Pristine botanical source');
        setCardHeaderLevel('h3');
        setCardHeaderAccentBorder(false);

        setCardShowImage(true);
        setCardImageUrl('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80');
        setCardImageAlt('Botanical harvesting');
        setCardImageLinkUrl('https://vedavriksha.com');
        setCardImagePosition('top');
        setCardImageSize('full');
        setCardImageAspectRatio('16:9');
        setCardImageRounded('xl');

        setCardShowRichText(false);
        setCardContent('');
        setCardSecondaryContent('');

        setCardShowTags(true);
        setCardTagsTitle('');
        setCardTagsPosition('bottom');
        setCardTagsList([
          { id: 't1', text: 'Wild Forest Sourced', bgColor: '#14532D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'pill' },
          { id: 't2', text: 'Click Image to View Source', bgColor: '#1F2937', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
        ]);
        setCardTagsDetailedContent('Detailed Content / Monograph: Sourced ethically from traditional tribal cooperatives in protected forest sanctuaries.');
        setCardActionLinkUrl('');
        setCardActionLinkLabel('');
      } else {
        // Composed All-In-One Card
        setCardShowHeader(true);
        setCardTitle('Formulation Card Title');
        setCardSubtitle('Clinical descriptive subtitle');
        setCardHeaderLevel('h3');
        setCardHeaderAccentBorder(true);

        setCardShowImage(true);
        setCardImageUrl(HERB_IMAGE_MAP.ashwagandha);
        setCardImageAlt('Herb image');
        setCardImageLinkUrl('');
        setCardImagePosition('left');
        setCardImageSize('small');
        setCardImageAspectRatio('square');
        setCardImageRounded('xl');

        setCardShowRichText(true);
        setCardContent('Enter formatted clinical content or instructions here.\n\n- Standardized active fraction\n- Classical cold-processed formulation\n- High bioavailability');
        setCardSecondaryContent('Secondary note: Standardized according to Pharmacopoeial Laboratory guidelines.');
        setCardFontSize('sm');
        setCardLineHeight('relaxed');

        setCardShowTags(true);
        setCardTagsTitle('Key Badges');
        setCardTagsPosition('bottom');
        setCardTagsList([
          { id: 't1', text: 'Standardized Extract', bgColor: '#14291D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'rounded' },
          { id: 't2', text: '100% Herbal', bgColor: '#14532D', textColor: '#FFFFFF', bgOpacity: 100, fontSize: 'xs', style: 'pill' },
        ]);
        setCardTagsDetailedContent('Detailed Content / Monograph Paragraph: Classical Ayurvedic formulation details displayed below tags.');
        setCardActionLinkUrl('');
        setCardActionLinkLabel('');
      }
    }

    setEditorActiveSubtab('content');
    setIsBlockModalOpen(true);
  };

  const openEditBlockModal = (block: MonographContentBlock) => {
    setEditingBlockId(block.id);
    setBlockType(block.type);
    setBlockDesign(block.design || { ...DEFAULT_BLOCK_DESIGN });

    if (block.type === 'card' && block.cardData) {
      const c = block.cardData;
      setCardShowHeader(c.showHeader ?? true);
      setCardTitle(c.title || '');
      setCardSubtitle(c.subtitle || '');
      setCardHeaderLevel(c.headerLevel || 'h3');
      setCardHeaderAccentBorder(c.showAccentBorder ?? true);

      setCardShowImage(c.showImage ?? Boolean(c.imageUrl));
      setCardImageUrl(c.imageUrl || '');
      setCardImageAlt(c.imageAlt || '');
      setCardImageLinkUrl(c.imageLinkUrl || '');
      setCardImagePosition(c.imagePosition || 'left');
      setCardImageSize(c.imageSize || 'small');
      setCardImageAspectRatio(c.aspectRatio || 'square');
      setCardImageRounded(c.imageRounded || 'xl');

      setCardShowRichText(c.showRichText ?? Boolean(c.content));
      setCardContent(c.content || '');
      setCardSecondaryContent(c.secondaryContent || '');
      setCardFontSize(c.fontSize || 'sm');
      setCardLineHeight(c.lineHeight || 'relaxed');

      setCardShowTags(c.showTags ?? Boolean(c.tags?.length || c.detailedContent));
      setCardTagsTitle(c.tagsTitle || '');
      setCardTagsList(c.tags || []);
      setCardTagsPosition(c.tagsPosition || 'bottom');
      setCardTagsDetailedContent(c.detailedContent || '');

      setCardActionLinkUrl(c.actionLinkUrl || '');
      setCardActionLinkLabel(c.actionLinkLabel || '');
    } else if (block.type === 'header' && block.headerData) {
      // Convert seamlessly to Card view for convenience
      setBlockType('card');
      setCardShowHeader(true);
      setCardTitle(block.headerData.text || '');
      setCardSubtitle(block.headerData.subtitle || '');
      setCardHeaderLevel(block.headerData.level || 'h3');
      setCardHeaderAccentBorder(block.headerData.showAccentBorder ?? true);
      setCardShowImage(false);
      setCardShowRichText(false);
      setCardShowTags(false);
    } else if (block.type === 'rich_text' && block.richTextData) {
      setBlockType('card');
      setCardShowHeader(false);
      setCardShowImage(false);
      setCardShowRichText(true);
      setCardContent(block.richTextData.content || '');
      setCardSecondaryContent(block.richTextData.secondaryContent || '');
      setCardFontSize(block.richTextData.fontSize || 'sm');
      setCardLineHeight(block.richTextData.lineHeight || 'relaxed');
      setCardShowTags(false);
    } else if (block.type === 'tags' && block.tagsData) {
      setBlockType('card');
      setCardShowHeader(false);
      setCardShowImage(false);
      setCardShowRichText(false);
      setCardShowTags(true);
      setCardTagsTitle(block.tagsData.title || '');
      setCardTagsList(block.tagsData.tags || []);
      setCardTagsPosition('bottom');
      setCardTagsDetailedContent(block.tagsData.detailedContent || '');
    } else if (block.type === 'image_text' && block.imageTextData) {
      setBlockType('card');
      setCardShowHeader(Boolean(block.imageTextData.title));
      setCardTitle(block.imageTextData.title || '');
      setCardSubtitle('');
      setCardShowImage(true);
      setCardImageUrl(block.imageTextData.imageUrl || '');
      setCardImageAlt(block.imageTextData.imageAlt || '');
      setCardImageLinkUrl(block.imageTextData.imageLinkUrl || '');
      setCardImagePosition(block.imageTextData.imagePosition || 'left');
      setCardImageSize(block.imageTextData.imageSize || 'small');
      setCardImageAspectRatio(block.imageTextData.aspectRatio || 'square');
      setCardShowRichText(true);
      setCardContent(block.imageTextData.text || '');
      setCardSecondaryContent(block.imageTextData.detailedContent || '');
      setCardShowTags(false);
    } else if (block.type === 'image_only' && block.imageOnlyData) {
      setBlockType('card');
      setCardShowHeader(false);
      setCardShowImage(true);
      setCardImageUrl(block.imageOnlyData.imageUrl || '');
      setCardImageAlt(block.imageOnlyData.caption || '');
      setCardImageLinkUrl(block.imageOnlyData.imageLinkUrl || '');
      setCardImagePosition('top');
      setCardImageSize(block.imageOnlyData.imageSize as any || 'medium');
      setCardImageAspectRatio(block.imageOnlyData.aspectRatio as any || '16:9');
      setCardShowRichText(Boolean(block.imageOnlyData.caption));
      setCardContent(block.imageOnlyData.caption || '');
      setCardShowTags(false);
    } else if (block.type === 'divider' && block.dividerData) {
      setBlockType('divider');
      setDividerStyle(block.dividerData.style || 'line');
      setDividerColor(block.dividerData.lineColor || '#DDD5C5');
      setDividerThickness(block.dividerData.thickness || 1);
      setDividerHeightPx(block.dividerData.heightPx || 24);
    }

    setEditorActiveSubtab('content');
    setIsBlockModalOpen(true);
  };

  const handleSaveCardOrBlock = () => {
    if (!activeTab) return;

    let updatedBlock: MonographContentBlock;

    if (blockType === 'divider') {
      updatedBlock = {
        id: editingBlockId || `blk_${Date.now()}`,
        type: 'divider',
        design: { ...blockDesign },
        dividerData: {
          style: dividerStyle,
          lineColor: dividerColor,
          thickness: dividerThickness,
          heightPx: dividerHeightPx,
        },
      };
    } else {
      // Composed Card
      const cardData: CardBlockData = {
        showHeader: cardShowHeader,
        title: cardTitle.trim() || undefined,
        subtitle: cardSubtitle.trim() || undefined,
        headerLevel: cardHeaderLevel,
        showAccentBorder: cardHeaderAccentBorder,

        showImage: cardShowImage,
        imageUrl: cardImageUrl.trim() || undefined,
        imageAlt: cardImageAlt.trim() || cardTitle.trim() || undefined,
        imageLinkUrl: cardImageLinkUrl.trim() || undefined,
        imagePosition: cardImagePosition,
        imageSize: cardImageSize,
        aspectRatio: cardImageAspectRatio,
        imageRounded: cardImageRounded,

        showRichText: cardShowRichText,
        content: cardContent.trim() || undefined,
        secondaryContent: cardSecondaryContent.trim() || undefined,
        fontSize: cardFontSize,
        lineHeight: cardLineHeight,

        showTags: cardShowTags,
        tagsTitle: cardTagsTitle.trim() || undefined,
        tags: cardTagsList,
        tagsPosition: cardTagsPosition,
        detailedContent: cardTagsDetailedContent.trim() || undefined,

        actionLinkUrl: cardActionLinkUrl.trim() || undefined,
        actionLinkLabel: cardActionLinkLabel.trim() || undefined,
      };

      updatedBlock = {
        id: editingBlockId || `blk_${Date.now()}`,
        type: 'card',
        design: { ...blockDesign },
        cardData,
      };
    }

    const currentBlocks = activeTab.blocks || [];
    let newBlocks: MonographContentBlock[];

    if (editingBlockId) {
      newBlocks = currentBlocks.map((b) => (b.id === editingBlockId ? updatedBlock : b));
    } else {
      newBlocks = [...currentBlocks, updatedBlock];
    }

    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTab.id) {
        return {
          ...t,
          blocks: newBlocks,
        };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, editingBlockId ? 'Updated card!' : 'Added new card to section!');
    setIsBlockModalOpen(false);
  };

  const handleDuplicateBlock = (block: MonographContentBlock) => {
    if (!activeTab) return;
    const clonedBlock: MonographContentBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `blk_${Date.now()}_copy`,
    };

    const currentBlocks = activeTab.blocks || [];
    const index = currentBlocks.findIndex((b) => b.id === block.id);
    const newBlocks = [...currentBlocks];
    newBlocks.splice(index + 1, 0, clonedBlock);

    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTab.id) {
        return { ...t, blocks: newBlocks };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Duplicated card successfully!');
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!activeTab) return;
    const currentBlocks = activeTab.blocks || [];
    const newBlocks = currentBlocks.filter((b) => b.id !== blockId);

    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTab.id) {
        return { ...t, blocks: newBlocks };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Deleted card!');
    setDeleteConfirmBlockId(null);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!activeTab) return;
    const currentBlocks = activeTab.blocks || [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBlocks.length) return;

    const copy = [...currentBlocks];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const updatedTabs = monographTabs.map((t) => {
      if (t.id === activeTab.id) {
        return { ...t, blocks: copy };
      }
      return t;
    });

    saveUpdatedTabs(updatedTabs, 'Reordered card!');
  };

  const handleAddTagItem = () => {
    if (!newTagName.trim()) return;
    const item: TagItem = {
      id: `tag_${Date.now()}`,
      text: newTagName.trim(),
      bgColor: newTagBgColor,
      textColor: newTagTextColor,
      bgOpacity: newTagOpacity,
      fontSize: newTagFontSize,
      style: newTagStyle,
    };
    setCardTagsList([...cardTagsList, item]);
    setNewTagName('');
  };

  const handleRemoveTagItem = (tagId: string) => {
    setCardTagsList(cardTagsList.filter((t) => t.id !== tagId));
  };

  // Draft block for real-time live preview inside modal
  const previewDraftBlock: MonographContentBlock = useMemo(() => {
    if (blockType === 'divider') {
      return {
        id: 'draft_preview',
        type: 'divider',
        design: blockDesign,
        dividerData: {
          style: dividerStyle,
          lineColor: dividerColor,
          thickness: dividerThickness,
          heightPx: dividerHeightPx,
        },
      };
    }

    return {
      id: 'draft_preview',
      type: 'card',
      design: blockDesign,
      cardData: {
        showHeader: cardShowHeader,
        title: cardTitle || 'Preview Card Title',
        subtitle: cardSubtitle || undefined,
        headerLevel: cardHeaderLevel,
        showAccentBorder: cardHeaderAccentBorder,

        showImage: cardShowImage,
        imageUrl: cardImageUrl || (cardShowImage ? HERB_IMAGE_MAP.ashwagandha : undefined),
        imageAlt: cardImageAlt,
        imageLinkUrl: cardImageLinkUrl,
        imagePosition: cardImagePosition,
        imageSize: cardImageSize,
        aspectRatio: cardImageAspectRatio,
        imageRounded: cardImageRounded,

        showRichText: cardShowRichText,
        content: cardContent || 'Preview clinical content description.\n\n- Key Point 1\n- Key Point 2',
        secondaryContent: cardSecondaryContent || undefined,
        fontSize: cardFontSize,
        lineHeight: cardLineHeight,

        showTags: cardShowTags,
        tagsTitle: cardTagsTitle || undefined,
        tags: cardTagsList,
        tagsPosition: cardTagsPosition,
        detailedContent: cardTagsDetailedContent || undefined,

        actionLinkUrl: cardActionLinkUrl || undefined,
        actionLinkLabel: cardActionLinkLabel || undefined,
      },
    };
  }, [
    blockType,
    blockDesign,
    cardShowHeader,
    cardTitle,
    cardSubtitle,
    cardHeaderLevel,
    cardHeaderAccentBorder,
    cardShowImage,
    cardImageUrl,
    cardImageAlt,
    cardImageLinkUrl,
    cardImagePosition,
    cardImageSize,
    cardImageAspectRatio,
    cardImageRounded,
    cardShowRichText,
    cardContent,
    cardSecondaryContent,
    cardFontSize,
    cardLineHeight,
    cardShowTags,
    cardTagsTitle,
    cardTagsList,
    cardTagsPosition,
    cardTagsDetailedContent,
    cardActionLinkUrl,
    cardActionLinkLabel,
    dividerStyle,
    dividerColor,
    dividerThickness,
    dividerHeightPx,
  ]);

  const previewProduct: HerbalProduct = useMemo(() => {
    return {
      ...(currentProduct || {
        id: 'preview_prod',
        name: productTitle || 'Herbal Product',
        sanskritName: '',
        category: 'immunity',
        categoryLabel: 'Immunity',
        form: 'Churna',
        tagline: '',
        description: '',
        price: 499,
        mrp: 699,
        volumeOrWeight: '100g',
        rating: 4.9,
        reviewsCount: 12,
        inStock: true,
        stockCount: 50,
        badges: [],
        images: [],
        mainImage: '',
      }),
      monographTabs: monographTabs,
    };
  }, [currentProduct, productTitle, monographTabs]);

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Header & Instant Create Collapsible Section */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FAF8F5] to-[#F5EFE6] rounded-2xl border border-[#D5CCBC] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#14291D] text-amber-300">
                <Bookmark className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#14291D]">
                  Product Collapsible Accordion & Card Builder
                </h3>
                <p className="text-xs text-[#6D6353]">
                  Compose custom cards with any combination of Header, Rich Text, Images with links, Badges, and Spacing inside collapsible accordion tabs.
                </p>
              </div>
            </div>
          </div>

          {/* Instant Create Collapsible Section Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleInstantCreateCollapsible('blank')}
              className="px-3 py-1.5 rounded-lg bg-[#14291D] hover:bg-[#20442E] text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Instant Create Collapsible</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstantCreateCollapsible('herbs')}
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#14532D] border border-[#C5DDCB] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Add Botanical Active Herbs Section"
            >
              <Leaf className="w-3 h-3 text-emerald-700" />
              <span>+ Botanical Herb Section</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstantCreateCollapsible('specs')}
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#1F2937] border border-[#DDD5C5] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Add Apothecary Specs & Certifications"
            >
              <Shield className="w-3 h-3 text-stone-700" />
              <span>+ Quality Specs</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-[#786E5E] border border-[#DDD5C5] transition-colors cursor-pointer"
              title="Reset to 6 Classical Standards"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product selector only when hideProductPicker is false */}
        {!hideProductPicker && products.length > 1 && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#EAE3D4]">
            <span className="text-xs font-semibold text-[#5B5141]">Select Product:</span>
            <select
              value={activeProductId}
              onChange={(e) => setActiveProductId(e.target.value)}
              className="text-xs py-1 px-2.5 rounded-lg border border-[#DDD5C5] bg-white text-[#14291D] font-semibold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Collapsible Tabs Bar (Select which tab to edit) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-serif font-bold text-xs sm:text-sm text-[#14291D] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#2C5E43]" />
            <span>Collapsible Accordion Sections ({monographTabs.length})</span>
          </span>
          <span className="text-[11px] text-[#716858]">
            Click section to view and add cards inside it
          </span>
        </div>

        {/* Scrollable Tabs Pills */}
        <div className="flex items-center gap-2 overflow-x-auto visible-tabs-scrollbar pb-1">
          {monographTabs.map((tab, idx) => {
            const isSelected = tab.id === activeTabId;
            const cardCount = (tab.blocks || []).length;

            return (
              <div
                key={tab.id}
                className={`flex items-center gap-1 rounded-xl p-1 transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs'
                    : 'bg-white text-[#4A4032] border-[#DDD5C5] hover:bg-[#FAF8F5]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className="px-2.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {tab.bgColor && !isSelected && (
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: tab.bgColor }}
                    />
                  )}
                  <span>{tab.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                  </span>
                </button>

                {/* Tab reorder & edit buttons */}
                <div className="flex items-center pr-1">
                  <button
                    type="button"
                    onClick={() => handleMoveTab(idx, 'up')}
                    disabled={idx === 0}
                    className={`p-1 rounded hover:bg-black/10 transition-colors ${
                      idx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    title="Move section left"
                  >
                    <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveTab(idx, 'down')}
                    disabled={idx === monographTabs.length - 1}
                    className={`p-1 rounded hover:bg-black/10 transition-colors ${
                      idx === monographTabs.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    title="Move section right"
                  >
                    <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTabMetaId(tab.id);
                      setEditingTabTitle(tab.title);
                      setEditingTabSubtitle(tab.subtitle || '');
                      setEditingTabBgColor(tab.bgColor || '#14291D');
                      setEditingTabTextColor(tab.textColor || '#FFFFFF');
                      setEditingTabBgOpacity(tab.bgOpacity ?? 100);
                    }}
                    className="p-1 rounded hover:bg-black/10 transition-colors cursor-pointer text-amber-400"
                    title="Configure Section Styling"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmTabId(tab.id)}
                    className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete section"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Section Meta Quick Config (if opened) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {editingTabMetaId && (
        <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#C2B7A3] space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#14291D] flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-[#2C5E43]" />
              <span>Configure Accordion Section Settings</span>
            </h4>
            <button
              type="button"
              onClick={() => setEditingTabMetaId(null)}
              className="p-1 text-stone-500 hover:text-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#574E3F] block mb-1">Section Title</label>
              <input
                type="text"
                value={editingTabTitle}
                onChange={(e) => setEditingTabTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-serif font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#574E3F] block mb-1">Subtitle (Optional)</label>
              <input
                type="text"
                value={editingTabSubtitle}
                onChange={(e) => setEditingTabSubtitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#574E3F] block mb-1">Header Accent Bg Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editingTabBgColor || '#14291D'}
                  onChange={(e) => setEditingTabBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={editingTabBgColor}
                  onChange={(e) => setEditingTabBgColor(e.target.value)}
                  placeholder="#14291D"
                  className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#574E3F] block mb-1">Header Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editingTabTextColor || '#FFFFFF'}
                  onChange={(e) => setEditingTabTextColor(e.target.value)}
                  className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={editingTabTextColor}
                  onChange={(e) => setEditingTabTextColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingTabMetaId(null)}
              className="px-3 py-1.5 rounded-lg border border-[#DDD5C5] text-xs font-semibold text-stone-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleUpdateTabMeta(editingTabMetaId)}
              className="px-4 py-1.5 rounded-lg bg-[#14291D] text-white text-xs font-semibold hover:bg-[#20442E]"
            >
              Save Section Settings
            </button>
          </div>
        </div>
      )}

      {/* Delete Tab Confirmation Modal */}
      {deleteConfirmTabId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-300 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-serif font-bold text-sm">Delete Accordion Section?</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete this collapsible section and all its cards? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTabId(null)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTab(deleteConfirmTabId)}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Active Tab Content Cards List & Visual Builder */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab && (
        <div className="p-4 sm:p-6 bg-white rounded-2xl border border-[#D5CCBC] shadow-sm space-y-5">
          {/* Active Tab Subhead & Card Creation Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE3D4] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-base text-[#14291D]">
                  {activeTab.title} — Content Cards
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                  {(activeTab.blocks || []).length} Cards
                </span>
              </div>
              <p className="text-xs text-[#716858] mt-0.5">
                Ander ek card banayein aur jahan man ho jo cheej (image with link, tags, rich text list) lagayein. Can create multiple cards in this tab.
              </p>
            </div>

            {/* Primary Action: Create Custom Card + Quick Templates */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => openAddCardModal('composed')}
                className="px-3 py-2 rounded-xl bg-[#14291D] hover:bg-[#20442E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                title="Create a Card with any combination of elements"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>+ Create Custom Card</span>
              </button>

              <button
                type="button"
                onClick={() => openAddCardModal('rich_image')}
                className="px-2.5 py-1.5 rounded-lg bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#14291D] border border-[#DDD5C5] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Rich text list with image (left/right/top/bottom) & link"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>+ Text + Image (Link)</span>
              </button>

              <button
                type="button"
                onClick={() => openAddCardModal('tags_para')}
                className="px-2.5 py-1.5 rounded-lg bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#14291D] border border-[#DDD5C5] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Tags / badges with monograph paragraph below"
              >
                <TagIcon className="w-3.5 h-3.5 text-[#B45309]" />
                <span>+ Tags & Paragraph</span>
              </button>

              <button
                type="button"
                onClick={() => openAddCardModal('image_tags')}
                className="px-2.5 py-1.5 rounded-lg bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#14291D] border border-[#DDD5C5] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Only image with link & tags inside"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                <span>+ Image (Link) + Tags</span>
              </button>

              <button
                type="button"
                onClick={() => openAddCardModal('divider')}
                className="px-2.5 py-1.5 rounded-lg bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#14291D] border border-[#DDD5C5] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Divider or spacing"
              >
                <Minus className="w-3.5 h-3.5 text-stone-600" />
                <span>+ Spacing</span>
              </button>
            </div>
          </div>

          {/* Cards List in this Section */}
          {(!activeTab.blocks || activeTab.blocks.length === 0) ? (
            <div className="py-12 text-center text-[#7A705E] space-y-3 bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD5C5]">
              <CreditCard className="w-8 h-8 mx-auto text-[#B5A893]" />
              <p className="text-sm font-semibold">No cards added in this collapsible section yet.</p>
              <p className="text-xs text-[#8C806D] max-w-md mx-auto">
                Click "+ Create Custom Card" above to build a card with text, image (with link), and tags placed wherever you want.
              </p>
              <button
                type="button"
                onClick={() => openAddCardModal('composed')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#14291D] text-white text-xs font-bold hover:bg-[#20442E] shadow-sm cursor-pointer"
              >
                + Create First Card
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab.blocks.map((block, bIdx) => {
                const isCard = block.type === 'card' || Boolean(block.cardData);

                return (
                  <div
                    key={block.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-[#E2D9CB] bg-[#FAF8F5] hover:border-[#C5BBA7] shadow-2xs transition-all space-y-3"
                  >
                    {/* Card Action Header Bar */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#EAE3D4] pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#8C806D]">
                          Card #{bIdx + 1}
                        </span>

                        {isCard ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            <span>CUSTOM CARD</span>
                          </span>
                        ) : block.type === 'divider' ? (
                          <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 font-bold text-[10px]">
                            SPACING / DIVIDER
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                            {block.type.replace('_', ' ')}
                          </span>
                        )}

                        {block.design?.bgColor && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-stone-600">
                            <span 
                              className="w-2.5 h-2.5 rounded border border-stone-300 inline-block" 
                              style={{ backgroundColor: block.design.bgColor }} 
                            />
                            {block.design.bgColor}
                          </span>
                        )}

                        {block.cardData?.imageLinkUrl && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono flex items-center gap-0.5">
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Image Link</span>
                          </span>
                        )}
                      </div>

                      {/* Operations: Move Up, Move Down, Duplicate, Edit, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveBlock(bIdx, 'up')}
                          disabled={bIdx === 0}
                          className={`p-1.5 rounded-lg border border-[#DDD5C5] bg-white hover:bg-stone-100 text-stone-700 transition-colors ${
                            bIdx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Move Card Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBlock(bIdx, 'down')}
                          disabled={bIdx === (activeTab.blocks?.length || 0) - 1}
                          className={`p-1.5 rounded-lg border border-[#DDD5C5] bg-white hover:bg-stone-100 text-stone-700 transition-colors ${
                            bIdx === (activeTab.blocks?.length || 0) - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Move Card Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateBlock(block)}
                          className="p-1.5 rounded-lg border border-[#DDD5C5] bg-white hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
                          title="Duplicate Card"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditBlockModal(block)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#14291D] hover:bg-[#20442E] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Edit Card Content & Design Settings"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmBlockId(block.id)}
                          className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Actual Rendered Card Display */}
                    <div className="pt-1">
                      <MonographBlockRenderer block={block} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Card Confirmation Modal */}
      {deleteConfirmBlockId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-300 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-serif font-bold text-sm">Delete Card?</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to remove this card from this collapsible section?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBlockId(null)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBlock(deleteConfirmBlockId)}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. Composed Card Visual Editor Modal */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#D5CCBC] overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#EAE3D4] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#14291D] text-amber-300">
                  <CreditCard className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#14291D]">
                    {editingBlockId ? 'Edit Card & Elements' : 'Create Custom Card'}
                  </h4>
                  <p className="text-xs text-[#6D6353]">
                    Ek card me jahan man ho jo cheej (image with link, tags, rich text list, headers) lagayein.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs: Content Elements vs Design Settings */}
            <div className="flex border-b border-[#EAE3D4] bg-[#F5EFE6] px-4 pt-2 gap-2">
              <button
                type="button"
                onClick={() => setEditorActiveSubtab('content')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  editorActiveSubtab === 'content'
                    ? 'bg-white text-[#14291D] shadow-xs border-t-2 border-[#14291D]'
                    : 'text-[#6D6353] hover:text-[#14291D]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>1. Card Elements (Image, Text, Tags, Link)</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorActiveSubtab('design')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  editorActiveSubtab === 'design'
                    ? 'bg-white text-[#14291D] shadow-xs border-t-2 border-[#14291D]'
                    : 'text-[#6D6353] hover:text-[#14291D]'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-[#B45309]" />
                <span>2. Individual Card Design (Colors, Opacity, Padding, Border)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* ───────────────────────────────────────────────────── */}
              {/* SUBTAB 1: CARD ELEMENTS */}
              {/* ───────────────────────────────────────────────────── */}
              {editorActiveSubtab === 'content' && (
                <div className="space-y-5">
                  {blockType === 'divider' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-bold text-[#4B4031] block mb-1">Divider Style</label>
                          <select
                            value={dividerStyle}
                            onChange={(e) => setDividerStyle(e.target.value as any)}
                            className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
                          >
                            <option value="line">Solid Line</option>
                            <option value="dashed">Dashed Line</option>
                            <option value="dots">Botanical Dots</option>
                            <option value="spacing_only">Spacing Only (Invisible Margin)</option>
                          </select>
                        </div>
                        {dividerStyle !== 'spacing_only' && (
                          <div>
                            <label className="text-xs font-bold text-[#4B4031] block mb-1">Line Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={dividerColor}
                                onChange={(e) => setDividerColor(e.target.value)}
                                className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={dividerColor}
                                onChange={(e) => setDividerColor(e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-mono"
                              />
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-bold text-[#4B4031] block mb-1">Height (px)</label>
                          <input
                            type="number"
                            min={4}
                            max={120}
                            value={dividerHeightPx}
                            onChange={(e) => setDividerHeightPx(Number(e.target.value))}
                            className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Element Toggles Bar */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D4] space-y-2">
                        <span className="text-xs font-bold text-[#14291D] block">
                          Elements to include inside this card:
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cardShowHeader}
                              onChange={(e) => setCardShowHeader(e.target.checked)}
                              className="w-4 h-4 text-emerald-800 rounded"
                            />
                            <span>Header / Title</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cardShowImage}
                              onChange={(e) => setCardShowImage(e.target.checked)}
                              className="w-4 h-4 text-emerald-800 rounded"
                            />
                            <span>Image (with Link & Position)</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cardShowRichText}
                              onChange={(e) => setCardShowRichText(e.target.checked)}
                              className="w-4 h-4 text-emerald-800 rounded"
                            />
                            <span>Rich Text / Bullet List</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cardShowTags}
                              onChange={(e) => setCardShowTags(e.target.checked)}
                              className="w-4 h-4 text-emerald-800 rounded"
                            />
                            <span>Tags / Badges & Paragraph</span>
                          </label>
                        </div>
                      </div>

                      {/* 1. Header Section */}
                      {cardShowHeader && (
                        <div className="p-3.5 bg-white rounded-xl border border-[#EAE3D4] space-y-3">
                          <span className="text-xs font-bold text-[#2C5E43] flex items-center gap-1">
                            <Type className="w-3.5 h-3.5" />
                            <span>1. Card Header & Title</span>
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-stone-700 block mb-1">Title</label>
                              <input
                                type="text"
                                value={cardTitle}
                                onChange={(e) => setCardTitle(e.target.value)}
                                placeholder="e.g. Ashwagandha (Withania somnifera)"
                                className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-serif font-bold text-[#14291D]"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-stone-700 block mb-1">Subtitle</label>
                              <input
                                type="text"
                                value={cardSubtitle}
                                onChange={(e) => setCardSubtitle(e.target.value)}
                                placeholder="e.g. Standardized Adaptogenic Root Fraction"
                                className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Title Size</label>
                              <select
                                value={cardHeaderLevel}
                                onChange={(e) => setCardHeaderLevel(e.target.value as any)}
                                className="text-xs p-1.5 rounded-lg border border-[#DDD5C5] bg-white"
                              >
                                <option value="h2">H2 (Large)</option>
                                <option value="h3">H3 (Standard)</option>
                                <option value="h4">H4 (Compact)</option>
                              </select>
                            </div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold pt-4 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cardHeaderAccentBorder}
                                onChange={(e) => setCardHeaderAccentBorder(e.target.checked)}
                                className="w-4 h-4 text-emerald-800 rounded"
                              />
                              <span>Accent Underline Bar</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* 2. Image Section (with Clickable Link & Placement) */}
                      {cardShowImage && (
                        <div className="p-3.5 bg-white rounded-xl border border-[#EAE3D4] space-y-3">
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>2. Card Image (with Link & Flexible Position)</span>
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-stone-700 block mb-1">Image URL</label>
                              <input
                                type="text"
                                value={cardImageUrl}
                                onChange={(e) => setCardImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-blue-800 block mb-1 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                <span>Image Link URL (Clickable on image!)</span>
                              </label>
                              <input
                                type="text"
                                value={cardImageLinkUrl}
                                onChange={(e) => setCardImageLinkUrl(e.target.value)}
                                placeholder="https://... (opens when user clicks image)"
                                className="w-full text-xs p-2 rounded-lg border border-blue-200 bg-blue-50/30 font-mono"
                              />
                            </div>
                          </div>

                          {/* Quick Herb Presets */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-stone-600 block">Quick Botanical Herb Presets:</span>
                            <div className="flex flex-wrap items-center gap-1">
                              {Object.entries(HERB_IMAGE_MAP).slice(0, 10).map(([key, url]) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    setCardImageUrl(url);
                                    if (!cardTitle) {
                                      setCardTitle(key.charAt(0).toUpperCase() + key.slice(1));
                                    }
                                  }}
                                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF4EA] hover:bg-[#F2E7D2] text-[#14291D] border border-[#DDD5C5] capitalize cursor-pointer"
                                >
                                  {key}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Image Position</label>
                              <select
                                value={cardImagePosition}
                                onChange={(e) => setCardImagePosition(e.target.value as any)}
                                className="w-full text-xs p-1.5 rounded-lg border border-[#DDD5C5] bg-white font-semibold"
                              >
                                <option value="left">Left (Side-by-side)</option>
                                <option value="right">Right (Side-by-side)</option>
                                <option value="top">Top (Stacked)</option>
                                <option value="bottom">Bottom (Stacked)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Image Size</label>
                              <select
                                value={cardImageSize}
                                onChange={(e) => setCardImageSize(e.target.value as any)}
                                className="w-full text-xs p-1.5 rounded-lg border border-[#DDD5C5] bg-white"
                              >
                                <option value="compact">Compact Thumbnail</option>
                                <option value="small">Small (~28)</option>
                                <option value="medium">Medium (~44)</option>
                                <option value="large">Large</option>
                                <option value="full">Full Width</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Aspect Ratio</label>
                              <select
                                value={cardImageAspectRatio}
                                onChange={(e) => setCardImageAspectRatio(e.target.value as any)}
                                className="w-full text-xs p-1.5 rounded-lg border border-[#DDD5C5] bg-white"
                              >
                                <option value="square">Square (1:1)</option>
                                <option value="16:9">16:9 Widescreen</option>
                                <option value="4:3">4:3 Standard</option>
                                <option value="natural">Natural</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Rounded Corners</label>
                              <select
                                value={cardImageRounded}
                                onChange={(e) => setCardImageRounded(e.target.value as any)}
                                className="w-full text-xs p-1.5 rounded-lg border border-[#DDD5C5] bg-white"
                              >
                                <option value="xl">XL (Modern)</option>
                                <option value="2xl">2XL (Soft)</option>
                                <option value="full">Circle / Pill</option>
                                <option value="md">Medium</option>
                                <option value="none">Sharp / None</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. Rich Text Section */}
                      {cardShowRichText && (
                        <div className="p-3.5 bg-white rounded-xl border border-[#EAE3D4] space-y-3">
                          <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>3. Rich Text List & Content</span>
                          </span>

                          <div>
                            <label className="text-[11px] font-bold text-stone-700 block mb-1">
                              Primary Content (supports **bold**, bullet points starting with - or •)
                            </label>
                            <textarea
                              rows={4}
                              value={cardContent}
                              onChange={(e) => setCardContent(e.target.value)}
                              placeholder="Type rich text description or bullet list..."
                              className="w-full text-xs p-2.5 rounded-lg border border-[#DDD5C5] bg-white font-mono leading-relaxed"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-stone-700 block mb-1">
                              Secondary / Monograph Paragraph / Clinical Commentary (Optional)
                            </label>
                            <textarea
                              rows={2}
                              value={cardSecondaryContent}
                              onChange={(e) => setCardSecondaryContent(e.target.value)}
                              placeholder="Clinical notes, pharmacopoeia reference..."
                              className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white text-stone-700"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Font Size</label>
                              <select
                                value={cardFontSize}
                                onChange={(e) => setCardFontSize(e.target.value as any)}
                                className="w-full text-xs p-1.5 rounded-lg border border-[#DDD5C5] bg-white"
                              >
                                <option value="xs">Extra Small (12px)</option>
                                <option value="sm">Small (13-14px - Recommended)</option>
                                <option value="base">Standard (15-16px)</option>
                                <option value="lg">Large (18px)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Line Height</label>
                              <select
                                value={cardLineHeight}
                                onChange={(e) => setCardLineHeight(e.target.value as any)}
                                className="w-full text-xs p-1.5 rounded-lg border border-[#DDD5C5] bg-white"
                              >
                                <option value="relaxed">Relaxed (Comfortable)</option>
                                <option value="normal">Normal</option>
                                <option value="loose">Loose</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. Tags / Badges Section */}
                      {cardShowTags && (
                        <div className="p-3.5 bg-white rounded-xl border border-[#EAE3D4] space-y-3">
                          <span className="text-xs font-bold text-[#14532D] flex items-center gap-1">
                            <TagIcon className="w-3.5 h-3.5" />
                            <span>4. Tags / Badges & Detailed Monograph Paragraph</span>
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-stone-700 block mb-1">Tags Group Title (Optional)</label>
                              <input
                                type="text"
                                value={cardTagsTitle}
                                onChange={(e) => setCardTagsTitle(e.target.value)}
                                placeholder="e.g. Standardizations"
                                className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                                Position of Tags inside Card (Where you want!)
                              </label>
                              <select
                                value={cardTagsPosition}
                                onChange={(e) => setCardTagsPosition(e.target.value as any)}
                                className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-semibold text-[#14291D]"
                              >
                                <option value="bottom">At Bottom (Below text / image - Recommended)</option>
                                <option value="middle">In Middle (Between header and text)</option>
                                <option value="top">At Top of Card</option>
                              </select>
                            </div>
                          </div>

                          {/* Existing Tags list */}
                          <div className="space-y-2 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE3D4]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {cardTagsList.map((tag) => (
                                <span
                                  key={tag.id}
                                  style={{
                                    backgroundColor: hexToRgba(tag.bgColor || '#14291D', tag.bgOpacity ?? 100),
                                    color: tag.textColor || '#FFFFFF',
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold shadow-2xs ${
                                    tag.style === 'square' ? 'rounded-xs' : tag.style === 'pill' ? 'rounded-full' : 'rounded-md'
                                  }`}
                                >
                                  <span>{tag.text}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTagItem(tag.id)}
                                    className="hover:text-red-300 cursor-pointer ml-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                              {cardTagsList.length === 0 && (
                                <span className="text-xs text-stone-500 italic">No tags added yet.</span>
                              )}
                            </div>

                            {/* Add Tag Bar */}
                            <div className="pt-2 border-t border-[#EAE3D4] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 items-end">
                              <div className="md:col-span-2">
                                <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Tag Text</label>
                                <input
                                  type="text"
                                  value={newTagName}
                                  onChange={(e) => setNewTagName(e.target.value)}
                                  placeholder="e.g. 100% Ayurvedic"
                                  className="w-full text-xs p-1.5 rounded-lg border border-[#DDD5C5] bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Bg Color</label>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="color"
                                    value={newTagBgColor}
                                    onChange={(e) => setNewTagBgColor(e.target.value)}
                                    className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={newTagBgColor}
                                    onChange={(e) => setNewTagBgColor(e.target.value)}
                                    className="w-full text-[10px] p-1 rounded border border-[#DDD5C5] font-mono"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Text Color</label>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="color"
                                    value={newTagTextColor}
                                    onChange={(e) => setNewTagTextColor(e.target.value)}
                                    className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={newTagTextColor}
                                    onChange={(e) => setNewTagTextColor(e.target.value)}
                                    className="w-full text-[10px] p-1 rounded border border-[#DDD5C5] font-mono"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Style</label>
                                <select
                                  value={newTagStyle}
                                  onChange={(e) => setNewTagStyle(e.target.value as any)}
                                  className="w-full text-[11px] p-1 rounded border border-[#DDD5C5] bg-white"
                                >
                                  <option value="rounded">Rounded</option>
                                  <option value="pill">Pill</option>
                                  <option value="square">Square</option>
                                </select>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={handleAddTagItem}
                                  className="w-full py-1.5 rounded-lg bg-[#14291D] text-white text-xs font-bold hover:bg-[#20442E] cursor-pointer"
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Detailed Content / Monograph Paragraph below tags */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-stone-700 block">
                              Detailed Content / Monograph Paragraph (Optional) — Displayed Down of the Tags
                            </label>
                            <textarea
                              rows={2}
                              value={cardTagsDetailedContent}
                              onChange={(e) => setCardTagsDetailedContent(e.target.value)}
                              placeholder="Classical reference details displayed prominently down of the tags..."
                              className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* SUBTAB 2: INDIVIDUAL CARD DESIGN CONTROLS */}
              {/* ───────────────────────────────────────────────────── */}
              {editorActiveSubtab === 'design' && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D4]">
                    <span className="text-xs font-bold text-[#14291D] block mb-1">
                      Individual Design Settings for this Card
                    </span>
                    <p className="text-[11px] text-[#716858]">
                      Each card has its own independent background color, text color, background opacity, padding, margin, border, border radius, alignment, and width.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Background Color & Opacity */}
                    <div>
                      <label className="text-xs font-bold text-[#4B4031] block mb-1">
                        Card Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={blockDesign.bgColor || '#FFFFFF'}
                          onChange={(e) => setBlockDesign({ ...blockDesign, bgColor: e.target.value })}
                          className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={blockDesign.bgColor || ''}
                          onChange={(e) => setBlockDesign({ ...blockDesign, bgColor: e.target.value })}
                          placeholder="#FFFFFF"
                          className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-mono"
                        />
                      </div>

                      {/* Quick Swatches */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {DARK_PALETTE.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setBlockDesign({ ...blockDesign, bgColor: c.hex })}
                            style={{ backgroundColor: c.hex }}
                            className="w-4 h-4 rounded-full border border-stone-300 cursor-pointer"
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="text-xs font-bold text-[#4B4031] block mb-1">
                        Card Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={blockDesign.textColor || '#14291D'}
                          onChange={(e) => setBlockDesign({ ...blockDesign, textColor: e.target.value })}
                          className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={blockDesign.textColor || ''}
                          onChange={(e) => setBlockDesign({ ...blockDesign, textColor: e.target.value })}
                          placeholder="#14291D"
                          className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-mono"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {DARK_PALETTE.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setBlockDesign({ ...blockDesign, textColor: c.hex })}
                            style={{ backgroundColor: c.hex }}
                            className="w-4 h-4 rounded-full border border-stone-300 cursor-pointer"
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Background Opacity Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#4B4031]">Background Opacity</label>
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          {blockDesign.bgOpacity ?? 100}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={blockDesign.bgOpacity ?? 100}
                        onChange={(e) => setBlockDesign({ ...blockDesign, bgOpacity: Number(e.target.value) })}
                        className="w-full accent-[#14291D] cursor-pointer"
                      />
                    </div>

                    {/* Padding */}
                    <div>
                      <label className="text-xs font-bold text-[#4B4031] block mb-1">Padding</label>
                      <select
                        value={blockDesign.padding || 'md'}
                        onChange={(e) => setBlockDesign({ ...blockDesign, padding: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
                      >
                        <option value="none">None (0)</option>
                        <option value="sm">Small (Compact)</option>
                        <option value="md">Medium (Standard)</option>
                        <option value="lg">Large (Spacious)</option>
                        <option value="xl">Extra Large</option>
                      </select>
                    </div>

                    {/* Margin */}
                    <div>
                      <label className="text-xs font-bold text-[#4B4031] block mb-1">Vertical Margin</label>
                      <select
                        value={blockDesign.margin || 'sm'}
                        onChange={(e) => setBlockDesign({ ...blockDesign, margin: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
                      >
                        <option value="none">None (0)</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                      </select>
                    </div>

                    {/* Border Style */}
                    <div>
                      <label className="text-xs font-bold text-[#4B4031] block mb-1">Border Style</label>
                      <select
                        value={blockDesign.border || 'solid'}
                        onChange={(e) => setBlockDesign({ ...blockDesign, border: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
                      >
                        <option value="none">None</option>
                        <option value="solid">Solid Border</option>
                        <option value="dashed">Dashed Border</option>
                        <option value="subtle">Subtle Border</option>
                      </select>
                    </div>

                    {/* Border Color */}
                    <div>
                      <label className="text-xs font-bold text-[#4B4031] block mb-1">Border Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={blockDesign.borderColor || '#EAE3D4'}
                          onChange={(e) => setBlockDesign({ ...blockDesign, borderColor: e.target.value })}
                          className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={blockDesign.borderColor || ''}
                          onChange={(e) => setBlockDesign({ ...blockDesign, borderColor: e.target.value })}
                          placeholder="#EAE3D4"
                          className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Border Radius */}
                    <div>
                      <label className="text-xs font-bold text-[#4B4031] block mb-1">Border Radius</label>
                      <select
                        value={blockDesign.borderRadius || 'xl'}
                        onChange={(e) => setBlockDesign({ ...blockDesign, borderRadius: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
                      >
                        <option value="none">None (Sharp 0)</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large (Rounded)</option>
                        <option value="2xl">2XL (Pill)</option>
                      </select>
                    </div>

                    {/* Width */}
                    <div>
                      <label className="text-xs font-bold text-[#4B4031] block mb-1">Card Width</label>
                      <select
                        value={blockDesign.width || 'full'}
                        onChange={(e) => setBlockDesign({ ...blockDesign, width: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-lg border border-[#DDD5C5] bg-white"
                      >
                        <option value="full">Full Width (100%)</option>
                        <option value="wide">Wide (Max-w-4xl)</option>
                        <option value="compact">Compact (Max-w-md Centered)</option>
                        <option value="auto">Auto (Fit to Content)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* REAL-TIME LIVE PREVIEW OF THIS CARD */}
              {/* ───────────────────────────────────────────────────── */}
              <div className="pt-4 border-t border-[#EAE3D4] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#554C3E] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Real-time Live Preview of this Card:</span>
                  </span>
                  <span className="text-[10px] text-stone-500">Updates live as you toggle and edit elements</span>
                </div>
                <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200">
                  <MonographBlockRenderer block={previewDraftBlock} />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF7F2] border-t border-[#EAE3D4] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#DDD5C5] text-xs font-semibold text-stone-700 hover:bg-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveCardOrBlock}
                className="px-5 py-2 rounded-xl bg-[#14291D] hover:bg-[#20442E] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>{editingBlockId ? 'Save Card Changes' : 'Insert Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. Live Storefront Collapsible Accordion Preview */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="pt-6 border-t border-[#DDD5C5] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900">
              <Eye className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#14291D]">
                Storefront Collapsible Accordion Live Preview
              </h4>
              <p className="text-xs text-[#716858]">
                Only one section expands at a time · Rendered live exactly as viewers experience it on the product page.
              </p>
            </div>
          </div>
        </div>

        {/* Live Accordion Rendered */}
        <div className="p-3 sm:p-5 bg-white rounded-2xl border border-[#D5CCBC] shadow-xs">
          <ProductMonographTabs 
            product={previewProduct} 
            isAdmin={false}
          />
        </div>
      </div>
    </div>
  );
};
