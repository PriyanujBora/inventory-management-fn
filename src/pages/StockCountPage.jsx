import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import PageLayout from '../components/layout/PageLayout';
import CountDiffTable from '../components/CountDiffTable';
import ConfirmPanel from '../components/ConfirmPanel';
import LoadState from '../components/LoadState';
import StatTile from '../components/StatTile';
import Badge from '../components/Badge';
import useApiData from '../hooks/useApiData';
import api from '../api/api';
import { formatDateTime, formatINR, formatNumber } from '../utils/format';

function CountTotals({ totals }) {
  return (
    <div className="stat-tiles">
      <StatTile
        label="Missing"
        value={`${formatNumber(totals.missingUnits)} units`}
        subValue={`${formatINR(totals.missingValue)} · ${formatNumber(totals.missingProducts)} products`}
        tone="danger"
        prominent
      />
      <StatTile
        label="Surplus"
        value={`${formatNumber(totals.surplusUnits)} units`}
        subValue={`${formatINR(totals.surplusValue)} · ${formatNumber(totals.surplusProducts)} products`}
        tone="warning"
      />
    </div>
  );
}

// The open count: expected (ledger) vs counted, then close.
function OpenCount({ count, onClosed }) {
  const preview = useApiData(() => api.get(`/counts/${count.id}/preview`), [count.id]);
  const [confirming, setConfirming] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState(null);

  const close = async () => {
    setClosing(true);
    setError(null);
    try {
      await api.post(`/counts/${count.id}/close`);
      onClosed(count.id);
    } catch (err) {
      setError(err.message);
      setClosing(false);
    }
  };

  const totals = preview.data?.totals;

  return (
    <section className="section">
      <h2 className="section__title">
        Count #{count.id} in progress <Badge kind="countStatus" value="open" />
      </h2>
      <p className="muted">
        Started {formatDateTime(count.startedAt)}
        {count.note ? ` · ${count.note}` : ''}. Products that were never scanned count as 0.{' '}
        <Link to="/?mode=count">Continue counting</Link> ·{' '}
        <button type="button" className="link-button" onClick={preview.reload}>
          Refresh
        </button>
      </p>

      <LoadState loading={preview.loading} error={preview.error} hasData={Boolean(preview.data)}>
        {preview.data && (
          <>
            <CountTotals totals={totals} />
            <CountDiffTable rows={preview.data.rows} />

            {confirming ? (
              <ConfirmPanel
                title={`Close count #${count.id}?`}
                confirmLabel="Close count"
                onConfirm={close}
                onCancel={() => setConfirming(false)}
                busy={closing}
                error={error}
              >
                <p>
                  <strong>
                    {formatNumber(totals.missingProducts)} products missing, {formatINR(totals.missingValue)}
                  </strong>
                  ; {formatNumber(totals.surplusProducts)} surplus. Stock will be adjusted to what was counted. This can&apos;t be
                  undone; a mistake needs a new count.
                </p>
              </ConfirmPanel>
            ) : (
              // TODO(auth): closing will be owner-only.
              <div className="form-actions">
                <button type="button" className="button button--primary button--large" onClick={() => setConfirming(true)}>
                  Close count
                </button>
              </div>
            )}
          </>
        )}
      </LoadState>
    </section>
  );
}

function PastCounts({ counts }) {
  if (counts.length === 0) return <p className="empty">No counts yet.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Count</th>
            <th>Status</th>
            <th>Started</th>
            <th>Closed</th>
            <th className="num">Missing</th>
            <th className="num">Missing ₹</th>
            <th className="num">Surplus</th>
          </tr>
        </thead>
        <tbody>
          {counts.map((count) => (
            <tr key={count.id}>
              <td>
                <Link to={`/counts/${count.id}`} className="cell-title">
                  #{count.id}
                </Link>
                {count.note && <div className="cell-sub">{count.note}</div>}
              </td>
              <td>
                <Badge kind="countStatus" value={count.status} />
              </td>
              <td className="nowrap">{formatDateTime(count.startedAt)}</td>
              <td className="nowrap">{formatDateTime(count.closedAt)}</td>
              <td className="num">{count.status === 'closed' ? formatNumber(count.missingUnits) : '—'}</td>
              <td className={`num nowrap${count.missingValue > 0 ? ' text-danger strong' : ''}`}>
                {count.status === 'closed' ? formatINR(count.missingValue) : '—'}
              </td>
              <td className="num">{count.status === 'closed' ? formatNumber(count.surplusUnits) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CountOverview() {
  const navigate = useNavigate();
  const current = useApiData(() => api.get('/counts/current'), []);
  const counts = useApiData(() => api.get('/counts'), []);

  return (
    <PageLayout title="Stock count">
      <LoadState loading={current.loading} error={current.error} hasData={current.data !== null || !current.loading}>
        {current.data ? (
          <OpenCount count={current.data} onClosed={(id) => navigate(`/counts/${id}`)} />
        ) : (
          <p className="empty">
            No count in progress. Start one on the <Link to="/?mode=count">Scan page → Count</Link>.
          </p>
        )}
      </LoadState>

      <section className="section">
        <h2 className="section__title">Past counts</h2>
        <LoadState loading={counts.loading} error={counts.error} hasData={Boolean(counts.data)}>
          {counts.data && <PastCounts counts={counts.data.filter((count) => count.status !== 'open')} />}
        </LoadState>
      </section>
    </PageLayout>
  );
}

function CountDetail({ id }) {
  const count = useApiData(() => api.get(`/counts/${id}`), [id]);
  const data = count.data;

  return (
    <PageLayout title={`Stock count #${id}`}>
      <p>
        <Link to="/counts">← All counts</Link>
      </p>
      <LoadState loading={count.loading} error={count.error} hasData={Boolean(data)}>
        {data && (
          <>
            <p className="muted">
              <Badge kind="countStatus" value={data.status} /> Started {formatDateTime(data.startedAt)}
              {data.closedAt && ` · ${data.status === 'closed' ? 'closed' : 'cancelled'} ${formatDateTime(data.closedAt)}`}
              {data.note && ` · ${data.note}`}
            </p>

            {data.status === 'closed' && (
              <>
                <CountTotals totals={data.totals} />
                <CountDiffTable rows={data.results} />
              </>
            )}
            {data.status === 'cancelled' && <p className="empty">This count was cancelled. No stock was changed.</p>}
            {data.status === 'open' && (
              <p className="empty">
                This count is still open. <Link to="/counts">Review and close it</Link>.
              </p>
            )}
          </>
        )}
      </LoadState>
    </PageLayout>
  );
}

export default function StockCountPage() {
  const { id } = useParams();
  return id ? <CountDetail key={id} id={id} /> : <CountOverview />;
}
