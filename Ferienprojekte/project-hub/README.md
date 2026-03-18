# Project Hub

> Central landing page linking all personal projects.

A single-page, zero-dependency HTML site that acts as the entry point for all projects. Features an Apple-style card grid, dark/light theme toggle, and direct links to each live app.

**Live:** [my-project-hub-open2.vercel.app](https://my-project-hub-open2.vercel.app)

---

## Projects

| Project | URL | Description |
|---------|-----|-------------|
| **SnapGrid** | [collage-app-zeta.vercel.app](https://collage-app-zeta.vercel.app) | Privacy-first photo collage tool |
| **Fairshare** | [my-expense-tracker-theta.vercel.app](https://my-expense-tracker-theta.vercel.app/expense-tracker) | Expense splitting with real-time sync |
| **PaceVault** | [pacevault.vercel.app](https://pacevault.vercel.app) | Garmin activity exporter |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Vanilla HTML / CSS / JavaScript |
| Theme | CSS custom properties + `[data-scheme]` on `<html>` |
| Hosting | Vercel (static) |

---

## Theme System

The hub uses `data-scheme` on `<html>` and writes `localStorage('theme')`. All sub-projects read that same key so the chosen theme persists when navigating between apps.

---

## Project Structure

```
project-hub/
├── index.html      # Entire hub (single file)
├── vercel.json     # Vercel config
└── README.md
```

---

## Deployment

```bash
vercel --prod
```
