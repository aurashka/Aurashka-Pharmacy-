/**
 * Smart compact number and currency formatter
 * Automatically formats numbers >= 1000 to k, M, B (e.g. 1k, 1.5k, 2.6k, 1.2M)
 */

export function formatCompactNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '0';
  let parsed: number;
  if (typeof num === 'string') {
    const cleaned = num.replace(/,/g, '').replace(/[^\d.-]/g, '').trim();
    parsed = parseFloat(cleaned);
  } else {
    parsed = num;
  }
  if (isNaN(parsed)) return '0';
  
  const abs = Math.abs(parsed);
  const sign = parsed < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    const val = abs / 1_000_000_000;
    return `${sign}${parseFloat(val.toFixed(2))}B`;
  }
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    return `${sign}${parseFloat(val.toFixed(2))}M`;
  }
  if (abs >= 1_000) {
    const val = abs / 1_000;
    return `${sign}${parseFloat(val.toFixed(2))}k`;
  }

  return `${sign}${Number.isInteger(parsed) ? parsed : parseFloat(parsed.toFixed(2))}`;
}

export function formatPrice(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '₹0';
  let parsed: number;
  if (typeof num === 'string') {
    const cleaned = num.replace(/,/g, '').replace(/[^\d.-]/g, '').trim();
    parsed = parseFloat(cleaned);
  } else {
    parsed = num;
  }
  if (isNaN(parsed)) return '₹0';
  return `₹${formatCompactNumber(parsed)}`;
}
