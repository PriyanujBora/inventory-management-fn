import ProductRow from './ProductRow';

export default function ProductTable({ products, onRename }) {
  if (products.length === 0) return <p className="empty">No products match these filters.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Barcode</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last updated</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow key={product.id} product={product} onRename={onRename} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
