# Circular Dot-Matrix QR Studio

A watermark-free, zero-build QR code generator for laser engraving, patches, caps, and marketing. Runs entirely in the browser on GitHub Pages.

## Features

**Export**
- Watermark-free SVG (laser-ready vector)
- High-resolution PNG up to 300 DPI
- Print-ready PDF with crop marks and bleed (A4 / Letter)

**Design**
- Live URL/text input plus 8 structured data types: URL, text, vCard, WiFi, SMS, email, Bitcoin, calendar
- Adjustable QR rotation (0–360°)
- Circular center cutout with scannability diagnostics vs error-correction level
- 7 center motifs: empty, Rub el Hizb star, Moana waves, Tapa diamond, palm flora, geo pin, custom initials
- 5 outer patterns: QR blend, Pacific Tapa weave, concentric rings, checkerboard, empty
- 4 border styles: solid, dotted, double-stitch leather, none
- Custom foreground / background colors plus 4 material presets (B&W, tan leather, espresso, inverted brass)
- Adjustable quiet zone (modules)
- Transparent background toggle for SVG/PNG

**Mockups**
- Pure vector SVG viewport
- Khaki cap leather-patch preview (right front panel / center over seam)
- Business card mockup
- Die-cut sticker mockup

**Share & Save**
- Encode your entire design into a shareable URL (no account required)
- localStorage auto-save; restore last design on reload
- Copy design link to clipboard

## File Structure

```
qr-code-maker/
├── index.html
├── css/style.css
├── js/config.js
├── js/encoder.js
├── js/matrix.js
├── js/state.js
├── js/svggen.js
├── js/diagnostics.js
├── js/export.js
├── js/mockups.js
├── js/ui.js
├── assets/favicon.svg
├── README.md
├── LICENSE
└── .github/workflows/pages.yml
```

## How to Use

1. Open `index.html` in any modern browser, or deploy to GitHub Pages.
2. Enter your data (URL, vCard, WiFi, etc.) and customize colors, motifs, rotation, and quiet zone.
3. Preview on vector, cap, card, or sticker stages.
4. Download SVG, PNG, or PDF. Copy the shareable link to send the exact design to a client or laser shop.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Set source to **Deploy from a branch** → `main` → `/ (root)`.
4. Your site is live at `https://<user>.github.io/qr-code-maker/`.

Or use the included GitHub Actions workflow (`.github/workflows/pages.yml`) for automatic deployment on push to `main`.

## Tech Stack

- Pure HTML / JavaScript (no build step, no npm install)
- Tailwind CSS via CDN (hybrid with local `css/style.css`)
- `qrcode-generator` via CDN
- `jspdf` via CDN (PDF export)
- `localStorage` + URL hash for state persistence and shareable links

## License

MIT — see [LICENSE](LICENSE).
