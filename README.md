# inventory-management-fn

Frontend of **inventory-management**: a React + Vite app for a salon's stock ledger.

- **Stock In**: scan deliveries in.
- **Take Out**: scan items out against a named staff member.
- **Count**: run periodic stock counts.

Missing stock is shown in units and ₹.

Backend: [inventory-management-bn](https://github.com/PriyanujBora/inventory-management-bn). Run it first, and load `config/seed.sql` there if you want demo data.

## Requirements

- Node.js 24+ (some dependencies declare it)
- The backend running (default `http://localhost:5000`)

## Run

```bash
cp .env.example .env    # VITE_API_URL=http://localhost:5000
npm install
npm run dev             # http://localhost:5173
```

The backend must allow this site's origin in its `CLIENT_ORIGIN` setting (default `http://localhost:5173`). Restart `npm run dev` after changing `.env`.

## Screens

| URL | Screen |
|---|---|
| `/` | **Scan**, with three mode tabs: **Stock In** (green), **Take Out** (orange), **Count** (indigo). The last mode is remembered; `/?mode=count` opens Count. |
| `/products` | Products with stock on hand, a low-stock highlight, search and filters, and edit in the row. Click a name for its history. |
| `/dashboard` | Period summary: tiles (Bought, Used, Sold, **Missing**, Low stock), a sortable per-product table, CSV export. |
| `/staff-usage` | What each person took out (used / sold / damaged) in units and ₹, with a per-product drill-down and CSV export. |
| `/history` | The movement ledger, paginated and filterable by date, product, staff and type. Reversed rows are struck through. Owner **Reverse** needs a reason. |
| `/counts`, `/counts/:id` | The open count's preview (expected vs counted vs ₹), **Close count**, past counts and their results. |
| `/staff` | Add, rename, change role, activate / deactivate. |

### Stock In

- Builds a receipt like a cart. Each scan adds a unit, and scanning the same product again increments its line.
- An unknown barcode opens **Register product**, where name, category and cost are required.
- **Save receipt** posts the whole delivery at once.
- The unsaved list is kept in localStorage, so a refresh doesn't lose a half-scanned delivery.

### Take Out

- Pick **Taken by** and a reason (Used in service / Sold / Damaged). Both stay selected, and scanning is disabled until a name is chosen.
- Each scan is recorded at once: "**Riya** took 1 × … (Used). **7 left**." with **Undo** for 10 s.
- If stock would go below zero, you're offered **Record anyway** or **Cancel**.

### Count

1. **Start count**.
2. Scan every item on the shelf. Each scan adds 1 and is saved immediately.
3. Correct a line by typing the number.
4. **Review & close** shows expected vs counted on the Stock count page. Closing writes the adjustments: negative = **missing**, positive = surplus.

While a count is open, Stock In and Take Out show a warning banner.

### Feedback

- **Sound:** a short high beep means success; a low double beep means an error (Web Audio, no files).
- **Banner:** every scan also shows a big colour-coded banner.

## Scanning

### USB / Bluetooth scanner

- Most scanners behave like a keyboard. Set yours to send **Enter** after each code, usually by scanning a setup barcode from its manual.
- The barcode box keeps focus by itself.
- **Every scan counts**, including the same code twice in a row, because identical items are scanned back-to-back.

### Camera

- Click **Use camera**.
- A code counts once per appearance. Move the item out of view for about 1.5 s before scanning the next identical one.
- Works on `http://localhost:5173`.
- On a phone (same Wi-Fi), run `npm run dev:https`, open the printed `https://<PC-IP>:5173` address, and accept the certificate warning. In this mode the app calls `/api` on its own address and Vite forwards it to the backend.

## Project structure

```
src/
  main.jsx, App.jsx    App.jsx holds the routes only
  pages/               one component per route; owns data loading, composes components
  components/          shared UI (Badge, ScanResult, StatTile, PeriodPicker, SortableHeader, Pagination, …)
    layout/            PageLayout, NavBar
    scan/              Scan page modes: ModeTabs, StockInPanel, TakeOutPanel, CountPanel, ScanInput, …
  api/api.js           axios instance (base URL from .env + interceptors)
  hooks/useApiData.js  the shared loading / error / reload pattern
  utils/               format (formatINR, formatDateTime), period (local dates → UTC range), csv, beep, storage, labels
  index.css            all styles (plain CSS)
```

- **Money and dates:** money is shown with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`, and dates in local time.
- **Report periods:** This month, Last month, This week (Mon–Sun) or a custom range. They are local (IST) calendar dates, sent to the API as UTC `[from, to)`.
- **CSV exports:** they start with a UTF-8 BOM, so Excel shows ₹ and accented names correctly.

## Build

```bash
npm run build     # production bundle in dist/
npm run preview   # serves dist/ on http://localhost:4173 (add it to the backend's CLIENT_ORIGIN)
```
