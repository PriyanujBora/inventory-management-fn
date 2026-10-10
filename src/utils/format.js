const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const number = new Intl.NumberFormat('en-IN');
const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const dateOnly = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });

// ₹1,560.00. Unknown amounts show as a dash.
export const formatINR = (value) => (value === null || value === undefined ? '—' : inr.format(value));

export const formatNumber = (value) => (value === null || value === undefined ? '—' : number.format(value));

// Local time, e.g. "11 Oct 2026, 3:05 pm"
export const formatDateTime = (iso) => (iso ? dateTime.format(new Date(iso)) : '—');

export const formatDate = (iso) => (iso ? dateOnly.format(new Date(iso)) : '—');

// +5 / −3 / 0, with a proper minus sign
export const formatSigned = (value) => (value > 0 ? `+${number.format(value)}` : value < 0 ? `−${number.format(-value)}` : '0');
