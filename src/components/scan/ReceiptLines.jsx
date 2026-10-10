import Badge from '../Badge';
import { formatINR } from '../../utils/format';

// The delivery being scanned in, newest line first. Quantity and cost stay editable until saved.
export default function ReceiptLines({ lines, onChange, onRemove }) {
  if (lines.length === 0) return <p className="empty">Scan the first product of the delivery.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th className="num">Qty</th>
            <th className="num">Unit cost (₹)</th>
            <th className="num">Line total</th>
            <th aria-label="Remove" />
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.barcode}>
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
                  min="1"
                  max="10000"
                  step="1"
                  aria-label={`Quantity of ${line.name}`}
                  value={line.qty}
                  onChange={(event) => onChange(line.barcode, { qty: event.target.value })}
                />
              </td>
              <td className="num">
                <input
                  className="field__input field__input--money"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  aria-label={`Unit cost of ${line.name}`}
                  value={line.unitCost ?? ''}
                  onChange={(event) => onChange(line.barcode, { unitCost: event.target.value })}
                />
              </td>
              <td className="num nowrap">{formatINR((Number(line.qty) || 0) * (Number(line.unitCost) || 0))}</td>
              <td>
                <button type="button" className="link-button link-button--danger" onClick={() => onRemove(line.barcode)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
