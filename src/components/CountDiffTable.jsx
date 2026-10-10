import Badge from './Badge';
import { formatINR, formatNumber, formatSigned } from '../utils/format';

// Expected vs counted per product. Missing rows (counted below expected) are red, surplus rows amber.
export default function CountDiffTable({ rows }) {
  if (rows.length === 0) return <p className="empty">No products to compare.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th className="num">Expected</th>
            <th className="num">Counted</th>
            <th className="num">Difference</th>
            <th className="num">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.productId}
              className={row.difference < 0 ? 'row--missing' : row.difference > 0 ? 'row--surplus' : undefined}
            >
              <td>
                <div className="cell-title">{row.name}</div>
                <div className="cell-sub">
                  <code>{row.barcode}</code> <Badge kind="category" value={row.category} />
                </div>
              </td>
              <td className="num">{formatNumber(row.expected)}</td>
              <td className="num">{formatNumber(row.counted)}</td>
              <td className="num strong">
                {formatSigned(row.difference)}
                {row.difference < 0 && <span className="pill pill--danger">Missing</span>}
                {row.difference > 0 && <span className="pill pill--warning">Surplus</span>}
              </td>
              <td className="num nowrap">{formatINR(row.differenceValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
