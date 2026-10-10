const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'consumable', label: 'Consumables' },
  { value: 'sellable', label: 'Sellables' },
];

const STATUS_OPTIONS = [
  { value: 'in', label: 'In stock' },
  { value: 'out', label: 'Out' },
  { value: '', label: 'All statuses' },
];

// The status filter is only shown when `onStatusChange` is passed.
export default function FilterBar({ type, onTypeChange, status, onStatusChange }) {
  return (
    <div className="filter-bar">
      <label className="field field--inline">
        <span className="field__label">Type</span>
        <select className="field__input" value={type} onChange={(event) => onTypeChange(event.target.value)}>
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {onStatusChange && (
        <label className="field field--inline">
          <span className="field__label">Status</span>
          <select className="field__input" value={status} onChange={(event) => onStatusChange(event.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
