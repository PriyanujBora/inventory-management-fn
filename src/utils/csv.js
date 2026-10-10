const escapeCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// columns: [{ label, value: (row) => cell }]
export const toCsv = (columns, rows) =>
  [columns.map((column) => escapeCell(column.label)), ...rows.map((row) => columns.map((column) => escapeCell(column.value(row))))]
    .map((cells) => cells.join(','))
    .join('\r\n');

// The UTF-8 byte-order mark makes Excel read ₹ and accented product names correctly.
export const downloadCsv = (fileName, columns, rows) => {
  const blob = new Blob([`﻿${toCsv(columns, rows)}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
