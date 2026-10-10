import { useEffect, useRef, useState } from 'react';

const isFormField = (element) =>
  element instanceof HTMLElement &&
  (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName));

// Text box that USB/Bluetooth barcode scanners "type" into: they send the code followed by Enter.
export default function BarcodeInput({ onScan, disabled }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (disabled) return undefined;

    // On touch-only devices focusing up front would pop up the on-screen keyboard;
    // the keystroke listener below still catches a Bluetooth scanner there.
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus();

    // When focus has wandered (e.g. after clicking the switch), pull it back on the next keystroke
    // so scanner input is never lost. Other form fields keep their focus.
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
      if (isFormField(document.activeElement)) return;
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const code = value.trim();
    setValue('');
    if (code) onScan(code);
  };

  return (
    <form className="barcode-input" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="barcode-input__field"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        placeholder="Scan a barcode, or type it and press Enter"
        aria-label="Barcode"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="go"
      />
      <button type="submit" className="button button--primary" disabled={disabled || !value.trim()}>
        Submit
      </button>
    </form>
  );
}
