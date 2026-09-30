import React, { useState, useEffect } from 'react';
import { HerbalProduct, SiteSettings } from '../types/pharmacy';
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
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';

interface ProductDetailPageProps {
  product: HerbalProduct;
  onBack: () => void;
  onAddToCart: (product: HerbalProduct) => void;
  isInCart?: boolean;
  siteSettings: SiteSettings;
  allProducts: HerbalProduct[];
  onSelectProduct: (product: HerbalProduct) => void;
  onOpenConsultationModal: (productName?: string) => void;
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
}) => {
  const { currentUser } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'indications' | 'ingredients' | 'dosage' | 'action' | 'precautions'>('indications');

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentImageIndex(0);
  }, [product.id]);

  // Clean images list from product
  const imagesList: string[] = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      const valid = product.images.filter((img) => img && img.trim().length > 0);
      if (valid.length > 0) return valid;
    }
    return product.image ? [product.image] : [];
  }, [product]);

  const activeImage = imagesList[currentImageIndex] || product.image;
  const savings = product.mrp - product.price;
  const discountPercent = Math.round((savings / (product.mrp || 1)) * 100);

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

    const resellerInfo = product.resellerPrice
      ? ` (Reseller Rate: ₹${product.resellerPrice})`
      : '';

    const formatted = formatCustomMessage(
      template,
      {
        brandName: siteSettings.brandName,
        productName: product.name,
        productPrice: product.price,
        resellerInfo,
      },
      currentUser,
      includeUserInfo
    );

    const fullMessage = `${formatted}\n\nDirect Link: ${directUrl}`;
    window.open(buildWhatsAppUrl(primaryWhatsApp.number, fullMessage), '_blank');
  };

  // Related products from the same category
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

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
                className={`w-full h-full object-cover transition-transform duration-300 ${isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'}`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Zoom Toggle button */}
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
                title={isZoomed ? 'Zoom Out' : 'Zoom In'}
              >
                <Maximize2 className="w-4 h-4" />
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
                {savings > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-[#25D366] text-black font-bold text-xs shadow-sm">
                    {discountPercent}% OFF
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
                      setIsZoomed(false);
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

            {/* Quality & Ayush Assurance Box */}
            <div className="p-4 bg-white rounded-xl border border-[#D5CCBC] grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2C5E43] shrink-0" />
                <div>
                  <span className="font-bold text-[#14291D] block">Ayush & GMP Certified</span>
                  <span className="text-[11px] text-[#716858]">Heavy-metal lab verified</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#2C5E43] shrink-0" />
                <div>
                  <span className="font-bold text-[#14291D] block">100% Pure Botanical</span>
                  <span className="text-[11px] text-[#716858]">Zero synthetic fillers</span>
                </div>
              </div>
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
                  <span className="text-[#7A705E] font-normal">({product.reviewsCount} reviews)</span>
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

            {/* Pricing Box */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono font-bold text-3xl sm:text-4xl text-[#14291D]">
                  ₹{product.price}
                </span>
                <span className="font-mono text-base text-[#887E6D] line-through">
                  ₹{product.mrp}
                </span>
                <span className="px-2.5 py-0.5 bg-[#E7F8ED] border border-[#A5D6B6] text-[#183624] text-xs font-bold rounded">
                  Save ₹{savings} ({discountPercent}% OFF)
                </span>
              </div>

              {/* Reseller Rate if active */}
              {product.resellerPrice !== undefined && product.resellerPrice > 0 && (
                <div className="p-2.5 bg-[#FAF5EB] rounded-lg border border-[#E8DCC2] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B4741E]" />
                    <span className="font-bold text-[#14291D]">Registered Reseller / B2B Rate:</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#183624] bg-white px-2 py-0.5 rounded border border-[#D8C7A5]">
                    ₹{product.resellerPrice} / unit
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-[#6A604F] border-t border-[#EAE3D4] pt-2.5">
                <span>Dispense Pack: <strong className="text-[#14291D] font-mono">{product.volumeOrWeight}</strong></span>
                <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock & Ready for Dispatch
                </span>
              </div>
            </div>

            {/* Custom Link / Unique Code Indicator */}
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E0D8C8] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#5E5444]">
                <FileText className="w-4 h-4 text-[#2C5E43]" />
                <span>Unique Link / Code:</span>
                <code className="font-mono font-semibold bg-white px-2 py-0.5 rounded border border-[#D5CCBC] text-[#14291D]">
                  #product/{productSlug}
                </code>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-xs text-[#2C5E43] hover:text-[#14291D] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className={`py-3 px-5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isInCart
                      ? 'bg-[#183624] text-white hover:bg-[#20442E]'
                      : 'bg-[#2C5E43] text-white hover:bg-[#224A35]'
                  }`}
                >
                  {isInCart ? (
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
              Indications & Uses
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === 'ingredients'
                  ? 'border-[#14291D] text-[#14291D] bg-white'
                  : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
              }`}
            >
              Ingredients & Potency ({product.ingredientsList?.length || product.ingredients.length})
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

                {product.keyIndications && (
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#14291D] mb-2">
                      Key Indications (Rogadhikar)
                    </h4>
                    <p className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E2D5]">
                      {product.keyIndications}
                    </p>
                  </div>
                )}

                {product.therapeuticUses && product.therapeuticUses.length > 0 && (
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#14291D] mb-2">
                      Therapeutic Uses & Benefits
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {product.therapeuticUses.map((use, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#E7EFEA] text-[#14291D] rounded-md font-medium">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Fields if any */}
                {product.customFields && product.customFields.length > 0 && (
                  <div className="pt-2 border-t border-[#EAE3D4]">
                    <h4 className="font-serif font-bold text-sm text-[#14291D] mb-3">
                      Apothecary Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {product.customFields.map((cf) => (
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
                {product.ingredientsList && product.ingredientsList.length > 0 ? (
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
                        {product.ingredientsList.map((item, idx) => (
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
                  <ul className="list-disc list-inside space-y-1">
                    {product.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
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
                    <p>{product.dosage}</p>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5] space-y-1">
                    <span className="font-bold text-[#14291D] block">Recommended Anupana Carrier:</span>
                    <p>{product.anupana || 'Warm water or organic honey'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'action' && (
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#14291D]">
                  Pharmacological Mode of Action & Dosha Balance
                </h4>
                {product.actionMechanism && (
                  <p className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E2D5]">
                    {product.actionMechanism}
                  </p>
                )}
                {product.doshaEffect && (
                  <div className="p-3 bg-[#E7EFEA] rounded-lg text-[#14291D]">
                    <strong>Dosha Affinity:</strong> {product.doshaEffect}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'precautions' && (
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#14291D]">
                  Precautions, Contraindications & Ayush License
                </h4>
                {product.precautions && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                    <strong>Precautions:</strong> {product.precautions}
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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Formulations in Category */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#14291D]">
                Complementary Formulations in {product.categoryLabel}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel)}
                  className="bg-white rounded-xl border border-[#D5CCBC] hover:border-[#14291D] p-3 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="aspect-square rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#E8E2D5]">
                      <img
                        src={rel.image}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-serif italic text-[#2C5E43] block truncate">
                        {rel.sanskritName}
                      </span>
                      <h4 className="font-serif font-bold text-xs text-[#14291D] line-clamp-1 group-hover:text-[#2C5E43]">
                        {rel.name}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAE3D4] flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#14291D]">
                      ₹{rel.price}
                    </span>
                    <span className="text-[11px] font-semibold text-[#2C5E43] group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
