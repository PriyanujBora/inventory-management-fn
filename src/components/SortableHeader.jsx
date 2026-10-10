// A clickable column header. sort: { key, direction: 'asc' | 'desc' }
export default function SortableHeader({ label, sortKey, sort, onSort, numeric = false }) {
  const active = sort.key === sortKey;
  const nextDirection = active && sort.direction === 'desc' ? 'asc' : 'desc';

  return (
    <th
      className={`${numeric ? 'num ' : ''}sortable${active ? ' is-sorted' : ''}`}
      aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" className="sortable__button" onClick={() => onSort({ key: sortKey, direction: nextDirection })}>
        {label}
        <span className="sortable__arrow" aria-hidden="true">
          {active ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );
}

