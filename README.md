# inventory-management-fn

Frontend of **inventory-management**: a React + Vite app for scanning products **IN** and **OUT** of the inventory.

Backend: [inventory-management-bn](https://github.com/PriyanujBora/inventory-management-bn). It must be running on `http://localhost:5000`.

## Pages

| URL | Page |
|---|---|
| `/` | **Scan**: Consumables/Sellables switch, barcode box, camera scanner, result banner, recent scans |
| `/inventory` | **Inventory**: products filtered by type and status, with inline rename |
| `/history` | **History**: the latest 100 scans, filterable by type |

## Requirements

- Node.js 24+ (some dependencies declare it)
- The backend running on port 5000

## Run

```bash
cp .env.example .env    # VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Open http://localhost:5173.

All requests go through the axios instance in [src/api/api.js](src/api/api.js), whose base URL is `VITE_API_URL` + `/api`. Components call endpoints on it directly, e.g. `api.get('/products', { params: { status: 'in' } })` or `api.post('/scans', { barcode, type })`.

Its interceptors:
- **Request**: drop empty query params, so an "All" filter isn't sent as `?type=`.
- **Response**: resolve with the backend's `data` directly.
- **Errors**: reject with an `ApiError` that carries the backend's `message`, `status` and `code` (e.g. `NOT_REGISTERED`).

The backend must allow this site's origin in its `CLIENT_ORIGIN` setting (the default is `http://localhost:5173`). If you change `.env`, restart `npm run dev`.

## How scanning works

1. Pick **Consumables** or **Sellables** with the switch. The scan panel takes on that colour, and the choice is remembered.
2. Scan a barcode.
   - **First time seen**: scanning pauses and a short form asks for the product name, which is optional. **Save & mark IN** registers it with the switch's type. **Cancel** or Esc registers nothing.
   - **Known barcode**: it flips IN → OUT → IN …, and a big green **IN** or orange **OUT** banner confirms it.
   - **Switch on the other type**: the scan is blocked with a warning such as *"This product is a Consumable. Switch to Consumable to scan it."*, and nothing changes.

### USB / Bluetooth scanner

Most handheld scanners behave like a keyboard. Set yours to send **Enter** after each code; this is usually done by scanning a setup barcode from its manual.

- The barcode box keeps focus on its own. Even after you click elsewhere on the scan page, the next scanned code still lands in it.
- The same code read twice within 2 seconds is ignored, which protects against accidental double reads.
- You can also type a code and press Enter.

### Camera

Click **Use camera** and hold the barcode steady. Each code is scanned once, then ignored while it stays in view and for 3 seconds after, so it doesn't flip back and forth.

- **Laptop or desktop**: works on `http://localhost:5173`.
- **Phone on the same Wi-Fi**: browsers only allow the camera on HTTPS pages, so run

  ```bash
  npm run dev:https
  ```

  Then, on the phone:
  1. Open the `https://<your-PC-IP>:5173` address it prints.
  2. Accept the self-signed certificate warning.
  3. Allow camera access.

  Windows may ask to let Node.js through the firewall the first time.

  In this mode the app ignores `VITE_API_URL`: a phone can't reach the PC's `localhost:5000`, and an HTTPS page can't call plain HTTP. Instead it calls `/api` on its own address, and Vite's proxy forwards those requests to the backend.

The camera decoder ([@zxing/browser](https://www.npmjs.com/package/@zxing/browser)) is bundled with the app and only downloaded when the camera is first opened.

## Project structure

```
src/
  main.jsx       mounts <App /> inside <BrowserRouter>
  App.jsx        routes only: each URL renders a page
  pages/         one component per route; owns state, calls the API, composes components
  components/    UI building blocks (TypeSwitch, BarcodeInput, CameraScanner, ScanResult, tables, …)
    layout/      structural components shared by every page (PageLayout, NavBar)
  api/api.js     the axios instance (base URL from .env + interceptors)
  index.css      global styles
```

## Build

```bash
npm run build     # production bundle in dist/
npm run preview   # serves dist/ on http://localhost:4173
```

`VITE_API_URL` is baked in at build time. For `preview`, add `http://localhost:4173` to the backend's `CLIENT_ORIGIN`.
