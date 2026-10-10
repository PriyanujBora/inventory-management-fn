import { CATEGORY_LABELS, COUNT_STATUS_LABELS, MOVEMENT_LABELS, ROLE_LABELS } from '../utils/labels';

const LABELS = {
  category: CATEGORY_LABELS,
  movement: MOVEMENT_LABELS,
  role: ROLE_LABELS,
  countStatus: COUNT_STATUS_LABELS,
};

// <Badge kind="category" value="retail" />, <Badge kind="movement" value="sold" />, …
export default function Badge({ kind, value }) {
  return <span className={`badge badge--${kind}-${value}`}>{LABELS[kind][value] ?? value}</span>;
}
