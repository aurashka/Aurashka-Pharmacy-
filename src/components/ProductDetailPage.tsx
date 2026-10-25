import React, { useState, useEffect, useRef } from 'react';
import { HerbalProduct, SiteSettings, ProductCustomField, IngredientItem, ProductVariant } from '../types/pharmacy';
import { ImageLightboxModal } from './ImageLightboxModal';
import { ProductMonographTabs } from './ProductMonographTabs';
import { CustomDetailsRenderer } from './CustomDetailsRenderer';
import { ProductActionHub } from './ProductActionHub';
import { ProgressiveImage } from './ProgressiveImage';
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
  Calendar,
  Layers,
  Edit3,
  X,
  RotateCcw,
  Play,
  Video,
  Film
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';
import { backupProductToFirebase, backupSiteSettingsToFirebase } from '../utils/firebaseSync';
import { buildProductMediaList, ProductMediaItem, getYouTubeEmbedUrl, detectVideoType, getYouTubeThumbnail } from '../utils/videoHelper';
import { getProductBottomOverlayClasses } from '../utils/gradientHelper';
import { hexToRgba } from '../utils/monographHelper';
import { getCategoryImageUrl, getFormImageUrl, MiniBadgeItem } from '../utils/categoryImageHelper';
import { CategoryItem } from '../types/pharmacy';

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
  cartCount?: number;
  onOpenCart?: () => void;
  categories?: CategoryItem[];
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
  cartCount = 0,
  onOpenCart,
  categories = [],
}) => {
  const { currentUser } = useAuth();
  const categoryImgUrl = getCategoryImageUrl(product.category, categories, siteSettings?.categoryAppearance);
  const formImgUrl = getFormImageUrl(product.form, siteSettings?.categoryAppearance);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'indications' | 'ingredients' | 'dosage' | 'action' | 'precautions'>('indications');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const heroTouchStartXRef = useRef<number | null>(null);
  const heroTouchStartYRef = useRef<number | null>(null);

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    heroTouchStartXRef.current = e.touches[0].clientX;
    heroTouchStartYRef.current = e.touches[0].clientY;
  };

  const handleHeroTouchEnd = (e: React.TouchEvent) => {
    if (heroTouchStartXRef.current === null || heroTouchStartYRef.current === null) return;
    const deltaX = heroTouchStartXRef.current - e.changedTouches[0].clientX;
    const deltaY = heroTouchStartYRef.current - e.changedTouches[0].clientY;

    // Detect horizontal swipe if deltaX > 40 and horizontal distance is greater than vertical distance
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) && mediaList.length > 1) {
      if (deltaX > 0) {
        // Swiped Left -> Next media
        setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
      } else {
        // Swiped Right -> Previous media
        setCurrentImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
      }
    }
    heroTouchStartXRef.current = null;
    heroTouchStartYRef.current = null;
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Secret Quality Assurance Badges quick-edit state
  const [isSecretEditOpen, setIsSecretEditOpen] = useState(false);
  const [showBadges, setShowBadges] = useState<boolean>(
    product.assuranceBadges?.showBadges !== undefined
      ? Boolean(product.assuranceBadges.showBadges)
      : (siteSettings?.productAssuranceBadges?.showBadges ?? true)
  );
  const [showBadge1, setShowBadge1] = useState<boolean>(
    product.assuranceBadges?.showBadge1 !== undefined
      ? Boolean(product.assuranceBadges.showBadge1)
      : (siteSettings?.productAssuranceBadges?.showBadge1 ?? true)
  );
  const [showBadge2, setShowBadge2] = useState<boolean>(
    product.assuranceBadges?.showBadge2 !== undefined
      ? Boolean(product.assuranceBadges.showBadge2)
      : (siteSettings?.productAssuranceBadges?.showBadge2 ?? true)
  );
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
    setShowBadges(
      product.assuranceBadges?.showBadges !== undefined
        ? Boolean(product.assuranceBadges.showBadges)
        : (siteSettings?.productAssuranceBadges?.showBadges ?? true)
    );
    setShowBadge1(
      product.assuranceBadges?.showBadge1 !== undefined
        ? Boolean(product.assuranceBadges.showBadge1)
        : (siteSettings?.productAssuranceBadges?.showBadge1 ?? true)
    );
    setShowBadge2(
      product.assuranceBadges?.showBadge2 !== undefined
        ? Boolean(product.assuranceBadges.showBadge2)
        : (siteSettings?.productAssuranceBadges?.showBadge2 ?? true)
    );
    setBadge1Title(product.assuranceBadges?.badge1Title || siteSettings?.productAssuranceBadges?.badge1Title || 'Ayush & GMP Certified');
    setBadge1Subtitle(product.assuranceBadges?.badge1Subtitle || siteSettings?.productAssuranceBadges?.badge1Subtitle || 'Heavy-metal lab verified');
    setBadge2Title(product.assuranceBadges?.badge2Title || siteSettings?.productAssuranceBadges?.badge2Title || '100% Pure Botanical');
    setBadge2Subtitle(product.assuranceBadges?.badge2Subtitle || siteSettings?.productAssuranceBadges?.badge2Subtitle || 'Zero synthetic fillers');
  }, [product, siteSettings]);

  // Helper to determine if assurance trust badges are visible (separately or globally)
  const isBadgesMasterVisible = () => {
    if (product.assuranceBadges?.showBadges === false) return false;
    if (product.assuranceBadges?.showBadges === true) return true;
    return siteSettings?.productAssuranceBadges?.showBadges !== false;
  };

  const isBadge1Visible = () => {
    if (!isBadgesMasterVisible()) return false;
    if (product.assuranceBadges?.showBadge1 === false) return false;
    if (product.assuranceBadges?.showBadge1 === true) return true;
    return siteSettings?.productAssuranceBadges?.showBadge1 !== false;
  };

  const isBadge2Visible = () => {
    if (!isBadgesMasterVisible()) return false;
    if (product.assuranceBadges?.showBadge2 === false) return false;
    if (product.assuranceBadges?.showBadge2 === true) return true;
    return siteSettings?.productAssuranceBadges?.showBadge2 !== false;
  };

  const hasAnyBadgeVisible = isBadge1Visible() || isBadge2Visible();

  const handleSaveProductBadges = () => {
    const updatedProd: HerbalProduct = {
      ...product,
      assuranceBadges: {
        showBadges: Boolean(showBadges),
        showBadge1: Boolean(showBadge1),
        showBadge2: Boolean(showBadge2),
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
        showBadges: Boolean(showBadges),
        showBadge1: Boolean(showBadge1),
        showBadge2: Boolean(showBadge2),
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

  // Variant Selection State & Stepper Quantity
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    return product.variants && product.variants.length > 0 ? product.variants[0] : null;
  });
  const [quantity, setQuantity] = useState(1);

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentImageIndex(0);
    setQuantity(1);
    setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
  }, [product.id, product.variants]);

  // Combined product and selected variety media (images + video)
  const mediaList: ProductMediaItem[] = React.useMemo(() => {
    return buildProductMediaList(product, selectedVariant);
  }, [product, selectedVariant]);

  // Clean images list from product and variants for zoom/lightbox
  const imagesList: string[] = React.useMemo(() => {
    return mediaList
      .filter((m): m is ProductMediaItem & { type: 'image' } => m.type === 'image')
      .map((m) => m.url);
  }, [mediaList]);

  // Active pricing & stock status (considering selected variant)
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentMrp = selectedVariant?.mrp ?? product.mrp;
  const currentReseller = selectedVariant?.resellerPrice ?? product.resellerPrice;
  const isAvailableInStock = selectedVariant?.inStock !== undefined 
    ? selectedVariant.inStock 
    : (product.inStock !== false);
  const savings = currentMrp - currentPrice;
  const discountPercent = Math.round((savings / (currentMrp || 1)) * 100);

  const activeMedia = mediaList[currentImageIndex] || mediaList[0] || { type: 'image', url: product.image };
  const activeImage = activeMedia.type === 'image' ? activeMedia.url : (imagesList[0] || product.image);

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

  const handleAddToCartWithQuantity = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart({
        ...product,
        price: currentPrice,
        mrp: currentMrp,
        resellerPrice: currentReseller,
        volumeOrWeight: selectedVariant ? `${selectedVariant.size} ${selectedVariant.unit}` : product.volumeOrWeight,
        image: (selectedVariant?.image) || product.image,
      });
    }
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
    <div className="min-h-screen bg-[#F6FAF7] text-[#142B1F] relative z-10">
      {/* 1. Top Navigation Bar: Back, Share, and Cart Icon (Matching Reference Screen 2) */}
      <div className="bg-[#14291D] text-white border-b border-[#234D34] sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-[#A5D6B6] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Apothecary Catalog</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              title="Copy direct product link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {onOpenCart && (
              <button
                type="button"
                onClick={onOpenCart}
                className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                title="View Dispensary Cart"
              >
                <ShoppingBag className="w-4.5 h-4.5 text-amber-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-[#14291D] text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb Path */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#716858]">
          <button onClick={onBack} className="hover:text-[#14291D] hover:underline">
            Home
          </button>
          <span>/</span>
          <button onClick={onBack} className="hover:text-[#14291D] hover:underline inline-flex items-center gap-1.5">
            <MiniBadgeItem
              label={product.categoryLabel}
              imageUrl={categoryImgUrl}
              appearance={siteSettings?.categoryAppearance}
              sizePx={14}
            />
          </button>
          <span>/</span>
          <span className="text-[#14291D] font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Draft Mode Notice Banner (Visible only to Admin) */}
      {product.isDraft && (
        <div className="bg-amber-50 border-b border-amber-300 px-4 sm:px-6 py-2.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-400">
              📝 DRAFT PREVIEW
            </span>
            <span>This formulation is in Draft Mode and only visible to administrators.</span>
          </div>
          {isAdmin && onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded font-bold text-[11px] shrink-0 cursor-pointer transition-colors"
            >
              Edit / Publish
            </button>
          )}
        </div>
      )}

      {/* 2. Main Product Presentation (Matching Center Screen of Reference) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6">
        
        {/* Top Hero Product Showcase Area: Horizontally Expansive with Touch Swipe & Full Screen Zoom */}
        <div className="relative w-full flex flex-col items-center">
          
          {/* Main Showcase Stage - Expanded to full holder with minimal padding so image takes full area */}
          <div 
            className="w-full max-w-full sm:max-w-2xl md:max-w-3xl rounded-3xl bg-linear-to-b from-[#F2F9F5] via-[#EBF6F0]/80 to-white p-1 sm:p-2 md:p-3 flex items-center justify-center relative overflow-hidden shadow-xs border border-[#DCEFE3] group select-none touch-pan-y"
            onTouchStart={handleHeroTouchStart}
            onTouchEnd={handleHeroTouchEnd}
          >
            {/* Subtle Botanical Glow Backdrop spanning stage */}
            <div className="absolute inset-2 sm:inset-6 rounded-full bg-radial from-[#DCF3E7]/90 via-[#E8F8F0]/40 to-transparent blur-2xl pointer-events-none" />

            {/* Video vs Image */}
            {activeMedia.type === 'video' ? (
              <div className="w-full aspect-4/3 sm:aspect-16/10 rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-md relative flex items-center justify-center z-10">
                {activeMedia.videoType === 'youtube' ? (
                  <iframe
                    src={getYouTubeEmbedUrl(activeMedia.url, true) || ''}
                    title={`${product.name} Video`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <div 
                className="w-full min-h-[380px] sm:min-h-[480px] md:min-h-[520px] max-h-[560px] flex items-center justify-center cursor-zoom-in relative z-10 p-2 sm:p-3"
                onClick={() => setIsLightboxOpen(true)}
                title="Click image to open in full screen (Zoom & Save)"
              >
                <ProgressiveImage
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain max-h-[360px] sm:max-h-[460px] md:max-h-[500px] drop-shadow-[0_20px_35px_rgba(20,50,30,0.18)] group-hover:scale-102 transition-transform duration-300"
                />

                {/* Stock & Discount % Tags directly overlaid on top-left of image */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
                  {!isAvailableInStock ? (
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-md tracking-wide">
                      OUT OF STOCK
                    </span>
                  ) : savings > 0 ? (
                    <span className="px-3.5 py-1 rounded-full bg-[#143B25] text-white font-bold text-xs shadow-md tracking-wide border border-emerald-400/30">
                      {discountPercent}% OFF
                    </span>
                  ) : null}
                  {product.form && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#142B1F] border border-[#DCEFE3] text-[11px] font-bold shadow-xs">
                      <MiniBadgeItem
                        label={product.form}
                        imageUrl={formImgUrl}
                        appearance={siteSettings?.categoryAppearance}
                        sizePx={13}
                      />
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Floating Left / Right Arrow buttons for instant click switching */}
            {mediaList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-[#142B1F] shadow-lg border border-[#DCEFE3] flex items-center justify-center transition-all cursor-pointer z-20 active:scale-90"
                  aria-label="Previous image"
                  title="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E6B47]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-[#142B1F] shadow-lg border border-[#DCEFE3] flex items-center justify-center transition-all cursor-pointer z-20 active:scale-90"
                  aria-label="Next image"
                  title="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E6B47]" />
                </button>
              </>
            )}

            {/* Swipe instruction tooltip on mobile */}
            {mediaList.length > 1 && (
              <span className="absolute bottom-2 inset-x-0 text-center text-[10px] text-[#6B8576] font-medium pointer-events-none sm:hidden">
                Swipe left / right to change image
              </span>
            )}
          </div>

          {/* Dot Pagination Indicator */}
          {mediaList.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 my-3">
              {mediaList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentImageIndex === idx
                      ? 'w-7 bg-[#143B25]'
                      : 'w-2.5 bg-[#DCEFE3] hover:bg-[#A5D6B6]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Strip (if multiple images) */}
          {mediaList.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full pb-1 px-2 mb-2 scrollbar-none">
              {mediaList.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 bg-white border-2 overflow-hidden transition-all cursor-pointer shrink-0 ${
                    currentImageIndex === idx
                      ? 'border-[#1E6B47] ring-2 ring-[#1E6B47]/20 scale-105 shadow-sm'
                      : 'border-[#DCEFE3] opacity-70 hover:opacity-100 hover:border-[#1E6B47]/50'
                  }`}
                  title={`View angle ${idx + 1}`}
                >
                  <img
                    src={item.type === 'video' ? (item.poster || getYouTubeThumbnail(item.url) || item.url) : item.url}
                    alt={`Angle ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* 3 Round Feature Badges (🌿 100% Pure, 🛡️ Ayush & GMP, 🍃 Lab Verified) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap my-2">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#DCEFE3] shadow-2xs">
              <Leaf className="w-3.5 h-3.5 text-[#1E6B47]" />
              <span className="text-[11px] font-bold text-[#142B1F]">100% Pure Botanical</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#DCEFE3] shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E6B47]" />
              <span className="text-[11px] font-bold text-[#14291D]">Ayush & GMP Certified</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#DCEFE3] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B4741E]" />
              <span className="text-[11px] font-bold text-[#14291D]">Lab Verified</span>
            </div>
          </div>
        </div>

        {/* 3. Unified Hero Commerce Card (Matching Center Screen of Reference) */}
        <div className="w-full bg-white rounded-3xl sm:rounded-4xl p-5 sm:p-7 border border-[#DCEFE3] shadow-[0_10px_35px_rgba(20,50,30,0.06)] space-y-4">
          {/* Category & 5-Star Rating Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wider text-[#1E6B47] font-bold bg-[#EAF7EE] px-3 py-1 rounded-full border border-[#D0EBD8] shadow-2xs">
                <MiniBadgeItem
                  label={product.categoryLabel}
                  imageUrl={categoryImgUrl}
                  appearance={siteSettings?.categoryAppearance}
                  sizePx={15}
                />
              </span>
              {product.form && (
                <span className="text-xs font-mono uppercase tracking-wider text-[#143B25] font-bold bg-[#F4FAF6] px-2.5 py-1 rounded-full border border-[#DCEFE3] shadow-2xs">
                  <MiniBadgeItem
                    label={product.form}
                    imageUrl={formImgUrl}
                    appearance={siteSettings?.categoryAppearance}
                    sizePx={14}
                  />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-[#142B1F] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#EDE5D8]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-[#6B8576] font-normal">({formatCompactNumber(product.reviewsCount)} reviews)</span>
            </div>
          </div>

          {/* Product Title & Sanskrit Name */}
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#142B1F] tracking-tight">
              {product.name}
            </h1>
            {product.sanskritName && (
              <p className="font-serif italic text-base sm:text-lg text-[#1E6B47] font-medium">
                {product.sanskritName}
              </p>
            )}
            {product.tagline && (
              <p className="text-xs sm:text-sm text-[#526B5C] leading-relaxed pt-1">
                {product.tagline}
              </p>
            )}
          </div>

          {/* Price Stack: Big Bold Price + Strikethrough MRP + Savings Pill */}
          <div className="flex items-baseline gap-3 pt-1 flex-wrap">
            <span className="font-mono font-bold text-3xl sm:text-4xl text-[#142B1F]" title={`₹${currentPrice}`}>
              {formatPrice(currentPrice)}
            </span>
            {currentMrp > currentPrice && (
              <span className="font-mono text-base sm:text-lg text-[#8C8270] line-through" title={`₹${currentMrp}`}>
                {formatPrice(currentMrp)}
              </span>
            )}
            {savings > 0 && (
              <span className="px-3 py-1 bg-[#EAF7EE] border border-[#A5D6B6] text-[#143B25] text-xs font-bold rounded-full shadow-2xs">
                Save {formatPrice(savings)} ({discountPercent}% OFF)
              </span>
            )}
          </div>

          {/* Stepper [- 1 +] & Big Pill Add to Cart Button (Matching Reference Screen 2) */}
          <div className="flex items-center gap-3 pt-2">
            {/* Stepper */}
            <div className="flex items-center border border-[#DCEFE3] bg-[#F4FAF6] rounded-full p-1 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 text-[#142B1F] flex items-center justify-center transition-colors cursor-pointer shadow-2xs font-bold text-base"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-sm text-[#142B1F] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 text-[#142B1F] flex items-center justify-center transition-colors cursor-pointer shadow-2xs font-bold text-base"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Big Pill Add to Cart Button */}
            <button
              type="button"
              disabled={!isAvailableInStock}
              onClick={handleAddToCartWithQuantity}
              className={`flex-1 py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 ${
                !isAvailableInStock
                  ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                  : isInCart
                  ? 'bg-[#1E6B47] text-white hover:bg-[#143B25]'
                  : 'bg-[#143B25] hover:bg-[#1E6B47] text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>{isInCart ? 'Added in Dispensary Bag' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>

        {/* 4. Registered Reseller / B2B Wholesale Rate Banner (Strictly Preserved!) */}
        {currentReseller !== undefined && currentReseller > 0 && (
          <div className="p-3.5 bg-[#FAF5EB] rounded-2xl border border-[#E8DCC2] flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B4741E]" />
              <span className="font-bold text-[#14291D]">Registered Reseller / B2B Wholesale Rate:</span>
            </div>
            <span className="font-mono font-bold text-sm text-[#143B25] bg-white px-3 py-1 rounded-xl border border-[#D8C7A5]">
              {formatPrice(currentReseller)} / unit
            </span>
          </div>
        )}

        {/* 5. Size / Packaging Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="p-4 bg-white rounded-2xl border border-[#DCEFE3] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#14291D]">Select Packaging Variant:</span>
              <span className="text-[#6B8576] font-medium">
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
                      setCurrentImageIndex(0);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#143B25] text-white border-[#143B25] shadow-xs'
                        : 'bg-[#F4FAF6] text-[#142B1F] border-[#DCEFE3] hover:border-[#143B25]'
                    }`}
                  >
                    <span>{v.size} {v.unit}</span>
                    {v.price !== undefined && (
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-[#1E6B47]'}`}>
                        {formatPrice(v.price)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Action Hub: WhatsApp Order, Free Routine Advice & Marketplace Stores (Amazon, Flipkart, Tata 1mg) */}
        <ProductActionHub
          product={product}
          selectedVariant={selectedVariant}
          currentPrice={currentPrice}
          currentMrp={currentMrp}
          currentReseller={currentReseller}
          isInCart={isInCart}
          isAvailableInStock={isAvailableInStock}
          onAddToCart={onAddToCart}
          onOpenConsultationModal={onOpenConsultationModal}
          onWhatsAppOrder={handleWhatsAppOrder}
          siteSettings={siteSettings}
        />

        {/* Pre-Monograph Custom Detail Highlights (Configured in Product Add, shown above Monograph Tabs) */}
        {product.customDetails && product.customDetails.length > 0 && (
          <div className="mt-12 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#2C5E43] text-white">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#14291D]">
                  Product Highlights & Apothecary Details
                </h3>
              </div>
              <span className="text-[11px] text-[#716858] font-medium hidden sm:inline">
                Verified Apothecary Assurances
              </span>
            </div>

            <CustomDetailsRenderer items={product.customDetails} />
          </div>
        )}

        {/* Official Ayurvedic Monograph Tabs (Horizontal scrollable, priority colored cards & admin customizable) */}
        <ProductMonographTabs
          product={product}
          isAdmin={isAdmin}
          onOpenAdminEdit={onOpenAdminPanel}
          className="mt-8"
        />

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
                className="flex items-stretch gap-3.5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory visible-tabs-scrollbar touch-pan-x touch-pan-y"
                style={{ touchAction: 'pan-x pan-y' }}
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

            {/* Master Show / Hide Toggle */}
            <div className="p-3 bg-white rounded-xl border border-[#DDD5C5] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#14291D] block">Display Quality Assurance Badges</span>
                <span className="text-[11px] text-[#716858]">Show or hide these trust badges on this product view</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBadges(!showBadges)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  showBadges
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                }`}
              >
                {showBadges ? '✓ Shown' : '✕ Hidden'}
              </button>
            </div>

            <div className={`space-y-3.5 text-xs transition-opacity ${showBadges ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              {/* Badge 1 */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#14291D] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                    <span>Assurance Badge #1</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBadge1(!showBadge1)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      showBadge1 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {showBadge1 ? 'Badge 1: Visible' : 'Badge 1: Hidden'}
                  </button>
                </div>
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
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#14291D] flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-[#2C5E43]" />
                    <span>Assurance Badge #2</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBadge2(!showBadge2)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      showBadge2 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {showBadge2 ? 'Badge 2: Visible' : 'Badge 2: Hidden'}
                  </button>
                </div>
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
              {showBadges && (showBadge1 || showBadge2) ? (
                <div className={`p-3.5 bg-white rounded-xl border border-[#D5CCBC] grid ${showBadge1 && showBadge2 ? 'grid-cols-2 gap-3' : 'grid-cols-1'} text-xs shadow-2xs`}>
                  {showBadge1 && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#2C5E43] shrink-0" />
                      <div>
                        <span className="font-bold text-[#14291D] block">{badge1Title || 'Ayush & GMP Certified'}</span>
                        <span className="text-[11px] text-[#716858]">{badge1Subtitle || 'Heavy-metal lab verified'}</span>
                      </div>
                    </div>
                  )}
                  {showBadge2 && (
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-[#2C5E43] shrink-0" />
                      <div>
                        <span className="font-bold text-[#14291D] block">{badge2Title || '100% Pure Botanical'}</span>
                        <span className="text-[11px] text-[#716858]">{badge2Subtitle || 'Zero synthetic fillers'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-center text-xs text-stone-500 font-medium">
                  Badges are currently set to HIDDEN
                </div>
              )}
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
