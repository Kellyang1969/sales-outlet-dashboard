// Small formatting helpers shared by the renderer.

export const esc = s =>
  String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const money = n => 'S$' + Math.round(n).toLocaleString('en-SG');
export const num = n => Math.round(n).toLocaleString('en-SG');
export const pct = (a, b) => (b ? (a / b) * 100 : 0);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// '2026-09-07' -> '7 Sep'  (parsed by hand so time zones can't shift the date)
export const dayMon = iso => {
  const [, m, d] = iso.split('-');
  return `${+d} ${MONTHS[+m - 1]}`;
};
export const dayMonYr = iso => `${dayMon(iso)} ${iso.slice(0, 4)}`;
