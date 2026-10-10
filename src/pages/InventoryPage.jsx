import { useEffect, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import FilterBar from '../components/FilterBar';
import ProductTable from '../components/ProductTable';
import api from '../api/api';

export default function InventoryPage() {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('in');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    api
      .get('/products', { params: { type, status } })
      .then((data) => {
        if (!ignore) setProducts(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [type, status]);

  const handleRename = async (id, name) => {
    const updated = await api.patch(`/products/${id}`, { name });
    setProducts((current) => current.map((product) => (product.id === id ? updated : product)));
  };

  return (
    <PageLayout title="Inventory">
      <FilterBar type={type} onTypeChange={setType} status={status} onStatusChange={setStatus} />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!error && loading && <p className="muted">Loading…</p>}
      {!error && !loading && (
        <>
          <p className="muted">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
          <ProductTable products={products} onRename={handleRename} />
        </>
      )}
    </PageLayout>
  );
}
