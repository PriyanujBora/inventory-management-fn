import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import api from '../../api/api';
import ScanInput from './ScanInput';
import StaffPicker from './StaffPicker';
import ScanResult from '../ScanResult';
import Segmented from '../Segmented';
import useApiData from '../../hooks/useApiData';
import { beepError, beepSuccess } from '../../utils/beep';
import { formatNumber } from '../../utils/format';
import { MOVEMENT_LABELS, TAKE_OUT_REASONS } from '../../utils/labels';
import { loadJSON, saveJSON } from '../../utils/storage';

// Who and why stay selected between scans (and across visits).
const PREFS_KEY = 'inventory.takeOut';
const UNDO_SECONDS = 10;
const MAX_QTY = 10000;

const loadPrefs = () => {
  const saved = loadJSON(PREFS_KEY, {});
  return {
    staffId: Number.isInteger(saved?.staffId) ? saved.staffId : null,
    reason: TAKE_OUT_REASONS.some((r) => r.value === saved?.reason) ? saved.reason : 'used',
  };
};

// Take Out records every scan immediately against the chosen staff member.
export default function TakeOutPanel() {
  const { data: staff, loading: staffLoading, error: staffError } = useApiData(
    () => api.get('/staff', { params: { active: true } }),
    []
  );
  const [prefs, setPrefs] = useState(loadPrefs);
  const [qty, setQty] = useState(1);
  const [result, setResult] = useState(null);
  const [pendingNegative, setPendingNegative] = useState(null);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const resultIdRef = useRef(0);

  useEffect(() => {
    saveJSON(PREFS_KEY, prefs);
  }, [prefs]);

  // A remembered person who has since been deactivated no longer counts as chosen.
  const selectedStaff = staff?.find((member) => member.id === prefs.staffId) ?? null;

  const showResult = (value) => {
    resultIdRef.current += 1;
    setResult({ id: resultIdRef.current, ...value });
  };

  // Undo is offered for 10 seconds after each recorded scan.
  useEffect(() => {
    if (!result?.undoableId) return undefined;
    setUndoSecondsLeft(UNDO_SECONDS);
    const timer = setInterval(() => {
      setUndoSecondsLeft((seconds) => {
        if (seconds <= 1) clearInterval(timer);
        return Math.max(seconds - 1, 0);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result?.id, result?.undoableId]);

  const submit = async (request, confirmNegative = false) => {
    const takenBy = staff?.find((member) => member.id === request.takenBy);
    try {
      const { movement, product } = await api.post('/movements', { ...request, confirmNegative });
      beepSuccess();
      setPendingNegative(null);
      showResult({
        tone: 'success',
        undoableId: movement.id,
        title: (
          <>
            <strong>{takenBy?.name ?? movement.takenByName}</strong> took {formatNumber(-movement.qty)} × {product.name} (
            {MOVEMENT_LABELS[movement.type]}). <strong>{formatNumber(product.inStock)} left</strong>.
          </>
        ),
        detail: product.inStock < 0 ? 'Recorded with insufficient stock: the system now shows negative stock.' : undefined,
      });
    } catch (err) {
      beepError();
      if (err.code === 'INSUFFICIENT_STOCK') {
        setResult(null);
        setPendingNegative({ request, message: err.message });
      } else {
        showResult({ tone: 'error', title: err.message });
      }
    }
  };

  const handleScan = (barcode) => {
    const request = { barcode, type: prefs.reason, qty, takenBy: prefs.staffId };
    setQty(1); // the multi-unit case is rare; every scan starts back at 1
    submit(request);
  };

  const undo = async () => {
    setBusy(true);
    try {
      const { reversal, product } = await api.post(`/movements/${result.undoableId}/undo`, { note: 'Undone at scan time' });
      beepSuccess();
      showResult({
        tone: 'info',
        title: (
          <>
            Undone: {formatNumber(reversal.qty)} × {product.name} is back in stock.{' '}
            <strong>{formatNumber(product.inStock)} left</strong>.
          </>
        ),
      });
    } catch (err) {
      beepError();
      showResult({ tone: 'error', title: err.message });
    } finally {
      setBusy(false);
    }
  };

  const recordAnyway = async () => {
    setBusy(true);
    await submit(pendingNegative.request, true);
    setBusy(false);
  };

  const setQtyFromInput = (value) => {
    const n = Number(value);
    setQty(Number.isInteger(n) ? Math.min(Math.max(n, 1), MAX_QTY) : 1);
  };

  if (staffError) {
    return (
      <p className="form-error" role="alert">
        {staffError}
      </p>
    );
  }
  if (staffLoading && !staff) return <p className="muted">Loading staff…</p>;
  if (staff.length === 0) {
    return (
      <p className="empty">
        No active staff yet. <Link to="/staff">Add staff on the Staff page</Link> first.
      </p>
    );
  }

  return (
    <div className="mode-panel">
      <div className="field">
        <span className="field__label">Taken by</span>
        <StaffPicker staff={staff} value={selectedStaff?.id ?? null} onChange={(staffId) => setPrefs((p) => ({ ...p, staffId }))} />
      </div>

      <div className="take-out__options">
        <div className="field">
          <span className="field__label">Reason</span>
          <Segmented
            label="Reason"
            options={TAKE_OUT_REASONS}
            value={prefs.reason}
            onChange={(reason) => setPrefs((p) => ({ ...p, reason }))}
          />
        </div>
        <div className="field">
          <span className="field__label">Qty per scan</span>
          <div className="stepper">
            <button type="button" className="button" aria-label="One less" onClick={() => setQty((q) => Math.max(q - 1, 1))}>
              −
            </button>
            <input
              className="field__input field__input--qty"
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_QTY}
              aria-label="Quantity per scan"
              value={qty}
              onChange={(event) => setQtyFromInput(event.target.value)}
            />
            <button type="button" className="button" aria-label="One more" onClick={() => setQty((q) => Math.min(q + 1, MAX_QTY))}>
              +
            </button>
          </div>
        </div>
      </div>

      {selectedStaff ? (
        <ScanInput
          onScan={handleScan}
          disabled={Boolean(pendingNegative)}
          pausedMessage="Paused: decide on the stock warning first."
        />
      ) : (
        <p className="prompt">Choose who is taking the item. Scanning starts once a name is selected.</p>
      )}

      {pendingNegative && (
        <ScanResult tone="warning" title={pendingNegative.message}>
          <button type="button" className="button button--danger" onClick={recordAnyway} disabled={busy}>
            Record anyway
          </button>
          <button type="button" className="button" onClick={() => setPendingNegative(null)} disabled={busy}>
            Cancel
          </button>
        </ScanResult>
      )}

      {result && (
        <ScanResult key={result.id} tone={result.tone} title={result.title} detail={result.detail}>
          {result.undoableId && undoSecondsLeft > 0 && (
            <button type="button" className="button" onClick={undo} disabled={busy}>
              Undo ({undoSecondsLeft}s)
            </button>
          )}
        </ScanResult>
      )}
    </div>
  );
}
