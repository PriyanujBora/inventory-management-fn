import { formatNumber } from '../utils/format';

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav className="pagination" aria-label="Pages">
      <span className="muted">
        {formatNumber(first)}–{formatNumber(last)} of {formatNumber(total)}
      </span>
      <div className="pagination__buttons">
        <button type="button" className="button button--small" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ← Newer
        </button>
        <span className="muted">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          className="button button--small"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Older →
        </button>
      </div>
    </nav>
  );
}
