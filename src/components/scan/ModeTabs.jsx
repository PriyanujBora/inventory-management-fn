import { SCAN_MODES } from '../../utils/labels';

// Stock In | Take Out | Count, each with its own colour so staff always know which mode they're in.
export default function ModeTabs({ value, onChange }) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="Scan mode">
      {SCAN_MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          role="tab"
          aria-selected={value === mode.value}
          className={`mode-tabs__tab mode-tabs__tab--${mode.value}`}
          onClick={() => onChange(mode.value)}
        >
          <span className="mode-tabs__label">{mode.label}</span>
          <span className="mode-tabs__hint">{mode.hint}</span>
        </button>
      ))}
    </div>
  );
}
