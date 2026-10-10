import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../../api/api';
import ScanInput from './ScanInput';
import CountLines from './CountLines';
import ScanResult from '../ScanResult';
import ConfirmPanel from '../ConfirmPanel';
import { beepError, beepSuccess } from '../../utils/beep';
import { formatDateTime, formatNumber } from '../../utils/format';

// Moves a line to the top of the list (newest first), replacing its old position.
const withLineOnTop = (count, line) =>
  count && { ...count, lines: [line, ...count.lines.filter((l) => l.productId !== line.productId)] };

// Count mode. `count` is the open count (or null); `onCountChange` takes a value or an updater function.
export default function CountPanel({ count, loading, error, onCountChange, onReload }) {
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [result, setResult] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const resultIdRef = useRef(0);

  const showResult = (value) => {
    resultIdRef.current += 1;
    setResult({ id: resultIdRef.current, ...value });
  };

  const start = async () => {
    setBusy(true);
    setActionError(null);
    try {
      onCountChange(await api.post('/counts', { note: note.trim() || undefined }));
      setNote('');
      setResult(null);
    } catch (err) {
      setActionError(err.message);
      if (err.code === 'COUNT_ALREADY_OPEN') onReload();
    } finally {
      setBusy(false);
    }
  };

  // Every scan adds 1 and is saved on the server straight away.
  const handleScan = async (barcode) => {
    try {
      const line = await api.post(`/counts/${count.id}/scan`, { barcode });
      onCountChange((current) => withLineOnTop(current, line));
      beepSuccess();
      showResult({
        tone: 'success',
        title: (
          <>
            {line.name}: <strong>counted {formatNumber(line.countedQty)}</strong>
          </>
        ),
      });
    } catch (err) {
      beepError();
      showResult({ tone: 'error', title: err.message });
      if (err.code === 'COUNT_NOT_OPEN') onReload();
    }
  };

  const saveLine = async (productId, countedQty) => {
    const line = await api.put(`/counts/${count.id}/lines/${productId}`, { countedQty });
    onCountChange((current) => current && { ...current, lines: current.lines.map((l) => (l.productId === productId ? line : l)) });
  };

  const cancelCount = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await api.post(`/counts/${count.id}/cancel`);
      setConfirmCancel(false);
      onCountChange(null);
      showResult({ tone: 'info', title: `Count #${count.id} cancelled. No stock was changed.` });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <p className="form-error" role="alert">
        {error}
      </p>
    );
  }
  if (loading) return <p className="muted">Loading…</p>;

  if (!count) {
    return (
      <div className="mode-panel">
        {result && <ScanResult key={result.id} tone={result.tone} title={result.title} />}
        <div className="card count-start">
          <h2 className="section__title">No stock count in progress</h2>
          <p>
            A count compares what is physically on the shelf with what the system expects. The difference shows
            missing stock in units and ₹.
          </p>
          <p className="muted">
            While a count is open, please don&apos;t receive or take out stock. Count every product, then review and close
            the count.
          </p>
          <label className="field">
            <span className="field__label">Note</span>
            <input
              className="field__input"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={255}
              placeholder="Optional, e.g. October month-end count"
            />
          </label>
          {actionError && (
            <p className="form-error" role="alert">
              {actionError}
            </p>
          )}
          <div className="form-actions">
            <button type="button" className="button button--primary button--large" onClick={start} disabled={busy}>
              {busy ? 'Starting…' : 'Start count'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mode-panel">
      <p className="count-header">
        <strong>Count #{count.id}</strong> started {formatDateTime(count.startedAt)}
        {count.note ? ` · ${count.note}` : ''}
      </p>

      <ScanInput onScan={handleScan} />

      {result && <ScanResult key={result.id} tone={result.tone} title={result.title} />}

      <CountLines lines={count.lines} onSave={saveLine} />

      {actionError && (
        <p className="form-error" role="alert">
          {actionError}
        </p>
      )}

      {confirmCancel ? (
        <ConfirmPanel
          title={`Cancel count #${count.id}?`}
          confirmLabel="Cancel count"
          onConfirm={cancelCount}
          onCancel={() => setConfirmCancel(false)}
          busy={busy}
        >
          <p>Everything counted so far is thrown away and no stock is changed.</p>
        </ConfirmPanel>
      ) : (
        <div className="form-actions">
          <button type="button" className="button button--primary button--large" onClick={() => navigate('/counts')}>
            Review &amp; close
          </button>
          <button type="button" className="button button--danger-outline" onClick={() => setConfirmCancel(true)}>
            Cancel count
          </button>
        </div>
      )}
    </div>
  );
}
