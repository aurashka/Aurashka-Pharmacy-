export type ProductCategory = string;
export type ProductForm = string;

export interface CategoryItem {
  id: string;
  label: string;
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
