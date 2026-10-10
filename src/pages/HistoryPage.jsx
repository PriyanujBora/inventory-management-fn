import { useEffect, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import FilterBar from '../components/FilterBar';
import ScanTable from '../components/ScanTable';
import api from '../api/api';

const HISTORY_LIMIT = 100;

export default function HistoryPage() {
  const [type, setType] = useState('');
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    api
      .get('/scans', { params: { type, limit: HISTORY_LIMIT } })
      .then((data) => {
        if (!ignore) setScans(data);
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
  }, [type]);

  return (
    <PageLayout title="History">
      <FilterBar type={type} onTypeChange={setType} />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!error && loading && <p className="muted">Loading…</p>}
      {!error && !loading && (
        <>
          <p className="muted">Newest first, up to the latest {HISTORY_LIMIT} scans.</p>
          <ScanTable scans={scans} />
        </>
      )}
    </PageLayout>
  );
}
