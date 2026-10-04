import React, { useState, useEffect } from 'react';
import { 
  HerbalProduct, 
  ProductCategory, 
  ProductForm, 
  IngredientItem, 
  SiteSettings, 
  CategoryItem,
  SortBadgeType,
  ProductCustomField,
  MessageTemplates,
  WeeklyDealItem,
  WeeklyDealsConfig,
  PeopleProfile,
  ProductVariant,
  ProductAssuranceBadges
} from '../types/pharmacy';
import { DEFAULT_MESSAGE_TEMPLATES, formatCustomMessage } from '../utils/messageFormatter';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  ShieldAlert, 
  Check, 
  Search, 
  Eye, 
  CloudUpload, 
  Link as LinkIcon, 
  Phone, 
  MessageSquare, 
  Mail, 
  Building2, 
  FileText,
  Leaf,
  Sparkles,
  Layers,
  Star,
  Flame,
  Trophy,
  Tag,
  DollarSign,
  RotateCcw,
  Rocket,
  Sliders,
  ArrowUp,
  ArrowDown,
  Clock,
  Percent,
  MoveLeft,
  MoveRight,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { backupAllCatalogToFirebase, backupSiteSettingsToFirebase, backupCatalogMetaToFirebase } from '../utils/firebaseSync';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS, SORT_BADGE_OPTIONS, DEFAULT_SITE_SETTINGS } from '../data/herbalProducts';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: HerbalProduct[];
  onAddProduct: (product: HerbalProduct) => void;
  onUpdateProduct: (product: HerbalProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProductsToDefault: () => void;
  onPreviewProduct: (product: HerbalProduct) => void;
  initialProductToEdit?: HerbalProduct | null;
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
  categories: CategoryItem[];
  onUpdateCategories: (categories: CategoryItem[]) => void;
  forms: string[];
  onUpdateForms: (forms: string[]) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProductsToDefault,
  onPreviewProduct,
  initialProductToEdit,
  siteSettings,
  onUpdateSiteSettings,
  categories,
  onUpdateCategories,
  forms,
  onUpdateForms,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'deal_of_week' | 'categories_forms' | 'contacts' | 'people' | 'site_titles' | 'assurance_badges' | 'messages'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<HerbalProduct | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Doctors & Key People (Round Images & Text) Management State
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [personName, setPersonName] = useState('');
  const [personImage, setPersonImage] = useState('');
  const [personRole, setPersonRole] = useState('');
  const [personDetail, setPersonDetail] = useState('');
  const [isAddingPerson, setIsAddingPerson] = useState(false);

  // Deal of the Week state
  const [selectedDealProductId, setSelectedDealProductId] = useState<string>(products[0]?.id || '');
  const [dealCustomTitle, setDealCustomTitle] = useState('');
  const [dealCustomSubtitle, setDealCustomSubtitle] = useState('');
  const [dealPriceInput, setDealPriceInput] = useState<number>(products[0]?.price || 350);
  const [dealBadgeInput, setDealBadgeInput] = useState('Deal of the Week · 30% Off');
  const [dealHighlightInput, setDealHighlightInput] = useState('');
  const [dealHighlights, setDealHighlights] = useState<string[]>(['Direct Apothecary Rate', 'Lab Tested Purity']);
  const [deleteSectionConfirm, setDeleteSectionConfirm] = useState(false);

  // Quick inline add custom category / form state inside product editor
  const [showInlineAddCat, setShowInlineAddCat] = useState(false);
  const [inlineCatLabel, setInlineCatLabel] = useState('');
  const [showInlineAddForm, setShowInlineAddForm] = useState(false);
  const [inlineFormName, setInlineFormName] = useState('');

  // Category & Forms Tab Management states
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');

  const [editingFormIdx, setEditingFormIdx] = useState<number | null>(null);
  const [editingFormName, setEditingFormName] = useState('');
  const [newFormName, setNewFormName] = useState('');

  // Multiple Product Images state
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Structured Ingredients state (Add / Edit / Delete items)
  const [ingredientsList, setIngredientsList] = useState<IngredientItem[]>([
    { herb: 'Amalaki', botanicalName: 'Emblica officinalis', potencyOrMg: '300mg', role: 'Antioxidant Rasayana' },
    { herb: 'Giloy', botanicalName: 'Tinospora cordifolia', potencyOrMg: '200mg', role: 'Immunity Modulator' },
  ]);

  // Product Custom Fields state (Name, Value & Position)
  const [customFieldsList, setCustomFieldsList] = useState<ProductCustomField[]>([]);

  // Product Variants state (Sizes, Units e.g. 100ml, 200ml, 500gm, 1kg, separate images)
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([]);
  const [variantPhotoInput, setVariantPhotoInput] = useState<Record<number, string>>({});

  // Product Form state including Reseller Price, Rating Star, Sort Badge, Stock, Display Order, Assurance Badges
  const [productForm, setProductForm] = useState({
    name: '',
    sanskritName: '',
    category: 'immunity' as ProductCategory,
    categoryLabel: 'Immunity & Respiratory',
    form: 'Churna (Powder)' as ProductForm,
    tagline: '',
    description: '',
    price: 0,
    mrp: 0,
    resellerPrice: 0,
    rating: 4.9,
    reviewsCount: 120,
    sortBadge: 'none' as SortBadgeType,
    hasCustomTag: false,
    customTagText: '',
    customTagBgColor: '#14291D',
    customTagTextColor: '#FFFFFF',
    volumeOrWeight: '100g Pure Powder',
    inStock: true,
    displayOrder: 1,
    badge1Title: 'Ayush & GMP Certified',
    badge1Subtitle: 'Heavy-metal lab verified',
    badge2Title: '100% Pure Botanical',
    badge2Subtitle: 'Zero synthetic fillers',
    customLink: '',
    keyIndications: '',
    primaryBenefits: '',
    ailmentsTreated: '',
    actionMechanism: '',
    doshaEffect: 'Pacifies Vata and Kapha',
    standardDosage: '1 teaspoon twice daily',
    bestTiming: 'After meals with warm water',
    anupanaCarrier: 'Warm water or pure honey',
    duration: '4 to 8 weeks',
    precautions: 'Do not use during pregnancy without Doctor consultation.\nKeep out of reach of children.',
    storageGuideline: 'Store in an airtight container below 25°C away from humidity.',
    ayushLicenseNo: 'AYUSH-DL-2026-HERB-9901',
    batchInfo: 'Batch #VK-2026-01 | Exp: 2028',
  });

  // Helper to normalize siteSettings data
  const normalizeSettings = (settings?: SiteSettings): SiteSettings => {
    const s = settings || DEFAULT_SITE_SETTINGS;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...s,
      contacts: {
        phones: Array.isArray(s.contacts?.phones) && s.contacts.phones.length > 0
          ? s.contacts.phones
          : (s.contacts?.phones && typeof s.contacts.phones === 'object' && Object.values(s.contacts.phones).length > 0
            ? (Object.values(s.contacts.phones) as any[])
            : DEFAULT_SITE_SETTINGS.contacts.phones),
        whatsapps: Array.isArray(s.contacts?.whatsapps) && s.contacts.whatsapps.length > 0
          ? s.contacts.whatsapps
          : (s.contacts?.whatsapps && typeof s.contacts.whatsapps === 'object' && Object.values(s.contacts.whatsapps).length > 0
            ? (Object.values(s.contacts.whatsapps) as any[])
            : DEFAULT_SITE_SETTINGS.contacts.whatsapps),
        emails: Array.isArray(s.contacts?.emails) && s.contacts.emails.length > 0
          ? s.contacts.emails
          : (s.contacts?.emails && typeof s.contacts.emails === 'object' && Object.values(s.contacts.emails).length > 0
            ? (Object.values(s.contacts.emails) as any[])
            : DEFAULT_SITE_SETTINGS.contacts.emails),
      },
      weeklyDeals: {
        enabled: s.weeklyDeals?.enabled ?? true,
        title: s.weeklyDeals?.title || DEFAULT_SITE_SETTINGS.weeklyDeals!.title,
        subtitle: s.weeklyDeals?.subtitle || DEFAULT_SITE_SETTINGS.weeklyDeals!.subtitle,
        badgeText: s.weeklyDeals?.badgeText || DEFAULT_SITE_SETTINGS.weeklyDeals!.badgeText,
        bannerTag: s.weeklyDeals?.bannerTag || DEFAULT_SITE_SETTINGS.weeklyDeals!.bannerTag,
        dealEndNotice: s.weeklyDeals?.dealEndNotice || DEFAULT_SITE_SETTINGS.weeklyDeals!.dealEndNotice,
        items: Array.isArray(s.weeklyDeals?.items)
          ? s.weeklyDeals.items
          : (s.weeklyDeals?.items && typeof s.weeklyDeals.items === 'object'
            ? (Object.values(s.weeklyDeals.items) as WeeklyDealItem[])
            : (DEFAULT_SITE_SETTINGS.weeklyDeals?.items || [])),
      },
      heroBadgeText: s.heroBadgeText || DEFAULT_SITE_SETTINGS.heroBadgeText,
      heroTitle: s.heroTitle || DEFAULT_SITE_SETTINGS.heroTitle,
      heroSubtitle: s.heroSubtitle || DEFAULT_SITE_SETTINGS.heroSubtitle,
      catalogSectionTitle: s.catalogSectionTitle || DEFAULT_SITE_SETTINGS.catalogSectionTitle,
      catalogSectionSubtitle: s.catalogSectionSubtitle || DEFAULT_SITE_SETTINGS.catalogSectionSubtitle,
      peopleBadgeText: s.peopleBadgeText || DEFAULT_SITE_SETTINGS.peopleBadgeText,
      peopleSectionTitle: s.peopleSectionTitle || DEFAULT_SITE_SETTINGS.peopleSectionTitle,
      peopleSectionSubtitle: s.peopleSectionSubtitle || DEFAULT_SITE_SETTINGS.peopleSectionSubtitle,
      peopleSwipeNotice: s.peopleSwipeNotice || DEFAULT_SITE_SETTINGS.peopleSwipeNotice || '',
      peopleList: Array.isArray(s.peopleList) && s.peopleList.length > 0
        ? s.peopleList
        : (s.peopleList && typeof s.peopleList === 'object' && Object.values(s.peopleList).length > 0
          ? (Object.values(s.peopleList) as PeopleProfile[])
          : (DEFAULT_SITE_SETTINGS.peopleList || [])),
      brandLogoImage: s.brandLogoImage ?? DEFAULT_SITE_SETTINGS.brandLogoImage,
      showBrandLogo: s.showBrandLogo !== undefined ? Boolean(s.showBrandLogo) : true,
      productAssuranceBadges: s.productAssuranceBadges || DEFAULT_SITE_SETTINGS.productAssuranceBadges,
    };
  };

  // Site Settings & Multiple Contacts Local Form State
  const [siteForm, setSiteForm] = useState<SiteSettings>(() => normalizeSettings(siteSettings));

  useEffect(() => {
    if (siteSettings) {
      setSiteForm(normalizeSettings(siteSettings));
    }
  }, [siteSettings]);

  const handleUpdateMessageTemplate = (key: keyof MessageTemplates, val: any) => {
    const currentTemplates = siteForm.messageTemplates || DEFAULT_MESSAGE_TEMPLATES;
    setSiteForm({
      ...siteForm,
      messageTemplates: {
        ...currentTemplates,
        [key]: val,
      },
    });
  };

  const rawDeals = siteForm.weeklyDeals?.items;
  const currentWeeklyDeals: WeeklyDealsConfig = {
    enabled: siteForm.weeklyDeals?.enabled ?? true,
    title: siteForm.weeklyDeals?.title || 'Deal of the Week',
    subtitle: siteForm.weeklyDeals?.subtitle || 'Handpicked classical formulations and pure Rasayanas at exclusive apothecary rates.',
    badgeText: siteForm.weeklyDeals?.badgeText || 'Handpicked Specials',
    bannerTag: siteForm.weeklyDeals?.bannerTag || 'Save up to 35% this week',
    dealEndNotice: siteForm.weeklyDeals?.dealEndNotice || 'Offers refresh every Sunday midnight · Authentic botanical guarantee',
    items: Array.isArray(rawDeals)
      ? rawDeals
      : (rawDeals && typeof rawDeals === 'object'
        ? (Object.values(rawDeals) as WeeklyDealItem[])
        : (DEFAULT_SITE_SETTINGS.weeklyDeals?.items || [])),
  };

  const handleUpdateWeeklyDeals = (updates: Partial<WeeklyDealsConfig>) => {
    const updated: WeeklyDealsConfig = {
      ...currentWeeklyDeals,
      ...updates,
    };
    setSiteForm({
      ...siteForm,
      weeklyDeals: updated,
    });
  };

  const handleToggleWeeklyDealsSection = (enabled: boolean) => {
    handleUpdateWeeklyDeals({ enabled });
    setSaveSuccessMsg(enabled ? 'Deal of the Week section enabled!' : 'Deal of the Week section deleted / hidden from website.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeleteSectionConfirm = () => {
    handleUpdateWeeklyDeals({ enabled: false, items: [] });
    setDeleteSectionConfirm(false);
    setSaveSuccessMsg('Deal of the Week section and all items deleted from storefront.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleRestoreDefaultDeals = () => {
    const defaultDeals = DEFAULT_SITE_SETTINGS.weeklyDeals;
    if (defaultDeals) {
      handleUpdateWeeklyDeals(defaultDeals);
      setSaveSuccessMsg('Restored default Deal of the Week formulations!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const handleAddDealProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedDealProductId);
    if (!prod) return;

    const newDealItem: WeeklyDealItem = {
      id: `deal-${Date.now()}`,
      productId: prod.id,
      customTitle: dealCustomTitle.trim() || undefined,
      customSubtitle: dealCustomSubtitle.trim() || undefined,
      dealPrice: Number(dealPriceInput) > 0 ? Number(dealPriceInput) : prod.price,
      dealBadge: dealBadgeInput.trim() || 'Deal of the Week · 30% Off',
      highlightPoints: dealHighlights.filter(h => h.trim().length > 0),
    };

    const newItems = [...currentWeeklyDeals.items, newDealItem];
    handleUpdateWeeklyDeals({ items: newItems, enabled: true });

    // Reset inputs
    setDealCustomTitle('');
    setDealCustomSubtitle('');
    setDealBadgeInput('Deal of the Week · 30% Off');
    setSaveSuccessMsg(`Added "${prod.name}" to Deal of the Week horizontal carousel!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleRemoveDeal = (dealId: string) => {
    const newItems = currentWeeklyDeals.items.filter(item => item.id !== dealId);
    handleUpdateWeeklyDeals({ items: newItems });
    setSaveSuccessMsg('Removed product from Deal of the Week.');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleMoveDeal = (dealId: string, direction: 'left' | 'right') => {
    const items = [...currentWeeklyDeals.items];
    const idx = items.findIndex(i => i.id === dealId);
    if (idx < 0) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[idx];
    items[idx] = items[targetIdx];
    items[targetIdx] = temp;

    handleUpdateWeeklyDeals({ items });
  };

  const handleSaveWeeklyDealsTab = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteSettings(siteForm);
    await backupSiteSettingsToFirebase(siteForm);
    setSaveSuccessMsg('Deal of the Week configuration saved to Firebase and storefront!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  useEffect(() => {
    if (initialProductToEdit) {
      setActiveTab('products');
      startEdit(initialProductToEdit);
    }
  }, [initialProductToEdit]);

  const startCreate = () => {
    setIsCreatingNew(true);
    setEditingProduct(null);
    setImageUrls(['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80']);
    setIngredientsList([
      { herb: 'Shuddha Herb', botanicalName: 'Botanical species', potencyOrMg: '500mg', role: 'Active Herbal Principle' },
    ]);
    // Default initial custom fields
    setCustomFieldsList([
      { id: `cf_${Date.now()}_1`, name: 'Shelf Life', value: '24 Months from Mfd', position: 1 },
      { id: `cf_${Date.now()}_2`, name: 'Extraction Ratio', value: '10:1 Full-Spectrum Decoction', position: 2 },
    ]);
    const firstCat = categories.find((c) => c.id !== 'all') || { id: 'immunity', label: 'Immunity & Respiratory' };
    const firstForm = forms[0] || 'Churna (Powder)';
    setVariantsList([]);
    setVariantPhotoInput({});

    setProductForm({
      name: '',
      sanskritName: '',
      category: firstCat.id,
      categoryLabel: firstCat.label,
      form: firstForm,
      tagline: '',
      description: '',
      price: 0,
      mrp: 0,
      resellerPrice: 0,
      rating: 4.9,
      reviewsCount: 15,
      sortBadge: 'none',
      hasCustomTag: false,
      customTagText: '',
      customTagBgColor: '#14291D',
      customTagTextColor: '#FFFFFF',
      volumeOrWeight: '100g Pure Powder',
      inStock: true,
      displayOrder: products.length + 1,
      badge1Title: 'Ayush & GMP Certified',
      badge1Subtitle: 'Heavy-metal lab verified',
      badge2Title: '100% Pure Botanical',
      badge2Subtitle: 'Zero synthetic fillers',
      customLink: '',
      keyIndications: 'Immunity, Vital Energy, Respiratory Tone',
      primaryBenefits: 'Strengthens innate biological vitality\nCleanses cellular ama toxins\nRestores healthy tissue tone',
      ailmentsTreated: 'Kasa (Cough)\nShwasa (Dyspnea)\nDaurbalya (Debility)',
      actionMechanism: 'Deeply bio-available phytocompounds nourish Rasa and Rakta dhatus.',
      doshaEffect: 'Tridosha balancing (Vata-Pitta-Kapha)',
      standardDosage: '1 teaspoon (3g to 5g) twice daily',
      bestTiming: 'Post-meals with lukewarm water or warm milk',
      anupanaCarrier: 'Warm water or raw organic honey',
      duration: '6 to 12 weeks',
      precautions: 'Use under medical supervision if pregnant.',
      storageGuideline: 'Reseal airtight after opening. Store away from moisture.',
      ayushLicenseNo: `AYUSH-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      batchInfo: `Batch #AUR-2026-${Math.floor(10 + Math.random() * 90)} | Exp: 2028`,
    });
  };

  const startEdit = (p: HerbalProduct) => {
    setIsCreatingNew(false);
    setEditingProduct(p);
    
    // Setup multiple images
    const allImgs = p.images && p.images.length > 0 ? [...p.images] : [p.image];
    setImageUrls(allImgs);

    // Setup structured ingredients
    setIngredientsList(
      p.keyIngredients && p.keyIngredients.length > 0
        ? [...p.keyIngredients]
        : [{ herb: 'Herb Extract', botanicalName: 'Herbal species', potencyOrMg: '500mg', role: 'Active' }]
    );

    // Setup custom fields
    setCustomFieldsList(
      p.customFields && p.customFields.length > 0
        ? [...p.customFields].sort((a, b) => a.position - b.position)
        : []
    );

    // Setup variants
    setVariantsList(
      p.variants && p.variants.length > 0
        ? p.variants.map((v) => ({
            ...v,
            images: Array.isArray(v.images) && v.images.length > 0 ? v.images : (v.image ? [v.image] : []),
          }))
        : []
    );
    setVariantPhotoInput({});

    setProductForm({
      name: p.name,
      sanskritName: p.sanskritName,
      category: p.category,
      categoryLabel: p.categoryLabel,
      form: p.form,
      tagline: p.tagline,
      description: p.description,
      price: p.price,
      mrp: p.mrp,
      resellerPrice: p.resellerPrice !== undefined ? p.resellerPrice : Math.round(p.price * 0.75),
      rating: p.rating || 4.9,
      reviewsCount: p.reviewsCount || 1,
      sortBadge: p.sortBadge || 'none',
      hasCustomTag: Boolean(p.customTag && p.customTag.text),
      customTagText: p.customTag?.text || '',
      customTagBgColor: p.customTag?.bgColor || '#14291D',
      customTagTextColor: p.customTag?.textColor || '#FFFFFF',
      volumeOrWeight: p.volumeOrWeight,
      inStock: p.inStock !== false,
      displayOrder: p.displayOrder !== undefined ? p.displayOrder : (products.indexOf(p) + 1),
      badge1Title: p.assuranceBadges?.badge1Title || siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified',
      badge1Subtitle: p.assuranceBadges?.badge1Subtitle || siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified',
      badge2Title: p.assuranceBadges?.badge2Title || siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical',
      badge2Subtitle: p.assuranceBadges?.badge2Subtitle || siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers',
      customLink: p.customLink || '',
      keyIndications: Array.isArray(p.keyIndications) ? p.keyIndications.join(', ') : '',
      primaryBenefits: Array.isArray(p.detailedUses?.primaryBenefits) ? p.detailedUses.primaryBenefits.join('\n') : '',
      ailmentsTreated: Array.isArray(p.detailedUses?.ailmentsTreated) ? p.detailedUses.ailmentsTreated.join('\n') : '',
      actionMechanism: p.detailedUses?.actionMechanism || '',
      doshaEffect: p.detailedUses?.doshaEffect || '',
      standardDosage: p.dosageAndAnupana?.standardDosage || '',
      bestTiming: p.dosageAndAnupana?.bestTiming || '',
      anupanaCarrier: p.dosageAndAnupana?.anupanaCarrier || '',
      duration: p.dosageAndAnupana?.duration || '',
      precautions: Array.isArray(p.precautionsAndContraindications) ? p.precautionsAndContraindications.join('\n') : '',
      storageGuideline: p.storageGuideline || '',
      ayushLicenseNo: p.ayushLicenseNo || '',
      batchInfo: p.batchInfo || '',
    });
  };

  // Image Array helpers
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index <= 0 || index >= imageUrls.length) return;
    const copy = [...imageUrls];
    const [selected] = copy.splice(index, 1);
    copy.unshift(selected);
    setImageUrls(copy);
  };

  const handleRemoveImageUrl = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // Variant Separate Photos Helpers (Supports multiple links and add button)
  const handleAddVariantPhoto = (vIdx: number) => {
    const raw = (variantPhotoInput[vIdx] || '').trim();
    if (!raw) return;
    const links = raw.split(/[\n,]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (links.length === 0) return;
    const updated = [...variantsList];
    const currentImgs = Array.isArray(updated[vIdx].images) && updated[vIdx].images!.length > 0
      ? [...updated[vIdx].images!]
      : (updated[vIdx].image ? [updated[vIdx].image!] : []);

    links.forEach((link) => {
      if (!currentImgs.includes(link)) {
        currentImgs.push(link);
      }
    });

    updated[vIdx].images = currentImgs;
    updated[vIdx].image = currentImgs[0] || '';
    setVariantsList(updated);
    setVariantPhotoInput((prev) => ({ ...prev, [vIdx]: '' }));
  };

  const handleRemoveVariantPhoto = (vIdx: number, pIdx: number) => {
    const updated = [...variantsList];
    const currentImgs = Array.isArray(updated[vIdx].images)
      ? [...updated[vIdx].images!]
      : (updated[vIdx].image ? [updated[vIdx].image!] : []);
    currentImgs.splice(pIdx, 1);
    updated[vIdx].images = currentImgs;
    updated[vIdx].image = currentImgs[0] || '';
    setVariantsList(updated);
  };

  // Ingredient Helpers
  const handleAddIngredient = () => {
    setIngredientsList([
      ...ingredientsList,
      { herb: '', botanicalName: '', potencyOrMg: '100mg', role: 'Active' },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof IngredientItem, value: string) => {
    const updated = [...ingredientsList];
    updated[index] = { ...updated[index], [field]: value };
    setIngredientsList(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredientsList.length <= 1) return;
    setIngredientsList(ingredientsList.filter((_, i) => i !== index));
  };

  // Custom Fields Helpers (Name, Value & Position Order)
  const handleAddCustomField = (targetSection: any = 'all') => {
    const nextPos = customFieldsList.length > 0
      ? Math.max(...customFieldsList.map((f) => f.position)) + 1
      : 1;
    setCustomFieldsList([
      ...customFieldsList,
      { 
        id: `cf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, 
        name: '', 
        value: '', 
        position: nextPos,
        section: targetSection
      },
    ]);
  };

  const handleUpdateCustomField = (index: number, key: 'name' | 'value' | 'position' | 'section', val: any) => {
    const updated = [...customFieldsList];
    updated[index] = { ...updated[index], [key]: val };
    setCustomFieldsList(updated);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFieldsList(customFieldsList.filter((_, i) => i !== index));
  };

  const handleMoveCustomField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === customFieldsList.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...customFieldsList];
    const currentPos = copy[index].position;
    const targetPos = copy[targetIndex].position;
    copy[index].position = targetPos;
    copy[targetIndex].position = currentPos;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setCustomFieldsList(copy);
  };

  // Quick inline add Category
  const handleInlineAddCategory = () => {
    if (!inlineCatLabel.trim()) return;
    const generatedId = inlineCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 24);
    const existing = categories.find((c) => c.id === generatedId || c.label.toLowerCase() === inlineCatLabel.trim().toLowerCase());
    if (!existing) {
      const newCat: CategoryItem = { id: generatedId, label: inlineCatLabel.trim() };
      const updated = [...categories, newCat];
      onUpdateCategories(updated);
      setProductForm({
        ...productForm,
        category: newCat.id,
        categoryLabel: newCat.label,
      });
    } else {
      setProductForm({
        ...productForm,
        category: existing.id,
        categoryLabel: existing.label,
      });
    }
    setInlineCatLabel('');
    setShowInlineAddCat(false);
  };

  // Quick inline add Form
  const handleInlineAddForm = () => {
    if (!inlineFormName.trim()) return;
    const trimmed = inlineFormName.trim();
    if (!forms.includes(trimmed)) {
      const updated = [...forms, trimmed];
      onUpdateForms(updated);
    }
    setProductForm({
      ...productForm,
      form: trimmed,
    });
    setInlineFormName('');
    setShowInlineAddForm(false);
  };

  // Category Manager Tab Actions
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    const id = newCatId.trim() || newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    if (categories.some((c) => c.id === id)) {
      alert(`Category with ID "${id}" already exists. Please choose another.`);
      return;
    }
    const updated = [...categories, { id, label: newCatLabel.trim() }];
    onUpdateCategories(updated);
    setNewCatId('');
    setNewCatLabel('');
    setSaveSuccessMsg(`Category "${newCatLabel.trim()}" created successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveEditCategory = (id: string) => {
    if (!editingCatLabel.trim()) return;
    const updated = categories.map((c) => c.id === id ? { ...c, label: editingCatLabel.trim() } : c);
    onUpdateCategories(updated);
    setEditingCatId(null);
    setEditingCatLabel('');
    setSaveSuccessMsg(`Category updated!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeleteCategory = (id: string) => {
    if (id === 'all') {
      alert('Cannot delete "All Products" root category.');
      return;
    }
    if (categories.length <= 2) {
      alert('Must keep at least one category.');
      return;
    }
    const updated = categories.filter((c) => c.id !== id);
    onUpdateCategories(updated);
    setSaveSuccessMsg(`Category deleted!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Form Manager Tab Actions
  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormName.trim()) return;
    if (forms.includes(newFormName.trim())) {
      alert('This formulation form already exists.');
      return;
    }
    const updated = [...forms, newFormName.trim()];
    onUpdateForms(updated);
    setNewFormName('');
    setSaveSuccessMsg(`Formulation Form "${newFormName.trim()}" added!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveEditForm = (idx: number) => {
    if (!editingFormName.trim()) return;
    const updated = [...forms];
    updated[idx] = editingFormName.trim();
    onUpdateForms(updated);
    setEditingFormIdx(null);
    setEditingFormName('');
    setSaveSuccessMsg(`Formulation form updated!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeleteForm = (idx: number) => {
    if (forms.length <= 1) {
      alert('Must keep at least one formulation form.');
      return;
    }
    const updated = forms.filter((_, i) => i !== idx);
    onUpdateForms(updated);
    setSaveSuccessMsg(`Formulation form deleted!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Contact Multiple Items Helpers
  const handleAddPhone = () => {
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        phones: [
          ...siteForm.contacts.phones,
          { id: `p_${Date.now()}`, label: 'Helpline Desk', number: '+91 98765 43210' },
        ],
      },
    });
  };

  const handleUpdatePhone = (index: number, field: 'label' | 'number', val: string) => {
    const updated = [...siteForm.contacts.phones];
    updated[index] = { ...updated[index], [field]: val };
    setSiteForm({
      ...siteForm,
      contacts: { ...siteForm.contacts, phones: updated },
    });
  };

  const handleRemovePhone = (index: number) => {
    if (siteForm.contacts.phones.length <= 1) return;
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        phones: siteForm.contacts.phones.filter((_, i) => i !== index),
      },
    });
  };

  const handleAddWhatsApp = () => {
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        whatsapps: [
          ...siteForm.contacts.whatsapps,
          { id: `w_${Date.now()}`, label: 'WhatsApp Order', number: '919876543210', displayNumber: '+91 98765 43210' },
        ],
      },
    });
  };

  const handleUpdateWhatsApp = (index: number, field: 'label' | 'number' | 'displayNumber', val: string) => {
    const updated = [...siteForm.contacts.whatsapps];
    updated[index] = { ...updated[index], [field]: val };
    setSiteForm({
      ...siteForm,
      contacts: { ...siteForm.contacts, whatsapps: updated },
    });
  };

  const handleRemoveWhatsApp = (index: number) => {
    if (siteForm.contacts.whatsapps.length <= 1) return;
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        whatsapps: siteForm.contacts.whatsapps.filter((_, i) => i !== index),
      },
    });
  };

  const handleAddEmail = () => {
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        emails: [
          ...siteForm.contacts.emails,
          { id: `e_${Date.now()}`, label: 'Support Desk', email: 'care@aurashka.com' },
        ],
      },
    });
  };

  const handleUpdateEmail = (index: number, field: 'label' | 'email', val: string) => {
    const updated = [...siteForm.contacts.emails];
    updated[index] = { ...updated[index], [field]: val };
    setSiteForm({
      ...siteForm,
      contacts: { ...siteForm.contacts, emails: updated },
    });
  };

  const handleRemoveEmail = (index: number) => {
    if (siteForm.contacts.emails.length <= 1) return;
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        emails: siteForm.contacts.emails.filter((_, i) => i !== index),
      },
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanImgs = imageUrls.map((u) => u.trim()).filter(Boolean);
    const primaryImg = cleanImgs[0] || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80';

    const parsedIndications = productForm.keyIndications
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedBenefits = productForm.primaryBenefits
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedAilments = productForm.ailmentsTreated
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedPrecautions = productForm.precautions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const selectedCatObj = categories.find((c) => c.id === productForm.category);
    const catLabel = selectedCatObj ? selectedCatObj.label : 'Herbal Formulation';

    // Cleaned & sorted custom fields with section target
    const validCustomFields: ProductCustomField[] = customFieldsList
      .filter((cf) => cf.name.trim() && cf.value.trim())
      .map((cf) => ({
        id: cf.id,
        name: cf.name.trim(),
        value: cf.value.trim(),
        position: Number(cf.position) || 1,
        section: cf.section || 'all',
      }))
      .sort((a, b) => a.position - b.position);

    // Cleaned variants with multi-image support
    const validVariants: ProductVariant[] = variantsList
      .filter((v) => v.size && v.unit)
      .map((v) => {
        const varImgs = Array.isArray(v.images)
          ? v.images.filter((img) => typeof img === 'string' && img.trim().length > 0)
          : (v.image && v.image.trim() ? [v.image.trim()] : []);
        const primaryVarImg = varImgs[0] || v.image?.trim() || undefined;

        return {
          id: v.id || `var_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          size: v.size.trim(),
          unit: v.unit.trim(),
          price: Number(v.price) || 0,
          mrp: Number(v.mrp) || Number(v.price) || 0,
          resellerPrice: v.resellerPrice !== undefined ? Number(v.resellerPrice) : undefined,
          image: primaryVarImg,
          images: varImgs,
          inStock: v.inStock !== false,
        };
      });

    // Derive base price, MRP, and reseller rate from the first variant if available
    const derivedPrice = validVariants.length > 0 ? validVariants[0].price : (Number(productForm.price) || 0);
    const derivedMrp = validVariants.length > 0 ? (validVariants[0].mrp || validVariants[0].price) : (Number(productForm.mrp) || 0);
    const derivedReseller = validVariants.length > 0 ? validVariants[0].resellerPrice : (Number(productForm.resellerPrice) || undefined);

    // Custom manually set tag
    const customTag = (productForm.hasCustomTag && productForm.customTagText.trim())
      ? {
          text: productForm.customTagText.trim(),
          bgColor: productForm.customTagBgColor || '#14291D',
          textColor: productForm.customTagTextColor || '#FFFFFF',
        }
      : undefined;

    const assuranceBadges: ProductAssuranceBadges = {
      badge1Title: productForm.badge1Title.trim() || 'Ayush & GMP Certified',
      badge1Subtitle: productForm.badge1Subtitle.trim() || 'Heavy-metal lab verified',
      badge2Title: productForm.badge2Title.trim() || '100% Pure Botanical',
      badge2Subtitle: productForm.badge2Subtitle.trim() || 'Zero synthetic fillers',
    };

    if (isCreatingNew) {
      const newProd: HerbalProduct = {
        id: `prod_${Date.now()}`,
        name: productForm.name.trim() || 'New Herbal Medicine',
        sanskritName: productForm.sanskritName.trim() || 'दिव्य हर्बल रस',
        category: productForm.category,
        categoryLabel: catLabel,
        form: productForm.form,
        tagline: productForm.tagline.trim() || 'Standardized herbal preparation',
        description: productForm.description.trim() || 'Authentic herbal formulation.',
        price: derivedPrice,
        mrp: derivedMrp,
        resellerPrice: derivedReseller,
        rating: Math.min(5, Math.max(1, Number(productForm.rating) || 4.9)),
        reviewsCount: Number(productForm.reviewsCount) || 1,
        sortBadge: productForm.sortBadge || 'none',
        customTag,
        volumeOrWeight: productForm.volumeOrWeight.trim() || (validVariants.length > 0 ? `${validVariants[0].size} ${validVariants[0].unit}` : '100g'),
        inStock: Boolean(productForm.inStock),
        displayOrder: Number(productForm.displayOrder) || (products.length + 1),
        variants: validVariants,
        assuranceBadges,
        image: primaryImg,
        images: cleanImgs,
        customLink: productForm.customLink.trim() || undefined,
        customFields: validCustomFields,
        keyIndications: parsedIndications.length ? parsedIndications : ['General Wellness'],
        detailedUses: {
          primaryBenefits: parsedBenefits.length ? parsedBenefits : ['Nourishes vital biological tissues'],
          ailmentsTreated: parsedAilments.length ? parsedAilments : ['Daurbalya (Debility)'],
          actionMechanism: productForm.actionMechanism || 'Supports tissue homeostasis.',
          doshaEffect: productForm.doshaEffect || 'Tridosha balancing',
        },
        dosageAndAnupana: {
          standardDosage: productForm.standardDosage,
          bestTiming: productForm.bestTiming,
          anupanaCarrier: productForm.anupanaCarrier,
          duration: productForm.duration,
        },
        keyIngredients: ingredientsList.filter((i) => i.herb.trim()),
        precautionsAndContraindications: parsedPrecautions.length ? parsedPrecautions : ['Use under medical advice.'],
        storageGuideline: productForm.storageGuideline,
        ayushLicenseNo: productForm.ayushLicenseNo,
        batchInfo: productForm.batchInfo,
      };

      onAddProduct(newProd);
      setSaveSuccessMsg(`Product "${newProd.name}" added and synced to Firebase!`);
    } else if (editingProduct) {
      const updatedProd: HerbalProduct = {
        ...editingProduct,
        name: productForm.name.trim(),
        sanskritName: productForm.sanskritName.trim(),
        category: productForm.category,
        categoryLabel: catLabel,
        form: productForm.form,
        tagline: productForm.tagline.trim(),
        description: productForm.description.trim(),
        price: derivedPrice,
        mrp: derivedMrp,
        resellerPrice: derivedReseller,
        rating: Math.min(5, Math.max(1, Number(productForm.rating) || 4.9)),
        reviewsCount: Number(productForm.reviewsCount),
        sortBadge: productForm.sortBadge || 'none',
        customTag,
        volumeOrWeight: productForm.volumeOrWeight.trim() || (validVariants.length > 0 ? `${validVariants[0].size} ${validVariants[0].unit}` : editingProduct.volumeOrWeight),
        inStock: Boolean(productForm.inStock),
        displayOrder: Number(productForm.displayOrder) || (editingProduct.displayOrder ?? 1),
        variants: validVariants,
        assuranceBadges,
        image: primaryImg,
        images: cleanImgs,
        customLink: productForm.customLink.trim() || undefined,
        customFields: validCustomFields,
        keyIndications: parsedIndications,
        detailedUses: {
          primaryBenefits: parsedBenefits,
          ailmentsTreated: parsedAilments,
          actionMechanism: productForm.actionMechanism,
          doshaEffect: productForm.doshaEffect,
        },
        dosageAndAnupana: {
          standardDosage: productForm.standardDosage,
          bestTiming: productForm.bestTiming,
          anupanaCarrier: productForm.anupanaCarrier,
          duration: productForm.duration,
        },
        keyIngredients: ingredientsList.filter((i) => i.herb.trim()),
        precautionsAndContraindications: parsedPrecautions,
        storageGuideline: productForm.storageGuideline,
        ayushLicenseNo: productForm.ayushLicenseNo,
        batchInfo: productForm.batchInfo,
      };

      onUpdateProduct(updatedProd);
      setSaveSuccessMsg(`Product "${updatedProd.name}" updated & saved to Firebase!`);
    }

    setTimeout(() => setSaveSuccessMsg(null), 3000);
    setIsCreatingNew(false);
    setEditingProduct(null);
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteSettings(siteForm);
    await backupSiteSettingsToFirebase(siteForm);
    setSaveSuccessMsg('Website titles, multiple contacts & info updated and saved to Firebase!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleBackupAll = async () => {
    setIsBackingUp(true);
    await backupAllCatalogToFirebase(products);
    await backupSiteSettingsToFirebase(siteForm);
    await backupCatalogMetaToFirebase({ categories, forms });
    setIsBackingUp(false);
    setSaveSuccessMsg('Saved all products, multiple images, categories, forms, contacts & titles to Firebase!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Move product up (closer to top of list)
  const handleMoveProductUp = (prod: HerbalProduct) => {
    const sorted = [...products].sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999));
    const currentIndex = sorted.findIndex((p) => p.id === prod.id);
    if (currentIndex <= 0) return;
    const prev = sorted[currentIndex - 1];

    const prevOrder = prev.displayOrder ?? currentIndex;
    const currentOrder = prod.displayOrder ?? (currentIndex + 1);

    onUpdateProduct({ ...prod, displayOrder: prevOrder });
    onUpdateProduct({ ...prev, displayOrder: currentOrder });
    setSaveSuccessMsg(`Moved "${prod.name}" up towards top of list!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Move product down (towards bottom of list)
  const handleMoveProductDown = (prod: HerbalProduct) => {
    const sorted = [...products].sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999));
    const currentIndex = sorted.findIndex((p) => p.id === prod.id);
    if (currentIndex === -1 || currentIndex >= sorted.length - 1) return;
    const next = sorted[currentIndex + 1];

    const currentOrder = prod.displayOrder ?? (currentIndex + 1);
    const nextOrder = next.displayOrder ?? (currentIndex + 2);

    onUpdateProduct({ ...prod, displayOrder: nextOrder });
    onUpdateProduct({ ...next, displayOrder: currentOrder });
    setSaveSuccessMsg(`Moved "${prod.name}" down!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Quick In-Stock Toggle
  const handleToggleProductStock = (prod: HerbalProduct) => {
    const updated = { ...prod, inStock: !prod.inStock };
    onUpdateProduct(updated);
    setSaveSuccessMsg(`"${prod.name}" is now ${updated.inStock ? 'IN STOCK' : 'OUT OF STOCK'}`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const filteredProducts = React.useMemo(() => {
    const list = [...products].sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999));
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sanskritName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[94vh] bg-[#FBF9F5] border border-[#DCD5C5] rounded-2xl shadow-2xl text-[#1E2922] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#14291D] text-white border-b border-[#21432E] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#B4741E] text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-white">
                  Aurashka · Complete Admin App
                </h3>
                <span className="text-[11px] font-semibold bg-[#27533B] text-[#A5D6B6] px-2 py-0.5 rounded-full">
                  Admin: {currentUser?.email}
                </span>
              </div>
              <p className="text-xs text-[#BED4C7]">
                Manage Products, Reseller Rates, Rating Stars, Custom Fields, Categories & Forms, and Contacts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackupAll}
              disabled={isBackingUp}
              className="px-3 py-1.5 text-xs font-semibold text-[#183624] bg-[#E7EFEA] hover:bg-[#d8e8de] rounded-lg border border-[#A5D6B6] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
              title="Save all image links, texts & contacts to Firebase"
            >
              <CloudUpload className="w-4 h-4 text-[#2C5E43]" />
              <span>{isBackingUp ? 'Saving...' : 'Save All on Firebase'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile / Compact Quick Switcher Dropdown (Never Hidden) */}
        <div className="md:hidden px-4 py-2.5 bg-[#F2EDE1] border-b border-[#DCD5C5] flex items-center justify-between gap-2 shrink-0">
          <label className="text-xs font-bold text-[#14291D] shrink-0 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>Admin Section:</span>
          </label>
          <select
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value as any);
              setIsCreatingNew(false);
              setEditingProduct(null);
            }}
            className="flex-1 py-1.5 px-3 bg-white border border-[#C8BEAB] rounded-lg text-xs font-semibold text-[#183624] shadow-2xs focus:outline-hidden focus:border-[#2C5E43] cursor-pointer"
          >
            <option value="products">🛍️ Products & Reseller Rates ({products.length})</option>
            <option value="deal_of_week">🔥 Deal of the Week ({currentWeeklyDeals.items.length} deals{currentWeeklyDeals.enabled ? '' : ' - Hidden'})</option>
            <option value="categories_forms">🗂️ Categories & Forms Manager</option>
            <option value="contacts">📞 Multiple Contacts (Phones, WhatsApp, Emails)</option>
            <option value="site_titles">🏷️ Website Titles & Banner Texts</option>
            <option value="assurance_badges">🛡️ Ayush & Quality Assurance Badges (Product View)</option>
            <option value="messages">💬 WhatsApp & Email Custom Messages</option>
          </select>
        </div>

        {/* Tab Switcher - Responsive Wrapped Pills (Never Hidden on any screen) */}
        <div className="border-b border-[#E7DFD1] bg-[#FAF8F5] px-3 sm:px-6 py-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('products');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'products' ? 'text-amber-300' : 'text-[#2C5E43]'}`} />
              <span>Products & Rates ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('deal_of_week');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'deal_of_week'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${activeTab === 'deal_of_week' ? 'text-amber-400' : 'text-amber-600'}`} />
              <span>Deal of the Week</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                !currentWeeklyDeals.enabled 
                  ? 'bg-rose-100 text-rose-800' 
                  : activeTab === 'deal_of_week' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
              }`}>
                {!currentWeeklyDeals.enabled ? 'Off' : currentWeeklyDeals.items.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('categories_forms');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'categories_forms'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${activeTab === 'categories_forms' ? 'text-amber-300' : 'text-[#B4741E]'}`} />
              <span>Categories & Forms</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('contacts');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'contacts'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <Phone className={`w-3.5 h-3.5 ${activeTab === 'contacts' ? 'text-emerald-300' : 'text-[#2C5E43]'}`} />
              <span>Multiple Contacts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('people');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'people'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === 'people' ? 'text-emerald-300' : 'text-[#2C5E43]'}`} />
              <span>Doctors & Key People</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('site_titles');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'site_titles'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${activeTab === 'site_titles' ? 'text-amber-300' : 'text-[#2C5E43]'}`} />
              <span>Titles & Banner Texts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('assurance_badges');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'assurance_badges'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'assurance_badges' ? 'text-amber-300' : 'text-[#2C5E43]'}`} />
              <span>Ayush & Assurance Badges</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('messages');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${activeTab === 'messages' ? 'text-[#25D366]' : 'text-[#25D366]'}`} />
              <span>WhatsApp & Email Messages</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-700 text-white text-xs px-6 py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-200" />
              {saveSuccessMsg}
            </span>
            <button onClick={() => setSaveSuccessMsg(null)} className="text-white/80 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <>
            {/* Products Sub-Bar */}
            {!isCreatingNew && !editingProduct && (
              <div className="p-4 sm:px-6 bg-[#FAF8F5] border-b border-[#E7DFD1] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#887E6D]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search formulation title, herb, or category..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onResetProductsToDefault}
                    className="px-3 py-1.5 text-xs font-medium text-[#645A4B] hover:text-[#14291D] hover:bg-[#EFEAE0] rounded-lg border border-[#DDD5C5] transition-colors cursor-pointer"
                  >
                    Reset Default Catalog
                  </button>

                  <button
                    onClick={startCreate}
                    className="px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Add New Product</span>
                  </button>
                </div>
              </div>
            )}

            {/* Products Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {(isCreatingNew || editingProduct) ? (
                /* Full Comprehensive Product Form */
                <div className="bg-white p-6 rounded-xl border border-[#D5CCBC] shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#2C5E43] font-semibold">
                        {isCreatingNew ? 'Create New Custom Formulation' : `Editing: ${editingProduct?.name}`}
                      </span>
                      <h4 className="font-serif text-xl font-bold text-[#14291D]">
                        Edit Product Titles, Images, Reseller Price, Custom Fields & Badges
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setEditingProduct(null);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-[#645A4B] hover:bg-[#EFEAE0] rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
                    {/* Titles, Custom Link, Display Order & In-Stock Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Product Commercial Title <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43]"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Sanskrit Name / Botanical Title <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.sanskritName}
                          onChange={(e) => setProductForm({ ...productForm, sanskritName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43]"
                        />
                      </div>

                      {/* Display Order / Rank in vertical list */}
                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1 flex items-center justify-between">
                          <span>Catalog Display Order</span>
                          <span className="text-[10px] text-emerald-800 font-bold">1 = Top of list</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={productForm.displayOrder}
                          onChange={(e) => setProductForm({ ...productForm, displayOrder: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] font-mono font-bold"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block font-medium text-[#2B251D] mb-1 flex items-center gap-1">
                          <LinkIcon className="w-3.5 h-3.5 text-[#2C5E43]" />
                          <span>Custom Direct Buy / Order Link (Optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://wa.me/919876543210 or custom link"
                          value={productForm.customLink}
                          onChange={(e) => setProductForm({ ...productForm, customLink: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] font-mono text-[11px]"
                        />
                      </div>

                      {/* Product Stock Availability Toggle */}
                      <div className="flex items-center">
                        <label className={`w-full p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                          productForm.inStock 
                            ? 'bg-[#EBF5EF] border-[#BBDDC7] text-[#183624]' 
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                          <input
                            type="checkbox"
                            checked={productForm.inStock}
                            onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="font-bold block text-xs">
                              {productForm.inStock ? '✅ In Stock (Ready to Order)' : '❌ Out of Stock'}
                            </span>
                            <span className="text-[10px] opacity-80">
                              {productForm.inStock ? 'Available for immediate dispatch' : 'Disabled for orders'}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* CATEGORY & FORM SELECTION (WITH INLINE CUSTOM ADD BUTTONS) */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category Selection */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block font-semibold text-[#2B251D]">
                            Product Category <span className="text-red-600">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowInlineAddCat(!showInlineAddCat)}
                            className="text-[#2C5E43] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Custom Category</span>
                          </button>
                        </div>

                        {showInlineAddCat ? (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#BBDDC7]">
                            <input
                              type="text"
                              value={inlineCatLabel}
                              onChange={(e) => setInlineCatLabel(e.target.value)}
                              placeholder="New Category (e.g. Renal & Kidney Health)"
                              className="flex-1 px-2.5 py-1 text-xs border border-[#DDD5C5] rounded"
                            />
                            <button
                              type="button"
                              onClick={handleInlineAddCategory}
                              className="px-2.5 py-1 bg-[#14291D] text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowInlineAddCat(false)}
                              className="px-2 py-1 text-[#645A4B] text-xs hover:bg-gray-100 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <select
                            value={productForm.category}
                            onChange={(e) => {
                              const val = e.target.value;
                              const obj = categories.find((c) => c.id === val);
                              setProductForm({
                                ...productForm,
                                category: val,
                                categoryLabel: obj ? obj.label : 'Herbal Medicine',
                              });
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                          >
                            {categories.filter((c) => c.id !== 'all').map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                        )}
                        <span className="text-[10px] text-[#786D5C] block">
                          Tip: You can also manage/edit/delete all preset categories from the "Categories & Forms Manager" tab above.
                        </span>
                      </div>

                      {/* Formulation Form Selection */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block font-semibold text-[#2B251D]">
                            Formulation Form <span className="text-red-600">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowInlineAddForm(!showInlineAddForm)}
                            className="text-[#2C5E43] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Custom Form</span>
                          </button>
                        </div>

                        {showInlineAddForm ? (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#BBDDC7]">
                            <input
                              type="text"
                              value={inlineFormName}
                              onChange={(e) => setInlineFormName(e.target.value)}
                              placeholder="New Form (e.g. Granules, Syrup)"
                              className="flex-1 px-2.5 py-1 text-xs border border-[#DDD5C5] rounded"
                            />
                            <button
                              type="button"
                              onClick={handleInlineAddForm}
                              className="px-2.5 py-1 bg-[#14291D] text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowInlineAddForm(false)}
                              className="px-2 py-1 text-[#645A4B] text-xs hover:bg-gray-100 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <select
                            value={productForm.form}
                            onChange={(e) => setProductForm({ ...productForm, form: e.target.value as ProductForm })}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                          >
                            {forms.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        )}
                        <span className="text-[10px] text-[#786D5C] block">
                          E.g. Churna, Tablet, Taila, Liquid, Resin, Veg Capsule, or custom.
                        </span>
                      </div>
                    </div>

                    {/* RATING STARS, REVIEWS & CUSTOM PRODUCT TAGS */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            Rating Stars, Reviews & Custom Product Tags
                          </h5>
                        </div>
                        <span className="text-[11px] text-[#2C5E43] font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Pricing managed via Variants (starts ₹0)
                        </span>
                      </div>

                      {/* Notice about Variant-based pricing */}
                      <div className="p-2.5 bg-white rounded-lg border border-[#D5CCBC] flex items-center justify-between gap-3 text-xs text-[#5B5141]">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#2C5E43] shrink-0" />
                          <span>
                            <strong>Note:</strong> Product Retail Price, MRP & Reseller Rate are configured exclusively inside <strong>Size & Packaging Variants</strong> below (starts from ₹0).
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#14291D] shrink-0">
                          {variantsList.length > 0 ? `${variantsList.length} Variant(s) set` : 'Single default size'}
                        </span>
                      </div>

                      {/* Rating Stars & Reviews Count */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* RATING STARS (BRANDED SVG ICONS) */}
                        <div className="p-3 bg-white rounded-xl border border-[#DDD5C5]">
                          <label className="block font-medium text-[#2B251D] mb-1 flex items-center justify-between">
                            <span className="text-xs font-semibold">Rating Stars (1.0 to 5.0)</span>
                            <span className="text-amber-600 font-bold flex items-center gap-0.5 text-xs">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{productForm.rating}</span>
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="5.0"
                            required
                            value={productForm.rating}
                            onChange={(e) => setProductForm({ ...productForm, rating: parseFloat(e.target.value) || 5 })}
                            className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-mono font-bold"
                          />
                          <div className="flex text-amber-500 text-xs mt-1.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.round(productForm.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-gray-200 text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* REVIEWS COUNT */}
                        <div className="p-3 bg-white rounded-xl border border-[#DDD5C5]">
                          <label className="block font-medium text-[#2B251D] mb-1 text-xs font-semibold">
                            Total Customer Reviews Count
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={productForm.reviewsCount}
                            onChange={(e) => setProductForm({ ...productForm, reviewsCount: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                          <span className="text-[10px] text-[#786D5C] mt-1 block">
                            Displayed on product card & monograph header (e.g. {formatCompactNumber(productForm.reviewsCount || 0)} reviews)
                          </span>
                        </div>
                      </div>

                      {/* SORT BADGE SELECTOR (BRANDED LUCIDE ICONS, NO EMOJIS) */}
                      <div className="pt-2 border-t border-[#EAE3D4]">
                        <label className="block font-semibold text-[#2B251D] mb-1.5 text-xs">
                          Catalog Standard Sort Category
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {SORT_BADGE_OPTIONS.map((opt) => {
                            const isSelected = productForm.sortBadge === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setProductForm({ ...productForm, sortBadge: opt.id })}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs'
                                    : 'bg-white text-[#4A3F2F] border-[#DDD5C5] hover:bg-[#F2ECE1]'
                                }`}
                              >
                                {opt.id === 'trending' && <Flame className="w-3.5 h-3.5 text-red-500" />}
                                {opt.id === 'top_seller' && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                                {opt.id === 'best_deal' && <Tag className="w-3.5 h-3.5 text-emerald-600" />}
                                {opt.id === 'featured' && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                                {opt.id === 'new_launch' && <Rocket className="w-3.5 h-3.5 text-blue-500" />}
                                {opt.id === 'none' && <Check className="w-3.5 h-3.5 text-gray-400" />}
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* CUSTOM MANUAL TAG SETTING (PRESETS OR TYPE MANUALLY WITH BG & TEXT COLOR SELECTION) */}
                      <div className="p-3.5 bg-white rounded-xl border border-[#D5CCBC] space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#14291D]">
                            <input
                              type="checkbox"
                              checked={productForm.hasCustomTag}
                              onChange={(e) => setProductForm({ ...productForm, hasCustomTag: e.target.checked })}
                              className="rounded border-[#DDD5C5] text-[#2C5E43] focus:ring-[#2C5E43] cursor-pointer"
                            />
                            <span>Add Custom Product Tag (Badge on Card & Product View)</span>
                          </label>

                          {productForm.hasCustomTag && (
                            <span className="text-[10px] text-[#2C5E43] font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Custom Tag Active
                            </span>
                          )}
                        </div>

                        {productForm.hasCustomTag && (
                          <div className="space-y-3 pt-2 border-t border-[#F0EAE0]">
                            {/* Preset Quick Tags */}
                            <div>
                              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E6352] mb-1.5">
                                Quick Preset Tag Options:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { label: '🔥 Trending', text: 'Trending', bg: '#DC2626', color: '#FFFFFF' },
                                  { label: '⭐ Top Seller', text: 'Top Seller', bg: '#D97706', color: '#FFFFFF' },
                                  { label: '🏷️ Best Deal', text: 'Best Deal', bg: '#059669', color: '#FFFFFF' },
                                  { label: '✨ Featured', text: 'Featured', bg: '#4F46E5', color: '#FFFFFF' },
                                  { label: '🚀 New Launch', text: 'New Launch', bg: '#2563EB', color: '#FFFFFF' },
                                  { label: '🌿 100% Ayurvedic', text: '100% Ayurvedic', bg: '#14291D', color: '#A5D6B6' },
                                  { label: '⚡ Hot Offer', text: 'Hot Offer', bg: '#EA580C', color: '#FFFFFF' },
                                ].map((pre, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setProductForm({
                                        ...productForm,
                                        customTagText: pre.text,
                                        customTagBgColor: pre.bg,
                                        customTagTextColor: pre.color,
                                        hasCustomTag: true,
                                      });
                                    }}
                                    className="px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer transition-transform hover:scale-103 shadow-2xs"
                                    style={{ backgroundColor: pre.bg, color: pre.color, borderColor: pre.bg }}
                                  >
                                    {pre.label}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setProductForm({ ...productForm, customTagText: '', hasCustomTag: false })}
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-[11px] font-medium border border-stone-300 cursor-pointer"
                                >
                                  Clear Tag
                                </button>
                              </div>
                            </div>

                            {/* Manual Text and Colors */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                              {/* Custom Tag Text */}
                              <div className="sm:col-span-1">
                                <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                                  Custom Tag Text (Type Manually)
                                </label>
                                <input
                                  type="text"
                                  value={productForm.customTagText}
                                  onChange={(e) => setProductForm({ ...productForm, customTagText: e.target.value })}
                                  placeholder="e.g. Special Deal, Limited Batch, Pure Herb"
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold"
                                />
                              </div>

                              {/* Background Color */}
                              <div>
                                <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                                  Background Color
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={productForm.customTagBgColor || '#14291D'}
                                    onChange={(e) => setProductForm({ ...productForm, customTagBgColor: e.target.value })}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white"
                                  />
                                  <input
                                    type="text"
                                    value={productForm.customTagBgColor || '#14291D'}
                                    onChange={(e) => setProductForm({ ...productForm, customTagBgColor: e.target.value })}
                                    className="flex-1 px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs font-mono"
                                  />
                                </div>
                              </div>

                              {/* Text Color */}
                              <div>
                                <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                                  Text Color
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={productForm.customTagTextColor || '#FFFFFF'}
                                    onChange={(e) => setProductForm({ ...productForm, customTagTextColor: e.target.value })}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white"
                                  />
                                  <input
                                    type="text"
                                    value={productForm.customTagTextColor || '#FFFFFF'}
                                    onChange={(e) => setProductForm({ ...productForm, customTagTextColor: e.target.value })}
                                    className="flex-1 px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs font-mono"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Live Badge Preview */}
                            <div className="pt-2 flex items-center gap-3">
                              <span className="text-[10px] uppercase font-bold text-[#716858]">Live Badge Preview:</span>
                              {productForm.customTagText.trim() ? (
                                <span
                                  className="text-xs font-bold px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5"
                                  style={{
                                    backgroundColor: productForm.customTagBgColor || '#14291D',
                                    color: productForm.customTagTextColor || '#FFFFFF',
                                  }}
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{productForm.customTagText}</span>
                                </span>
                              ) : (
                                <span className="text-xs text-stone-400 italic">Type a tag text above to preview</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CUSTOM FIELDS SECTION (NAME, VALUE & DISPLAY POSITION SETTING) */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            Custom Product Fields (Name, Value & Display Position)
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomField}
                          className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-300" />
                          <span>Add Custom Field</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-[#695E4F] bg-white p-2.5 rounded-lg border border-[#E2D8C7] leading-relaxed">
                        Add custom attributes (e.g. <em>Shelf Life</em>, <em>Extraction Ratio</em>, <em>Storage Temp</em>, <em>Origin</em>, <em>Preservative Free</em>). Set the <strong>Display Position</strong> number (1, 2, 3...) to control the exact sorting order on the product page.
                      </p>

                      {customFieldsList.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-[#DDD5C5] rounded-lg bg-white text-xs text-[#7A705E]">
                          No custom fields added yet. Click <strong>"+ Add Custom Field"</strong> to add specifications with custom name, value and position.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {customFieldsList.map((field, idx) => (
                            <div key={field.id || idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2 rounded-lg border border-[#E7E0D2]">
                              {/* Position Setting Control */}
                              <div className="flex items-center gap-1 shrink-0 bg-[#FAF8F5] px-2 py-1 rounded border border-[#DDD5C5]">
                                <span className="text-[10px] font-semibold text-[#7A705E]">Pos:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={field.position}
                                  onChange={(e) => handleUpdateCustomField(idx, 'position', parseInt(e.target.value) || 1)}
                                  className="w-12 text-center text-xs font-mono font-bold bg-white border border-[#DDD5C5] rounded py-0.5"
                                  title="Display position order (1 = first)"
                                />
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveCustomField(idx, 'up')}
                                    className="p-0.5 text-[#433A2D] hover:text-black disabled:opacity-20 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === customFieldsList.length - 1}
                                    onClick={() => handleMoveCustomField(idx, 'down')}
                                    className="p-0.5 text-[#433A2D] hover:text-black disabled:opacity-20 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Field Name */}
                              <div className="flex-1 min-w-[140px]">
                                <input
                                  type="text"
                                  required
                                  value={field.name}
                                  placeholder="Field Name (e.g. Shelf Life, Extraction Ratio)"
                                  onChange={(e) => handleUpdateCustomField(idx, 'name', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs font-semibold text-[#14291D]"
                                />
                              </div>

                              {/* Field Value */}
                              <div className="flex-1 min-w-[160px]">
                                <input
                                  type="text"
                                  required
                                  value={field.value}
                                  placeholder="Field Value (e.g. 24 Months, 10:1 Extract)"
                                  onChange={(e) => handleUpdateCustomField(idx, 'value', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs"
                                />
                              </div>

                              {/* Target Tab / Section Placement */}
                              <div className="shrink-0">
                                <select
                                  value={field.section || 'all'}
                                  onChange={(e) => handleUpdateCustomField(idx, 'section', e.target.value)}
                                  className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-[11px] font-medium text-[#14291D] cursor-pointer"
                                  title="Choose which monograph tab this field displays inside"
                                >
                                  <option value="all">📌 All Tabs / Apothecary Specs</option>
                                  <option value="indications">📋 Indications & Uses</option>
                                  <option value="ingredients">🌿 Ingredients & Potency</option>
                                  <option value="dosage">🥄 Dosage & Anupana</option>
                                  <option value="action">⚖️ Action & Doshas</option>
                                  <option value="precautions">🛡️ Precautions & License</option>
                                </select>
                              </div>

                              {/* Delete Action */}
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomField(idx)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded shrink-0 cursor-pointer"
                                title="Delete this custom field"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SIZE & PACKAGING VARIANTS SECTION (e.g. 100ml, 200ml, 500gm, 1kg, 1 Liter) */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-[#2C5E43]" />
                          <div>
                            <h5 className="font-serif text-sm font-bold text-[#14291D]">
                              Size & Packaging Variants (100ml, 200ml, 500gm, 1kg, 1 Liter...)
                            </h5>
                            <span className="text-[11px] text-[#716858]">
                              Set manual size (e.g. 100, 200) and type custom unit (ml, gm, kg, Liter) with individual pricing & separate images
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVariantsList([
                              ...variantsList,
                              {
                                id: `var_${Date.now()}_${variantsList.length + 1}`,
                                size: variantsList.length === 0 ? '100' : '200',
                                unit: 'ml',
                                price: 0,
                                mrp: 0,
                                resellerPrice: undefined,
                                image: '',
                                images: [],
                                inStock: true,
                              }
                            ]);
                          }}
                          className="px-3 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-300" />
                          <span>+ Add Variant</span>
                        </button>
                      </div>

                      {variantsList.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-[#DDD5C5] rounded-lg bg-white text-xs text-[#7A705E]">
                          No packaging variants created yet (Single size: <strong>{productForm.volumeOrWeight}</strong>). Click <strong>"+ Add Variant"</strong> to create options like 100ml, 200ml, 500gm, 1kg or 1 Liter with custom prices and separate images starting from ₹0.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {variantsList.map((variant, vIdx) => (
                            <div key={variant.id || vIdx} className="bg-white p-3 rounded-xl border border-[#D5CCBC] shadow-2xs space-y-2.5">
                              <div className="flex items-center justify-between border-b border-[#F0EAE0] pb-1.5">
                                <span className="font-bold text-xs text-[#14291D] flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-[#14291D] text-white text-[10px] flex items-center justify-center font-mono">
                                    {vIdx + 1}
                                  </span>
                                  <span>Variant #{vIdx + 1}: {variant.size} {variant.unit}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setVariantsList(variantsList.filter((_, idx) => idx !== vIdx))}
                                  className="text-red-600 hover:text-red-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Delete this variant"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 items-end">
                                {/* Size Value */}
                                <div>
                                  <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                                    Size Value <span className="text-red-600">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={variant.size}
                                    placeholder="e.g. 100, 200, 1"
                                    onChange={(e) => {
                                      const updated = [...variantsList];
                                      updated[vIdx].size = e.target.value;
                                      setVariantsList(updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs font-mono font-bold"
                                  />
                                </div>

                                {/* Unit: Type manually ml, gm, kg, Liter, etc. */}
                                <div>
                                  <label className="block text-[11px] font-medium text-[#2B251D] mb-1 flex items-center justify-between">
                                    <span>Unit (Type Custom) <span className="text-red-600">*</span></span>
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={variant.unit}
                                    placeholder="e.g. ml, gm, kg, Liter"
                                    onChange={(e) => {
                                      const updated = [...variantsList];
                                      updated[vIdx].unit = e.target.value;
                                      setVariantsList(updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs font-semibold"
                                  />
                                  {/* Quick unit helper buttons */}
                                  <div className="flex gap-1 mt-1">
                                    {['ml', 'gm', 'kg', 'Liter'].map((quickUnit) => (
                                      <button
                                        key={quickUnit}
                                        type="button"
                                        onClick={() => {
                                          const updated = [...variantsList];
                                          updated[vIdx].unit = quickUnit;
                                          setVariantsList(updated);
                                        }}
                                        className="text-[9px] px-1 py-0.2 bg-[#FAF8F5] border border-[#DDD5C5] hover:bg-[#EFEAE0] rounded text-[#4A4133] cursor-pointer"
                                      >
                                        {quickUnit}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Variant Price */}
                                <div>
                                  <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                                    Price (₹) <span className="text-red-600">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    required
                                    min="0"
                                    value={variant.price}
                                    onChange={(e) => {
                                      const updated = [...variantsList];
                                      updated[vIdx].price = Number(e.target.value);
                                      setVariantsList(updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs font-mono font-bold"
                                  />
                                </div>

                                {/* Variant MRP */}
                                <div>
                                  <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                                    MRP (₹)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={variant.mrp}
                                    onChange={(e) => {
                                      const updated = [...variantsList];
                                      updated[vIdx].mrp = Number(e.target.value);
                                      setVariantsList(updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs font-mono"
                                  />
                                </div>

                                {/* Variant Reseller Price */}
                                <div>
                                  <label className="block text-[11px] font-medium text-[#183624] mb-1">
                                    Reseller Rate (₹)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={variant.resellerPrice ?? ''}
                                    placeholder="Optional"
                                    onChange={(e) => {
                                      const updated = [...variantsList];
                                      updated[vIdx].resellerPrice = e.target.value ? Number(e.target.value) : undefined;
                                      setVariantsList(updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 rounded text-xs font-mono font-bold text-[#183624]"
                                  />
                                </div>

                                {/* Variant Stock Status */}
                                <div>
                                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer py-1.5">
                                    <input
                                      type="checkbox"
                                      checked={variant.inStock !== false}
                                      onChange={(e) => {
                                        const updated = [...variantsList];
                                        updated[vIdx].inStock = e.target.checked;
                                        setVariantsList(updated);
                                      }}
                                      className="rounded text-emerald-700 cursor-pointer"
                                    />
                                    <span>{variant.inStock !== false ? 'In Stock' : 'Out of Stock'}</span>
                                  </label>
                                </div>
                              </div>

                              {/* Separate Variant Photo(s): Multiple links & Add Button */}
                              <div className="pt-2.5 border-t border-[#F0EAE0] space-y-2">
                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                                  <label className="text-[11px] font-bold text-[#14291D] shrink-0 flex items-center gap-1">
                                    <ImageIcon className="w-3.5 h-3.5 text-[#2C5E43]" />
                                    <span>Variant Separate Photo(s):</span>
                                  </label>
                                  <div className="flex-1 flex gap-1.5 min-w-[220px]">
                                    <input
                                      type="url"
                                      value={variantPhotoInput[vIdx] || ''}
                                      placeholder="Paste image link(s) (comma or newline separated)"
                                      onChange={(e) => setVariantPhotoInput((prev) => ({ ...prev, [vIdx]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddVariantPhoto(vIdx);
                                        }
                                      }}
                                      className="flex-1 px-2.5 py-1 bg-white border border-[#DDD5C5] rounded text-xs font-mono"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddVariantPhoto(vIdx)}
                                      className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                                    >
                                      <Plus className="w-3 h-3 text-amber-300" />
                                      <span>+ Add Photo</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Variant Photos Gallery Thumbnails List */}
                                {((variant.images && variant.images.length > 0) || (variant.image && variant.image.trim())) && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {(variant.images && variant.images.length > 0 ? variant.images : [variant.image!]).map((photoUrl, pIdx) => (
                                      <div
                                        key={pIdx}
                                        className="relative group bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg p-1 flex items-center gap-2 pr-2 shadow-2xs"
                                      >
                                        <div className="w-9 h-9 rounded bg-white overflow-hidden border border-[#D5CCBC] shrink-0">
                                          <img
                                            src={photoUrl}
                                            alt={`Variant photo ${pIdx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                          />
                                        </div>
                                        <div className="text-[10px] font-mono text-[#5B5141] max-w-[120px] truncate" title={photoUrl}>
                                          {pIdx === 0 ? <span className="font-bold text-[#14291D] bg-[#E7EFEA] px-1 py-0.2 rounded text-[9px] mr-1">#1 Primary</span> : `#${pIdx + 1}`}
                                          {photoUrl.split('/').pop() || 'photo'}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveVariantPhoto(vIdx, pIdx)}
                                          className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer ml-1"
                                          title="Remove this photo"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* MULTIPLE PRODUCT IMAGES SECTION */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            Multiple Product Images (Direct Image Links)
                          </h5>
                        </div>
                        <span className="text-[11px] text-[#716858]">
                          {imageUrls.length} image(s) configured
                        </span>
                      </div>

                      <p className="text-[11px] text-[#695E4F] bg-white p-2.5 rounded-lg border border-[#E2D8C7] leading-relaxed">
                        <strong className="text-[#14291D]">Primary Rule:</strong> Only the <span className="font-semibold text-[#183624]">Primary Image (#1)</span> displays on the product list / catalog cards. All added images (#1, #2, etc.) appear inside the multi-angle gallery when a customer opens the product view.
                      </p>

                      <div className="space-y-2">
                        {imageUrls.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-[#E7E0D2]">
                            <span className="w-6 text-center font-mono text-[11px] text-[#807666]">
                              #{idx + 1}
                            </span>
                            <div className="w-10 h-10 rounded bg-[#EFEAE0] overflow-hidden border border-[#D5CCBC] shrink-0">
                              <img
                                src={url}
                                alt={`Thumb ${idx}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                              />
                            </div>
                            <input
                              type="text"
                              value={url}
                              onChange={(e) => {
                                const copy = [...imageUrls];
                                copy[idx] = e.target.value;
                                setImageUrls(copy);
                              }}
                              placeholder="Direct image link (https://...)"
                              className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-mono"
                            />
                            {idx === 0 ? (
                              <span className="px-2.5 py-1 rounded bg-[#E7EFEA] text-[#183624] text-[10px] font-bold border border-[#A5D6B6] shrink-0">
                                Primary (List View)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="px-2.5 py-1 rounded bg-white text-[#2C5E43] hover:bg-[#E7EFEA] border border-[#B5D6C4] text-[10px] font-semibold shrink-0 cursor-pointer transition-colors"
                                title="Set as primary thumbnail for product list view"
                              >
                                Set as Primary
                              </button>
                            )}
                            {imageUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImageUrl(idx)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded shrink-0 cursor-pointer"
                                title="Delete image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Add another image direct URL (https://...)"
                            className="flex-1 px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-3 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Image</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* SECTION 2: INGREDIENTS & POTENCY (ACTIVE BOTANICALS) */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#E7DFD1] pb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            2. Ingredients & Potency (Active Botanical Composition Table)
                          </h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E7EFEA] text-[#14291D] rounded">
                            Tab 2 in Detail View
                          </span>
                          <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Herb</span>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#DDD5C5] text-[#695F4F]">
                              <th className="py-1.5 px-2">Herb Name</th>
                              <th className="py-1.5 px-2">Botanical Species</th>
                              <th className="py-1.5 px-2">Potency / mg</th>
                              <th className="py-1.5 px-2">Therapeutic Role</th>
                              <th className="py-1.5 px-2 text-right">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EAE3D4]">
                            {ingredientsList.map((ing, idx) => (
                              <tr key={idx}>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    required
                                    value={ing.herb}
                                    placeholder="Herb (e.g. Ashwagandha)"
                                    onChange={(e) => handleUpdateIngredient(idx, 'herb', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    value={ing.botanicalName}
                                    placeholder="Botanical Name"
                                    onChange={(e) => handleUpdateIngredient(idx, 'botanicalName', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs italic"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    value={ing.potencyOrMg}
                                    placeholder="500mg"
                                    onChange={(e) => handleUpdateIngredient(idx, 'potencyOrMg', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    value={ing.role}
                                    placeholder="Adaptogen / Bio-enhancer"
                                    onChange={(e) => handleUpdateIngredient(idx, 'role', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs"
                                  />
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  {ingredientsList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveIngredient(idx)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tagline & Net Volume */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Tagline / Key Catchphrase</label>
                        <input
                          type="text"
                          value={productForm.tagline}
                          onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                          placeholder="e.g. Pure Classical Rasayana for Vital Immunity"
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Net Volume/Weight</label>
                        <input
                          type="text"
                          value={productForm.volumeOrWeight}
                          onChange={(e) => setProductForm({ ...productForm, volumeOrWeight: e.target.value })}
                          placeholder="e.g. 100g Pure Powder / 60 Veg Capsules"
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* SECTION 1: INDICATIONS & USES (ROGADHIKAR & MONOGRAPH) */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E7DFD1] pb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            1. Indications & Uses (Rogadhikar & Pharmacopoeia Monograph)
                          </h5>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E7EFEA] text-[#14291D] rounded">
                          Tab 1 in Detail View
                        </span>
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Description & Monograph Text
                        </label>
                        <textarea
                          rows={3}
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          placeholder="Detailed classical monograph, clinical preparation rationale, and bio-activity profile..."
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1 flex items-center justify-between">
                          <span>Key Indications / Rogadhikar (Comma Separated)</span>
                          <span className="text-[10px] text-[#716858]">Rendered as high-visibility tags</span>
                        </label>
                        <input
                          type="text"
                          value={productForm.keyIndications}
                          onChange={(e) => setProductForm({ ...productForm, keyIndications: e.target.value })}
                          placeholder="Immunity, Vital Energy, Respiratory Tone, Cognitive Focus, Rasayana"
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1 flex items-center justify-between">
                            <span>Therapeutic Uses & Primary Benefits</span>
                            <span className="text-[10px] text-[#716858]">1 per line</span>
                          </label>
                          <textarea
                            rows={3}
                            value={productForm.primaryBenefits}
                            onChange={(e) => setProductForm({ ...productForm, primaryBenefits: e.target.value })}
                            placeholder="Strengthens innate biological vitality&#10;Cleanses cellular ama toxins&#10;Restores healthy tissue tone"
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1 flex items-center justify-between">
                            <span>Ailments & Conditions Treated</span>
                            <span className="text-[10px] text-[#716858]">1 per line</span>
                          </label>
                          <textarea
                            rows={3}
                            value={productForm.ailmentsTreated}
                            onChange={(e) => setProductForm({ ...productForm, ailmentsTreated: e.target.value })}
                            placeholder="Kasa (Cough)&#10;Shwasa (Dyspnea)&#10;Daurbalya (Debility)"
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* SECTION 3: DOSAGE & ANUPANA CARRIER */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E7DFD1] pb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            3. Dosage & Anupana Carrier Guidelines
                          </h5>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E7EFEA] text-[#14291D] rounded">
                          Tab 3 in Detail View
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">Standard Dosage</label>
                          <input
                            type="text"
                            value={productForm.standardDosage}
                            onChange={(e) => setProductForm({ ...productForm, standardDosage: e.target.value })}
                            placeholder="e.g. 1 to 2 tablets twice daily"
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">Recommended Anupana (Carrier Liquid)</label>
                          <input
                            type="text"
                            value={productForm.anupanaCarrier}
                            onChange={(e) => setProductForm({ ...productForm, anupanaCarrier: e.target.value })}
                            placeholder="e.g. Warm cow milk, honey or pure lukewarm water"
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">Best Timing (Kala)</label>
                          <input
                            type="text"
                            value={productForm.bestTiming}
                            onChange={(e) => setProductForm({ ...productForm, bestTiming: e.target.value })}
                            placeholder="e.g. Early morning and evening after meals"
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">Recommended Course Duration</label>
                          <input
                            type="text"
                            value={productForm.duration}
                            onChange={(e) => setProductForm({ ...productForm, duration: e.target.value })}
                            placeholder="e.g. 6 to 12 weeks continuous course"
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* SECTION 4: ACTION MECHANISM & DOSHAS */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E7DFD1] pb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            4. Pharmacological Mode of Action & Dosha Balance
                          </h5>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E7EFEA] text-[#14291D] rounded">
                          Tab 4 in Detail View
                        </span>
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Pharmacological Mode of Action (Samprapti Vighatan)
                        </label>
                        <textarea
                          rows={3}
                          value={productForm.actionMechanism}
                          onChange={(e) => setProductForm({ ...productForm, actionMechanism: e.target.value })}
                          placeholder="Phytochemical mode of action, bio-pathways, tissue metabolic nourishment..."
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Dosha Balancing Affinity
                        </label>
                        <input
                          type="text"
                          value={productForm.doshaEffect}
                          onChange={(e) => setProductForm({ ...productForm, doshaEffect: e.target.value })}
                          placeholder="e.g. Tridosha balancing, pacifies Vata & Kapha, rejuvenates Dhatus"
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* SECTION 5: PRECAUTIONS, LICENSE & QUALITY STANDARDS */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E7DFD1] pb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            5. Precautions, AYUSH License & Quality Standards
                          </h5>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E7EFEA] text-[#14291D] rounded">
                          Tab 5 in Detail View
                        </span>
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1 flex items-center justify-between">
                          <span>Precautions & Contraindications</span>
                          <span className="text-[10px] text-[#716858]">1 warning per line</span>
                        </label>
                        <textarea
                          rows={3}
                          value={productForm.precautions}
                          onChange={(e) => setProductForm({ ...productForm, precautions: e.target.value })}
                          placeholder="Use under medical supervision if pregnant&#10;Keep away from reach of children&#10;Avoid during acute hyperacidity flare-ups"
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">AYUSH License Number</label>
                          <input
                            type="text"
                            value={productForm.ayushLicenseNo}
                            onChange={(e) => setProductForm({ ...productForm, ayushLicenseNo: e.target.value })}
                            placeholder="AYUSH-DL-2026-HERB-9901"
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">Batch & Shelf Life Info</label>
                          <input
                            type="text"
                            value={productForm.batchInfo}
                            onChange={(e) => setProductForm({ ...productForm, batchInfo: e.target.value })}
                            placeholder="Batch #VK-2026-01 | Exp: 2028"
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">Storage Guidelines</label>
                          <input
                            type="text"
                            value={productForm.storageGuideline}
                            onChange={(e) => setProductForm({ ...productForm, storageGuideline: e.target.value })}
                            placeholder="Store below 25°C away from direct sunlight"
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* SECTION 6: PRODUCT VIEW QUALITY ASSURANCE BADGES */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7DFD1] pb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                          <div>
                            <h5 className="font-serif text-sm font-bold text-[#14291D]">
                              6. Product View Quality Assurance Badges (Ayush & Trust Ribbon)
                            </h5>
                            <p className="text-[11px] text-[#6E6352]">
                              These 4 trust indicators appear in the product view secretly and on customer monographs.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              badge1Title: siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified',
                              badge1Subtitle: siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified',
                              badge2Title: siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical',
                              badge2Subtitle: siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers',
                            });
                          }}
                          className="px-2.5 py-1 bg-white border border-[#DDD5C5] text-[#14291D] hover:bg-stone-50 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-[#2C5E43]" />
                          <span>Reset to Site Defaults</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Badge 1 */}
                        <div className="p-3 bg-white rounded-xl border border-[#E0D7C6] space-y-2.5 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291D]">
                            <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                            <span>Assurance Badge 1 (e.g. Ayush & GMP Certified)</span>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                              Badge 1 Title
                            </label>
                            <input
                              type="text"
                              value={productForm.badge1Title}
                              onChange={(e) => setProductForm({ ...productForm, badge1Title: e.target.value })}
                              placeholder="Ayush & GMP Certified"
                              className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                              Badge 1 Subtitle / Note
                            </label>
                            <input
                              type="text"
                              value={productForm.badge1Subtitle}
                              onChange={(e) => setProductForm({ ...productForm, badge1Subtitle: e.target.value })}
                              placeholder="Heavy-metal lab verified"
                              className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs text-[#524838]"
                            />
                          </div>
                        </div>

                        {/* Badge 2 */}
                        <div className="p-3 bg-white rounded-xl border border-[#E0D7C6] space-y-2.5 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291D]">
                            <Leaf className="w-4 h-4 text-[#2C5E43]" />
                            <span>Assurance Badge 2 (e.g. 100% Pure Botanical)</span>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                              Badge 2 Title
                            </label>
                            <input
                              type="text"
                              value={productForm.badge2Title}
                              onChange={(e) => setProductForm({ ...productForm, badge2Title: e.target.value })}
                              placeholder="100% Pure Botanical"
                              className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                              Badge 2 Subtitle / Note
                            </label>
                            <input
                              type="text"
                              value={productForm.badge2Subtitle}
                              onChange={(e) => setProductForm({ ...productForm, badge2Subtitle: e.target.value })}
                              placeholder="Zero synthetic fillers"
                              className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs text-[#524838]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live preview in product form */}
                      <div className="pt-1">
                        <span className="text-[10px] uppercase font-bold text-[#716858] block mb-1">
                          Product View Preview:
                        </span>
                        <div className="p-3 bg-white rounded-xl border border-[#D5CCBC] grid grid-cols-2 gap-3 text-xs max-w-md">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#2C5E43] shrink-0" />
                            <div>
                              <span className="font-bold text-[#14291D] block">{productForm.badge1Title || 'Ayush & GMP Certified'}</span>
                              <span className="text-[11px] text-[#716858]">{productForm.badge1Subtitle || 'Heavy-metal lab verified'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-[#2C5E43] shrink-0" />
                            <div>
                              <span className="font-bold text-[#14291D] block">{productForm.badge2Title || '100% Pure Botanical'}</span>
                              <span className="text-[11px] text-[#716858]">{productForm.badge2Subtitle || 'Zero synthetic fillers'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Submit & Cancel Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE3D4]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNew(false);
                          setEditingProduct(null);
                        }}
                        className="px-4 py-2 border border-[#DDD5C5] hover:bg-[#EFEAE0] rounded-lg font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Save className="w-4 h-4 text-amber-300" />
                        <span>{isCreatingNew ? 'Save & Sync to Firebase' : 'Update & Save to Firebase'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Products Table with Reseller Price, Ratings & Sort Badges */
                <div className="bg-white rounded-xl border border-[#D5CCBC] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] border-b border-[#E7DFD1] text-[#695F4F]">
                        <tr>
                          <th className="py-2.5 px-3">Product</th>
                          <th className="py-2.5 px-3">Category & Form</th>
                          <th className="py-2.5 px-3">Retail Price</th>
                          <th className="py-2.5 px-3">Reseller Rate</th>
                          <th className="py-2.5 px-3">Rating Star</th>
                          <th className="py-2.5 px-3">Sort Focus</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE3D4]">
                        {filteredProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            {/* Product Info */}
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#DDD5C5] overflow-hidden shrink-0">
                                  <img
                                    src={prod.image || (prod.images && prod.images[0])}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-[#14291D] line-clamp-1">{prod.name}</div>
                                  <div className="text-[11px] text-[#7A705E] italic line-clamp-1">{prod.sanskritName}</div>
                                  {prod.customFields && prod.customFields.length > 0 && (
                                    <div className="text-[10px] text-[#2C5E43] font-medium">
                                      {prod.customFields.length} custom field(s)
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category & Form */}
                            <td className="py-2 px-3">
                              <div className="font-medium text-[#2C5E43]">{prod.categoryLabel}</div>
                              <div className="text-[11px] text-[#786D5C]">{prod.form}</div>
                            </td>

                            {/* Retail Price */}
                            <td className="py-2 px-3">
                              <div className="font-mono font-bold text-[#14291D]">{formatPrice(prod.price)}</div>
                              <div className="text-[10px] text-[#887E6D] line-through">{formatPrice(prod.mrp)}</div>
                            </td>

                            {/* Reseller Rate */}
                            <td className="py-2 px-3">
                              {prod.resellerPrice !== undefined && prod.resellerPrice > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EBF5EF] text-[#183624] font-mono font-bold border border-[#BBDDC7] text-[11px]">
                                  {formatPrice(prod.resellerPrice)}
                                </span>
                              ) : (
                                <span className="text-[#998F80] italic text-[11px]">— Not Set —</span>
                              )}
                            </td>

                            {/* Rating Star */}
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1 text-amber-600 font-bold">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>{prod.rating}</span>
                                <span className="text-[10px] text-[#786D5C]">({formatCompactNumber(prod.reviewsCount)})</span>
                              </div>
                            </td>

                            {/* Sort Focus Badge (Branded Icons, No Emojis) */}
                            <td className="py-2 px-3">
                              {prod.sortBadge && prod.sortBadge !== 'none' ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white flex items-center gap-1 w-fit ${
                                  prod.sortBadge === 'trending' ? 'bg-red-600' :
                                  prod.sortBadge === 'top_seller' ? 'bg-amber-600' :
                                  prod.sortBadge === 'best_deal' ? 'bg-emerald-700' :
                                  prod.sortBadge === 'new_launch' ? 'bg-blue-600' :
                                  prod.sortBadge === 'featured' ? 'bg-indigo-700' :
                                  'bg-[#B4741E]'
                                }`}>
                                  {prod.sortBadge === 'trending' && <Flame className="w-3 h-3 text-amber-200" />}
                                  {prod.sortBadge === 'top_seller' && <Trophy className="w-3 h-3 text-amber-100" />}
                                  {prod.sortBadge === 'best_deal' && <Tag className="w-3 h-3 text-emerald-200" />}
                                  {prod.sortBadge === 'new_launch' && <Rocket className="w-3 h-3 text-blue-100" />}
                                  {prod.sortBadge === 'featured' && <Sparkles className="w-3 h-3 text-indigo-200" />}
                                  <span>
                                    {prod.sortBadge === 'trending' ? 'Trending' :
                                     prod.sortBadge === 'top_seller' ? 'Top Seller' :
                                     prod.sortBadge === 'best_deal' ? 'Best Deal' :
                                     prod.sortBadge === 'new_launch' ? 'New Launch' :
                                     prod.sortBadge === 'featured' ? 'Featured' :
                                     prod.sortBadge}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#887E6D]">Standard</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => onPreviewProduct(prod)}
                                  className="p-1.5 text-[#2C5E43] hover:bg-[#E7EFEA] rounded cursor-pointer"
                                  title="Preview product view"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => startEdit(prod)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                  title="Edit product, images, custom fields & reseller price"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                {deleteConfirmId === prod.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        onDeleteProduct(prod.id);
                                        setDeleteConfirmId(null);
                                      }}
                                      className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-1 py-0.5 text-[10px] cursor-pointer"
                                    >
                                      X
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(prod.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab: Deal of the Week (Add, Edit, Reorder, Delete Section & Multiple Products in Horizontal Scroll) */}
        {activeTab === 'deal_of_week' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* 1. Master Section Controls & Visibility Status */}
            <div className={`p-5 rounded-xl border shadow-xs transition-colors ${
              currentWeeklyDeals.enabled 
                ? 'bg-linear-to-r from-emerald-50/70 via-white to-amber-50/50 border-[#A5D6B6]' 
                : 'bg-rose-50/60 border-rose-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${currentWeeklyDeals.enabled ? 'text-amber-500' : 'text-stone-400'}`} />
                    <h3 className="font-serif text-lg font-bold text-[#14291D]">
                      Deal of the Week Section Status
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      currentWeeklyDeals.enabled 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {currentWeeklyDeals.enabled ? 'Active on Storefront' : 'Deleted / Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-[#594F40]">
                    {currentWeeklyDeals.enabled 
                      ? `Displaying ${currentWeeklyDeals.items.length} product(s) in a responsive horizontal scroll carousel on your store.`
                      : 'The Deal of the Week section is completely deleted and hidden from all visitors on the store.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentWeeklyDeals.enabled ? (
                    deleteSectionConfirm ? (
                      <div className="flex items-center gap-2 bg-rose-100 p-2 rounded-lg border border-rose-300">
                        <span className="text-xs text-rose-900 font-medium">Delete section from store?</span>
                        <button
                          type="button"
                          onClick={handleDeleteSectionConfirm}
                          className="px-2.5 py-1 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteSectionConfirm(false)}
                          className="px-2 py-1 text-xs bg-white text-stone-700 hover:bg-stone-100 rounded border border-stone-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteSectionConfirm(true)}
                        className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Delete or hide Deal of the Week section"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete Deal Section</span>
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleWeeklyDealsSection(true)}
                      className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Enable Deal Section on Website</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRestoreDefaultDeals}
                    className="px-3 py-2 text-xs font-medium text-[#483F30] hover:text-[#14291D] bg-white hover:bg-[#F2ECE1] border border-[#CFC5B4] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Restore default authentic formulations"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#B4741E]" />
                    <span>Restore Defaults</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Deal Section Titles & Notice Settings */}
            <form onSubmit={handleSaveWeeklyDealsTab} className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E9E2D5] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2C5E43]" />
                  <h4 className="font-bold text-sm text-[#14291D]">
                    Deal of the Week Header & Banner Texts
                  </h4>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold bg-[#14291D] hover:bg-[#234D34] text-white rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Save Headers</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={currentWeeklyDeals.title}
                    onChange={(e) => handleUpdateWeeklyDeals({ title: e.target.value })}
                    placeholder="e.g. Deal of the Week"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Section Badge Pill
                  </label>
                  <input
                    type="text"
                    value={currentWeeklyDeals.badgeText}
                    onChange={(e) => handleUpdateWeeklyDeals({ badgeText: e.target.value })}
                    placeholder="e.g. Handpicked Specials"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Section Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={currentWeeklyDeals.subtitle}
                    onChange={(e) => handleUpdateWeeklyDeals({ subtitle: e.target.value })}
                    placeholder="e.g. Handpicked classical formulations and pure Rasayanas at exclusive apothecary rates."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Promo Tag / Banner Highlight
                  </label>
                  <input
                    type="text"
                    value={currentWeeklyDeals.bannerTag}
                    onChange={(e) => handleUpdateWeeklyDeals({ bannerTag: e.target.value })}
                    placeholder="e.g. Save up to 35% this week"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Countdown / Refresh Notice
                  </label>
                  <input
                    type="text"
                    value={currentWeeklyDeals.dealEndNotice || ''}
                    onChange={(e) => handleUpdateWeeklyDeals({ dealEndNotice: e.target.value })}
                    placeholder="e.g. Offers refresh every Sunday midnight · Authentic botanical guarantee"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>
              </div>
            </form>

            {/* 3. Add Products to Deal of the Week */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E9E2D5] pb-3">
                <Plus className="w-4 h-4 text-[#2C5E43]" />
                <h4 className="font-bold text-sm text-[#14291D]">
                  Add Product to Deal of the Week (Horizontal Scroll)
                </h4>
              </div>

              <form onSubmit={handleAddDealProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block font-medium text-[#2F2920] mb-1">
                      Select Product from Catalog <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedDealProductId}
                      onChange={(e) => {
                        setSelectedDealProductId(e.target.value);
                        const sel = products.find(p => p.id === e.target.value);
                        if (sel) {
                          setDealPriceInput(sel.price);
                          setDealCustomTitle(sel.name);
                          setDealBadgeInput(`Deal of the Week · ${Math.round(((sel.mrp - sel.price) / (sel.mrp || 1)) * 100)}% Off`);
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sanskritName}) - MRP {formatPrice(p.mrp)} / {formatPrice(p.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#2F2920] mb-1">
                      Promotional Deal Price (₹) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={dealPriceInput}
                      onChange={(e) => setDealPriceInput(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-bold text-[#183624]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2F2920] mb-1">
                      Deal Badge Tag
                    </label>
                    <input
                      type="text"
                      value={dealBadgeInput}
                      onChange={(e) => setDealBadgeInput(e.target.value)}
                      placeholder="e.g. Deal of the Week · 35% Off"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2F2920] mb-1">
                      Custom Title Override (Optional)
                    </label>
                    <input
                      type="text"
                      value={dealCustomTitle}
                      onChange={(e) => setDealCustomTitle(e.target.value)}
                      placeholder="Leave blank to use original product title"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2F2920] mb-1">
                      Custom Subtitle Override (Optional)
                    </label>
                    <input
                      type="text"
                      value={dealCustomSubtitle}
                      onChange={(e) => setDealCustomSubtitle(e.target.value)}
                      placeholder="Leave blank to use product tagline"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2F2920] mb-1">
                      Add Highlight Point (Optional)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={dealHighlightInput}
                        onChange={(e) => setDealHighlightInput(e.target.value)}
                        placeholder="e.g. Free Anupana Guide"
                        className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (dealHighlightInput.trim()) {
                            setDealHighlights([...dealHighlights, dealHighlightInput.trim()]);
                            setDealHighlightInput('');
                          }
                        }}
                        className="px-2.5 py-1.5 bg-[#EAE3D5] text-[#2C2417] hover:bg-[#DDD4C4] rounded-lg font-semibold cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Highlight pills preview */}
                {dealHighlights.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[#716858] font-medium">Points to display:</span>
                    {dealHighlights.map((pt, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] bg-[#EFEAE0] text-[#3A3225] px-2 py-0.5 rounded-full border border-[#D5CCBC]"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-[#B4741E]" />
                        {pt}
                        <button
                          type="button"
                          onClick={() => setDealHighlights(dealHighlights.filter((_, idx) => idx !== i))}
                          className="hover:text-red-600 ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#183624] hover:bg-[#255237] text-white font-semibold rounded-lg flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-300" />
                    <span>Add to Deal of the Week Horizontal Carousel</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 4. Active Products in Deal of the Week (Horizontal Scroll & Reorder) */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9E2D5] pb-3">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-[#14291D] flex items-center gap-2">
                    <span>Products in Deal of the Week ({currentWeeklyDeals.items.length})</span>
                    <span className="text-xs font-normal text-[#6F6453]">
                      (Ordered left to right in the horizontal scroll carousel)
                    </span>
                  </h4>
                  <p className="text-xs text-[#6A604F]">
                    Use Left / Right buttons to reorder, adjust deal prices inline, or delete items.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveWeeklyDealsTab}
                  className="px-4 py-1.5 text-xs font-bold bg-[#14291D] hover:bg-[#255237] text-white rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer self-start sm:self-auto"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Save All to Firebase</span>
                </button>
              </div>

              {currentWeeklyDeals.items.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#7A705E] bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD5C5] space-y-2">
                  <Flame className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="font-semibold text-sm text-[#14291D]">No products in Deal of the Week currently.</p>
                  <p>Add products above or click "Restore Defaults" to populate classical Rasayanas.</p>
                  <button
                    type="button"
                    onClick={handleRestoreDefaultDeals}
                    className="mt-2 px-3 py-1.5 bg-[#183624] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Restore Default Formulations
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Live Horizontal Scroll Strip Preview */}
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E0D8C8]">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#5A5040] mb-2 px-1">
                      <span>Horizontal Scroll Sequence Preview:</span>
                      <span className="font-mono text-[#887D6C]">{currentWeeklyDeals.items.length} cards</span>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                      {currentWeeklyDeals.items.map((deal, index) => {
                        const prod = products.find(p => p.id === deal.productId);
                        const title = deal.customTitle || prod?.name || 'Apothecary Formulation';
                        const image = deal.customImage || prod?.image || 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800';
                        const dealPrice = deal.dealPrice ?? prod?.price ?? 350;
                        const mrp = prod?.mrp || Math.round(dealPrice * 1.35);

                        return (
                          <div
                            key={deal.id}
                            className="w-52 shrink-0 bg-white rounded-lg border border-[#D5CCBC] p-2.5 shadow-2xs space-y-2 relative group"
                          >
                            <div className="relative aspect-4/3 rounded overflow-hidden bg-[#ECE6D9]">
                              <img src={image} alt={title} className="w-full h-full object-cover" />
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#25D366] text-black">
                                #{index + 1}
                              </span>
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[10px] bg-black/70 text-white font-mono">
                                {formatPrice(dealPrice)}
                              </span>
                            </div>

                            <div>
                              <div className="text-xs font-bold text-[#14291D] truncate" title={title}>
                                {title}
                              </div>
                              <div className="text-[10px] text-[#2C5E43] truncate">
                                {deal.dealBadge || 'Deal of the Week'}
                              </div>
                            </div>

                            {/* Position Controls */}
                            <div className="flex items-center justify-between border-t border-[#EFEAE0] pt-1.5 text-[11px]">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveDeal(deal.id, 'left')}
                                  className="p-1 rounded hover:bg-[#EFEAE0] disabled:opacity-30 cursor-pointer text-[#4A4133]"
                                  title="Move Left in carousel"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === currentWeeklyDeals.items.length - 1}
                                  onClick={() => handleMoveDeal(deal.id, 'right')}
                                  className="p-1 rounded hover:bg-[#EFEAE0] disabled:opacity-30 cursor-pointer text-[#4A4133]"
                                  title="Move Right in carousel"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveDeal(deal.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                title="Delete deal product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Table for In-line Editing */}
                  <div className="border border-[#DDD5C5] rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#E7DFD1] text-[#695F4F] font-bold text-[11px]">
                          <th className="py-2.5 px-3">Order</th>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Deal Badge Tag</th>
                          <th className="py-2.5 px-3">Deal Price (₹)</th>
                          <th className="py-2.5 px-3">Reorder Position</th>
                          <th className="py-2.5 px-3 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFEAE0]">
                        {currentWeeklyDeals.items.map((deal, idx) => {
                          const prod = products.find(p => p.id === deal.productId);
                          const title = deal.customTitle || prod?.name || 'Apothecary Formulation';

                          return (
                            <tr key={deal.id} className="hover:bg-[#FAF8F5]">
                              <td className="py-2 px-3 font-mono font-bold text-[#887D6C]">
                                #{idx + 1}
                              </td>

                              <td className="py-2 px-3">
                                <div className="font-semibold text-[#14291D]">{title}</div>
                                {prod && (
                                  <div className="text-[10px] text-[#716858]">
                                    Original: {formatPrice(prod.price)} (MRP {formatPrice(prod.mrp)})
                                  </div>
                                )}
                              </td>

                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={deal.dealBadge || ''}
                                  onChange={(e) => {
                                    const items = currentWeeklyDeals.items.map(it => 
                                      it.id === deal.id ? { ...it, dealBadge: e.target.value } : it
                                    );
                                    handleUpdateWeeklyDeals({ items });
                                  }}
                                  placeholder="e.g. Deal of the Week"
                                  className="w-full max-w-[200px] px-2 py-1 bg-[#FAF8F5] border border-[#D5CCBC] rounded text-xs"
                                />
                              </td>

                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={deal.dealPrice ?? prod?.price ?? 350}
                                  onChange={(e) => {
                                    const items = currentWeeklyDeals.items.map(it => 
                                      it.id === deal.id ? { ...it, dealPrice: Number(e.target.value) } : it
                                    );
                                    handleUpdateWeeklyDeals({ items });
                                  }}
                                  className="w-24 px-2 py-1 bg-[#FAF8F5] border border-[#D5CCBC] rounded font-mono font-bold text-xs text-[#183624]"
                                />
                              </td>

                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveDeal(deal.id, 'left')}
                                    className="p-1.5 rounded hover:bg-[#EAE4D6] disabled:opacity-30 border border-[#D5CCBC] text-[#4A4133] cursor-pointer"
                                    title="Move earlier in scroll"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === currentWeeklyDeals.items.length - 1}
                                    onClick={() => handleMoveDeal(deal.id, 'right')}
                                    className="p-1.5 rounded hover:bg-[#EAE4D6] disabled:opacity-30 border border-[#D5CCBC] text-[#4A4133] cursor-pointer"
                                    title="Move later in scroll"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDeal(deal.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Delete product from Deal of the Week"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Save All Button */}
            <div className="flex justify-end pt-2 pb-6">
              <button
                type="button"
                onClick={handleSaveWeeklyDealsTab}
                className="px-6 py-2.5 bg-[#14291D] hover:bg-[#234D34] text-white rounded-lg font-bold flex items-center gap-2 shadow-md cursor-pointer text-xs"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save All Deal of the Week Changes to Firebase & Storefront</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Categories & Forms Manager (Preset & Custom Edit / Add / Delete) */}
        {activeTab === 'categories_forms' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* CATEGORIES SECTION */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#B4741E]" />
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Categories Manager (Preset & Custom)
                    </h4>
                    <p className="text-xs text-[#695F4F]">
                      Add new custom categories, edit labels, or delete categories. Updates sync immediately to the store & Firebase.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateCategories(DEFAULT_CATEGORIES)}
                  className="px-2.5 py-1 text-xs text-[#6D6352] hover:bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg flex items-center gap-1 cursor-pointer"
                  title="Reset to default herbal categories"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleCreateCategory} className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E4DDD0] flex flex-wrap items-center gap-2.5 text-xs">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[11px] font-semibold text-[#2F2920] mb-0.5">Category Name / Label</label>
                  <input
                    type="text"
                    required
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder="e.g. Renal & Kidney Care, Liver Detox"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-[11px] font-semibold text-[#2F2920] mb-0.5">Category ID (Optional)</label>
                  <input
                    type="text"
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    placeholder="auto-generated if empty"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded font-mono text-[11px]"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Add Category</span>
                </button>
              </form>

              {/* Existing Categories List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                {categories.map((cat) => {
                  const isEditing = editingCatId === cat.id;
                  const isRoot = cat.id === 'all';
                  return (
                    <div
                      key={cat.id}
                      className="p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg flex items-center justify-between gap-2 text-xs"
                    >
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="text"
                            value={editingCatLabel}
                            onChange={(e) => setEditingCatLabel(e.target.value)}
                            className="flex-1 px-2 py-1 bg-white border border-[#A5D6B6] rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCategory(cat.id)}
                            className="p-1 bg-[#2C5E43] text-white rounded cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-1 text-[#645A4B] cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="font-bold text-[#14291D] block">{cat.label}</span>
                            <span className="font-mono text-[10px] text-[#7A705E]">id: {cat.id}</span>
                          </div>

                          {!isRoot && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditingCatLabel(cat.label);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                title="Edit category name"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Delete category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FORMULATION FORMS SECTION */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#2C5E43]" />
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Formulation Forms Manager (Preset & Custom)
                    </h4>
                    <p className="text-xs text-[#695F4F]">
                      Manage traditional pharmaceutical forms (Churna, Vati, Taila, Capsule, Swaras, etc.).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateForms(DEFAULT_FORMS)}
                  className="px-2.5 py-1 text-xs text-[#6D6352] hover:bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg flex items-center gap-1 cursor-pointer"
                  title="Reset to default forms"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Add New Form */}
              <form onSubmit={handleCreateForm} className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E4DDD0] flex items-center gap-2.5 text-xs">
                <input
                  type="text"
                  required
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="New Formulation Form (e.g. Granules, Herbal Jelly, Lepa)"
                  className="flex-1 px-3 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Add Form</span>
                </button>
              </form>

              {/* Existing Forms List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                {forms.map((formName, idx) => {
                  const isEditing = editingFormIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg flex items-center justify-between gap-2 text-xs"
                    >
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="text"
                            value={editingFormName}
                            onChange={(e) => setEditingFormName(e.target.value)}
                            className="flex-1 px-2 py-1 bg-white border border-[#A5D6B6] rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditForm(idx)}
                            className="p-1 bg-[#2C5E43] text-white rounded cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFormIdx(null)}
                            className="p-1 text-[#645A4B] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-[#14291D]">{formName}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFormIdx(idx);
                                setEditingFormName(formName);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              title="Edit form name"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteForm(idx)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete form"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Save All Button for Categories & Forms */}
            <div className="flex justify-end pt-2 pb-4">
              <button
                type="button"
                onClick={async () => {
                  await backupCatalogMetaToFirebase({ categories, forms });
                  setSaveSuccessMsg('All Categories & Formulation Forms saved and synced to Firebase!');
                  setTimeout(() => setSaveSuccessMsg(null), 3000);
                }}
                className="px-6 py-2.5 bg-[#14291D] hover:bg-[#234D34] text-white rounded-lg font-bold flex items-center gap-2 shadow-md cursor-pointer text-xs"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save Categories & Forms to Firebase</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Multiple Contacts (Add, Edit, Delete Phones, WhatsApp, Emails) */}
        {activeTab === 'contacts' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs">
              {/* 1. Multiple Phone Numbers */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#2C5E43]" />
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Multiple Phone & Helpline Numbers (Add, Edit, Delete)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPhone}
                    className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Phone Number</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {siteForm.contacts.phones.map((phone, idx) => (
                    <div key={phone.id || idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={phone.label}
                        placeholder="Label (e.g. Primary Helpline, Emergency Dispatch)"
                        onChange={(e) => handleUpdatePhone(idx, 'label', e.target.value)}
                        className="w-1/3 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-medium"
                      />
                      <input
                        type="tel"
                        required
                        value={phone.number}
                        placeholder="+91 98765 43210"
                        onChange={(e) => handleUpdatePhone(idx, 'number', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                      />
                      {siteForm.contacts.phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhone(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete contact number"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Multiple WhatsApp Numbers */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Multiple WhatsApp Numbers & Links (Add, Edit, Delete)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddWhatsApp}
                    className="px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add WhatsApp</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {siteForm.contacts.whatsapps.map((wa, idx) => (
                    <div key={wa.id || idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={wa.label}
                        placeholder="Label (e.g. Order Desk, Doctor Chat)"
                        onChange={(e) => handleUpdateWhatsApp(idx, 'label', e.target.value)}
                        className="w-1/3 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-medium"
                      />
                      <input
                        type="text"
                        required
                        value={wa.number}
                        placeholder="Raw Number e.g. 919876543210"
                        onChange={(e) => handleUpdateWhatsApp(idx, 'number', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={wa.displayNumber}
                        placeholder="Display Text e.g. +91 98765 43210"
                        onChange={(e) => handleUpdateWhatsApp(idx, 'displayNumber', e.target.value)}
                        className="w-1/4 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                      />
                      {siteForm.contacts.whatsapps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWhatsApp(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete WhatsApp contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Multiple Support Emails */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#2C5E43]" />
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Multiple Support & Inquiry Emails (Add, Edit, Delete)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Email</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {siteForm.contacts.emails.map((em, idx) => (
                    <div key={em.id || idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={em.label}
                        placeholder="Label (e.g. Care Team, Prescriptions)"
                        onChange={(e) => handleUpdateEmail(idx, 'label', e.target.value)}
                        className="w-1/3 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-medium"
                      />
                      <input
                        type="email"
                        required
                        value={em.email}
                        placeholder="care@aurashka.com"
                        onChange={(e) => handleUpdateEmail(idx, 'email', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                      />
                      {siteForm.contacts.emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete email"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Dispensary Address & Timings */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-[#EAE3D4] pb-2">
                  <Building2 className="w-4 h-4 text-[#2C5E43]" />
                  <h4 className="font-serif text-base font-bold text-[#14291D]">
                    Dispensary Physical Address & Timings
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Store / Clinic Address</label>
                    <textarea
                      rows={2}
                      value={siteForm.storeAddress}
                      onChange={(e) => setSiteForm({ ...siteForm, storeAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Consultation & Store Timings</label>
                    <textarea
                      rows={2}
                      value={siteForm.storeTimings}
                      onChange={(e) => setSiteForm({ ...siteForm, storeTimings: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save All Contacts to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Doctors & Key People (Round Images & Text) */}
        {activeTab === 'people' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Header info */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2C5E43]" />
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Doctors & Key People Management (Round Images & Subtitles)
                    </h4>
                    <p className="text-[11px] text-[#6E6352]">
                      These profiles appear at the bottom of the Main Storefront Page and the Contact Page.
                    </p>
                  </div>
                </div>

                {!isAddingPerson && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPersonId(null);
                      setPersonName('');
                      setPersonImage('https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80');
                      setPersonRole('Ayurvedic Doctor & Clinical Formulator');
                      setPersonDetail('BAMS, MD Ayu. · 12+ Years Clinical Practice');
                      setIsAddingPerson(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#183624] hover:bg-[#255237] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Add New Doctor / Person</span>
                  </button>
                )}
              </div>

              {/* Section Badge, Title & Subtitle Customization */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Top Badge Text
                    </label>
                    <input
                      type="text"
                      value={siteForm.peopleBadgeText ?? 'Certified Ayurvedic Doctors & Formulators'}
                      onChange={(e) => setSiteForm({ ...siteForm, peopleBadgeText: e.target.value })}
                      placeholder="e.g. Certified Ayurvedic Doctors & Formulators"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Section Heading Title
                    </label>
                    <input
                      type="text"
                      value={siteForm.peopleSectionTitle ?? 'Our Ayurvedic Doctors & Formulation Specialists'}
                      onChange={(e) => setSiteForm({ ...siteForm, peopleSectionTitle: e.target.value })}
                      placeholder="e.g. Our Ayurvedic Doctors & Formulation Specialists"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Section Subtitle / Description Text
                    </label>
                    <input
                      type="text"
                      value={siteForm.peopleSectionSubtitle ?? 'Experienced Ayurvedic Doctors & Botanical Formulators guiding your wellness and personalized dosages.'}
                      onChange={(e) => setSiteForm({ ...siteForm, peopleSectionSubtitle: e.target.value })}
                      placeholder="e.g. Experienced Ayurvedic Doctors & Botanical Formulators guiding your wellness."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Swipe Helper Notice
                    </label>
                    <input
                      type="text"
                      value={siteForm.peopleSwipeNotice ?? ''}
                      onChange={(e) => setSiteForm({ ...siteForm, peopleSwipeNotice: e.target.value })}
                      placeholder="Optional notice (leave blank for clean view)"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-emerald-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const updatedSite = {
                        ...siteForm,
                        peopleBadgeText: siteForm.peopleBadgeText?.trim() || 'Certified Ayurvedic Doctors & Formulators',
                        peopleSectionTitle: siteForm.peopleSectionTitle?.trim() || 'Our Ayurvedic Doctors & Formulation Specialists',
                        peopleSectionSubtitle: siteForm.peopleSectionSubtitle?.trim() || 'Experienced Ayurvedic Doctors & Botanical Formulators guiding your wellness and personalized dosages.',
                        peopleSwipeNotice: siteForm.peopleSwipeNotice?.trim() || '',
                      };
                      setSiteForm(updatedSite);
                      onUpdateSiteSettings(updatedSite);
                      backupSiteSettingsToFirebase(updatedSite);
                      setSaveSuccessMsg('Doctor Section Badge, Titles & Swipe Notice saved & synced to Firebase!');
                      setTimeout(() => setSaveSuccessMsg(null), 3000);
                    }}
                    className="px-4 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>Save Badge, Titles & Swipe Notice</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Add / Edit Form Modal / Inline Card */}
            {isAddingPerson && (
              <div className="bg-[#FAF8F5] p-5 rounded-xl border-2 border-[#2C5E43] shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-[#E0D7C6] pb-2">
                  <h4 className="font-serif font-bold text-sm text-[#14291D] flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#2C5E43]" />
                    <span>{editingPersonId ? 'Edit Doctor Profile' : 'Add New Doctor / Person Profile'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPerson(false);
                      setEditingPersonId(null);
                    }}
                    className="text-[#645A4B] hover:text-[#14291D] text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!personName.trim()) return;

                    const currentList = siteForm.peopleList || DEFAULT_SITE_SETTINGS.peopleList || [];
                    let updatedList: PeopleProfile[];

                    if (editingPersonId) {
                      updatedList = currentList.map((p) =>
                        p.id === editingPersonId
                          ? {
                              ...p,
                              name: personName.trim(),
                              image: personImage.trim() || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
                              roleOrDesignation: personRole.trim() || 'Ayurvedic Doctor',
                              qualificationOrExperience: personDetail.trim() || undefined,
                            }
                          : p
                      );
                    } else {
                      const newPerson: PeopleProfile = {
                        id: `person-${Date.now()}`,
                        name: personName.trim(),
                        image: personImage.trim() || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
                        roleOrDesignation: personRole.trim() || 'Ayurvedic Doctor',
                        qualificationOrExperience: personDetail.trim() || undefined,
                      };
                      updatedList = [...currentList, newPerson];
                    }

                    const updatedSite = {
                      ...siteForm,
                      peopleList: updatedList,
                    };
                    setSiteForm(updatedSite);
                    onUpdateSiteSettings(updatedSite);
                    backupSiteSettingsToFirebase(updatedSite);

                    setIsAddingPerson(false);
                    setEditingPersonId(null);
                    setSaveSuccessMsg('Doctor profile saved successfully!');
                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Live Circular Avatar Preview */}
                    <div className="sm:col-span-3 flex flex-col items-center justify-center space-y-1.5">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#2C5E43] shadow-md bg-white flex items-center justify-center">
                        {personImage ? (
                          <img
                            src={personImage}
                            alt="Round Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLElement).style.opacity = '0.3'; }}
                          />
                        ) : (
                          <Users className="w-8 h-8 text-[#2C5E43]" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#6E6352] font-semibold">Live Round Preview</span>
                    </div>

                    <div className="sm:col-span-9 space-y-3">
                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Doctor / Person Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={personName}
                          onChange={(e) => setPersonName(e.target.value)}
                          placeholder="e.g. Dr. Harshit Maan (BAMS, MD Ayu.)"
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-bold text-[#14291D]"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Circular Image URL (Photo) <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          value={personImage}
                          onChange={(e) => setPersonImage(e.target.value)}
                          placeholder="https://... image link"
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-[#6E6352]">Sample Presets:</span>
                        <button
                          type="button"
                          onClick={() => setPersonImage('https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80')}
                          className="px-2 py-0.5 bg-white border border-[#DDD5C5] rounded text-[10px] hover:bg-stone-100 cursor-pointer"
                        >
                          Doctor 1 (Male)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPersonImage('https://images.unsplash.com/photo-1594824813628-989635b71946?auto=format&fit=crop&w=400&q=80')}
                          className="px-2 py-0.5 bg-white border border-[#DDD5C5] rounded text-[10px] hover:bg-stone-100 cursor-pointer"
                        >
                          Doctor 2 (Female)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPersonImage('https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80')}
                          className="px-2 py-0.5 bg-white border border-[#DDD5C5] rounded text-[10px] hover:bg-stone-100 cursor-pointer"
                        >
                          Doctor 3 (Senior)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">
                        Role / Designation (Another text down to the name) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={personRole}
                        onChange={(e) => setPersonRole(e.target.value)}
                        placeholder="e.g. Chief Ayurvedic Physician & Senior Formulator"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#2C5E43]"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">
                        Qualifications / Experience (Extra detail down to the name)
                      </label>
                      <input
                        type="text"
                        value={personDetail}
                        onChange={(e) => setPersonDetail(e.target.value)}
                        placeholder="e.g. 15+ Years Clinical Practice · Central Ayush Board"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#E0D7C6]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPerson(false);
                        setEditingPersonId(null);
                      }}
                      className="px-4 py-2 border border-[#C8BEAB] rounded-lg text-xs text-[#594E3E] hover:bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-300" />
                      <span>{editingPersonId ? 'Update Doctor' : 'Save Doctor Profile'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of current doctors / people */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                <h4 className="font-serif font-bold text-sm text-[#14291D]">
                  Current Doctors & Practitioners ({siteForm.peopleList?.length ?? (DEFAULT_SITE_SETTINGS.peopleList?.length || 0)})
                </h4>
                <span className="text-[11px] text-[#6E6352]">
                  Circular image, name, and subtitle text display on the website
                </span>
              </div>

              <div className="space-y-3">
                {(siteForm.peopleList || DEFAULT_SITE_SETTINGS.peopleList || []).map((person, idx, arr) => (
                  <div
                    key={person.id}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C5] flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[#2C5E43] transition-all"
                  >
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#2C5E43] shrink-0 bg-white shadow-2xs">
                        <img
                          src={person.image}
                          alt={person.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLElement).style.opacity = '0.3'; }}
                        />
                      </div>

                      <div className="space-y-0.5">
                        <h5 className="font-serif font-bold text-xs sm:text-sm text-[#14291D]">
                          {person.name}
                        </h5>
                        <p className="text-xs font-semibold text-[#2C5E43]">
                          {person.roleOrDesignation}
                        </p>
                        {person.qualificationOrExperience && (
                          <p className="text-[11px] text-[#6E6352]">
                            {person.qualificationOrExperience}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Reorder, Edit, Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const list = [...(siteForm.peopleList || DEFAULT_SITE_SETTINGS.peopleList || [])];
                          const [item] = list.splice(idx, 1);
                          list.splice(idx - 1, 0, item);
                          const updated = { ...siteForm, peopleList: list };
                          setSiteForm(updated);
                          onUpdateSiteSettings(updated);
                          backupSiteSettingsToFirebase(updated);
                        }}
                        className="p-1.5 rounded-lg border border-[#DDD5C5] bg-white hover:bg-stone-100 text-[#594E3E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        onClick={() => {
                          const list = [...(siteForm.peopleList || DEFAULT_SITE_SETTINGS.peopleList || [])];
                          const [item] = list.splice(idx, 1);
                          list.splice(idx + 1, 0, item);
                          const updated = { ...siteForm, peopleList: list };
                          setSiteForm(updated);
                          onUpdateSiteSettings(updated);
                          backupSiteSettingsToFirebase(updated);
                        }}
                        className="p-1.5 rounded-lg border border-[#DDD5C5] bg-white hover:bg-stone-100 text-[#594E3E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPersonId(person.id);
                          setPersonName(person.name);
                          setPersonImage(person.image);
                          setPersonRole(person.roleOrDesignation);
                          setPersonDetail(person.qualificationOrExperience || '');
                          setIsAddingPerson(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[#DDD5C5] bg-white hover:bg-stone-100 text-[#14291D] font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#2C5E43]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const list = (siteForm.peopleList || DEFAULT_SITE_SETTINGS.peopleList || []).filter((p) => p.id !== person.id);
                          const updated = { ...siteForm, peopleList: list };
                          setSiteForm(updated);
                          onUpdateSiteSettings(updated);
                          backupSiteSettingsToFirebase(updated);
                          setSaveSuccessMsg('Doctor removed.');
                          setTimeout(() => setSaveSuccessMsg(null), 3000);
                        }}
                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer"
                        title="Delete Doctor Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Settings */}
              <div className="flex justify-end pt-3 border-t border-[#EAE3D4]">
                <button
                  type="button"
                  onClick={handleSaveSiteSettings}
                  className="px-6 py-2.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save Doctors & Section Settings to Firebase</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Site Titles & Headings */}
        {activeTab === 'site_titles' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs">
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2C5E43]" />
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Store Header Title & Logo Customization
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-[#2C5E43] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Header Sync
                  </span>
                </div>

                {/* Live Header Preview Box */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D5CCBC] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {siteForm.showBrandLogo !== false && (siteForm.brandLogoImage || DEFAULT_SITE_SETTINGS.brandLogoImage) && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2C5E43] shadow-xs bg-[#E7EFEA] shrink-0 flex items-center justify-center">
                        <img
                          src={siteForm.brandLogoImage || DEFAULT_SITE_SETTINGS.brandLogoImage}
                          alt="Store Logo"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-serif text-xl font-bold text-[#14291D] leading-tight">
                        {siteForm.brandName || 'Brand Name'}
                      </div>
                      <div className="text-[11px] font-serif text-[#2C5E43] font-medium leading-tight">
                        {siteForm.hindiName || 'हिन्दी ब्रांड उपशीर्षक'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#6E6352] italic">
                    (Live preview of how header title & logo appear on top bar)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Header Brand Title (English) *
                    </label>
                    <input
                      type="text"
                      value={siteForm.brandName}
                      onChange={(e) => setSiteForm({ ...siteForm, brandName: e.target.value })}
                      placeholder="e.g. Aurashka or VedaVriksha"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Header Hindi Title / Subtitle
                    </label>
                    <input
                      type="text"
                      value={siteForm.hindiName}
                      onChange={(e) => setSiteForm({ ...siteForm, hindiName: e.target.value })}
                      placeholder="e.g. औराश्का हर्बल औषधि भंडार"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-serif"
                    />
                  </div>
                </div>

                {/* Header Logo Controls */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#14291D]">
                      <input
                        type="checkbox"
                        checked={siteForm.showBrandLogo !== false}
                        onChange={(e) => setSiteForm({ ...siteForm, showBrandLogo: e.target.checked })}
                        className="rounded border-[#DDD5C5] text-[#2C5E43] focus:ring-[#2C5E43]"
                      />
                      <span>Show Brand Logo in Header Navigation</span>
                    </label>

                    {siteForm.brandLogoImage && (
                      <button
                        type="button"
                        onClick={() => setSiteForm({ ...siteForm, brandLogoImage: '' })}
                        className="text-[11px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Logo Image URL (Round Circular Header Icon)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={siteForm.brandLogoImage || ''}
                        onChange={(e) => setSiteForm({ ...siteForm, brandLogoImage: e.target.value })}
                        placeholder="https://... (direct image link, JPG/PNG/WebP/SVG)"
                        className="flex-1 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setSiteForm({ ...siteForm, brandLogoImage: DEFAULT_SITE_SETTINGS.brandLogoImage })}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 border border-[#DDD5C5] rounded-lg text-xs font-medium text-[#5B5141] shrink-0 cursor-pointer"
                        title="Reset to default herbal emblem"
                      >
                        Default Logo
                      </button>
                    </div>
                  </div>

                  {/* Preset Recommended Logos */}
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E6352] mb-1.5">
                      Or Choose One-Click Ayurvedic Logo Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '👑 Aurashka Official Emblem', url: 'https://i.ibb.co/cKMZvJyJ/IMG-9291.jpg' },
                        { label: '🌿 Green Botanicals', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=120&q=80' },
                        { label: '🌱 Pure Herbal Leaf', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&q=80' },
                        { label: '🪵 Classical Rasayana Bark', url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=120&q=80' },
                        { label: '✨ Golden Apothecary', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=120&q=80' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSiteForm({ ...siteForm, brandLogoImage: preset.url, showBrandLogo: true })}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors flex items-center gap-1.5 ${
                            siteForm.brandLogoImage === preset.url
                              ? 'bg-[#14291D] text-white border-[#14291D]'
                              : 'bg-white text-[#4A4031] border-[#DDD5C5] hover:bg-stone-100'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-3.5 h-3.5 rounded-full object-cover border border-stone-300"
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#6E6352] mt-2 bg-white p-2 rounded-lg border border-[#E5DEC\-D]">
                      🌐 <strong>Web Browser Sync:</strong> When visitors open the website, the browser tab title shows <strong>{siteForm.brandName || 'Aurashka'}</strong>, the browser favicon & OpenGraph social share card automatically preview this official image.
                    </p>
                  </div>
                </div>

                {/* Hero Badge & Titles */}
                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">
                    Hero Top Badge Text
                  </label>
                  <input
                    type="text"
                    value={siteForm.heroBadgeText ?? 'Registered Ayurvedic Formulations & Classical Rasayanas'}
                    onChange={(e) => setSiteForm({ ...siteForm, heroBadgeText: e.target.value })}
                    placeholder="e.g. Registered Ayurvedic Formulations & Classical Rasayanas"
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold"
                  />
                  <span className="text-[10px] text-[#716858] mt-0.5 block">
                    Pill badge shown at the top of the main website hero banner.
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Hero Main Title (H1)</label>
                  <input
                    type="text"
                    value={siteForm.heroTitle}
                    onChange={(e) => setSiteForm({ ...siteForm, heroTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Hero Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={siteForm.heroSubtitle}
                    onChange={(e) => setSiteForm({ ...siteForm, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                {/* Products & Catalog Section Headings */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-3">
                  <h5 className="font-serif text-xs font-bold text-[#14291D] uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#2C5E43]" />
                    <span>Products Catalog Section Heading & Description</span>
                  </h5>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Products Section Heading Title
                    </label>
                    <input
                      type="text"
                      value={siteForm.catalogSectionTitle ?? 'Products, Formulations & Apothecary Deals'}
                      onChange={(e) => setSiteForm({ ...siteForm, catalogSectionTitle: e.target.value })}
                      placeholder="e.g. Products, Formulations & Apothecary Deals"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Products Section Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      value={siteForm.catalogSectionSubtitle ?? 'Authentic herbal remedies with retail discounts, verified reseller rates & dosage charts.'}
                      onChange={(e) => setSiteForm({ ...siteForm, catalogSectionSubtitle: e.target.value })}
                      placeholder="e.g. Authentic herbal remedies with retail discounts, verified reseller rates & dosage charts."
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Top Shipping & Announcement Bar Notice</label>
                  <input
                    type="text"
                    value={siteForm.shippingNotice}
                    onChange={(e) => setSiteForm({ ...siteForm, shippingNotice: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Chief Pharmacist / Doctor</label>
                    <input
                      type="text"
                      value={siteForm.headPharmacist}
                      onChange={(e) => setSiteForm({ ...siteForm, headPharmacist: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">AYUSH Registration Number</label>
                    <input
                      type="text"
                      value={siteForm.regNumber}
                      onChange={(e) => setSiteForm({ ...siteForm, regNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Footer Copyright & Botanical Badge Customization */}
                <div className="pt-3 border-t border-[#EAE3D4] space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2C5E43]" />
                    <h5 className="font-bold text-xs text-[#14291D]">
                      Website Footer Texts (All Rights Reserved & 100% Botanical Badge)
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">
                        Footer Copyright / Rights Reserved Text
                        <span className="text-[10px] text-[#786D5C] ml-1.5 font-normal">(Tokens: {'{year}'}, {'{brandName}'})</span>
                      </label>
                      <input
                        type="text"
                        value={siteForm.footerCopyrightText ?? '© {year} {brandName}. All rights reserved.'}
                        onChange={(e) => setSiteForm({ ...siteForm, footerCopyrightText: e.target.value })}
                        placeholder="e.g. © {year} {brandName}. All rights reserved."
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">
                        Footer 100% Botanical Verification Text
                      </label>
                      <input
                        type="text"
                        value={siteForm.footerBotanicalBadgeText ?? '100% Verified Botanical Formulations & Deals'}
                        onChange={(e) => setSiteForm({ ...siteForm, footerBotanicalBadgeText: e.target.value })}
                        placeholder="e.g. 100% Verified Botanical Formulations & Deals"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
                {/* Product View Quality Assurance Badges (Ayush & Trust Box) */}
                <div className="pt-4 border-t border-[#EAE3D4] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                      <div>
                        <h5 className="font-bold text-xs text-[#14291D]">
                          Product View Quality Assurance Badges (Ayush & Quality Trust Box)
                        </h5>
                        <p className="text-[11px] text-[#716858]">
                          These 4 trust badges appear in the product view monograph ribbon for all products.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-[#E7EFEA] text-[#183624] px-2 py-0.5 rounded border border-[#A5D6B6]">
                      Product View Ribbon
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Badge 1 */}
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291D]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2C5E43]" />
                        <span>Assurance Badge #1</span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#2B251D] mb-0.5">
                          Title (Default: Ayush & GMP Certified)
                        </label>
                        <input
                          type="text"
                          value={siteForm.productAssuranceBadges?.badge1Title ?? 'Ayush & GMP Certified'}
                          onChange={(e) => setSiteForm({
                            ...siteForm,
                            productAssuranceBadges: {
                              ...siteForm.productAssuranceBadges,
                              badge1Title: e.target.value,
                            },
                          })}
                          placeholder="Ayush & GMP Certified"
                          className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#2B251D] mb-0.5">
                          Subtitle / Note (Default: Heavy-metal lab verified)
                        </label>
                        <input
                          type="text"
                          value={siteForm.productAssuranceBadges?.badge1Subtitle ?? 'Heavy-metal lab verified'}
                          onChange={(e) => setSiteForm({
                            ...siteForm,
                            productAssuranceBadges: {
                              ...siteForm.productAssuranceBadges,
                              badge1Subtitle: e.target.value,
                            },
                          })}
                          placeholder="Heavy-metal lab verified"
                          className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Badge 2 */}
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291D]">
                        <Leaf className="w-3.5 h-3.5 text-[#2C5E43]" />
                        <span>Assurance Badge #2</span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#2B251D] mb-0.5">
                          Title (Default: 100% Pure Botanical)
                        </label>
                        <input
                          type="text"
                          value={siteForm.productAssuranceBadges?.badge2Title ?? '100% Pure Botanical'}
                          onChange={(e) => setSiteForm({
                            ...siteForm,
                            productAssuranceBadges: {
                              ...siteForm.productAssuranceBadges,
                              badge2Title: e.target.value,
                            },
                          })}
                          placeholder="100% Pure Botanical"
                          className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#2B251D] mb-0.5">
                          Subtitle / Note (Default: Zero synthetic fillers)
                        </label>
                        <input
                          type="text"
                          value={siteForm.productAssuranceBadges?.badge2Subtitle ?? 'Zero synthetic fillers'}
                          onChange={(e) => setSiteForm({
                            ...siteForm,
                            productAssuranceBadges: {
                              ...siteForm.productAssuranceBadges,
                              badge2Subtitle: e.target.value,
                            },
                          })}
                          placeholder="Zero synthetic fillers"
                          className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Preview */}
                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-bold text-[#716858] block mb-1">
                      Product View Ribbon Preview:
                    </span>
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D5CCBC] grid grid-cols-2 gap-3 text-xs max-w-md">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#2C5E43] shrink-0" />
                        <div>
                          <span className="font-bold text-[#14291D] block">{siteForm.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified'}</span>
                          <span className="text-[11px] text-[#716858]">{siteForm.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-[#2C5E43] shrink-0" />
                        <div>
                          <span className="font-bold text-[#14291D] block">{siteForm.productAssuranceBadges?.badge2Title || '100% Pure Botanical'}</span>
                          <span className="text-[11px] text-[#716858]">{siteForm.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save Titles to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Quality & Ayush Assurance Badges (Product View) */}
        {activeTab === 'assurance_badges' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs">
              {/* Header Box */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E7EFEA] border border-[#B5D6C4] flex items-center justify-center text-[#2C5E43]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#14291D]">
                        Product View Quality Assurance Badges
                      </h4>
                      <p className="text-[11px] text-[#6E6352]">
                        Configure the 4 core trust badges: "Ayush & GMP Certified", "Heavy-metal lab verified", "100% Pure Botanical", "Zero synthetic fillers".
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>Save to Firebase</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-[#6E6352]">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSiteForm({
                        ...siteForm,
                        productAssuranceBadges: {
                          badge1Title: 'Ayush & GMP Certified',
                          badge1Subtitle: 'Heavy-metal lab verified',
                          badge2Title: '100% Pure Botanical',
                          badge2Subtitle: 'Zero synthetic fillers',
                        },
                      });
                    }}
                    className="px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-[11px] hover:bg-stone-100 cursor-pointer font-medium"
                  >
                    Standard Classical Ayush
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSiteForm({
                        ...siteForm,
                        productAssuranceBadges: {
                          badge1Title: '100% Certified Organic',
                          badge1Subtitle: 'Wild-harvested botanicals',
                          badge2Title: 'Pure Phytochemical Assay',
                          badge2Subtitle: 'Zero synthetic additives',
                        },
                      });
                    }}
                    className="px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-[11px] hover:bg-stone-100 cursor-pointer font-medium"
                  >
                    Certified Organic Botanical
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSiteForm({
                        ...siteForm,
                        productAssuranceBadges: {
                          badge1Title: 'AYUSH Pharmacopoeia Grade',
                          badge1Subtitle: 'Standardized extracts',
                          badge2Title: 'Ancient Shastra Formulation',
                          badge2Subtitle: 'No artificial preservatives',
                        },
                      });
                    }}
                    className="px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-[11px] hover:bg-stone-100 cursor-pointer font-medium"
                  >
                    Pharmacopoeia Monograph Grade
                  </button>
                </div>

                {/* Editor Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Badge 1 Card */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-3">
                    <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-2">
                      <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                      <span className="font-bold text-xs text-[#14291D]">Assurance Badge #1</span>
                    </div>

                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">
                        Badge 1 Title / Heading <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={siteForm.productAssuranceBadges?.badge1Title ?? 'Ayush & GMP Certified'}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          productAssuranceBadges: {
                            ...siteForm.productAssuranceBadges,
                            badge1Title: e.target.value,
                          },
                        })}
                        placeholder="e.g. Ayush & GMP Certified"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">
                        Badge 1 Subtitle / Verification Detail
                      </label>
                      <input
                        type="text"
                        value={siteForm.productAssuranceBadges?.badge1Subtitle ?? 'Heavy-metal lab verified'}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          productAssuranceBadges: {
                            ...siteForm.productAssuranceBadges,
                            badge1Subtitle: e.target.value,
                          },
                        })}
                        placeholder="e.g. Heavy-metal lab verified"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs text-[#524838]"
                      />
                    </div>
                  </div>

                  {/* Badge 2 Card */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-3">
                    <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-2">
                      <Leaf className="w-4 h-4 text-[#2C5E43]" />
                      <span className="font-bold text-xs text-[#14291D]">Assurance Badge #2</span>
                    </div>

                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">
                        Badge 2 Title / Heading <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={siteForm.productAssuranceBadges?.badge2Title ?? '100% Pure Botanical'}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          productAssuranceBadges: {
                            ...siteForm.productAssuranceBadges,
                            badge2Title: e.target.value,
                          },
                        })}
                        placeholder="e.g. 100% Pure Botanical"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">
                        Badge 2 Subtitle / Filler & Purity Detail
                      </label>
                      <input
                        type="text"
                        value={siteForm.productAssuranceBadges?.badge2Subtitle ?? 'Zero synthetic fillers'}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          productAssuranceBadges: {
                            ...siteForm.productAssuranceBadges,
                            badge2Subtitle: e.target.value,
                          },
                        })}
                        placeholder="e.g. Zero synthetic fillers"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs text-[#524838]"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="pt-3 border-t border-[#EAE3D4] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#716858] block">
                    Live Product View Ribbon Preview:
                  </span>
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D5CCBC] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-w-lg shadow-2xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#2C5E43] shrink-0" />
                      <div>
                        <span className="font-bold text-[#14291D] block">
                          {siteForm.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified'}
                        </span>
                        <span className="text-[11px] text-[#716858]">
                          {siteForm.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-[#2C5E43] shrink-0" />
                      <div>
                        <span className="font-bold text-[#14291D] block">
                          {siteForm.productAssuranceBadges?.badge2Title || '100% Pure Botanical'}
                        </span>
                        <span className="text-[11px] text-[#716858]">
                          {siteForm.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Catalog Status Table */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#14291D]">
                      Individual Product Overrides ({products.length} Products)
                    </h4>
                    <p className="text-[11px] text-[#6E6352]">
                      Each product automatically uses the site defaults above, or you can customize badges per product.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#DDD5C5] text-[#695F4F]">
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Badge 1 (Ayush/GMP)</th>
                        <th className="py-2 px-3">Badge 2 (Botanical/Fillers)</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE3D4]">
                      {products.map((p) => {
                        const hasCustom = Boolean(p.assuranceBadges?.badge1Title || p.assuranceBadges?.badge2Title);
                        const b1Title = p.assuranceBadges?.badge1Title || siteForm.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified';
                        const b1Sub = p.assuranceBadges?.badge1Subtitle || siteForm.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified';
                        const b2Title = p.assuranceBadges?.badge2Title || siteForm.productAssuranceBadges?.badge2Title || '100% Pure Botanical';
                        const b2Sub = p.assuranceBadges?.badge2Subtitle || siteForm.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers';

                        return (
                          <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-[#14291D] block">{p.name}</span>
                              <span className="text-[10px] text-[#716858] italic">{p.sanskritName}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-[#183624] block">{b1Title}</span>
                              <span className="text-[10.5px] text-[#716858]">{b1Sub}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-[#183624] block">{b2Title}</span>
                              <span className="text-[10.5px] text-[#716858]">{b2Sub}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              {hasCustom ? (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                                  Custom Override
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-[#E7EFEA] text-[#183624] text-[10px] font-bold">
                                  Site Default
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('products');
                                  startEdit(p);
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-[#14291D] rounded border border-[#DDD5C5] text-[11px] font-semibold cursor-pointer"
                              >
                                Edit Product
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save All Assurance Badges to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: WhatsApp & Email Custom Messages */}
        {activeTab === 'messages' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs">
              {/* Overview Card */}
              <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#25D366]" />
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#14291D]">
                        WhatsApp & Email Message Customizer
                      </h4>
                      <p className="text-[11px] text-[#6E6352]">
                        Control every automated text sent to your Firebase updated WhatsApp numbers and Email desks.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSiteForm({
                        ...siteForm,
                        messageTemplates: { ...DEFAULT_MESSAGE_TEMPLATES },
                      });
                      setSaveSuccessMsg('Restored all message templates to default!');
                      setTimeout(() => setSaveSuccessMsg(null), 3000);
                    }}
                    className="px-3 py-1 bg-white border border-[#DDD5C5] text-[#5A5040] hover:text-[#14291D] rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore Defaults</span>
                  </button>
                </div>

                {/* Option: Include Logged In User Info Toggle */}
                <div className="p-3.5 bg-white rounded-xl border-2 border-[#A5D6B6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <label className="font-bold text-[#14291D] flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={siteForm.messageTemplates?.includeUserInfo ?? true}
                        onChange={(e) => handleUpdateMessageTemplate('includeUserInfo', e.target.checked)}
                        className="w-4 h-4 text-[#2C5E43] rounded cursor-pointer"
                      />
                      <span>Automatically Include Logged-In User Details (Name, Email, Timestamp)</span>
                    </label>
                    <p className="text-[11px] text-[#635948] pl-6">
                      When enabled, patient's name, registered email, and message timestamp are automatically added to the message so you know their profile right inside WhatsApp and Email.
                    </p>
                  </div>

                  <div className="text-[10px] bg-[#EBF5EF] text-[#183624] font-mono px-2.5 py-1.5 rounded-lg border border-[#BBDDC7] shrink-0">
                    Active: {currentUser ? currentUser.name : 'Guest User'} ({currentUser ? currentUser.email : 'Not signed in'})
                  </div>
                </div>

                {/* Available Variables Guide */}
                <div className="bg-white p-3 rounded-lg border border-[#E7DFD1] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#7A705E] block">
                    Available Template Variables (Placeholders replace automatically):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '{brandName}',
                      '{userName}',
                      '{userEmail}',
                      '{currentTime}',
                      '{productName}',
                      '{productPrice}',
                      '{resellerInfo}',
                      '{cartSummary}',
                      '{cartTotal}',
                      '{ailment}',
                      '{subject}',
                      '{message}',
                    ].map((token) => (
                      <span
                        key={token}
                        className="font-mono text-[10px] px-2 py-0.5 bg-[#FAF6F0] text-[#14291D] border border-[#DDD5C5] rounded font-semibold"
                        title="Click to copy or type in template"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1. Header & Quick Floating Widget Messages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Header WhatsApp Message */}
                <div className="bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#14291D] text-xs">
                      1. Top Header Ribbon WhatsApp Message
                    </label>
                    <span className="text-[10px] text-[#716858]">Top Ribbon</span>
                  </div>
                  <textarea
                    rows={2}
                    value={siteForm.messageTemplates?.headerWhatsApp ?? DEFAULT_MESSAGE_TEMPLATES.headerWhatsApp}
                    onChange={(e) => handleUpdateMessageTemplate('headerWhatsApp', e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="p-2 bg-[#F2EDE1]/50 rounded text-[10px] text-[#554C3E] italic">
                    <strong>Preview:</strong> "{formatCustomMessage(
                      siteForm.messageTemplates?.headerWhatsApp || DEFAULT_MESSAGE_TEMPLATES.headerWhatsApp,
                      { brandName: siteForm.brandName },
                      currentUser,
                      siteForm.messageTemplates?.includeUserInfo ?? true
                    )}"
                  </div>
                </div>

                {/* Floating Widget WhatsApp Message */}
                <div className="bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#14291D] text-xs">
                      2. Floating Bottom Widget WhatsApp Message
                    </label>
                    <span className="text-[10px] text-[#716858]">Bottom Right Widget & Tooltip</span>
                  </div>
                  <textarea
                    rows={2}
                    value={siteForm.messageTemplates?.floatingWhatsApp ?? DEFAULT_MESSAGE_TEMPLATES.floatingWhatsApp}
                    onChange={(e) => handleUpdateMessageTemplate('floatingWhatsApp', e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="p-2 bg-[#F2EDE1]/50 rounded text-[10px] text-[#554C3E] italic">
                    <strong>Preview:</strong> "{formatCustomMessage(
                      siteForm.messageTemplates?.floatingWhatsApp || DEFAULT_MESSAGE_TEMPLATES.floatingWhatsApp,
                      { brandName: siteForm.brandName },
                      currentUser,
                      siteForm.messageTemplates?.includeUserInfo ?? true
                    )}"
                  </div>
                </div>
              </div>

              {/* 2. Front Contact Bar & Hero Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front Contact Bar WhatsApp Message */}
                <div className="bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#14291D] text-xs">
                      3. Front Contact Bar WhatsApp Message
                    </label>
                    <span className="text-[10px] text-[#716858]">Under Hero</span>
                  </div>
                  <textarea
                    rows={2}
                    value={siteForm.messageTemplates?.frontContactBarWhatsApp ?? DEFAULT_MESSAGE_TEMPLATES.frontContactBarWhatsApp}
                    onChange={(e) => handleUpdateMessageTemplate('frontContactBarWhatsApp', e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="p-2 bg-[#F2EDE1]/50 rounded text-[10px] text-[#554C3E] italic">
                    <strong>Preview:</strong> "{formatCustomMessage(
                      siteForm.messageTemplates?.frontContactBarWhatsApp || DEFAULT_MESSAGE_TEMPLATES.frontContactBarWhatsApp,
                      { brandName: siteForm.brandName },
                      currentUser,
                      siteForm.messageTemplates?.includeUserInfo ?? true
                    )}"
                  </div>
                </div>

                {/* Hero Section WhatsApp Consultation */}
                <div className="bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#14291D] text-xs">
                      4. Hero Banner WhatsApp Consultation Message
                    </label>
                    <span className="text-[10px] text-[#716858]">Hero Action Button</span>
                  </div>
                  <textarea
                    rows={2}
                    value={siteForm.messageTemplates?.heroWhatsApp ?? DEFAULT_MESSAGE_TEMPLATES.heroWhatsApp}
                    onChange={(e) => handleUpdateMessageTemplate('heroWhatsApp', e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="p-2 bg-[#F2EDE1]/50 rounded text-[10px] text-[#554C3E] italic">
                    <strong>Preview:</strong> "{formatCustomMessage(
                      siteForm.messageTemplates?.heroWhatsApp || DEFAULT_MESSAGE_TEMPLATES.heroWhatsApp,
                      { brandName: siteForm.brandName },
                      currentUser,
                      siteForm.messageTemplates?.includeUserInfo ?? true
                    )}"
                  </div>
                </div>
              </div>

              {/* 3. Product & Cart Order WhatsApp Messages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Inquiry WhatsApp Message */}
                <div className="bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#14291D] text-xs">
                      5. Product Card & Monograph WhatsApp Order
                    </label>
                    <span className="text-[10px] text-[#716858]">Tokens: {'{productName}'}, {'{productPrice}'}, {'{resellerInfo}'}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={siteForm.messageTemplates?.productInquiryWhatsApp ?? DEFAULT_MESSAGE_TEMPLATES.productInquiryWhatsApp}
                    onChange={(e) => handleUpdateMessageTemplate('productInquiryWhatsApp', e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="p-2 bg-[#F2EDE1]/50 rounded text-[10px] text-[#554C3E] italic whitespace-pre-wrap">
                    <strong>Simulated Product Order Preview:</strong>\n"{formatCustomMessage(
                      siteForm.messageTemplates?.productInquiryWhatsApp || DEFAULT_MESSAGE_TEMPLATES.productInquiryWhatsApp,
                      {
                        brandName: siteForm.brandName,
                        productName: 'Shilajit Pure Himalayan Resin',
                        productPrice: 1199,
                        resellerInfo: ', Reseller Wholesale: ₹890',
                      },
                      currentUser,
                      siteForm.messageTemplates?.includeUserInfo ?? true
                    )}"
                  </div>
                </div>

                {/* Cart Order WhatsApp Message */}
                <div className="bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#14291D] text-xs">
                      6. Dispensary Bag Checkout Message
                    </label>
                    <span className="text-[10px] text-[#716858]">Tokens: {'{cartSummary}'}, {'{cartTotal}'}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={siteForm.messageTemplates?.cartOrderWhatsApp ?? DEFAULT_MESSAGE_TEMPLATES.cartOrderWhatsApp}
                    onChange={(e) => handleUpdateMessageTemplate('cartOrderWhatsApp', e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="p-2 bg-[#F2EDE1]/50 rounded text-[10px] text-[#554C3E] italic whitespace-pre-wrap max-h-24 overflow-y-auto">
                    <strong>Simulated Bag Checkout Preview:</strong>\n"{formatCustomMessage(
                      siteForm.messageTemplates?.cartOrderWhatsApp || DEFAULT_MESSAGE_TEMPLATES.cartOrderWhatsApp,
                      {
                        brandName: siteForm.brandName,
                        cartSummary: '1. Ashwagandha KSM-66 (60 Capsules) - Qty: 2 = ₹1298\n2. Brahmi Taila (200ml) - Qty: 1 = ₹349',
                        cartTotal: 1647,
                      },
                      currentUser,
                      siteForm.messageTemplates?.includeUserInfo ?? true
                    )}"
                  </div>
                </div>
              </div>

              {/* 4. Consultation & Direct Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Consultation Modal WhatsApp Message */}
                <div className="bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#14291D] text-xs">
                      7. Doctor Consultation Modal WhatsApp Message
                    </label>
                    <span className="text-[10px] text-[#716858]">Token: {'{ailment}'}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={siteForm.messageTemplates?.consultationWhatsApp ?? DEFAULT_MESSAGE_TEMPLATES.consultationWhatsApp}
                    onChange={(e) => handleUpdateMessageTemplate('consultationWhatsApp', e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                  <div className="p-2 bg-[#F2EDE1]/50 rounded text-[10px] text-[#554C3E] italic whitespace-pre-wrap">
                    <strong>Preview:</strong>\n"{formatCustomMessage(
                      siteForm.messageTemplates?.consultationWhatsApp || DEFAULT_MESSAGE_TEMPLATES.consultationWhatsApp,
                      {
                        brandName: siteForm.brandName,
                        ailment: 'Chronic Joint Stiffness & Low Energy',
                      },
                      currentUser,
                      siteForm.messageTemplates?.includeUserInfo ?? true
                    )}"
                  </div>
                </div>

                {/* Email Subject & Body Templates */}
                <div className="bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#14291D] text-xs">
                      8. Patient Direct Email Subject & Body
                    </label>
                    <span className="text-[10px] text-[#716858]">Tokens: {'{subject}'}, {'{message}'}</span>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#716858] block mb-0.5">Email Subject:</label>
                    <input
                      type="text"
                      value={siteForm.messageTemplates?.contactFormEmailSubject ?? DEFAULT_MESSAGE_TEMPLATES.contactFormEmailSubject}
                      onChange={(e) => handleUpdateMessageTemplate('contactFormEmailSubject', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#716858] block mb-0.5">Email Body:</label>
                    <textarea
                      rows={2}
                      value={siteForm.messageTemplates?.contactFormEmailBody ?? DEFAULT_MESSAGE_TEMPLATES.contactFormEmailBody}
                      onChange={(e) => handleUpdateMessageTemplate('contactFormEmailBody', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save All Custom Messages to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
