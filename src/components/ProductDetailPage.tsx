import React, { useState, useEffect } from 'react';
import { HerbalProduct, SiteSettings, ProductCustomField, IngredientItem, ProductVariant } from '../types/pharmacy';
import { ImageLightboxModal } from './ImageLightboxModal';
import { formatCompactNumber, formatPrice } from '../utils/numberFormatter';
import { 
  ArrowLeft, 
  MessageCircle, 
  ShoppingBag, 
  Check, 
  Share2, 
  Copy, 
  Star, 
  ShieldCheck, 
  Clock, 
  Leaf, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Layers,
  Edit3,
  X,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';
import { backupProductToFirebase, backupSiteSettingsToFirebase } from '../utils/firebaseSync';

interface ProductDetailPageProps {
  product: HerbalProduct;
  onBack: () => void;
  onAddToCart: (product: HerbalProduct) => void;
  isInCart?: boolean;
  siteSettings: SiteSettings;
  allProducts: HerbalProduct[];
  onSelectProduct: (product: HerbalProduct) => void;
  onOpenConsultationModal: (productName?: string) => void;
  isAdmin?: boolean;
  onUpdateProduct?: (product: HerbalProduct) => void;
  onUpdateSiteSettings?: (settings: SiteSettings) => void;
  onOpenAdminPanel?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  isInCart = false,
  siteSettings,
  allProducts,
  onSelectProduct,
  onOpenConsultationModal,
  isAdmin = false,
  onUpdateProduct,
  onUpdateSiteSettings,
  onOpenAdminPanel,
}) => {
  const { currentUser } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'indications' | 'ingredients' | 'dosage' | 'action' | 'precautions'>('indications');

  // Secret Quality Assurance Badges quick-edit state
  const [isSecretEditOpen, setIsSecretEditOpen] = useState(false);
  const [badge1Title, setBadge1Title] = useState(
    product.assuranceBadges?.badge1Title || siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified'
  );
  const [badge1Subtitle, setBadge1Subtitle] = useState(
    product.assuranceBadges?.badge1Subtitle || siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified'
  );
  const [badge2Title, setBadge2Title] = useState(
    product.assuranceBadges?.badge2Title || siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical'
  );
  const [badge2Subtitle, setBadge2Subtitle] = useState(
    product.assuranceBadges?.badge2Subtitle || siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers'
  );
  const [secretEditSuccess, setSecretEditSuccess] = useState<string | null>(null);

  // Sync badge state if product changes
  useEffect(() => {
    setBadge1Title(product.assuranceBadges?.badge1Title || siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified');
    setBadge1Subtitle(product.assuranceBadges?.badge1Subtitle || siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified');
    setBadge2Title(product.assuranceBadges?.badge2Title || siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical');
    setBadge2Subtitle(product.assuranceBadges?.badge2Subtitle || siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers');
  }, [product, siteSettings]);

  const handleSaveProductBadges = () => {
    const updatedProd: HerbalProduct = {
      ...product,
      assuranceBadges: {
        badge1Title: badge1Title.trim() || 'Ayush & GMP Certified',
        badge1Subtitle: badge1Subtitle.trim() || 'Heavy-metal lab verified',
        badge2Title: badge2Title.trim() || '100% Pure Botanical',
        badge2Subtitle: badge2Subtitle.trim() || 'Zero synthetic fillers',
      },
    };
    onUpdateProduct?.(updatedProd);
    backupProductToFirebase(updatedProd);
    setSecretEditSuccess('Saved for this product & synced to Firebase!');
    setTimeout(() => {
      setSecretEditSuccess(null);
      setIsSecretEditOpen(false);
    }, 1800);
  };

  const handleSaveSiteBadges = () => {
    const updatedSettings: SiteSettings = {
      ...siteSettings,
      productAssuranceBadges: {
        badge1Title: badge1Title.trim() || 'Ayush & GMP Certified',
        badge1Subtitle: badge1Subtitle.trim() || 'Heavy-metal lab verified',
        badge2Title: badge2Title.trim() || '100% Pure Botanical',
        badge2Subtitle: badge2Subtitle.trim() || 'Zero synthetic fillers',
      },
    };
    onUpdateSiteSettings?.(updatedSettings);
    backupSiteSettingsToFirebase(updatedSettings);
    setSecretEditSuccess('Saved as site-wide default for all products!');
    setTimeout(() => {
      setSecretEditSuccess(null);
      setIsSecretEditOpen(false);
    }, 1800);
  };

  // Variant Selection State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    return product.variants && product.variants.length > 0 ? product.variants[0] : null;
  });

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentImageIndex(0);
    setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
  }, [product.id, product.variants]);

  // Clean images list from product
  const imagesList: string[] = React.useMemo(() => {
    if (!product) return [];
    const rawImgs = product.images;
    const imgs = Array.isArray(rawImgs)
      ? rawImgs
      : (rawImgs && typeof rawImgs === 'object' ? Object.values(rawImgs) : []);

    const list: string[] = [];
    if (imgs.length > 0) {
      const valid = imgs.filter((img): img is string => typeof img === 'string' && img.trim().length > 0);
      list.push(...valid);
    } else if (product.image) {
      list.push(product.image);
    }

    // Include variant image or separate photos if variant has them
    if (selectedVariant?.images && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0) {
      const validVarImgs = selectedVariant.images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0);
      if (validVarImgs.length > 0) {
        return [...validVarImgs, ...list.filter(img => !validVarImgs.includes(img))];
      }
    } else if (selectedVariant?.image && !list.includes(selectedVariant.image)) {
      list.unshift(selectedVariant.image);
    }

    return list.length > 0 ? list : [product.image];
  }, [product, selectedVariant]);

  // Active pricing & stock status (considering selected variant)
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentMrp = selectedVariant?.mrp ?? product.mrp;
  const currentReseller = selectedVariant?.resellerPrice ?? product.resellerPrice;
  const isAvailableInStock = selectedVariant?.inStock !== undefined 
    ? selectedVariant.inStock 
    : (product.inStock !== false);
  const savings = currentMrp - currentPrice;
  const discountPercent = Math.round((savings / (currentMrp || 1)) * 100);

  const activeImage = imagesList[currentImageIndex] || selectedVariant?.image || product.image;

  // Defensive array extractions for product monograph
  const indicationsList: string[] = React.useMemo(() => {
    if (!product?.keyIndications) return [];
    if (Array.isArray(product.keyIndications)) return product.keyIndications;
    if (typeof product.keyIndications === 'string') {
      return (product.keyIndications as string).split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (typeof product.keyIndications === 'object') {
      return Object.values(product.keyIndications);
    }
    return [];
  }, [product?.keyIndications]);

  const benefitsList: string[] = React.useMemo(() => {
    const raw = product?.detailedUses?.primaryBenefits;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return Object.values(raw);
    return [];
  }, [product?.detailedUses?.primaryBenefits]);

  const ailmentsList: string[] = React.useMemo(() => {
    const raw = product?.detailedUses?.ailmentsTreated;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return Object.values(raw);
    return [];
  }, [product?.detailedUses?.ailmentsTreated]);

  const customFieldsList: ProductCustomField[] = React.useMemo(() => {
    const raw = product?.customFields;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return Object.values(raw);
    return [];
  }, [product?.customFields]);

  const ingredientsList: IngredientItem[] = React.useMemo(() => {
    const raw = product?.keyIngredients;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return Object.values(raw);
    return [];
  }, [product?.keyIngredients]);

  const precautionsList: string[] = React.useMemo(() => {
    const raw = product?.precautionsAndContraindications;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      return (raw as string).split('\n').map((s) => s.trim()).filter(Boolean);
    }
    if (typeof raw === 'object') return Object.values(raw);
    return [];
  }, [product?.precautionsAndContraindications]);

  // Generate unique direct link
  const productSlug = product.customLink || product.id;
  const directUrl = `${window.location.origin}${window.location.pathname}#product/${productSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppOrder = () => {
    const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);
    const template = siteSettings.messageTemplates?.productInquiryWhatsApp || DEFAULT_MESSAGE_TEMPLATES.productInquiryWhatsApp;
    const includeUserInfo = siteSettings.messageTemplates?.includeUserInfo ?? true;

    const resellerInfo = currentReseller
      ? ` (Reseller Rate: ₹${currentReseller})`
      : '';

    const variantLabel = selectedVariant ? ` [Size: ${selectedVariant.size} ${selectedVariant.unit}]` : '';

    const formatted = formatCustomMessage(
      template,
      {
        brandName: siteSettings.brandName,
        productName: `${product.name}${variantLabel}`,
        productPrice: currentPrice,
        resellerInfo,
      },
      currentUser,
      includeUserInfo
    );

    const fullMessage = `${formatted}\n\nDirect Link: ${directUrl}`;
    window.open(buildWhatsAppUrl(primaryWhatsApp.number, fullMessage), '_blank');
  };

  // Other product suggestions for bottom horizontal scroll: Priority Same category > other, randomized
  const suggestedProducts = React.useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    const sameCategory = allProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    );
    const otherCategories = allProducts.filter(
      (p) => p.category !== product.category && p.id !== product.id
    );

    const shuffle = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    return [...shuffle(sameCategory), ...shuffle(otherCategories)];
  }, [allProducts, product.id, product.category]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2922]">
      {/* Top Navigation & Breadcrumb Bar */}
      <div className="bg-[#14291D] text-white border-b border-[#234D34] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-[#A5D6B6] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Apothecary Catalog</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy direct product link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Product Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Path */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#716858]">
          <button onClick={onBack} className="hover:text-[#14291D] hover:underline">
            Home
          </button>
          <span>/</span>
          <button onClick={onBack} className="hover:text-[#14291D] hover:underline">
            {product.categoryLabel}
          </button>
          <span>/</span>
          <span className="text-[#14291D] font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Product Presentation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-[#D5CCBC] overflow-hidden shadow-xs relative group aspect-4/3 sm:aspect-square flex items-center justify-center bg-[#F7F4EC]">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in group-hover:scale-102 transition-transform duration-300"
                onClick={() => setIsLightboxOpen(true)}
              />

              {/* Lightbox / View Large button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-3 right-3 py-1.5 px-2.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1.5 text-xs shadow-md"
                title="Click image to open in full screen popup"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden sm:inline">Tap to View Large</span>
              </button>

              {/* Prev / Next Image arrows if multiple */}
              {imagesList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14291D] shadow-md flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14291D] shadow-md flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Badges on main image */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {!isAvailableInStock && (
                  <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold text-xs shadow-sm">
                    OUT OF STOCK
                  </span>
                )}
                {savings > 0 && isAvailableInStock && (
                  <span className="px-2.5 py-1 rounded-md bg-[#25D366] text-black font-bold text-xs shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.customTag?.text && (
                  <span
                    className="px-2.5 py-1 rounded-md font-bold text-xs shadow-sm flex items-center gap-1 w-fit"
                    style={{
                      backgroundColor: product.customTag.bgColor || '#14291D',
                      color: product.customTag.textColor || '#FFFFFF',
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{product.customTag.text}</span>
                  </span>
                )}
                {product.sortBadge && product.sortBadge !== 'none' && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#14291D] text-white font-mono text-[10px] uppercase tracking-wider font-semibold">
                    {product.sortBadge}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {imagesList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentImageIndex(idx);
                      setIsLightboxOpen(false);
                    }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      currentImageIndex === idx
                        ? 'border-[#2C5E43] ring-2 ring-[#2C5E43]/30 scale-102'
                        : 'border-[#DDD5C5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quality & Ayush Assurance Box (Configurable from Admin Panel or Secretly in Product View) */}
            <div className="relative group p-4 bg-white rounded-xl border border-[#D5CCBC] text-xs transition-all shadow-2xs hover:border-[#2C5E43]/60">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2C5E43] shrink-0" />
                  <div>
                    <span className="font-bold text-[#14291D] block">
                      {product.assuranceBadges?.badge1Title || siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified'}
                    </span>
                    <span className="text-[11px] text-[#716858]">
                      {product.assuranceBadges?.badge1Subtitle || siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-[#2C5E43] shrink-0" />
                  <div>
                    <span className="font-bold text-[#14291D] block">
                      {product.assuranceBadges?.badge2Title || siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical'}
                    </span>
                    <span className="text-[11px] text-[#716858]">
                      {product.assuranceBadges?.badge2Subtitle || siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secret Admin Edit Trigger Button (In product view secretly) */}
              <button
                type="button"
                onClick={() => {
                  setBadge1Title(product.assuranceBadges?.badge1Title || siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified');
                  setBadge1Subtitle(product.assuranceBadges?.badge1Subtitle || siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified');
                  setBadge2Title(product.assuranceBadges?.badge2Title || siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical');
                  setBadge2Subtitle(product.assuranceBadges?.badge2Subtitle || siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers');
                  setIsSecretEditOpen(true);
                }}
                className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                  isAdmin
                    ? 'opacity-85 group-hover:opacity-100 bg-[#E7EFEA] text-[#14291D] border border-[#A5D6B6] shadow-2xs'
                    : 'opacity-0 group-hover:opacity-60 hover:opacity-100! text-stone-500 hover:text-stone-800 bg-white/90 border border-stone-200'
                }`}
                title="Secret Admin Edit: Change Ayush & Quality Assurance Badges"
              >
                <Edit3 className="w-3 h-3 text-[#2C5E43]" />
                <span className="font-semibold">Secret Edit</span>
              </button>
            </div>
          </div>

          {/* Right Column: Product Core Details & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-xs uppercase tracking-wider text-[#2C5E43] font-semibold bg-[#E7EFEA] px-2.5 py-0.5 rounded-full">
                  {product.categoryLabel} · {product.form}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14291D]">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{product.rating}</span>
                  <span className="text-[#7A705E] font-normal">({formatCompactNumber(product.reviewsCount)} reviews)</span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14291D] tracking-tight">
                {product.name}
              </h1>

              <p className="font-serif italic text-base sm:text-lg text-[#2C5E43] font-medium">
                {product.sanskritName}
              </p>

              <p className="text-sm text-[#4E4435] leading-relaxed pt-1">
                {product.tagline}
              </p>
            </div>

            {/* Size / Packaging Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="p-3.5 bg-white rounded-xl border border-[#D5CCBC] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#14291D]">Select Size / Packaging:</span>
                  <span className="text-[#645A4B] text-[11px] font-medium">
                    {selectedVariant ? `${selectedVariant.size} ${selectedVariant.unit}` : product.volumeOrWeight}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(v);
                          if (v.image) {
                            const imgIdx = imagesList.indexOf(v.image);
                            setCurrentImageIndex(imgIdx !== -1 ? imgIdx : 0);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs'
                            : 'bg-[#FAF8F5] text-[#2C2419] border-[#DDD5C5] hover:border-[#14291D]'
                        }`}
                      >
                        <span>{v.size} {v.unit}</span>
                        {v.price !== undefined && (
                          <span className={`text-[10px] ${isSelected ? 'text-emerald-300' : 'text-[#2C5E43]'}`}>
                            {formatPrice(v.price)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pricing Box */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono font-bold text-3xl sm:text-4xl text-[#14291D]" title={`₹${currentPrice}`}>
                  {formatPrice(currentPrice)}
                </span>
                <span className="font-mono text-base text-[#887E6D] line-through" title={`₹${currentMrp}`}>
                  {formatPrice(currentMrp)}
                </span>
                {savings > 0 && (
                  <span className="px-2.5 py-0.5 bg-[#E7F8ED] border border-[#A5D6B6] text-[#183624] text-xs font-bold rounded">
                    Save {formatPrice(savings)} ({discountPercent}% OFF)
                  </span>
                )}
              </div>

              {/* Reseller Rate if active */}
              {currentReseller !== undefined && currentReseller > 0 && (
                <div className="p-2.5 bg-[#FAF5EB] rounded-lg border border-[#E8DCC2] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B4741E]" />
                    <span className="font-bold text-[#14291D]">Registered Reseller / B2B Rate:</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#183624] bg-white px-2 py-0.5 rounded border border-[#D8C7A5]">
                    {formatPrice(currentReseller)} / unit
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-[#6A604F] border-t border-[#EAE3D4] pt-2.5">
                <span>Dispense Pack: <strong className="text-[#14291D] font-mono">{selectedVariant ? `${selectedVariant.size} ${selectedVariant.unit}` : product.volumeOrWeight}</strong></span>
                {isAvailableInStock ? (
                  <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock & Ready for Dispatch
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Currently Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!isAvailableInStock}
                  onClick={() => onAddToCart({
                    ...product,
                    price: currentPrice,
                    mrp: currentMrp,
                    resellerPrice: currentReseller,
                    volumeOrWeight: selectedVariant ? `${selectedVariant.size} ${selectedVariant.unit}` : product.volumeOrWeight,
                    image: (selectedVariant?.image) || product.image,
                  })}
                  className={`py-3 px-5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                    !isAvailableInStock
                      ? 'bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed'
                      : isInCart
                        ? 'bg-[#183624] text-white hover:bg-[#20442E] cursor-pointer'
                        : 'bg-[#2C5E43] text-white hover:bg-[#224A35] cursor-pointer'
                  }`}
                >
                  {!isAvailableInStock ? (
                    <span>Out of Stock</span>
                  ) : isInCart ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>In Inquiry Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Inquiry Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="py-3 px-5 rounded-xl font-semibold text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant WhatsApp Order</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onOpenConsultationModal(product.name)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#C8BEAB] bg-white hover:bg-[#F2ECE1] text-[#332A1C] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#2C5E43]" />
                <span>Request Free Dosage & Classical Routine Advice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Monograph & Pharmacopoeia Information Tabs */}
        <div className="mt-12 bg-white rounded-2xl border border-[#D5CCBC] shadow-xs overflow-hidden">
          {/* Tabs header */}
          <div className="flex border-b border-[#E7DFD1] bg-[#FAF8F5] overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('indications')}
              className={`py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === 'indications'
                  ? 'border-[#14291D] text-[#14291D] bg-white'
                  : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
              }`}
            >
              Therapeutic Uses & Benefits
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === 'ingredients'
                  ? 'border-[#14291D] text-[#14291D] bg-white'
                  : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
              }`}
            >
              Ingredients & Potency ({ingredientsList.length})
            </button>
            <button
              onClick={() => setActiveTab('dosage')}
              className={`py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === 'dosage'
                  ? 'border-[#14291D] text-[#14291D] bg-white'
                  : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
              }`}
            >
              Dosage & Anupana Carrier
            </button>
            <button
              onClick={() => setActiveTab('action')}
              className={`py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === 'action'
                  ? 'border-[#14291D] text-[#14291D] bg-white'
                  : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
              }`}
            >
              Action Mechanism & Doshas
            </button>
            <button
              onClick={() => setActiveTab('precautions')}
              className={`py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === 'precautions'
                  ? 'border-[#14291D] text-[#14291D] bg-white'
                  : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
              }`}
            >
              Precautions & License
            </button>
          </div>

          {/* Tab contents */}
          <div className="p-6 sm:p-8 text-xs text-[#3E3425] leading-relaxed">
            {activeTab === 'indications' && (
              <div className="space-y-5">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#14291D] mb-2">
                    Description & Pharmacopoeia Monograph
                  </h4>
                  <p>{product.description}</p>
                </div>

                {benefitsList.length > 0 && (
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#14291D] mb-2">
                      Therapeutic Uses & Primary Benefits
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {benefitsList.map((use: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-[#E7EFEA] text-[#14291D] rounded-md font-medium">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ailmentsList.length > 0 && (
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#14291D] mb-2">
                      Ailments & Conditions Treated
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {ailmentsList.map((ail: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-medium">
                          {ail}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Fields for Indications Tab */}
                {customFieldsList.filter((cf) => !cf.section || cf.section === 'all' || cf.section === 'indications').length > 0 && (
                  <div className="pt-3 border-t border-[#EAE3D4] space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#14291D]">
                      Apothecary Specifications & Clinical Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {customFieldsList
                        .filter((cf) => !cf.section || cf.section === 'all' || cf.section === 'indications')
                        .map((cf) => (
                          <div key={cf.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5]">
                            <span className="text-[10px] uppercase font-bold text-[#6D6251] block">{cf.name}</span>
                            <span className="text-xs font-semibold text-[#14291D]">{cf.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#14291D]">
                  Botanical Composition & Potency
                </h4>
                {ingredientsList.length > 0 ? (
                  <div className="border border-[#DDD5C5] rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#E7DFD1] text-[#695F4F] font-bold">
                          <th className="py-2.5 px-3">Herbal Name</th>
                          <th className="py-2.5 px-3">Botanical Species</th>
                          <th className="py-2.5 px-3">Potency / Mg</th>
                          <th className="py-2.5 px-3">Therapeutic Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFEAE0]">
                        {ingredientsList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF8F5]">
                            <td className="py-2 px-3 font-semibold text-[#14291D]">{item.herb}</td>
                            <td className="py-2 px-3 italic text-[#594E3E]">{item.botanicalName}</td>
                            <td className="py-2 px-3 font-mono font-bold text-[#2C5E43]">{item.potencyOrMg}</td>
                            <td className="py-2 px-3 text-[#5A4F3F]">{item.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[#645A4B]">Classical formulation ingredients as specified in Ayush pharmacopoeia.</p>
                )}

                {/* Custom Fields for Ingredients Tab */}
                {customFieldsList.filter((cf) => cf.section === 'ingredients').length > 0 && (
                  <div className="pt-3 border-t border-[#EAE3D4] space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#14291D]">
                      Botanical Assay & Formulation Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {customFieldsList
                        .filter((cf) => cf.section === 'ingredients')
                        .map((cf) => (
                          <div key={cf.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5]">
                            <span className="text-[10px] uppercase font-bold text-[#6D6251] block">{cf.name}</span>
                            <span className="text-xs font-semibold text-[#14291D]">{cf.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dosage' && (
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#14291D]">
                  Standard Dosage & Anupana Guidelines
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5] space-y-1">
                    <span className="font-bold text-[#14291D] block">Standard Dosage:</span>
                    <p>{product.dosageAndAnupana?.standardDosage || '1 to 2 doses daily as advised by Doctor'}</p>
                    {product.dosageAndAnupana?.bestTiming && (
                      <p className="text-[11px] text-[#645A4B] pt-1">
                        <strong>Timing:</strong> {product.dosageAndAnupana.bestTiming}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5] space-y-1">
                    <span className="font-bold text-[#14291D] block">Recommended Anupana Carrier:</span>
                    <p>{product.dosageAndAnupana?.anupanaCarrier || 'Warm water or pure cow milk'}</p>
                    {product.dosageAndAnupana?.duration && (
                      <p className="text-[11px] text-[#645A4B] pt-1">
                        <strong>Duration:</strong> {product.dosageAndAnupana.duration}
                      </p>
                    )}
                  </div>
                </div>

                {/* Custom Fields for Dosage Tab */}
                {customFieldsList.filter((cf) => cf.section === 'dosage').length > 0 && (
                  <div className="pt-3 border-t border-[#EAE3D4] space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#14291D]">
                      Dosage Instructions & Specific Anupana Notes
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {customFieldsList
                        .filter((cf) => cf.section === 'dosage')
                        .map((cf) => (
                          <div key={cf.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5]">
                            <span className="text-[10px] uppercase font-bold text-[#6D6251] block">{cf.name}</span>
                            <span className="text-xs font-semibold text-[#14291D]">{cf.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'action' && (
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#14291D]">
                  Pharmacological Mode of Action & Dosha Balance
                </h4>
                {product.detailedUses?.actionMechanism && (
                  <p className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E2D5] leading-relaxed">
                    {product.detailedUses.actionMechanism}
                  </p>
                )}
                {product.detailedUses?.doshaEffect && (
                  <div className="p-3 bg-[#E7EFEA] rounded-lg text-[#14291D]">
                    <strong>Dosha Affinity:</strong> {product.detailedUses.doshaEffect}
                  </div>
                )}

                {/* Custom Fields for Action Tab */}
                {customFieldsList.filter((cf) => cf.section === 'action').length > 0 && (
                  <div className="pt-3 border-t border-[#EAE3D4] space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#14291D]">
                      Receptor & Pharmacodynamic Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {customFieldsList
                        .filter((cf) => cf.section === 'action')
                        .map((cf) => (
                          <div key={cf.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5]">
                            <span className="text-[10px] uppercase font-bold text-[#6D6251] block">{cf.name}</span>
                            <span className="text-xs font-semibold text-[#14291D]">{cf.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'precautions' && (
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#14291D]">
                  Precautions, Contraindications & Ayush License
                </h4>
                {precautionsList.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                    <strong>Precautions & Medical Warnings:</strong>
                    <ul className="list-disc list-inside space-y-0.5 pt-1">
                      {precautionsList.map((prec, i) => (
                        <li key={i}>{prec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5]">
                    <span className="text-[10px] text-[#716858] block uppercase font-bold">Ayush License No</span>
                    <span className="font-mono font-semibold text-xs text-[#14291D]">
                      {product.ayushLicenseNo || 'AYUSH-GMP-VERIFIED-2026'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5]">
                    <span className="text-[10px] text-[#716858] block uppercase font-bold">Batch & Shelf Life</span>
                    <span className="font-mono font-semibold text-xs text-[#14291D]">
                      {product.batchInfo || 'Batch #VK-2026 | 24 Months Mfd'}
                    </span>
                  </div>
                  {product.storageGuideline && (
                    <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5] col-span-1 sm:col-span-2">
                      <span className="text-[10px] text-[#716858] block uppercase font-bold">Storage Guidelines</span>
                      <span className="text-xs text-[#14291D] font-medium">{product.storageGuideline}</span>
                    </div>
                  )}
                </div>

                {/* Custom Fields for Precautions Tab */}
                {customFieldsList.filter((cf) => cf.section === 'precautions').length > 0 && (
                  <div className="pt-3 border-t border-[#EAE3D4] space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#14291D]">
                      Quality, License & Compliance Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {customFieldsList
                        .filter((cf) => cf.section === 'precautions')
                        .map((cf) => (
                          <div key={cf.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5]">
                            <span className="text-[10px] uppercase font-bold text-[#6D6251] block">{cf.name}</span>
                            <span className="text-xs font-semibold text-[#14291D]">{cf.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Other Product Suggestions (Horizontal Scroll, Same Category > Others, Random) */}
        {suggestedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#DDD5C5] space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#14291D] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B4741E]" />
                <span>Other Product Suggestions</span>
              </h3>
            </div>

            {/* Horizontal Scroll Suggestions Container */}
            <div className="relative group/carousel">
              <div
                id="suggested-products-carousel"
                className="flex items-stretch gap-3.5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar touch-pan-x"
              >
                {suggestedProducts.map((rel) => {
                  const isSameCat = rel.category === product.category;
                  return (
                    <div
                      key={rel.id}
                      onClick={() => {
                        onSelectProduct(rel);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-[180px] sm:w-[200px] shrink-0 snap-start bg-white rounded-xl border border-[#D5CCBC] hover:border-[#14291D] p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#E8E2D5]">
                          <img
                            src={rel.image || (rel.images && rel.images[0]) || ''}
                            alt={rel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                          {isSameCat ? (
                            <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-[#14291D] text-white px-1.5 py-0.5 rounded shadow-xs">
                              Same Category
                            </span>
                          ) : (
                            <span className="absolute top-1.5 left-1.5 text-[9px] font-medium bg-black/60 backdrop-blur-xs text-white px-1.5 py-0.5 rounded shadow-xs">
                              {rel.categoryLabel}
                            </span>
                          )}
                          {rel.customTag?.text && (
                            <span
                              className="absolute bottom-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs"
                              style={{
                                backgroundColor: rel.customTag.bgColor || '#14291D',
                                color: rel.customTag.textColor || '#FFFFFF',
                              }}
                            >
                              {rel.customTag.text}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-serif italic text-[#2C5E43] block truncate">
                            {rel.sanskritName}
                          </span>
                          <h4 className="font-serif font-bold text-xs text-[#14291D] line-clamp-1 group-hover:text-[#2C5E43] transition-colors">
                            {rel.name}
                          </h4>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#EAE3D4] flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono font-bold text-xs text-[#14291D]" title={`₹${rel.price}`}>
                            {formatPrice(rel.price)}
                          </span>
                          {rel.mrp > rel.price && (
                            <span className="font-mono text-[10px] text-[#887E6D] line-through" title={`₹${rel.mrp}`}>
                              {formatPrice(rel.mrp)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#2C5E43] group-hover:underline">
                          View →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scroll buttons for desktop */}
              {suggestedProducts.length > 3 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('suggested-products-carousel');
                      if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                    }}
                    className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-[#D5CCBC] shadow-md items-center justify-center text-[#14291D] hover:bg-stone-50 cursor-pointer z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    aria-label="Scroll Left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('suggested-products-carousel');
                      if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                    }}
                    className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-[#D5CCBC] shadow-md items-center justify-center text-[#14291D] hover:bg-stone-50 cursor-pointer z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    aria-label="Scroll Right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Image Popup Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        images={imagesList}
        currentIndex={currentImageIndex}
        productName={product.name}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(idx) => setCurrentImageIndex(idx)}
      />

      {/* Secret Quick-Edit Modal for Quality Assurance Badges in Product View */}
      {isSecretEditOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsSecretEditOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#D5CCBC] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E7EFEA] flex items-center justify-center text-[#2C5E43] border border-[#B5D6C4]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#14291D] flex items-center gap-2">
                    <span>Secret Edit: Quality Assurance Badges</span>
                  </h3>
                  <p className="text-[11px] text-[#6E6352]">
                    Edit these 4 trust indicators right from the product view secretly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSecretEditOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {secretEditSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{secretEditSuccess}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              {/* Badge 1 */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-2.5">
                <span className="font-bold text-[#14291D] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                  <span>Assurance Badge #1</span>
                </span>
                <div>
                  <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                    Badge 1 Title (Default: Ayush & GMP Certified)
                  </label>
                  <input
                    type="text"
                    value={badge1Title}
                    onChange={(e) => setBadge1Title(e.target.value)}
                    placeholder="Ayush & GMP Certified"
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                    Badge 1 Subtitle / Note (Default: Heavy-metal lab verified)
                  </label>
                  <input
                    type="text"
                    value={badge1Subtitle}
                    onChange={(e) => setBadge1Subtitle(e.target.value)}
                    placeholder="Heavy-metal lab verified"
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs text-[#524838]"
                  />
                </div>
              </div>

              {/* Badge 2 */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-2.5">
                <span className="font-bold text-[#14291D] flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-[#2C5E43]" />
                  <span>Assurance Badge #2</span>
                </span>
                <div>
                  <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                    Badge 2 Title (Default: 100% Pure Botanical)
                  </label>
                  <input
                    type="text"
                    value={badge2Title}
                    onChange={(e) => setBadge2Title(e.target.value)}
                    placeholder="100% Pure Botanical"
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#2B251D] mb-1">
                    Badge 2 Subtitle / Note (Default: Zero synthetic fillers)
                  </label>
                  <input
                    type="text"
                    value={badge2Subtitle}
                    onChange={(e) => setBadge2Subtitle(e.target.value)}
                    placeholder="Zero synthetic fillers"
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs text-[#524838]"
                  />
                </div>
              </div>
            </div>

            {/* Live Visual Preview Inside Modal */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#716858] block">Live Preview in Product Ribbon:</span>
              <div className="p-3.5 bg-white rounded-xl border border-[#D5CCBC] grid grid-cols-2 gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2C5E43] shrink-0" />
                  <div>
                    <span className="font-bold text-[#14291D] block">{badge1Title || 'Ayush & GMP Certified'}</span>
                    <span className="text-[11px] text-[#716858]">{badge1Subtitle || 'Heavy-metal lab verified'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-[#2C5E43] shrink-0" />
                  <div>
                    <span className="font-bold text-[#14291D] block">{badge2Title || '100% Pure Botanical'}</span>
                    <span className="text-[11px] text-[#716858]">{badge2Subtitle || 'Zero synthetic fillers'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAE3D4]">
              <button
                type="button"
                onClick={() => {
                  setBadge1Title('Ayush & GMP Certified');
                  setBadge1Subtitle('Heavy-metal lab verified');
                  setBadge2Title('100% Pure Botanical');
                  setBadge2Subtitle('Zero synthetic fillers');
                }}
                className="text-[11px] text-[#6E6352] hover:text-[#14291D] underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-[#2C5E43]" />
                <span>Reset to Standard Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveProductBadges}
                  className="px-3.5 py-2 bg-[#2C5E43] hover:bg-[#20442E] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Save for This Product
                </button>
                <button
                  type="button"
                  onClick={handleSaveSiteBadges}
                  className="px-3.5 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Save for All Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
