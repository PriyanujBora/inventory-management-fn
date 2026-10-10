import { useState } from 'react';
import Badge from '../Badge';

// One counted product; the quantity can be typed in (e.g. 12 tubes counted by hand) and is saved on Enter or blur.
function CountLineRow({ line, onSave }) {
  const [value, setValue] = useState(String(line.countedQty));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(line.countedQty);

  // A scan elsewhere changed the line: show the server's number.
  if (line.countedQty !== lastSaved) {
    setLastSaved(line.countedQty);
    setValue(String(line.countedQty));
  }

  const commit = async () => {
    const qty = Number(value);
    if (value === '' || !Number.isInteger(qty) || qty < 0) {
      setError('Whole number, 0 or more');
      return;
    }
    if (qty === line.countedQty) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(line.productId, qty);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td>
        <div className="cell-title">{line.name}</div>
        <div className="cell-sub">
          <code>{line.barcode}</code> <Badge kind="category" value={line.category} />
        </div>
      </td>
      <td className="num">
        <input
          className="field__input field__input--qty"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          aria-label={`Counted quantity of ${line.name}`}
          value={value}
          disabled={saving}
          onChange={(event) => setValue(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
        />
        {error && <p className="form-error">{error}</p>}
      </td>
    </tr>
  );
}

// What has been counted so far, most recently scanned first. Expected stock is deliberately not shown,
// so counters count what they see instead of what the system says.
export default function CountLines({ lines, onSave }) {
  if (lines.length === 0) return <p className="empty">Nothing counted yet. Scan each item on the shelf once.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th className="num">Counted</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <CountLineRow key={line.productId} line={line} onSave={onSave} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
