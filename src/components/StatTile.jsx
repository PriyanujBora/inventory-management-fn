// A headline number for the period: units on top, ₹ underneath. `prominent` marks the one that matters most.
export default function StatTile({ label, value, subValue, tone = 'neutral', prominent = false }) {
  return (
    <div className={`stat-tile stat-tile--${tone}${prominent ? ' stat-tile--prominent' : ''}`}>
      <p className="stat-tile__label">{label}</p>
      <p className="stat-tile__value">{value}</p>
      {subValue !== undefined && <p className="stat-tile__sub">{subValue}</p>}
    </div>
  );
}
