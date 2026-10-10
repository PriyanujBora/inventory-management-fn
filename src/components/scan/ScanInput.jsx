import { lazy, Suspense, useState } from 'react';
import BarcodeInput from '../BarcodeInput';

// The camera barcode decoder is large, so it is only downloaded when the camera is first opened.
const CameraScanner = lazy(() => import('../CameraScanner'));

// Keyboard-style scanner box plus an optional live camera, both feeding the same onScan.
export default function ScanInput({ onScan, disabled = false, pausedMessage }) {
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <div className="scan-input">
      <BarcodeInput onScan={onScan} disabled={disabled} />
      <div>
        <button type="button" className="button" onClick={() => setCameraOpen((open) => !open)}>
          {cameraOpen ? 'Close camera' : 'Use camera'}
        </button>
      </div>
      {cameraOpen && (
        <Suspense fallback={<p className="muted">Starting camera…</p>}>
          <CameraScanner onDetected={onScan} paused={disabled} pausedMessage={pausedMessage} />
        </Suspense>
      )}
    </div>
  );
}
