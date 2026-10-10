import { useState } from 'react';
import { Link } from 'react-router';
import Badge from './Badge';
import { formatINR, formatNumber } from '../utils/format';
import { CATEGORY_OPTIONS } from '../utils/labels';

// One product. Its name opens the product's movement history; Edit changes it in place.
// TODO(auth): editing and deactivating will be owner-only.
export default function ProductRow({ product, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const startEditing = () => {
    setForm({
      name: product.name,
      category: product.category,
      unitCost: product.unitCost ?? '',
      reorderLevel: product.reorderLevel,
      isActive: product.isActive,
    });
    setError(null);
    setEditing(true);
  };

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const unitCost = Number(form.unitCost);
    const reorderLevel = Number(form.reorderLevel);
    if (!form.name.trim()) return setError('Name is required.');
    if (form.unitCost === '' || !Number.isFinite(unitCost) || unitCost < 0) return setError('Enter a unit cost in ₹.');
    if (!Number.isInteger(reorderLevel) || reorderLevel < 0) return setError('Reorder level must be a whole number.');

    setSaving(true);
    setError(null);
    try {
      await onSave(product.id, { name: form.name.trim(), category: form.category, unitCost, reorderLevel, isActive: form.isActive });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <tr className="is-editing">
        <td colSpan={6}>
          <form className="product-edit" onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}>
            <label className="field">
              <span className="field__label">Name</span>
              <input className="field__input" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={255} autoFocus />
            </label>
            <label className="field">
              <span className="field__label">Category</span>
              <select className="field__input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Unit cost (₹)</span>
              <input
                className="field__input field__input--money"
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(e) => set('unitCost', e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Reorder level</span>
              <input
                className="field__input field__input--qty"
                type="number"
                min="0"
                step="1"
                value={form.reorderLevel}
                onChange={(e) => set('reorderLevel', e.target.value)}
              />
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
              Active
            </label>
            <div className="form-actions">
              <button type="submit" className="button button--primary button--small" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="button button--small" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`${product.isLowStock && product.isActive ? 'is-low' : ''}${product.isActive ? '' : ' is-inactive'}`}>
      <td>
        <Link to={`/history?productId=${product.id}`} className="cell-title" title="Movement history">
          {product.name}
        </Link>
        <div className="cell-sub">
          <code>{product.barcode}</code>
          {!product.isActive && <span className="pill pill--muted">Inactive</span>}
        </div>
      </td>
      <td>
        <Badge kind="category" value={product.category} />
      </td>
      <td className="num nowrap">{formatINR(product.unitCost)}</td>
      <td className="num">{formatNumber(product.reorderLevel)}</td>
      <td className="num">
        <strong>{formatNumber(product.inStock)}</strong>
        {product.isLowStock && product.isActive && <span className="pill pill--warning">Low</span>}
      </td>
      <td>
        <button type="button" className="link-button" onClick={startEditing}>
          Edit
        </button>
      </td>
    </tr>
  );
}
