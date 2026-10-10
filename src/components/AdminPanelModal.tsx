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
  ProductAssuranceBadges,
  BannerSlideItem,
  BannerSliderConfig,
  ProductHorizontalList,
  HorizontalListCardFields,
  HeaderBannerConfig,
  CategoryAppearanceConfig,
  CategoryImagePosition,
  CategoryImageSize,
  CategoryImageShape,
  MarqueeConfig,
  MarqueeItem,
  MarqueePlacement,
  MarqueeSize,
  MarqueeDirection,
  MarqueeDividerIcon,
  ProductMonographTab,
  MonographDetailItem,
  MonographPriority
} from '../types/pharmacy';
import { MarqueeTicker } from './MarqueeTicker';
import { ProductMonographTabs } from './ProductMonographTabs';
import { AdminMonographTabsManager } from './AdminMonographTabsManager';
import { 
  buildDefaultMonographTabs, 
  getEffectiveMonographTabs, 
  getPriorityCardClasses, 
  getPriorityTagClasses, 
  HERB_IMAGE_MAP 
} from '../utils/monographHelper';
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
  MapPin,
  ExternalLink,
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
  Package,
  EyeOff,
  SlidersHorizontal,
  ListPlus,
  LayoutGrid,
  CheckSquare,
  Square,
  Play,
  Video,
  Film,
  Palette,
  Circle,
  ArrowLeft,
  ArrowRight,
  Repeat,
  MoveHorizontal,
  ScrollText,
  Quote,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { backupAllCatalogToFirebase, backupSiteSettingsToFirebase, backupCatalogMetaToFirebase, backupProductToFirebase } from '../utils/firebaseSync';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS, SORT_BADGE_OPTIONS, DEFAULT_SITE_SETTINGS, DEFAULT_BANNER_SLIDER, DEFAULT_PRODUCT_HORIZONTAL_LISTS, DEFAULT_MARQUEE_CONFIG } from '../data/herbalProducts';
import { detectVideoType, getYouTubeEmbedUrl, getYouTubeThumbnail, isValidVideoUrl } from '../utils/videoHelper';
import { GRADIENT_OVERLAY_OPTIONS, GradientOverlayStyle, getProductBottomOverlayClasses } from '../utils/gradientHelper';

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
  const [activeTab, setActiveTab] = useState<'products' | 'monograph_tabs' | 'deal_of_week' | 'marquee' | 'horizontal_lists' | 'categories_forms' | 'contacts' | 'people' | 'site_titles' | 'assurance_badges' | 'messages'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<HerbalProduct | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [editingMarqueeItemId, setEditingMarqueeItemId] = useState<string | null>(null);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>(products[0]?.id || '');

  // ══════════════════════════════════════════════════════════════════════════
  // Product Detail Monograph Tabs Management State (Tabs 1-6 & Custom Tabs)
  // ══════════════════════════════════════════════════════════════════════════
  const [selectedProductForMonographId, setSelectedProductForMonographId] = useState<string>(products[0]?.id || '');
  const [activeMonographTabId, setActiveMonographTabId] = useState<string>('overview');
  const [isAddingCustomTab, setIsAddingCustomTab] = useState(false);
  const [newCustomTabTitle, setNewCustomTabTitle] = useState('');
  const [newCustomTabSubtitle, setNewCustomTabSubtitle] = useState('');
  const [newCustomTabIcon, setNewCustomTabIcon] = useState('sparkles');

  // Editing tab meta
  const [editingTabMetaId, setEditingTabMetaId] = useState<string | null>(null);
  const [editingTabTitle, setEditingTabTitle] = useState('');
  const [editingTabSubtitle, setEditingTabSubtitle] = useState('');

  // Editing / adding detail items inside tab
  const [isAddingDetailItem, setIsAddingDetailItem] = useState(false);
  const [editingDetailItemId, setEditingDetailItemId] = useState<string | null>(null);
  const [itemTitleInput, setItemTitleInput] = useState('');
  const [itemTextInput, setItemTextInput] = useState('');
  const [itemPriorityInput, setItemPriorityInput] = useState<MonographPriority>('normal');
  const [itemCustomTagInput, setItemCustomTagInput] = useState('');
  const [itemCustomTagBgColorInput, setItemCustomTagBgColorInput] = useState('');
  const [itemCustomTagTextColorInput, setItemCustomTagTextColorInput] = useState('');
  // Ingredient extras:
  const [itemImageUrlInput, setItemImageUrlInput] = useState('');
  const [itemImageSizeInput, setItemImageSizeInput] = useState<'small' | 'medium' | 'large'>('medium');
  const [itemBotanicalNameInput, setItemBotanicalNameInput] = useState('');
  const [itemPotencyInput, setItemPotencyInput] = useState('');
  const [itemRoleInput, setItemRoleInput] = useState('');
  // Feedback & Review extras:
  const [itemIsReviewInput, setItemIsReviewInput] = useState(false);
  const [itemAuthorInput, setItemAuthorInput] = useState('');
  const [itemRatingInput, setItemRatingInput] = useState(5);
  const [itemDateInput, setItemDateInput] = useState('');
  // FAQ extras:
  const [itemIsFaqInput, setItemIsFaqInput] = useState(false);
  const [monographDeleteConfirmTabId, setMonographDeleteConfirmTabId] = useState<string | null>(null);

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
  const [editingCatImageUrl, setEditingCatImageUrl] = useState('');
  const [editingCatShowImage, setEditingCatShowImage] = useState(true);
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatImageUrl, setNewCatImageUrl] = useState('');
  const [newCatShowImage, setNewCatShowImage] = useState(true);

  const [editingFormIdx, setEditingFormIdx] = useState<number | null>(null);
  const [editingFormName, setEditingFormName] = useState('');
  const [editingFormImageUrl, setEditingFormImageUrl] = useState('');
  const [editingFormShowImage, setEditingFormShowImage] = useState(true);
  const [newFormName, setNewFormName] = useState('');
  const [newFormImageUrl, setNewFormImageUrl] = useState('');
  const [newFormShowImage, setNewFormShowImage] = useState(true);

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
    showAssuranceBadges: true,
    showBadge1: true,
    showBadge2: true,
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
    videoUrl: '',
    videoType: 'none' as 'youtube' | 'direct' | 'none',
    primaryImageGradient: 'default' as 'default' | GradientOverlayStyle,
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
      showHeroBadge: s.showHeroBadge !== undefined ? Boolean(s.showHeroBadge) : true,
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
      productAssuranceBadges: {
        showBadges: s.productAssuranceBadges?.showBadges !== undefined ? Boolean(s.productAssuranceBadges.showBadges) : true,
        showBadge1: s.productAssuranceBadges?.showBadge1 !== undefined ? Boolean(s.productAssuranceBadges.showBadge1) : true,
        showBadge2: s.productAssuranceBadges?.showBadge2 !== undefined ? Boolean(s.productAssuranceBadges.showBadge2) : true,
        badge1Title: s.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified',
        badge1Subtitle: s.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified',
        badge2Title: s.productAssuranceBadges?.badge2Title || '100% Pure Botanical',
        badge2Subtitle: s.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers',
      },
      bannerSlider: {
        enabled: s.bannerSlider?.enabled !== undefined ? Boolean(s.bannerSlider.enabled) : (DEFAULT_BANNER_SLIDER?.enabled ?? true),
        autoScrollSeconds: s.bannerSlider?.autoScrollSeconds || DEFAULT_BANNER_SLIDER?.autoScrollSeconds || 4,
        aspectRatio: (s.bannerSlider?.aspectRatio as BannerSliderConfig['aspectRatio']) || DEFAULT_BANNER_SLIDER?.aspectRatio || 'auto',
        customHeightPx: s.bannerSlider?.customHeightPx ? Number(s.bannerSlider.customHeightPx) : undefined,
        overlayStyle: (s.bannerSlider?.overlayStyle as BannerSliderConfig['overlayStyle']) || 'none',
        items: (Array.isArray(s.bannerSlider?.items)
          ? s.bannerSlider.items
          : (s.bannerSlider?.items && typeof s.bannerSlider.items === 'object'
            ? Object.values(s.bannerSlider.items)
            : (DEFAULT_BANNER_SLIDER?.items || []))) as BannerSlideItem[],
      },
      productImageGradient: s.productImageGradient || 'none',
      productHorizontalLists: (Array.isArray(s.productHorizontalLists) && s.productHorizontalLists.length > 0
        ? s.productHorizontalLists
        : (s.productHorizontalLists && typeof s.productHorizontalLists === 'object' && Object.values(s.productHorizontalLists).length > 0
          ? Object.values(s.productHorizontalLists)
          : (DEFAULT_PRODUCT_HORIZONTAL_LISTS || []))) as ProductHorizontalList[],
      showStoreMap: s.showStoreMap !== undefined ? Boolean(s.showStoreMap) : (DEFAULT_SITE_SETTINGS.showStoreMap ?? true),
      storeMap: {
        enabled: s.storeMap?.enabled !== undefined ? Boolean(s.storeMap.enabled) : (s.showStoreMap !== undefined ? Boolean(s.showStoreMap) : (DEFAULT_SITE_SETTINGS.storeMap?.enabled ?? true)),
        mapQuery: s.storeMap?.mapQuery || s.storeAddress || DEFAULT_SITE_SETTINGS.storeMap?.mapQuery || 'New Delhi, India',
        googleMapsUrl: s.storeMap?.googleMapsUrl || DEFAULT_SITE_SETTINGS.storeMap?.googleMapsUrl || '',
        embedUrl: s.storeMap?.embedUrl || '',
        locationTitle: s.storeMap?.locationTitle || DEFAULT_SITE_SETTINGS.storeMap?.locationTitle || 'Apothecary Dispensary & Botanical Garden',
        locationSubtitle: s.storeMap?.locationSubtitle || DEFAULT_SITE_SETTINGS.storeMap?.locationSubtitle || 'Physical Pharmacy Counter, Visiting Hours & Medicine Dispatch',
        zoom: s.storeMap?.zoom || DEFAULT_SITE_SETTINGS.storeMap?.zoom || 15,
      },
      headerBanner: {
        backgroundType: s.headerBanner?.backgroundType || DEFAULT_SITE_SETTINGS.headerBanner?.backgroundType || 'color',
        backgroundColor: s.headerBanner?.backgroundColor || DEFAULT_SITE_SETTINGS.headerBanner?.backgroundColor || '#14291D',
        backgroundImageUrl: s.headerBanner?.backgroundImageUrl !== undefined ? s.headerBanner.backgroundImageUrl : (DEFAULT_SITE_SETTINGS.headerBanner?.backgroundImageUrl || ''),
        imageFit: s.headerBanner?.imageFit || DEFAULT_SITE_SETTINGS.headerBanner?.imageFit || 'cover',
        imagePosition: s.headerBanner?.imagePosition || DEFAULT_SITE_SETTINGS.headerBanner?.imagePosition || 'center center',
        showAtmosphereBlur: s.headerBanner?.showAtmosphereBlur !== undefined ? Boolean(s.headerBanner.showAtmosphereBlur) : (DEFAULT_SITE_SETTINGS.headerBanner?.showAtmosphereBlur ?? true),
        overlayColor: s.headerBanner?.overlayColor || DEFAULT_SITE_SETTINGS.headerBanner?.overlayColor || 'black',
        overlayOpacity: s.headerBanner?.overlayOpacity !== undefined ? Number(s.headerBanner.overlayOpacity) : (DEFAULT_SITE_SETTINGS.headerBanner?.overlayOpacity ?? 35),
        textColorTheme: s.headerBanner?.textColorTheme || DEFAULT_SITE_SETTINGS.headerBanner?.textColorTheme || 'auto',
        topNavBackground: s.headerBanner?.topNavBackground || DEFAULT_SITE_SETTINGS.headerBanner?.topNavBackground || 'default',
      },
      topNav: {
        backgroundStyle: s.topNav?.backgroundStyle || DEFAULT_SITE_SETTINGS.topNav?.backgroundStyle || 'default',
      },
      categoryAppearance: {
        showImages: s.categoryAppearance?.showImages !== undefined ? Boolean(s.categoryAppearance.showImages) : (DEFAULT_SITE_SETTINGS.categoryAppearance?.showImages ?? true),
        imagePosition: s.categoryAppearance?.imagePosition || DEFAULT_SITE_SETTINGS.categoryAppearance?.imagePosition || 'left',
        imageSize: s.categoryAppearance?.imageSize || DEFAULT_SITE_SETTINGS.categoryAppearance?.imageSize || 'medium',
        customImageSizePx: s.categoryAppearance?.customImageSizePx ? Number(s.categoryAppearance.customImageSizePx) : (DEFAULT_SITE_SETTINGS.categoryAppearance?.customImageSizePx || 26),
        imageShape: s.categoryAppearance?.imageShape || DEFAULT_SITE_SETTINGS.categoryAppearance?.imageShape || 'circle',
        allProductsImageUrl: s.categoryAppearance?.allProductsImageUrl !== undefined ? s.categoryAppearance.allProductsImageUrl : (DEFAULT_SITE_SETTINGS.categoryAppearance?.allProductsImageUrl || ''),
        showAllProductsImage: s.categoryAppearance?.showAllProductsImage !== undefined ? Boolean(s.categoryAppearance.showAllProductsImage) : (DEFAULT_SITE_SETTINGS.categoryAppearance?.showAllProductsImage ?? true),
        allFormsImageUrl: s.categoryAppearance?.allFormsImageUrl !== undefined ? s.categoryAppearance.allFormsImageUrl : (DEFAULT_SITE_SETTINGS.categoryAppearance?.allFormsImageUrl || ''),
        showAllFormsImage: s.categoryAppearance?.showAllFormsImage !== undefined ? Boolean(s.categoryAppearance.showAllFormsImage) : (DEFAULT_SITE_SETTINGS.categoryAppearance?.showAllFormsImage ?? true),
        formImages: s.categoryAppearance?.formImages && typeof s.categoryAppearance.formImages === 'object' ? s.categoryAppearance.formImages : (DEFAULT_SITE_SETTINGS.categoryAppearance?.formImages || {}),
      },
      marquee: {
        enabled: s.marquee?.enabled !== undefined ? Boolean(s.marquee.enabled) : (DEFAULT_MARQUEE_CONFIG?.enabled ?? true),
        placement: s.marquee?.placement || DEFAULT_MARQUEE_CONFIG?.placement || 'below_header',
        direction: s.marquee?.direction || DEFAULT_MARQUEE_CONFIG?.direction || 'left',
        speedSeconds: s.marquee?.speedSeconds ? Number(s.marquee.speedSeconds) : (DEFAULT_MARQUEE_CONFIG?.speedSeconds || 26),
        pauseOnHover: s.marquee?.pauseOnHover !== undefined ? Boolean(s.marquee.pauseOnHover) : (DEFAULT_MARQUEE_CONFIG?.pauseOnHover ?? true),
        backgroundColor: s.marquee?.backgroundColor || DEFAULT_MARQUEE_CONFIG?.backgroundColor || '#14291D',
        textColor: s.marquee?.textColor || DEFAULT_MARQUEE_CONFIG?.textColor || '#FFFFFF',
        fontSize: s.marquee?.fontSize || DEFAULT_MARQUEE_CONFIG?.fontSize || 'medium',
        paddingSize: s.marquee?.paddingSize || DEFAULT_MARQUEE_CONFIG?.paddingSize || 'regular',
        dividerIcon: s.marquee?.dividerIcon || DEFAULT_MARQUEE_CONFIG?.dividerIcon || 'leaf',
        showBorder: s.marquee?.showBorder !== undefined ? Boolean(s.marquee.showBorder) : (DEFAULT_MARQUEE_CONFIG?.showBorder ?? true),
        borderColor: s.marquee?.borderColor || DEFAULT_MARQUEE_CONFIG?.borderColor || '#234632',
        items: Array.isArray(s.marquee?.items) && s.marquee.items.length > 0
          ? s.marquee.items
          : (s.marquee?.items && typeof s.marquee.items === 'object' && Object.values(s.marquee.items).length > 0
            ? (Object.values(s.marquee.items) as any[])
            : (DEFAULT_MARQUEE_CONFIG?.items || [])),
      },
    };
  };

  // Site Settings & Multiple Contacts Local Form State
  const [siteForm, setSiteForm] = useState<SiteSettings>(() => normalizeSettings(siteSettings));

  useEffect(() => {
    if (siteSettings) {
      setSiteForm(normalizeSettings(siteSettings));
    }
  }, [siteSettings]);

  const updateHeaderBanner = (updates: Partial<HeaderBannerConfig>) => {
    setSiteForm(prev => ({
      ...prev,
      headerBanner: {
        ...(prev.headerBanner || DEFAULT_SITE_SETTINGS.headerBanner!),
        ...updates,
      },
    }));
  };

  const updateCategoryAppearance = (updates: Partial<CategoryAppearanceConfig>) => {
    const updated: SiteSettings = {
      ...siteForm,
      categoryAppearance: {
        ...(siteForm.categoryAppearance || DEFAULT_SITE_SETTINGS.categoryAppearance!),
        ...updates,
      },
    };
    setSiteForm(updated);
    onUpdateSiteSettings(updated);
  };

  const handleUpdateFormImage = (formName: string, imageUrl: string, showImage = true) => {
    const currentFormImages = siteForm.categoryAppearance?.formImages || DEFAULT_SITE_SETTINGS.categoryAppearance?.formImages || {};
    const updatedFormImages = {
      ...currentFormImages,
      [formName]: {
        imageUrl: imageUrl.trim(),
        showImage,
      },
    };
    updateCategoryAppearance({ formImages: updatedFormImages });
  };

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

  // Banner Slider (Above Weekly Deal) Management Helpers
  const currentBannerSlider: BannerSliderConfig = {
    enabled: siteForm.bannerSlider?.enabled ?? true,
    autoScrollSeconds: siteForm.bannerSlider?.autoScrollSeconds || 4,
    aspectRatio: siteForm.bannerSlider?.aspectRatio || 'auto',
    customHeightPx: siteForm.bannerSlider?.customHeightPx ? Number(siteForm.bannerSlider.customHeightPx) : undefined,
    overlayStyle: siteForm.bannerSlider?.overlayStyle || 'none',
    items: Array.isArray(siteForm.bannerSlider?.items)
      ? siteForm.bannerSlider.items
      : (siteForm.bannerSlider?.items && typeof siteForm.bannerSlider.items === 'object'
        ? (Object.values(siteForm.bannerSlider.items) as BannerSlideItem[])
        : (DEFAULT_BANNER_SLIDER?.items || [])),
  };

  const handleUpdateBannerSlider = (updates: Partial<BannerSliderConfig>) => {
    const updated: BannerSliderConfig = {
      ...currentBannerSlider,
      ...updates,
    };
    const updatedSiteSettings = {
      ...siteForm,
      bannerSlider: updated,
    };
    setSiteForm(updatedSiteSettings);
    onUpdateSiteSettings(updatedSiteSettings);
  };

  const handleUpdateStoreProductGradient = async (style: GradientOverlayStyle) => {
    const updatedSiteSettings: SiteSettings = {
      ...siteForm,
      productImageGradient: style,
    };
    setSiteForm(updatedSiteSettings);
    onUpdateSiteSettings(updatedSiteSettings);
    await backupSiteSettingsToFirebase(updatedSiteSettings);
    setSaveSuccessMsg(`Store-wide Product Image Gradient set to "${style}"!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleAddBannerSlide = () => {
    const newSlide: BannerSlideItem = {
      id: `banner-${Date.now()}`,
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80',
      title: 'New Formulation Special',
      subtitle: 'Pure botanical herbs & classical rasayanas with verified potency',
      linkType: 'category',
      category: 'immunity',
      altText: 'Apothecary Banner',
    };
    handleUpdateBannerSlider({ items: [...currentBannerSlider.items, newSlide], enabled: true });
    setSaveSuccessMsg('Added new banner image slide! Click Save when finished.');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleUpdateBannerSlide = (idx: number, field: keyof BannerSlideItem, value: any) => {
    const items = [...currentBannerSlider.items];
    if (!items[idx]) return;
    items[idx] = {
      ...items[idx],
      [field]: value,
    };
    handleUpdateBannerSlider({ items });
  };

  const handleDeleteBannerSlide = (idx: number) => {
    const items = currentBannerSlider.items.filter((_, i) => i !== idx);
    handleUpdateBannerSlider({ items });
  };

  const handleMoveBannerSlide = (idx: number, direction: 'up' | 'down') => {
    const items = [...currentBannerSlider.items];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[idx];
    items[idx] = items[targetIdx];
    items[targetIdx] = temp;
    handleUpdateBannerSlider({ items });
  };

  const handleRestoreDefaultBanners = () => {
    handleUpdateBannerSlider({
      enabled: true,
      autoScrollSeconds: 4,
      aspectRatio: 'auto',
      items: DEFAULT_BANNER_SLIDER.items,
    });
    setSaveSuccessMsg('Restored default banner slides!');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Marquee Configuration & Infinite Scroll Management Helpers
  const currentMarquee: MarqueeConfig = siteForm.marquee || DEFAULT_MARQUEE_CONFIG;

  const handleUpdateMarquee = (updates: Partial<MarqueeConfig>) => {
    const updatedMarquee: MarqueeConfig = {
      ...currentMarquee,
      ...updates,
    };
    const updatedSite: SiteSettings = {
      ...siteForm,
      marquee: updatedMarquee,
    };
    setSiteForm(updatedSite);
    onUpdateSiteSettings(updatedSite);
  };

  const handleAddMarqueeTextItem = () => {
    const newItem: MarqueeItem = {
      id: `mq-${Date.now()}`,
      type: 'text',
      text: '🌿 100% Classical Botanical Extracts & Lab Verified Formulations',
      badge: 'SPECIAL ANNOUNCEMENT',
      badgeColor: '#B4741E',
      badgeTextColor: '#FFFFFF',
      linkType: 'none',
    };
    handleUpdateMarquee({ items: [...currentMarquee.items, newItem] });
    setEditingMarqueeItemId(newItem.id);
    setSaveSuccessMsg('Added new text item to marquee!');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleAddMarqueeProductItem = (productId?: string) => {
    const targetProduct = products.find((p) => p.id === productId) || products[0];
    if (!targetProduct) return;
    const newItem: MarqueeItem = {
      id: `mq-${Date.now()}`,
      type: 'product',
      productId: targetProduct.id,
      customLabel: targetProduct.name,
      showImage: true,
      showPrice: true,
      showBadge: true,
    };
    handleUpdateMarquee({ items: [...currentMarquee.items, newItem] });
    setEditingMarqueeItemId(newItem.id);
    setSaveSuccessMsg(`Added "${targetProduct.name}" to marquee!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleUpdateMarqueeItem = (id: string, updates: Partial<MarqueeItem>) => {
    const updatedItems = currentMarquee.items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    handleUpdateMarquee({ items: updatedItems });
  };

  const handleDeleteMarqueeItem = (id: string) => {
    const updatedItems = currentMarquee.items.filter((item) => item.id !== id);
    handleUpdateMarquee({ items: updatedItems });
    if (editingMarqueeItemId === id) {
      setEditingMarqueeItemId(null);
    }
    setSaveSuccessMsg('Item removed from marquee');
    setTimeout(() => setSaveSuccessMsg(null), 2000);
  };

  const handleMoveMarqueeItem = (idx: number, direction: 'up' | 'down') => {
    const items = [...currentMarquee.items];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[idx];
    items[idx] = items[targetIdx];
    items[targetIdx] = temp;
    handleUpdateMarquee({ items });
  };

  const handleRestoreDefaultMarquee = () => {
    handleUpdateMarquee(DEFAULT_MARQUEE_CONFIG);
    setSaveSuccessMsg('Restored default marquee settings and items!');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleSaveMarqueeTab = async () => {
    onUpdateSiteSettings(siteForm);
    await backupSiteSettingsToFirebase(siteForm);
    setSaveSuccessMsg('Marquee Ticker settings saved & synchronized to Firebase!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Product Monograph Tabs Management Helpers
  // ══════════════════════════════════════════════════════════════════════════
  const currentMonographProduct: HerbalProduct | undefined = 
    products.find((p) => p.id === selectedProductForMonographId) || products[0];

  const currentMonographTabs: ProductMonographTab[] = React.useMemo(() => {
    if (!currentMonographProduct) return [];
    return getEffectiveMonographTabs(currentMonographProduct);
  }, [currentMonographProduct]);

  const activeMonographTab: ProductMonographTab | undefined = 
    currentMonographTabs.find((t) => t.id === activeMonographTabId) || currentMonographTabs[0];

  const handleSaveUpdatedProductTabs = async (updatedTabs: ProductMonographTab[]) => {
    if (!currentMonographProduct) return;
    const updatedProd: HerbalProduct = {
      ...currentMonographProduct,
      monographTabs: updatedTabs,
    };
    onUpdateProduct(updatedProd);
    await backupProductToFirebase(updatedProd);
    setSaveSuccessMsg(`Monograph tabs saved for "${currentMonographProduct.name}"!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleAddCustomMonographTab = () => {
    if (!newCustomTabTitle.trim() || !currentMonographProduct) return;
    const newTab: ProductMonographTab = {
      id: `tab_custom_${Date.now()}`,
      title: newCustomTabTitle.trim(),
      subtitle: newCustomTabSubtitle.trim() || undefined,
      icon: newCustomTabIcon || 'sparkles',
      items: [],
      isCustom: true,
      enabled: true,
      order: currentMonographTabs.length + 1,
    };
    const updated = [...currentMonographTabs, newTab];
    handleSaveUpdatedProductTabs(updated);
    setActiveMonographTabId(newTab.id);
    setIsAddingCustomTab(false);
    setNewCustomTabTitle('');
    setNewCustomTabSubtitle('');
  };

  const handleUpdateMonographTabMeta = (tabId: string) => {
    if (!editingTabTitle.trim() || !currentMonographProduct) return;
    const updated = currentMonographTabs.map((t) => {
      if (t.id === tabId) {
        return {
          ...t,
          title: editingTabTitle.trim(),
          subtitle: editingTabSubtitle.trim() || undefined,
        };
      }
      return t;
    });
    handleSaveUpdatedProductTabs(updated);
    setEditingTabMetaId(null);
  };

  const handleDeleteMonographTab = (tabId: string) => {
    if (!currentMonographProduct) return;
    const updated = currentMonographTabs.filter((t) => t.id !== tabId);
    handleSaveUpdatedProductTabs(updated);
    if (activeMonographTabId === tabId && updated.length > 0) {
      setActiveMonographTabId(updated[0].id);
    }
    setMonographDeleteConfirmTabId(null);
  };

  const handleResetMonographTabsToDefault = () => {
    if (!currentMonographProduct) return;
    const defaults = buildDefaultMonographTabs(currentMonographProduct);
    handleSaveUpdatedProductTabs(defaults);
    setActiveMonographTabId(defaults[0]?.id || 'overview');
    setSaveSuccessMsg(`Restored classical 6 default monograph tabs for "${currentMonographProduct.name}"!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveDetailItem = (tabId: string) => {
    if (!itemTitleInput.trim() && !itemTextInput.trim()) return;
    if (!currentMonographProduct) return;

    const newItem: MonographDetailItem = {
      id: editingDetailItemId || `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: itemTitleInput.trim() || 'Specification Item',
      text: itemTextInput.trim(),
      priority: itemPriorityInput,
      customTag: itemCustomTagInput.trim() || undefined,
      customTagBgColor: itemCustomTagBgColorInput.trim() || undefined,
      customTagTextColor: itemCustomTagTextColorInput.trim() || undefined,
      imageUrl: itemImageUrlInput.trim() || undefined,
      imageSize: itemImageSizeInput,
      botanicalName: itemBotanicalNameInput.trim() || undefined,
      quantityOrPotency: itemPotencyInput.trim() || undefined,
      role: itemRoleInput.trim() || undefined,
      isReview: Boolean(itemIsReviewInput),
      author: itemAuthorInput.trim() || undefined,
      rating: itemRatingInput,
      date: itemDateInput.trim() || undefined,
      isFaq: Boolean(itemIsFaqInput),
    };

    const updated = currentMonographTabs.map((t) => {
      if (t.id === tabId) {
        let updatedItems: MonographDetailItem[];
        if (editingDetailItemId) {
          updatedItems = (t.items || []).map((it) => (it.id === editingDetailItemId ? newItem : it));
        } else {
          updatedItems = [...(t.items || []), newItem];
        }
        return { ...t, items: updatedItems };
      }
      return t;
    });

    handleSaveUpdatedProductTabs(updated);
    setIsAddingDetailItem(false);
    setEditingDetailItemId(null);

    // Reset item inputs
    setItemTitleInput('');
    setItemTextInput('');
    setItemPriorityInput('normal');
    setItemCustomTagInput('');
    setItemCustomTagBgColorInput('');
    setItemCustomTagTextColorInput('');
    setItemImageUrlInput('');
    setItemBotanicalNameInput('');
    setItemPotencyInput('');
    setItemRoleInput('');
    setItemIsReviewInput(false);
    setItemAuthorInput('');
    setItemRatingInput(5);
    setItemDateInput('');
    setItemIsFaqInput(false);
  };

  const handleStartEditDetailItem = (item: MonographDetailItem) => {
    setEditingDetailItemId(item.id);
    setIsAddingDetailItem(true);
    setItemTitleInput(item.title || '');
    setItemTextInput(item.text || '');
    setItemPriorityInput(item.priority || 'normal');
    setItemCustomTagInput(item.customTag || '');
    setItemCustomTagBgColorInput(item.customTagBgColor || '');
    setItemCustomTagTextColorInput(item.customTagTextColor || '');
    setItemImageUrlInput(item.imageUrl || '');
    setItemImageSizeInput(
      (item.imageSize as 'small' | 'medium' | 'large') || 'medium'
    );
    setItemBotanicalNameInput(item.botanicalName || '');
    setItemPotencyInput(item.quantityOrPotency || '');
    setItemRoleInput(item.role || '');
    setItemIsReviewInput(Boolean(item.isReview));
    setItemAuthorInput(item.author || '');
    setItemRatingInput(item.rating || 5);
    setItemDateInput(item.date || '');
    setItemIsFaqInput(Boolean(item.isFaq));
  };

  const handleDeleteDetailItem = (tabId: string, itemId: string) => {
    if (!currentMonographProduct) return;
    const updated = currentMonographTabs.map((t) => {
      if (t.id === tabId) {
        return {
          ...t,
          items: (t.items || []).filter((it) => it.id !== itemId),
        };
      }
      return t;
    });
    handleSaveUpdatedProductTabs(updated);
    if (editingDetailItemId === itemId) {
      setEditingDetailItemId(null);
      setIsAddingDetailItem(false);
    }
  };

  const handleMoveDetailItem = (tabId: string, idx: number, direction: 'up' | 'down') => {
    if (!currentMonographProduct) return;
    const targetTab = currentMonographTabs.find((t) => t.id === tabId);
    if (!targetTab || !targetTab.items) return;
    const items = [...targetTab.items];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[idx];
    items[idx] = items[targetIdx];
    items[targetIdx] = temp;
    const updated = currentMonographTabs.map((t) => (t.id === tabId ? { ...t, items } : t));
    handleSaveUpdatedProductTabs(updated);
  };

  // Product Horizontal Lists State & Management Helpers
  const [editingHorizontalList, setEditingHorizontalList] = useState<ProductHorizontalList | null>(null);
  const [isCreatingNewHorizontalList, setIsCreatingNewHorizontalList] = useState<boolean>(false);
  const [horizontalListForm, setHorizontalListForm] = useState<ProductHorizontalList>({
    id: '',
    enabled: true,
    title: '',
    subtitle: '',
    badgeText: '',
    displayOrder: 1,
    sourceType: 'category',
    category: 'all',
    maxProducts: 8,
    selectedProductIds: [],
    cardFields: {
      showImage: true,
      showName: true,
      showSanskritName: true,
      showPrice: true,
      showResellerPrice: true,
      showMrpAndOffer: true,
      showTag: true,
      showRating: true,
      showAddToCart: true,
      showQuickView: true,
    },
  });
  const [productSearchInListForm, setProductSearchInListForm] = useState<string>('');

  const currentHorizontalLists: ProductHorizontalList[] = (Array.isArray(siteForm.productHorizontalLists)
    ? siteForm.productHorizontalLists
    : (siteForm.productHorizontalLists && typeof siteForm.productHorizontalLists === 'object'
      ? (Object.values(siteForm.productHorizontalLists) as ProductHorizontalList[])
      : (DEFAULT_PRODUCT_HORIZONTAL_LISTS || [])))
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  const handleStartCreateHorizontalList = () => {
    setHorizontalListForm({
      id: `hlist-${Date.now()}`,
      enabled: true,
      title: 'Doctor Recommended Classical Rasayanas',
      subtitle: 'Handpicked authentic herbal preparations to restore vitality, immunity & stamina.',
      badgeText: 'Curated Collection',
      displayOrder: currentHorizontalLists.length + 1,
      sourceType: 'category',
      category: 'immunity',
      maxProducts: 8,
      selectedProductIds: [],
      cardFields: {
        showImage: true,
        showName: true,
        showSanskritName: true,
        showPrice: true,
        showResellerPrice: true,
        showMrpAndOffer: true,
        showTag: true,
        showRating: true,
        showAddToCart: true,
        showQuickView: true,
      },
    });
    setProductSearchInListForm('');
    setIsCreatingNewHorizontalList(true);
    setEditingHorizontalList(null);
  };

  const handleStartEditHorizontalList = (list: ProductHorizontalList) => {
    setHorizontalListForm({
      ...list,
      cardFields: {
        showImage: list.cardFields?.showImage !== false,
        showName: list.cardFields?.showName !== false,
        showSanskritName: list.cardFields?.showSanskritName !== false,
        showPrice: list.cardFields?.showPrice !== false,
        showResellerPrice: list.cardFields?.showResellerPrice !== false,
        showMrpAndOffer: list.cardFields?.showMrpAndOffer !== false,
        showTag: list.cardFields?.showTag !== false,
        showRating: list.cardFields?.showRating !== false,
        showAddToCart: list.cardFields?.showAddToCart !== false,
        showQuickView: list.cardFields?.showQuickView !== false,
      },
      selectedProductIds: Array.isArray(list.selectedProductIds) ? list.selectedProductIds : [],
    });
    setProductSearchInListForm('');
    setEditingHorizontalList(list);
    setIsCreatingNewHorizontalList(false);
  };

  const handleSaveHorizontalListForm = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedLists: ProductHorizontalList[];

    if (isCreatingNewHorizontalList) {
      updatedLists = [...currentHorizontalLists, horizontalListForm];
    } else {
      updatedLists = currentHorizontalLists.map((l) => (l.id === horizontalListForm.id ? horizontalListForm : l));
    }

    // Re-index display orders
    updatedLists = updatedLists.map((l, i) => ({ ...l, displayOrder: l.displayOrder || i + 1 }));

    const updatedSiteSettings: SiteSettings = {
      ...siteForm,
      productHorizontalLists: updatedLists,
    };
    setSiteForm(updatedSiteSettings);
    onUpdateSiteSettings(updatedSiteSettings);
    await backupSiteSettingsToFirebase(updatedSiteSettings);
    setSaveSuccessMsg(`Horizontal Shelf "${horizontalListForm.title}" saved and synced to Firebase!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    setIsCreatingNewHorizontalList(false);
    setEditingHorizontalList(null);
  };

  const handleDeleteHorizontalList = async (id: string) => {
    const updatedLists = currentHorizontalLists.filter((l) => l.id !== id);
    const updatedSiteSettings: SiteSettings = {
      ...siteForm,
      productHorizontalLists: updatedLists,
    };
    setSiteForm(updatedSiteSettings);
    onUpdateSiteSettings(updatedSiteSettings);
    await backupSiteSettingsToFirebase(updatedSiteSettings);
    setSaveSuccessMsg('Horizontal Shelf deleted from store.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleToggleHorizontalList = async (id: string) => {
    const updatedLists = currentHorizontalLists.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l));
    const updatedSiteSettings: SiteSettings = {
      ...siteForm,
      productHorizontalLists: updatedLists,
    };
    setSiteForm(updatedSiteSettings);
    onUpdateSiteSettings(updatedSiteSettings);
    await backupSiteSettingsToFirebase(updatedSiteSettings);
  };

  const handleMoveHorizontalList = async (idx: number, direction: 'up' | 'down') => {
    const lists = [...currentHorizontalLists];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= lists.length) return;
    const temp = lists[idx];
    lists[idx] = lists[targetIdx];
    lists[targetIdx] = temp;
    const reordered = lists.map((l, i) => ({ ...l, displayOrder: i + 1 }));
    const updatedSiteSettings: SiteSettings = {
      ...siteForm,
      productHorizontalLists: reordered,
    };
    setSiteForm(updatedSiteSettings);
    onUpdateSiteSettings(updatedSiteSettings);
    await backupSiteSettingsToFirebase(updatedSiteSettings);
    setSaveSuccessMsg('Updated horizontal shelf display position!');
    setTimeout(() => setSaveSuccessMsg(null), 2000);
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
      showAssuranceBadges: true,
      showBadge1: true,
      showBadge2: true,
      badge1Title: siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified',
      badge1Subtitle: siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified',
      badge2Title: siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical',
      badge2Subtitle: siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers',
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
      videoUrl: '',
      videoType: 'none',
      primaryImageGradient: 'default',
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
            videoUrl: v.videoUrl || '',
            videoType: v.videoType || (v.videoUrl ? detectVideoType(v.videoUrl) : 'none'),
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
      showAssuranceBadges: p.assuranceBadges?.showBadges !== undefined ? p.assuranceBadges.showBadges : true,
      showBadge1: p.assuranceBadges?.showBadge1 !== undefined ? p.assuranceBadges.showBadge1 : true,
      showBadge2: p.assuranceBadges?.showBadge2 !== undefined ? p.assuranceBadges.showBadge2 : true,
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
      videoUrl: p.videoUrl || '',
      videoType: p.videoType || (p.videoUrl ? detectVideoType(p.videoUrl) : 'none'),
      primaryImageGradient: (p.primaryImageGradient as any) || 'default',
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
    const newCategory: CategoryItem = {
      id,
      label: newCatLabel.trim(),
      imageUrl: newCatImageUrl.trim() || undefined,
      showImage: newCatShowImage,
    };
    const updated = [...categories, newCategory];
    onUpdateCategories(updated);
    setNewCatId('');
    setNewCatLabel('');
    setNewCatImageUrl('');
    setNewCatShowImage(true);
    setSaveSuccessMsg(`Category "${newCatLabel.trim()}" created successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveEditCategory = (id: string) => {
    if (!editingCatLabel.trim()) return;
    const updated = categories.map((c) => c.id === id ? {
      ...c,
      label: editingCatLabel.trim(),
      imageUrl: editingCatImageUrl.trim() || undefined,
      showImage: editingCatShowImage,
    } : c);
    onUpdateCategories(updated);
    setEditingCatId(null);
    setEditingCatLabel('');
    setEditingCatImageUrl('');
    setEditingCatShowImage(true);
    setSaveSuccessMsg(`Category updated!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleToggleCategoryShowImage = (id: string, currentVal: boolean | undefined) => {
    const updated = categories.map((c) => c.id === id ? {
      ...c,
      showImage: currentVal === undefined ? false : !currentVal,
    } : c);
    onUpdateCategories(updated);
  };

  const handleUpdateCategoryImageUrl = (id: string, url: string) => {
    const updated = categories.map((c) => c.id === id ? {
      ...c,
      imageUrl: url.trim(),
    } : c);
    onUpdateCategories(updated);
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
    const trimmed = newFormName.trim();
    if (forms.includes(trimmed)) {
      alert('This formulation form already exists.');
      return;
    }
    const updated = [...forms, trimmed];
    onUpdateForms(updated);
    if (newFormImageUrl.trim()) {
      handleUpdateFormImage(trimmed, newFormImageUrl.trim(), newFormShowImage);
    }
    setNewFormName('');
    setNewFormImageUrl('');
    setNewFormShowImage(true);
    setSaveSuccessMsg(`Formulation Form "${trimmed}" added!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveEditForm = (idx: number, oldName: string) => {
    if (!editingFormName.trim()) return;
    const newName = editingFormName.trim();
    const updated = [...forms];
    updated[idx] = newName;
    onUpdateForms(updated);

    // If form name changed or image updated
    if (newName !== oldName || editingFormImageUrl) {
      const currentFormImages = { ...(siteForm.categoryAppearance?.formImages || {}) };
      if (newName !== oldName) {
        delete currentFormImages[oldName];
      }
      currentFormImages[newName] = {
        imageUrl: editingFormImageUrl.trim(),
        showImage: editingFormShowImage,
      };
      updateCategoryAppearance({ formImages: currentFormImages });
    }

    setEditingFormIdx(null);
    setEditingFormName('');
    setEditingFormImageUrl('');
    setEditingFormShowImage(true);
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
          videoUrl: v.videoUrl ? v.videoUrl.trim() : undefined,
          videoType: v.videoUrl?.trim() ? detectVideoType(v.videoUrl.trim()) : undefined,
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
      showBadges: Boolean(productForm.showAssuranceBadges),
      showBadge1: Boolean(productForm.showBadge1),
      showBadge2: Boolean(productForm.showBadge2),
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
        videoUrl: productForm.videoUrl?.trim() || undefined,
        videoType: productForm.videoUrl?.trim() ? detectVideoType(productForm.videoUrl.trim()) : undefined,
        primaryImageGradient: productForm.primaryImageGradient !== 'default' ? productForm.primaryImageGradient : undefined,
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
        videoUrl: productForm.videoUrl?.trim() || undefined,
        videoType: productForm.videoUrl?.trim() ? detectVideoType(productForm.videoUrl.trim()) : undefined,
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
        primaryImageGradient: productForm.primaryImageGradient !== 'default' ? productForm.primaryImageGradient : undefined,
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
    setSaveSuccessMsg('Website settings, header appearance & contacts updated and saved!');
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

  // Toggle Quality Assurance Badges separately for an individual product
  const handleToggleProductBadge = async (prod: HerbalProduct, badgeType: 'all' | 'badge1' | 'badge2') => {
    const curBadges = prod.assuranceBadges || {};
    let updatedBadges: ProductAssuranceBadges;
    if (badgeType === 'all') {
      const isCurrentlyShown = curBadges.showBadges !== undefined ? curBadges.showBadges : (siteForm.productAssuranceBadges?.showBadges ?? true);
      updatedBadges = { ...curBadges, showBadges: !isCurrentlyShown };
    } else if (badgeType === 'badge1') {
      const isCurrentlyShown = curBadges.showBadge1 !== undefined ? curBadges.showBadge1 : (siteForm.productAssuranceBadges?.showBadge1 ?? true);
      updatedBadges = { ...curBadges, showBadge1: !isCurrentlyShown };
    } else {
      const isCurrentlyShown = curBadges.showBadge2 !== undefined ? curBadges.showBadge2 : (siteForm.productAssuranceBadges?.showBadge2 ?? true);
      updatedBadges = { ...curBadges, showBadge2: !isCurrentlyShown };
    }
    const updatedProd: HerbalProduct = {
      ...prod,
      assuranceBadges: updatedBadges,
    };
    onUpdateProduct(updatedProd);
    await backupProductToFirebase(updatedProd);
    setSaveSuccessMsg(`Badges updated for "${prod.name}" and saved to Firebase!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
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
      className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full h-[100dvh] sm:h-auto sm:max-w-6xl sm:max-h-[94vh] bg-[#FBF9F5] border-0 sm:border sm:border-[#DCD5C5] rounded-none sm:rounded-2xl shadow-2xl text-[#1E2922] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#14291D] text-white border-b border-[#21432E] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#B4741E] text-white flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-white truncate">
                  Aurashka Admin
                </h3>
                <span className="text-[10px] sm:text-[11px] font-semibold bg-[#27533B] text-[#A5D6B6] px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[120px] sm:max-w-[200px]">
                  {currentUser?.email || 'Admin'}
                </span>
              </div>
              <p className="text-[11px] text-[#BED4C7] hidden sm:block truncate">
                Manage Products, Reseller Rates, Rating Stars, Custom Fields, Categories & Forms, and Contacts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleBackupAll}
              disabled={isBackingUp}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#183624] bg-[#E7EFEA] hover:bg-[#d8e8de] rounded-lg border border-[#A5D6B6] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
              title="Save all image links, texts & contacts to Firebase"
            >
              <CloudUpload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2C5E43]" />
              <span className="hidden sm:inline">{isBackingUp ? 'Saving...' : 'Save All on Firebase'}</span>
              <span className="sm:hidden">{isBackingUp ? 'Saving...' : 'Sync'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile / Compact Quick Switcher Dropdown (Never Hidden) */}
        <div className="md:hidden px-3 py-2 bg-[#F2EDE1] border-b border-[#DCD5C5] flex items-center justify-between gap-2 shrink-0">
          <label className="text-xs font-bold text-[#14291D] shrink-0 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>Section:</span>
          </label>
          <select
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value as any);
              setIsCreatingNew(false);
              setEditingProduct(null);
            }}
            className="flex-1 py-1.5 px-2.5 bg-white border border-[#C8BEAB] rounded-lg text-xs font-semibold text-[#183624] shadow-2xs focus:outline-hidden focus:border-[#2C5E43] cursor-pointer"
          >
            <option value="products">🛍️ Products & Reseller Rates ({products.length})</option>
            <option value="monograph_tabs">📑 Product Monograph Tabs & Custom Details (6 Standard + Custom)</option>
            <option value="deal_of_week">🔥 Deal of the Week & Banner Scroller ({currentWeeklyDeals.items.length} deals)</option>
            <option value="marquee">📜 Marquee Ticker & Infinite Scroll ({currentMarquee.enabled ? `${currentMarquee.items.length} items` : 'Off'})</option>
            <option value="horizontal_lists">📦 Product Horizontal Lists ({currentHorizontalLists.length} shelves)</option>
            <option value="categories_forms">🗂️ Categories & Forms Manager</option>
            <option value="contacts">📞 Multiple Contacts (Phones, WhatsApp, Emails)</option>
            <option value="people">👥 Doctors & Key People</option>
            <option value="site_titles">🏷️ Website Titles & Banner Texts</option>
            <option value="assurance_badges">🛡️ Ayush & Quality Assurance Badges (Product View)</option>
            <option value="messages">💬 WhatsApp & Email Custom Messages</option>
          </select>
        </div>

        {/* Tab Switcher - Responsive Wrapped Pills / Horizontal scroll on mobile (Never Hidden on any screen) */}
        <div className="border-b border-[#E7DFD1] bg-[#FAF8F5] px-2 sm:px-6 py-1.5 sm:py-2 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex md:flex-wrap items-center gap-1.5 sm:gap-2 min-w-max md:min-w-0">
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
                setActiveTab('monograph_tabs');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'monograph_tabs'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${activeTab === 'monograph_tabs' ? 'text-amber-300' : 'text-[#2C5E43]'}`} />
              <span>Monograph Tabs</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'monograph_tabs' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
              }`}>
                Tabs 1-6
              </span>
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
                setActiveTab('marquee');
                setIsCreatingNew(false);
                setEditingProduct(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'marquee'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <ScrollText className={`w-3.5 h-3.5 ${activeTab === 'marquee' ? 'text-amber-300' : 'text-[#B4741E]'}`} />
              <span>Marquee Ticker</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                !currentMarquee.enabled 
                  ? 'bg-rose-100 text-rose-800' 
                  : activeTab === 'marquee' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {!currentMarquee.enabled ? 'Off' : currentMarquee.items.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('horizontal_lists');
                setIsCreatingNew(false);
                setEditingProduct(null);
                setIsCreatingNewHorizontalList(false);
                setEditingHorizontalList(null);
              }}
              className={`py-2 px-3 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'horizontal_lists'
                  ? 'bg-[#183624] text-white shadow-xs'
                  : 'bg-white text-[#52493A] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
              }`}
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${activeTab === 'horizontal_lists' ? 'text-amber-300' : 'text-[#2C5E43]'}`} />
              <span>Horizontal Shelves</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'horizontal_lists' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {currentHorizontalLists.length}
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
              <div className="p-3 sm:p-4 sm:px-6 bg-[#FAF8F5] border-b border-[#E7DFD1] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
                <div className="relative w-full sm:flex-1 sm:max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#887E6D]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search formulation title, herb, or category..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43]"
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                  <button
                    onClick={onResetProductsToDefault}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-[#645A4B] hover:text-[#14291D] hover:bg-[#EFEAE0] rounded-lg border border-[#DDD5C5] transition-colors cursor-pointer text-center"
                  >
                    Reset Defaults
                  </button>

                  <button
                    onClick={startCreate}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Add Product</span>
                  </button>
                </div>
              </div>
            )}

            {/* Products Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
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

                              {/* Variety Video Attachment: YouTube or Direct Playable Video (MP4 / WebM) */}
                              <div className="pt-2.5 border-t border-[#F0EAE0] space-y-2 bg-[#FBF9F5] p-2.5 rounded-lg border border-[#E7E0D2]">
                                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                                  <label className="text-[11px] font-bold text-[#14291D] shrink-0 flex items-center gap-1.5">
                                    <Video className="w-3.5 h-3.5 text-red-600" />
                                    <span>Variety Video (YouTube / Direct Playable Video):</span>
                                  </label>
                                  {variant.videoUrl?.trim() && (
                                    <div className="flex items-center gap-1.5">
                                      {detectVideoType(variant.videoUrl) === 'youtube' && (
                                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                                          <Play className="w-2.5 h-2.5 fill-white" />
                                          <span>YouTube Video</span>
                                        </span>
                                      )}
                                      {detectVideoType(variant.videoUrl) === 'direct' && (
                                        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                                          <Film className="w-2.5 h-2.5" />
                                          <span>Direct Video (.mp4 / webm)</span>
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...variantsList];
                                          updated[vIdx].videoUrl = '';
                                          updated[vIdx].videoType = 'none';
                                          setVariantsList(updated);
                                        }}
                                        className="text-[10px] text-red-600 hover:underline font-semibold ml-1 cursor-pointer"
                                      >
                                        Remove Video
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 items-center">
                                  <input
                                    type="url"
                                    value={variant.videoUrl || ''}
                                    placeholder="Paste YouTube link (watch / shorts / youtu.be) or direct playable video URL (.mp4 / .webm)"
                                    onChange={(e) => {
                                      const updated = [...variantsList];
                                      const val = e.target.value;
                                      updated[vIdx].videoUrl = val;
                                      updated[vIdx].videoType = detectVideoType(val);
                                      setVariantsList(updated);
                                    }}
                                    className="flex-1 px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs font-mono"
                                  />
                                </div>

                                <div className="text-[10px] text-[#716858] flex items-center justify-between">
                                  <span>Attach an explainer video or demonstration specifically for this variety.</span>
                                  {variant.videoUrl?.trim() && !isValidVideoUrl(variant.videoUrl) && (
                                    <span className="text-amber-700 font-medium">Please enter a valid YouTube or direct video link</span>
                                  )}
                                </div>

                                {/* Live Video Player Preview for Variety */}
                                {variant.videoUrl?.trim() && isValidVideoUrl(variant.videoUrl) && (
                                  <div className="mt-2 p-2 bg-white rounded-lg border border-[#DDD5C5] space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] text-[#716858]">
                                      <span className="font-bold text-[#14291D] flex items-center gap-1">
                                        <Play className="w-3 h-3 text-[#2C5E43]" />
                                        <span>Live Variety Video Player Preview:</span>
                                      </span>
                                      <span className="italic">Customer will see this video alongside variety photos</span>
                                    </div>
                                    <div className="rounded-lg overflow-hidden bg-black aspect-16/9 max-h-48 flex items-center justify-center">
                                      {detectVideoType(variant.videoUrl) === 'youtube' ? (
                                        <iframe
                                          src={getYouTubeEmbedUrl(variant.videoUrl, false) || ''}
                                          title={`Variant ${vIdx + 1} Video Preview`}
                                          className="w-full h-full border-0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        />
                                      ) : (
                                        <video
                                          src={variant.videoUrl}
                                          controls
                                          preload="metadata"
                                          className="w-full h-full object-contain"
                                        />
                                      )}
                                    </div>
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

                    {/* PRODUCT PRIMARY IMAGE BOTTOM GRADIENT SETTING */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#E7DFD1] pb-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            Product Primary Image Bottom Gradient (Card & Monograph)
                          </h5>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#183624] text-white capitalize">
                          Current: {productForm.primaryImageGradient === 'default' ? `Store Default (${siteForm.productImageGradient || 'none'})` : productForm.primaryImageGradient}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#695E4F] leading-relaxed">
                        Is formulation ke main primary photo par bottom gradient (Black, White, Emerald, Blur Glassy) lagana hai ya clean photo (None) rakhna hai:
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {/* Store Default Option */}
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, primaryImageGradient: 'default' })}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            productForm.primaryImageGradient === 'default'
                              ? 'border-[#183624] bg-white ring-2 ring-[#2C5E43] shadow-xs'
                              : 'border-[#DDD5C5] bg-white hover:bg-[#F5EFE6]'
                          }`}
                        >
                          <div className="w-full h-7 rounded bg-[#EFEAE0] border border-[#DDD5C5] flex items-center justify-center text-[9.5px] font-bold text-[#716858]">
                            Store Default
                          </div>
                          <span className="text-[10.5px] font-bold text-[#14291D] mt-1.5 line-clamp-1">
                            Follow Store
                          </span>
                          <span className="text-[9px] text-[#716858]">
                            {siteForm.productImageGradient || 'none'}
                          </span>
                        </button>

                        {/* All 6 gradient styles */}
                        {GRADIENT_OVERLAY_OPTIONS.map((opt) => {
                          const isSelected = productForm.primaryImageGradient === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setProductForm({ ...productForm, primaryImageGradient: opt.value })}
                              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#183624] bg-white ring-2 ring-[#2C5E43] shadow-xs'
                                  : 'border-[#DDD5C5] bg-white hover:bg-[#F5EFE6]'
                              }`}
                            >
                              <div className="w-full h-7 rounded overflow-hidden border border-[#DDD5C5] relative bg-stone-100 flex items-end">
                                <div className={`w-full h-full ${opt.previewBg}`} />
                                <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold px-1 py-0.2 rounded bg-black/60 text-white">
                                  {opt.badge}
                                </span>
                              </div>
                              <span className="text-[10.5px] font-bold text-[#14291D] mt-1.5 line-clamp-1">
                                {opt.badge}
                              </span>
                              <span className="text-[9px] text-[#716858] line-clamp-1">
                                {opt.value === 'none' ? 'Clean' : 'Gradient'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PRODUCT MAIN VIDEO SECTION (YOUTUBE / DIRECT PLAYABLE VIDEO) */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#E7DFD1] pb-2">
                        <div className="flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-red-600" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            Product Video (YouTube or Direct Playable Video)
                          </h5>
                        </div>
                        {productForm.videoUrl?.trim() && (
                          <div className="flex items-center gap-1.5">
                            {detectVideoType(productForm.videoUrl) === 'youtube' && (
                              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                                <Play className="w-2.5 h-2.5 fill-white" />
                                <span>YouTube Video</span>
                              </span>
                            )}
                            {detectVideoType(productForm.videoUrl) === 'direct' && (
                              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                                <Film className="w-2.5 h-2.5" />
                                <span>Direct Video (.mp4 / webm)</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, videoUrl: '', videoType: 'none' })}
                              className="text-[10px] text-red-600 hover:underline font-semibold ml-1 cursor-pointer"
                            >
                              Remove Video
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-[#695E4F] bg-white p-2.5 rounded-lg border border-[#E2D8C7] leading-relaxed">
                        Attach an official product presentation video (YouTube watch/shorts/embed URL or direct MP4/WebM video). Customers can play this video directly inside the product gallery alongside photos!
                      </p>

                      <div className="flex gap-2 items-center">
                        <input
                          type="url"
                          value={productForm.videoUrl || ''}
                          placeholder="Paste YouTube link (https://youtube.com/watch?v=... / shorts) or direct MP4/WebM URL"
                          onChange={(e) => {
                            const val = e.target.value;
                            setProductForm({
                              ...productForm,
                              videoUrl: val,
                              videoType: detectVideoType(val),
                            });
                          }}
                          className="flex-1 px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                        />
                      </div>

                      {/* Live Main Product Video Preview */}
                      {productForm.videoUrl?.trim() && isValidVideoUrl(productForm.videoUrl) && (
                        <div className="mt-2 p-2.5 bg-white rounded-lg border border-[#DDD5C5] space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-[#716858]">
                            <span className="font-bold text-[#14291D] flex items-center gap-1">
                              <Play className="w-3.5 h-3.5 text-[#2C5E43]" />
                              <span>Live Product Video Player Preview:</span>
                            </span>
                            <span className="italic">Appears inside product gallery & monograph view</span>
                          </div>
                          <div className="rounded-lg overflow-hidden bg-black aspect-16/9 max-h-56 flex items-center justify-center">
                            {detectVideoType(productForm.videoUrl) === 'youtube' ? (
                              <iframe
                                src={getYouTubeEmbedUrl(productForm.videoUrl, false) || ''}
                                title="Product Main Video Preview"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={productForm.videoUrl}
                                controls
                                preload="metadata"
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        </div>
                      )}
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

                    {/* Net Volume / Weight (Classical Monograph Tabs are now managed in the dedicated Monograph Tabs section below) */}
                    <div className="max-w-md">
                      <label className="block font-medium text-[#2B251D] mb-1">Net Volume/Weight</label>
                      <input
                        type="text"
                        value={productForm.volumeOrWeight}
                        onChange={(e) => setProductForm({ ...productForm, volumeOrWeight: e.target.value })}
                        placeholder="e.g. 100g Pure Powder / 60 Veg Capsules"
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                      />
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
                              These 4 trust indicators appear on this product's detail page. You can show or hide them separately for this product.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setProductForm({
                              ...productForm,
                              showAssuranceBadges: !productForm.showAssuranceBadges,
                            })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              productForm.showAssuranceBadges
                                ? 'bg-emerald-700 text-white shadow-2xs'
                                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                            }`}
                          >
                            {productForm.showAssuranceBadges ? '✓ Badges Shown' : '✕ Badges Hidden'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProductForm({
                                ...productForm,
                                showAssuranceBadges: true,
                                showBadge1: true,
                                showBadge2: true,
                                badge1Title: siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified',
                                badge1Subtitle: siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified',
                                badge2Title: siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical',
                                badge2Subtitle: siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers',
                              });
                            }}
                            className="px-2.5 py-1 bg-white border border-[#DDD5C5] text-[#14291D] hover:bg-stone-50 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 text-[#2C5E43]" />
                            <span>Reset Defaults</span>
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-4 transition-opacity ${productForm.showAssuranceBadges ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Badge 1 */}
                          <div className="p-3 bg-white rounded-xl border border-[#E0D7C6] space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291D]">
                                <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                                <span>Badge 1 (Ayush & GMP)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, showBadge1: !productForm.showBadge1 })}
                                className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all cursor-pointer ${
                                  productForm.showBadge1 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {productForm.showBadge1 ? 'Visible' : 'Hidden'}
                              </button>
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291D]">
                                <Leaf className="w-4 h-4 text-[#2C5E43]" />
                                <span>Badge 2 (Botanical & Fillers)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, showBadge2: !productForm.showBadge2 })}
                                className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all cursor-pointer ${
                                  productForm.showBadge2 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {productForm.showBadge2 ? 'Visible' : 'Hidden'}
                              </button>
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
                            Product View Live Preview:
                          </span>
                          {productForm.showAssuranceBadges && (productForm.showBadge1 || productForm.showBadge2) ? (
                            <div className={`p-3 bg-white rounded-xl border border-[#D5CCBC] grid ${productForm.showBadge1 && productForm.showBadge2 ? 'grid-cols-2 gap-3' : 'grid-cols-1'} text-xs max-w-md`}>
                              {productForm.showBadge1 && (
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-[#2C5E43] shrink-0" />
                                  <div>
                                    <span className="font-bold text-[#14291D] block">{productForm.badge1Title || 'Ayush & GMP Certified'}</span>
                                    <span className="text-[11px] text-[#716858]">{productForm.badge1Subtitle || 'Heavy-metal lab verified'}</span>
                                  </div>
                                </div>
                              )}
                              {productForm.showBadge2 && (
                                <div className="flex items-center gap-2">
                                  <Leaf className="w-4 h-4 text-[#2C5E43] shrink-0" />
                                  <div>
                                    <span className="font-bold text-[#14291D] block">{productForm.badge2Title || '100% Pure Botanical'}</span>
                                    <span className="text-[11px] text-[#716858]">{productForm.badge2Subtitle || 'Zero synthetic fillers'}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-500 font-medium max-w-md">
                              Quality Assurance Badges are HIDDEN on this product view.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* SECTION 6: PRODUCT DETAIL MONOGRAPH TABS & CLINICAL CARDS */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    <div className="p-4 sm:p-5 bg-[#FAF8F5] rounded-xl border border-[#A5D6B6] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0D7C6] pb-3">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#2C5E43]" />
                          <div>
                            <h5 className="font-serif text-sm font-bold text-[#14291D]">
                              6. Product Monograph Tabs, Priority Cards & Reviews
                            </h5>
                            <p className="text-[11px] text-[#716858]">
                              Customize the 6 standard tabs (Overview, Benefits, Ingredients, Dosage, Specs, FAQs & Reviews) or create custom tabs with priority color tags (Red, Yellow, Green, Normal).
                            </p>
                          </div>
                        </div>

                        {editingProduct && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductForMonographId(editingProduct.id);
                              setActiveTab('monograph_tabs');
                            }}
                            className="px-3 py-1.5 bg-[#183624] hover:bg-[#20442E] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                          >
                            <Layers className="w-3.5 h-3.5 text-amber-300" />
                            <span>Open Full Monograph Tabs Editor</span>
                          </button>
                        )}
                      </div>

                      {editingProduct && (
                        <AdminMonographTabsManager
                          products={products}
                          selectedProductId={editingProduct.id}
                          onUpdateProduct={onUpdateProduct}
                          onPreviewProduct={onPreviewProduct}
                          onNotify={(msg) => {
                            setSaveSuccessMsg(msg);
                            setTimeout(() => setSaveSuccessMsg(null), 3000);
                          }}
                          hideProductPicker={true}
                        />
                      )}
                    </div>

                    {/* Form Submit & Cancel Buttons */}
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs py-3.5 px-4 -mx-6 -mb-6 border-t border-[#EAE3D4] flex items-center justify-end gap-3 z-10 shadow-xs rounded-b-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNew(false);
                          setEditingProduct(null);
                        }}
                        className="px-4 py-2 border border-[#DDD5C5] hover:bg-[#EFEAE0] rounded-lg font-medium cursor-pointer text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 sm:px-6 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer text-xs"
                      >
                        <Save className="w-4 h-4 text-amber-300" />
                        <span>{isCreatingNew ? 'Save & Sync to Firebase' : 'Update & Save to Firebase'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Products View (Desktop Table + Mobile Cards) */
                <div className="space-y-4">
                  {/* Store-Wide Product Primary Image Bottom Gradient Control */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAE3D4] space-y-2.5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <h4 className="font-bold text-xs text-[#14291D]">
                            Product Primary Image Bottom Gradient (Store-Wide Setting)
                          </h4>
                        </div>
                        <p className="text-[10.5px] text-[#716858]">
                          Catalog cards aur monographs ke main images par bottom gradient lagayein (Black, White, Emerald, Blur Glassy) ya clean photo (None) rakhein.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#183624] text-white shrink-0 self-start sm:self-auto capitalize">
                        Active: {siteForm.productImageGradient || 'none'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-0.5">
                      {GRADIENT_OVERLAY_OPTIONS.map((opt) => {
                        const isSelected = (siteForm.productImageGradient || 'none') === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleUpdateStoreProductGradient(opt.value)}
                            className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                              isSelected
                                ? 'border-[#183624] bg-white ring-2 ring-[#2C5E43] shadow-xs'
                                : 'border-[#DDD5C5] bg-[#FAF8F5] hover:bg-white hover:border-[#B5A894]'
                            }`}
                          >
                            <div className="space-y-1 w-full">
                              <div className="w-full h-7 rounded-lg overflow-hidden border border-[#D5CCBC] relative bg-stone-100 flex items-end">
                                <div className={`w-full h-full ${opt.previewBg}`} />
                                <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold px-1 py-0.2 rounded bg-black/60 text-white leading-tight">
                                  {opt.badge}
                                </span>
                              </div>
                              <div className="font-bold text-[10.5px] text-[#14291D] leading-tight line-clamp-1">
                                {opt.label.split('(')[0].trim()}
                              </div>
                              <p className="text-[9px] text-[#716858] leading-tight line-clamp-2">
                                {opt.description}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-bold text-[#183624]">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Store Active</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Empty state if search has no results */}
                  {filteredProducts.length === 0 && (
                    <div className="p-8 text-center bg-white rounded-xl border border-[#DDD5C5] text-[#716858] space-y-2">
                      <p className="font-semibold text-sm">No formulations match your search.</p>
                      <p className="text-xs">Try clearing the search input or adding a new formulation.</p>
                    </div>
                  )}

                  {/* Mobile View: Clean, sorted touch cards (Zero horizontal scroll cutoffs) */}
                  <div className="md:hidden space-y-3">
                    {filteredProducts.map((prod) => (
                      <div key={prod.id} className="bg-white p-3.5 rounded-xl border border-[#D5CCBC] shadow-2xs space-y-2.5">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg bg-[#FAF8F5] border border-[#DDD5C5] overflow-hidden shrink-0">
                            <img
                              src={prod.image || (prod.images && prod.images[0])}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-[#14291D] text-sm leading-snug line-clamp-1">{prod.name}</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                prod.inStock !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {prod.inStock !== false ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#7A705E] italic line-clamp-1">{prod.sanskritName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10.5px] font-semibold text-[#2C5E43] bg-[#EBF5EF] px-1.5 py-0.5 rounded">
                                {prod.categoryLabel}
                              </span>
                              <span className="text-[10.5px] text-[#786D5C] font-mono">
                                {prod.form}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0EAE0] text-xs">
                          <div>
                            <span className="text-[10px] text-[#786D5C] block">Retail Price</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-mono font-bold text-[#14291D]">{formatPrice(prod.price)}</span>
                              <span className="text-[10px] text-[#887E6D] line-through">{formatPrice(prod.mrp)}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#786D5C] block">Reseller Rate</span>
                            {prod.resellerPrice !== undefined && prod.resellerPrice > 0 ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#EBF5EF] text-[#183624] font-mono font-bold border border-[#BBDDC7] text-[11px]">
                                {formatPrice(prod.resellerPrice)}
                              </span>
                            ) : (
                              <span className="text-[#998F80] italic text-[11px]">— Not Set —</span>
                            )}
                          </div>
                        </div>

                        {/* Rating & Badge */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{prod.rating}</span>
                            <span className="text-[10px] text-[#786D5C]">({formatCompactNumber(prod.reviewsCount)})</span>
                          </div>

                          {prod.sortBadge && prod.sortBadge !== 'none' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white flex items-center gap-1 bg-[#B4741E]">
                              {prod.sortBadge === 'trending' ? 'Trending' :
                               prod.sortBadge === 'top_seller' ? 'Top Seller' :
                               prod.sortBadge === 'best_deal' ? 'Best Deal' :
                               prod.sortBadge === 'new_launch' ? 'New Launch' :
                               prod.sortBadge === 'featured' ? 'Featured' :
                               prod.sortBadge}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#887E6D]">Order: #{prod.displayOrder || 1}</span>
                          )}
                        </div>

                        {/* Action Buttons on mobile */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0EAE0]">
                          <button
                            type="button"
                            onClick={() => onPreviewProduct(prod)}
                            className="py-1.5 px-2 bg-[#E7EFEA] hover:bg-[#d8e8de] text-[#183624] rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-[#BBDDC7] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => startEdit(prod)}
                            className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-blue-200 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {deleteConfirmId === prod.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteProduct(prod.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="flex-1 py-1.5 bg-red-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1.5 text-stone-600 rounded-lg bg-stone-100 text-xs cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(prod.id)}
                              className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-rose-200 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-white rounded-xl border border-[#D5CCBC] shadow-xs overflow-hidden">
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
                                    onClick={() => {
                                      setSelectedProductForMonographId(prod.id);
                                      setActiveTab('monograph_tabs');
                                    }}
                                    className="p-1.5 text-amber-700 hover:bg-amber-50 rounded cursor-pointer"
                                    title="Manage Monograph Tabs & Clinical Details (Tabs 1-6 & Custom)"
                                  >
                                    <Layers className="w-4 h-4" />
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
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab: Product Detail Monograph Tabs Manager (Tabs 1-6 & Custom Tabs, Priority Cards, Images & Reviews) */}
        {activeTab === 'monograph_tabs' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
            <AdminMonographTabsManager
              products={products}
              selectedProductId={selectedProductForMonographId}
              onUpdateProduct={onUpdateProduct}
              onPreviewProduct={onPreviewProduct}
              onNotify={(msg) => {
                setSaveSuccessMsg(msg);
                setTimeout(() => setSaveSuccessMsg(null), 3000);
              }}
            />
          </div>
        )}

        {/* Tab: Deal of the Week (Add, Edit, Reorder, Delete Section & Multiple Products in Horizontal Scroll) */}
        {activeTab === 'deal_of_week' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
            {/* 0. Image Banner Auto-Scroller / Swipe Slider (Positioned Above Weekly Deal) */}
            <div className={`p-5 rounded-xl border shadow-xs transition-colors ${
              currentBannerSlider.enabled 
                ? 'bg-linear-to-r from-emerald-50/80 via-white to-amber-50/60 border-[#A5D6B6]' 
                : 'bg-[#FAF8F5] border-[#DDD5C5]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D4] pb-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon className={`w-5 h-5 ${currentBannerSlider.enabled ? 'text-emerald-700' : 'text-stone-400'}`} />
                    <h3 className="font-serif text-lg font-bold text-[#14291D]">
                      Horizontal Image Auto-Scroller & Swipe Banner
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      currentBannerSlider.enabled 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-stone-100 text-stone-700 border border-stone-300'
                    }`}>
                      {currentBannerSlider.enabled ? 'Active on Website' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-[#594F40]">
                    Positioned directly above Deal of the Week. Auto-scrolls and supports touch swipe. Clickable images can link to specific products, categories, or custom URLs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateBannerSlider({ enabled: !currentBannerSlider.enabled })}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                      currentBannerSlider.enabled 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    {currentBannerSlider.enabled ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Scroller</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Show Scroller</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddBannerSlide}
                    className="px-3.5 py-2 text-xs font-bold bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>Add New Image Slide</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreDefaultBanners}
                    className="px-3 py-2 text-xs font-medium text-[#483F30] hover:text-[#14291D] bg-white hover:bg-[#F2ECE1] border border-[#CFC5B4] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Restore default promotional banners"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#B4741E]" />
                    <span>Restore Banners</span>
                  </button>
                </div>
              </div>

              {/* Slider Size & Auto-Scroll Options (Expandable & Manually Typed) */}
              <div className="bg-white p-4 rounded-xl border border-[#EAE3D4] mb-4 space-y-4 text-xs shadow-2xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Preset Selector */}
                  <div>
                    <label className="block font-bold text-[#14291D] mb-1 flex items-center justify-between">
                      <span>Scroller Size & Position (Screen Height Presets)</span>
                      {currentBannerSlider.customHeightPx ? (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Custom: {currentBannerSlider.customHeightPx}px Active
                        </span>
                      ) : null}
                    </label>
                    <select
                      value={currentBannerSlider.aspectRatio || 'auto'}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        if (val === 'compact') {
                          handleUpdateBannerSlider({ aspectRatio: 'compact', customHeightPx: 130 });
                        } else if (val === 'standard') {
                          handleUpdateBannerSlider({ aspectRatio: 'standard', customHeightPx: 180 });
                        } else if (val === 'wide') {
                          handleUpdateBannerSlider({ aspectRatio: 'wide', customHeightPx: 240 });
                        } else if (val === 'tall') {
                          handleUpdateBannerSlider({ aspectRatio: 'tall', customHeightPx: 320 });
                        } else if (val === 'extra_tall') {
                          handleUpdateBannerSlider({ aspectRatio: 'extra_tall', customHeightPx: 420 });
                        } else if (val === 'auto') {
                          handleUpdateBannerSlider({ aspectRatio: 'auto', customHeightPx: undefined });
                        } else {
                          handleUpdateBannerSlider({ aspectRatio: val });
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D] focus:outline-hidden focus:border-[#2C5E43]"
                    >
                      <option value="auto">Auto Responsive (Adaptive Mobile / Tablet / Desktop)</option>
                      <option value="compact">Compact (Sleek Banner ~ 130px)</option>
                      <option value="standard">Standard (Medium Height ~ 180px)</option>
                      <option value="wide">Prominent / Wide (High Impact ~ 240px)</option>
                      <option value="tall">Tall / Large Banner (High Visibility ~ 320px)</option>
                      <option value="extra_tall">Extra Large / Hero Banner (~ 420px)</option>
                      <option value="hero">Mega Hero Screen (~ 540px)</option>
                      <option value="super_hero">Full Cinematic Screen (~ 680px)</option>
                      <option value="custom">Custom Height (Manually Typed Below)</option>
                    </select>
                    <p className="text-[10.5px] text-[#716858] mt-1">
                      Scroller screen height badhane ke liye presets chunein ya niche exact number type karein.
                    </p>
                  </div>

                  {/* Auto-Scroll Speed Selector */}
                  <div>
                    <label className="block font-bold text-[#14291D] mb-1">
                      Auto-Scroll Speed (Interval)
                    </label>
                    <select
                      value={currentBannerSlider.autoScrollSeconds || 4}
                      onChange={(e) => handleUpdateBannerSlider({ autoScrollSeconds: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D] focus:outline-hidden focus:border-[#2C5E43]"
                    >
                      <option value={2}>Fast (2 Seconds per slide)</option>
                      <option value={3}>Normal (3 Seconds per slide)</option>
                      <option value={4}>Balanced (4 Seconds per slide)</option>
                      <option value={6}>Relaxed (6 Seconds per slide)</option>
                      <option value={8}>Slow (8 Seconds per slide)</option>
                    </select>
                    <p className="text-[10.5px] text-[#716858] mt-1">
                      Slide badalne ka time interval. Touch swipe aur mouse drag hamesha enable rehta hai.
                    </p>
                  </div>
                </div>

                {/* Manual Height Input & Fine-Tuning Controls */}
                <div className="pt-3 border-t border-[#F0EAE1] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block font-bold text-[#14291D] text-xs flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#2C5E43]" />
                        <span>Manually Type Exact Screen Height (in Pixels)</span>
                      </label>
                      <span className="text-[10.5px] text-[#716858]">
                        Directly number type karein ya [+] [-] click karke height jitni chahe badhayein (up to 1200px).
                      </span>
                    </div>

                    {/* Numeric Input with Stepper */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = currentBannerSlider.customHeightPx || 180;
                          const next = Math.max(80, cur - 50);
                          handleUpdateBannerSlider({ customHeightPx: next, aspectRatio: 'custom' });
                        }}
                        className="px-2 py-1.5 bg-[#FAF8F5] hover:bg-[#EFEAE0] border border-[#DDD5C5] rounded-lg font-bold text-[11px] text-[#14291D] cursor-pointer"
                        title="Decrease 50px"
                      >
                        -50px
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const cur = currentBannerSlider.customHeightPx || 180;
                          const next = Math.max(80, cur - 20);
                          handleUpdateBannerSlider({ customHeightPx: next, aspectRatio: 'custom' });
                        }}
                        className="px-2 py-1.5 bg-[#FAF8F5] hover:bg-[#EFEAE0] border border-[#DDD5C5] rounded-lg font-bold text-[11px] text-[#14291D] cursor-pointer"
                        title="Decrease 20px"
                      >
                        -20px
                      </button>

                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={80}
                          max={1200}
                          step={10}
                          value={currentBannerSlider.customHeightPx || ''}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            if (val === '') {
                              handleUpdateBannerSlider({ customHeightPx: undefined, aspectRatio: 'auto' });
                            } else {
                              const num = Math.min(1200, Math.max(70, parseInt(val) || 0));
                              handleUpdateBannerSlider({ customHeightPx: num, aspectRatio: 'custom' });
                            }
                          }}
                          placeholder="Auto"
                          className="w-24 px-2.5 py-1.5 bg-[#FAF8F5] border border-[#2C5E43] rounded-lg font-mono font-bold text-center text-xs text-[#14291D] focus:outline-hidden"
                        />
                        <span className="absolute right-2 text-[10px] text-[#716858] font-bold pointer-events-none">
                          px
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const cur = currentBannerSlider.customHeightPx || 180;
                          const next = Math.min(1200, cur + 20);
                          handleUpdateBannerSlider({ customHeightPx: next, aspectRatio: 'custom' });
                        }}
                        className="px-2 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs"
                        title="Increase 20px"
                      >
                        +20px
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const cur = currentBannerSlider.customHeightPx || 180;
                          const next = Math.min(1200, cur + 50);
                          handleUpdateBannerSlider({ customHeightPx: next, aspectRatio: 'custom' });
                        }}
                        className="px-2 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs"
                        title="Increase 50px"
                      >
                        +50px
                      </button>

                      {currentBannerSlider.customHeightPx ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateBannerSlider({ customHeightPx: undefined, aspectRatio: 'auto' })}
                          className="px-2 py-1.5 text-[11px] text-[#716858] hover:text-red-700 hover:bg-rose-50 border border-[#DDD5C5] rounded-lg cursor-pointer transition-colors"
                          title="Reset to Auto Responsive Height"
                        >
                          Reset Auto
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Interactive Height Range Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10.5px] text-[#716858]">
                      <span>Compact (100px)</span>
                      <span className="font-bold text-[#14291D]">
                        Current Slider Height: {currentBannerSlider.customHeightPx ? `${currentBannerSlider.customHeightPx}px (Custom Height Active)` : 'Responsive Auto (Adaptive)'}
                      </span>
                      <span>Cinematic (1000px)</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={1000}
                      step={10}
                      value={currentBannerSlider.customHeightPx || 180}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 180;
                        handleUpdateBannerSlider({ customHeightPx: val, aspectRatio: 'custom' });
                      }}
                      className="w-full accent-[#2C5E43] cursor-pointer"
                    />
                  </div>

                  {/* Quick Height Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-[#716858] mr-1">Quick Sizes:</span>
                    {[
                      { label: '140px (Small)', px: 140 },
                      { label: '180px (Standard)', px: 180 },
                      { label: '240px (Medium)', px: 240 },
                      { label: '320px (Large)', px: 320 },
                      { label: '420px (Extra Large)', px: 420 },
                      { label: '540px (Hero)', px: 540 },
                      { label: '680px (Max Hero)', px: 680 },
                      { label: '850px (Cinematic)', px: 850 },
                    ].map((btn) => (
                      <button
                        key={btn.px}
                        type="button"
                        onClick={() => handleUpdateBannerSlider({ customHeightPx: btn.px, aspectRatio: 'custom' })}
                        className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer ${
                          currentBannerSlider.customHeightPx === btn.px
                            ? 'bg-[#183624] text-white shadow-2xs'
                            : 'bg-[#FAF8F5] text-[#4F4638] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleUpdateBannerSlider({ customHeightPx: undefined, aspectRatio: 'auto' })}
                      className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer ${
                        !currentBannerSlider.customHeightPx
                          ? 'bg-[#183624] text-white shadow-2xs'
                          : 'bg-[#FAF8F5] text-[#4F4638] hover:bg-[#F2ECE1] border border-[#DDD5C5]'
                      }`}
                    >
                      Auto Responsive
                    </button>
                  </div>
                </div>

                {/* Scroller Bottom Gradient & Frosted Glass Overlay Selector */}
                <div className="pt-3.5 border-t border-[#F0EAE1] space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <label className="block font-bold text-[#14291D] text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Scroller Bottom Gradient & Glass Overlay Style</span>
                      </label>
                      <p className="text-[10.5px] text-[#716858]">
                        Scroller me bottom dark gradient lagana ho ya hatana ho: None chunein for 100% clean photo, ya black/white gradient ya frosted blur glass set karein.
                      </p>
                    </div>
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#183624] text-white shrink-0 capitalize">
                      Active: {currentBannerSlider.overlayStyle || 'none'}
                    </span>
                  </div>

                  {/* 6 Visual Overlay Option Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                    {GRADIENT_OVERLAY_OPTIONS.map((opt) => {
                      const isSelected = (currentBannerSlider.overlayStyle || 'none') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleUpdateBannerSlider({ overlayStyle: opt.value })}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                            isSelected
                              ? 'border-[#183624] bg-white ring-2 ring-[#2C5E43] shadow-xs'
                              : 'border-[#DDD5C5] bg-[#FAF8F5] hover:bg-white hover:border-[#B5A894]'
                          }`}
                        >
                          <div className="space-y-1.5 w-full">
                            {/* Color Preview Swatch */}
                            <div className="w-full h-8 rounded-lg overflow-hidden border border-[#D5CCBC] relative bg-stone-100 flex items-end">
                              <div className={`w-full h-full ${opt.previewBg}`} />
                              <span className="absolute bottom-1 right-1 text-[8.5px] font-bold px-1 py-0.2 rounded bg-black/60 text-white leading-tight">
                                {opt.badge}
                              </span>
                            </div>
                            <div className="font-bold text-[11px] text-[#14291D] leading-tight line-clamp-1">
                              {opt.label.split('(')[0].trim()}
                            </div>
                            <p className="text-[9.5px] text-[#716858] leading-tight line-clamp-2">
                              {opt.description}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="mt-1.5 inline-flex items-center gap-0.5 text-[9.5px] font-bold text-[#183624]">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Multiple Image Slides List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-[#14291D] uppercase tracking-wider">
                    Banner Slides ({currentBannerSlider.items.length})
                  </h4>
                  <span className="text-[11px] text-[#716858]">
                    Slide Images & Links
                  </span>
                </div>

                {currentBannerSlider.items.length === 0 ? (
                  <div className="p-6 text-center bg-white rounded-lg border border-dashed border-[#DDD5C5] space-y-2">
                    <ImageIcon className="w-8 h-8 text-[#A89F8F] mx-auto" />
                    <p className="text-xs text-[#52493A] font-medium">No banner image slides currently configured.</p>
                    <button
                      type="button"
                      onClick={handleAddBannerSlide}
                      className="px-3 py-1.5 text-xs font-bold bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg cursor-pointer"
                    >
                      Add First Banner Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentBannerSlider.items.map((slide, idx) => (
                      <div 
                        key={slide.id || idx} 
                        className="p-3.5 bg-white rounded-xl border border-[#D5CCBC] shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#14291D] text-white text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-xs text-[#14291D]">
                              {slide.title || `Slide ${idx + 1}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveBannerSlide(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-[#716858] hover:text-[#14291D] disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveBannerSlide(idx, 'down')}
                              disabled={idx === currentBannerSlider.items.length - 1}
                              className="p-1 rounded text-[#716858] hover:text-[#14291D] disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBannerSlide(idx)}
                              className="p-1 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer"
                              title="Delete Slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                          {/* Image preview & URL */}
                          <div className="sm:col-span-5 flex gap-2">
                            <div className="w-20 h-16 rounded-lg bg-[#FAF8F5] border border-[#DDD5C5] overflow-hidden shrink-0 relative">
                              <img
                                src={slide.imageUrl}
                                alt={slide.title || 'Slide'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <label className="block text-[11px] font-medium text-[#2F2920]">
                                Image URL
                              </label>
                              <input
                                type="url"
                                value={slide.imageUrl}
                                onChange={(e) => handleUpdateBannerSlide(idx, 'imageUrl', e.target.value)}
                                placeholder="https://..."
                                className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-[11px]"
                              />
                            </div>
                          </div>

                          {/* Title & Subtitle */}
                          <div className="sm:col-span-4 space-y-1">
                            <div>
                              <label className="block text-[11px] font-medium text-[#2F2920]">
                                Slide Title (Optional)
                              </label>
                              <input
                                type="text"
                                value={slide.title || ''}
                                onChange={(e) => handleUpdateBannerSlide(idx, 'title', e.target.value)}
                                placeholder="e.g. Authentic Classical Formulations"
                                className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-[11px]"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={slide.subtitle || ''}
                                onChange={(e) => handleUpdateBannerSlide(idx, 'subtitle', e.target.value)}
                                placeholder="Subtitle / botanical notice"
                                className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-[11px]"
                              />
                            </div>
                          </div>

                          {/* Click Action / Link */}
                          <div className="sm:col-span-3 space-y-1">
                            <label className="block text-[11px] font-medium text-[#2F2920]">
                              Clickable Action
                            </label>
                            <select
                              value={slide.linkType || 'none'}
                              onChange={(e) => handleUpdateBannerSlide(idx, 'linkType', e.target.value as any)}
                              className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-[11px] font-medium"
                            >
                              <option value="none">No Link (Display Only)</option>
                              <option value="product">Open Specific Product</option>
                              <option value="category">Go to Category</option>
                              <option value="custom">Custom URL / Anchor</option>
                            </select>

                            {slide.linkType === 'product' && (
                              <select
                                value={slide.productId || ''}
                                onChange={(e) => handleUpdateBannerSlide(idx, 'productId', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-emerald-400 rounded text-[10.5px]"
                              >
                                <option value="">-- Choose Product --</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            {slide.linkType === 'category' && (
                              <select
                                value={slide.category || ''}
                                onChange={(e) => handleUpdateBannerSlide(idx, 'category', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-emerald-400 rounded text-[10.5px]"
                              >
                                <option value="">-- Choose Category --</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            )}

                            {slide.linkType === 'custom' && (
                              <input
                                type="text"
                                value={slide.customUrl || ''}
                                onChange={(e) => handleUpdateBannerSlide(idx, 'customUrl', e.target.value)}
                                placeholder="e.g. #deals-catalog"
                                className="w-full px-2 py-1 bg-white border border-emerald-400 rounded text-[10.5px]"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

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

        {/* Tab: Marquee Infinite Scrolling Ticker (Customize Texts, Existing Products, Colors, Speed, Size, Click Actions) */}
        {activeTab === 'marquee' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-5 pb-28 sm:pb-8 text-xs">
            {/* Header & Quick Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#14291D] text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#14291D] flex items-center gap-2">
                    <span>Marquee Infinite Scroll Customizer</span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      currentMarquee.enabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {currentMarquee.enabled ? 'Active on Store' : 'Hidden'}
                    </span>
                  </h3>
                  <p className="text-xs text-[#695F4F]">
                    Smooth infinite scrolling announcement bar with custom texts and pre-existed products. Customize size, speed, colors, pause-on-hover & click targets.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleRestoreDefaultMarquee}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#52493A] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#2C5E43]" />
                  <span>Reset Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveMarqueeTab}
                  className="px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Save & Sync</span>
                </button>
              </div>
            </div>

            {/* LIVE INTERACTIVE PREVIEW */}
            <div className="bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#14291D] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#2C5E43]" />
                  <span>Live Storefront Interactive Preview</span>
                </span>
                <span className="text-[11px] text-[#716858] italic">
                  (Hover to pause · Click products to preview detail modal)
                </span>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#D5CCBC] shadow-inner bg-stone-100">
                {currentMarquee.enabled ? (
                  <MarqueeTicker
                    config={currentMarquee}
                    products={products}
                    onSelectProduct={onPreviewProduct}
                  />
                ) : (
                  <div className="py-4 text-center text-xs font-medium text-stone-500 bg-stone-200/60">
                    Marquee is currently set to HIDDEN. Toggle switch below to show it on storefront.
                  </div>
                )}
              </div>
            </div>

            {/* MASTER CONTROLS & DISPLAY SETTINGS */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#2C5E43]" />
                  <h4 className="font-serif text-sm font-bold text-[#14291D]">
                    Master Marquee Controls & Display Options
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateMarquee({ enabled: !currentMarquee.enabled })}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentMarquee.enabled
                        ? 'bg-[#183624] text-white shadow-xs'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${currentMarquee.enabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                    <span>{currentMarquee.enabled ? 'Marquee Display: ACTIVE' : 'Marquee Display: HIDDEN'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placement */}
                <div>
                  <label className="block font-semibold text-[#2F2920] mb-1">
                    Marquee Position on Page
                  </label>
                  <select
                    value={currentMarquee.placement || 'below_header'}
                    onChange={(e) => handleUpdateMarquee({ placement: e.target.value as MarqueePlacement })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D] focus:outline-hidden focus:border-[#2C5E43]"
                  >
                    <option value="below_header">Below Header Navigation (Recommended)</option>
                    <option value="top_bar">Top of Screen (Above Header Bar)</option>
                    <option value="below_hero">Below Hero Banner Section</option>
                    <option value="above_catalog">Above Product Catalog & Shelves</option>
                    <option value="above_footer">Above Bottom Footer</option>
                  </select>
                  <p className="text-[10.5px] text-[#716858] mt-1">
                    Select where the scrolling bar appears on the storefront.
                  </p>
                </div>

                {/* Direction */}
                <div>
                  <label className="block font-semibold text-[#2F2920] mb-1">
                    Scroll Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateMarquee({ direction: 'left' })}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border ${
                        currentMarquee.direction !== 'right'
                          ? 'bg-[#183624] text-white border-[#183624]'
                          : 'bg-[#FAF8F5] text-[#52493A] border-[#DDD5C5] hover:bg-stone-100'
                      }`}
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                      <span>Left (← Standard)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateMarquee({ direction: 'right' })}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border ${
                        currentMarquee.direction === 'right'
                          ? 'bg-[#183624] text-white border-[#183624]'
                          : 'bg-[#FAF8F5] text-[#52493A] border-[#DDD5C5] hover:bg-stone-100'
                      }`}
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                      <span>Right (→ Reverse)</span>
                    </button>
                  </div>
                </div>

                {/* Divider Icon */}
                <div>
                  <label className="block font-semibold text-[#2F2920] mb-1">
                    Divider Icon Between Items
                  </label>
                  <select
                    value={currentMarquee.dividerIcon || 'leaf'}
                    onChange={(e) => handleUpdateMarquee({ dividerIcon: e.target.value as MarqueeDividerIcon })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D] focus:outline-hidden focus:border-[#2C5E43]"
                  >
                    <option value="leaf">🌿 Ayurvedic Herbal Leaf</option>
                    <option value="sparkles">✨ Golden Sparkles</option>
                    <option value="star">⭐ Star Accent</option>
                    <option value="flame">🔥 Flame / Agni</option>
                    <option value="dot">• Minimal Bullet Dot</option>
                    <option value="none">| Subtle Vertical Line</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block font-semibold text-[#2F2920] mb-1">
                    Text Font Size
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'small', label: 'Small (11px)' },
                      { id: 'medium', label: 'Medium (13px)' },
                      { id: 'large', label: 'Large (15px)' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => handleUpdateMarquee({ fontSize: sz.id as MarqueeSize })}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center cursor-pointer border ${
                          (currentMarquee.fontSize || 'medium') === sz.id
                            ? 'bg-[#183624] text-white border-[#183624]'
                            : 'bg-[#FAF8F5] text-[#52493A] border-[#DDD5C5] hover:bg-stone-100'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Padding / Height */}
                <div>
                  <label className="block font-semibold text-[#2F2920] mb-1">
                    Bar Height & Padding
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'compact', label: 'Compact' },
                      { id: 'regular', label: 'Regular' },
                      { id: 'spacious', label: 'Spacious' },
                    ].map((pd) => (
                      <button
                        key={pd.id}
                        type="button"
                        onClick={() => handleUpdateMarquee({ paddingSize: pd.id as any })}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center cursor-pointer border ${
                          (currentMarquee.paddingSize || 'regular') === pd.id
                            ? 'bg-[#183624] text-white border-[#183624]'
                            : 'bg-[#FAF8F5] text-[#52493A] border-[#DDD5C5] hover:bg-stone-100'
                        }`}
                      >
                        {pd.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pause on Hover */}
                <div>
                  <label className="block font-semibold text-[#2F2920] mb-1">
                    Pause on Hover / Touch
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-[#FAF8F5] rounded-lg border border-[#DDD5C5] cursor-pointer text-xs font-semibold text-[#14291D]">
                    <input
                      type="checkbox"
                      checked={currentMarquee.pauseOnHover !== false}
                      onChange={(e) => handleUpdateMarquee({ pauseOnHover: e.target.checked })}
                      className="rounded accent-[#2C5E43]"
                    />
                    <span>Pause scroll when cursor hovers</span>
                  </label>
                </div>
              </div>

              {/* Speed Slider with Presets */}
              <div className="pt-3 border-t border-[#F0EAE1] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-[#14291D] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#2C5E43]" />
                    <span>Scroll Speed / Cycle Duration:</span>
                    <span className="font-mono text-[#2C5E43] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {currentMarquee.speedSeconds || 26} seconds
                    </span>
                  </label>
                  <span className="text-[11px] text-[#716858]">
                    (Lower seconds = faster scroll, higher = gentler and slower)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-stone-500 font-mono">Fast (8s)</span>
                  <input
                    type="range"
                    min={8}
                    max={70}
                    step={2}
                    value={currentMarquee.speedSeconds || 26}
                    onChange={(e) => handleUpdateMarquee({ speedSeconds: Number(e.target.value) })}
                    className="flex-1 accent-[#2C5E43] cursor-pointer"
                  />
                  <span className="text-[10px] text-stone-500 font-mono">Slow (70s)</span>
                </div>

                {/* Quick Speed Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#716858] font-medium mr-1">Quick Presets:</span>
                  {[
                    { label: '⚡ Fast (14s)', val: 14 },
                    { label: '🌿 Balanced (26s)', val: 26 },
                    { label: '🍃 Gentle (38s)', val: 38 },
                    { label: '⏳ Relaxed (52s)', val: 52 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => handleUpdateMarquee({ speedSeconds: p.val })}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer ${
                        currentMarquee.speedSeconds === p.val
                          ? 'bg-[#183624] text-white border-[#183624]'
                          : 'bg-[#FAF8F5] text-[#52493A] border-[#DDD5C5] hover:bg-stone-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLOR & PALETTE CUSTOMIZER */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#B4741E]" />
                  <h4 className="font-serif text-sm font-bold text-[#14291D]">
                    Colors & Palette Styling
                  </h4>
                </div>
                <span className="text-[11px] text-[#716858]">
                  Fully customizable background, text & border colors
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Background Color */}
                <div className="space-y-2.5">
                  <label className="block font-bold text-[#14291D]">
                    Marquee Background Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={currentMarquee.backgroundColor || '#14291D'}
                      onChange={(e) => handleUpdateMarquee({ backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-[#DDD5C5] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={currentMarquee.backgroundColor || '#14291D'}
                      onChange={(e) => handleUpdateMarquee({ backgroundColor: e.target.value })}
                      placeholder="#14291D"
                      className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs font-bold text-[#14291D]"
                    />
                  </div>

                  {/* Preset Background Chips */}
                  <div className="space-y-1">
                    <span className="text-[10.5px] text-[#716858] font-medium">Ayurvedic Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Deep Forest', color: '#14291D' },
                        { label: 'Golden Amber', color: '#B4741E' },
                        { label: 'Herbal Emerald', color: '#1B432E' },
                        { label: 'Warm Cream', color: '#FDF8EE' },
                        { label: 'Terracotta', color: '#9A3412' },
                        { label: 'Midnight', color: '#0F172A' },
                        { label: 'White', color: '#FFFFFF' },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => {
                            const isLight = preset.color === '#FDF8EE' || preset.color === '#FFFFFF';
                            handleUpdateMarquee({ 
                              backgroundColor: preset.color,
                              textColor: isLight ? '#14291D' : '#FFFFFF'
                            });
                          }}
                          className="px-2 py-1 rounded border border-[#DDD5C5] text-[10.5px] font-semibold flex items-center gap-1.5 hover:bg-stone-50 cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.color }} />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-2.5">
                  <label className="block font-bold text-[#14291D]">
                    Default Text Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={currentMarquee.textColor || '#FFFFFF'}
                      onChange={(e) => handleUpdateMarquee({ textColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-[#DDD5C5] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={currentMarquee.textColor || '#FFFFFF'}
                      onChange={(e) => handleUpdateMarquee({ textColor: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs font-bold text-[#14291D]"
                    />
                  </div>

                  {/* Preset Text Chips */}
                  <div className="space-y-1">
                    <span className="text-[10.5px] text-[#716858] font-medium">Text Color Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Pure White', color: '#FFFFFF' },
                        { label: 'Soft Gold', color: '#FEF08A' },
                        { label: 'Mint Sage', color: '#A7F3D0' },
                        { label: 'Dark Pine', color: '#14291D' },
                        { label: 'Bronze', color: '#78350F' },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => handleUpdateMarquee({ textColor: preset.color })}
                          className="px-2 py-1 rounded border border-[#DDD5C5] text-[10.5px] font-semibold flex items-center gap-1.5 hover:bg-stone-50 cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.color }} />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Border Toggle & Color */}
              <div className="pt-3 border-t border-[#F0EAE1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#14291D]">
                  <input
                    type="checkbox"
                    checked={currentMarquee.showBorder !== false}
                    onChange={(e) => handleUpdateMarquee({ showBorder: e.target.checked })}
                    className="rounded accent-[#2C5E43]"
                  />
                  <span>Show subtle top & bottom border line</span>
                </label>

                {currentMarquee.showBorder && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#716858]">Border Color:</span>
                    <input
                      type="color"
                      value={currentMarquee.borderColor || '#234632'}
                      onChange={(e) => handleUpdateMarquee({ borderColor: e.target.value })}
                      className="w-7 h-7 rounded border border-[#DDD5C5] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentMarquee.borderColor || '#234632'}
                      onChange={(e) => handleUpdateMarquee({ borderColor: e.target.value })}
                      className="w-24 px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* MARQUEE ITEMS MANAGER (TEXTS & PRE-EXISTED PRODUCTS) */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE3D4] pb-3">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#14291D] flex items-center gap-2">
                    <span>Marquee Items Reel</span>
                    <span className="text-xs font-mono font-bold bg-[#FAF8F5] text-[#2C5E43] px-2 py-0.5 rounded-full border border-[#DDD5C5]">
                      {currentMarquee.items.length} items
                    </span>
                  </h4>
                  <p className="text-xs text-[#695F4F]">
                    Add custom announcement texts or pre-existed products from your catalog. Items scroll in continuous order.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAddMarqueeTextItem}
                    className="px-3.5 py-1.5 bg-[#2C5E43] hover:bg-[#1E422F] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Text</span>
                  </button>

                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-lg border border-[#DDD5C5]">
                    <select
                      value={selectedProductToAdd}
                      onChange={(e) => setSelectedProductToAdd(e.target.value)}
                      className="px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs font-semibold text-[#14291D] max-w-[170px] truncate"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.price})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddMarqueeProductItem(selectedProductToAdd)}
                      className="px-3 py-1 bg-[#B4741E] hover:bg-[#965E14] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {currentMarquee.items.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500 bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD5C5] space-y-2">
                  <p>No items in marquee reel yet.</p>
                  <p className="text-[11px] text-stone-400">Click "+ Add Custom Text" or choose a pre-existed product above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentMarquee.items.map((item, idx) => {
                    const isEditing = editingMarqueeItemId === item.id;
                    const linkedProduct = item.type === 'product' ? products.find((p) => p.id === item.productId) : null;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border transition-all ${
                          isEditing
                            ? 'bg-[#FAF8F5] border-[#2C5E43] shadow-md ring-1 ring-[#2C5E43]'
                            : 'bg-white border-[#DDD5C5] hover:border-[#B4741E]'
                        }`}
                      >
                        {/* Item Summary Bar */}
                        <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Order & Reorder */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="font-mono font-bold text-stone-500 text-xs w-6 text-center">
                                #{idx + 1}
                              </span>
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveMarqueeItem(idx, 'up')}
                                  className="p-0.5 text-stone-500 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                                  title="Move earlier"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === currentMarquee.items.length - 1}
                                  onClick={() => handleMoveMarqueeItem(idx, 'down')}
                                  className="p-0.5 text-stone-500 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                                  title="Move later"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Type Indicator */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                item.type === 'product'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              }`}
                            >
                              {item.type === 'product' ? '🛍️ Product' : '🏷️ Custom Text'}
                            </span>

                            {/* Content Preview */}
                            <div className="min-w-0 flex-1 flex items-center gap-2">
                              {item.type === 'product' ? (
                                <>
                                  {item.showImage !== false && linkedProduct?.image && (
                                    <img
                                      src={linkedProduct.image}
                                      alt={linkedProduct.name}
                                      className="w-7 h-7 rounded-full object-cover border border-[#DDD5C5] shrink-0"
                                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                    />
                                  )}
                                  <span className="font-bold text-[#14291D] truncate">
                                    {item.customLabel || linkedProduct?.name || 'Product'}
                                  </span>
                                  {linkedProduct && (
                                    <span className="font-mono text-[11px] font-bold text-[#2C5E43] shrink-0">
                                      ₹{linkedProduct.price}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                                    (Opens Product Detail Modal)
                                  </span>
                                </>
                              ) : (
                                <>
                                  {item.badge && (
                                    <span
                                      className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                                      style={{
                                        backgroundColor: item.badgeColor || '#B4741E',
                                        color: item.badgeTextColor || '#FFFFFF',
                                      }}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                  <span className="text-[#14291D] truncate font-medium">
                                    {item.text || 'Custom announcement text...'}
                                  </span>
                                  {item.linkType && item.linkType !== 'none' && (
                                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                                      🔗 {item.linkType === 'whatsapp' ? 'WhatsApp' : item.linkType === 'product' ? 'Product Link' : item.linkType === 'category' ? 'Category Filter' : 'URL Link'}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setEditingMarqueeItemId(isEditing ? null : item.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                isEditing
                                  ? 'bg-[#183624] text-white'
                                  : 'bg-stone-100 text-[#52493A] hover:bg-stone-200 border border-[#DDD5C5]'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isEditing ? 'Close' : 'Edit'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMarqueeItem(item.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Editor Drawer */}
                        {isEditing && (
                          <div className="p-4 border-t border-[#DDD5C5] bg-white rounded-b-xl space-y-4">
                            {item.type === 'text' ? (
                              /* EDIT CUSTOM TEXT ITEM */
                              <div className="space-y-3">
                                <div>
                                  <label className="block font-semibold text-[#14291D] mb-1">
                                    Announcement Text Message *
                                  </label>
                                  <input
                                    type="text"
                                    value={item.text || ''}
                                    onChange={(e) => handleUpdateMarqueeItem(item.id, { text: e.target.value })}
                                    placeholder="e.g. 🌿 100% Classical Botanical Extracts & Heavy-Metal Lab Verified"
                                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {/* Badge Tag */}
                                  <div>
                                    <label className="block font-medium text-[#2F2920] mb-1">
                                      Optional Badge Tag (e.g. OFFER, NEW)
                                    </label>
                                    <input
                                      type="text"
                                      value={item.badge || ''}
                                      onChange={(e) => handleUpdateMarqueeItem(item.id, { badge: e.target.value })}
                                      placeholder="e.g. FESTIVAL SPECIAL"
                                      className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                                    />
                                  </div>

                                  {/* Badge Colors */}
                                  <div>
                                    <label className="block font-medium text-[#2F2920] mb-1">
                                      Badge Background Color
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={item.badgeColor || '#B4741E'}
                                        onChange={(e) => handleUpdateMarqueeItem(item.id, { badgeColor: e.target.value })}
                                        className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={item.badgeColor || '#B4741E'}
                                        onChange={(e) => handleUpdateMarqueeItem(item.id, { badgeColor: e.target.value })}
                                        className="w-24 px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs font-mono"
                                      />
                                    </div>
                                  </div>

                                  {/* Custom Text Color Override */}
                                  <div>
                                    <label className="block font-medium text-[#2F2920] mb-1">
                                      Item Text Color (Optional Override)
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={item.textColor || currentMarquee.textColor || '#FFFFFF'}
                                        onChange={(e) => handleUpdateMarqueeItem(item.id, { textColor: e.target.value })}
                                        className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateMarqueeItem(item.id, { textColor: undefined })}
                                        className="px-2 py-1 text-[10px] bg-stone-100 hover:bg-stone-200 rounded border border-[#DDD5C5] cursor-pointer"
                                      >
                                        Use Default
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Clickable Target Selector */}
                                <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#DDD5C5] space-y-2.5">
                                  <label className="block font-bold text-xs text-[#14291D]">
                                    Click Action (What happens when customer clicks this announcement text?)
                                  </label>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <select
                                        value={item.linkType || 'none'}
                                        onChange={(e) => handleUpdateMarqueeItem(item.id, { linkType: e.target.value as any })}
                                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                                      >
                                        <option value="none">None (Plain non-clickable announcement)</option>
                                        <option value="product">Open Specific Product Detail Modal</option>
                                        <option value="category">Filter Catalog by Category</option>
                                        <option value="whatsapp">Open WhatsApp Consultation / Chat</option>
                                        <option value="url">Open Custom Web URL / Link</option>
                                      </select>
                                    </div>

                                    <div>
                                      {item.linkType === 'product' && (
                                        <select
                                          value={item.linkProductId || products[0]?.id || ''}
                                          onChange={(e) => handleUpdateMarqueeItem(item.id, { linkProductId: e.target.value })}
                                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                                        >
                                          {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                              {p.name} (₹{p.price})
                                            </option>
                                          ))}
                                        </select>
                                      )}

                                      {item.linkType === 'category' && (
                                        <select
                                          value={item.linkCategory || 'all'}
                                          onChange={(e) => handleUpdateMarqueeItem(item.id, { linkCategory: e.target.value })}
                                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                                        >
                                          {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                              {c.label}
                                            </option>
                                          ))}
                                        </select>
                                      )}

                                      {item.linkType === 'url' && (
                                        <input
                                          type="text"
                                          value={item.linkUrl || ''}
                                          onChange={(e) => handleUpdateMarqueeItem(item.id, { linkUrl: e.target.value })}
                                          placeholder="https://... or #deals-catalog"
                                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                                        />
                                      )}

                                      {item.linkType === 'whatsapp' && (
                                        <div className="text-xs text-[#2C5E43] font-semibold py-2">
                                          ✓ Opens Doctor Consultation inquiry modal or WhatsApp chat directly
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* EDIT PRODUCT ITEM */
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {/* Product Selector */}
                                  <div>
                                    <label className="block font-semibold text-[#14291D] mb-1">
                                      Select Catalog Product (Pre-existed) *
                                    </label>
                                    <select
                                      value={item.productId || products[0]?.id}
                                      onChange={(e) => {
                                        const p = products.find((prod) => prod.id === e.target.value);
                                        handleUpdateMarqueeItem(item.id, { 
                                          productId: e.target.value,
                                          customLabel: p?.name || ''
                                        });
                                      }}
                                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-bold text-[#14291D]"
                                    >
                                      {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                          {p.name} — ₹{p.price} (MRP ₹{p.mrp})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Custom Label Override */}
                                  <div>
                                    <label className="block font-medium text-[#2F2920] mb-1">
                                      Custom Headline / Subtitle (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={item.customLabel || ''}
                                      onChange={(e) => handleUpdateMarqueeItem(item.id, { customLabel: e.target.value })}
                                      placeholder="Leave empty to use official product name"
                                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                                    />
                                  </div>
                                </div>

                                {/* Visibility Toggles */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                  <label className="flex items-center gap-2 p-2 bg-[#FAF8F5] rounded-lg border border-[#DDD5C5] cursor-pointer text-xs font-semibold text-[#14291D]">
                                    <input
                                      type="checkbox"
                                      checked={item.showImage !== false}
                                      onChange={(e) => handleUpdateMarqueeItem(item.id, { showImage: e.target.checked })}
                                      className="rounded accent-[#2C5E43]"
                                    />
                                    <span>Show Product Photo</span>
                                  </label>

                                  <label className="flex items-center gap-2 p-2 bg-[#FAF8F5] rounded-lg border border-[#DDD5C5] cursor-pointer text-xs font-semibold text-[#14291D]">
                                    <input
                                      type="checkbox"
                                      checked={item.showPrice !== false}
                                      onChange={(e) => handleUpdateMarqueeItem(item.id, { showPrice: e.target.checked })}
                                      className="rounded accent-[#2C5E43]"
                                    />
                                    <span>Show Price & MRP</span>
                                  </label>

                                  <label className="flex items-center gap-2 p-2 bg-[#FAF8F5] rounded-lg border border-[#DDD5C5] cursor-pointer text-xs font-semibold text-[#14291D]">
                                    <input
                                      type="checkbox"
                                      checked={item.showBadge !== false}
                                      onChange={(e) => handleUpdateMarqueeItem(item.id, { showBadge: e.target.checked })}
                                      className="rounded accent-[#2C5E43]"
                                    />
                                    <span>Show Trending / Top Badge</span>
                                  </label>
                                </div>

                                <div className="text-[11px] text-[#2C5E43] font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                                  ✨ Clicking this product in the marquee automatically opens the full Product Detail & Purchasing Modal on the storefront.
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end pt-2 border-t border-[#EAE3D4]">
                              <button
                                type="button"
                                onClick={() => setEditingMarqueeItemId(null)}
                                className="px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Done Editing
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Save All Button */}
            <div className="flex justify-end pt-2 pb-6">
              <button
                type="button"
                onClick={handleSaveMarqueeTab}
                className="px-6 py-2.5 bg-[#14291D] hover:bg-[#234D34] text-white rounded-lg font-bold flex items-center gap-2 shadow-md cursor-pointer text-xs"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save All Marquee Ticker Changes to Firebase & Storefront</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab: Horizontal Product Shelves (Create Multiple, Edit, Delete, Position, Category/Manual Source & Card Detail Customizer) */}
        {activeTab === 'horizontal_lists' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
            {isCreatingNewHorizontalList || editingHorizontalList ? (
              /* CREATE / EDIT SHELF FORM */
              <form onSubmit={handleSaveHorizontalListForm} className="space-y-6">
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#D5CCBC] shadow-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNewHorizontalList(false);
                        setEditingHorizontalList(null);
                      }}
                      className="p-1.5 rounded-lg border border-[#DDD5C5] text-[#52493A] hover:bg-[#FAF8F5] cursor-pointer"
                      title="Back to Shelves List"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#14291D]">
                        {isCreatingNewHorizontalList ? 'Create New Horizontal Product Shelf' : `Edit Shelf: ${horizontalListForm.title}`}
                      </h3>
                      <p className="text-xs text-[#695F4F]">
                        Configure shelf title, product sourcing method, and card detail visibility elements.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNewHorizontalList(false);
                        setEditingHorizontalList(null);
                      }}
                      className="px-3 py-1.5 text-xs text-[#52493A] hover:bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-300" />
                      <span>Save Shelf & Sync</span>
                    </button>
                  </div>
                </div>

                {/* 1. Shelf Title & Position Information */}
                <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2.5">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#2C5E43]" />
                      <h4 className="font-bold text-sm text-[#14291D]">
                        1. Shelf Section Title & Position
                      </h4>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#14291D]">
                      <input
                        type="checkbox"
                        checked={horizontalListForm.enabled}
                        onChange={(e) => setHorizontalListForm({ ...horizontalListForm, enabled: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Active on Website</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#2F2920] mb-1">
                        Shelf Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={horizontalListForm.title}
                        onChange={(e) => setHorizontalListForm({ ...horizontalListForm, title: e.target.value })}
                        placeholder="e.g. Doctor Recommended Classical Rasayanas"
                        className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs text-[#2F2920]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#2F2920] mb-1">
                        Badge / Tag Pill Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={horizontalListForm.badgeText || ''}
                        onChange={(e) => setHorizontalListForm({ ...horizontalListForm, badgeText: e.target.value })}
                        placeholder="e.g. Curated Collection, Doctor's Choice"
                        className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs text-[#2F2920]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#2F2920] mb-1">
                        Subtitle / Pharmacist Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={horizontalListForm.subtitle || ''}
                        onChange={(e) => setHorizontalListForm({ ...horizontalListForm, subtitle: e.target.value })}
                        placeholder="e.g. Handpicked authentic herbal preparations to restore vitality, immunity & stamina."
                        className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs text-[#2F2920]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#2F2920] mb-1">
                        Display Order / Position
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={horizontalListForm.displayOrder}
                        onChange={(e) => setHorizontalListForm({ ...horizontalListForm, displayOrder: Number(e.target.value) || 1 })}
                        className="w-24 px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs text-[#2F2920]"
                      />
                      <p className="text-[10px] text-[#716858] mt-0.5">
                        Lower number appears higher on the storefront page.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Product Sourcing: Pre-added Category vs Directly Selected Products */}
                <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#B4741E]" />
                      <h4 className="font-bold text-sm text-[#14291D]">
                        2. Add Products: Pre-Added Category or Directly Selected Products
                      </h4>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label 
                      onClick={() => setHorizontalListForm({ ...horizontalListForm, sourceType: 'category' })}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        horizontalListForm.sourceType === 'category'
                          ? 'bg-emerald-50/70 border-[#2C5E43] ring-1 ring-[#2C5E43]'
                          : 'bg-[#FAF8F5] border-[#DDD5C5] hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sourceType"
                        checked={horizontalListForm.sourceType === 'category'}
                        onChange={() => setHorizontalListForm({ ...horizontalListForm, sourceType: 'category' })}
                        className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-[#14291D] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#2C5E43]" />
                          <span>Pre-Added Category</span>
                        </div>
                        <p className="text-[11px] text-[#594F40]">
                          Automatically populate shelf from an existing category (e.g. Immunity, Digestion, Mind & Sleep).
                        </p>
                      </div>
                    </label>

                    <label 
                      onClick={() => setHorizontalListForm({ ...horizontalListForm, sourceType: 'manual' })}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        horizontalListForm.sourceType === 'manual'
                          ? 'bg-emerald-50/70 border-[#2C5E43] ring-1 ring-[#2C5E43]'
                          : 'bg-[#FAF8F5] border-[#DDD5C5] hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sourceType"
                        checked={horizontalListForm.sourceType === 'manual'}
                        onChange={() => setHorizontalListForm({ ...horizontalListForm, sourceType: 'manual' })}
                        className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-[#14291D] flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-[#B4741E]" />
                          <span>Directly Selected Products</span>
                        </div>
                        <p className="text-[11px] text-[#594F40]">
                          Handpick specific formulations directly with multi-select checkboxes and custom order.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Category Source Config */}
                  {horizontalListForm.sourceType === 'category' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF8F5] p-3.5 rounded-lg border border-[#EAE3D4]">
                      <div>
                        <label className="block font-semibold text-[#2F2920] mb-1">
                          Select Pre-Added Category *
                        </label>
                        <select
                          value={horizontalListForm.category || 'all'}
                          onChange={(e) => setHorizontalListForm({ ...horizontalListForm, category: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs font-medium text-[#2F2920]"
                        >
                          <option value="all">All Formulations / Top Rated</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#2F2920] mb-1">
                          Max Products to Display
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={30}
                          value={horizontalListForm.maxProducts || 8}
                          onChange={(e) => setHorizontalListForm({ ...horizontalListForm, maxProducts: Number(e.target.value) || 8 })}
                          className="w-24 px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs text-[#2F2920]"
                        />
                        <p className="text-[10px] text-[#716858] mt-0.5">
                          Items will scroll horizontally smoothly across cards.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Manual Direct Selection Config */}
                  {horizontalListForm.sourceType === 'manual' && (
                    <div className="space-y-3 bg-[#FAF8F5] p-3.5 rounded-lg border border-[#EAE3D4]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#14291D]">
                            Select Products ({horizontalListForm.selectedProductIds?.length || 0} selected)
                          </span>
                          {horizontalListForm.selectedProductIds && horizontalListForm.selectedProductIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setHorizontalListForm({ ...horizontalListForm, selectedProductIds: [] })}
                              className="text-[10.5px] text-rose-600 hover:underline cursor-pointer"
                            >
                              Clear all
                            </button>
                          )}
                        </div>

                        {/* Search in products */}
                        <div className="relative w-full sm:w-64">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#8C8270]" />
                          <input
                            type="text"
                            value={productSearchInListForm}
                            onChange={(e) => setProductSearchInListForm(e.target.value)}
                            placeholder="Search by name, herb, or category..."
                            className="w-full pl-8 pr-2.5 py-1 bg-white border border-[#DDD5C5] rounded text-[11px]"
                          />
                        </div>
                      </div>

                      {/* Selected product chips */}
                      {horizontalListForm.selectedProductIds && horizontalListForm.selectedProductIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded border border-[#EAE3D4] max-h-24 overflow-y-auto">
                          {horizontalListForm.selectedProductIds.map((id) => {
                            const p = products.find((prod) => prod.id === id);
                            if (!p) return null;
                            return (
                              <span 
                                key={id} 
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10.5px] font-medium"
                              >
                                <span>{p.name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = (horizontalListForm.selectedProductIds || []).filter((it) => it !== id);
                                    setHorizontalListForm({ ...horizontalListForm, selectedProductIds: next });
                                  }}
                                  className="w-3.5 h-3.5 rounded-full hover:bg-emerald-200 flex items-center justify-center cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Product Checkboxes Grid */}
                      <div className="max-h-60 overflow-y-auto divide-y divide-[#EAE3D4] bg-white rounded border border-[#DDD5C5]">
                        {products
                          .filter((p) => {
                            if (!productSearchInListForm.trim()) return true;
                            const query = productSearchInListForm.toLowerCase();
                            return (
                              p.name.toLowerCase().includes(query) ||
                              (p.sanskritName && p.sanskritName.toLowerCase().includes(query)) ||
                              p.category.toLowerCase().includes(query)
                            );
                          })
                          .map((p) => {
                            const isChecked = (horizontalListForm.selectedProductIds || []).includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center justify-between p-2 hover:bg-[#FAF8F5] transition-colors cursor-pointer text-xs ${
                                  isChecked ? 'bg-emerald-50/60' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const current = horizontalListForm.selectedProductIds || [];
                                      if (e.target.checked) {
                                        setHorizontalListForm({ ...horizontalListForm, selectedProductIds: [...current, p.id] });
                                      } else {
                                        setHorizontalListForm({ ...horizontalListForm, selectedProductIds: current.filter((id) => id !== p.id) });
                                      }
                                    }}
                                    className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4 cursor-pointer shrink-0"
                                  />
                                  <img
                                    src={p.image || (p.images && p.images[0]) || ''}
                                    alt={p.name}
                                    className="w-8 h-8 rounded object-cover bg-stone-100 shrink-0 border border-[#DDD5C5]"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-semibold text-xs text-[#14291D] truncate">
                                      {p.name}
                                    </div>
                                    <div className="text-[10px] text-[#716858] truncate">
                                      {p.sanskritName || p.category}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0 ml-2">
                                  <div className="font-mono font-bold text-xs text-[#14291D]">
                                    {formatPrice(p.price)}
                                  </div>
                                  {p.resellerPrice && (
                                    <div className="text-[10px] text-emerald-700 font-mono font-semibold">
                                      Reseller: {formatPrice(p.resellerPrice)}
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Detail Elements Customizer: Name, Image, Price, Reseller Price, Offer, Tag, etc. */}
                <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                  <div className="border-b border-[#EAE3D4] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#2C5E43]" />
                      <h4 className="font-bold text-sm text-[#14291D]">
                        3. List Detail Display Elements (Select What to Show on Cards)
                      </h4>
                    </div>
                    <p className="text-xs text-[#695F4F] mt-1">
                      Choose which elements appear inside each product card on this horizontal shelf: Name, Image, Retail Price, Reseller Price, Offer/Discount, Tag, etc.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                    {[
                      { key: 'showImage', label: 'Product Image', desc: 'Main photo / thumbnail' },
                      { key: 'showName', label: 'Product Name', desc: 'Primary formulation title' },
                      { key: 'showSanskritName', label: 'Sanskrit Name', desc: 'Botanical Latin/Sanskrit' },
                      { key: 'showPrice', label: 'Retail Price (₹)', desc: 'Standard customer rate' },
                      { key: 'showResellerPrice', label: 'Reseller Price', desc: 'Wholesale clinic margin' },
                      { key: 'showMrpAndOffer', label: 'MRP & % Offer', desc: 'Strike-through & discount' },
                      { key: 'showTag', label: 'Formulation Tag', desc: 'Trending/bestseller badge' },
                      { key: 'showRating', label: 'Rating & Reviews', desc: 'Star rating & review count' },
                      { key: 'showAddToCart', label: 'Add to Cart', desc: 'Direct inquiry action button' },
                      { key: 'showQuickView', label: 'Quick View', desc: 'Full monograph button' },
                    ].map((item) => {
                      const isChecked = horizontalListForm.cardFields[item.key as keyof HorizontalListCardFields] !== false;
                      return (
                        <label
                          key={item.key}
                          className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50/80 border-[#A5D6B6] ring-1 ring-[#A5D6B6]'
                              : 'bg-[#FAF8F5] border-[#DDD5C5] text-[#8C8270] opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-[#14291D]">
                              {item.label}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setHorizontalListForm({
                                  ...horizontalListForm,
                                  cardFields: {
                                    ...horizontalListForm.cardFields,
                                    [item.key]: e.target.checked,
                                  },
                                });
                              }}
                              className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4 cursor-pointer"
                            />
                          </div>
                          <p className="text-[10px] text-[#695F4F]">
                            {item.desc}
                          </p>
                        </label>
                      );
                    })}
                  </div>

                  {/* Live Interactive Card Preview */}
                  <div className="pt-3 border-t border-[#F0EAE1]">
                    <h5 className="font-bold text-xs text-[#14291D] mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Live Card Preview (How customers will see cards on this shelf):</span>
                    </h5>

                    <div className="w-[220px] sm:w-[240px] bg-white rounded-xl border border-[#D5CCBC] shadow-sm flex flex-col justify-between overflow-hidden">
                      <div>
                        {horizontalListForm.cardFields.showImage !== false && (
                          <div className="relative aspect-square bg-[#FAF8F5] overflow-hidden border-b border-[#E8E2D5]">
                            <img
                              src={products[0]?.image || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            {horizontalListForm.cardFields.showTag !== false && (
                              <div className="absolute top-2 left-2 z-10">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#14291D] text-white shadow-xs">
                                  <Tag className="w-2.5 h-2.5 text-amber-300" />
                                  <span>Trending</span>
                                </span>
                              </div>
                            )}
                            {horizontalListForm.cardFields.showMrpAndOffer !== false && (
                              <div className="absolute top-2 right-2 z-10">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B4741E] text-white shadow-xs">
                                  28% OFF
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-3 space-y-1.5">
                          {horizontalListForm.cardFields.showRating !== false && (
                            <div className="flex items-center gap-1 text-[11px] text-[#716858]">
                              <div className="flex items-center text-amber-500">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-[#14291D] ml-0.5">4.9</span>
                              </div>
                              <span className="text-stone-300">·</span>
                              <span>(312)</span>
                            </div>
                          )}

                          {horizontalListForm.cardFields.showName !== false && (
                            <h4 className="font-serif text-xs sm:text-sm font-bold text-[#14291D] line-clamp-1">
                              {products[0]?.name || 'Ashwagandha KSM-66 Gold Extract'}
                            </h4>
                          )}

                          {horizontalListForm.cardFields.showSanskritName !== false && (
                            <p className="text-[10.5px] text-[#716858] italic line-clamp-1">
                              {products[0]?.sanskritName || 'अश्वगंधा चूर्ण / घन सत्व'}
                            </p>
                          )}

                          {(horizontalListForm.cardFields.showPrice !== false || 
                            horizontalListForm.cardFields.showMrpAndOffer !== false || 
                            horizontalListForm.cardFields.showResellerPrice !== false) && (
                            <div className="pt-1 border-t border-[#F2ECE1] space-y-1">
                              <div className="flex items-baseline gap-2">
                                {horizontalListForm.cardFields.showPrice !== false && (
                                  <span className="font-mono font-bold text-sm text-[#14291D]">
                                    ₹649
                                  </span>
                                )}
                                {horizontalListForm.cardFields.showMrpAndOffer !== false && (
                                  <span className="font-mono text-xs text-[#8C8270] line-through">
                                    ₹899
                                  </span>
                                )}
                              </div>

                              {horizontalListForm.cardFields.showResellerPrice !== false && (
                                <div className="flex items-center justify-between text-[10px] bg-[#E7EFEA]/80 px-1.5 py-0.5 rounded border border-[#B5D6C4]">
                                  <span className="text-[#2C5E43] font-semibold">Reseller:</span>
                                  <span className="font-mono font-bold text-[#183624]">
                                    ₹480
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {(horizontalListForm.cardFields.showAddToCart !== false || horizontalListForm.cardFields.showQuickView !== false) && (
                        <div className="p-3 pt-0 flex items-center gap-1.5">
                          {horizontalListForm.cardFields.showAddToCart !== false && (
                            <button
                              type="button"
                              className="flex-1 py-1 px-2 rounded-lg text-xs font-bold bg-[#14291D] text-white shadow-2xs text-center"
                            >
                              Add to Cart
                            </button>
                          )}
                          {horizontalListForm.cardFields.showQuickView !== false && (
                            <button
                              type="button"
                              className="p-1 rounded-lg border border-[#DDD5C5] text-[#52493A]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 pb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNewHorizontalList(false);
                      setEditingHorizontalList(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-[#52493A] hover:bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-xs font-bold bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-amber-300" />
                    <span>Save Horizontal Shelf & Sync to Storefront</span>
                  </button>
                </div>
              </form>
            ) : (
              /* SHELVES OVERVIEW LIST */
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="p-5 rounded-xl border border-[#A5D6B6] bg-linear-to-r from-emerald-50/80 via-white to-amber-50/50 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-[#2C5E43]" />
                        <h3 className="font-serif text-lg font-bold text-[#14291D]">
                          Product Horizontal Shelves Manager
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {currentHorizontalLists.filter((l) => l.enabled).length} Active Shelves
                        </span>
                      </div>
                      <p className="text-xs text-[#594F40]">
                        Create multiple horizontal scrolling carousels on the storefront. Add formulations via pre-added category or directly selected products, and customize visible card details (Name, Image, Retail Price, Reseller Price, Offer, Tags).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleStartCreateHorizontalList}
                        className="px-4 py-2 text-xs font-bold bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-amber-300" />
                        <span>Create New Shelf</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const updatedSiteSettings: SiteSettings = {
                            ...siteForm,
                            productHorizontalLists: DEFAULT_PRODUCT_HORIZONTAL_LISTS,
                          };
                          setSiteForm(updatedSiteSettings);
                          onUpdateSiteSettings(updatedSiteSettings);
                          backupSiteSettingsToFirebase(updatedSiteSettings);
                          setSaveSuccessMsg('Restored default curated horizontal shelves!');
                          setTimeout(() => setSaveSuccessMsg(null), 2500);
                        }}
                        className="px-3 py-2 text-xs font-medium text-[#483F30] hover:text-[#14291D] bg-white hover:bg-[#F2ECE1] border border-[#CFC5B4] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Restore default curated shelves"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#B4741E]" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shelves List */}
                {currentHorizontalLists.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#DDD5C5] space-y-3">
                    <SlidersHorizontal className="w-10 h-10 text-[#A89F8F] mx-auto" />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#14291D]">
                        No Horizontal Product Shelves Configured
                      </h4>
                      <p className="text-xs text-[#695F4F]">
                        Click the button below to create your first horizontal scroll showcase.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartCreateHorizontalList}
                      className="px-4 py-2 text-xs font-bold bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg cursor-pointer"
                    >
                      Create First Shelf
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentHorizontalLists.map((shelf, idx) => (
                      <div
                        key={shelf.id}
                        className={`p-4 rounded-xl border transition-all ${
                          shelf.enabled 
                            ? 'bg-white border-[#D5CCBC] shadow-xs' 
                            : 'bg-[#FAF8F5] border-[#E0D7C8] opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EAE1] pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#14291D] text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {shelf.displayOrder || idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-serif text-sm font-bold text-[#14291D]">
                                  {shelf.title}
                                </h4>
                                {shelf.badgeText && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                                    {shelf.badgeText}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  shelf.enabled
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-stone-200 text-stone-700'
                                }`}>
                                  {shelf.enabled ? 'Visible' : 'Hidden'}
                                </span>
                              </div>
                              {shelf.subtitle && (
                                <p className="text-xs text-[#695F4F] mt-0.5 line-clamp-1">
                                  {shelf.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            {/* Reorder */}
                            <button
                              type="button"
                              onClick={() => handleMoveHorizontalList(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-[#716858] hover:text-[#14291D] disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveHorizontalList(idx, 'down')}
                              disabled={idx === currentHorizontalLists.length - 1}
                              className="p-1 rounded text-[#716858] hover:text-[#14291D] disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>

                            {/* Toggle visibility */}
                            <button
                              type="button"
                              onClick={() => handleToggleHorizontalList(shelf.id)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border cursor-pointer ${
                                shelf.enabled
                                  ? 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300'
                                  : 'bg-emerald-700 text-white hover:bg-emerald-800 border-emerald-800'
                              }`}
                            >
                              {shelf.enabled ? 'Hide' : 'Show'}
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleStartEditHorizontalList(shelf)}
                              className="px-3 py-1 text-xs font-bold bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                              <span>Edit</span>
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteHorizontalList(shelf.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Shelf"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Shelf Summary Info */}
                        <div className="pt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#14291D]">Source:</span>
                            {shelf.sourceType === 'manual' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-medium">
                                <CheckSquare className="w-3 h-3 text-emerald-700" />
                                <span>Direct Selection ({shelf.selectedProductIds?.length || 0} products)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
                                <Layers className="w-3 h-3 text-amber-700" />
                                <span>Category: {shelf.category || 'all'} (Max {shelf.maxProducts || 8})</span>
                              </span>
                            )}
                          </div>

                          {/* Detail Elements Enabled */}
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] text-[#716858] font-semibold mr-1">Showing on Card:</span>
                            {shelf.cardFields?.showImage !== false && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#52493A] border border-[#E0D7C8]">Image</span>
                            )}
                            {shelf.cardFields?.showName !== false && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#52493A] border border-[#E0D7C8]">Name</span>
                            )}
                            {shelf.cardFields?.showPrice !== false && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#52493A] border border-[#E0D7C8]">Price</span>
                            )}
                            {shelf.cardFields?.showResellerPrice !== false && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-emerald-800 border border-emerald-300 font-semibold">Reseller</span>
                            )}
                            {shelf.cardFields?.showMrpAndOffer !== false && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-amber-800 border border-amber-300 font-semibold">Offer</span>
                            )}
                            {shelf.cardFields?.showTag !== false && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#52493A] border border-[#E0D7C8]">Tag</span>
                            )}
                            {shelf.cardFields?.showRating !== false && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#52493A] border border-[#E0D7C8]">Rating</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Categories & Forms Manager (Direct Image Links, Show/Hide, Size, Position: Left/Top/Right/Down & Firebase Sync) */}
        {activeTab === 'categories_forms' && (() => {
          const catApp = siteForm.categoryAppearance || DEFAULT_SITE_SETTINGS.categoryAppearance || {
            showImages: true,
            imagePosition: 'left',
            imageSize: 'medium',
            customImageSizePx: 26,
            imageShape: 'circle',
            allProductsImageUrl: '',
            showAllProductsImage: true,
            allFormsImageUrl: '',
            showAllFormsImage: true,
            formImages: {},
          };

          const previewSizePx = catApp.imageSize === 'small'
            ? 18
            : catApp.imageSize === 'large'
              ? 36
              : catApp.imageSize === 'extra_large'
                ? 46
                : catApp.imageSize === 'custom'
                  ? (catApp.customImageSizePx || 26)
                  : 26;

          const previewShapeClass = catApp.imageShape === 'circle'
            ? 'rounded-full'
            : catApp.imageShape === 'rounded'
              ? 'rounded-md'
              : 'rounded-none';

          const getMockLayoutClass = (hasImage: boolean) => {
            if (!hasImage) return 'flex items-center justify-center';
            switch (catApp.imagePosition) {
              case 'top':
                return 'flex flex-col items-center justify-center gap-1 py-1.5 text-center min-w-[62px]';
              case 'bottom':
                return 'flex flex-col-reverse items-center justify-center gap-1 py-1.5 text-center min-w-[62px]';
              case 'right':
                return 'flex flex-row-reverse items-center justify-center gap-1.5';
              case 'left':
              default:
                return 'flex flex-row items-center justify-center gap-1.5';
            }
          };

          return (
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
              {/* TOP HERO SETTINGS: CATEGORY & FORM IMAGES APPEARANCE (SIZE, POSITION: LEFT/TOP/RIGHT/DOWN, SHOW/HIDE) */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE3D4] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#EAE2D2] text-[#14291D] flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-[#2C5E43]" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#14291D]">
                        Category & Formulation Images Settings
                      </h4>
                      <p className="text-xs text-[#695F4F]">
                        Set direct image links, toggle display on/off, and customize image size and position (Left, Top, Right, Down) on the website.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateCategoryAppearance({
                          showImages: true,
                          imagePosition: 'left',
                          imageSize: 'medium',
                          customImageSizePx: 26,
                          imageShape: 'circle',
                          allProductsImageUrl: DEFAULT_SITE_SETTINGS.categoryAppearance?.allProductsImageUrl,
                          showAllProductsImage: true,
                          allFormsImageUrl: DEFAULT_SITE_SETTINGS.categoryAppearance?.allFormsImageUrl,
                          showAllFormsImage: true,
                          formImages: DEFAULT_SITE_SETTINGS.categoryAppearance?.formImages,
                        });
                        onUpdateCategories(DEFAULT_CATEGORIES);
                        onUpdateForms(DEFAULT_FORMS);
                        setSaveSuccessMsg('Reset all Categories, Forms and Images to herbal defaults!');
                        setTimeout(() => setSaveSuccessMsg(null), 3000);
                      }}
                      className="px-2.5 py-1 text-xs text-[#6D6352] hover:bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg flex items-center gap-1 cursor-pointer"
                      title="Reset all categories and images to default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                  </div>
                </div>

                {/* 1. MASTER SHOW / HIDE TOGGLE */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-[#14291D] block">
                      Category & Form Button Images Display
                    </span>
                    <span className="text-[11px] text-[#695F4F]">
                      Turn images ON or OFF across all category & form buttons on the website.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCategoryAppearance({ showImages: !catApp.showImages })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        catApp.showImages
                          ? 'bg-[#14291D] text-white shadow-xs'
                          : 'bg-white text-[#6E6352] border border-[#DDD5C5]'
                      }`}
                    >
                      {catApp.showImages ? <Eye className="w-3.5 h-3.5 text-amber-300" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                      <span>{catApp.showImages ? 'Images Visible on Website' : 'Images Hidden on Website'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. IMAGE POSITION (LEFT, TOP, RIGHT, DOWN) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#14291D]">
                      📍 Image Position (Left, Top, Right, Down)
                    </label>
                    <span className="text-[11px] font-semibold text-[#2C5E43] uppercase tracking-wider">
                      Current: {catApp.imagePosition}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#695F4F]">
                    Choose where the image appears relative to the category & form button text.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {/* Left */}
                    <button
                      type="button"
                      onClick={() => updateCategoryAppearance({ imagePosition: 'left' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        catApp.imagePosition === 'left'
                          ? 'bg-[#14291D] text-white border-[#14291D] shadow-sm'
                          : 'bg-[#FAF8F5] text-[#453D30] border-[#DDD5C5] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      <ArrowLeft className={`w-4 h-4 ${catApp.imagePosition === 'left' ? 'text-amber-300' : 'text-[#2C5E43]'}`} />
                      <span>Left (बाएं)</span>
                    </button>

                    {/* Top */}
                    <button
                      type="button"
                      onClick={() => updateCategoryAppearance({ imagePosition: 'top' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        catApp.imagePosition === 'top'
                          ? 'bg-[#14291D] text-white border-[#14291D] shadow-sm'
                          : 'bg-[#FAF8F5] text-[#453D30] border-[#DDD5C5] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      <ArrowUp className={`w-4 h-4 ${catApp.imagePosition === 'top' ? 'text-amber-300' : 'text-[#2C5E43]'}`} />
                      <span>Top (ऊपर)</span>
                    </button>

                    {/* Right */}
                    <button
                      type="button"
                      onClick={() => updateCategoryAppearance({ imagePosition: 'right' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        catApp.imagePosition === 'right'
                          ? 'bg-[#14291D] text-white border-[#14291D] shadow-sm'
                          : 'bg-[#FAF8F5] text-[#453D30] border-[#DDD5C5] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      <ArrowRight className={`w-4 h-4 ${catApp.imagePosition === 'right' ? 'text-amber-300' : 'text-[#2C5E43]'}`} />
                      <span>Right (दाएं)</span>
                    </button>

                    {/* Down / Bottom */}
                    <button
                      type="button"
                      onClick={() => updateCategoryAppearance({ imagePosition: 'bottom' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        catApp.imagePosition === 'bottom'
                          ? 'bg-[#14291D] text-white border-[#14291D] shadow-sm'
                          : 'bg-[#FAF8F5] text-[#453D30] border-[#DDD5C5] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      <ArrowDown className={`w-4 h-4 ${catApp.imagePosition === 'bottom' ? 'text-amber-300' : 'text-[#2C5E43]'}`} />
                      <span>Down / Bottom (नीचे)</span>
                    </button>
                  </div>
                </div>

                {/* 3. IMAGE SIZE & SHAPE CONTROLS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Size Selection */}
                  <div className="space-y-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5]">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#14291D]">
                        📏 Image Size (आकार)
                      </label>
                      <span className="text-[11px] font-mono text-[#2C5E43] font-bold">
                        {previewSizePx}px
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                      {[
                        { id: 'small', label: 'Small', px: 18 },
                        { id: 'medium', label: 'Medium', px: 26 },
                        { id: 'large', label: 'Large', px: 36 },
                        { id: 'extra_large', label: 'XL', px: 46 },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateCategoryAppearance({ imageSize: s.id as any })}
                          className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold text-center border cursor-pointer transition-colors ${
                            catApp.imageSize === s.id
                              ? 'bg-[#2C5E43] text-white border-[#2C5E43]'
                              : 'bg-white text-[#52493A] border-[#DDD5C5] hover:bg-[#F2ECE1]'
                          }`}
                        >
                          <div>{s.label}</div>
                          <div className="text-[9px] opacity-80">{s.px}px</div>
                        </button>
                      ))}
                    </div>

                    {/* Custom Size Slider */}
                    <div className="pt-2 border-t border-[#E5DEC-D]/60">
                      <div className="flex items-center justify-between text-[11px] text-[#695F4F] mb-1">
                        <span>Custom Pixel Slider:</span>
                        <span className="font-bold text-[#14291D]">{catApp.customImageSizePx || 26}px</span>
                      </div>
                      <input
                        type="range"
                        min="14"
                        max="70"
                        step="2"
                        value={catApp.customImageSizePx || 26}
                        onChange={(e) => {
                          const px = parseInt(e.target.value, 10);
                          updateCategoryAppearance({
                            imageSize: 'custom',
                            customImageSizePx: px,
                          });
                        }}
                        className="w-full accent-[#2C5E43] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Shape Selection */}
                  <div className="space-y-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5]">
                    <label className="block text-xs font-bold text-[#14291D]">
                      🔘 Image Shape (आकार का रूप)
                    </label>

                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {[
                        { id: 'circle', label: 'Circle (गोल)', icon: Circle },
                        { id: 'rounded', label: 'Rounded (हल्का गोल)', icon: Square },
                        { id: 'square', label: 'Square (चौकोर)', icon: LayoutGrid },
                      ].map((sh) => {
                        const Icon = sh.icon;
                        return (
                          <button
                            key={sh.id}
                            type="button"
                            onClick={() => updateCategoryAppearance({ imageShape: sh.id as any })}
                            className={`py-2 px-1.5 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-1 border cursor-pointer transition-colors ${
                              catApp.imageShape === sh.id
                                ? 'bg-[#2C5E43] text-white border-[#2C5E43]'
                                : 'bg-white text-[#52493A] border-[#DDD5C5] hover:bg-[#F2ECE1]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{sh.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. LIVE INTERACTIVE STOREFRONT SIMULATION */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D5CCBC] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#14291D] flex items-center gap-1.5">
                      <span>👁️ Live Storefront Simulation:</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                        Position: {catApp.imagePosition} · Size: {previewSizePx}px · {catApp.showImages ? 'Visible' : 'Hidden'}
                      </span>
                    </span>
                    <span className="text-[10px] text-[#695F4F]">
                      Exact preview of how website visitors see the buttons
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E7DFD1] flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {/* Simulated "All Products" pill */}
                    <div className={`px-3 py-1 text-xs font-medium rounded-lg bg-[#14291D] text-white shadow-xs ${getMockLayoutClass(Boolean(catApp.showImages && (catApp.allProductsImageUrl || categories[0]?.imageUrl)))}`}>
                      {catApp.showImages && (catApp.allProductsImageUrl || categories[0]?.imageUrl) && (
                        <img
                          src={catApp.allProductsImageUrl || categories[0]?.imageUrl}
                          alt="All Products"
                          style={{ width: `${previewSizePx}px`, height: `${previewSizePx}px` }}
                          className={`${previewShapeClass} object-cover border border-white/30`}
                        />
                      )}
                      <span>All Products</span>
                    </div>

                    {/* Simulated Category 1 pill */}
                    <div className={`px-3 py-1 text-xs font-medium rounded-lg bg-[#FAF8F5] text-[#554C3E] border border-[#E7DFD1] ${getMockLayoutClass(Boolean(catApp.showImages && categories[1]?.imageUrl))}`}>
                      {catApp.showImages && categories[1]?.imageUrl && (
                        <img
                          src={categories[1]?.imageUrl}
                          alt={categories[1]?.label}
                          style={{ width: `${previewSizePx}px`, height: `${previewSizePx}px` }}
                          className={`${previewShapeClass} object-cover`}
                        />
                      )}
                      <span>{categories[1]?.label || 'Immunity & Respiratory'}</span>
                    </div>

                    {/* Simulated Form 1 pill */}
                    <div className={`px-2.5 py-0.5 text-[11px] font-medium rounded-md bg-white text-[#554C3E] border border-[#DDD5C5] ${getMockLayoutClass(Boolean(catApp.showImages && catApp.formImages?.['Churna (Powder)']?.imageUrl))}`}>
                      {catApp.showImages && catApp.formImages?.['Churna (Powder)']?.imageUrl && (
                        <img
                          src={catApp.formImages['Churna (Powder)'].imageUrl}
                          alt="Churna"
                          style={{ width: `${Math.max(16, Math.round(previewSizePx * 0.85))}px`, height: `${Math.max(16, Math.round(previewSizePx * 0.85))}px` }}
                          className={`${previewShapeClass} object-cover`}
                        />
                      )}
                      <span>Churna (Powder)</span>
                    </div>
                  </div>
                </div>

                {/* 5. SPECIAL ROOT BUTTONS ("All Products" & "All Forms") */}
                <div className="p-4 bg-[#F5F9F6] rounded-xl border border-[#C5DED0] space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2C5E43]" />
                    <h5 className="font-bold text-xs text-[#14291D]">
                      ⭐ Special Root Buttons Image Links ("All Products" & "All Forms")
                    </h5>
                  </div>
                  <p className="text-[11px] text-[#554C3E]">
                    Set direct image URLs and visibility for the first default "All Products" and "All Forms" buttons.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* All Products Image */}
                    <div className="p-3 bg-white rounded-lg border border-[#D0E2D7] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#14291D]">1. "All Products" Image</span>
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2C5E43] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={catApp.showAllProductsImage !== false}
                            onChange={(e) => updateCategoryAppearance({ showAllProductsImage: e.target.checked })}
                            className="rounded accent-[#2C5E43]"
                          />
                          <span>Show Image</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        {catApp.allProductsImageUrl ? (
                          <img
                            src={catApp.allProductsImageUrl}
                            alt="All Products"
                            className="w-9 h-9 rounded-lg object-cover border border-[#DDD5C5] shrink-0"
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-stone-100 border border-[#DDD5C5] flex items-center justify-center shrink-0 text-[#9C9180]">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <input
                          type="url"
                          value={catApp.allProductsImageUrl || ''}
                          onChange={(e) => updateCategoryAppearance({ allProductsImageUrl: e.target.value })}
                          placeholder="Paste Direct Image URL (https://...)"
                          className="flex-1 px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs"
                        />
                        {catApp.allProductsImageUrl && (
                          <button
                            type="button"
                            onClick={() => updateCategoryAppearance({ allProductsImageUrl: '' })}
                            className="p-1.5 text-stone-500 hover:text-rose-600 rounded cursor-pointer"
                            title="Clear image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* All Forms Image */}
                    <div className="p-3 bg-white rounded-lg border border-[#D0E2D7] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#14291D]">2. "All Forms" Image</span>
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2C5E43] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={catApp.showAllFormsImage !== false}
                            onChange={(e) => updateCategoryAppearance({ showAllFormsImage: e.target.checked })}
                            className="rounded accent-[#2C5E43]"
                          />
                          <span>Show Image</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        {catApp.allFormsImageUrl ? (
                          <img
                            src={catApp.allFormsImageUrl}
                            alt="All Forms"
                            className="w-9 h-9 rounded-lg object-cover border border-[#DDD5C5] shrink-0"
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-stone-100 border border-[#DDD5C5] flex items-center justify-center shrink-0 text-[#9C9180]">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <input
                          type="url"
                          value={catApp.allFormsImageUrl || ''}
                          onChange={(e) => updateCategoryAppearance({ allFormsImageUrl: e.target.value })}
                          placeholder="Paste Direct Image URL (https://...)"
                          className="flex-1 px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs"
                        />
                        {catApp.allFormsImageUrl && (
                          <button
                            type="button"
                            onClick={() => updateCategoryAppearance({ allFormsImageUrl: '' })}
                            className="p-1.5 text-stone-500 hover:text-rose-600 rounded cursor-pointer"
                            title="Clear image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CATEGORIES SECTION (DIRECT IMAGE LINK, LABELS & CRUD) */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#B4741E]" />
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#14291D]">
                        Categories Manager & Direct Image Links ({categories.length})
                      </h4>
                      <p className="text-xs text-[#695F4F]">
                        Set direct images, toggle display, and manage Category labels. Changes persist to Firebase Realtime Database.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add New Category Form (with Direct Image URL) */}
                <form onSubmit={handleCreateCategory} className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E4DDD0] space-y-2.5 text-xs">
                  <div className="font-bold text-[#14291D] flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#2C5E43]" />
                    <span>Add New Category with Image</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2F2920] mb-0.5">Category Name / Label *</label>
                      <input
                        type="text"
                        required
                        value={newCatLabel}
                        onChange={(e) => setNewCatLabel(e.target.value)}
                        placeholder="e.g. Renal & Kidney Care"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#2F2920] mb-0.5">Category Image URL (Direct Link)</label>
                      <input
                        type="url"
                        value={newCatImageUrl}
                        onChange={(e) => setNewCatImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#2F2920] mb-0.5">Category ID (Optional)</label>
                      <input
                        type="text"
                        value={newCatId}
                        onChange={(e) => setNewCatId(e.target.value)}
                        placeholder="auto-generated if empty"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2C5E43] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCatShowImage}
                        onChange={(e) => setNewCatShowImage(e.target.checked)}
                        className="rounded accent-[#2C5E43]"
                      />
                      <span>Show Image on Website</span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      <span>+ Add Category</span>
                    </button>
                  </div>
                </form>

                {/* Existing Categories Grid with Direct Image Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {categories.map((cat) => {
                    const isEditing = editingCatId === cat.id;
                    const isRoot = cat.id === 'all';
                    const activeImgUrl = isRoot ? (cat.imageUrl || catApp.allProductsImageUrl) : cat.imageUrl;
                    const isShown = isRoot ? (cat.showImage !== false && (catApp.showAllProductsImage ?? true)) : (cat.showImage !== false);

                    return (
                      <div
                        key={cat.id}
                        className="p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl flex flex-col justify-between gap-2.5 text-xs hover:border-[#2C5E43] transition-all"
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-[#6E6352] mb-0.5">Category Label:</label>
                              <input
                                type="text"
                                value={editingCatLabel}
                                onChange={(e) => setEditingCatLabel(e.target.value)}
                                className="w-full px-2.5 py-1 bg-white border border-[#A5D6B6] rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#6E6352] mb-0.5">Direct Image Link URL:</label>
                              <input
                                type="url"
                                value={editingCatImageUrl}
                                onChange={(e) => setEditingCatImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-2.5 py-1 bg-white border border-[#A5D6B6] rounded text-xs"
                              />
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <label className="flex items-center gap-1 text-[11px] text-[#2C5E43] font-semibold cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingCatShowImage}
                                  onChange={(e) => setEditingCatShowImage(e.target.checked)}
                                  className="accent-[#2C5E43]"
                                />
                                <span>Show Image</span>
                              </label>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditCategory(cat.id)}
                                  className="px-2.5 py-1 bg-[#2C5E43] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCatId(null)}
                                  className="px-2 py-1 bg-stone-200 text-[#554C3E] rounded text-xs cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-2.5">
                              {/* Thumbnail */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#DDD5C5] bg-white shrink-0 flex items-center justify-center">
                                {activeImgUrl ? (
                                  <img
                                    src={activeImgUrl}
                                    alt={cat.label}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-[#A89E8D]" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#14291D] truncate block text-xs">{cat.label}</span>
                                  {isRoot && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                                      Root
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[10px] text-[#7A705E] block truncate">id: {cat.id}</span>
                              </div>
                            </div>

                            {/* Direct URL Quick Edit Bar */}
                            <div className="pt-1 border-t border-[#EAE3D4] flex items-center gap-1.5">
                              <input
                                type="url"
                                value={activeImgUrl || ''}
                                onChange={(e) => {
                                  const url = e.target.value;
                                  if (isRoot) {
                                    updateCategoryAppearance({ allProductsImageUrl: url });
                                  }
                                  handleUpdateCategoryImageUrl(cat.id, url);
                                }}
                                placeholder="Direct Image URL (https://...)"
                                className="flex-1 px-2 py-1 bg-white border border-[#DDD5C5] rounded text-[11px]"
                              />

                              {/* Toggle Show Image */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isRoot) {
                                    updateCategoryAppearance({ showAllProductsImage: !isShown });
                                  }
                                  handleToggleCategoryShowImage(cat.id, isShown);
                                }}
                                className={`p-1.5 rounded cursor-pointer ${
                                  isShown ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'
                                }`}
                                title={isShown ? 'Image is visible on store (click to hide)' : 'Image is hidden (click to show)'}
                              >
                                {isShown ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>

                              {!isRoot && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCatId(cat.id);
                                      setEditingCatLabel(cat.label);
                                      setEditingCatImageUrl(cat.imageUrl || '');
                                      setEditingCatShowImage(cat.showImage !== false);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                    title="Edit category"
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
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FORMULATION FORMS SECTION (DIRECT IMAGE LINKS & CRUD) */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#2C5E43]" />
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#14291D]">
                        Formulation Forms & Direct Image Links ({forms.length})
                      </h4>
                      <p className="text-xs text-[#695F4F]">
                        Manage pharmaceutical forms (Churna, Vati, Taila, Liquid, etc.) with custom images and visibility.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add New Form (with Image) */}
                <form onSubmit={handleCreateForm} className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E4DDD0] space-y-2.5 text-xs">
                  <div className="font-bold text-[#14291D] flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#2C5E43]" />
                    <span>Add New Formulation Form with Image</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2F2920] mb-0.5">Form Name *</label>
                      <input
                        type="text"
                        required
                        value={newFormName}
                        onChange={(e) => setNewFormName(e.target.value)}
                        placeholder="e.g. Granules, Herbal Jelly, Lepa"
                        className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2F2920] mb-0.5">Form Image URL (Direct Link)</label>
                      <input
                        type="url"
                        value={newFormImageUrl}
                        onChange={(e) => setNewFormImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2C5E43] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newFormShowImage}
                        onChange={(e) => setNewFormShowImage(e.target.checked)}
                        className="rounded accent-[#2C5E43]"
                      />
                      <span>Show Image on Website</span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      <span>+ Add Form</span>
                    </button>
                  </div>
                </form>

                {/* Existing Forms List with Direct Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {forms.map((formName, idx) => {
                    const isEditing = editingFormIdx === idx;
                    const formConfig = catApp.formImages?.[formName];
                    const fImgUrl = formConfig?.imageUrl;
                    const isShown = formConfig?.showImage !== false;

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl flex flex-col justify-between gap-2.5 text-xs hover:border-[#2C5E43] transition-all"
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-[#6E6352] mb-0.5">Form Name:</label>
                              <input
                                type="text"
                                value={editingFormName}
                                onChange={(e) => setEditingFormName(e.target.value)}
                                className="w-full px-2.5 py-1 bg-white border border-[#A5D6B6] rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#6E6352] mb-0.5">Direct Image Link URL:</label>
                              <input
                                type="url"
                                value={editingFormImageUrl}
                                onChange={(e) => setEditingFormImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-2.5 py-1 bg-white border border-[#A5D6B6] rounded text-xs"
                              />
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <label className="flex items-center gap-1 text-[11px] text-[#2C5E43] font-semibold cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingFormShowImage}
                                  onChange={(e) => setEditingFormShowImage(e.target.checked)}
                                  className="accent-[#2C5E43]"
                                />
                                <span>Show Image</span>
                              </label>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditForm(idx, formName)}
                                  className="px-2.5 py-1 bg-[#2C5E43] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFormIdx(null)}
                                  className="px-2 py-1 bg-stone-200 text-[#554C3E] rounded text-xs cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-2.5">
                              {/* Form Thumbnail */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#DDD5C5] bg-white shrink-0 flex items-center justify-center">
                                {fImgUrl ? (
                                  <img
                                    src={fImgUrl}
                                    alt={formName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  <Sparkles className="w-4 h-4 text-[#A89E8D]" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-[#14291D] truncate block text-xs">{formName}</span>
                                <span className="text-[10px] text-[#7A705E] block">
                                  {fImgUrl ? 'Custom Image linked' : 'No image set'}
                                </span>
                              </div>
                            </div>

                            {/* Direct URL Quick Edit Bar for Form */}
                            <div className="pt-1 border-t border-[#EAE3D4] flex items-center gap-1.5">
                              <input
                                type="url"
                                value={fImgUrl || ''}
                                onChange={(e) => handleUpdateFormImage(formName, e.target.value, isShown)}
                                placeholder="Direct Image URL (https://...)"
                                className="flex-1 px-2 py-1 bg-white border border-[#DDD5C5] rounded text-[11px]"
                              />

                              {/* Toggle Show Image */}
                              <button
                                type="button"
                                onClick={() => handleUpdateFormImage(formName, fImgUrl || '', !isShown)}
                                className={`p-1.5 rounded cursor-pointer ${
                                  isShown && fImgUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'
                                }`}
                                title={isShown ? 'Image is visible on store (click to hide)' : 'Image is hidden (click to show)'}
                              >
                                {isShown && fImgUrl ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFormIdx(idx);
                                  setEditingFormName(formName);
                                  setEditingFormImageUrl(fImgUrl || '');
                                  setEditingFormShowImage(isShown);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                title="Edit form"
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

              {/* BOTTOM SAVE ALL BUTTON FOR CATEGORIES, FORMS & APPEARANCE TO FIREBASE */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF8F5] p-4 rounded-xl border border-[#D5CCBC]">
                <div className="text-xs text-[#695F4F]">
                  💾 All image links, sizes, positions (Left, Top, Right, Down) & custom items are saved to Firebase Realtime Database.
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await backupCatalogMetaToFirebase({ categories, forms });
                    await backupSiteSettingsToFirebase(siteForm);
                    setSaveSuccessMsg('Categories, Formulation Forms, Images & Layout Settings successfully saved to Firebase!');
                    setTimeout(() => setSaveSuccessMsg(null), 3500);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#14291D] hover:bg-[#234D34] text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save Categories & Forms to Firebase</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Tab 3: Multiple Contacts (Add, Edit, Delete Phones, WhatsApp, Emails) */}
        {activeTab === 'contacts' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
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

              {/* Dispensary Google Maps Location & Minimap Controls */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EAE3D4] pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#2C5E43]" />
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#14291D]">
                        Dispensary Google Maps Location & Minimap Controls
                      </h4>
                      <p className="text-[11px] text-[#716858]">
                        Show or hide the interactive Minimap, set exact map pin query & click-to-open map directions link.
                      </p>
                    </div>
                  </div>

                  {/* Show / Hide Minimap Toggle Switch */}
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteForm.storeMap?.enabled !== false && siteForm.showStoreMap !== false}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setSiteForm({
                            ...siteForm,
                            showStoreMap: val,
                            storeMap: {
                              ...(siteForm.storeMap || {}),
                              enabled: val,
                            },
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2C5E43]"></div>
                    </label>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      siteForm.storeMap?.enabled !== false && siteForm.showStoreMap !== false
                        ? 'bg-emerald-100 text-[#14291D]'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {siteForm.storeMap?.enabled !== false && siteForm.showStoreMap !== false
                        ? 'Minimap: Visible (ON)'
                        : 'Minimap: Hidden (OFF)'}
                    </span>
                  </div>
                </div>

                {/* Map Settings Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location Address / Map Search Query */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#2B251D]">
                        Location Address / Landmark for Map Pin *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (siteForm.storeAddress) {
                            setSiteForm({
                              ...siteForm,
                              storeMap: {
                                ...(siteForm.storeMap || {}),
                                mapQuery: siteForm.storeAddress,
                              },
                            });
                          }
                        }}
                        className="text-[10px] text-[#2C5E43] font-bold hover:underline cursor-pointer"
                      >
                        Copy from Store Address
                      </button>
                    </div>
                    <input
                      type="text"
                      value={siteForm.storeMap?.mapQuery ?? ''}
                      onChange={(e) =>
                        setSiteForm({
                          ...siteForm,
                          storeMap: {
                            ...(siteForm.storeMap || {}),
                            mapQuery: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Shop #14-16, Ayur Mandir Road, New Delhi or landmark name"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                    <span className="text-[10px] text-[#716858] block">
                      Used to render the pin and focus area on the embedded interactive minimap.
                    </span>
                  </div>

                  {/* Google Maps Click URL */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#2B251D]">
                        Google Maps Link (Click to Open Directions)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const query = encodeURIComponent(
                            siteForm.storeMap?.mapQuery || siteForm.storeAddress || siteForm.brandName
                          );
                          const url =
                            siteForm.storeMap?.googleMapsUrl?.trim() ||
                            `https://www.google.com/maps/search/?api=1&query=${query}`;
                          window.open(url, '_blank');
                        }}
                        className="text-[10px] text-[#2C5E43] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>Test Map Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="url"
                      value={siteForm.storeMap?.googleMapsUrl ?? ''}
                      onChange={(e) =>
                        setSiteForm({
                          ...siteForm,
                          storeMap: {
                            ...(siteForm.storeMap || {}),
                            googleMapsUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="https://maps.app.goo.gl/... (Optional: Leave empty for auto-search)"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                    />
                    <span className="text-[10px] text-[#716858] block">
                      When visitors click 'Open in Google Maps' on the minimap, this direct link opens.
                    </span>
                  </div>

                  {/* Location Title */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#2B251D]">
                      Location Badge / Title
                    </label>
                    <input
                      type="text"
                      value={siteForm.storeMap?.locationTitle ?? ''}
                      onChange={(e) =>
                        setSiteForm({
                          ...siteForm,
                          storeMap: {
                            ...(siteForm.storeMap || {}),
                            locationTitle: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Apothecary Dispensary & Botanical Garden"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  {/* Location Subtitle */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#2B251D]">
                      Location Subtitle / Timings
                    </label>
                    <input
                      type="text"
                      value={siteForm.storeMap?.locationSubtitle ?? ''}
                      onChange={(e) =>
                        setSiteForm({
                          ...siteForm,
                          storeMap: {
                            ...(siteForm.storeMap || {}),
                            locationSubtitle: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Physical Pharmacy Counter & Medicine Dispatch"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Optional Custom Embed Link */}
                <div className="space-y-1">
                  <label className="font-bold text-[#2B251D]">
                    Custom Google Maps Embed URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={siteForm.storeMap?.embedUrl ?? ''}
                    onChange={(e) =>
                      setSiteForm({
                        ...siteForm,
                        storeMap: {
                          ...(siteForm.storeMap || {}),
                          embedUrl: e.target.value,
                        },
                      })
                    }
                    placeholder="https://www.google.com/maps/embed?pb=... (Leave blank for automatic responsive map)"
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                  />
                  <span className="text-[10px] text-[#716858] block">
                    Leave blank to automatically embed Google Maps using the location query above.
                  </span>
                </div>

                {/* Live Minimap Preview in Admin Panel */}
                <div className="mt-3 p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DFD1] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#14291D]">
                      <MapPin className="w-3.5 h-3.5 text-[#2C5E43]" />
                      <span>Live Minimap Preview (Admin Live Check)</span>
                    </div>
                    <span className={`text-[10.5px] font-bold ${
                      siteForm.storeMap?.enabled !== false && siteForm.showStoreMap !== false
                        ? 'text-emerald-700'
                        : 'text-stone-500'
                    }`}>
                      {siteForm.storeMap?.enabled !== false && siteForm.showStoreMap !== false
                        ? 'Status: Active on Website'
                        : 'Status: Hidden on Website'}
                    </span>
                  </div>

                  {siteForm.storeMap?.enabled !== false && siteForm.showStoreMap !== false ? (
                    <div className="rounded-xl overflow-hidden border border-[#DDD5C5] bg-white h-52 relative group">
                      <iframe
                        title="Admin Map Preview"
                        src={
                          siteForm.storeMap?.embedUrl?.trim() ||
                          `https://maps.google.com/maps?q=${encodeURIComponent(
                            siteForm.storeMap?.mapQuery || siteForm.storeAddress || 'New Delhi, India'
                          )}&t=&z=${siteForm.storeMap?.zoom || 15}&ie=UTF8&iwloc=&output=embed`
                        }
                        className="w-full h-full border-0 pointer-events-none"
                        loading="lazy"
                      />
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const query = encodeURIComponent(
                              siteForm.storeMap?.mapQuery || siteForm.storeAddress || siteForm.brandName
                            );
                            const url =
                              siteForm.storeMap?.googleMapsUrl?.trim() ||
                              `https://www.google.com/maps/search/?api=1&query=${query}`;
                            window.open(url, '_blank');
                          }}
                          className="px-3 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                          <span>Click to Open in Google Maps</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-100/90 rounded-xl text-center text-stone-600 text-xs">
                      Minimap is currently toggled <strong>OFF (Hidden)</strong>. Visitors on the website will only see the text address card without the embedded map.
                    </div>
                  )}
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
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
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
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
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

                {/* Main Page Header & Hero Banner Appearance (Color, Image, Screen Fit, No Fade/Blur, White/Black Opacity) */}
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D5] pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#2C5E43]" />
                        <h5 className="font-serif text-xs font-bold text-[#14291D] uppercase tracking-wider">
                          Header &amp; Hero Appearance (रंग, इमेज, स्क्रीन फिट &amp; ओपेसिटी)
                        </h5>
                      </div>
                      <span className="text-[10.5px] text-[#716858] block mt-0.5">
                        Customize header green color or background image, zoom/auto fit for Android &amp; PC screens, sharp no-blur toggle, and black/white overlay opacity.
                      </span>
                    </div>

                    {/* Reset to Default Button */}
                    <button
                      type="button"
                      onClick={() => updateHeaderBanner({
                        backgroundType: 'color',
                        backgroundColor: '#14291D',
                        backgroundImageUrl: '',
                        imageFit: 'cover',
                        imagePosition: 'center center',
                        showAtmosphereBlur: true,
                        overlayColor: 'black',
                        overlayOpacity: 35,
                        textColorTheme: 'auto',
                        topNavBackground: 'default'
                      })}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Header Default</span>
                    </button>
                  </div>

                  {/* Mode Selector: Solid Color vs Image */}
                  <div>
                    <label className="block font-medium text-[#2B251D] text-xs mb-1.5">
                      Background Type (बैकग्राउंड का प्रकार):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateHeaderBanner({ backgroundType: 'color' })}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          (siteForm.headerBanner?.backgroundType ?? 'color') === 'color'
                            ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs'
                            : 'bg-white text-[#4A4031] border-[#DDD5C5] hover:bg-stone-50'
                        }`}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/40"
                          style={{ backgroundColor: siteForm.headerBanner?.backgroundColor || '#14291D' }}
                        />
                        <span>Solid Color (रंग)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateHeaderBanner({ backgroundType: 'image' })}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          siteForm.headerBanner?.backgroundType === 'image'
                            ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs'
                            : 'bg-white text-[#4A4031] border-[#DDD5C5] hover:bg-stone-50'
                        }`}
                      >
                        <span>🖼️ Background Image (इमेज)</span>
                      </button>
                    </div>
                  </div>

                  {/* COLOR SETTINGS (Active when backgroundType is 'color' or as image fallback) */}
                  <div className={`p-3 bg-white rounded-lg border border-[#E5DECD] space-y-2.5 ${siteForm.headerBanner?.backgroundType === 'image' ? 'opacity-80' : ''}`}>
                    <div className="flex items-center justify-between">
                      <label className="block font-medium text-[#2B251D] text-xs">
                        {siteForm.headerBanner?.backgroundType === 'image' ? 'Fallback / Under-Image Color:' : 'Header Background Color (हेडर का मुख्य रंग):'}
                      </label>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        {siteForm.headerBanner?.backgroundColor || '#14291D'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={siteForm.headerBanner?.backgroundColor || '#14291D'}
                        onChange={(e) => updateHeaderBanner({ backgroundColor: e.target.value })}
                        className="w-10 h-9 rounded cursor-pointer border border-[#DDD5C5] p-0.5 bg-white shrink-0"
                        title="Pick custom color"
                      />
                      <input
                        type="text"
                        value={siteForm.headerBanner?.backgroundColor || '#14291D'}
                        onChange={(e) => updateHeaderBanner({ backgroundColor: e.target.value })}
                        placeholder="#14291D"
                        className="w-28 px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded-md text-xs font-mono font-semibold"
                      />
                      <span className="text-[11px] text-[#716858]">
                        Default is Classical Green (<span className="font-mono font-bold">#14291D</span>).
                      </span>
                    </div>

                    {/* Color Presets */}
                    <div>
                      <span className="text-[10.5px] font-semibold text-[#716858] block mb-1">
                        Quick Color Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '🌲 Forest Green (Default)', hex: '#14291D' },
                          { label: '🌿 Deep Emerald', hex: '#064E3B' },
                          { label: '🍃 Sage Herbal Teal', hex: '#0F766E' },
                          { label: '👑 Apothecary Gold', hex: '#78350F' },
                          { label: '🌌 Obsidian Dark', hex: '#0F172A' },
                          { label: '🪵 Classical Bark', hex: '#3E2723' },
                          { label: '📄 Pure White', hex: '#FFFFFF' },
                          { label: '🌾 Sand Warm Cream', hex: '#FAF8F5' },
                        ].map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => updateHeaderBanner({ backgroundColor: c.hex })}
                            className={`px-2 py-1 rounded text-[10.5px] font-semibold border cursor-pointer flex items-center gap-1.5 transition-all ${
                              (siteForm.headerBanner?.backgroundColor || '#14291D').toLowerCase() === c.hex.toLowerCase()
                                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs ring-1 ring-stone-900'
                                : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-stone-400"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* IMAGE SETTINGS (Visible when Image mode is selected) */}
                  {siteForm.headerBanner?.backgroundType === 'image' && (
                    <div className="p-3 bg-white rounded-lg border border-[#E5DECD] space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-medium text-[#2B251D] text-xs">
                            Header Background Image URL (इमेज का लिंक):
                          </label>
                          {siteForm.headerBanner?.backgroundImageUrl && (
                            <button
                              type="button"
                              onClick={() => updateHeaderBanner({ backgroundImageUrl: '' })}
                              className="text-[10.5px] text-red-600 hover:underline font-semibold"
                            >
                              Clear URL
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={siteForm.headerBanner?.backgroundImageUrl ?? ''}
                          onChange={(e) => updateHeaderBanner({ backgroundImageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/... or paste any direct image link"
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-md text-xs font-mono"
                        />
                      </div>

                      {/* Image Presets */}
                      <div>
                        <span className="text-[10.5px] font-semibold text-[#716858] block mb-1">
                          Curated Botanical &amp; Apothecary Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            {
                              label: '🌿 Medicinal Herbal Leaf',
                              url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1920&q=80',
                            },
                            {
                              label: '🪵 Mortar & Classical Herbs',
                              url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1920&q=80',
                            },
                            {
                              label: '🍃 Fresh Dispensary Plant',
                              url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1920&q=80',
                            },
                            {
                              label: '🏛️ Ancient Apothecary Jars',
                              url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1920&q=80',
                            },
                          ].map((item, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => updateHeaderBanner({ backgroundImageUrl: item.url })}
                              className={`px-2 py-1 rounded text-[10.5px] font-semibold border cursor-pointer flex items-center gap-1 transition-all ${
                                siteForm.headerBanner?.backgroundImageUrl === item.url
                                  ? 'bg-[#14291D] text-white border-[#14291D]'
                                  : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                              }`}
                            >
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Screen Fit Mode for Android, PC & Other Screens */}
                      <div className="pt-1 border-t border-stone-200">
                        <label className="block font-medium text-[#2B251D] text-xs mb-1.5">
                          Screen Fit Mode (Android, PC &amp; Screens के लिए फिट):
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            {
                              id: 'cover',
                              title: '🔍 Zoom Fit (Cover)',
                              desc: 'Fills entire header smoothly with no blank spaces (Best for Android & PC)',
                            },
                            {
                              id: 'contain',
                              title: '📐 Auto Fit (Contain)',
                              desc: 'Shows full uncropped picture with background color fill',
                            },
                            {
                              id: 'stretch',
                              title: '↔️ Stretch Fit (100%)',
                              desc: 'Stretches exact 100% width and 100% height',
                            },
                            {
                              id: 'auto',
                              title: '🎯 Original Centered',
                              desc: 'Maintains actual picture resolution centered',
                            },
                          ].map((fit) => (
                            <button
                              key={fit.id}
                              type="button"
                              onClick={() => updateHeaderBanner({ imageFit: fit.id as HeaderBannerConfig['imageFit'] })}
                              className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                                (siteForm.headerBanner?.imageFit || 'cover') === fit.id
                                  ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs ring-1 ring-[#14291D]'
                                  : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                              }`}
                            >
                              <div className="text-xs font-bold">{fit.title}</div>
                              <div className={`text-[10px] mt-0.5 leading-snug ${
                                (siteForm.headerBanner?.imageFit || 'cover') === fit.id ? 'text-[#C2D6C9]' : 'text-stone-500'
                              }`}>
                                {fit.desc}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Image Position */}
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-[#2B251D] shrink-0">
                          Image Position (इमेज की स्थिति):
                        </label>
                        <select
                          value={siteForm.headerBanner?.imagePosition || 'center center'}
                          onChange={(e) => updateHeaderBanner({ imagePosition: e.target.value })}
                          className="px-2.5 py-1 bg-white border border-[#DDD5C5] rounded-md text-xs font-semibold text-[#14291D]"
                        >
                          <option value="center center">Center (बीच में)</option>
                          <option value="top center">Top Center (ऊपर की तरफ)</option>
                          <option value="bottom center">Bottom Center (नीचे की तरफ)</option>
                          <option value="left center">Left (बाईं तरफ)</option>
                          <option value="right center">Right (दाईं तरफ)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* NO FADE / BLUR TOGGLE */}
                  <div className="p-3 bg-white rounded-lg border border-[#E5DECD] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <label className="block font-medium text-[#2B251D] text-xs">
                        Fade / Blur Atmosphere Effects (फेड और ब्लर प्रभाव):
                      </label>
                      <span className="text-[10.5px] text-[#716858] block mt-0.5">
                        {siteForm.headerBanner?.showAtmosphereBlur === false
                          ? '✅ Blur Disabled: Image/Header completely crisp and sharp with zero haze or fades.'
                          : 'ℹ️ Blur Enabled: Soft radial glow orbs rendered in header.'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateHeaderBanner({
                        showAtmosphereBlur: siteForm.headerBanner?.showAtmosphereBlur === false ? true : false,
                      })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        siteForm.headerBanner?.showAtmosphereBlur === false
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      }`}
                    >
                      <span>
                        {siteForm.headerBanner?.showAtmosphereBlur === false
                          ? '✓ No Fade / Blur (एकदम साफ़)'
                          : 'Atmosphere Blur On'}
                      </span>
                    </button>
                  </div>

                  {/* OVERLAY COLOR & OPACITY (White / Black / Emerald & Opacity Slider) */}
                  <div className="p-3 bg-white rounded-lg border border-[#E5DECD] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block font-medium text-[#2B251D] text-xs">
                        Color Overlay &amp; Opacity (व्हाइट या ब्लैक ओवरले और ओपेसिटी):
                      </label>
                      <span className="text-[10.5px] text-[#716858]">
                        Gives dark/light tint so white or black text is easily readable on any image.
                      </span>
                    </div>

                    {/* Overlay Color Select */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'black', label: '⬛ Black (काला)', desc: 'Darkens background, crisp white text' },
                        { id: 'white', label: '⬜ White (सफ़ेद)', desc: 'Brightens background, crisp dark text' },
                        { id: 'emerald', label: '🟩 Emerald (हरा)', desc: 'Ayurvedic botanical green tint' },
                        { id: 'none', label: '🚫 None (कोई नहीं)', desc: 'Zero overlay tint' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateHeaderBanner({ overlayColor: item.id as HeaderBannerConfig['overlayColor'] })}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                            (siteForm.headerBanner?.overlayColor || 'black') === item.id
                              ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs ring-1 ring-[#14291D]'
                              : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className={`text-[10px] mt-0.5 ${
                            (siteForm.headerBanner?.overlayColor || 'black') === item.id ? 'text-[#C2D6C9]' : 'text-stone-500'
                          }`}>
                            {item.desc}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Opacity Slider */}
                    {siteForm.headerBanner?.overlayColor !== 'none' && (
                      <div className="pt-2 border-t border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-[#2B251D]">
                            Overlay Opacity (ओपेसिटी स्लाइडर):
                          </label>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                            {siteForm.headerBanner?.overlayOpacity ?? 35}% Opacity
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10.5px] text-stone-500 font-semibold">0% (Transparent)</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={siteForm.headerBanner?.overlayOpacity ?? 35}
                            onChange={(e) => updateHeaderBanner({ overlayOpacity: Number(e.target.value) })}
                            className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#14291D]"
                          />
                          <span className="text-[10.5px] text-stone-500 font-semibold">100% (Solid)</span>
                        </div>

                        {/* Quick Opacity Presets */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10.5px] text-stone-500">Quick Opacity:</span>
                          {[0, 15, 30, 45, 60, 75, 90].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => updateHeaderBanner({ overlayOpacity: val })}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                                (siteForm.headerBanner?.overlayOpacity ?? 35) === val
                                  ? 'bg-[#14291D] text-white border-[#14291D]'
                                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                              }`}
                            >
                              {val}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TEXT READABILITY THEME & TOP NAV SYNC */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Text Contrast Theme */}
                    <div className="p-3 bg-white rounded-lg border border-[#E5DECD] space-y-1.5">
                      <label className="block font-medium text-[#2B251D] text-xs">
                        Header Text Readability Theme:
                      </label>
                      <select
                        value={siteForm.headerBanner?.textColorTheme || 'auto'}
                        onChange={(e) => updateHeaderBanner({ textColorTheme: e.target.value as HeaderBannerConfig['textColorTheme'] })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded-md text-xs font-semibold text-[#14291D]"
                      >
                        <option value="auto">🔄 Auto (Smart Contrast based on background &amp; overlay)</option>
                        <option value="light">⚪ Crisp White Text (Best for dark green / black)</option>
                        <option value="dark">⚫ Crisp Dark Forest Green Text (Best for white / light cream)</option>
                      </select>
                    </div>

                    {/* Top Navigation Bar Style */}
                    <div className="p-3 bg-white rounded-lg border border-[#E5DECD] space-y-1.5">
                      <label className="block font-medium text-[#2B251D] text-xs">
                        Top Nav Bar Background (शीर्ष पट्टी):
                      </label>
                      <select
                        value={siteForm.headerBanner?.topNavBackground || 'default'}
                        onChange={(e) => updateHeaderBanner({ topNavBackground: e.target.value as HeaderBannerConfig['topNavBackground'] })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded-md text-xs font-semibold text-[#14291D]"
                      >
                        <option value="default">🌿 Classical Cream Glass (Default #FAF8F5)</option>
                        <option value="match_header">🎨 Match Main Header Color</option>
                      </select>
                    </div>
                  </div>

                  {/* LIVE INTERACTIVE PREVIEW */}
                  <div className="p-3 bg-[#EDE8DE] rounded-lg border border-[#D5CDBE] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#14291D] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#B4741E]" />
                        <span>Live Header Preview (लाइव हेडर प्रीव्यू):</span>
                      </span>
                      <span className="text-[10px] text-stone-600 font-mono">
                        {siteForm.headerBanner?.backgroundType === 'image'
                          ? `Image: ${siteForm.headerBanner?.imageFit || 'cover'}`
                          : `Color: ${siteForm.headerBanner?.backgroundColor || '#14291D'}`}
                      </span>
                    </div>

                    {/* Preview Mockup Card */}
                    <div
                      className="relative rounded-lg overflow-hidden p-4 border border-black/10 min-h-[110px] flex flex-col justify-center transition-all"
                      style={{
                        backgroundColor: siteForm.headerBanner?.backgroundColor || '#14291D',
                        backgroundImage: siteForm.headerBanner?.backgroundType === 'image' && siteForm.headerBanner?.backgroundImageUrl
                          ? `url("${siteForm.headerBanner.backgroundImageUrl}")`
                          : undefined,
                        backgroundSize: siteForm.headerBanner?.imageFit === 'contain'
                          ? 'contain'
                          : siteForm.headerBanner?.imageFit === 'stretch'
                          ? '100% 100%'
                          : siteForm.headerBanner?.imageFit === 'auto'
                          ? 'auto'
                          : 'cover',
                        backgroundPosition: siteForm.headerBanner?.imagePosition || 'center center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    >
                      {/* Overlay */}
                      {siteForm.headerBanner?.overlayColor !== 'none' && (siteForm.headerBanner?.overlayOpacity ?? 0) > 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundColor:
                              siteForm.headerBanner?.overlayColor === 'white'
                                ? '#FFFFFF'
                                : siteForm.headerBanner?.overlayColor === 'emerald'
                                ? '#064E3B'
                                : '#000000',
                            opacity: (siteForm.headerBanner?.overlayOpacity ?? 35) / 100,
                          }}
                        />
                      )}

                      {/* Content */}
                      <div className="relative z-10 space-y-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/20 text-white backdrop-blur-xs">
                          <span>🌿 {siteForm.heroBadgeText || 'Registered Ayurvedic Formulations'}</span>
                        </div>
                        <h4 className="font-serif text-sm sm:text-base font-bold text-white tracking-tight drop-shadow-xs">
                          {siteForm.heroTitle || 'Classical Ayurvedic Formulations & Natural Herbs'}
                        </h4>
                        <p className="text-[10px] text-white/85 line-clamp-1 max-w-md drop-shadow-xs">
                          {siteForm.heroSubtitle || 'Direct apothecary medicines, certified herbal remedies & classical preparations.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero Badge & Titles (Registered Ayurvedic Formulations & Classical Rasayanas) */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D5] pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#B4741E]" />
                        <label className="font-bold text-xs text-[#14291D]">
                          Hero Top Badge: &quot;Registered Ayurvedic Formulations &amp; Classical Rasayanas&quot;
                        </label>
                      </div>
                      <span className="text-[10.5px] text-[#716858] block mt-0.5">
                        Can show or hide this top pill badge from the main website hero banner.
                      </span>
                    </div>

                    {/* Show / Hide Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setSiteForm({ ...siteForm, showHeroBadge: siteForm.showHeroBadge === false ? true : false })}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        siteForm.showHeroBadge !== false
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-stone-300 text-stone-700 hover:bg-stone-400'
                      }`}
                    >
                      <span>{siteForm.showHeroBadge !== false ? '✓ Badge Visible' : '✕ Badge Hidden'}</span>
                    </button>
                  </div>

                  {/* Badge Text Input (enabled when badge is shown) */}
                  <div className={siteForm.showHeroBadge === false ? 'opacity-50 pointer-events-none' : 'opacity-100'}>
                    <label className="block font-medium text-[#2B251D] mb-1">
                      Hero Badge Custom Text:
                    </label>
                    <input
                      type="text"
                      value={siteForm.heroBadgeText ?? 'Registered Ayurvedic Formulations & Classical Rasayanas'}
                      onChange={(e) => setSiteForm({ ...siteForm, heroBadgeText: e.target.value })}
                      placeholder="e.g. Registered Ayurvedic Formulations & Classical Rasayanas"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                    />
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-[#554B3B]">
                      <span className="font-semibold">Live Hero Preview:</span>
                      {siteForm.showHeroBadge !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C3A27] text-[#A5D6B6] text-[10px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A5D6B6] animate-pulse" />
                          <span>{siteForm.heroBadgeText || 'Registered Ayurvedic Formulations & Classical Rasayanas'}</span>
                        </span>
                      ) : (
                        <span className="text-stone-500 italic text-[11px]">[Hidden on Hero Banner]</span>
                      )}
                    </div>
                  </div>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                      <div>
                        <h5 className="font-bold text-xs text-[#14291D]">
                          Product View Quality Assurance Badges (Ayush &amp; Quality Trust Box)
                        </h5>
                        <p className="text-[11px] text-[#716858]">
                          Can show or hide the 4 trust badges ribbon globally for all products, or per badge.
                        </p>
                      </div>
                    </div>
                    
                    {/* Master Global Show/Hide Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const current = siteForm.productAssuranceBadges?.showBadges !== false;
                        setSiteForm({
                          ...siteForm,
                          productAssuranceBadges: {
                            ...siteForm.productAssuranceBadges,
                            showBadges: !current,
                          },
                        });
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        siteForm.productAssuranceBadges?.showBadges !== false
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-stone-300 text-stone-700 hover:bg-stone-400'
                      }`}
                    >
                      <span>
                        {siteForm.productAssuranceBadges?.showBadges !== false
                          ? '✓ Badges Shown Globally'
                          : '✕ Badges Hidden Globally'}
                      </span>
                    </button>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 transition-opacity ${siteForm.productAssuranceBadges?.showBadges === false ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    {/* Badge 1 */}
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291D]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2C5E43]" />
                          <span>Assurance Badge #1</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const current = siteForm.productAssuranceBadges?.showBadge1 !== false;
                            setSiteForm({
                              ...siteForm,
                              productAssuranceBadges: {
                                ...siteForm.productAssuranceBadges,
                                showBadge1: !current,
                              },
                            });
                          }}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                            siteForm.productAssuranceBadges?.showBadge1 !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {siteForm.productAssuranceBadges?.showBadge1 !== false ? '✓ Shown' : '✕ Hidden'}
                        </button>
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291D]">
                          <Leaf className="w-3.5 h-3.5 text-[#2C5E43]" />
                          <span>Assurance Badge #2</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const current = siteForm.productAssuranceBadges?.showBadge2 !== false;
                            setSiteForm({
                              ...siteForm,
                              productAssuranceBadges: {
                                ...siteForm.productAssuranceBadges,
                                showBadge2: !current,
                              },
                            });
                          }}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                            siteForm.productAssuranceBadges?.showBadge2 !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {siteForm.productAssuranceBadges?.showBadge2 !== false ? '✓ Shown' : '✕ Hidden'}
                        </button>
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
                    {siteForm.productAssuranceBadges?.showBadges !== false && (siteForm.productAssuranceBadges?.showBadge1 !== false || siteForm.productAssuranceBadges?.showBadge2 !== false) ? (
                      <div className={`p-3 bg-[#FAF8F5] rounded-xl border border-[#D5CCBC] grid ${siteForm.productAssuranceBadges?.showBadge1 !== false && siteForm.productAssuranceBadges?.showBadge2 !== false ? 'grid-cols-2 gap-3' : 'grid-cols-1'} text-xs max-w-md`}>
                        {siteForm.productAssuranceBadges?.showBadge1 !== false && (
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#2C5E43] shrink-0" />
                            <div>
                              <span className="font-bold text-[#14291D] block">{siteForm.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified'}</span>
                              <span className="text-[11px] text-[#716858]">{siteForm.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified'}</span>
                            </div>
                          </div>
                        )}
                        {siteForm.productAssuranceBadges?.showBadge2 !== false && (
                          <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-[#2C5E43] shrink-0" />
                            <div>
                              <span className="font-bold text-[#14291D] block">{siteForm.productAssuranceBadges?.badge2Title || '100% Pure Botanical'}</span>
                              <span className="text-[11px] text-[#716858]">{siteForm.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-stone-100 rounded-lg border border-dashed border-stone-300 text-stone-500 italic text-[11px] max-w-md">
                        Quality assurance badges ribbon is currently hidden globally.
                      </div>
                    )}
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
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs">
              {/* Header Box */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE3D4] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E7EFEA] border border-[#B5D6C4] flex items-center justify-center text-[#2C5E43]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#14291D]">
                        Product View Quality Assurance Badges
                      </h4>
                      <p className="text-[11px] text-[#6E6352]">
                        Show or hide trust badges (&quot;Ayush &amp; GMP Certified&quot;, &quot;Heavy-metal lab verified&quot;, &quot;100% Pure Botanical&quot;, &quot;Zero synthetic fillers&quot;) globally for all products, or separately per product.
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

                {/* Global Master Show/Hide Toggle (For All Products) */}
                <div className="p-3.5 bg-emerald-50/80 border border-[#A5D6B6] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#2C5E43]" />
                      <span className="font-bold text-xs sm:text-sm text-[#14291D]">
                        Global Visibility (For All Products)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4F6858] mt-0.5">
                      Show or hide the Ayush &amp; Quality Assurance ribbon on product pages &amp; modals for all products at once.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const current = siteForm.productAssuranceBadges?.showBadges !== false;
                      setSiteForm({
                        ...siteForm,
                        productAssuranceBadges: {
                          ...siteForm.productAssuranceBadges,
                          showBadges: !current,
                        },
                      });
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      siteForm.productAssuranceBadges?.showBadges !== false
                        ? 'bg-[#14291D] text-white shadow-xs'
                        : 'bg-stone-300 text-stone-700 hover:bg-stone-400'
                    }`}
                  >
                    <span>
                      {siteForm.productAssuranceBadges?.showBadges !== false
                        ? '✓ Badges Shown Globally'
                        : '✕ Badges Hidden Globally'}
                    </span>
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
                          ...siteForm.productAssuranceBadges,
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
                          ...siteForm.productAssuranceBadges,
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
                          ...siteForm.productAssuranceBadges,
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
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 transition-opacity ${siteForm.productAssuranceBadges?.showBadges === false ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  {/* Badge 1 Card */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DDD5C5] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                        <span className="font-bold text-xs text-[#14291D]">Assurance Badge #1</span>
                      </div>

                      {/* Badge 1 Show/Hide Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const current = siteForm.productAssuranceBadges?.showBadge1 !== false;
                          setSiteForm({
                            ...siteForm,
                            productAssuranceBadges: {
                              ...siteForm.productAssuranceBadges,
                              showBadge1: !current,
                            },
                          });
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          siteForm.productAssuranceBadges?.showBadge1 !== false
                            ? 'bg-emerald-700 text-white'
                            : 'bg-stone-300 text-stone-700'
                        }`}
                      >
                        {siteForm.productAssuranceBadges?.showBadge1 !== false ? '✓ Shown' : '✕ Hidden'}
                      </button>
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
                    <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-[#2C5E43]" />
                        <span className="font-bold text-xs text-[#14291D]">Assurance Badge #2</span>
                      </div>

                      {/* Badge 2 Show/Hide Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const current = siteForm.productAssuranceBadges?.showBadge2 !== false;
                          setSiteForm({
                            ...siteForm,
                            productAssuranceBadges: {
                              ...siteForm.productAssuranceBadges,
                              showBadge2: !current,
                            },
                          });
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          siteForm.productAssuranceBadges?.showBadge2 !== false
                            ? 'bg-emerald-700 text-white'
                            : 'bg-stone-300 text-stone-700'
                        }`}
                      >
                        {siteForm.productAssuranceBadges?.showBadge2 !== false ? '✓ Shown' : '✕ Hidden'}
                      </button>
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
                        Badge 2 Subtitle / Filler &amp; Purity Detail
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
                  {siteForm.productAssuranceBadges?.showBadges !== false && (siteForm.productAssuranceBadges?.showBadge1 !== false || siteForm.productAssuranceBadges?.showBadge2 !== false) ? (
                    <div className={`p-4 bg-[#FAF8F5] rounded-xl border border-[#D5CCBC] grid ${siteForm.productAssuranceBadges?.showBadge1 !== false && siteForm.productAssuranceBadges?.showBadge2 !== false ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3 text-xs max-w-lg shadow-2xs`}>
                      {siteForm.productAssuranceBadges?.showBadge1 !== false && (
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
                      )}
                      {siteForm.productAssuranceBadges?.showBadge2 !== false && (
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
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-100 rounded-xl border border-dashed border-stone-300 text-stone-500 italic text-xs max-w-lg">
                      Quality Assurance Badges ribbon is currently hidden globally across all products.
                    </div>
                  )}
                </div>
              </div>

              {/* Product Catalog Status Table */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE3D4] pb-2">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#14291D]">
                      Individual Product Overrides ({products.length} Products) - Show / Hide Separately
                    </h4>
                    <p className="text-[11px] text-[#6E6352]">
                      Click any toggle button below to instantly show or hide badges for a specific product.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#DDD5C5] text-[#695F4F]">
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">All Badges</th>
                        <th className="py-2.5 px-3">Badge 1 (Ayush/GMP)</th>
                        <th className="py-2.5 px-3">Badge 2 (Botanical)</th>
                        <th className="py-2.5 px-3">Override Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE3D4]">
                      {products.map((p) => {
                        const hasCustom = Boolean(
                          p.assuranceBadges?.badge1Title ||
                          p.assuranceBadges?.badge2Title ||
                          p.assuranceBadges?.showBadges !== undefined ||
                          p.assuranceBadges?.showBadge1 !== undefined ||
                          p.assuranceBadges?.showBadge2 !== undefined
                        );
                        const isMasterShown = p.assuranceBadges?.showBadges !== undefined
                          ? p.assuranceBadges.showBadges
                          : (siteForm.productAssuranceBadges?.showBadges ?? true);
                        const isB1Shown = p.assuranceBadges?.showBadge1 !== undefined
                          ? p.assuranceBadges.showBadge1
                          : (siteForm.productAssuranceBadges?.showBadge1 ?? true);
                        const isB2Shown = p.assuranceBadges?.showBadge2 !== undefined
                          ? p.assuranceBadges.showBadge2
                          : (siteForm.productAssuranceBadges?.showBadge2 ?? true);

                        const b1Title = p.assuranceBadges?.badge1Title || siteForm.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified';
                        const b2Title = p.assuranceBadges?.badge2Title || siteForm.productAssuranceBadges?.badge2Title || '100% Pure Botanical';

                        return (
                          <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-[#14291D] block">{p.name}</span>
                              <span className="text-[10px] text-[#716858] italic">{p.sanskritName}</span>
                            </td>

                            {/* All Badges Toggle for this product */}
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                onClick={() => handleToggleProductBadge(p, 'all')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                  isMasterShown
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                    : 'bg-stone-200 text-stone-600 border border-stone-300 hover:bg-stone-300'
                                }`}
                                title="Click to show or hide all assurance badges for this product"
                              >
                                {isMasterShown ? '✓ Shown' : '✕ Hidden'}
                              </button>
                            </td>

                            {/* Badge 1 Toggle for this product */}
                            <td className="py-2.5 px-3">
                              <div className="space-y-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductBadge(p, 'badge1')}
                                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                                    isB1Shown
                                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-stone-200 text-stone-600 border border-stone-300 hover:bg-stone-300'
                                  }`}
                                  title="Toggle Ayush & GMP badge for this product"
                                >
                                  {isB1Shown ? '✓ Shown' : '✕ Hidden'}
                                </button>
                                <span className="text-[10px] text-[#716858] block truncate max-w-[140px]">{b1Title}</span>
                              </div>
                            </td>

                            {/* Badge 2 Toggle for this product */}
                            <td className="py-2.5 px-3">
                              <div className="space-y-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductBadge(p, 'badge2')}
                                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                                    isB2Shown
                                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-stone-200 text-stone-600 border border-stone-300 hover:bg-stone-300'
                                  }`}
                                  title="Toggle Botanical & Fillers badge for this product"
                                >
                                  {isB2Shown ? '✓ Shown' : '✕ Hidden'}
                                </button>
                                <span className="text-[10px] text-[#716858] block truncate max-w-[140px]">{b2Title}</span>
                              </div>
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
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
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
