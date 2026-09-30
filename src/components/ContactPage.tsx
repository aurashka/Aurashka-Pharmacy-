import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '../types/pharmacy';
import { useAuth } from '../context/AuthContext';
import { 
  getPrimaryWhatsApp, 
  getPrimaryEmail, 
  formatCustomMessage, 
  DEFAULT_MESSAGE_TEMPLATES, 
  buildWhatsAppUrl, 
  buildMailtoUrl 
} from '../utils/messageFormatter';

interface ContactPageProps {
  siteSettings: SiteSettings;
  onBack: () => void;
  onOpenConsultationModal: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ 
  siteSettings,
  onBack,
  onOpenConsultationModal,
}) => {
  const { currentUser } = useAuth();
  const [contactForm, setContactForm] = useState({
    name: currentUser?.name || '',
    phone: '',
    email: currentUser?.email || '',
    subject: 'Medicine Order / Deal Inquiry',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const primaryWhatsApp = getPrimaryWhatsApp(siteSettings);
  const primaryEmail = getPrimaryEmail(siteSettings);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const handleSendViaWhatsApp = () => {
    const template = siteSettings.messageTemplates?.frontContactBarWhatsApp || DEFAULT_MESSAGE_TEMPLATES.frontContactBarWhatsApp;
    const includeUserInfo = siteSettings.messageTemplates?.includeUserInfo ?? true;
    const composed = formatCustomMessage(
      `*DIRECT INQUIRY - ${siteSettings.brandName}*\nSubject: {subject}\nMessage: {message}\nPhone: {phone}`,
      {
        brandName: siteSettings.brandName,
        subject: contactForm.subject,
        message: contactForm.message || 'I would like to inquire about formulations.',
        phone: contactForm.phone,
        email: contactForm.email,
      },
      currentUser || (contactForm.name ? { id: 'patient', name: contactForm.name, email: contactForm.email, role: 'user' } : null),
      includeUserInfo
    );
    window.open(buildWhatsAppUrl(primaryWhatsApp.number, composed), '_blank');
  };

  const handleSendViaEmail = () => {
    const subjectTemplate = siteSettings.messageTemplates?.contactFormEmailSubject || DEFAULT_MESSAGE_TEMPLATES.contactFormEmailSubject;
    const bodyTemplate = siteSettings.messageTemplates?.contactFormEmailBody || DEFAULT_MESSAGE_TEMPLATES.contactFormEmailBody;
    const includeUserInfo = siteSettings.messageTemplates?.includeUserInfo ?? true;

    const formattedSubject = formatCustomMessage(
      subjectTemplate,
      { brandName: siteSettings.brandName, subject: contactForm.subject },
      currentUser,
      false
    );
    const formattedBody = formatCustomMessage(
      bodyTemplate,
      {
        brandName: siteSettings.brandName,
        subject: contactForm.subject,
        message: contactForm.message || 'No additional details provided.',
        phone: contactForm.phone,
        email: contactForm.email,
      },
      currentUser || (contactForm.name ? { id: 'patient', name: contactForm.name, email: contactForm.email, role: 'user' } : null),
      includeUserInfo
    );

    window.open(buildMailtoUrl(primaryEmail, formattedSubject, formattedBody), '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendViaWhatsApp();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2922]">
      {/* Top Breadcrumb & Return Bar */}
      <div className="bg-[#14291D] text-white border-b border-[#234D34] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-[#A5D6B6] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Apothecary Catalog</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-white/70">
            <span>Home</span>
            <span>/</span>
            <span className="text-white font-medium">Contact & Helpline</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-linear-to-b from-[#14291D] to-[#1C3A27] text-white py-10 sm:py-14 px-4 sm:px-6 border-b border-[#234D34]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C5E43]/60 border border-[#3E7A5A] text-[#A5D6B6] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {siteSettings.brandName} Helpdesk & Consultation
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Direct Contacts, Clinic & Patient Helpline
          </h1>

          <p className="text-xs sm:text-sm text-[#C2D6C9] max-w-2xl mx-auto leading-relaxed">
            Reach our registered Ayurvedic Doctors and pharmacy dispenses directly. Inquire about medicines, verify authentic classical dosages, or track delivery details.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Phone Helpline Lines */}
          <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4 hover:border-[#14291D]/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E7EFEA] flex items-center justify-center text-[#14291D]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#14291D]">Direct Phone Helpline</h3>
                <p className="text-[11px] text-[#695F4F]">Dispensary & Pharmacist on call</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {siteSettings.contacts.phones.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2C5E43] block">
                      {p.label}
                    </span>
                    <a
                      href={`tel:${p.number.replace(/\s+/g, '')}`}
                      className="font-mono text-sm font-bold text-[#14291D] hover:text-[#2C5E43] transition-colors"
                    >
                      {p.number}
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${p.number.replace(/\s+/g, '')}`}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#183624] text-white hover:bg-[#255237] rounded transition-colors"
                    >
                      Call
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(p.number, `phone_${idx}`)}
                      className="p-1 text-[#695F4F] hover:text-[#14291D] rounded hover:bg-stone-200 transition-colors"
                      title="Copy phone number"
                    >
                      {copiedItem === `phone_${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. WhatsApp Channels */}
          <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4 hover:border-[#25D366]/60 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E7F8ED] flex items-center justify-center text-[#25D366]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#14291D]">WhatsApp Consultations</h3>
                <p className="text-[11px] text-[#695F4F]">Instant prescriptions & queries</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {siteSettings.contacts.whatsapps.map((w, idx) => {
                const cleanNum = w.number.replace(/[^0-9]/g, '');
                const waUrl = buildWhatsAppUrl(
                  cleanNum,
                  `Namaste ${siteSettings.brandName} Doctor, I would like to inquire regarding formulations & dosage guidance.`
                );

                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#25D366] block">
                        {w.label}
                      </span>
                      <span className="font-mono text-sm font-bold text-[#14291D]">
                        {w.displayNumber || w.number}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-[11px] font-semibold bg-[#25D366] text-white hover:bg-[#20bd5a] rounded transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(w.displayNumber || w.number, `wa_${idx}`)}
                        className="p-1 text-[#695F4F] hover:text-[#14291D] rounded hover:bg-stone-200 transition-colors"
                        title="Copy WhatsApp number"
                      >
                        {copiedItem === `wa_${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Direct Email Addresses */}
          <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4 hover:border-[#14291D]/40 transition-all md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E7EFEA] flex items-center justify-center text-[#14291D]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#14291D]">Official Email Desk</h3>
                <p className="text-[11px] text-[#695F4F]">Formal clinical inquiries & deals</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {siteSettings.contacts.emails.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-between gap-2">
                  <div className="space-y-0.5 truncate mr-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2C5E43] block">
                      {m.label}
                    </span>
                    <a
                      href={`mailto:${m.address}`}
                      className="text-xs font-semibold text-[#14291D] hover:text-[#2C5E43] transition-colors truncate block"
                      title={m.address}
                    >
                      {m.address}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`mailto:${m.address}`}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#183624] text-white hover:bg-[#255237] rounded transition-colors"
                    >
                      Email
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(m.address, `email_${idx}`)}
                      className="p-1 text-[#695F4F] hover:text-[#14291D] rounded hover:bg-stone-200 transition-colors"
                      title="Copy email address"
                    >
                      {copiedItem === `email_${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Timings Card + Clinical Consultation CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E8E2D5] pb-3">
              <MapPin className="w-5 h-5 text-[#2C5E43]" />
              <h3 className="font-serif font-bold text-base text-[#14291D]">
                Apothecary Dispensary & Pharmacopoeia Address
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="space-y-2">
                <span className="font-bold text-[#14291D] uppercase tracking-wider text-[10px] text-[#2C5E43]">
                  Registered Location
                </span>
                <p className="text-[#3A3225] font-medium">
                  {siteSettings.address}
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-[#695F4F]">
                  <ShieldCheck className="w-4 h-4 text-[#2C5E43]" />
                  <span>Licensed under AYUSH Ministry Drug Control</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#14291D] uppercase tracking-wider text-[10px] text-[#2C5E43]">
                  Clinic & Dispense Hours
                </span>
                <p className="text-[#3A3225]">
                  {siteSettings.timings}
                </p>
                <p className="text-[11px] text-[#716858]">
                  WhatsApp dispatch & emergency herbal tele-consultation available 24/7.
                </p>
              </div>
            </div>
          </div>

          {/* Consultation CTA */}
          <div className="bg-[#14291D] text-white p-6 rounded-xl shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5D6B6] font-bold">
                Personalized Care
              </span>
              <h3 className="font-serif text-lg font-bold">
                Clinical Dosage & Routine Guidance
              </h3>
              <p className="text-xs text-[#C2D6C9] leading-relaxed">
                Connect directly with a registered Doctor to identify your Prakriti, select classical herbs, and receive free dosage charts.
              </p>
            </div>

            <button
              onClick={onOpenConsultationModal}
              className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Free Consultation</span>
            </button>
          </div>
        </div>

        {/* Patient Direct Inquiry Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#D5CCBC] shadow-xs space-y-6">
          <div className="border-b border-[#E8E2D5] pb-4">
            <h3 className="font-serif text-xl font-bold text-[#14291D]">
              Send Direct Message / Formulation Request
            </h3>
            <p className="text-xs text-[#695F4F] mt-1">
              Your inquiry will be sent directly via WhatsApp or Email to our pharmacy desk for prompt assistance.
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-300 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-serif text-base font-bold text-emerald-950">Inquiry Dispatched!</h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Thank you for contacting {siteSettings.brandName}. If WhatsApp did not open automatically, you can also use our direct phone or chat buttons above.
              </p>
              <button
                type="button"
                onClick={() => setFormSubmitted(false)}
                className="px-4 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Your Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Phone / WhatsApp Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block font-medium text-[#2F2920] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="e.g. patient@example.com"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#2F2920] mb-1">
                  Inquiry Subject
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="e.g. Bulk Ayurvedic deal order or dosage question"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-semibold text-[#14291D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#2F2920] mb-1">
                  Message Details & Formulation Queries
                </label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Mention product name, required quantity, medical background, or delivery inquiry..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendViaEmail}
                  className="px-5 py-2.5 rounded-lg border border-[#CFC5B4] text-[#3E3425] hover:bg-[#F2ECE1] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#2C5E43]" />
                  <span>Send via Email Client</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Direct via WhatsApp</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
