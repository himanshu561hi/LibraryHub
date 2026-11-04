/**
 * Formatting utilities for currency, dates, and phone numbers.
 */

/**
 * Format currency amount into standard Indian Rupee string (₹).
 */
export function formatCurrency(amount) {
  if (typeof amount === 'string' && amount.startsWith('₹')) {
    return amount;
  }
  const numeric = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(numeric)) return '₹0';
  return `₹${numeric.toLocaleString('en-IN')}`;
}

/**
 * Clean phone number for tel: links.
 */
export function formatTelLink(phone) {
  if (!phone) return '';
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/**
 * Generate direct WhatsApp chat URL with prefilled message.
 */
export function formatWhatsAppLink(phone, message = '') {
  const cleanNumber = phone.replace(/[^\d]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
}

