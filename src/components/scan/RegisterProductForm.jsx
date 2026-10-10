import { useState } from 'react';
import Segmented from '../Segmented';
import { CATEGORY_OPTIONS } from '../../utils/labels';

// Shown in Stock In when an unknown barcode is scanned. Name, category and cost are required
// so reports never contain unnamed or unpriced products.
export default function RegisterProductForm({ barcode, submitting, error, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(null);
  const [unitCost, setUnitCost] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [problem, setProblem] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const cost = Number(unitCost);
    const reorder = reorderLevel === '' ? 0 : Number(reorderLevel);

    if (!name.trim()) return setProblem('Enter the product name.');
    if (!category) return setProblem('Choose Professional or Retail.');
    if (unitCost === '' || !Number.isFinite(cost) || cost < 0) return setProblem('Enter the unit cost in ₹.');
    if (!Number.isInteger(reorder) || reorder < 0) return setProblem('Reorder level must be a whole number.');

    setProblem(null);
    onSubmit({ name: name.trim(), category, unitCost: cost, reorderLevel: reorder });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && !submitting) onCancel();
  };

  return (
    <form className="card register-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <h2 className="register-form__title">Register new product</h2>
      <p>
        <code>{barcode}</code> isn&apos;t registered yet. Fill this in once; it is then added to this receipt.
      </p>

      <div className="form-grid">
        <label className="field">
          <span className="field__label">Product name *</span>
          <input
            className="field__input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            placeholder="e.g. L'Oréal Majirel 6.0 50 ml"
            autoFocus
          />
        </label>

        <div className="field">
          <span className="field__label">Category *</span>
          <Segmented label="Category" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        </div>

        <label className="field">
          <span className="field__label">Unit cost (₹) *</span>
          <input
            className="field__input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={unitCost}
            onChange={(event) => setUnitCost(event.target.value)}
            placeholder="e.g. 520"
          />
        </label>

        <label className="field">
          <span className="field__label">Reorder level</span>
          <input
            className="field__input"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={reorderLevel}
            onChange={(event) => setReorderLevel(event.target.value)}
            placeholder="0"
          />
        </label>
      </div>

      {(problem || error) && (
        <p className="form-error" role="alert">
          {problem ?? error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Register & add to receipt'}
        </button>
        <button type="button" className="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
