/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HerbalProduct, SiteSettings } from '../types/pharmacy';
import { formatPrice } from '../utils/numberFormatter';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldCheck, 
  Tag, 
  Check, 
  MessageCircle,
  Stethoscope
} from 'lucide-react';
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
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

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

  const couponDiscount = appliedCoupon
    ? Math.round((totalAmount * appliedCoupon.discountPercent) / 100)
    : 0;

  const finalPayable = Math.max(0, totalAmount - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'AYUR10' || clean === 'VAIDYA10' || clean === 'SHREE10') {
      setAppliedCoupon({ code: clean, discountPercent: 10 });
      setCouponError(null);
    } else if (clean === 'AYUR15' || clean === 'FIRST15') {
      setAppliedCoupon({ code: clean, discountPercent: 15 });
      setCouponError(null);
    } else {
      // Allow any custom practitioner code with 5% courteous discount
      setAppliedCoupon({ code: clean, discountPercent: 5 });
      setCouponError(null);
    }
  };

  const handleCheckoutViaWhatsApp = () => {
    if (cartItems.length === 0) return;
    
    let itemsText = cartItems
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.product.name}* (${it.product.volumeOrWeight})\n   Qty: ${it.quantity} x ₹${it.product.price} = ₹${it.quantity * it.product.price}`
      )
      .join('\n');

    if (appliedCoupon) {
      itemsText += `\n\n*Applied Prescription / Coupon Code:* ${appliedCoupon.code} (-₹${couponDiscount})`;
    }

    const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);
    const template = siteSettings?.messageTemplates?.cartOrderWhatsApp || DEFAULT_MESSAGE_TEMPLATES.cartOrderWhatsApp;
    const includeUserInfo = siteSettings?.messageTemplates?.includeUserInfo ?? true;

    const formattedMsg = formatCustomMessage(
      template,
      {
        brandName: siteSettings?.brandName,
        cartSummary: itemsText,
        cartTotal: finalPayable,
      },
      currentUser,
      includeUserInfo
    );

    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  const handleConsultDoctorWhatsApp = () => {
    const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);
    let msg = `Namaste Dr. / Vaidya ji, I am looking at ordering the following Ayurvedic formulations and would like practitioner guidance regarding dosage & anupana:\n`;
    cartItems.forEach((it, idx) => {
      msg += `\n${idx + 1}. ${it.product.name} (${it.product.volumeOrWeight || it.product.form})`;
    });
    msg += `\n\nPlease advise if these are suitable for my prakriti.`;
    window.open(buildWhatsAppUrl(primaryWhatsApp.number, msg), '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#F6FAF7] h-full shadow-[0_0_50px_rgba(20,50,30,0.25)] flex flex-col border-l border-[#DCEFE3] text-[#142B1F] sm:rounded-l-3xl overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header: Back '<', Title 'Shopping Bag', and Item Count (Matching Reference Screen 3) */}
        <div className="bg-[#14291D] text-white px-5 py-4 border-b border-[#234D34] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            aria-label="Back to store"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-tight">
              Shopping Bag
            </h3>
            <p className="text-[11px] text-[#A5D6B6]">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} Selected
            </p>
          </div>

          <div className="w-9 h-9 rounded-full bg-white/10 text-amber-300 flex items-center justify-center font-mono font-bold text-xs border border-white/15">
            {cartItems.reduce((acc, it) => acc + it.quantity, 0)}
          </div>
        </div>

        {/* 2. Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#DCF3E7] text-[#143B25] flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-7 h-7 text-[#1E6B47]" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#142B1F]">
                Your Shopping Bag is Empty
              </h4>
              <p className="text-xs text-[#526B5C] max-w-xs leading-relaxed">
                Explore our classical formulations and add medicines to consult with our Vaidya.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#143B25] hover:bg-[#1E6B47] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Browse Formulations
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(({ product, quantity }) => (
                <div 
                  key={product.id}
                  className="bg-white p-3.5 rounded-3xl border border-[#DCEFE3] shadow-xs flex gap-3.5 items-center group hover:border-[#1E6B47]/50 transition-colors"
                >
                  {/* Thumbnail in soft mint background */}
                  <div className="w-16 h-16 rounded-2xl bg-[#F0FAF4] p-1.5 flex items-center justify-center shrink-0 border border-[#E4EFE8]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onOpenProductDetail(product)}
                      className="text-left font-serif text-xs sm:text-sm font-bold text-[#142B1F] hover:text-[#1E6B47] truncate block w-full transition-colors cursor-pointer"
                    >
                      {product.name}
                    </button>
                    <div className="text-[10.5px] text-[#6B8576] truncate">
                      {product.volumeOrWeight} · {product.form}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm font-mono font-bold text-[#142B1F]" title={`₹${product.price * quantity}`}>
                        {formatPrice(product.price * quantity)}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-[11px] font-mono text-[#8EA396] line-through" title={`₹${product.mrp * quantity}`}>
                          {formatPrice(product.mrp * quantity)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stepper with leading zero (e.g. [- 01 +]) matching reference image */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center border border-[#DCEFE3] rounded-full bg-[#F4FAF6] p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="w-6 h-6 rounded-full bg-white hover:bg-stone-100 text-[#142B1F] flex items-center justify-center transition-colors cursor-pointer shadow-2xs font-bold"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-[#142B1F] tabular-nums">
                        {String(quantity).padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="w-6 h-6 rounded-full bg-white hover:bg-stone-100 text-[#142B1F] flex items-center justify-center transition-colors cursor-pointer shadow-2xs font-bold"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Remove from bag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-1 flex items-center justify-between px-1">
                <span className="text-[11px] text-[#6B8576]">
                  Need practitioner consultation? Doctor available.
                </span>
                <button
                  onClick={onClearCart}
                  className="text-xs text-[#6B8576] hover:text-rose-700 font-medium transition-colors cursor-pointer"
                >
                  Clear Bag
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Promo / Prescription Coupon Box (Matching Reference Screen 3) */}
        {cartItems.length > 0 && (
          <div className="px-5 py-2.5 bg-white border-t border-[#DCEFE3]">
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-[#EAF7EE] border border-[#A5D6B6] rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#1E6B47]" />
                  <span className="font-bold text-[#14291D]">
                    Code <span className="font-mono">{appliedCoupon.code}</span> Applied! ({appliedCoupon.discountPercent}% Off)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-[11px] text-[#1E6B47] hover:underline font-bold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                <div className="flex-1 bg-[#F4FAF6] border border-[#DCEFE3] focus-within:border-[#1E6B47] rounded-full px-3.5 py-1.5 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#1E6B47] shrink-0" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon / Vaidya Code (e.g. AYUR10)"
                    className="w-full bg-transparent text-xs text-[#142B1F] placeholder-[#6B8576] uppercase font-mono focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#143B25] hover:bg-[#1E6B47] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        )}

        {/* 4. Footer Summary & Dual Call to Actions (Matching Reference Screen 3) */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-[#DCEFE3] bg-white space-y-3.5 shrink-0">
            {/* Bill Details Stack */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#526B5C]">
                <span>Total Formulation MRP:</span>
                <span className="font-mono tabular-nums font-medium" title={`₹${totalMrp}`}>
                  {formatPrice(totalMrp)}
                </span>
              </div>
              
              {totalSavings > 0 && (
                <div className="flex justify-between text-[#1E6B47] font-semibold">
                  <span>Botanical Savings:</span>
                  <span className="font-mono tabular-nums">-{formatPrice(totalSavings)}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#1E6B47] font-semibold">
                  <span>Prescription Code Discount:</span>
                  <span className="font-mono tabular-nums">-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#526B5C]">
                <span>Ayurvedic Courier Delivery:</span>
                <span className="text-[#1E6B47] font-bold">FREE</span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#14291D] pt-2 border-t border-[#DCEFE3]">
                <span>Total Payable:</span>
                <span className="font-mono tabular-nums text-lg text-[#1E6B47]" title={`₹${finalPayable}`}>
                  {formatPrice(finalPayable)}
                </span>
              </div>
            </div>

            {/* Action Buttons: Primary Proceed + Secondary WhatsApp Consult */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCheckoutViaWhatsApp}
                className="w-full py-3.5 px-6 rounded-full bg-[#143B25] hover:bg-[#1E6B47] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span>Proceed to Checkout</span>
              </button>

              <button
                onClick={handleConsultDoctorWhatsApp}
                className="w-full py-2.5 px-4 rounded-full bg-[#F4FAF6] hover:bg-[#EAF7EE] text-[#143B25] border border-[#DCEFE3] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-[#1E6B47]" />
                <span>Consult Vaidya on WhatsApp Before Ordering</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#526B5C] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E6B47]" />
                <span>100% Genuine Ayush Certified & Safe Delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
