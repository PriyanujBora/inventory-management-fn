import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

// A code is ignored while it stays in view and for this long after it was last seen,
// so holding a barcode in front of the camera doesn't flip it IN/OUT over and over.
const REPEAT_WINDOW_MS = 3000;

const INSECURE_PAGE_MESSAGE =
  'The camera only works on https:// pages or on localhost. To scan with a phone, start the app with "npm run dev:https".';

const isCameraAvailable = () => Boolean(navigator.mediaDevices?.getUserMedia);

const cameraErrorMessage = (err) => {
  switch (err?.name) {
    case 'NotAllowedError':
      return 'Camera permission was denied. Allow camera access for this site and try again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No camera was found on this device.';
    case 'NotReadableError':
      return 'The camera is in use by another app.';
    default:
      return `Could not start the camera: ${err?.message ?? 'unknown error'}`;
  }
};

export default function CameraScanner({ onDetected, paused }) {
  const viewportRef = useRef(null);
  const onDetectedRef = useRef(onDetected);
  const pausedRef = useRef(paused);
  const [error, setError] = useState(isCameraAvailable() ? null : INSECURE_PAGE_MESSAGE);

  // Read the latest props from the decode callback without restarting the camera.
  useEffect(() => {
    onDetectedRef.current = onDetected;
    pausedRef.current = paused;
  });

  useEffect(() => {
    if (!isCameraAvailable()) return undefined;

    // A fresh <video> per run: zxing's stop() clears its video source, so a run cleaned up
    // late (React StrictMode mounts twice in dev) must not share the element with the live one.
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    viewportRef.current.appendChild(video);

    const reader = new BrowserMultiFormatReader();
    const lastSeenAt = new Map();
    let controls;
    let cancelled = false;

    reader
      .decodeFromConstraints({ video: { facingMode: 'environment' } }, video, (result) => {
        if (!result) return;

        const code = result.getText();
        const now = Date.now();
        const seenRecently = now - (lastSeenAt.get(code) ?? 0) < REPEAT_WINDOW_MS;
        lastSeenAt.set(code, now);

        if (!seenRecently && !pausedRef.current) onDetectedRef.current(code);
      })
      .then((scannerControls) => {
        if (cancelled) scannerControls.stop();
        else controls = scannerControls;
      })
      .catch((err) => {
        if (!cancelled) setError(cameraErrorMessage(err));
      });

    return () => {
      cancelled = true;
      controls?.stop();
      video.remove();
    };
  }, []);

  if (error) return <p className="form-error" role="alert">{error}</p>;

  return (
    <div className="camera">
      <div ref={viewportRef} className="camera__viewport" />
      <p className="camera__hint muted">
        {paused ? 'Paused while you name the new product.' : 'Hold the barcode steady, about a hand-width from the camera.'}
      </p>
    </div>
  );
}
