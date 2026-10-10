import { useState } from 'react';
import Badge from './Badge';

// One inventory row; the name can be edited in place.
export default function ProductRow({ product, onRename }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const startEditing = () => {
    setName(product.name ?? '');
    setError(null);
    setEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onRename(product.id, name.trim());
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && !saving) setEditing(false);
  };

  return (
    <tr>
      <td>
        {editing ? (
          <form className="rename-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            <input
              className="field__input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              placeholder="Product name"
              aria-label="Product name"
              autoFocus
            />
            <button type="submit" className="button button--primary button--small" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="button button--small" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </button>
            {error && <p className="form-error">{error}</p>}
          </form>
        ) : (
          <div className="product-name">
            {product.name ?? <span className="muted">Unnamed</span>}
            <button type="button" className="link-button" onClick={startEditing}>
              Edit
            </button>
          </div>
        )}
      </td>
      <td>
        <code>{product.barcode}</code>
      </td>
      <td>
        <Badge kind="type" value={product.type} />
      </td>
      <td>
        <Badge kind="status" value={product.status} />
      </td>
      <td className="nowrap">{new Date(product.updatedAt).toLocaleString()}</td>
    </tr>
  );
}
