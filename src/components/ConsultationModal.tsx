import React, { useState } from 'react';
import { X, Send, Phone, MessageSquare, Clock, CheckCircle2, User, Mail, ShieldAlert } from 'lucide-react';
import { HERBAL_PRODUCTS } from '../data/herbalProducts';
import { SiteSettings } from '../types/pharmacy';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl 
} from '../utils/messageFormatter';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: string;
  siteSettings?: SiteSettings;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  initialProduct = '',
  siteSettings,
}) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: '',
    email: currentUser?.email || '',
    ailment: '',
    selectedProduct: initialProduct,
    contactMethod: 'whatsapp' as 'whatsapp' | 'phone' | 'email',
    timeSlot: 'Morning (9:00 AM - 1:00 PM)',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  const handleDirectWhatsApp = () => {
    const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);
    const template = siteSettings?.messageTemplates?.consultationWhatsApp || DEFAULT_MESSAGE_TEMPLATES.consultationWhatsApp;
    const includeUserInfo = siteSettings?.messageTemplates?.includeUserInfo ?? true;

    const formattedMsg = formatCustomMessage(
      template,
      {
        brandName: siteSettings?.brandName,
        ailment: formData.ailment || 'Classical Herbal Health & Dosage Consultation',
        phone: formData.phone,
        email: formData.email,
        message: formData.notes,
      },
      currentUser || (formData.fullName ? { id: 'patient', name: formData.fullName, email: formData.email, role: 'user' } : null),
      includeUserInfo
    );

    const url = buildWhatsAppUrl(primaryWhatsApp.number, formattedMsg);
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#FBF9F5] border border-[#DCD5C5] rounded-xl shadow-2xl text-[#1E2922] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#14291D] text-white">
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase tracking-wider text-[#A5D6B6] font-semibold">
              Aurashka Apothecary
            </span>
            <h3 className="font-serif text-lg font-bold">
              Dosage & Clinical Consultation
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close consultation modal"
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#E7EFEA] text-[#2C5E43] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-2xl font-bold text-[#14291D]">
                Consultation Request Received
              </h4>
              <p className="text-xs text-[#524B3F] max-w-sm mx-auto">
                Thank you, <span className="font-semibold text-[#1E2922]">{formData.fullName}</span>. Our registered Ayurvedic Vaidya ({siteSettings?.headPharmacist || 'Vaidya Harshit Maan (BAMS, MD Ayu.)'}) has received your clinical query.
              </p>
            </div>

            <div className="p-4 bg-[#F2EDE1] rounded-lg border border-[#E4DCCE] text-left text-xs space-y-1.5 text-[#3F392E]">
              <p><span className="font-medium text-[#1E2922]">Expected Response:</span> Within 15 to 30 minutes during pharmacy working hours.</p>
              <p><span className="font-medium text-[#1E2922]">Selected Mode:</span> {formData.contactMethod.toUpperCase()} ({formData.phone || formData.email})</p>
              <p><span className="font-medium text-[#1E2922]">Preferred Time:</span> {formData.timeSlot}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={handleDirectWhatsApp}
                className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                Open Instant WhatsApp Chat
              </button>
              <button
                onClick={handleResetAndClose}
                className="py-2.5 px-4 text-xs font-medium rounded-lg border border-[#D5CCBC] text-[#362F24] hover:bg-[#EFEAE0] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="p-3 bg-[#F4F0E6] rounded-lg border border-[#E3DBD0] text-xs text-[#544C3F] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#2C5E43] shrink-0 mt-0.5" />
              <span>
                Personalized dosage suggestions are prepared by certified Ayurvedic practitioners strictly aligned with AYUSH protocols.
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#2F2920] mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-[#8A8070]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Phone / WhatsApp Number <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-[#8A8070]" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#8A8070]" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#2F2920] mb-1">
                  Health Concern / Symptom / Ailment <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Joint stiffness in morning, chronic acidity, insomnia, cough..."
                  value={formData.ailment}
                  onChange={(e) => setFormData({ ...formData, ailment: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#2F2920] mb-1">
                  Product of Interest (If any specific formulation)
                </label>
                <select
                  value={formData.selectedProduct}
                  onChange={(e) => setFormData({ ...formData, selectedProduct: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                >
                  <option value="">General Health Consultation (Not decided yet)</option>
                  {HERBAL_PRODUCTS.map((prod) => (
                    <option key={prod.id} value={prod.name}>
                      {prod.name} ({prod.form})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Preferred Contact Mode
                  </label>
                  <select
                    value={formData.contactMethod}
                    onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                  >
                    <option value="whatsapp">WhatsApp Consultation</option>
                    <option value="phone">Direct Phone Call</option>
                    <option value="email">Detailed Email Prescription</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Preferred Callback Window
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                  >
                    <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                    <option value="Evening (5:00 PM - 8:30 PM)">Evening (5:00 PM - 8:30 PM)</option>
                    <option value="Urgent (Within 30 mins)">Urgent (Within 30 mins)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#2F2920] mb-1">
                  Additional Notes (Any ongoing allopathic drugs / allergies)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention if you are diabetic, pregnant, or taking BP medications..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-[#645A4B] hover:text-[#1E2922] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-[#183624] hover:bg-[#234D34] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Consultation Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
