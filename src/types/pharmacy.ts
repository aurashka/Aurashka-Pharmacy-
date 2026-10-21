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
  textColorOpacity?: number; // 0 to 100 opacity for text color
  bgColor?: string;
  bgOpacity?: number;        // 0 to 100 opacity for background color
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | string;
  customFontSize?: string;   // Custom typed font size e.g. "11px", "12px", "14px"
  size?: 'compact' | 'normal' | 'spacious';
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

export type CardElementType = 
  | 'image'
  | 'text'
  | 'tag'
  | 'image_text'
  | 'rich_text_list'
  | 'custom_table'
  | 'divider';

export interface CardElementItem {
  id: string;
  type: CardElementType;

  // 1. Image
  imageUrl?: string;
  imageAlt?: string;
  imageLinkUrl?: string; // Clickable link on image
  imageSize?: string;    // Custom typed (e.g. "120px", "200px", "100%", "compact", "small", "medium", "large")
  imageRounded?: string; // Card curve / border radius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | custom "16px"
  imageAlignment?: 'left' | 'center' | 'right';
  imageCaption?: string;

  // 2. Text
  text?: string;
  textSize?: string;     // Custom typed (e.g. "14px", "16px", "18px", "20px", "24px")
  textColor?: string;    // Custom text color hex
  textStyle?: 'normal' | 'italic';
  textBold?: boolean;
  textUnderline?: boolean;
  textAlignment?: 'left' | 'center' | 'right' | 'justify';

  // 3. Tag
  tags?: TagItem[];
  tagsTitle?: string;
  tagsAlignment?: 'left' | 'center' | 'right';

  // 4. Image + Text (Horizontal line)
  horizontalImageUrl?: string;
  horizontalImagePosition?: 'left' | 'right'; // Image on left or right of text
  horizontalImageSize?: string;              // Custom typed e.g. "80px", "100px", "120px"
  horizontalImageRounded?: string;           // Image curve: "none" | "md" | "lg" | "xl" | "full"
  horizontalImageLinkUrl?: string;           // Clickable link on image
  horizontalText?: string;
  horizontalTextSize?: string;               // Custom typed e.g. "14px", "16px"
  horizontalTextColor?: string;              // Custom text color
  horizontalTextBold?: boolean;
  horizontalTextItalic?: boolean;
  horizontalTextUnderline?: boolean;
  horizontalLinkUrl?: string;                // Clickable link URL
  horizontalLinkLabel?: string;              // Clickable link anchor text
  horizontalAlignment?: 'start' | 'center' | 'end'; // Vertical alignment

  // 5. Rich text list
  listStyle?: 'bullet' | 'numbered' | 'check' | 'dash';
  listItems?: string[];                      // List of items
  listFontSize?: string;                     // Custom typed e.g. "14px"
  listTextColor?: string;                    // Text color
  listIconColor?: string;                    // Bullet or checkmark icon color
  listSpacing?: 'compact' | 'normal' | 'relaxed';

  // 6. Custom table
  tableHeaders?: string[];                   // Column titles
  tableRows?: string[][];                    // Row cell arrays
  tableHeaderBgColor?: string;               // Header background color
  tableHeaderTextColor?: string;             // Header text color
  tableCellTextColor?: string;               // Cell text color
  tableBorderColor?: string;                 // Table border color
  tableFontSize?: string;                    // Custom typed e.g. "12px", "13px"
  tableZebra?: boolean;                      // Alternating row background

  // 7. Divider
  dividerStyle?: 'line' | 'dashed' | 'dots' | 'spacing_only';
  dividerColor?: string;                     // Line color
  dividerThickness?: number;                 // Thickness in px (e.g. 1, 2, 3)
  dividerHeightPx?: number;                  // Vertical spacing height in px (e.g. 12, 16, 24)
}

/**
 * Unified Composed Card Block Data:
 * Allows creating a single rich card containing multiple elements in custom order,
 * with individual popup editing and up/down position sequence controls.
 */
export interface CardBlockData {
  // Elements list inside this card (reorderable via up/down arrows)
  elements?: CardElementItem[];

  // 1. Icon & Header inside card (Title & Description)
  icon?: string;                 // Icon name: leaf, sparkles, shield, clock, info, heart, beaker, award, book, pill, check, star, feather
  iconColor?: string;            // Custom icon color
  showHeader?: boolean;
  showTitle?: boolean;
  title?: string;
  titleColor?: string;           // Custom title text color
  headerLevel?: 'h2' | 'h3' | 'h4';
  showAccentBorder?: boolean;
  
  showDescription?: boolean;
  description?: string;          // Card description / subtitle
  descriptionColor?: string;     // Custom description color
  subtitle?: string;             // Alias for description

  // 2. Horizontal row: (Image - Text) in a single horizontal line, or Only Image
  showHorizontalRow?: boolean;
  layoutMode?: 'horizontal' | 'image_only' | 'no_image'; // 'horizontal' (Image - Text in one line), 'image_only', or 'no_image'
  rowText?: string;             // Text inside horizontal row
  rowTextSize?: 'xs' | 'sm' | 'base' | 'lg'; // Text size
  rowTextColor?: string;        // Text color
  rowLinkUrl?: string;          // Clickable link URL
  rowLinkLabel?: string;        // Clickable link anchor text/label

  // Image inside card with link
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
  contentColor?: string;
  secondaryContent?: string; // Clinical notes / Monograph paragraph
  fontSize?: 'xs' | 'sm' | 'base' | 'lg';
  lineHeight?: 'normal' | 'relaxed' | 'loose';

  // 4. Tags / badges inside card (Placed at top by default)
  showTags?: boolean;
  tagsTitle?: string;
  tags?: TagItem[];
  tagsPosition?: 'top' | 'middle' | 'bottom'; // Position of tags inside the card (default: top)
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
  subtitle?: string;             // Subtitle description below the title in collapsible accordion
  icon?: string;                 // Icon name: leaf, sparkles, clock, shield, info, message, star, heart, beaker, pill, bookmark, check, award, feather, layers, book, package, none
  iconColor?: string;            // Custom base icon color
  items: MonographDetailItem[];  // Detail cards inside this tab
  isCustom?: boolean;
  enabled?: boolean;
  order?: number;
  bgColor?: string;             // Custom tab base background color (e.g. #FAF7F2, #14291D)
  textColor?: string;           // Custom tab base text color (e.g. #14291D, #FFFFFF)
  bgOpacity?: number;           // Custom tab background opacity (10 to 100)

  // Collapsible Active / Expand Selection Appearance Controls:
  activeColorMode?: 'color' | 'no_color' | 'theme'; // 'no_color' = clean neutral, no color shift when expanded; 'color' = custom active colors; 'theme' = default green & gold
  activeBgColor?: string;       // Custom background color when expanded (e.g. #FAF6F0, #F0FDF4, #FFFFFF)
  activeTextColor?: string;     // Custom title text color when expanded (e.g. #14291D, #FFFFFF)
  activeSubtitleColor?: string; // Custom description/subtitle color when expanded (e.g. #6F6452, #166534)
  activeIconBgColor?: string;   // Custom icon badge background when expanded (e.g. #14291D, #EAE3D5, transparent)
  activeIconColor?: string;     // Custom icon tint color when expanded (e.g. #FCD34D, #166534)
  activeBorderColor?: string;   // Custom border color when expanded (e.g. #C2B7A3, #166534)

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
  brand?: string; // Brand / Manufacturer / Seller e.g. "Vaidya Shala Authentic"
  sellerName?: string; // Seller / Dispenser
  isDraft?: boolean; // Draft mode: only visible to admin in catalog and admin panel
  availabilityLinks?: ProductAvailabilityLink[]; // External platform links (Amazon, Meesho, Flipkart etc.) with price & floating offer badges
}

export type AvailabilityPlatformId =
  | 'amazon'
  | 'meesho'
  | 'flipkart'
  | 'tata_1mg'
  | 'netmeds'
  | 'apollo'
  | 'jiomart'
  | 'custom';

export interface ProductAvailabilityLink {
  id: string;
  platform: AvailabilityPlatformId;
  platformName: string; // e.g. "Amazon", "Meesho", "Flipkart", "1mg", "Apollo Pharmacy"
  url: string; // Direct link
  price?: number; // Optional platform price in ₹
  originalPrice?: number; // Optional platform MRP in ₹
  badgeText?: string; // Floating offer/badge text (e.g. "15% OFF", "Prime", "Best Deal", "Free Delivery")
  badgeColor?: string; // Custom badge background color (e.g. #F59E0B)
  badgeTextColor?: string; // Custom badge text color (e.g. #FFFFFF)
  isActive?: boolean;
}

export type CustomDetailElementType = 
  | 'image_text'      // Image + text (color, size, position)
  | 'text'            // Text (color, size)
  | 'image'           // Image (size)
  | 'rich_text_list'  // Rich text List (size, color, type)
  | 'table'           // Table (size, style, color)
  | 'card';           // Legacy Card

export interface ProductCustomDetailItem {
  id: string;
  type?: CustomDetailElementType;
  title?: string;
  text?: string;

  // 1. Image + Text properties (color, size, position)
  image?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
  imageSize?: 'small' | 'medium' | 'large' | string;
  customImageSizePx?: number;
  imageRounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  imageLinkUrl?: string;
  imageTextInline?: boolean; // Single continuous horizontal line layout (Image Text in 1 line)

  // 2. Text properties (color, size)
  textSize?: string;
  textColor?: string;
  textAlignment?: 'left' | 'center' | 'right' | 'justify';
  textBold?: boolean;
  textItalic?: boolean;

  // 3. Image properties (size)
  imageAlignment?: 'left' | 'center' | 'right';
  imageCaption?: string;

  // 4. Rich text List properties (size, color, type)
  listType?: 'bullet' | 'numbered' | 'check' | 'dash';
  listItems?: string[];
  listFontSize?: string;
  listTextColor?: string;
  listIconColor?: string;
  listTitle?: string;
  listSpacing?: 'compact' | 'normal' | 'relaxed';

  // 5. Table properties (size, style, color)
  tableHeaders?: string[];
  tableRows?: string[][];
  tableHeaderBgColor?: string;
  tableHeaderTextColor?: string;
  tableCellTextColor?: string;
  tableBorderColor?: string;
  tableFontSize?: string;
  tableStyle?: 'bordered' | 'striped' | 'minimal' | 'cards';
  tableTitle?: string;

  // Common background, opacity & sizing
  bgColor?: string; // Hex color e.g. #FAF5EE, #14291D
  bgOpacity?: number; // Opacity percent: 0 to 100
  borderColor?: string;
  size?: 'small' | 'medium' | 'large';
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
  defaultHorizontalShelfCardStyle?: HorizontalShelfCardStyle;
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
  productCardDisplay?: ProductCardDisplaySettings;
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

export type HorizontalShelfCardStyle = 'classic' | 'modern';
export type ProductCardDesignStyle = 'classic' | 'modern';

export interface ProductCardDisplaySettings {
  searchCardStyle?: ProductCardDesignStyle; // 'classic' | 'modern'
  catalogCardStyle?: ProductCardDesignStyle; // 'classic' | 'modern'
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
  showSeller?: boolean;
  showVolume?: boolean;
  showTagline?: boolean;
  showWhatsApp?: boolean;
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
  showSeller?: boolean;     // Seller / Brand / Manufacturer
  showVolume?: boolean;     // Volume or Pack size (e.g. 100g, 60 caps)
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
  cardStyle?: HorizontalShelfCardStyle; // 'classic' (normal image top) | 'modern' (left info, right full image)
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
