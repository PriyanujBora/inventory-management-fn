import Badge from './Badge';

const ACTION_NOTES = {
  in: 'Added to the inventory',
  out: 'Removed from the inventory',
};

// Big, colour-coded feedback for the latest scan, readable at a glance from the scanner.
export default function ScanResult({ result }) {
  if (result.error) {
    return (
      <div className="scan-result scan-result--error" role="alert">
        <span className="scan-result__icon">!</span>
        <p>{result.error}</p>
      </div>
    );
  }

  const { action, isNew, product } = result;

  return (
    <div className={`scan-result scan-result--${action}`} role="status">
      <span className="scan-result__action">{action.toUpperCase()}</span>
      <div>
        <p className="scan-result__name">{product.name ?? 'Unnamed product'}</p>
        <p className="scan-result__meta">
          <code>{product.barcode}</code>
          <Badge kind="type" value={product.type} />
        </p>
        <p className="scan-result__note">{isNew ? 'New product registered and added to the inventory' : ACTION_NOTES[action]}</p>
      </div>
    </div>
  );
}
