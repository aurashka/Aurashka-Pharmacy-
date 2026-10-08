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
  MessageSquare
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

interface ContactSectionProps {
  onOpenConsultationModal: () => void;
  siteSettings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  onOpenConsultationModal,
  siteSettings,
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
    setFormSubmitted(true);
    handleSendViaWhatsApp();
  };

  const handleOpenGoogleMaps = () => {
    if (siteSettings.storeMap?.googleMapsUrl?.trim()) {
      window.open(siteSettings.storeMap.googleMapsUrl.trim(), '_blank');
      return;
    }
    const queryLocation = siteSettings.storeMap?.mapQuery || siteSettings.storeAddress || siteSettings.brandName;
    const query = encodeURIComponent(
      `${siteSettings.brandName}, ${queryLocation}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const isMinimapVisible = siteSettings.showStoreMap !== false && siteSettings.storeMap?.enabled !== false;
  const mapLocationQuery = siteSettings.storeMap?.mapQuery || siteSettings.storeAddress || 'New Delhi, India';

  return (
    <section id="contact-us" className="py-12 px-4 sm:px-6 bg-white border-b border-[#E7DFD1] scroll-mt-20">
      <div id="contact-front" className="-top-24 relative" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Minimalist Section Header */}
        <div className="max-w-2xl space-y-1">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#2C5E43]">
            Direct Apothecary Contacts
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14291D]">
            Connect with {siteSettings.brandName}
          </h2>
          <p className="text-xs sm:text-sm text-[#665D4D]">
            Reach our pharmacist desk across multiple helplines, WhatsApp channels, or email desks.
          </p>
        </div>

        {/* 3 Contact Categories with Multi-Item Support */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Multiple Phone & Helpline Numbers */}
          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E7DFD1] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#E7EFEA] text-[#183624] flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#14291D]">
                  Direct Phone Lines
                </h3>
                <p className="text-[11px] text-[#716757] mt-0.5">
                  {siteSettings.storeTimings}
                </p>
              </div>

              {/* List of Multiple Phones */}
              <div className="space-y-2 pt-1">
                {siteSettings.contacts.phones.map((p, idx) => (
                  <div key={p.id || idx} className="p-2 bg-white rounded-lg border border-[#EAE3D4] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8A8070] block">
                        {p.label}
                      </span>
                      <a
                        href={`tel:${p.number.replace(/\s+/g, '')}`}
                        className="font-mono text-xs font-bold text-[#14291D] hover:underline"
                      >
                        {p.number}
                      </a>
                    </div>
                    <a
                      href={`tel:${p.number.replace(/\s+/g, '')}`}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#14291D] text-white rounded hover:bg-[#203F2D] transition-colors"
                    >
                      Call
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Multiple WhatsApp Consultation Channels */}
          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E7DFD1] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#E7EFEA] text-[#25D366] flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#14291D]">
                  WhatsApp Channels
                </h3>
                <p className="text-[11px] text-[#716757] mt-0.5">
                  Instant response for orders & dosage charts.
                </p>
              </div>

              {/* List of Multiple WhatsApps */}
              <div className="space-y-2 pt-1">
                {siteSettings.contacts.whatsapps.map((w, idx) => (
                  <div key={w.id || idx} className="p-2 bg-white rounded-lg border border-[#EAE3D4] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8A8070] block">
                        {w.label}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#14291D]">
                        {w.displayNumber || w.number}
                      </span>
                    </div>
                    <a
                      href={buildWhatsAppUrl(w.number, formatCustomMessage(
                        siteSettings.messageTemplates?.frontContactBarWhatsApp || DEFAULT_MESSAGE_TEMPLATES.frontContactBarWhatsApp,
                        { brandName: siteSettings.brandName, subject: w.label },
                        currentUser,
                        siteSettings.messageTemplates?.includeUserInfo ?? true
                      ))}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#25D366] text-white rounded hover:bg-[#20bd5a] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Chat</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Multiple Support & Doctor Emails */}
          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E7DFD1] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#E7EFEA] text-[#183624] flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#14291D]">
                  Email Desks
                </h3>
                <p className="text-[11px] text-[#716757] mt-0.5">
                  Official inquiries & prescription verification.
                </p>
              </div>

              {/* List of Multiple Emails */}
              <div className="space-y-2 pt-1">
                {siteSettings.contacts.emails.map((e, idx) => (
                  <div key={e.id || idx} className="p-2 bg-white rounded-lg border border-[#EAE3D4] flex items-center justify-between">
                    <div className="truncate max-w-[170px]">
                      <span className="text-[10px] uppercase font-bold text-[#8A8070] block">
                        {e.label}
                      </span>
                      <a
                        href={buildMailtoUrl(
                          e.email,
                          formatCustomMessage(
                            siteSettings.messageTemplates?.contactFormEmailSubject || DEFAULT_MESSAGE_TEMPLATES.contactFormEmailSubject,
                            { brandName: siteSettings.brandName, subject: e.label },
                            currentUser,
                            false
                          ),
                          formatCustomMessage(
                            siteSettings.messageTemplates?.contactFormEmailBody || DEFAULT_MESSAGE_TEMPLATES.contactFormEmailBody,
                            { brandName: siteSettings.brandName, subject: e.label, message: `Inquiry regarding ${e.label} department.` },
                            currentUser,
                            siteSettings.messageTemplates?.includeUserInfo ?? true
                          )
                        )}
                        className="font-medium text-xs text-[#2C5E43] hover:underline truncate block"
                      >
                        {e.email}
                      </a>
                    </div>
                    <button
                      onClick={() => handleCopy(e.email, e.email)}
                      className="p-1.5 text-xs text-[#554C3E] hover:bg-[#EFEAE0] rounded"
                      title="Copy email"
                    >
                      {copiedItem === e.email ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Physical Store Address, Timings & Interactive Minimap Card */}
        {isMinimapVisible ? (
          <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E7DFD1] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#EAE3D4] pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E7EFEA] text-[#183624] flex items-center justify-center shrink-0 border border-[#CDE1D4]">
                  <MapPin className="w-5 h-5 text-[#2C5E43]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif text-base sm:text-lg font-bold text-[#14291D]">
                      {siteSettings.storeMap?.locationTitle || 'Dispensary Store & Botanical Garden Location'}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#14291D] border border-emerald-300">
                      Live Minimap
                    </span>
                  </div>
                  <p className="text-xs text-[#554C3E] mt-1 max-w-2xl leading-relaxed">
                    {siteSettings.storeAddress}
                  </p>
                  <div className="text-[11px] text-[#2C5E43] font-medium mt-1">
                    Timing: {siteSettings.storeTimings} · Registration: {siteSettings.regNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleOpenGoogleMaps}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[#14291D] text-white font-semibold text-xs hover:bg-[#234A32] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  title="Open exact location in Google Maps directions"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Open in Google Maps</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(siteSettings.storeAddress, 'address')}
                  className="py-2.5 px-3 rounded-xl border border-[#DDD5C5] text-[#362E22] hover:bg-[#EFEAE0] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedItem === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Interactive Embedded Minimap Viewport */}
            <div 
              onClick={handleOpenGoogleMaps}
              className="rounded-2xl overflow-hidden border border-[#DDD5C5] bg-white h-60 sm:h-72 relative group cursor-pointer shadow-inner"
              title="Click anywhere on the map to open in Google Maps"
            >
              <iframe
                title="Dispensary Location Minimap"
                src={
                  siteSettings.storeMap?.embedUrl?.trim() ||
                  `https://maps.google.com/maps?q=${encodeURIComponent(mapLocationQuery)}&t=&z=${siteSettings.storeMap?.zoom || 15}&ie=UTF8&iwloc=&output=embed`
                }
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-transparent group-hover:bg-[#14291D]/5 transition-colors" />

              {/* Floating Bottom Action Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#DDD5C5] shadow-md text-xs font-semibold text-[#14291D] flex items-center gap-1.5 pointer-events-auto">
                  <MapPin className="w-3.5 h-3.5 text-red-600 animate-bounce shrink-0" />
                  <span className="truncate max-w-[170px] sm:max-w-xs">{mapLocationQuery}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenGoogleMaps();
                  }}
                  className="px-3.5 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 pointer-events-auto transition-transform group-hover:scale-105 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  <span>View on Google Maps</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E7DFD1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E7EFEA] text-[#183624] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-[#14291D]">
                  Dispensary Store & Botanical Garden Address
                </h4>
                <p className="text-xs text-[#554C3E] mt-0.5 max-w-xl leading-relaxed">
                  {siteSettings.storeAddress}
                </p>
                <div className="text-[11px] text-[#2C5E43] font-medium mt-1">
                  Timing: {siteSettings.storeTimings} · Registration: {siteSettings.regNumber}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOpenGoogleMaps}
                className="py-2 px-4 rounded-lg bg-[#14291D] text-white font-medium text-xs hover:bg-[#234A32] transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </button>
              <button
                onClick={() => handleCopy(siteSettings.storeAddress, 'address')}
                className="py-2 px-3 rounded-lg border border-[#DDD5C5] text-[#362E22] hover:bg-[#EFEAE0] text-xs transition-colors flex items-center gap-1"
              >
                {copiedItem === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
          </div>
        )}

        {/* Direct Inquiry Form */}
        <div className="bg-[#FAF8F5] p-6 rounded-xl border border-[#E4DDD0] shadow-xs max-w-3xl">
          <div className="mb-4">
            <h3 className="font-serif text-lg font-bold text-[#14291D]">
              Direct Patient Inquiry
            </h3>
            <p className="text-xs text-[#6E6352]">
              Send a note to our pharmacist regarding medicine queries or custom dosages.
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-4 bg-white rounded-lg border border-[#DDD5C5] text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-[#E7EFEA] text-[#2C5E43] mx-auto flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#14291D]">
                Inquiry received, {contactForm.name}! Our team will get back to you promptly.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="text-xs text-[#2C5E43] underline font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Subject</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                  >
                    <option value="Medicine Order / Deal Inquiry">Order / Deal Inquiry</option>
                    <option value="Dosage Schedule Advice">Dosage Advice</option>
                    <option value="Prescription Fulfillment">Prescription Fulfillment</option>
                    <option value="General Health Query">General Health Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#2B251D] mb-1">Message / Requirements</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the medicines or dosage advice needed..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] text-xs text-[#1E2922]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendViaEmail}
                  className="py-2 px-4 rounded-lg bg-white border border-[#DDD5C5] text-[#2C5E43] hover:bg-[#FAF8F5] font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title={`Send directly to ${primaryEmail}`}
                >
                  <Mail className="w-3.5 h-3.5 text-[#2C5E43]" />
                  <span>Send via Email</span>
                </button>

                <button
                  type="submit"
                  className="py-2 px-5 rounded-lg bg-[#25D366] text-white font-semibold text-xs hover:bg-[#20bd5a] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title={`Send directly to WhatsApp: ${primaryWhatsApp.displayNumber}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
