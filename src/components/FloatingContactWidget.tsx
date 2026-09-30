import React from 'react';
import { Phone, MessageCircle, Calendar } from 'lucide-react';
import { PHARMACY_CONTACT_INFO } from '../data/herbalProducts';

interface FloatingContactWidgetProps {
  onOpenConsultationModal: () => void;
}

export const FloatingContactWidget: React.FC<FloatingContactWidgetProps> = ({
  onOpenConsultationModal,
}) => {
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Namaste Vaidya ji, I am on the VedaVriksha website and need immediate herbal advice or dosage guidance.`
    );
    window.open(`https://wa.me/${PHARMACY_CONTACT_INFO.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <aside 
      aria-label="Quick Contact Helpline"
      className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex items-center gap-2"
    >
      {/* Floating Action Pill */}
      <div className="bg-[#183624]/95 backdrop-blur-md text-white p-1.5 sm:p-2 rounded-full shadow-2xl border border-[#2D6043] flex items-center gap-1.5 sm:gap-2">
        {/* Direct Call Button */}
        <a
          href={`tel:${PHARMACY_CONTACT_INFO.helplinePhone.replace(/\s+/g, '')}`}
          aria-label="Call Herbal Pharmacist"
          className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#D8EADB] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          <Phone className="w-3.5 h-3.5 text-[#A5D6B6]" />
          <span className="hidden md:inline font-mono">Call Pharmacist</span>
        </a>

        {/* Book Consultation Modal */}
        <button
          onClick={onOpenConsultationModal}
          className="hidden sm:flex px-3 py-2 rounded-full bg-[#E7EFEA] text-[#14291D] hover:bg-[#d5e4db] transition-colors items-center gap-1.5 text-xs font-semibold"
        >
          <Calendar className="w-3.5 h-3.5 text-[#2C5E43]" />
          <span>Consult Vaidya</span>
        </button>

        {/* Direct WhatsApp Instant Consultation */}
        <button
          onClick={handleWhatsApp}
          className="px-3.5 py-2 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Vaidya</span>
        </button>
      </div>
    </aside>
  );
};
