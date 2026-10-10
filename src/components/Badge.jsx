const LABELS = {
  type: { consumable: 'Consumable', sellable: 'Sellable' },
  status: { in: 'IN', out: 'OUT' },
};

// <Badge kind="type" value="sellable" /> or <Badge kind="status" value="in" />
export default function Badge({ kind, value }) {
  return <span className={`badge badge--${value}`}>{LABELS[kind][value] ?? value}</span>;
}
