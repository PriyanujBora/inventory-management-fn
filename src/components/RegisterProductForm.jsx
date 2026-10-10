import { useState } from 'react';
import Badge from './Badge';

// Shown when an unknown barcode is scanned: name it, then it is registered and marked IN.
export default function RegisterProductForm({ barcode, type, submitting, error, onSubmit, onCancel }) {
  const [name, setName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(name.trim());
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && !submitting) onCancel();
  };

  return (
    <form className="card register-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <h2 className="register-form__title">New barcode</h2>
      <p>
        <code>{barcode}</code> isn&apos;t registered yet. It will be added as <Badge kind="type" value={type} /> and
        marked <Badge kind="status" value="in" />.
      </p>

      <label className="field">
        <span className="field__label">Product name (optional)</span>
        <input
          className="field__input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={255}
          placeholder="e.g. Printer paper A4"
          autoFocus
        />
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="register-form__actions">
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save & mark IN'}
        </button>
        <button type="button" className="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
