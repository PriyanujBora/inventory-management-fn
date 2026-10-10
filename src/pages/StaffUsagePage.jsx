import { Fragment, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import PeriodPicker from '../components/PeriodPicker';
import SortableHeader from '../components/SortableHeader';
import LoadState from '../components/LoadState';
import Badge from '../components/Badge';
import useApiData from '../hooks/useApiData';
import api from '../api/api';
import { downloadCsv } from '../utils/csv';
import { formatINR, formatNumber } from '../utils/format';
import { CATEGORY_LABELS, ROLE_LABELS } from '../utils/labels';
import { periodRange } from '../utils/period';
import { sortRows } from '../utils/sort';

const KINDS = [
  { key: 'used', label: 'Used' },
  { key: 'sold', label: 'Sold' },
  { key: 'damaged', label: 'Damaged' },
];

// One CSV row per staff member and product, so it pivots easily in Excel.
const CSV_COLUMNS = [
  { label: 'Staff', value: (r) => r.staffName },
  { label: 'Role', value: (r) => ROLE_LABELS[r.role] },
  { label: 'Product', value: (r) => r.productName ?? '' },
  { label: 'Category', value: (r) => (r.category ? CATEGORY_LABELS[r.category] : '') },
  { label: 'Used', value: (r) => r.used },
  { label: 'Used (₹)', value: (r) => r.usedValue.toFixed(2) },
  { label: 'Sold', value: (r) => r.sold },
  { label: 'Sold (₹)', value: (r) => r.soldValue.toFixed(2) },
  { label: 'Damaged', value: (r) => r.damaged },
  { label: 'Damaged (₹)', value: (r) => r.damagedValue.toFixed(2) },
  { label: 'Total (₹)', value: (r) => (r.usedValue + r.soldValue + r.damagedValue).toFixed(2) },
];

const csvRows = (rows) =>
  rows.flatMap((staff) =>
    staff.products.length === 0
      ? [{ ...staff, staffName: staff.name }]
      : staff.products.map((product) => ({ ...product, staffName: staff.name, role: staff.role }))
  );

export default function StaffUsagePage() {
  const [period, setPeriod] = useState({ period: 'this-month', customFrom: '', customTo: '' });
  const [sort, setSort] = useState({ key: 'totalValue', direction: 'desc' });
  const [expanded, setExpanded] = useState(() => new Set());
  const range = periodRange(period);

  const usage = useApiData(
    () => (range ? api.get('/reports/by-staff', { params: { from: range.from, to: range.to } }) : Promise.resolve(null)),
    [range?.from, range?.to]
  );
  const rows = usage.data ? sortRows(usage.data.rows, sort) : [];

  const toggle = (staffId) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(staffId)) next.delete(staffId);
      else next.add(staffId);
      return next;
    });

  return (
    <PageLayout
      title="Staff usage"
      actions={
        <button
          type="button"
          className="button"
          onClick={() => downloadCsv(`staff-usage-${range.fileTag}.csv`, CSV_COLUMNS, csvRows(rows))}
          disabled={rows.length === 0}
        >
          Export CSV
        </button>
      }
    >
      <PeriodPicker value={period} onChange={setPeriod} label={range ? range.label : 'Pick both dates'} />
      <p className="muted">Everything each person took out of the storeroom in this period, valued at cost.</p>

      <LoadState
        loading={usage.loading}
        error={usage.error}
        hasData={Boolean(usage.data)}
        isEmpty={!range || rows.length === 0}
        emptyText={range ? 'No staff yet.' : 'Choose a start and end date.'}
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <SortableHeader label="Staff" sortKey="name" sort={sort} onSort={setSort} />
                {KINDS.map((kind) => (
                  <Fragment key={kind.key}>
                    <SortableHeader label={kind.label} sortKey={kind.key} sort={sort} onSort={setSort} numeric />
                    <SortableHeader label={`${kind.label} ₹`} sortKey={`${kind.key}Value`} sort={sort} onSort={setSort} numeric />
                  </Fragment>
                ))}
                <SortableHeader label="Total ₹" sortKey="totalValue" sort={sort} onSort={setSort} numeric />
              </tr>
            </thead>
            <tbody>
              {rows.map((staff) => {
                const isOpen = expanded.has(staff.staffId);
                return (
                  <Fragment key={staff.staffId}>
                    <tr>
                      <td>
                        <button
                          type="button"
                          className="expand-button"
                          aria-expanded={isOpen}
                          onClick={() => toggle(staff.staffId)}
                          disabled={staff.products.length === 0}
                        >
                          <span aria-hidden="true">{isOpen ? '▾' : '▸'}</span> {staff.name}
                        </button>
                        <div className="cell-sub">
                          <Badge kind="role" value={staff.role} />
                          {!staff.isActive && <span className="pill pill--muted">Inactive</span>}
                        </div>
                      </td>
                      {KINDS.map((kind) => (
                        <Fragment key={kind.key}>
                          <td className="num">{formatNumber(staff[kind.key])}</td>
                          <td className="num nowrap">{formatINR(staff[`${kind.key}Value`])}</td>
                        </Fragment>
                      ))}
                      <td className="num nowrap total-cell">{formatINR(staff.totalValue)}</td>
                    </tr>
                    {isOpen && (
                      <tr className="breakdown-row">
                        <td colSpan={8}>
                          <table className="table table--nested">
                            <thead>
                              <tr>
                                <th>Product</th>
                                {KINDS.map((kind) => (
                                  <Fragment key={kind.key}>
                                    <th className="num">{kind.label}</th>
                                    <th className="num">{kind.label} ₹</th>
                                  </Fragment>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {staff.products.map((product) => (
                                <tr key={product.productId}>
                                  <td>
                                    {product.productName} <Badge kind="category" value={product.category} />
                                  </td>
                                  {KINDS.map((kind) => (
                                    <Fragment key={kind.key}>
                                      <td className="num">{formatNumber(product[kind.key])}</td>
                                      <td className="num nowrap">{formatINR(product[`${kind.key}Value`])}</td>
                                    </Fragment>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </LoadState>
    </PageLayout>
  );
}
