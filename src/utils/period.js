// Report periods are picked as local (IST) calendar dates and sent to the API as UTC instants,
// as a half-open range [from, to).

export const PERIODS = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'this-week', label: 'This week' },
  { value: 'custom', label: 'Custom range' },
];

const pad = (n) => String(n).padStart(2, '0');

// 'YYYY-MM-DD' for <input type="date">, in local time
export const toDateInput = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Local midnight of a 'YYYY-MM-DD' string
const fromDateInput = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const monthLabel = (date) => date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
const dayLabel = (date) => date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// { from, to } as ISO strings plus a human label and a tag for file names.
// Returns null for an incomplete or reversed custom range.
export const periodRange = ({ period, customFrom, customTo }, now = new Date()) => {
  let start;
  let end;

  if (period === 'last-month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'this-week') {
    // Weeks start on Monday
    start = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -((now.getDay() + 6) % 7));
    end = addDays(start, 7);
  } else if (period === 'custom') {
    if (!customFrom || !customTo) return null;
    start = fromDateInput(customFrom);
    end = addDays(fromDateInput(customTo), 1); // the "to" day is included
    if (start >= end) return null;
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const isWholeMonth = start.getDate() === 1 && end.getDate() === 1 && addDays(end, -1).getMonth() === start.getMonth();
  const lastDay = addDays(end, -1);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
    label: isWholeMonth ? monthLabel(start) : `${dayLabel(start)} – ${dayLabel(lastDay)}`,
    fileTag: isWholeMonth
      ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}`
      : `${toDateInput(start)}_${toDateInput(lastDay)}`,
  };
};
