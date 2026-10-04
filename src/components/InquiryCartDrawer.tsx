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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#FBF9F5] h-full shadow-2xl flex flex-col border-l border-[#DCD5C5] text-[#1E2922]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7DFD1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#2C5E43]" />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#14291D]">
                Apothecary Dispensary List
              </h3>
              <p className="text-[11px] text-[#696051]">
                {cartItems.length} {cartItems.length === 1 ? 'Formulation' : 'Formulations'} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5F5647] hover:text-[#1E2922] hover:bg-[#EFEAE0] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EFEAE0] text-[#7A705E] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#14291D]">
                Your Dispensary List is Empty
              </h4>
              <p className="text-xs text-[#635A4B] max-w-xs">
                Explore our classical Ayurvedic formulations, view detailed therapeutic uses, and add medicines to consult with our Doctor.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(({ product, quantity }) => (
                <div 
                  key={product.id}
                  className="bg-white p-3.5 rounded-lg border border-[#E7DFD1] flex gap-3 items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded object-cover border border-[#E6E0D4] shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onOpenProductDetail(product)}
                      className="text-left font-serif text-sm font-semibold text-[#14291D] hover:text-[#2C5E43] truncate block w-full"
                    >
                      {product.name}
                    </button>
                    <div className="text-[11px] text-[#696051] truncate">
                      {product.volumeOrWeight} · {product.form}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#14291D] tabular-nums" title={`₹${product.price * quantity}`}>
                        {formatPrice(product.price * quantity)}
                      </span>
                      <span className="text-[11px] text-[#8C8271] line-through tabular-nums" title={`₹${product.mrp * quantity}`}>
                        {formatPrice(product.mrp * quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center border border-[#D5CCBC] rounded bg-[#FAF8F5]">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="p-1 hover:bg-[#EAE4D7] text-[#4A4234] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold tabular-nums text-[#14291D]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="p-1 hover:bg-[#EAE4D7] text-[#4A4234] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-red-700/80 hover:text-red-700 p-1"
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
                  className="text-xs text-[#7B715F] hover:text-red-700 transition-colors"
                >
                  Clear all items
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & WhatsApp Order CTA */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-[#E7DFD1] bg-[#FAF8F5] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5B5243]">
                <span>Total Formulation MRP:</span>
                <span className="tabular-nums" title={`₹${totalMrp}`}>{formatPrice(totalMrp)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-[#2C5E43] font-medium">
                  <span>Botanical Savings:</span>
                  <span className="tabular-nums">-{formatPrice(totalSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#14291D] pt-2 border-t border-[#E7DFD1]">
                <span>Estimated Total:</span>
                <span className="tabular-nums text-lg text-[#2C5E43]" title={`₹${totalAmount}`}>{formatPrice(totalAmount)}</span>
              </div>
              <p className="text-[11px] text-[#786F5F] text-center pt-0.5">
                Free shipping & free practitioner dosage schedule included
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckoutViaWhatsApp}
                className="w-full py-3 px-4 rounded-lg bg-[#25D366] text-white font-semibold text-xs hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                Dispatch Order & Consult via WhatsApp
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#696051]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2C5E43]" />
                <span>100% Genuine Certified Ayush Formulations</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
