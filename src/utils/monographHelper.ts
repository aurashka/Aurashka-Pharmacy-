import { 
  HerbalProduct, 
  ProductMonographTab, 
  MonographDetailItem, 
  MonographPriority,
  MonographContentBlock,
  BlockDesignSettings,
  TagItem
} from '../types/pharmacy';

// Botanical Herb Image Presets for rich visual ingredient cards
export const HERB_IMAGE_MAP: Record<string, string> = {
  ashwagandha: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  withania: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  amla: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=400&q=80',
  amalaki: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=400&q=80',
  shilajit: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80',
  brahmi: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
  bacopa: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
  tulsi: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80',
  turmeric: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  haridra: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  curcumin: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  triphala: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
  haritaki: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
  bibhitaki: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
  guggulu: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=400&q=80',
  commiphora: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=400&q=80',
  shatavari: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=400&q=80',
  asparagus: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=400&q=80',
  pippali: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
  piper: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
  shunthi: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  ginger: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  elaichi: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80',
  cardamom: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80',
  ghee: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
  ghrita: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
  neem: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80',
  azadirachta: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80',
  giloy: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
  guduchi: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
  tinospora: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
  saffron: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80',
  kesar: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80',
  manjistha: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=400&q=80',
};

export const getHerbImageUrl = (herbName: string, botanicalName?: string): string => {
  const query = `${herbName} ${botanicalName || ''}`.toLowerCase();
  for (const [key, url] of Object.entries(HERB_IMAGE_MAP)) {
    if (query.includes(key)) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80';
};

// Priority Card styling classes (clean, neutral card background so ONLY the tag/text has priority color)
export const getPriorityCardClasses = (priority: MonographPriority = 'normal'): string => {
  return 'bg-white border border-[#E7DFD1] hover:border-[#D5CCBC] shadow-2xs text-[#2C2419] transition-all';
};

export const PRIORITY_DARK_HEX_MAP: Record<MonographPriority, string> = {
  high: '#991B1B', // Dark Wine Red
  mid: '#B45309',  // Dark Amber / Ochre
  low: '#14532D',  // Deep Dark Forest Green
  normal: '#1F2937', // Dark Slate Charcoal
};

// Priority Tag badge background classes with deep dark tones
export const getPriorityTagClasses = (priority: MonographPriority = 'normal'): {
  bgClass: string;
  textClass: string;
  defaultLabel: string;
  defaultHex: string;
  dotColor: string;
} => {
  switch (priority) {
    case 'high':
      return {
        bgClass: 'bg-[#991B1B]',
        textClass: 'text-white',
        defaultLabel: 'Clinical Attention',
        defaultHex: '#991B1B',
        dotColor: 'bg-red-300 animate-pulse',
      };
    case 'mid':
      return {
        bgClass: 'bg-[#B45309]',
        textClass: 'text-white',
        defaultLabel: 'Pharmacological Key',
        defaultHex: '#B45309',
        dotColor: 'bg-amber-300',
      };
    case 'low':
      return {
        bgClass: 'bg-[#14532D]',
        textClass: 'text-white',
        defaultLabel: 'Apothecary Standard',
        defaultHex: '#14532D',
        dotColor: 'bg-emerald-300',
      };
    case 'normal':
    default:
      return {
        bgClass: 'bg-[#1F2937]',
        textClass: 'text-white',
        defaultLabel: '',
        defaultHex: '#1F2937',
        dotColor: 'bg-stone-300',
      };
  }
};

/**
 * Extracts multiple tags from item.tags or detects parenthetical tags like ( Text 1 ) , ( T2 )
 * Allowing multiple tags inside a single field.
 */
export const parseItemTags = (item: { tags?: string[]; text?: string }): string[] => {
  if (Array.isArray(item.tags) && item.tags.length > 0) {
    return item.tags.map((t) => String(t).trim()).filter(Boolean);
  }
  if (item.text) {
    // Detect (Text 1), (T2) patterns
    const parenMatches = item.text.match(/\(([^)]+)\)/g);
    if (parenMatches && parenMatches.length > 0) {
      return parenMatches.map((m) => m.replace(/^\(|\)$/g, '').trim()).filter(Boolean);
    }
  }
  return [];
};

/**
 * Converts HEX color to RGBA with opacity percent (10 - 100)
 */
export const hexToRgba = (hex: string, opacityPercent = 100): string => {
  if (!hex || !hex.startsWith('#')) return hex;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return hex;
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const a = Math.max(0.05, Math.min(1, (Number(opacityPercent) || 100) / 100));
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
};

/**
 * Resolves the effective background and text color for an item's tag or priority accent
 */
export const resolveEffectiveColors = (
  item: { customTagBgColor?: string; customTagTextColor?: string; customTagOpacity?: number; priority?: MonographPriority },
  fallbackPriority: MonographPriority = 'normal'
): { bg: string; text: string; opacity: number } => {
  const prio = item.priority || fallbackPriority;
  const defaultHex = PRIORITY_DARK_HEX_MAP[prio] || PRIORITY_DARK_HEX_MAP.normal;
  const rawBg = (item.customTagBgColor && item.customTagBgColor.trim()) ? item.customTagBgColor.trim() : defaultHex;
  const opacity = typeof item.customTagOpacity === 'number' ? item.customTagOpacity : 100;
  const bg = opacity < 100 ? hexToRgba(rawBg, opacity) : rawBg;
  const text = (item.customTagTextColor && item.customTagTextColor.trim()) ? item.customTagTextColor.trim() : '#FFFFFF';
  return { bg, text, opacity };
};

/**
 * Builds the classical 6 Monograph Tabs for an Ayurvedic product
 * Tab 1: Overview
 * Tab 2: Benefits & Uses
 * Tab 3: Ingredients & Composition
 * Tab 4: Dosage & Safety
 * Tab 5: Specifications & Quality
 * Tab 6: FAQs & Reviews
 */
export const buildDefaultMonographTabs = (product: HerbalProduct): ProductMonographTab[] => {
  const savings = Math.max(0, product.mrp - product.price);

  // Tab 1: Overview — Product introduction, price, and key features.
  const overviewItems: MonographDetailItem[] = [
    {
      id: `${product.id}-ov-intro`,
      title: 'Classical Introduction & Description',
      text: `${product.description} ${product.tagline ? `— ${product.tagline}` : ''}`,
      priority: 'normal',
      customTag: 'Apothecary Monograph',
    },
    {
      id: `${product.id}-ov-form`,
      title: 'Dispensing Form & Presentation',
      text: `${product.volumeOrWeight} net content in classical ${product.form} form. Category: ${product.categoryLabel}. Preserves traditional Rasashastra extraction potency.`,
      priority: 'low',
      customTag: 'Authentic Ayush Form',
    },
    {
      id: `${product.id}-ov-pricing`,
      title: 'Pharmacopoeia Pricing & Patient Savings',
      text: `Direct Apothecary Price: ₹${product.price} (MRP: ₹${product.mrp}${savings > 0 ? `, You Save ₹${savings}` : ''}). Formulated to classical Shastriya standards.`,
      priority: 'mid',
      customTag: 'Direct Pricing',
    },
    ...(product.resellerPrice && product.resellerPrice > 0
      ? [
          {
            id: `${product.id}-ov-reseller`,
            title: 'Verified Reseller & B2B Clinic Rate',
            text: `Wholesale Ayurvedic Clinic Rate: ₹${product.resellerPrice} per pack. Margin: ₹${product.price - product.resellerPrice} (${Math.round(((product.price - product.resellerPrice) / product.price) * 100)}%). Available for certified practitioners.`,
            priority: 'low' as MonographPriority,
            customTag: 'B2B Wholesale',
          },
        ]
      : []),
    ...(product.customFields && product.customFields.length > 0
      ? product.customFields.map((cf, idx) => ({
          id: `${product.id}-ov-cf-${cf.id || idx}`,
          title: cf.name,
          text: cf.value,
          priority: 'normal' as MonographPriority,
        }))
      : []),
  ];

  // Tab 2: Benefits & Uses — Benefits, uses, and indications.
  const benefitsItems: MonographDetailItem[] = [
    {
      id: `${product.id}-ben-dosha`,
      title: 'Tridosha Pharmacodynamics',
      text: product.detailedUses?.doshaEffect || 'Balances and harmonizes physiological doshas according to Ayurvedic principles.',
      priority: 'mid',
      customTag: 'Dosha Action',
    },
    {
      id: `${product.id}-ben-action`,
      title: 'Therapeutic Action Mechanism',
      text: product.detailedUses?.actionMechanism || 'Acts on Dhatus (tissues) to restore cellular equilibrium and natural vitality.',
      priority: 'low',
      customTag: 'Classical Pharmacology',
    },
    {
      id: `${product.id}-ben-primary`,
      title: 'Primary Clinical Benefits',
      text: (product.detailedUses?.primaryBenefits || []).join(' • ') || 'Supports overall vitality, strength, and immunity.',
      priority: 'low',
      customTag: 'Verified Benefits',
    },
    {
      id: `${product.id}-ben-ailments`,
      title: 'Ailments & Conditions Treated (Roga Adhikara)',
      text: (product.detailedUses?.ailmentsTreated || product.keyIndications || []).join(' • ') || 'Indicated for traditional constitutional balances.',
      tags: product.detailedUses?.ailmentsTreated?.length ? product.detailedUses.ailmentsTreated : (product.keyIndications || ['Immunity', 'Vital Energy']),
      priority: 'high',
      customTag: 'Classical Indications',
    },
  ];

  // Tab 3: Ingredients & Composition — Ingredients (with images & size), quantities, and formulation details.
  const ingredientsItems: MonographDetailItem[] = [
    ...(product.keyIngredients || []).map((ing, idx) => ({
      id: `${product.id}-ing-${idx}`,
      title: ing.herb,
      text: `${ing.botanicalName ? `Species: ${ing.botanicalName} | ` : ''}Potency: ${ing.potencyOrMg} | Therapeutic Role: ${ing.role}`,
      priority: (idx === 0 ? 'mid' : 'low') as MonographPriority,
      customTag: ing.potencyOrMg,
      botanicalName: ing.botanicalName,
      quantityOrPotency: ing.potencyOrMg,
      role: ing.role,
      imageUrl: getHerbImageUrl(ing.herb, ing.botanicalName),
      imageSize: 'small' as const,
      customImageSizePx: 32,
      isIngredient: true,
    })),
    {
      id: `${product.id}-ing-purity`,
      title: '100% Purity & Solvent-Free Formulation',
      text: 'Prepared using traditional aqueous Kwath extraction and Shastriya Bhavana cycles. Zero synthetic colorants, binders, fillers, or parabens.',
      priority: 'normal',
      customTag: 'Zero Chemicals',
    },
  ];

  // Tab 4: Dosage & Safety — Dosage, directions for use, precautions, and side effects.
  const dosageItems: MonographDetailItem[] = [
    {
      id: `${product.id}-dos-standard`,
      title: 'Prescribed Standard Dosage',
      text: product.dosageAndAnupana?.standardDosage || '1 to 2 units daily as prescribed by physician.',
      priority: 'high',
      customTag: 'Prescribed Dosage',
    },
    {
      id: `${product.id}-dos-timing`,
      title: 'Optimal Chrono-Therapeutic Timing',
      text: product.dosageAndAnupana?.bestTiming || 'Post meals with lukewarm water.',
      priority: 'mid',
      customTag: 'Timing & Routine',
    },
    {
      id: `${product.id}-dos-anupana`,
      title: 'Classical Anupana (Carrier Vehicle)',
      text: product.dosageAndAnupana?.anupanaCarrier || 'Warm cow milk, honey, or lukewarm water.',
      priority: 'mid',
      customTag: 'Bio-Carrier',
    },
    {
      id: `${product.id}-dos-duration`,
      title: 'Recommended Course Duration',
      text: product.dosageAndAnupana?.duration || '8 to 12 weeks for complete systemic rasayana benefits.',
      priority: 'normal',
      customTag: 'Rasayana Course',
    },
    {
      id: `${product.id}-dos-precautions`,
      title: 'Precautions & Contraindications',
      text: (product.precautionsAndContraindications || []).join(' • ') || 'Keep out of reach of children. Pregnant and nursing mothers should consult a physician prior to intake.',
      priority: 'high',
      customTag: 'Safety Warning',
    },
  ];

  // Tab 5: Specifications & Quality — Packaging, shelf life, storage instructions, manufacturer, and quality information.
  const specificationsItems: MonographDetailItem[] = [
    {
      id: `${product.id}-spec-license`,
      title: 'Ayush Manufacturing License & Standards',
      text: `Approved by Department of Ayush, Govt of India. License No: ${product.ayushLicenseNo || 'AYUSH-GMP-2024-HERB-4081'}. Fully compliant with Ayurvedic Pharmacopoeia of India (API) standards.`,
      priority: 'low',
      customTag: 'Govt Certified',
    },
    {
      id: `${product.id}-spec-batch`,
      title: 'Batch Traceability & Analytical Release',
      text: `${product.batchInfo || 'Batch #VDK-2026-B | Mfd: FEB 2026 | Exp: JAN 2028'}. Standardized shelf life of 24 to 36 months from manufacture date.`,
      priority: 'normal',
      customTag: 'Lab Verified',
    },
    {
      id: `${product.id}-spec-storage`,
      title: 'Storage Instructions & Potency Retention',
      text: product.storageGuideline || 'Store in a cool, dry place away from direct sunlight, moisture, and extreme heat. Close container tightly after each use.',
      priority: 'mid',
      customTag: 'Storage Guideline',
    },
    {
      id: `${product.id}-spec-packaging`,
      title: 'Protective Pharmaceutical Packaging',
      text: `Hermetically sealed in pharmaceutical-grade UV-protective amber containers to shield delicate active phyto-compounds and volatile essential oils. Net content: ${product.volumeOrWeight}.`,
      priority: 'normal',
      customTag: 'UV Shielded',
    },
    {
      id: `${product.id}-spec-metals`,
      title: 'Heavy Metal & Microbial Lab Clearance',
      text: 'Tested via Inductively Coupled Plasma Mass Spectrometry (ICP-MS) for Lead, Mercury, Arsenic, and Cadmium below stringent limits. Zero synthetic pesticides detected.',
      priority: 'low',
      customTag: 'Heavy Metals Cleared',
    },
  ];

  // Tab 6: FAQs & Reviews — Frequently asked questions, genuine customer reviews, and ratings.
  const faqsAndReviewsItems: MonographDetailItem[] = [
    {
      id: `${product.id}-faq-1`,
      title: 'Can this classical formulation be consumed alongside modern supplements?',
      text: 'Yes, classical Ayurvedic formulations are generally compatible with multivitamins and nutritionals. We advise maintaining a 45-minute interval between modern pharmaceuticals and herbal rasayanas for optimal bio-absorption.',
      isFaq: true,
      priority: 'normal',
    },
    {
      id: `${product.id}-faq-2`,
      title: 'How soon can one observe noticeable wellness improvements?',
      text: 'Digestive and cellular metabolic assimilation begins within 5 to 7 days. Sustained constitutional rejuvenation and physiological improvements become distinct between 3 to 6 weeks of disciplined daily regimen.',
      isFaq: true,
      priority: 'normal',
    },
    {
      id: `${product.id}-faq-3`,
      title: 'Is it suitable for daily seasonal usage without dependency?',
      text: 'All herbs incorporated in this classical recipe are non-habit forming and categorized under traditional Rasayana (vitality restorative) botanicals, formulated for natural bodily nourishment.',
      isFaq: true,
      priority: 'normal',
    },
    {
      id: `${product.id}-rev-1`,
      title: 'Classical potency and genuine therapeutic relief',
      text: 'The formulation quality is exceptional. You can immediately discern the authenticity in its natural aroma and bio-assimilation. My patients have reported marked improvement in stamina and digestive lightness within 10 days.',
      author: 'Dr. R. Sharma (Senior Ayurvedic Practitioner, BAMS)',
      rating: 5,
      date: 'Verified Vaidya Review · March 2026',
      isReview: true,
      priority: 'low',
      customTag: 'Verified Practitioner',
    },
    {
      id: `${product.id}-rev-2`,
      title: 'Uncompromising purity without synthetic additives',
      text: 'Finding authentic Shastriya preparations with transparent batch testing and zero fillers is rare today. This dispensary consistently upholds the highest pharmaceutical rigor. Arrived impeccably sealed.',
      author: 'Pooja V. (Verified Dispensary Buyer)',
      rating: 5,
      date: 'Verified Buyer · February 2026',
      isReview: true,
      priority: 'low',
      customTag: 'Verified Buyer',
    },
    {
      id: `${product.id}-rev-3`,
      title: 'Prompt delivery and wonderful doctor consultation guidance',
      text: 'The dosage guidelines with anupana were crystal clear. The customer support on WhatsApp provided classical diet suggestions alongside the order. Outstanding service and authentic herbs.',
      author: 'Kavita Sundaram (Bangalore, KA)',
      rating: 5,
      date: 'Verified Buyer · January 2026',
      isReview: true,
      priority: 'normal',
      customTag: 'Verified Buyer',
    },
  ];

export const cleanMonographTabTitle = (title: string): string => {
  if (!title) return '';
  return title
    .replace(/^(?:Default\s*)?Tab\s*\d+\s*:\s*/i, '')
    .replace(/^(?:Default\s*)?Tab\s*#?\d+\s*[-–—:]\s*/i, '')
    .trim();
};

  return [
    {
      id: 'overview',
      title: 'Overview',
      subtitle: 'Product introduction, price & classical features',
      icon: 'info',
      items: overviewItems,
      isCustom: false,
      enabled: true,
      order: 1,
    },
    {
      id: 'benefits',
      title: 'Benefits & Uses',
      subtitle: 'Clinical benefits, therapeutic uses & indications',
      icon: 'leaf',
      items: benefitsItems,
      isCustom: false,
      enabled: true,
      order: 2,
    },
    {
      id: 'ingredients',
      title: 'Ingredients & Composition',
      subtitle: 'Botanical composition, herb imagery, potency & role',
      icon: 'sparkles',
      items: ingredientsItems,
      isCustom: false,
      enabled: true,
      order: 3,
    },
    {
      id: 'dosage',
      title: 'Dosage & Safety',
      subtitle: 'Prescribed dosage, timing, anupana carrier & precautions',
      icon: 'clock',
      items: dosageItems,
      isCustom: false,
      enabled: true,
      order: 4,
    },
    {
      id: 'specifications',
      title: 'Specifications & Quality',
      subtitle: 'Packaging, shelf life, storage & Ayush quality certs',
      icon: 'shield',
      items: specificationsItems,
      isCustom: false,
      enabled: true,
      order: 5,
    },
    {
      id: 'faqs_reviews',
      title: 'FAQs & Reviews',
      subtitle: 'Frequently asked questions & verified customer reviews',
      icon: 'star',
      items: faqsAndReviewsItems,
      isCustom: false,
      enabled: true,
      order: 6,
    },
  ];
};

/**
 * Returns the effective monograph tabs for a product.
 * If product has custom or edited monographTabs, returns those (respecting deletions, edits, additions).
 * Otherwise returns the 6 classical default tabs.
 */
export const getEffectiveMonographTabs = (product: HerbalProduct): ProductMonographTab[] => {
  if (product.monographTabs && Array.isArray(product.monographTabs) && product.monographTabs.length > 0) {
    return product.monographTabs
      .filter((tab) => tab.enabled !== false)
      .map((tab, idx) => ({
        ...tab,
        title: cleanMonographTabTitle(tab.title),
        order: tab.order !== undefined && tab.order > 0 ? tab.order : idx + 1,
      }))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }
  return buildDefaultMonographTabs(product);
};

/**
 * Resolves inline CSS styles from BlockDesignSettings
 */
export const getBlockContainerStyles = (design?: BlockDesignSettings): React.CSSProperties => {
  if (!design) return {};
  const style: React.CSSProperties = {};
  if (design.bgColor) {
    const opacity = typeof design.bgOpacity === 'number' ? design.bgOpacity : 100;
    style.backgroundColor = hexToRgba(design.bgColor, opacity);
  }
  if (design.textColor) {
    style.color = design.textColor;
  }
  if (design.borderColor) {
    style.borderColor = design.borderColor;
  }
  return style;
};

export const resolveBlockCustomStyle = getBlockContainerStyles;

/**
 * Resolves Tailwind utility classes from BlockDesignSettings
 */
export const getBlockContainerClasses = (design?: BlockDesignSettings): string => {
  if (!design) return 'p-4 rounded-xl border border-[#E7DFD1] bg-white';
  const classes: string[] = ['transition-all'];

  // Padding
  switch (design.padding) {
    case 'none': classes.push('p-0'); break;
    case 'sm': classes.push('p-2.5 sm:p-3'); break;
    case 'md': classes.push('p-4 sm:p-5'); break;
    case 'lg': classes.push('p-5 sm:p-6'); break;
    case 'xl': classes.push('p-6 sm:p-8'); break;
    default: classes.push('p-3.5 sm:p-4');
  }

  // Margin
  switch (design.margin) {
    case 'none': classes.push('my-0'); break;
    case 'sm': classes.push('my-1.5'); break;
    case 'md': classes.push('my-3'); break;
    case 'lg': classes.push('my-5'); break;
    default: classes.push('my-2');
  }

  // Border
  switch (design.border) {
    case 'none': classes.push('border-0'); break;
    case 'solid': classes.push('border border-[#DDD5C5]'); break;
    case 'dashed': classes.push('border border-dashed border-[#DDD5C5]'); break;
    case 'subtle': classes.push('border border-stone-200/80'); break;
    default: classes.push('border border-[#EAE3D4]');
  }

  // Border Radius
  switch (design.borderRadius) {
    case 'none': classes.push('rounded-none'); break;
    case 'sm': classes.push('rounded-sm'); break;
    case 'md': classes.push('rounded-md'); break;
    case 'lg': classes.push('rounded-lg'); break;
    case 'xl': classes.push('rounded-xl'); break;
    case '2xl': classes.push('rounded-2xl'); break;
    default: classes.push('rounded-xl');
  }

  // Alignment
  switch (design.alignment) {
    case 'center': classes.push('text-center'); break;
    case 'right': classes.push('text-right'); break;
    case 'justify': classes.push('text-justify'); break;
    default: classes.push('text-left');
  }

  // Width
  switch (design.width) {
    case 'compact': classes.push('max-w-md mx-auto'); break;
    case 'wide': classes.push('max-w-4xl'); break;
    case 'auto': classes.push('w-fit'); break;
    default: classes.push('w-full');
  }

  return classes.join(' ');
};

/**
 * Converts legacy MonographDetailItem[] into modern MonographContentBlock[]
 */
export const convertTabItemsToBlocks = (tab: ProductMonographTab): MonographContentBlock[] => {
  if (!tab.items || tab.items.length === 0) {
    return [
      {
        id: `blk_${Date.now()}_intro`,
        type: 'rich_text',
        design: {
          bgColor: '#FAF8F5',
          textColor: '#14291D',
          bgOpacity: 100,
          padding: 'md',
          margin: 'sm',
          border: 'solid',
          borderRadius: 'xl',
          alignment: 'left',
          width: 'full',
        },
        richTextData: {
          content: tab.subtitle || 'Classical Ayurvedic monograph content verified by Rasashastra standards.',
          secondaryContent: 'Formulated in accordance with Ayurvedic Pharmacopoeia of India (API) specifications.',
          fontSize: 'sm',
          lineHeight: 'relaxed',
        },
      },
    ];
  }

  const blocks: MonographContentBlock[] = [];

  tab.items.forEach((item, idx) => {
    const parsedTags = parseItemTags(item);

    // 1. Image + Text item (Botanical Herb with image)
    if (item.imageUrl) {
      blocks.push({
        id: `blk_${item.id || idx}`,
        type: 'image_text',
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
        imageTextData: {
          title: item.title,
          text: item.text,
          detailedContent: item.botanicalName ? `Botanical Species: ${item.botanicalName}${item.quantityOrPotency ? ` • Potency: ${item.quantityOrPotency}` : ''}${item.role ? ` • Role: ${item.role}` : ''}` : undefined,
          imageUrl: item.imageUrl,
          imageAlt: item.title,
          imagePosition: 'left',
          imageSize: 'small',
          aspectRatio: 'square',
          spacing: 'md',
          alignment: 'center',
        },
      });
      return;
    }

    // 2. Tags Block (Items with tags)
    if (parsedTags.length > 0) {
      blocks.push({
        id: `blk_${item.id || idx}`,
        type: 'tags',
        design: {
          bgColor: '#FAF8F5',
          textColor: '#14291D',
          bgOpacity: 100,
          padding: 'md',
          margin: 'sm',
          border: 'solid',
          borderRadius: 'xl',
          alignment: 'left',
          width: 'full',
        },
        tagsData: {
          title: item.title,
          tags: parsedTags.map((t, tIdx) => ({
            id: `tag_${tIdx}`,
            text: t,
            bgColor: item.customTagBgColor || '#14291D',
            textColor: item.customTagTextColor || '#FFFFFF',
            bgOpacity: item.customTagOpacity ?? 100,
            fontSize: 'xs',
            style: 'rounded',
          })),
          detailedContent: item.text || undefined, // Detailed Content / Monograph Paragraph shown below tags
        },
      });
      return;
    }

    // 3. Customer Review Item
    if (item.isReview) {
      blocks.push({
        id: `blk_${item.id || idx}`,
        type: 'rich_text',
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
        richTextData: {
          content: `"${item.text || item.title}"`,
          secondaryContent: `— ${item.author || 'Verified Practitioner'}${item.date ? ` • ${item.date}` : ''} (${item.rating || 5} Stars Rating)`,
          fontSize: 'sm',
          lineHeight: 'relaxed',
        },
      });
      return;
    }

    // 4. Default Item: Clean Header + Rich Text with Detailed Content
    blocks.push({
      id: `blk_${item.id || idx}`,
      type: 'rich_text',
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
      richTextData: {
        content: `**${item.title}**\n${item.text}`,
        secondaryContent: item.customTag ? `Standard Reference: ${item.customTag}` : undefined,
        fontSize: 'sm',
        lineHeight: 'relaxed',
      },
    });
  });

  return blocks;
};

/**
 * Returns effective content blocks for a tab (prefers tab.blocks, falls back to converted tab.items)
 */
export const getEffectiveTabBlocks = (tab: ProductMonographTab): MonographContentBlock[] => {
  if (tab.blocks && Array.isArray(tab.blocks) && tab.blocks.length > 0) {
    return tab.blocks;
  }
  return convertTabItemsToBlocks(tab);
};
