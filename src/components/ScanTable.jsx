import Badge from './Badge';

export default function ScanTable({ scans }) {
  if (scans.length === 0) return <p className="empty">No scans yet.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Action</th>
            <th>Product</th>
            <th>Barcode</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.id}>
              <td className="nowrap">{new Date(scan.scannedAt).toLocaleString()}</td>
              <td>
                <Badge kind="status" value={scan.direction} />
              </td>
              <td>{scan.name ?? <span className="muted">Unnamed</span>}</td>
              <td>
                <code>{scan.barcode}</code>
              </td>
              <td>
                <Badge kind="type" value={scan.type} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
