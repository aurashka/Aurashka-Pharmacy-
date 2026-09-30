import React from 'react';
import { HerbalProduct } from '../types/pharmacy';
import { MessageCircle, Eye, ShoppingBag, Check, Edit3, ExternalLink, Camera } from 'lucide-react';
import { PHARMACY_CONTACT_INFO } from '../data/herbalProducts';

interface ProductCardProps {
  product: HerbalProduct;
  onOpenDetail: (product: HerbalProduct) => void;
  onAddToCart: (product: HerbalProduct) => void;
  isInCart?: boolean;
  isAdmin?: boolean;
  onEditProduct?: (product: HerbalProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
  onAddToCart,
  isInCart = false,
  isAdmin = false,
  onEditProduct,
}) => {
  const savings = product.mrp - product.price;
  const discountPercent = Math.round((savings / product.mrp) * 100);

  // STRICT REQUIREMENT: Only the primary set image shows on product list view
  const primaryImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : '');
  const totalImagesCount = product.images && product.images.length > 0 ? product.images.length : 1;

  const handleWhatsAppConsult = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.customLink) {
      window.open(product.customLink, '_blank');
      return;
    }
    const text = encodeURIComponent(
      `Namaste, I want to inquire about "${product.name}" (Deal price ₹${product.price}). Please share dosage details.`
    );
    window.open(`https://wa.me/${PHARMACY_CONTACT_INFO.whatsappNumber}?text=${text}`, '_blank');
  };

  const handleAdminEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditProduct) {
      onEditProduct(product);
    }
  };

  return (
    <div 
      onClick={() => onOpenDetail(product)}
      className="group bg-white rounded-xl border border-[#E4DDD0] hover:border-[#2C5E43] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image Slot - ONLY PRIMARY SET IMAGE SHOWS HERE */}
      <div className="relative aspect-4/3 bg-[#F2EDE1] overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        
        {/* Deal Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-[#B4741E] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
            Save {discountPercent}%
          </div>
        )}

        {/* Top-Right Badge: Admin Edit Button + Rating */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {isAdmin && onEditProduct && (
            <button
              onClick={handleAdminEdit}
              title="Admin: Edit this product"
              className="px-2 py-1 bg-[#14291D] hover:bg-[#B4741E] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-md transition-colors"
            >
              <Edit3 className="w-3 h-3 text-amber-300" />
              <span>Edit</span>
            </button>
          )}

          <div className="bg-white/90 backdrop-blur-xs text-[#2C5E43] text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs">
            ★ {product.rating}
          </div>
        </div>

        {/* Multiple Photos Indicator Pill on Card bottom (Indicates more angles in product view) */}
        {totalImagesCount > 1 && (
          <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10">
            <Camera className="w-3 h-3 text-[#A5D6B6]" />
            <span>{totalImagesCount} Photos</span>
          </div>
        )}

        {/* Hover preview pill */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <span className="px-3 py-1.5 rounded-lg bg-white text-[#14291D] text-xs font-semibold shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>View All Photos & Uses</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6E6352]">
            <span>{product.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{product.volumeOrWeight}</span>
          </div>

          <h3 className="font-serif text-base font-bold text-[#14291D] group-hover:text-[#2C5E43] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-[#635A4B] line-clamp-1 italic">
            {product.sanskritName}
          </p>

          <p className="text-xs text-[#524A3D] line-clamp-2 pt-0.5 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-[#F0EAE0] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#14291D] tabular-nums">
                ₹{product.price}
              </span>
              <span className="text-xs text-[#8A7F6E] line-through tabular-nums">
                ₹{product.mrp}
              </span>
            </div>
            {savings > 0 && (
              <span className="text-[10px] text-[#2C5E43] font-semibold block">
                Save ₹{savings}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleWhatsAppConsult}
              title={product.customLink ? "Open Custom Link" : "Quick WhatsApp order"}
              aria-label={product.customLink ? "Open Custom Link" : "Quick WhatsApp order"}
              className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#1E7E34] hover:bg-[#25D366] hover:text-white transition-colors"
            >
              {product.customLink ? (
                <ExternalLink className="w-4 h-4 text-[#2C5E43]" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                isInCart
                  ? 'bg-[#2C5E43] text-white'
                  : 'bg-[#14291D] text-white hover:bg-[#203E2D]'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
