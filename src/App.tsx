/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { HERBAL_PRODUCTS, DEFAULT_SITE_SETTINGS, DEFAULT_CATEGORIES, DEFAULT_FORMS } from './data/herbalProducts';
import { HerbalProduct, ProductCategory, SiteSettings, CategoryItem } from './types/pharmacy';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductDashboard } from './components/ProductDashboard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ContactPage } from './components/ContactPage';
import { PeopleSection } from './components/PeopleSection';
import { ConsultationModal } from './components/ConsultationModal';
import { InquiryCartDrawer, CartItem } from './components/InquiryCartDrawer';
import { FloatingContactWidget } from './components/FloatingContactWidget';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Footer } from './components/Footer';
import { firebaseConfig } from './firebase';
import { 
  backupProductToFirebase, 
  backupAllCatalogToFirebase, 
  deleteProductFromFirebase,
  backupSiteSettingsToFirebase,
  fetchSiteSettingsFromFirebase,
  backupCatalogMetaToFirebase,
  fetchCatalogMetaFromFirebase,
  getOrAutoSeedFirebaseData
} from './utils/firebaseSync';
import { Shield, Settings, Sparkles } from 'lucide-react';

const PRODUCTS_STORAGE_KEY = 'aurashka_catalog_products';
const SITE_SETTINGS_STORAGE_KEY = 'aurashka_site_settings';
const CATEGORIES_STORAGE_KEY = 'aurashka_categories';
const FORMS_STORAGE_KEY = 'aurashka_forms';

function normalizeSiteSettings(settings?: Partial<SiteSettings>): SiteSettings {
  const s = settings || {};
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...s,
    brandLogoImage: s.brandLogoImage !== undefined ? s.brandLogoImage : DEFAULT_SITE_SETTINGS.brandLogoImage,
    showBrandLogo: s.showBrandLogo !== undefined ? s.showBrandLogo : DEFAULT_SITE_SETTINGS.showBrandLogo,
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
          ? (Object.values(s.weeklyDeals.items) as any[])
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
        ? (Object.values(s.peopleList) as any[])
        : (DEFAULT_SITE_SETTINGS.peopleList || [])),
    productAssuranceBadges: s.productAssuranceBadges || DEFAULT_SITE_SETTINGS.productAssuranceBadges,
    footerCopyrightText: s.footerCopyrightText || DEFAULT_SITE_SETTINGS.footerCopyrightText,
    footerBotanicalBadgeText: s.footerBotanicalBadgeText || DEFAULT_SITE_SETTINGS.footerBotanicalBadgeText,
  };
}

function PharmacyApp() {
  const { currentUser, isAdmin } = useAuth();

  // Site Settings state (Titles, Multiple Contacts, Timings, Banners)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return normalizeSiteSettings(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SITE_SETTINGS;
  });

  // Dynamic Categories state (Preset & Custom)
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Dynamic Formulation Forms state (Preset & Custom)
  const [forms, setForms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FORMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_FORMS;
  });

  // Products catalog state
  const [products, setProducts] = useState<HerbalProduct[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return HERBAL_PRODUCTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'home' | 'contact' | 'product'>('home');
  
  // Modals & Drawers state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<HerbalProduct | null>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationInitialProduct, setConsultationInitialProduct] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [productToEditInAdmin, setProductToEditInAdmin] = useState<HerbalProduct | null>(null);
  
  // Inquiry / Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Hash-based routing to support unique direct links (#product/code or #contact)
  useEffect(() => {
    const syncHashToView = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#product/')) {
        const slug = decodeURIComponent(hash.replace('#product/', '')).trim();
        const matched = products.find(
          (p) =>
            (p.customLink && p.customLink.toLowerCase() === slug.toLowerCase()) ||
            p.id.toLowerCase() === slug.toLowerCase() ||
            p.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
            p.name.toLowerCase() === slug.toLowerCase()
        );
        if (matched) {
          setSelectedProductForDetail(matched);
          setCurrentView('product');
          return;
        }
      } else if (hash === '#contact' || hash === '#contact-us') {
        setCurrentView('contact');
        setSelectedProductForDetail(null);
        return;
      } else {
        setCurrentView('home');
        setSelectedProductForDetail(null);
      }
    };

    syncHashToView();
    window.addEventListener('hashchange', syncHashToView);
    return () => window.removeEventListener('hashchange', syncHashToView);
  }, [products]);

  // Sync products, site settings, categories & forms from Firebase Realtime Database on initial mount
  // If remote is null, auto-create/seed Firebase with initial defaults
  useEffect(() => {
    const fetchRemoteData = async () => {
      try {
        const synced = await getOrAutoSeedFirebaseData(
          DEFAULT_SITE_SETTINGS,
          DEFAULT_CATEGORIES,
          DEFAULT_FORMS,
          HERBAL_PRODUCTS
        );

        if (synced.settings) {
          const normalized = normalizeSiteSettings(synced.settings);
          setSiteSettings(normalized);
          localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
        }

        if (Array.isArray(synced.categories) && synced.categories.length > 0) {
          setCategories(synced.categories);
          localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(synced.categories));
        }

        if (Array.isArray(synced.forms) && synced.forms.length > 0) {
          setForms(synced.forms);
          localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(synced.forms));
        }

        if (Array.isArray(synced.products) && synced.products.length > 0) {
          setProducts(synced.products);
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(synced.products));
        }
      } catch (err) {
        console.warn('Firebase RTDB data sync note:', err);
      }
    };

    fetchRemoteData();
  }, []);

  // Dynamically sync Document Title, Favicon and OpenGraph/Twitter meta tags with siteSettings (Brand Name & Logo)
  useEffect(() => {
    const brand = siteSettings?.brandName || 'Aurashka';
    document.title = `${brand} - Classical Herbal Pharmacy & Ayurvedic Formulations`;

    const logo = siteSettings?.brandLogoImage || 'https://i.ibb.co/cKMZvJyJ/IMG-9291.jpg';
    let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    iconLink.href = logo;

    // Dynamically update OpenGraph and Twitter tags for web browser preview
    const updateMeta = (nameOrProp: string, content: string, isName = false) => {
      let meta = document.querySelector(isName ? `meta[name="${nameOrProp}"]` : `meta[property="${nameOrProp}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        if (isName) meta.name = nameOrProp;
        else meta.setAttribute('property', nameOrProp);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateMeta('og:title', `${brand} - Classical Herbal Pharmacy & Ayurvedic Formulations`);
    updateMeta('og:image', logo);
    updateMeta('twitter:title', `${brand} - Classical Herbal Pharmacy & Ayurvedic Formulations`, true);
    updateMeta('twitter:image', logo, true);
  }, [siteSettings?.brandName, siteSettings?.brandLogoImage]);

  const saveProducts = (updated: HerbalProduct[]) => {
    setProducts(updated);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSiteSettings = async (newSettings: SiteSettings) => {
    const normalized = normalizeSiteSettings(newSettings);
    setSiteSettings(normalized);
    try {
      localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
      await backupSiteSettingsToFirebase(normalized);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCategories = async (newCategories: CategoryItem[]) => {
    setCategories(newCategories);
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(newCategories));
      await backupCatalogMetaToFirebase({ categories: newCategories, forms });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateForms = async (newForms: string[]) => {
    setForms(newForms);
    try {
      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(newForms));
      await backupCatalogMetaToFirebase({ categories, forms: newForms });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (newProduct: HerbalProduct) => {
    const updated = [newProduct, ...products];
    saveProducts(updated);
    await backupProductToFirebase(newProduct);
  };

  const handleUpdateProduct = async (updatedProduct: HerbalProduct) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    saveProducts(updated);
    await backupProductToFirebase(updatedProduct);
  };

  const handleDeleteProduct = async (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    saveProducts(updated);

    // Remove from cart if present
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    await deleteProductFromFirebase(productId);
  };

  const handleResetProductsToDefault = async () => {
    saveProducts(HERBAL_PRODUCTS);
    await backupAllCatalogToFirebase(HERBAL_PRODUCTS);
  };

  const cartProductIds = useMemo(() => {
    return new Set(cartItems.map((item) => item.product.id));
  }, [cartItems]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const handleAddToCart = (product: HerbalProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOpenConsultationModal = (productName?: string) => {
    setConsultationInitialProduct(productName || '');
    setIsConsultationModalOpen(true);
  };

  const handleSelectProduct = (p: HerbalProduct) => {
    setSelectedProductForDetail(p);
    setCurrentView('product');
    const slug = p.customLink || p.id;
    window.location.hash = `#product/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToContact = () => {
    setSelectedProductForDetail(null);
    setCurrentView('contact');
    window.location.hash = '#contact';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedProductForDetail(null);
    setCurrentView('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'contact-us') {
      handleNavigateToContact();
      return;
    }

    if (currentView !== 'home') {
      handleBackToHome();
    }

    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E2922] flex flex-col font-sans">
      {/* 3-Zone Navigation Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenConsultationModal={() => handleOpenConsultationModal()}
        onNavigateSection={handleNavigateSection}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAdminPanel={() => {
          setProductToEditInAdmin(null);
          setIsAdminPanelOpen(true);
        }}
        siteSettings={siteSettings}
      />

      {/* FOR USER ROLE 'ADMIN': PROMINENT ADMIN ACCESS BAR ON MAIN PAGE (TOP) */}
      {isAdmin && (
        <aside aria-label="Admin Control Bar" className="bg-[#B4741E] text-white px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-[#8C5712] relative z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-[11px]">
              Admin Active: {currentUser?.email}
            </span>
            <span className="hidden sm:inline text-white/90">
              · Full Control: Manage Categories & Forms, Reseller Pricing, Rating Stars, Images & Multiple Contacts.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setProductToEditInAdmin(null);
                setIsAdminPanelOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-300" />
              <span>Launch Admin App</span>
            </button>
          </div>
        </aside>
      )}

      {/* FLOATING ADMIN ACCESS BUTTON ON MAIN PAGE FRONT (Only for role: admin) */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => {
              setProductToEditInAdmin(null);
              setIsAdminPanelOpen(true);
            }}
            className="px-4 py-2.5 bg-[#B4741E] hover:bg-[#975f15] text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 border-2 border-amber-300 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Admin Mode Active: Click to Open Admin App"
          >
            <Shield className="w-4 h-4 text-amber-200" />
            <span>ADMIN ACCESS PANEL</span>
          </button>
        </div>
      )}

      <main className="flex-1">
        {currentView === 'contact' ? (
          /* Dedicated Contact Page */
          <ContactPage
            siteSettings={siteSettings}
            onBack={handleBackToHome}
            onOpenConsultationModal={() => handleOpenConsultationModal()}
          />
        ) : currentView === 'product' && selectedProductForDetail ? (
          /* Full Page Product Monograph & Unique Link View */
          <ProductDetailPage
            product={selectedProductForDetail}
            onBack={handleBackToHome}
            onAddToCart={handleAddToCart}
            isInCart={cartProductIds.has(selectedProductForDetail.id)}
            siteSettings={siteSettings}
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            onOpenConsultationModal={handleOpenConsultationModal}
            isAdmin={isAdmin}
            onUpdateProduct={handleUpdateProduct}
            onUpdateSiteSettings={handleUpdateSiteSettings}
            onOpenAdminPanel={() => {
              setProductToEditInAdmin(selectedProductForDetail);
              setIsAdminPanelOpen(true);
            }}
          />
        ) : (
          /* Main Storefront Catalog Page */
          <>
            {/* Hero Section with Minimalist Atmosphere & Deal Spotlight */}
            <HeroSection
              onOpenConsultationModal={() => handleOpenConsultationModal()}
              onExploreProducts={() => handleNavigateSection('deals-catalog')}
              onSelectProduct={handleSelectProduct}
              isAdmin={isAdmin}
              onOpenAdminPanel={() => {
                setProductToEditInAdmin(null);
                setIsAdminPanelOpen(true);
              }}
              siteSettings={siteSettings}
              featuredDeal={products[0]}
              products={products}
              onAddToCart={handleAddToCart}
              cartProductIds={cartProductIds}
            />

            {/* Product Dashboard with Categories, Forms, Sort Focus & Admin Controls */}
            <ProductDashboard
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
              onOpenProductDetail={handleSelectProduct}
              onAddToCart={handleAddToCart}
              cartProductIds={cartProductIds}
              isAdmin={isAdmin}
              onOpenAdminPanel={() => {
                setProductToEditInAdmin(null);
                setIsAdminPanelOpen(true);
              }}
              onEditProduct={(prod) => {
                setProductToEditInAdmin(prod);
                setIsAdminPanelOpen(true);
              }}
              categories={categories}
              forms={forms}
              siteSettings={siteSettings}
            />

            {/* Doctors & Key People Section with Round Images and Text */}
            <PeopleSection
              siteSettings={siteSettings}
              onOpenConsultationModal={(doctorName) => handleOpenConsultationModal(doctorName)}
              isAdmin={isAdmin}
              onOpenAdminPanel={() => {
                setProductToEditInAdmin(null);
                setIsAdminPanelOpen(true);
              }}
            />
          </>
        )}
      </main>

      {/* Free Doctor Dosage & Prescription Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        initialProduct={consultationInitialProduct}
        siteSettings={siteSettings}
      />

      {/* Dispensary Order / Consultation List Drawer */}
      <InquiryCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenProductDetail={(prod) => {
          setIsCartOpen(false);
          handleSelectProduct(prod);
        }}
        siteSettings={siteSettings}
      />

      {/* Comprehensive Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => {
          setIsAdminPanelOpen(false);
          setProductToEditInAdmin(null);
        }}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProductsToDefault={handleResetProductsToDefault}
        onPreviewProduct={(prod) => {
          setIsAdminPanelOpen(false);
          setSelectedProductForDetail(prod);
        }}
        initialProductToEdit={productToEditInAdmin}
        siteSettings={siteSettings}
        onUpdateSiteSettings={handleUpdateSiteSettings}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
        forms={forms}
        onUpdateForms={handleUpdateForms}
      />

      {/* Authentication Modal (Login & Signup with auto-close and immediate feedback) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Bottom Floating Quick-Contact Button (WhatsApp + Phone + Consult) */}
      <FloatingContactWidget
        onOpenConsultationModal={() => handleOpenConsultationModal()}
        siteSettings={siteSettings}
      />

      {/* Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenConsultationModal={() => handleOpenConsultationModal()}
        siteSettings={siteSettings}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PharmacyApp />
    </AuthProvider>
  );
}
