const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;

export function isDateLike(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE_RE.test(value);
}

export function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (isDateLike(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      const hasTime = value.includes('T');
      return hasTime
        ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
        : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
    }
  }
  return String(value);
}

export function toDateInputValue(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  return value.slice(0, 10);
}
