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
import { FrontContactBar } from './components/FrontContactBar';
import { ProductDashboard } from './components/ProductDashboard';
import { DosageGuideSection } from './components/DosageGuideSection';
import { ContactSection } from './components/ContactSection';
import { ProductDetailModal } from './components/ProductDetailModal';
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
  fetchCatalogMetaFromFirebase
} from './utils/firebaseSync';
import { Shield, Settings, Sparkles } from 'lucide-react';

const PRODUCTS_STORAGE_KEY = 'aurashka_catalog_products';
const SITE_SETTINGS_STORAGE_KEY = 'aurashka_site_settings';
const CATEGORIES_STORAGE_KEY = 'aurashka_categories';
const FORMS_STORAGE_KEY = 'aurashka_forms';

function PharmacyApp() {
  const { currentUser, isAdmin } = useAuth();

  // Site Settings state (Titles, Multiple Contacts, Timings, Banners)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.brandName) return parsed;
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

  // Sync products, site settings, categories & forms from Firebase Realtime Database on initial mount
  useEffect(() => {
    const fetchRemoteData = async () => {
      // 1. Fetch site settings & multiple contacts
      try {
        const remoteSettings = await fetchSiteSettingsFromFirebase();
        if (remoteSettings) {
          setSiteSettings(remoteSettings);
          localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(remoteSettings));
        } else {
          // If empty in Firebase, back up default site settings
          backupSiteSettingsToFirebase(DEFAULT_SITE_SETTINGS);
        }
      } catch (err) {
        console.warn('Firebase RTDB site settings load note:', err);
      }

      // 2. Fetch categories & forms
      try {
        const meta = await fetchCatalogMetaFromFirebase();
        if (meta) {
          if (Array.isArray(meta.categories) && meta.categories.length > 0) {
            setCategories(meta.categories);
            localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(meta.categories));
          }
          if (Array.isArray(meta.forms) && meta.forms.length > 0) {
            setForms(meta.forms);
            localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(meta.forms));
          }
        } else {
          backupCatalogMetaToFirebase({ categories: DEFAULT_CATEGORIES, forms: DEFAULT_FORMS });
        }
      } catch (err) {
        console.warn('Firebase RTDB catalog meta load note:', err);
      }

      // 3. Fetch products
      try {
        const res = await fetch(`${firebaseConfig.databaseURL}/products.json`);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            const list: HerbalProduct[] = Object.values(data);
            if (list.length > 0) {
              setProducts(list);
              localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Firebase RTDB products load note:', err);
      }

      // If empty in Firebase, back up the initial default catalog
      backupAllCatalogToFirebase(HERBAL_PRODUCTS);
    };

    fetchRemoteData();
  }, []);

  const saveProducts = (updated: HerbalProduct[]) => {
    setProducts(updated);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSiteSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    try {
      localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
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

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
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
        {/* Hero Section with Minimalist Atmosphere & Deal Spotlight */}
        <HeroSection
          onOpenConsultationModal={() => handleOpenConsultationModal()}
          onExploreProducts={() => handleNavigateSection('deals-catalog')}
          onSelectProduct={(p) => setSelectedProductForDetail(p)}
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

        {/* Front-Row Direct Contact & Patient Helpline Ribbon */}
        <FrontContactBar
          onOpenConsultationModal={() => handleOpenConsultationModal()}
          onScrollToContact={() => handleNavigateSection('contact-us')}
          siteSettings={siteSettings}
        />

        {/* Product Dashboard with Categories, Forms, Sort Focus & Admin Controls */}
        <ProductDashboard
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onOpenProductDetail={(prod) => setSelectedProductForDetail(prod)}
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

        {/* Detailed Uses, Pharmacopoeia & Anupana Science Guide */}
        <DosageGuideSection
          onOpenProductDetail={(prod) => setSelectedProductForDetail(prod)}
          onOpenConsultationModal={() => handleOpenConsultationModal()}
        />

        {/* Front Contact Section with Multiple Phones, Emails, WhatsApps, Physical Address */}
        <ContactSection
          onOpenConsultationModal={() => handleOpenConsultationModal()}
          siteSettings={siteSettings}
        />
      </main>

      {/* Apothecary Monograph / Detailed Uses Modal with Multiple Images Gallery */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={handleAddToCart}
        isInCart={selectedProductForDetail ? cartProductIds.has(selectedProductForDetail.id) : false}
        siteSettings={siteSettings}
      />

      {/* Free Vaidya Dosage & Prescription Consultation Modal */}
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
          setSelectedProductForDetail(prod);
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
