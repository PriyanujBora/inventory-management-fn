import Segmented from './Segmented';
import { PERIODS } from '../utils/period';

// value: { period, customFrom, customTo } (dates as 'YYYY-MM-DD', local)
export default function PeriodPicker({ value, onChange, label }) {
  const update = (changes) => onChange({ ...value, ...changes });

  return (
    <div className="period-picker">
      <Segmented label="Period" options={PERIODS} value={value.period} onChange={(period) => update({ period })} />

      {value.period === 'custom' && (
        <div className="period-picker__custom">
          <label className="field field--inline">
            <span className="field__label">From</span>
            <input
              type="date"
              className="field__input"
              value={value.customFrom ?? ''}
              onChange={(event) => update({ customFrom: event.target.value })}
            />
          </label>
          <label className="field field--inline">
            <span className="field__label">To</span>
            <input
              type="date"
              className="field__input"
              value={value.customTo ?? ''}
              onChange={(event) => update({ customTo: event.target.value })}
            />
          </label>
        </div>
      )}

      {label && <p className="period-picker__label muted">{label}</p>}
    </div>
  );
}
