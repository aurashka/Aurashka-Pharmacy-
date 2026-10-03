import { HerbalProduct, SiteSettings } from '../types/pharmacy';
import { firebaseConfig } from '../firebase';

/**
 * Backup an individual product to Firebase Realtime Database
 */
export const backupProductToFirebase = async (product: HerbalProduct): Promise<boolean> => {
  const safeId = product.id.replace(/[.#$[\]/]/g, '_');

  try {
    const res = await fetch(`${firebaseConfig.databaseURL}/products/${safeId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.ok;
  } catch (error) {
    console.error(`Failed to backup product ${product.id} to Firebase:`, error);
    return false;
  }
};

/**
 * Backup the entire catalog of products, images, and text to Firebase
 */
export const backupAllCatalogToFirebase = async (products: HerbalProduct[]): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> => {
  try {
    // Convert array to dictionary keyed by product ID
    const dictionary: Record<string, HerbalProduct> = {};
    products.forEach((p) => {
      const safeId = p.id.replace(/[.#$[\]/]/g, '_');
      dictionary[safeId] = p;
    });

    // 1. Bulk write to Firebase RTDB /products.json
    const res = await fetch(`${firebaseConfig.databaseURL}/products.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dictionary),
    });

    // Also write a snapshot backup with timestamp
    try {
      await fetch(`${firebaseConfig.databaseURL}/backup_catalog_latest.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedAt: new Date().toISOString(),
          totalProducts: products.length,
          products: dictionary,
        }),
      });
    } catch {}

    if (res.ok) {
      return { success: true, count: products.length };
    } else {
      return { success: false, count: 0, error: 'Firebase RTDB returned non-OK status' };
    }
  } catch (e: any) {
    console.error('Failed to backup all products to Firebase:', e);
    return { success: false, count: 0, error: e.message || 'Network error' };
  }
};

/**
 * Delete product from Firebase Realtime Database
 */
export const deleteProductFromFirebase = async (productId: string): Promise<boolean> => {
  const safeId = productId.replace(/[.#$[\]/]/g, '_');

  try {
    const res = await fetch(`${firebaseConfig.databaseURL}/products/${safeId}.json`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete product from Firebase:', e);
    return false;
  }
};

/**
 * Backup Website Settings & Multiple Contacts to Firebase
 */
export const backupSiteSettingsToFirebase = async (settings: SiteSettings): Promise<boolean> => {
  try {
    const res = await fetch(`${firebaseConfig.databaseURL}/site_settings.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to backup site settings to Firebase:', e);
    return false;
  }
};

/**
 * Fetch Website Settings & Contacts from Firebase
 */
export const fetchSiteSettingsFromFirebase = async (): Promise<SiteSettings | null> => {
  try {
    const res = await fetch(`${firebaseConfig.databaseURL}/site_settings.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && (data.brandName || data.heroTitle || data.contacts)) {
        // Normalize any object-shaped arrays from Firebase RTDB
        const phones = Array.isArray(data.contacts?.phones)
          ? data.contacts.phones
          : (data.contacts?.phones && typeof data.contacts.phones === 'object'
            ? Object.values(data.contacts.phones)
            : undefined);

        const whatsapps = Array.isArray(data.contacts?.whatsapps)
          ? data.contacts.whatsapps
          : (data.contacts?.whatsapps && typeof data.contacts.whatsapps === 'object'
            ? Object.values(data.contacts.whatsapps)
            : undefined);

        const emails = Array.isArray(data.contacts?.emails)
          ? data.contacts.emails
          : (data.contacts?.emails && typeof data.contacts.emails === 'object'
            ? Object.values(data.contacts.emails)
            : undefined);

        const peopleList = Array.isArray(data.peopleList)
          ? data.peopleList
          : (data.peopleList && typeof data.peopleList === 'object'
            ? Object.values(data.peopleList)
            : undefined);

        return {
          ...data,
          contacts: {
            ...data.contacts,
            ...(phones ? { phones } : {}),
            ...(whatsapps ? { whatsapps } : {}),
            ...(emails ? { emails } : {}),
          },
          ...(peopleList ? { peopleList } : {}),
        } as SiteSettings;
      }
    }
  } catch (e) {
    console.warn('Firebase RTDB site settings fetch notice:', e);
  }
  return null;
};

/**
 * Backup dynamic Categories & Forms to Firebase
 */
export const backupCatalogMetaToFirebase = async (meta: {
  categories: { id: string; label: string }[];
  forms: string[];
}): Promise<boolean> => {
  try {
    const res = await fetch(`${firebaseConfig.databaseURL}/catalog_meta.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meta),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to backup catalog meta to Firebase:', e);
    return false;
  }
};

/**
 * Fetch dynamic Categories & Forms from Firebase
 */
export const fetchCatalogMetaFromFirebase = async (): Promise<{
  categories: { id: string; label: string }[];
  forms: string[];
} | null> => {
  try {
    const res = await fetch(`${firebaseConfig.databaseURL}/catalog_meta.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const rawCats = data.categories;
        const rawForms = data.forms;
        const categories = Array.isArray(rawCats)
          ? rawCats
          : (rawCats && typeof rawCats === 'object' ? Object.values(rawCats) : null);
        const forms = Array.isArray(rawForms)
          ? rawForms
          : (rawForms && typeof rawForms === 'object' ? Object.values(rawForms) : null);

        if (categories && forms) {
          return { categories: categories as any[], forms: forms as any[] };
        }
      }
    }
  } catch (e) {
    console.warn('Firebase RTDB catalog meta fetch notice:', e);
  }
  return null;
};

/**
 * Fetch all products from Firebase Realtime Database
 */
export const fetchProductsFromFirebase = async (): Promise<HerbalProduct[] | null> => {
  try {
    const res = await fetch(`${firebaseConfig.databaseURL}/products.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const list: HerbalProduct[] = Object.values(data);
        if (list.length > 0) {
          return list;
        }
      }
    }
  } catch (e) {
    console.warn('Firebase RTDB products fetch notice:', e);
  }
  return null;
};

/**
 * Auto-initialize / seed Firebase Realtime Database if null or empty.
 * If data exists in Firebase, it gets and returns it. If null, auto-creates it.
 */
export const getOrAutoSeedFirebaseData = async (
  defaultSettings: SiteSettings,
  defaultCategories: { id: string; label: string }[],
  defaultForms: string[],
  defaultProducts: HerbalProduct[]
): Promise<{
  settings: SiteSettings;
  categories: { id: string; label: string }[];
  forms: string[];
  products: HerbalProduct[];
}> => {
  // 1. Site Settings & Contacts
  let settings = await fetchSiteSettingsFromFirebase();
  if (!settings) {
    console.info('Firebase site_settings is null -> Auto-creating default site settings in Firebase RTDB');
    await backupSiteSettingsToFirebase(defaultSettings);
    settings = defaultSettings;
  }

  // 2. Categories & Forms
  let meta = await fetchCatalogMetaFromFirebase();
  let categories = defaultCategories;
  let forms = defaultForms;
  if (!meta || !Array.isArray(meta.categories) || meta.categories.length === 0) {
    console.info('Firebase catalog_meta is null -> Auto-creating default categories & forms in Firebase RTDB');
    await backupCatalogMetaToFirebase({ categories: defaultCategories, forms: defaultForms });
  } else {
    categories = meta.categories;
    forms = meta.forms;
  }

  // 3. Products
  let products = await fetchProductsFromFirebase();
  if (!products || products.length === 0) {
    console.info('Firebase products is null -> Auto-creating default product catalog in Firebase RTDB');
    await backupAllCatalogToFirebase(defaultProducts);
    products = defaultProducts;
  }

  return { settings, categories, forms, products };
};
