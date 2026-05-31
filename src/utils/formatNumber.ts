/**
 * Utility for formatting numbers, currency, and percentages in a safe LTR wrapper.
 * Prevents number inversion/flipping and alignment issues in Arabic/RTL contexts.
 */

// Left-to-Right Mark to prevent RTL layout flipping of numbers and symbols
const LRM = '\u200E';

/**
 * Formats a number with comma separators and LTR safety
 */
export function formatNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'string' ? Number(val) : val;
  if (isNaN(num)) return String(val);

  // Format standard English digits to maintain consistency and prevent breaking chart engines
  const formatted = num.toLocaleString('en-US');
  
  // Wrap with Left-to-Right Marks to prevent punctuation/symbol flipping under RTL
  return `${LRM}${formatted}${LRM}`;
}

/**
 * Formats currency in Egyptian Pound (ج.م) safely without flipping
 */
export function formatCurrency(
  val: number | string | null | undefined,
  currency = 'ج.م'
): string {
  const formattedNum = formatNumber(val);
  return `${LRM}${formattedNum} ${currency}${LRM}`;
}

/**
 * Formats a percentage safely without flipping
 */
export function formatPercent(val: number | string | null | undefined): string {
  const num = typeof val === 'string' ? Number(val) : val;
  if (isNaN(num as number)) return '0%';
  const formattedNum = formatNumber(num);
  return `${LRM}${formattedNum}%${LRM}`;
}
