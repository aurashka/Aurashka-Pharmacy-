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
