/**
 * Utility for formatting dates in absolute and relative formats.
 * Fully optimized for Arabic (RTL) language patterns and proper numeric alignment.
 */

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

/**
 * Formats a date into a standard readable absolute format: 12 مايو 2026 - 11:22 ص
 */
export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';

  const day = d.getDate();
  const month = MONTHS_AR[d.getMonth()];
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'م' : 'ص';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle 0 as 12

  // Force LTR alignment for time segment to prevent number reversing in mixed-directional text
  const timeStr = `\u200E${hours}:${minutes}\u200E ${ampm}`;
  
  return `${day} ${month} ${year} - ${timeStr}`;
}

/**
 * Formats a date relative to now: "منذ ساعتين", "منذ يوم", "منذ 3 أيام"
 */
export function formatRelativeTime(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) {
    return 'الآن';
  } else if (diffMins < 60) {
    if (diffMins === 1) return 'منذ دقيقة';
    if (diffMins === 2) return 'منذ دقيقتين';
    if (diffMins >= 3 && diffMins <= 10) return `منذ ${diffMins} دقائق`;
    return `منذ ${diffMins} دقيقة`;
  } else if (diffHours < 24) {
    if (diffHours === 1) return 'منذ ساعة';
    if (diffHours === 2) return 'منذ ساعتين';
    if (diffHours >= 3 && diffHours <= 10) return `منذ ${diffHours} ساعات`;
    return `منذ ${diffHours} ساعة`;
  } else if (diffDays < 7) {
    if (diffDays === 1) return 'منذ يوم';
    if (diffDays === 2) return 'منذ يومين';
    if (diffDays >= 3 && diffDays <= 10) return `منذ ${diffDays} أيام`;
    return `منذ ${diffDays} يوم`;
  } else if (diffWeeks < 4) {
    if (diffWeeks === 1) return 'منذ أسبوع';
    if (diffWeeks === 2) return 'منذ أسبوعين';
    return `منذ ${diffWeeks} أسابيع`;
  } else if (diffMonths < 12) {
    if (diffMonths === 1) return 'منذ شهر';
    if (diffMonths === 2) return 'منذ شهرين';
    if (diffMonths >= 3 && diffMonths <= 10) return `منذ ${diffMonths} أشهر`;
    return `منذ ${diffMonths} شهر`;
  } else {
    // Fallback to absolute date without time for long durations
    return `${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
  }
}
