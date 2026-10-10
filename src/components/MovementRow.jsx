import { useState } from 'react';
import { Link } from 'react-router';
import Badge from './Badge';
import { formatDateTime, formatINR, formatSigned } from '../utils/format';

const COLUMN_COUNT = 9;

const canReverse = (movement) =>
  !movement.isReversed && movement.reversesId === null && movement.type !== 'count_adjustment';

// One ledger row. Reversed rows are struck through; reversal rows say what they undo.
// TODO(auth): Reverse will be owner-only.
export default function MovementRow({ movement, onReverse }) {
  const [reversing, setReversing] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (!reason.trim()) return setError('Give a reason, e.g. "Scanned against the wrong stylist".');
    setBusy(true);
    setError(null);
    try {
      await onReverse(movement.id, reason.trim());
      setReversing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <tr id={`movement-${movement.id}`} className={movement.isReversed ? 'is-reversed' : undefined}>
        <td className="nowrap">
          {formatDateTime(movement.createdAt)}
          <div className="cell-sub">#{movement.id}</div>
        </td>
        <td>
          <Badge kind="movement" value={movement.type} />
        </td>
        <td>
          <div className="cell-title">{movement.productName}</div>
          <div className="cell-sub">
            <code>{movement.barcode}</code>
          </div>
        </td>
        <td className={`num strong ${movement.qty > 0 ? 'text-in' : 'text-out'}`}>{formatSigned(movement.qty)}</td>
        <td>{movement.takenByName ?? <span className="muted">—</span>}</td>
        <td className="num nowrap">{formatINR(movement.unitCost)}</td>
        <td className="nowrap">
          {movement.receiptId && <span>Receipt #{movement.receiptId}</span>}
          {movement.countId && <Link to={`/counts/${movement.countId}`}>Count #{movement.countId}</Link>}
          {movement.reversesId && <a href={`#movement-${movement.reversesId}`}>Undo of #{movement.reversesId}</a>}
        </td>
        <td className="note-cell">
          {movement.note}
          {movement.isReversed && (
            <div className="cell-sub">
              Reversed by <a href={`#movement-${movement.reversedById}`}>#{movement.reversedById}</a>
            </div>
          )}
        </td>
        <td>
          {canReverse(movement) && !reversing && (
            <button type="button" className="link-button link-button--danger" onClick={() => setReversing(true)}>
              Reverse
            </button>
          )}
        </td>
      </tr>
      {reversing && (
        <tr className="reverse-row">
          <td colSpan={COLUMN_COUNT}>
            <form className="reverse-form" onSubmit={submit} onKeyDown={(e) => e.key === 'Escape' && setReversing(false)}>
              <label className="field field--grow">
                <span className="field__label">Why reverse #{movement.id}?</span>
                <input
                  className="field__input"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={255}
                  placeholder="Reason (required)"
                  autoFocus
                />
              </label>
              <div className="form-actions">
                <button type="submit" className="button button--danger button--small" disabled={busy}>
                  {busy ? 'Reversing…' : 'Reverse movement'}
                </button>
                <button type="button" className="button button--small" onClick={() => setReversing(false)} disabled={busy}>
                  Cancel
                </button>
              </div>
              {error && <p className="form-error">{error}</p>}
            </form>
          </td>
        </tr>
      )}
    </>
  );
}
