import { useEffect, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import ProductRow from '../components/ProductRow';
import LoadState from '../components/LoadState';
import useApiData from '../hooks/useApiData';
import api from '../api/api';
import { formatNumber } from '../utils/format';
import { CATEGORY_OPTIONS } from '../utils/labels';

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
  { value: '', label: 'All' },
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [active, setActive] = useState('true');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Search as you type, without a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const products = useApiData(
    () =>
      api.get('/products', {
        params: { search: debouncedSearch, category, active, lowStock: lowStockOnly ? 'true' : undefined },
      }),
    [debouncedSearch, category, active, lowStockOnly]
  );

  // Reload rather than patch the list: an edit can move a product in or out of the current filters.
  const handleSave = async (id, changes) => {
    await api.patch(`/products/${id}`, changes);
    products.reload();
  };

  return (
    <PageLayout title="Products">
      <div className="filter-bar">
        <label className="field field--grow">
          <span className="field__label">Search</span>
          <input
            className="field__input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or barcode"
          />
        </label>
        <label className="field">
          <span className="field__label">Category</span>
          <select className="field__input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Status</span>
          <select className="field__input" value={active} onChange={(event) => setActive(event.target.value)}>
            {ACTIVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={lowStockOnly} onChange={(event) => setLowStockOnly(event.target.checked)} />
          Low stock only
        </label>
      </div>

      <p className="muted">
        New products are registered by scanning them in Stock In. Click a product to see its movement history.
      </p>

      <LoadState
        loading={products.loading}
        error={products.error}
        hasData={Boolean(products.data)}
        isEmpty={products.data?.length === 0}
        emptyText="No products match these filters."
      >
        {products.data && (
          <>
            <p className="muted">
              {formatNumber(products.data.length)} {products.data.length === 1 ? 'product' : 'products'}
            </p>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th className="num">Unit cost</th>
                    <th className="num">Reorder level</th>
                    <th className="num">In stock</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {products.data.map((product) => (
                    <ProductRow key={product.id} product={product} onSave={handleSave} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </LoadState>
    </PageLayout>
  );
}
