import { useSearchParams } from 'react-router';
import PageLayout from '../components/layout/PageLayout';
import MovementRow from '../components/MovementRow';
import Pagination from '../components/Pagination';
import LoadState from '../components/LoadState';
import useApiData from '../hooks/useApiData';
import api from '../api/api';
import { MOVEMENT_LABELS } from '../utils/labels';

const PAGE_SIZE = 50;

// 'YYYY-MM-DD' (local) → ISO instant of local midnight; `nextDay` makes an inclusive end date exclusive.
const localMidnight = (value, nextDay = false) => {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day + (nextDay ? 1 : 0)).toISOString();
};

// The ledger, newest first. Filters live in the URL, so a product's history can be linked to.
export default function HistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = {
    from: searchParams.get('from') ?? '',
    to: searchParams.get('to') ?? '',
    productId: searchParams.get('productId') ?? '',
    staffId: searchParams.get('staffId') ?? '',
    type: searchParams.get('type') ?? '',
  };
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const products = useApiData(() => api.get('/products'), []);
  const staff = useApiData(() => api.get('/staff'), []);
  const movements = useApiData(
    () =>
      api.get('/movements', {
        params: {
          from: localMidnight(filters.from),
          to: localMidnight(filters.to, true),
          productId: filters.productId,
          staffId: filters.staffId,
          type: filters.type,
          page,
          pageSize: PAGE_SIZE,
        },
      }),
    [searchParams.toString()]
  );

  const reverse = async (id, note) => {
    await api.post(`/movements/${id}/reverse`, { note });
    movements.reload();
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <PageLayout title="History">
      <div className="filter-bar">
        <label className="field">
          <span className="field__label">From</span>
          <input type="date" className="field__input" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">To</span>
          <input type="date" className="field__input" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Product</span>
          <select className="field__input" value={filters.productId} onChange={(e) => setFilter('productId', e.target.value)}>
            <option value="">All products</option>
            {products.data?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Taken by</span>
          <select className="field__input" value={filters.staffId} onChange={(e) => setFilter('staffId', e.target.value)}>
            <option value="">Anyone</option>
            {staff.data?.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Type</span>
          <select className="field__input" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All types</option>
            {Object.entries(MOVEMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <button type="button" className="button button--small filter-bar__clear" onClick={() => setSearchParams({})}>
            Clear filters
          </button>
        )}
      </div>

      <LoadState
        loading={movements.loading}
        error={movements.error}
        hasData={Boolean(movements.data)}
        isEmpty={movements.data?.items.length === 0}
        emptyText="No movements match these filters."
      >
        {movements.data && (
          <>
            <div className="table-wrap">
              <table className="table table--compact">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Product</th>
                    <th className="num">Qty</th>
                    <th>Taken by</th>
                    <th className="num">Unit cost</th>
                    <th>Reference</th>
                    <th>Note</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {movements.data.items.map((movement) => (
                    <MovementRow key={movement.id} movement={movement} onReverse={reverse} />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={movements.data.page}
              pageSize={movements.data.pageSize}
              total={movements.data.total}
              onPageChange={(next) => setFilter('page', String(next))}
            />
          </>
        )}
      </LoadState>
    </PageLayout>
  );
}
