// Big, colour-coded feedback for the latest scan, readable at a glance from the scanner.
// tone: "success" | "info" | "warning" | "error"
export default function ScanResult({ tone, title, detail, children }) {
  return (
    <div className={`scan-result scan-result--${tone}`} role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}>
      <div className="scan-result__body">
        <p className="scan-result__title">{title}</p>
        {detail && <p className="scan-result__detail">{detail}</p>}
      </div>
      {children && <div className="scan-result__actions">{children}</div>}
    </div>
  );
}
