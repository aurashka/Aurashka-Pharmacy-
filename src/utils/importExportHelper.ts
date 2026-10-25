import { 
  HerbalProduct, 
  CategoryItem, 
  SiteSettings, 
  ProductCategory, 
  ProductForm,
  SortBadgeType
} from '../types/pharmacy';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS } from '../data/herbalProducts';

export interface FullSiteBackupData {
  version: string;
  timestamp: string;
  appName: string;
  exportedBy?: string;
  scopes: ('products' | 'categories' | 'forms' | 'siteSettings')[];
  products?: HerbalProduct[];
  categories?: CategoryItem[];
  forms?: string[];
  siteSettings?: SiteSettings;
}

export interface ParsedImportResult {
  isValid: boolean;
  fileType: 'json' | 'csv' | 'unknown';
  error?: string;
  isFullBackup?: boolean;
  detectedScopes: {
    products: boolean;
    categories: boolean;
    forms: boolean;
    siteSettings: boolean;
  };
  counts: {
    products: number;
    categories: number;
    forms: number;
  };
  products?: HerbalProduct[];
  categories?: CategoryItem[];
  forms?: string[];
  siteSettings?: SiteSettings;
  warnings?: string[];
}

/**
 * Trigger browser file download for text/json/csv
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'application/json;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export products to formatted JSON
 */
export function exportProductsToJson(products: HerbalProduct[], filename?: string) {
  const data = JSON.stringify(products, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = filename || `herbal-products-catalog-${dateStr}.json`;
  downloadFile(name, data, 'application/json;charset=utf-8;');
}

/**
 * Escape CSV field to safely handle commas, newlines, and double quotes
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return String(val);
  
  if (Array.isArray(val)) {
    // If it's an array of strings
    if (val.length === 0) return '""';
    if (typeof val[0] === 'string') {
      const joined = val.join(' | ');
      return `"${joined.replace(/"/g, '""')}"`;
    }
    // Complex array
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }

  if (typeof val === 'object') {
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }

  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Export Products to Full Detailed CSV including all image links
 */
export function exportProductsToCsv(products: HerbalProduct[], filename?: string) {
  const headers = [
    'id',
    'name',
    'sanskritName',
    'category',
    'categoryLabel',
    'form',
    'price',
    'mrp',
    'resellerPrice',
    'volumeOrWeight',
    'inStock',
    'rating',
    'reviewsCount',
    'sortBadge',
    'tagline',
    'description',
    'image', // Primary Image Link
    'images', // All Gallery Image Links (separated by |)
    'videoUrl',
    'videoType',
    'brand',
    'sellerName',
    'ayushLicenseNo',
    'batchInfo',
    'storageGuideline',
    'customLink',
    'keyIndications', // Pipe-separated list
    'keyIngredients', // Formatted summary
    'standardDosage',
    'bestTiming',
    'anupanaCarrier',
    'precautions',
    'isDraft'
  ];

  const rows: string[] = [];
  rows.push(headers.join(','));

  products.forEach((p) => {
    // Gallery images pipe-separated
    const galleryString = Array.isArray(p.images) && p.images.length > 0 
      ? p.images.join(' | ') 
      : '';

    // Key indications pipe-separated
    const indicationsString = Array.isArray(p.keyIndications) 
      ? p.keyIndications.join(' | ') 
      : '';

    // Precautions pipe-separated
    const precautionsString = Array.isArray(p.precautionsAndContraindications) 
      ? p.precautionsAndContraindications.join(' | ') 
      : '';

    // Ingredients formatted summary
    const ingredientsString = Array.isArray(p.keyIngredients)
      ? p.keyIngredients
          .map((ing) => `${ing.herb || ''} (${ing.botanicalName || ''}) - ${ing.potencyOrMg || ''} [${ing.role || ''}]`)
          .join(' | ')
      : '';

    const row = [
      escapeCsvValue(p.id),
      escapeCsvValue(p.name),
      escapeCsvValue(p.sanskritName),
      escapeCsvValue(p.category),
      escapeCsvValue(p.categoryLabel),
      escapeCsvValue(p.form),
      escapeCsvValue(p.price),
      escapeCsvValue(p.mrp),
      escapeCsvValue(p.resellerPrice ?? ''),
      escapeCsvValue(p.volumeOrWeight),
      escapeCsvValue(p.inStock),
      escapeCsvValue(p.rating),
      escapeCsvValue(p.reviewsCount),
      escapeCsvValue(p.sortBadge ?? 'none'),
      escapeCsvValue(p.tagline),
      escapeCsvValue(p.description),
      escapeCsvValue(p.image), // Primary Image URL
      escapeCsvValue(galleryString), // All Gallery Image URLs
      escapeCsvValue(p.videoUrl ?? ''),
      escapeCsvValue(p.videoType ?? 'none'),
      escapeCsvValue(p.brand ?? ''),
      escapeCsvValue(p.sellerName ?? ''),
      escapeCsvValue(p.ayushLicenseNo ?? ''),
      escapeCsvValue(p.batchInfo ?? ''),
      escapeCsvValue(p.storageGuideline ?? ''),
      escapeCsvValue(p.customLink ?? ''),
      escapeCsvValue(indicationsString),
      escapeCsvValue(ingredientsString),
      escapeCsvValue(p.dosageAndAnupana?.standardDosage ?? ''),
      escapeCsvValue(p.dosageAndAnupana?.bestTiming ?? ''),
      escapeCsvValue(p.dosageAndAnupana?.anupanaCarrier ?? ''),
      escapeCsvValue(precautionsString),
      escapeCsvValue(Boolean(p.isDraft))
    ];

    rows.push(row.join(','));
  });

  const csvContent = rows.join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = filename || `herbal-products-catalog-${dateStr}.csv`;
  downloadFile(name, csvContent, 'text/csv;charset=utf-8;');
}

/**
 * Export full or selective website data as a unified JSON backup
 */
export function exportFullWebsiteBackup(options: {
  products?: HerbalProduct[];
  categories?: CategoryItem[];
  forms?: string[];
  siteSettings?: SiteSettings;
  selectedScopes: ('products' | 'categories' | 'forms' | 'siteSettings')[];
  appName?: string;
  filename?: string;
}) {
  const { products, categories, forms, siteSettings, selectedScopes, appName } = options;

  const backupData: FullSiteBackupData = {
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    appName: appName || siteSettings?.brandName || 'VedaVriksha Classical Herbal Pharmacy',
    scopes: selectedScopes,
  };

  if (selectedScopes.includes('products') && products) {
    backupData.products = products;
  }
  if (selectedScopes.includes('categories') && categories) {
    backupData.categories = categories;
  }
  if (selectedScopes.includes('forms') && forms) {
    backupData.forms = forms;
  }
  if (selectedScopes.includes('siteSettings') && siteSettings) {
    backupData.siteSettings = siteSettings;
  }

  const jsonStr = JSON.stringify(backupData, null, 2);
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const scopesTag = selectedScopes.length === 4 ? 'full-backup' : selectedScopes.join('-');
  const name = options.filename || `ayur-site-backup-${scopesTag}-${dateStr}.json`;

  downloadFile(name, jsonStr, 'application/json;charset=utf-8;');
}

/**
 * Robust CSV parser that handles quotes, line breaks inside cells, and delimiters
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuote = false;

  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuote) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentVal += '"';
        i++; // skip next quote
      } else if (char === '"') {
        // Closing quote
        insideQuote = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\n') {
        currentRow.push(currentVal.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
  }

  // Final flush
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Convert parsed CSV rows into structured HerbalProduct items
 */
function convertCsvRowsToProducts(rows: string[][]): { products: HerbalProduct[]; warnings: string[] } {
  if (rows.length < 2) {
    return { products: [], warnings: ['CSV file is empty or does not have data rows'] };
  }

  const rawHeaders = rows[0].map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));
  const dataRows = rows.slice(1);
  const products: HerbalProduct[] = [];
  const warnings: string[] = [];

  // Helper to find column index by synonyms
  const getColIdx = (...synonyms: string[]): number => {
    for (const syn of synonyms) {
      const cleanSyn = syn.toLowerCase().replace(/[\s_-]+/g, '');
      const idx = rawHeaders.indexOf(cleanSyn);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const nameIdx = getColIdx('name', 'productname', 'title', 'itemname');
  const priceIdx = getColIdx('price', 'rate', 'retailprice', 'sellingprice');
  const mrpIdx = getColIdx('mrp', 'originalprice', 'regularprice', 'listprice');
  const resellerIdx = getColIdx('resellerprice', 'b2bprice', 'wholesaleprice');
  const catIdx = getColIdx('category', 'categoryid', 'cat');
  const catLabelIdx = getColIdx('categorylabel', 'categoryname');
  const formIdx = getColIdx('form', 'physicalform', 'ayurvedicform', 'dosageform');
  const imageIdx = getColIdx('image', 'imageurl', 'primaryimage', 'photo', 'picture');
  const imagesIdx = getColIdx('images', 'gallery', 'galleryimages', 'photos', 'moreimages');
  const idIdx = getColIdx('id', 'productid', 'sku', 'code');
  const sanskritIdx = getColIdx('sanskritname', 'botanicalname', 'sanskrit');
  const taglineIdx = getColIdx('tagline', 'shortdesc', 'subtitle');
  const descIdx = getColIdx('description', 'details', 'longdescription');
  const volumeIdx = getColIdx('volumeorweight', 'volume', 'weight', 'size', 'packsize');
  const inStockIdx = getColIdx('instock', 'stock', 'available');
  const ratingIdx = getColIdx('rating', 'stars', 'averagerating');
  const reviewsIdx = getColIdx('reviewscount', 'reviews', 'totalreviews');
  const badgeIdx = getColIdx('sortbadge', 'badge', 'tag');
  const videoIdx = getColIdx('videourl', 'video');
  const brandIdx = getColIdx('brand', 'seller', 'sellername', 'manufacturer');
  const indicationsIdx = getColIdx('keyindications', 'indications', 'benefits', 'uses');
  const ingredientsIdx = getColIdx('keyingredients', 'ingredients', 'herbs', 'composition');
  const dosageIdx = getColIdx('standarddosage', 'dosage', 'howtouse');
  const timingIdx = getColIdx('besttiming', 'timing');
  const anupanaIdx = getColIdx('anupanacarrier', 'anupana', 'carrier');
  const precautionsIdx = getColIdx('precautions', 'contraindications', 'warnings');

  if (nameIdx === -1) {
    warnings.push('CSV does not have a recognizable "name" or "Product Name" column.');
  }

  dataRows.forEach((row, rowIdx) => {
    const getVal = (idx: number): string => (idx >= 0 && idx < row.length ? row[idx] : '');

    const name = getVal(nameIdx) || `Herbal Formulation ${rowIdx + 1}`;
    if (!name.trim()) return; // skip empty rows

    // Parse ID
    let id = getVal(idIdx).trim();
    if (!id) {
      id = `herbal-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${Date.now().toString(36)}-${rowIdx}`;
    }

    // Parse Prices
    const priceNum = parseFloat(getVal(priceIdx).replace(/[^0-9.]/g, '')) || 299;
    const mrpNum = parseFloat(getVal(mrpIdx).replace(/[^0-9.]/g, '')) || Math.round(priceNum * 1.25);
    const resellerVal = getVal(resellerIdx);
    const resellerNum = resellerVal ? parseFloat(resellerVal.replace(/[^0-9.]/g, '')) : undefined;

    // Parse Category & Form
    const category = (getVal(catIdx).trim() || 'classical_churna') as ProductCategory;
    const categoryLabel = getVal(catLabelIdx).trim() || category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const form = (getVal(formIdx).trim() || 'Churna') as ProductForm;

    // Parse Images
    let primaryImage = getVal(imageIdx).trim();
    if (!primaryImage) {
      primaryImage = 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80';
    }

    const rawGallery = getVal(imagesIdx).trim();
    let galleryImages: string[] = [];
    if (rawGallery) {
      galleryImages = rawGallery
        .split(/[|\n,]/)
        .map((s) => s.trim())
        .filter((s) => s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:'));
    }

    // Parse InStock
    const stockStr = getVal(inStockIdx).toLowerCase();
    const inStock = stockStr === '' ? true : !['false', '0', 'no', 'out of stock', 'out'].includes(stockStr);

    // Parse Ratings & Reviews
    const rating = parseFloat(getVal(ratingIdx)) || 4.9;
    const reviewsCount = parseInt(getVal(reviewsIdx), 10) || 120;

    // Parse Indications
    const rawIndications = getVal(indicationsIdx);
    const keyIndications = rawIndications
      ? rawIndications.split(/[|\n]/).map((s) => s.trim()).filter(Boolean)
      : ['Holistic Wellness', 'Dosha Balancing'];

    // Parse Precautions
    const rawPrecautions = getVal(precautionsIdx);
    const precautionsAndContraindications = rawPrecautions
      ? rawPrecautions.split(/[|\n]/).map((s) => s.trim()).filter(Boolean)
      : ['Store in a cool dry place', 'Consume as per Vaidya recommendation'];

    // Parse Ingredients
    const rawIngredients = getVal(ingredientsIdx);
    const keyIngredients = rawIngredients
      ? rawIngredients.split(/[|\n]/).map((itemStr) => {
          const trimmed = itemStr.trim();
          return {
            herb: trimmed.replace(/\(.*?\)/g, '').split('-')[0].trim() || trimmed,
            botanicalName: '',
            potencyOrMg: 'Standardized',
            role: 'Active Rasayana',
          };
        }).filter((ing) => ing.herb.length > 0)
      : [
          { herb: name, botanicalName: 'Herbal Extract', potencyOrMg: 'Standardized', role: 'Active Compound' }
        ];

    const product: HerbalProduct = {
      id,
      name,
      sanskritName: getVal(sanskritIdx).trim() || name,
      category,
      categoryLabel,
      form,
      tagline: getVal(taglineIdx).trim() || 'Classical Ayurvedic Botanical Formulation',
      description: getVal(descIdx).trim() || `${name} is prepared strictly adhering to classical Ayurvedic pharmacopoeia standards.`,
      price: priceNum,
      mrp: mrpNum,
      resellerPrice: resellerNum,
      volumeOrWeight: getVal(volumeIdx).trim() || '100 gm',
      inStock,
      rating,
      reviewsCount,
      sortBadge: (getVal(badgeIdx).trim() || 'none') as SortBadgeType,
      image: primaryImage,
      images: galleryImages.length > 0 ? galleryImages : undefined,
      videoUrl: getVal(videoIdx).trim() || undefined,
      videoType: getVal(videoIdx).trim() ? 'youtube' : 'none',
      brand: getVal(brandIdx).trim() || 'Shree Ayur Pharma',
      sellerName: getVal(brandIdx).trim() || 'Shree Ayur Pharma',
      keyIndications,
      keyIngredients,
      detailedUses: {
        primaryBenefits: keyIndications,
        ailmentsTreated: keyIndications,
        actionMechanism: 'Deep cellular rejuvenation and Dhatu nourishment.',
        doshaEffect: 'Tridosha Samana (Balances Vata, Pitta, Kapha)',
      },
      dosageAndAnupana: {
        standardDosage: getVal(dosageIdx).trim() || '1 to 2 teaspoonful twice daily',
        bestTiming: getVal(timingIdx).trim() || 'After meals or as advised by physician',
        anupanaCarrier: getVal(anupanaIdx).trim() || 'Warm Water or Milk',
        duration: '4 to 6 weeks',
      },
      precautionsAndContraindications,
      storageGuideline: 'Keep bottle tightly sealed in a dry cool place away from direct sunlight.',
      ayushLicenseNo: 'AYUSH-GMP-2024-CL',
      batchInfo: `BATCH-${new Date().getFullYear()}-${rowIdx + 101}`,
    };

    products.push(product);
  });

  return { products, warnings };
}

/**
 * Parses and verifies an uploaded file (either JSON or CSV).
 * Distinguishes between Full Site Backup, Products Array, or CSV table.
 */
export async function parseUploadedDataFile(file: File): Promise<ParsedImportResult> {
  const fileName = file.name.toLowerCase();
  const rawText = await file.text();

  if (fileName.endsWith('.csv') || file.type === 'text/csv') {
    try {
      const rows = parseCsvRows(rawText);
      const { products, warnings } = convertCsvRowsToProducts(rows);

      return {
        isValid: products.length > 0,
        fileType: 'csv',
        isFullBackup: false,
        detectedScopes: {
          products: products.length > 0,
          categories: false,
          forms: false,
          siteSettings: false,
        },
        counts: {
          products: products.length,
          categories: 0,
          forms: 0,
        },
        products,
        warnings,
      };
    } catch (e: any) {
      return {
        isValid: false,
        fileType: 'csv',
        error: `Could not parse CSV: ${e?.message || 'Invalid format'}`,
        detectedScopes: { products: false, categories: false, forms: false, siteSettings: false },
        counts: { products: 0, categories: 0, forms: 0 },
      };
    }
  }

  // Treat as JSON
  try {
    const parsed = JSON.parse(rawText);

    // Case 1: Full Site Backup JSON
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.scopes || parsed.products || parsed.siteSettings || parsed.categories)) {
      const hasProducts = Array.isArray(parsed.products) && parsed.products.length > 0;
      const hasCategories = Array.isArray(parsed.categories) && parsed.categories.length > 0;
      const hasForms = Array.isArray(parsed.forms) && parsed.forms.length > 0;
      const hasSiteSettings = Boolean(parsed.siteSettings && typeof parsed.siteSettings === 'object');

      return {
        isValid: hasProducts || hasCategories || hasForms || hasSiteSettings,
        fileType: 'json',
        isFullBackup: true,
        detectedScopes: {
          products: hasProducts,
          categories: hasCategories,
          forms: hasForms,
          siteSettings: hasSiteSettings,
        },
        counts: {
          products: hasProducts ? parsed.products.length : 0,
          categories: hasCategories ? parsed.categories.length : 0,
          forms: hasForms ? parsed.forms.length : 0,
        },
        products: hasProducts ? parsed.products : undefined,
        categories: hasCategories ? parsed.categories : undefined,
        forms: hasForms ? parsed.forms : undefined,
        siteSettings: hasSiteSettings ? parsed.siteSettings : undefined,
      };
    }

    // Case 2: Array of Products JSON
    if (Array.isArray(parsed)) {
      const validProducts: HerbalProduct[] = [];
      parsed.forEach((item, idx) => {
        if (item && typeof item === 'object' && (item.name || item.id)) {
          // Normalize minimally
          validProducts.push({
            id: item.id || `herbal-item-${idx + 1}-${Date.now().toString(36)}`,
            name: item.name || `Herbal Product ${idx + 1}`,
            sanskritName: item.sanskritName || item.name || '',
            category: item.category || 'classical_churna',
            categoryLabel: item.categoryLabel || 'Classical Churna',
            form: item.form || 'Churna',
            tagline: item.tagline || 'Ayurvedic Botanical Remedy',
            description: item.description || '',
            price: Number(item.price) || 299,
            mrp: Number(item.mrp) || 399,
            resellerPrice: item.resellerPrice !== undefined ? Number(item.resellerPrice) : undefined,
            volumeOrWeight: item.volumeOrWeight || '100 gm',
            rating: Number(item.rating) || 4.9,
            reviewsCount: Number(item.reviewsCount) || 120,
            inStock: item.inStock !== undefined ? Boolean(item.inStock) : true,
            image: item.image || 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
            images: Array.isArray(item.images) ? item.images : undefined,
            sortBadge: item.sortBadge || 'none',
            keyIndications: Array.isArray(item.keyIndications) ? item.keyIndications : ['Wellness'],
            keyIngredients: Array.isArray(item.keyIngredients) ? item.keyIngredients : [],
            detailedUses: item.detailedUses || {
              primaryBenefits: ['General Wellness'],
              ailmentsTreated: ['Fatigue'],
              actionMechanism: 'Holistic rejuvenation',
              doshaEffect: 'Tridosha Samana',
            },
            dosageAndAnupana: item.dosageAndAnupana || {
              standardDosage: '1-2 tablets twice daily',
              bestTiming: 'After meals',
              anupanaCarrier: 'Warm water',
              duration: '30 days',
            },
            precautionsAndContraindications: Array.isArray(item.precautionsAndContraindications) ? item.precautionsAndContraindications : [],
            storageGuideline: item.storageGuideline || 'Store in a cool dry place',
            ayushLicenseNo: item.ayushLicenseNo || 'AYUSH-GMP-2024',
            batchInfo: item.batchInfo || 'BATCH-2024',
            ...item,
          });
        }
      });

      return {
        isValid: validProducts.length > 0,
        fileType: 'json',
        isFullBackup: false,
        detectedScopes: {
          products: validProducts.length > 0,
          categories: false,
          forms: false,
          siteSettings: false,
        },
        counts: {
          products: validProducts.length,
          categories: 0,
          forms: 0,
        },
        products: validProducts,
      };
    }

    // Case 3: Single Product JSON
    if (parsed && typeof parsed === 'object' && parsed.name) {
      return {
        isValid: true,
        fileType: 'json',
        isFullBackup: false,
        detectedScopes: {
          products: true,
          categories: false,
          forms: false,
          siteSettings: false,
        },
        counts: {
          products: 1,
          categories: 0,
          forms: 0,
        },
        products: [parsed as HerbalProduct],
      };
    }

    return {
      isValid: false,
      fileType: 'json',
      error: 'Unrecognized JSON structure. Expected a Product array, a single Product, or a Full Site Backup.',
      detectedScopes: { products: false, categories: false, forms: false, siteSettings: false },
      counts: { products: 0, categories: 0, forms: 0 },
    };
  } catch (e: any) {
    return {
      isValid: false,
      fileType: 'unknown',
      error: `Could not parse file: ${e?.message || 'Invalid format'}`,
      detectedScopes: { products: false, categories: false, forms: false, siteSettings: false },
      counts: { products: 0, categories: 0, forms: 0 },
    };
  }
}

/**
 * Generates sample CSV template for quick user testing
 */
export function generateSampleProductCsv(): string {
  const sampleProducts: HerbalProduct[] = [
    {
      id: 'ashwagandha-churna-sample',
      name: 'Ashwagandha Lehyam Gold',
      sanskritName: 'Withania Somnifera Rasayana',
      category: 'herbal_avaleha',
      categoryLabel: 'Herbal Avaleha & Pastes',
      form: 'Avaleha / Paste',
      price: 349,
      mrp: 449,
      resellerPrice: 240,
      volumeOrWeight: '250 gm',
      inStock: true,
      rating: 4.9,
      reviewsCount: 312,
      sortBadge: 'top_seller',
      tagline: 'Vitality, Stress Relief & Deep Sleep Classical Rasayana',
      description: 'Handcrafted with wild Nagori Ashwagandha roots, pure cow ghee, and raw forest honey for vigor and nerve rejuvenation.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoType: 'youtube',
      brand: 'Shree Ayur Pharma',
      sellerName: 'Vaidya Shala',
      ayushLicenseNo: 'AYUSH-2024-GMP-99',
      batchInfo: 'BATCH-GOLD-2024',
      storageGuideline: 'Store in a cool dry place away from moisture.',
      customLink: 'ashwagandha-gold',
      keyIndications: ['Stress & Insomnia', 'Chronic Fatigue', 'Ojas Enhancement'],
      keyIngredients: [
        { herb: 'Nagori Ashwagandha', botanicalName: 'Withania somnifera', potencyOrMg: '15%', role: 'Rasayana' },
        { herb: 'Shuddha Ghruta', botanicalName: 'Cow Ghee', potencyOrMg: '10%', role: 'Anupana Carrier' }
      ],
      detailedUses: {
        primaryBenefits: ['Strength & Stamina', 'Nerve Tonic'],
        ailmentsTreated: ['Anidra (Insomnia)', 'Dourbalya (Debility)'],
        actionMechanism: 'Modulates cortisol, enhances GABAergic transmission.',
        doshaEffect: 'Pacifies Vata and Kapha',
      },
      dosageAndAnupana: {
        standardDosage: '1 teaspoonful (5-10 gm)',
        bestTiming: 'At bedtime',
        anupanaCarrier: 'Warm Cow Milk',
        duration: '60 days',
      },
      precautionsAndContraindications: ['Not recommended during high acute fever without physician guidance.'],
    },
    {
      id: 'triphala-churna-sample',
      name: 'Maha Triphala Churna Premium',
      sanskritName: 'Amalaki, Haritaki & Bibhitaki Yoga',
      category: 'classical_churna',
      categoryLabel: 'Classical Churna & Powders',
      form: 'Churna',
      price: 199,
      mrp: 260,
      resellerPrice: 130,
      volumeOrWeight: '100 gm',
      inStock: true,
      rating: 4.8,
      reviewsCount: 540,
      sortBadge: 'trending',
      tagline: 'Gentle Colon Cleanse, Agni Deepana & Eye Care',
      description: 'Equal ratio blend of sun-dried Himalayan Amalaki, Haritaki, and Bibhitaki micro-pulverized for optimal gut absorption.',
      image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: '',
      videoType: 'none',
      brand: 'Shree Ayur Pharma',
      sellerName: 'Vaidya Shala',
      ayushLicenseNo: 'AYUSH-2024-GMP-102',
      batchInfo: 'BATCH-TRIPH-2024',
      storageGuideline: 'Keep jar tightly closed.',
      customLink: 'maha-triphala-churna',
      keyIndications: ['Constipation & Gas', 'Digestion (Agni Deepana)', 'Vision Support (Chakshushya)'],
      keyIngredients: [
        { herb: 'Amalaki', botanicalName: 'Phyllanthus emblica', potencyOrMg: '33.3%', role: 'Pitta Shamaka' },
        { herb: 'Haritaki', botanicalName: 'Terminalia chebula', potencyOrMg: '33.3%', role: 'Anulomana' },
        { herb: 'Bibhitaki', botanicalName: 'Terminalia bellirica', potencyOrMg: '33.3%', role: 'Kapha Shamaka' }
      ],
      detailedUses: {
        primaryBenefits: ['Bowel Regularity', 'Metabolic Detox'],
        ailmentsTreated: ['Vibandha', 'Ajeerna'],
        actionMechanism: 'Stimulates bile secretion and peristalsis.',
        doshaEffect: 'Tridoshic Balancer',
      },
      dosageAndAnupana: {
        standardDosage: '3 to 5 gm with warm water',
        bestTiming: 'At night before retiring',
        anupanaCarrier: 'Lukewarm Water',
        duration: 'Daily for 3 months',
      },
      precautionsAndContraindications: ['Reduce dose if loose stool occurs.'],
    }
  ];

  const headers = [
    'id',
    'name',
    'sanskritName',
    'category',
    'categoryLabel',
    'form',
    'price',
    'mrp',
    'resellerPrice',
    'volumeOrWeight',
    'inStock',
    'rating',
    'reviewsCount',
    'sortBadge',
    'tagline',
    'description',
    'image',
    'images',
    'videoUrl',
    'videoType',
    'brand',
    'sellerName',
    'ayushLicenseNo',
    'batchInfo',
    'storageGuideline',
    'customLink',
    'keyIndications',
    'keyIngredients',
    'standardDosage',
    'bestTiming',
    'anupanaCarrier',
    'precautions',
    'isDraft'
  ];

  const rows: string[] = [headers.join(',')];
  sampleProducts.forEach((p) => {
    const galleryString = p.images?.join(' | ') || '';
    const indicationsString = p.keyIndications.join(' | ');
    const ingredientsString = p.keyIngredients
      .map((ing) => `${ing.herb} (${ing.botanicalName}) - ${ing.potencyOrMg} [${ing.role}]`)
      .join(' | ');
    const precautionsString = p.precautionsAndContraindications.join(' | ');

    rows.push([
      escapeCsvValue(p.id),
      escapeCsvValue(p.name),
      escapeCsvValue(p.sanskritName),
      escapeCsvValue(p.category),
      escapeCsvValue(p.categoryLabel),
      escapeCsvValue(p.form),
      escapeCsvValue(p.price),
      escapeCsvValue(p.mrp),
      escapeCsvValue(p.resellerPrice ?? ''),
      escapeCsvValue(p.volumeOrWeight),
      escapeCsvValue(p.inStock),
      escapeCsvValue(p.rating),
      escapeCsvValue(p.reviewsCount),
      escapeCsvValue(p.sortBadge ?? 'none'),
      escapeCsvValue(p.tagline),
      escapeCsvValue(p.description),
      escapeCsvValue(p.image),
      escapeCsvValue(galleryString),
      escapeCsvValue(p.videoUrl ?? ''),
      escapeCsvValue(p.videoType ?? 'none'),
      escapeCsvValue(p.brand ?? ''),
      escapeCsvValue(p.sellerName ?? ''),
      escapeCsvValue(p.ayushLicenseNo ?? ''),
      escapeCsvValue(p.batchInfo ?? ''),
      escapeCsvValue(p.storageGuideline ?? ''),
      escapeCsvValue(p.customLink ?? ''),
      escapeCsvValue(indicationsString),
      escapeCsvValue(ingredientsString),
      escapeCsvValue(p.dosageAndAnupana.standardDosage),
      escapeCsvValue(p.dosageAndAnupana.bestTiming),
      escapeCsvValue(p.dosageAndAnupana.anupanaCarrier),
      escapeCsvValue(precautionsString),
      escapeCsvValue(false)
    ].join(','));
  });

  return rows.join('\r\n');
}
