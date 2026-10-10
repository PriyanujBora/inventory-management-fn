// The loading / error / empty states every list shares; renders children once data is there.
export default function LoadState({ loading, error, isEmpty, emptyText = 'Nothing to show.', hasData = true, children }) {
  if (error) {
    return (
      <p className="form-error" role="alert">
        {error}
      </p>
    );
  }
  if (loading && !hasData) return <p className="muted">Loading…</p>;
  if (isEmpty) return <p className="empty">{emptyText}</p>;
  return children;
}
