import { useState } from 'react';
import { Link } from 'react-router';
import PageLayout from '../components/layout/PageLayout';
import PeriodPicker from '../components/PeriodPicker';
import StatTile from '../components/StatTile';
import SortableHeader from '../components/SortableHeader';
import LoadState from '../components/LoadState';
import Badge from '../components/Badge';
import useApiData from '../hooks/useApiData';
import api from '../api/api';
import { downloadCsv } from '../utils/csv';
import { formatDate, formatINR, formatNumber } from '../utils/format';
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../utils/labels';
import { periodRange } from '../utils/period';
import { sortRows } from '../utils/sort';

const COLUMNS = [
  { key: 'openingBalance', label: 'Opening' },
  { key: 'bought', label: 'Bought' },
  { key: 'used', label: 'Used' },
  { key: 'sold', label: 'Sold' },
  { key: 'damaged', label: 'Damaged' },
  { key: 'missing', label: 'Missing' },
  { key: 'closingBalance', label: 'Closing' },
];

const CSV_COLUMNS = [
  { label: 'Product', value: (r) => r.name },
  { label: 'Barcode', value: (r) => r.barcode },
  { label: 'Category', value: (r) => CATEGORY_LABELS[r.category] },
  { label: 'Opening', value: (r) => r.openingBalance },
  { label: 'Bought', value: (r) => r.bought },
  { label: 'Bought (₹)', value: (r) => r.boughtValue.toFixed(2) },
  { label: 'Used', value: (r) => r.used },
  { label: 'Used (₹)', value: (r) => r.usedValue.toFixed(2) },
  { label: 'Sold', value: (r) => r.sold },
  { label: 'Sold (₹)', value: (r) => r.soldValue.toFixed(2) },
  { label: 'Damaged', value: (r) => r.damaged },
  { label: 'Damaged (₹)', value: (r) => r.damagedValue.toFixed(2) },
  { label: 'Missing', value: (r) => r.missing },
  { label: 'Missing (₹)', value: (r) => r.missingValue.toFixed(2) },
  { label: 'Surplus', value: (r) => r.surplus },
  { label: 'Closing', value: (r) => r.closingBalance },
  { label: 'In stock now', value: (r) => r.inStockNow },
  { label: 'Low stock', value: (r) => (r.isLowStock ? 'Yes' : 'No') },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState({ period: 'this-month', customFrom: '', customTo: '' });
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState({ key: 'missingValue', direction: 'desc' });
  const range = periodRange(period);

  const summary = useApiData(
    () => (range ? api.get('/reports/summary', { params: { from: range.from, to: range.to, category } }) : Promise.resolve(null)),
    [range?.from, range?.to, category]
  );

  const data = summary.data;
  const totals = data?.totals;
  const rows = data ? sortRows(data.rows, sort) : [];

  const exportCsv = () =>
    downloadCsv(`stock-summary-${range.fileTag}${category ? `-${category}` : ''}.csv`, CSV_COLUMNS, rows);

  return (
    <PageLayout
      title="Dashboard"
      actions={
        <button type="button" className="button" onClick={exportCsv} disabled={!data || rows.length === 0}>
          Export CSV
        </button>
      }
    >
      <PeriodPicker value={period} onChange={setPeriod} label={range ? range.label : 'Pick both dates'} />

      {totals && (
        <div className="stat-tiles">
          <StatTile label="Bought" value={formatNumber(totals.bought)} subValue={formatINR(totals.boughtValue)} tone="in" />
          <StatTile label="Used" value={formatNumber(totals.used)} subValue={formatINR(totals.usedValue)} tone="used" />
          <StatTile label="Sold" value={formatNumber(totals.sold)} subValue={formatINR(totals.soldValue)} tone="sold" />
          <StatTile
            label="Missing"
            value={formatNumber(totals.missing)}
            subValue={formatINR(totals.missingValue)}
            tone="danger"
            prominent
          />
          <StatTile label="Low-stock items" value={formatNumber(totals.lowStockCount)} subValue="now" tone="warning" />
        </div>
      )}

      <div className="filter-bar">
        <label className="field">
          <span className="field__label">Category</span>
          <select className="field__input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <LoadState
        loading={summary.loading}
        error={summary.error}
        hasData={Boolean(data)}
        isEmpty={!range || rows.length === 0}
        emptyText={range ? 'No products for this period.' : 'Choose a start and end date.'}
      >
        <div className="table-wrap">
          <table className="table table--compact">
            <thead>
              <tr>
                <SortableHeader label="Product" sortKey="name" sort={sort} onSort={setSort} />
                {COLUMNS.map((column) => (
                  <SortableHeader key={column.key} label={column.label} sortKey={column.key} sort={sort} onSort={setSort} numeric />
                ))}
                <SortableHeader label="Missing ₹" sortKey="missingValue" sort={sort} onSort={setSort} numeric />
                <SortableHeader label="In stock now" sortKey="inStockNow" sort={sort} onSort={setSort} numeric />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.productId} className={row.missing > 0 ? 'row--missing' : undefined}>
                  <td>
                    <Link to={`/history?productId=${row.productId}`} className="cell-title">
                      {row.name}
                    </Link>
                    <div className="cell-sub">
                      <Badge kind="category" value={row.category} />
                    </div>
                  </td>
                  {COLUMNS.map((column) => (
                    <td key={column.key} className={`num${column.key === 'missing' && row.missing > 0 ? ' text-danger' : ''}`}>
                      {formatNumber(row[column.key])}
                    </td>
                  ))}
                  <td className={`num nowrap${row.missingValue > 0 ? ' text-danger strong' : ''}`}>{formatINR(row.missingValue)}</td>
                  <td className="num">
                    {formatNumber(row.inStockNow)}
                    {row.isLowStock && <span className="pill pill--warning">Low</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>

      {data && (
        <p className="muted">
          Missing is only known after a stock count.{' '}
          {data.lastCountClosedAt ? `Last count closed on ${formatDate(data.lastCountClosedAt)}.` : 'No count has been closed yet.'}{' '}
          <Link to="/counts">Stock count</Link>
        </p>
      )}
    </PageLayout>
  );
}
