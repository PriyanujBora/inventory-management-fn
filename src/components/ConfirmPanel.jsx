// An inline "are you sure?" box for actions that can't be undone.
export default function ConfirmPanel({
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
  busy = false,
  error = null,
  tone = 'danger',
}) {
  return (
    <div className={`confirm-panel confirm-panel--${tone}`} role="alertdialog" aria-label={title}>
      <p className="confirm-panel__title">{title}</p>
      {children}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="confirm-panel__actions">
        <button type="button" className={`button button--${tone}`} onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
        <button type="button" className="button" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  );
}
