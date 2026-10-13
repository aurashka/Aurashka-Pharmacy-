export type ProductCategory = string;
export type ProductForm = string;

export interface CategoryItem {
  id: string;
  label: string;
  imageUrl?: string;
  showImage?: boolean;
}

export type CategoryImagePosition = 'left' | 'top' | 'right' | 'bottom';
export type CategoryImageSize = 'small' | 'medium' | 'large' | 'extra_large' | 'custom';
export type CategoryImageShape = 'circle' | 'rounded' | 'square';

export interface FormImageConfig {
  imageUrl?: string;
  showImage?: boolean;
}

export interface CategoryAppearanceConfig {
  showImages: boolean;
  imagePosition: CategoryImagePosition;
  imageSize: CategoryImageSize;
  customImageSizePx?: number;
  imageShape: CategoryImageShape;
  allProductsImageUrl?: string;
  showAllProductsImage?: boolean;
  allFormsImageUrl?: string;
  showAllFormsImage?: boolean;
  formImages?: Record<string, FormImageConfig>;
}

export interface FormItem {
  id: string;
  name: string;
}

export type SortBadgeType = 'trending' | 'top_seller' | 'best_deal' | 'featured' | 'new_launch' | 'none' | string;

export interface IngredientItem {
  herb: string;
  botanicalName: string;
  potencyOrMg: string;
  role: string;
}

export interface DetailedUses {
  primaryBenefits: string[];
  ailmentsTreated: string[];
  actionMechanism: string;
  doshaEffect: string; // e.g. "Pacifies Vata and Kapha"
}

export interface DosageGuideline {
  standardDosage: string;
  bestTiming: string;
  anupanaCarrier: string; // Carrier liquid e.g. Warm Cow Milk, Honey, Lukewarm Water
  duration: string;
}

export type ProductTabTarget = 'all' | 'indications' | 'ingredients' | 'dosage' | 'action' | 'precautions';

export interface ProductCustomField {
  id: string;
  name: string;
  value: string;
  position: number;
  section?: ProductTabTarget;
}

export type MonographPriority = 'high' | 'mid' | 'low' | 'normal';

export interface MonographDetailItem {
  id: string;
  title: string;                 // Field title (e.g. "Prescribed Standard Dosage", "Anupana", "Storage")
  text: string;                  // Description / detailed text
  priority?: MonographPriority;  // 'high' (Red) | 'mid' (Yellow) | 'low' (Green) | 'normal' (Normal)
  customTag?: string;            // Custom tag text badge e.g. "Strict Adherence", "100% Pure"
  customTagBgColor?: string;     // Custom background color for the tag
  customTagTextColor?: string;   // Custom text color for the tag
  customTagOpacity?: number;     // Custom tag opacity (10 to 100, default 100)
  // Multiple tags support (displayed as separate badges with background colors):
  tags?: string[];               // e.g. ["Anidra", "Manodaurbalya", "Kshaya"] or ["Text1", "T2"]
  tagsBgColor?: string;          // Optional custom background color for the tags
  tagsTextColor?: string;        // Optional custom text color for tags
  // Ingredient details (composed 1-line item with customizable small image):
  imageUrl?: string;             // Herb / ingredient image link
  imageSize?: 'small' | 'medium' | 'large' | string; // Preset or custom string
  customImageSizePx?: number;    // Manually typed image size in pixels (e.g. 24, 32, 40)
  botanicalName?: string;        // Botanical Latin species
  quantityOrPotency?: string;    // e.g. "500 mg", "5% Withanolides"
  role?: string;                 // Pharmacological role
  isIngredient?: boolean;        // Composed compact 1-line layout
  // FAQs:
  isFaq?: boolean;
  // Customer Feedbacks / Reviews (Admin managed only, displayed in quotes ""):
  isReview?: boolean;
  author?: string;               // Reviewer name
  rating?: number;               // 1 to 5 stars
  date?: string;                 // Date / verification label
}

export type MonographBlockType = 
  | 'card'
  | 'header'
  | 'rich_text'
  | 'tags'
  | 'image_text'
  | 'image_only'
  | 'divider';

export interface BlockDesignSettings {
  bgColor?: string;          // Hex e.g. #FAF7F2, #FFFFFF
  textColor?: string;        // Hex e.g. #14291D, #2C5E43
  bgOpacity?: number;        // 0 to 100
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg';
  border?: 'none' | 'solid' | 'dashed' | 'subtle';
  borderColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  alignment?: 'left' | 'center' | 'right' | 'justify';
  width?: 'full' | 'wide' | 'compact' | 'auto';
}

export interface HeaderBlockData {
  text: string;
  subtitle?: string;
  level?: 'h2' | 'h3' | 'h4';
  showAccentBorder?: boolean;
}

export interface RichTextBlockData {
  content: string;
  secondaryContent?: string; // Optional Monograph Paragraph / Clinical notes
  fontSize?: 'xs' | 'sm' | 'base' | 'lg';
  lineHeight?: 'normal' | 'relaxed' | 'loose';
}

export interface TagItem {
  id: string;
  text: string;
  textColor?: string;
  bgColor?: string;
  bgOpacity?: number;
  fontSize?: 'xs' | 'sm';
  style?: 'rounded' | 'square' | 'pill';
}

export interface TagsBlockData {
  title?: string;
  tags: TagItem[];
  detailedContent?: string; // Detailed Content / Monograph Paragraph shown below tags
}

export interface ImageTextBlockData {
  title?: string;
  text: string;
  detailedContent?: string;
  imageUrl: string;
  imageAlt?: string;
  imageLinkUrl?: string; // Optional clickable link on image
  imagePosition: 'left' | 'right' | 'top' | 'bottom';
  imageSize: 'small' | 'medium' | 'large';
  aspectRatio: 'square' | '16:9' | '4:3' | 'natural';
  spacing?: 'sm' | 'md' | 'lg';
  alignment?: 'start' | 'center' | 'end';
}

export interface ImageOnlyBlockData {
  imageUrl: string;
  caption?: string;
  imageLinkUrl?: string; // Optional clickable link on image
  aspectRatio?: 'square' | '16:9' | '4:3' | '21:9' | 'natural';
  imageSize?: 'small' | 'medium' | 'large' | 'full';
  rounded?: 'none' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface DividerBlockData {
  style: 'line' | 'dashed' | 'dots' | 'spacing_only';
  lineColor?: string;
  thickness?: number;
  heightPx?: number;
}

/**
 * Unified Composed Card Block Data:
 * Allows creating a single rich card containing any desired combination of:
 * - Header (Title, Subtitle)
 * - Image (Left / Right / Top / Bottom / Compact with optional link)
 * - Rich text & List
 * - Tags / badges (Placed where wanted: top, middle, or bottom)
 * - Detailed Content / Monograph Paragraph
 * - Optional link button
 */
export interface CardBlockData {
  // 1. Header inside card
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  headerLevel?: 'h2' | 'h3' | 'h4';
  showAccentBorder?: boolean;

  // 2. Image inside card with link
  showImage?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  imageLinkUrl?: string; // Clickable link on image
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
  imageSize?: 'compact' | 'small' | 'medium' | 'large' | 'full';
  aspectRatio?: 'square' | '16:9' | '4:3' | 'natural';
  imageRounded?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

  // 3. Rich text / bullet list inside card
  showRichText?: boolean;
  content?: string; // Formatted content, bold, bullets
  secondaryContent?: string; // Clinical notes / Monograph paragraph
  fontSize?: 'xs' | 'sm' | 'base' | 'lg';
  lineHeight?: 'normal' | 'relaxed' | 'loose';

  // 4. Tags / badges inside card (Placed where user wants)
  showTags?: boolean;
  tagsTitle?: string;
  tags?: TagItem[];
  tagsPosition?: 'top' | 'middle' | 'bottom'; // Position of tags inside the card
  detailedContent?: string; // Detailed Content / Monograph Paragraph below tags

  // 5. Optional action link / button
  actionLinkUrl?: string;
  actionLinkLabel?: string;
}

export interface MonographContentBlock {
  id: string;
  type: MonographBlockType;
  design: BlockDesignSettings;
  cardData?: CardBlockData; // Unified / Composed Card Block
  headerData?: HeaderBlockData;
  richTextData?: RichTextBlockData;
  tagsData?: TagsBlockData;
  imageTextData?: ImageTextBlockData;
  imageOnlyData?: ImageOnlyBlockData;
  dividerData?: DividerBlockData;
}

export interface ProductMonographTab {
  id: string;                    // Tab identifier (overview, benefits, ingredients, dosage, specifications, faqs_reviews, or custom)
  title: string;                 // Display title: Tab 1: Overview, Tab 2: Benefits & Uses, etc.
  subtitle?: string;             // Subtitle description
  icon?: string;                 // Icon name
  items: MonographDetailItem[];  // Detail cards inside this tab
  isCustom?: boolean;
  enabled?: boolean;
  order?: number;
  bgColor?: string;             // Custom tab background color (e.g. #FAF7F2, #14291D)
  textColor?: string;           // Custom tab text color (e.g. #14291D, #FFFFFF)
  bgOpacity?: number;           // Custom tab background opacity (10 to 100)
  blocks?: MonographContentBlock[]; // Independent content blocks for collapsible accordion
}

export interface ProductCustomTag {
  text: string;
  bgColor: string;
  textColor: string;
}

export interface ProductVariant {
  id: string;
  size: string; // e.g. "100", "200", "500", "1"
  unit: string; // e.g. "ml", "gm", "kg", "Liter", "Capsules", "Tablets", etc.
  price: number; // e.g. 299
  mrp: number; // e.g. 399
  resellerPrice?: number; // e.g. 210
  image?: string; // primary separate image when this variant is selected
  images?: string[]; // multiple separate photos for this variant
  videoUrl?: string; // YouTube video link or direct MP4 video link for this variant
  videoType?: 'youtube' | 'direct' | 'none';
  inStock?: boolean;
}

export interface HerbalProduct {
  id: string;
  name: string;
  sanskritName: string;
  category: ProductCategory;
  categoryLabel: string;
  form: ProductForm;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  resellerPrice?: number; // Reseller / B2B wholesale price in ₹
  sortBadge?: SortBadgeType; // Trending, Top Seller, Best Deal, etc.
  customTag?: ProductCustomTag; // Custom manual tag with background and text color
  volumeOrWeight: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  displayOrder?: number; // Sorting order in catalog (1 = top, 2 = second...)
  image: string;
  images?: string[]; // Multiple product images support
  videoUrl?: string; // YouTube video link or direct MP4 video link
  videoType?: 'youtube' | 'direct' | 'none';
  variants?: ProductVariant[]; // Different sizes / packaging variants
  customFields?: ProductCustomField[]; // Custom attributes with name, value and position
  keyIndications: string[];
  detailedUses: DetailedUses;
  dosageAndAnupana: DosageGuideline;
  keyIngredients: IngredientItem[];
  precautionsAndContraindications: string[];
  storageGuideline: string;
  ayushLicenseNo: string;
  batchInfo: string;
  customLink?: string;
  assuranceBadges?: ProductAssuranceBadges;
  primaryImageGradient?: 'default' | 'none' | 'black' | 'white' | 'emerald' | 'glass_dark' | 'glass_light';
  primaryImageOverlayOpacity?: number;
  primaryImageOverlayCoveragePercent?: number;
  primaryImageOverlayFadeSoftness?: number;
  monographTabs?: ProductMonographTab[]; // Horizontal tabs with customizable details, priorities, and cards
  customDetails?: ProductCustomDetailItem[]; // Optional custom highlight details shown directly above monograph tabs in product view
  isDraft?: boolean; // Draft mode: only visible to admin in catalog and admin panel
}

export interface ProductCustomDetailItem {
  id: string;
  title: string;
  text?: string;
  image?: string;
  size?: 'small' | 'medium' | 'large';
  bgColor?: string; // Hex color e.g. #FAF5EE, #14291D
  textColor?: string; // Hex color e.g. #14291D, #FFFFFF
  bgOpacity?: number; // Opacity percent: 10 to 100
}

export interface ProductAssuranceBadges {
  showBadges?: boolean;
  showBadge1?: boolean;
  showBadge2?: boolean;
  badge1Title?: string;
  badge1Subtitle?: string;
  badge2Title?: string;
  badge2Subtitle?: string;
}

export interface ContactNumberItem {
  id: string;
  label: string;
  number: string;
}

export interface ContactEmailItem {
  id: string;
  label: string;
  email: string;
}

export interface ContactWhatsAppItem {
  id: string;
  label: string;
  number: string;
  displayNumber: string;
}

export interface WeeklyDealItem {
  id: string;
  productId: string;
  customTitle?: string;
  customSubtitle?: string;
  dealPrice?: number;
  dealDiscountPercent?: number;
  dealBadge?: string;
  customImage?: string;
  highlightPoints?: string[];
}

export interface WeeklyDealsConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  badgeText: string;
  bannerTag: string;
  dealEndNotice?: string;
  items: WeeklyDealItem[];
}

export interface PeopleProfile {
  id: string;
  name: string;
  image: string;
  roleOrDesignation: string; // text down to the name
  qualificationOrExperience?: string;
}

export interface MessageTemplates {
  headerWhatsApp: string;
  floatingWhatsApp: string;
  frontContactBarWhatsApp: string;
  heroWhatsApp: string;
  productInquiryWhatsApp: string;
  cartOrderWhatsApp: string;
  consultationWhatsApp: string;
  contactFormEmailSubject: string;
  contactFormEmailBody: string;
  includeUserInfo: boolean;
}

export interface StoreMapConfig {
  enabled?: boolean; // Show or hide minimap on Contact section & Contact page
  mapQuery?: string; // Location name, address or GPS query for the map
  googleMapsUrl?: string; // Custom direct URL to open in Google Maps (or auto-generated)
  embedUrl?: string; // Custom Google Maps iframe embed URL (optional)
  locationTitle?: string; // Custom location header title
  locationSubtitle?: string; // Custom location subtitle / landmark
  zoom?: number; // Map zoom level (default 15)
}

export interface SiteSettings {
  brandName: string;
  hindiName: string;
  brandLogoImage?: string;
  showBrandLogo?: boolean;
  headPharmacist: string;
  regNumber: string;
  storeAddress: string;
  storeTimings: string;
  shippingNotice: string;
  showHeroBadge?: boolean;
  heroBadgeText?: string;
  heroTitle: string;
  heroSubtitle: string;
  catalogSectionTitle?: string;
  catalogSectionSubtitle?: string;
  contacts: {
    phones: ContactNumberItem[];
    whatsapps: ContactWhatsAppItem[];
    emails: ContactEmailItem[];
  };
  licenseBadges: string[];
  messageTemplates?: MessageTemplates;
  weeklyDeals?: WeeklyDealsConfig;
  footerCopyrightText?: string;
  footerBotanicalBadgeText?: string;
  peopleBadgeText?: string;
  peopleSectionTitle?: string;
  peopleSectionSubtitle?: string;
  peopleSwipeNotice?: string;
  peopleList?: PeopleProfile[];
  productAssuranceBadges?: ProductAssuranceBadges;
  bannerSlider?: BannerSliderConfig;
  productHorizontalLists?: ProductHorizontalList[];
  productImageGradient?: 'none' | 'black' | 'white' | 'emerald' | 'glass_dark' | 'glass_light';
  productImageOverlayOpacity?: number;
  productImageOverlayCoveragePercent?: number;
  productImageOverlayFadeSoftness?: number;
  storeMap?: StoreMapConfig;
  showStoreMap?: boolean;
  headerBanner?: HeaderBannerConfig;
  topNav?: TopNavConfig;
  categoryAppearance?: CategoryAppearanceConfig;
  marquee?: MarqueeConfig;
}

export type MarqueePlacement = 'top_bar' | 'below_header' | 'below_hero' | 'above_catalog' | 'above_footer';
export type MarqueeSize = 'small' | 'medium' | 'large';
export type MarqueeDirection = 'left' | 'right';
export type MarqueeDividerIcon = 'leaf' | 'sparkles' | 'star' | 'flame' | 'dot' | 'none';

export interface MarqueeItem {
  id: string;
  type: 'text' | 'product';
  // Text Item fields
  text?: string;
  badge?: string; // Optional tag text, e.g. "OFFER", "FAST DELIVERY", "AYURVEDA"
  badgeColor?: string; // Hex color e.g. "#B4741E"
  badgeTextColor?: string; // Hex color e.g. "#FFFFFF"
  textColor?: string; // Custom override text color
  linkType?: 'none' | 'url' | 'product' | 'category' | 'whatsapp';
  linkUrl?: string;
  linkProductId?: string;
  linkCategory?: string;

  // Product Item fields
  productId?: string;
  customLabel?: string; // Optional custom title override
  showImage?: boolean;
  showPrice?: boolean;
  showBadge?: boolean;
}

export interface MarqueeConfig {
  enabled: boolean;
  placement: MarqueePlacement;
  direction: MarqueeDirection;
  speedSeconds: number; // Duration in seconds for full loop (10 - 70)
  pauseOnHover: boolean;
  backgroundColor: string; // Background color e.g. "#14291D"
  textColor: string; // Text color e.g. "#FFFFFF"
  fontSize: MarqueeSize; // 'small' | 'medium' | 'large'
  paddingSize: 'compact' | 'regular' | 'spacious';
  dividerIcon: MarqueeDividerIcon;
  showBorder: boolean;
  borderColor?: string;
  items: MarqueeItem[];
}

export interface HeaderBannerConfig {
  backgroundType: 'color' | 'image';
  backgroundColor: string; // e.g. '#14291D'
  backgroundImageUrl: string;
  imageFit: 'cover' | 'contain' | 'stretch' | 'auto'; // cover = zoom fit, contain = auto fit, stretch = full width/height, auto = centered original
  imagePosition?: string; // e.g. 'center center', 'top center', 'bottom center'
  showAtmosphereBlur: boolean; // if false, disable ambient background blur/fade completely
  overlayColor: 'none' | 'black' | 'white' | 'emerald';
  overlayOpacity: number; // 0 to 100
  textColorTheme?: 'auto' | 'light' | 'dark';
  topNavBackground?: 'default' | 'match_header' | 'solid_white' | 'glass';
}

export interface TopNavConfig {
  backgroundStyle: 'default' | 'match_header' | 'solid_white' | 'glass';
}

export interface BannerSlideItem {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkType: 'product' | 'category' | 'custom' | 'none';
  productId?: string;
  category?: string;
  customUrl?: string;
  altText?: string;
}

export interface BannerSliderConfig {
  enabled: boolean;
  autoScrollSeconds?: number; // e.g. 4 seconds
  aspectRatio?: 'auto' | 'compact' | 'standard' | 'wide' | 'tall' | 'extra_tall' | 'custom';
  customHeightPx?: number; // e.g. 180, 240, 320, 400, 500, etc. (manually typed in pixels)
  overlayStyle?: 'none' | 'black' | 'white' | 'emerald' | 'glass_dark' | 'glass_light';
  overlayOpacity?: number;
  overlayCoveragePercent?: number;
  overlayFadeSoftness?: number;
  items: BannerSlideItem[];
}

export interface HorizontalListCardFields {
  showImage?: boolean;
  showName?: boolean;
  showSanskritName?: boolean;
  showPrice?: boolean;
  showResellerPrice?: boolean;
  showMrpAndOffer?: boolean;
  showTag?: boolean;
  showRating?: boolean;
  showAddToCart?: boolean;
  showQuickView?: boolean;
}

export interface ProductHorizontalList {
  id: string;
  enabled: boolean;
  title: string;
  subtitle?: string;
  badgeText?: string;
  displayOrder: number;
  sourceType: 'category' | 'manual';
  category?: string;
  maxProducts?: number;
  selectedProductIds?: string[];
  cardFields: HorizontalListCardFields;
}

export interface ConsultationInquiry {
  name: string;
  phone: string;
  email: string;
  symptomOrAilment: string;
  preferredProduct?: string;
  contactMethod: 'whatsapp' | 'phone' | 'email';
  preferredTime: string;
  message: string;
}

export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}
