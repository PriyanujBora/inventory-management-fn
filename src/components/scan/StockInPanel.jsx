import { useEffect, useRef, useState } from 'react';
import api from '../../api/api';
import ScanInput from './ScanInput';
import ReceiptLines from './ReceiptLines';
import RegisterProductForm from './RegisterProductForm';
import ScanResult from '../ScanResult';
import ConfirmPanel from '../ConfirmPanel';
import { beepError, beepSuccess } from '../../utils/beep';
import { formatINR, formatNumber } from '../../utils/format';
import { loadJSON, saveJSON } from '../../utils/storage';

// The unsaved receipt survives a refresh, so a half-scanned delivery is never lost.
const DRAFT_KEY = 'inventory.stockInDraft';
const EMPTY_DRAFT = { reference: '', supplier: '', isOpening: false, lines: [] };

const loadDraft = () => {
  const saved = loadJSON(DRAFT_KEY, EMPTY_DRAFT);
  return { ...EMPTY_DRAFT, ...saved, lines: Array.isArray(saved?.lines) ? saved.lines : [] };
};

const isValidQty = (qty) => Number.isInteger(Number(qty)) && Number(qty) >= 1 && Number(qty) <= 10000 && qty !== '';
const isValidCost = (cost) => cost === '' || cost === null || (Number.isFinite(Number(cost)) && Number(cost) >= 0);

// Stock In builds a receipt like a cart: each scan adds a unit; Save posts the whole delivery at once.
export default function StockInPanel() {
  const [draft, setDraft] = useState(loadDraft);
  const [pendingBarcode, setPendingBarcode] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const resultIdRef = useRef(0);

  useEffect(() => {
    saveJSON(DRAFT_KEY, draft);
  }, [draft]);

  // A new id per result re-runs the banner animation, even when the text repeats.
  const showResult = (value) => {
    resultIdRef.current += 1;
    setResult({ id: resultIdRef.current, ...value });
  };

  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  // One more unit of a product already on the receipt, or a new line with qty 1 at the current cost.
  const addUnit = (product) =>
    setDraft((current) => {
      const exists = current.lines.some((line) => line.barcode === product.barcode);
      return {
        ...current,
        lines: exists
          ? current.lines.map((line) =>
              line.barcode === product.barcode ? { ...line, qty: (Number(line.qty) || 0) + 1 } : line
            )
          : [
              {
                productId: product.id,
                barcode: product.barcode,
                name: product.name,
                category: product.category,
                qty: 1,
                unitCost: product.unitCost ?? '',
              },
              ...current.lines,
            ],
      };
    });

  const updateLine = (barcode, changes) =>
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.barcode === barcode ? { ...line, ...changes } : line)),
    }));

  const removeLine = (barcode) =>
    setDraft((current) => ({ ...current, lines: current.lines.filter((line) => line.barcode !== barcode) }));

  const handleScan = async (barcode) => {
    // Scanning the same product again just increments its line; no need to ask the server.
    if (draft.lines.some((line) => line.barcode === barcode)) {
      addUnit({ barcode });
      beepSuccess();
      showResult({ barcode });
      return;
    }

    try {
      const product = await api.get(`/products/barcode/${encodeURIComponent(barcode)}`);
      if (!product.isActive) {
        beepError();
        showResult({ error: `${product.name} is marked inactive. Reactivate it on the Products page first.` });
        return;
      }
      addUnit(product);
      beepSuccess();
      showResult({ barcode });
    } catch (err) {
      beepError();
      if (err.code === 'NOT_REGISTERED') {
        setResult(null);
        setRegisterError(null);
        setPendingBarcode(barcode);
      } else {
        showResult({ error: err.message });
      }
    }
  };

  const handleRegister = async (fields) => {
    setRegistering(true);
    setRegisterError(null);
    try {
      const product = await api.post('/products', { barcode: pendingBarcode, ...fields });
      addUnit(product);
      setPendingBarcode(null);
      beepSuccess();
      showResult({ barcode: product.barcode, isNew: true });
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const units = draft.lines.reduce((sum, line) => sum + (Number(line.qty) || 0), 0);
  const total = draft.lines.reduce((sum, line) => sum + (Number(line.qty) || 0) * (Number(line.unitCost) || 0), 0);

  const handleSave = async () => {
    const badQty = draft.lines.find((line) => !isValidQty(line.qty));
    const badCost = draft.lines.find((line) => !isValidCost(line.unitCost));
    if (badQty) return setSaveError(`Check the quantity for ${badQty.name} (a whole number from 1 to 10,000).`);
    if (badCost) return setSaveError(`Check the unit cost for ${badCost.name}.`);

    setSaving(true);
    setSaveError(null);
    try {
      const receipt = await api.post('/receipts', {
        reference: draft.reference.trim() || undefined,
        supplier: draft.supplier.trim() || undefined,
        isOpening: draft.isOpening,
        lines: draft.lines.map((line) => ({
          barcode: line.barcode,
          qty: Number(line.qty),
          ...(line.unitCost !== '' && line.unitCost !== null && { unitCost: Number(line.unitCost) }),
        })),
      });
      setDraft(EMPTY_DRAFT);
      beepSuccess();
      showResult({ saved: receipt });
    } catch (err) {
      beepError();
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setDraft(EMPTY_DRAFT);
    setConfirmDiscard(false);
    setResult(null);
  };

  const renderResult = () => {
    if (!result) return null;
    if (result.error) return <ScanResult key={result.id} tone="error" title={result.error} />;
    if (result.saved) {
      const { saved } = result;
      return (
        <ScanResult
          key={result.id}
          tone="success"
          title={`Receipt #${saved.id} saved${saved.isOpening ? ' (opening stock)' : ''}`}
          detail={`${formatNumber(saved.lineCount)} products · ${formatNumber(saved.units)} units · ${formatINR(saved.totalValue)}`}
        />
      );
    }
    const line = draft.lines.find((l) => l.barcode === result.barcode);
    if (!line) return null;
    return (
      <ScanResult
        key={result.id}
        tone="success"
        title={
          <>
            {line.name}: <strong>{formatNumber(Number(line.qty) || 0)}</strong> on this receipt
          </>
        }
        detail={result.isNew ? 'New product registered.' : undefined}
      />
    );
  };

  return (
    <div className="mode-panel">
      <div className="form-grid">
        <label className="field">
          <span className="field__label">Supplier bill no.</span>
          <input
            className="field__input"
            value={draft.reference}
            onChange={(event) => setField('reference', event.target.value)}
            maxLength={100}
            placeholder="Optional"
          />
        </label>
        <label className="field">
          <span className="field__label">Supplier</span>
          <input
            className="field__input"
            value={draft.supplier}
            onChange={(event) => setField('supplier', event.target.value)}
            maxLength={150}
            placeholder="Optional"
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={draft.isOpening}
            onChange={(event) => setField('isOpening', event.target.checked)}
          />
          Opening stock (already on shelves)
        </label>
      </div>

      <ScanInput onScan={handleScan} disabled={Boolean(pendingBarcode)} pausedMessage="Paused while you register the new product." />

      {pendingBarcode && (
        <RegisterProductForm
          key={pendingBarcode}
          barcode={pendingBarcode}
          submitting={registering}
          error={registerError}
          onSubmit={handleRegister}
          onCancel={() => setPendingBarcode(null)}
        />
      )}

      {renderResult()}

      <ReceiptLines lines={draft.lines} onChange={updateLine} onRemove={removeLine} />

      {draft.lines.length > 0 && (
        <div className="receipt-footer">
          <p className="receipt-footer__totals">
            {formatNumber(draft.lines.length)} products · {formatNumber(units)} units · <strong>{formatINR(total)}</strong>
          </p>
          {saveError && (
            <p className="form-error" role="alert">
              {saveError}
            </p>
          )}
          {confirmDiscard ? (
            <ConfirmPanel
              title="Discard this receipt?"
              confirmLabel="Discard"
              onConfirm={discard}
              onCancel={() => setConfirmDiscard(false)}
            >
              <p>All scanned lines are removed. Nothing has been saved yet.</p>
            </ConfirmPanel>
          ) : (
            <div className="form-actions">
              <button type="button" className="button button--primary button--large" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save receipt'}
              </button>
              <button type="button" className="button" onClick={() => setConfirmDiscard(true)} disabled={saving}>
                Discard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
