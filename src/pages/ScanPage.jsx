import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import TypeSwitch from '../components/TypeSwitch';
import BarcodeInput from '../components/BarcodeInput';
import RegisterProductForm from '../components/RegisterProductForm';
import ScanResult from '../components/ScanResult';
import ScanTable from '../components/ScanTable';
import api from '../api/api';

// The camera barcode decoder is large, so it is only downloaded when the camera is first opened.
const CameraScanner = lazy(() => import('../components/CameraScanner'));

const TYPE_STORAGE_KEY = 'inventory.scanType';
const RECENT_SCANS_LIMIT = 10;
// USB scanners sometimes read the same code twice in a row; such repeats are ignored.
const DOUBLE_READ_WINDOW_MS = 2000;

const loadSavedType = () => {
  try {
    return localStorage.getItem(TYPE_STORAGE_KEY) === 'sellable' ? 'sellable' : 'consumable';
  } catch {
    return 'consumable';
  }
};

export default function ScanPage() {
  const [type, setType] = useState(loadSavedType);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [result, setResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [recentError, setRecentError] = useState(null);
  const lastReadRef = useRef({ code: null, at: 0 });
  const resultIdRef = useRef(0);

  const loadRecentScans = useCallback(async () => {
    try {
      setRecentScans(await api.get('/scans', { params: { limit: RECENT_SCANS_LIMIT } }));
      setRecentError(null);
    } catch (err) {
      setRecentError(err.message);
    }
  }, []);

  useEffect(() => {
    loadRecentScans();
  }, [loadRecentScans]);

  useEffect(() => {
    try {
      localStorage.setItem(TYPE_STORAGE_KEY, type);
    } catch {
      // Storage can be unavailable (e.g. private browsing); the switch still works for this visit.
    }
  }, [type]);

  // A new id per result re-runs the banner animation, even when the same text repeats.
  const showResult = (value) => {
    resultIdRef.current += 1;
    setResult({ id: resultIdRef.current, ...value });
  };

  const handleScan = async (barcode) => {
    // Scanning is paused while a new product is being named.
    if (pendingBarcode) return;

    const now = Date.now();
    const lastRead = lastReadRef.current;
    if (barcode === lastRead.code && now - lastRead.at < DOUBLE_READ_WINDOW_MS) return;
    lastReadRef.current = { code: barcode, at: now };

    try {
      // Toggles a registered product IN/OUT; unknown barcodes come back as NOT_REGISTERED.
      showResult(await api.post('/scans', { barcode, type }));
      loadRecentScans();
    } catch (err) {
      if (err.code === 'NOT_REGISTERED') {
        setResult(null);
        setRegisterError(null);
        setPendingBarcode(barcode);
      } else {
        showResult({ error: err.message });
      }
    }
  };

  const handleRegister = async (name) => {
    setRegistering(true);
    setRegisterError(null);
    try {
      // Registers the new barcode; it starts IN the inventory.
      showResult(await api.post('/products', { barcode: pendingBarcode, name, type }));
      setPendingBarcode(null);
      loadRecentScans();
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegister = () => {
    setPendingBarcode(null);
    setRegisterError(null);
  };

  return (
    <PageLayout title="Scan">
      <section className={`scan-panel scan-panel--${type}`}>
        <TypeSwitch value={type} onChange={setType} />
        <p className="scan-panel__hint">Scan once to put an item IN, scan it again to take it OUT.</p>
        <BarcodeInput onScan={handleScan} disabled={Boolean(pendingBarcode)} />
        <div>
          <button type="button" className="button" onClick={() => setCameraOpen((open) => !open)}>
            {cameraOpen ? 'Close camera' : 'Use camera'}
          </button>
        </div>
        {cameraOpen && (
          <Suspense fallback={<p className="muted">Starting camera…</p>}>
            <CameraScanner onDetected={handleScan} paused={Boolean(pendingBarcode)} />
          </Suspense>
        )}
      </section>

      {pendingBarcode && (
        <RegisterProductForm
          key={pendingBarcode}
          barcode={pendingBarcode}
          type={type}
          submitting={registering}
          error={registerError}
          onSubmit={handleRegister}
          onCancel={handleCancelRegister}
        />
      )}

      {result && <ScanResult key={result.id} result={result} />}

      <section className="section">
        <h2 className="section__title">Recent scans</h2>
        {recentError ? <p className="form-error">{recentError}</p> : <ScanTable scans={recentScans} />}
      </section>
    </PageLayout>
  );
}
