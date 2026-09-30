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
      if (data && typeof data === 'object' && data.brandName) {
        return data as SiteSettings;
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
      if (data && Array.isArray(data.categories) && Array.isArray(data.forms)) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Firebase RTDB catalog meta fetch notice:', e);
  }
  return null;
};
