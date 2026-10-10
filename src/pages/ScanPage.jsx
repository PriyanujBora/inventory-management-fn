import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import PageLayout from '../components/layout/PageLayout';
import ModeTabs from '../components/scan/ModeTabs';
import CountOpenBanner from '../components/scan/CountOpenBanner';
import StockInPanel from '../components/scan/StockInPanel';
import TakeOutPanel from '../components/scan/TakeOutPanel';
import CountPanel from '../components/scan/CountPanel';
import useApiData from '../hooks/useApiData';
import api from '../api/api';
import { SCAN_MODES } from '../utils/labels';
import { loadJSON, saveJSON } from '../utils/storage';

const MODE_KEY = 'inventory.scanMode';
const isMode = (value) => SCAN_MODES.some((mode) => mode.value === value);

export default function ScanPage() {
  const [searchParams] = useSearchParams();
  // ?mode=count (e.g. "Continue counting" on the Stock count page) wins over the remembered mode.
  const [mode, setMode] = useState(() => {
    const requested = searchParams.get('mode') ?? loadJSON(MODE_KEY, 'in');
    return isMode(requested) ? requested : 'in';
  });

  useEffect(() => {
    saveJSON(MODE_KEY, mode);
  }, [mode]);

  // Re-checked on every mode switch: someone else may have started or closed a count.
  const currentCount = useApiData(() => api.get('/counts/current'), [mode]);

  return (
    <PageLayout title="Scan">
      <ModeTabs value={mode} onChange={setMode} />

      {mode !== 'count' && currentCount.data && <CountOpenBanner count={currentCount.data} />}

      <section className={`scan-panel scan-panel--${mode}`}>
        {mode === 'in' && <StockInPanel />}
        {mode === 'out' && <TakeOutPanel />}
        {mode === 'count' && (
          <CountPanel
            count={currentCount.data}
            loading={currentCount.loading && !currentCount.data}
            error={currentCount.error}
            onCountChange={currentCount.setData}
            onReload={currentCount.reload}
          />
        )}
      </section>
    </PageLayout>
  );
}
