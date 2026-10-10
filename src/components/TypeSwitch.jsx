const OPTIONS = [
  { value: 'consumable', label: 'Consumables' },
  { value: 'sellable', label: 'Sellables' },
];

// The scan-mode switch: every scan is for the selected product type.
export default function TypeSwitch({ value, onChange }) {
  return (
    <div className="type-switch" role="radiogroup" aria-label="What are you scanning?">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={`type-switch__option type-switch__option--${option.value}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
