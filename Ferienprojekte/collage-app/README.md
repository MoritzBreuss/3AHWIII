# SnapGrid

> Privacy-first photo collage — everything runs locally in the browser, nothing is uploaded.

A mobile-first collage tool built in vanilla HTML/CSS/JS. Choose a custom grid, upload photos from your device, drag them into position, and save the result as a PNG or JPEG. Works completely offline once loaded.

**Live:** [collage-app-zeta.vercel.app](https://collage-app-zeta.vercel.app)

---

## Features

| Feature | Detail |
|---------|--------|
| **Zero Upload** | All processing happens in the browser via the Canvas API |
| **Custom Grid** | Rows 1–6 × Columns 1–6, adjustable gap |
| **Drag & Drop** | Touch and mouse drag-to-arrange on all devices |
| **Photo Tray** | Scrollable thumbnail strip, tap to eject/reassign |
| **Save** | Download PNG/JPEG on desktop; iOS share-sheet overlay on mobile |
| **Dark / Light Mode** | CSS `[data-theme]` on `<html>`, syncs with Project Hub via `localStorage('theme')` |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Vanilla HTML / CSS / JavaScript |
| Rendering | HTML5 Canvas API |
| Hosting | Vercel (static) |
| Theme | CSS custom properties + `[data-theme]` on `<html>` |

---

## Project Structure

```
snapgrid/
├── index.html      # Entire app (single file)
├── vercel.json     # Security headers
└── README.md
```

---

## Local Development

No build step required — open `index.html` directly in a browser, or serve with any static server:

```bash
npx serve .
```

---

## Deployment

```bash
vercel --prod
```

The project is linked to the `collage-app-zeta` Vercel project via `.vercel/project.json`.
