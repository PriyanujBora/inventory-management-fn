// Sorts a copy of `rows` by `sort.key`; text compares alphabetically, numbers numerically.
export const sortRows = (rows, sort) => {
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[sort.key];
    const y = b[sort.key];
    const order = typeof x === 'string' || typeof y === 'string' ? String(x ?? '').localeCompare(String(y ?? '')) : (x ?? 0) - (y ?? 0);
    return order * factor;
  });
};
