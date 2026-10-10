// A row of mutually exclusive buttons. options: [{ value, label }]
export default function Segmented({ options, value, onChange, label, size }) {
  return (
    <div className={`segmented${size ? ` segmented--${size}` : ''}`} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={`segmented__option segmented__option--${option.value}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
