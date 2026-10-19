import React from 'react';
import { HerbalProduct, SiteSettings } from '../types/pharmacy';
import { formatPrice } from '../utils/numberFormatter';
import { X, Trash2, Plus, Minus, MessageSquare, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';

export interface CartItem {
  product: HerbalProduct;
  quantity: number;
}

interface InquiryCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenProductDetail: (product: HerbalProduct) => void;
  siteSettings?: SiteSettings;
}

export const InquiryCartDrawer: React.FC<InquiryCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenProductDetail,
  siteSettings,
}) => {
  const { currentUser } = useAuth();
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalMrp = cartItems.reduce(
    (sum, item) => sum + item.product.mrp * item.quantity,
    0
  );

  const totalSavings = totalMrp - totalAmount;

  const handleCheckoutViaWhatsApp = () => {
    if (cartItems.length === 0) return;
    
    let itemsText = cartItems
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.product.name}* (${it.product.volumeOrWeight})\n   Qty: ${it.quantity} x ₹${it.product.price} = ₹${it.quantity * it.product.price}`
      )
      .join('\n');

    const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);
    const template = siteSettings?.messageTemplates?.cartOrderWhatsApp || DEFAULT_MESSAGE_TEMPLATES.cartOrderWhatsApp;
    const includeUserInfo = siteSettings?.messageTemplates?.includeUserInfo ?? true;

    const formattedMsg = formatCustomMessage(
      template,
      {
        brandName: siteSettings?.brandName,
        cartSummary: itemsText,
        cartTotal: totalAmount,
      },
      currentUser,
      includeUserInfo
    );

    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#F6FAF7] h-full shadow-[0_0_50px_rgba(20,50,30,0.2)] flex flex-col border-l border-[#DCEFE3] text-[#142B1F] sm:rounded-l-3xl overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header with Aurora glassmorphism */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#DCEFE3] bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#DCF3E7] text-[#143B25] flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4.5 h-4.5 text-[#1E6B47]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#142B1F]">
                Dispensary Order Bag
              </h3>
              <p className="text-[11px] text-[#526B5C]">
                {cartItems.length} {cartItems.length === 1 ? 'Formulation' : 'Formulations'} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-transparent hover:border-[#DCEFE3] hover:bg-[#DCF3E7] text-[#6B8576] hover:text-[#142B1F] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 scrollbar-thin">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#DCF3E7] text-[#143B25] flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-6 h-6 text-[#1E6B47]" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#142B1F]">
                Your Dispensary List is Empty
              </h4>
              <p className="text-xs text-[#526B5C] max-w-xs leading-relaxed">
                Explore our classical Ayurvedic formulations, view detailed therapeutic uses, and add medicines to consult with our Doctor.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(({ product, quantity }) => (
                <div 
                  key={product.id}
                  className="bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-[#DCEFE3] shadow-xs flex gap-3 items-center group hover:border-[#1E6B47]/40 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#DCEFE3] shrink-0 group-hover:scale-102 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onOpenProductDetail(product)}
                      className="text-left font-serif text-sm font-semibold text-[#142B1F] hover:text-[#1E6B47] truncate block w-full transition-colors cursor-pointer"
                    >
                      {product.name}
                    </button>
                    <div className="text-[11px] text-[#6B8576] truncate">
                      {product.volumeOrWeight} · {product.form}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#142B1F] tabular-nums" title={`₹${product.price * quantity}`}>
                        {formatPrice(product.price * quantity)}
                      </span>
                      <span className="text-[11px] text-[#8EA396] line-through tabular-nums" title={`₹${product.mrp * quantity}`}>
                        {formatPrice(product.mrp * quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center border border-[#DCEFE3] rounded-full bg-[#F4FAF6] p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="w-6 h-6 rounded-full hover:bg-white text-[#142B1F] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold tabular-nums text-[#142B1F]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="w-6 h-6 rounded-full hover:bg-white text-[#142B1F] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-[#991B1B]/70 hover:text-[#991B1B] p-1 cursor-pointer transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 text-right">
                <button
                  onClick={onClearCart}
                  className="text-xs text-[#6B8576] hover:text-[#991B1B] transition-colors cursor-pointer"
                >
                  Clear all items
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & WhatsApp Order CTA */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-[#DCEFE3] bg-white/90 backdrop-blur-md space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#526B5C]">
                <span>Total Formulation MRP:</span>
                <span className="tabular-nums font-medium" title={`₹${totalMrp}`}>{formatPrice(totalMrp)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-[#1E6B47] font-semibold">
                  <span>Botanical Savings:</span>
                  <span className="tabular-nums">-{formatPrice(totalSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#142B1F] pt-2 border-t border-[#DCEFE3]">
                <span>Estimated Total:</span>
                <span className="tabular-nums text-lg text-[#1E6B47]" title={`₹${totalAmount}`}>{formatPrice(totalAmount)}</span>
              </div>
              <p className="text-[11px] text-[#6B8576] text-center pt-0.5">
                Free shipping & free practitioner dosage schedule included
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleCheckoutViaWhatsApp}
                className="aurora-btn-primary w-full py-3 px-5 text-xs inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Dispatch Order & Consult via WhatsApp</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#526B5C]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E6B47]" />
                <span>100% Genuine Certified Ayush Formulations</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
