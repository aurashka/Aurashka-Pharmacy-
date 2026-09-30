import { SiteSettings, AppUser, MessageTemplates } from '../types/pharmacy';

export const DEFAULT_MESSAGE_TEMPLATES: MessageTemplates = {
  headerWhatsApp: 'Namaste, I want to inquire about {brandName} herbal formulations and clinical consultation.',
  floatingWhatsApp: 'Namaste Doctor ji, I am on the {brandName} website and need immediate herbal advice or dosage guidance.',
  frontContactBarWhatsApp: 'Namaste, I would like to contact {brandName} for medicine inquiries and order details.',
  heroWhatsApp: 'Namaste, I am browsing {brandName} Herbal Apothecary and would like to inquire about formulations and current deals.',
  productInquiryWhatsApp: 'Namaste, I want to inquire about "{productName}" (Deal price ₹{productPrice}{resellerInfo}). Please share availability and dosage advice.',
  cartOrderWhatsApp: '*HERBAL PHARMACY ORDER & DOSAGE CONSULTATION*\n------------------------------------\nNamaste Doctor ji, I would like to order and consult on the following herbal formulations:\n\n{cartSummary}\n\n*Total Estimated Value:* ₹{cartTotal}\n------------------------------------\nPlease verify dosage suitability for me and confirm delivery address details.',
  consultationWhatsApp: 'Namaste Doctor ji, I need dosage & clinical consultation for "{ailment}". Please guide me on medicines and authentic routine.',
  contactFormEmailSubject: '{brandName} Inquiry: {subject}',
  contactFormEmailBody: 'Hello {brandName} Apothecary Team,\n\nI have an inquiry regarding: {subject}\n\nMessage Details:\n{message}',
  includeUserInfo: true,
};

export interface MessageVariables {
  brandName?: string;
  productName?: string;
  productPrice?: number;
  resellerInfo?: string;
  cartSummary?: string;
  cartTotal?: number | string;
  ailment?: string;
  subject?: string;
  message?: string;
  phone?: string;
  email?: string;
}

export function getCurrentFormattedDateTime(): string {
  try {
    const now = new Date();
    return now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Replaces placeholder tokens in template and optionally appends logged-in user meta.
 */
export function formatCustomMessage(
  template: string,
  variables: MessageVariables = {},
  currentUser: AppUser | null = null,
  includeUserInfo: boolean = true
): string {
  const brandName = variables.brandName || 'Aurashka';
  const userName = currentUser ? currentUser.name : 'Guest User';
  const userEmail = currentUser ? currentUser.email : 'Not logged in';
  const currentTime = getCurrentFormattedDateTime();

  let text = template || '';

  // Variable replacements
  text = text.replace(/\{brandName\}/g, brandName);
  text = text.replace(/\{userName\}/g, userName);
  text = text.replace(/\{userEmail\}/g, userEmail);
  text = text.replace(/\{currentTime\}/g, currentTime);

  if (variables.productName) {
    text = text.replace(/\{productName\}/g, variables.productName);
  }
  if (variables.productPrice !== undefined) {
    text = text.replace(/\{productPrice\}/g, String(variables.productPrice));
  }
  if (variables.resellerInfo !== undefined) {
    text = text.replace(/\{resellerInfo\}/g, variables.resellerInfo);
  } else {
    text = text.replace(/\{resellerInfo\}/g, '');
  }
  if (variables.cartSummary) {
    text = text.replace(/\{cartSummary\}/g, variables.cartSummary);
  }
  if (variables.cartTotal !== undefined) {
    text = text.replace(/\{cartTotal\}/g, String(variables.cartTotal));
  }
  if (variables.ailment) {
    text = text.replace(/\{ailment\}/g, variables.ailment);
  }
  if (variables.subject) {
    text = text.replace(/\{subject\}/g, variables.subject);
  }
  if (variables.message) {
    text = text.replace(/\{message\}/g, variables.message);
  }
  if (variables.phone) {
    text = text.replace(/\{phone\}/g, variables.phone);
  }
  if (variables.email) {
    text = text.replace(/\{email\}/g, variables.email);
  }

  // If includeUserInfo is enabled and template doesn't explicitly have {userName}, append patient details
  const alreadyHasUserToken = template.includes('{userName}') || template.includes('{userEmail}');
  if (includeUserInfo && !alreadyHasUserToken && currentUser) {
    text += `\n\n--- Patient / User Info ---\nName: ${currentUser.name}\nEmail: ${currentUser.email}\nTimestamp: ${currentTime}`;
  }

  return text;
}

/**
 * Returns primary WhatsApp number & display string from SiteSettings
 */
export function getPrimaryWhatsApp(siteSettings?: SiteSettings): { number: string; displayNumber: string } {
  const defaultWhatsApp = {
    number: '919876543210',
    displayNumber: '+91 98765 43210',
  };

  if (!siteSettings?.contacts?.whatsapps || siteSettings.contacts.whatsapps.length === 0) {
    return defaultWhatsApp;
  }

  const primary = siteSettings.contacts.whatsapps[0];
  const cleanNumber = primary.number.replace(/[^0-9]/g, '');

  return {
    number: cleanNumber || defaultWhatsApp.number,
    displayNumber: primary.displayNumber || primary.number || defaultWhatsApp.displayNumber,
  };
}

/**
 * Returns primary Phone string from SiteSettings
 */
export function getPrimaryPhone(siteSettings?: SiteSettings): string {
  if (!siteSettings?.contacts?.phones || siteSettings.contacts.phones.length === 0) {
    return '+91 98765 43210';
  }
  return siteSettings.contacts.phones[0].number || '+91 98765 43210';
}

/**
 * Returns primary Email string from SiteSettings
 */
export function getPrimaryEmail(siteSettings?: SiteSettings): string {
  if (!siteSettings?.contacts?.emails || siteSettings.contacts.emails.length === 0) {
    return 'care@aurashka.com';
  }
  return siteSettings.contacts.emails[0].email || 'care@aurashka.com';
}

/**
 * Helper to construct a WhatsApp click URL
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

/**
 * Helper to construct a mailto link
 */
export function buildMailtoUrl(email: string, subject: string, body: string): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
}
