# PaceVault

> Personal Garmin fitness exporter — fetch, filter, and export your activity data.

A multi-user Express.js backend that authenticates with Garmin Connect via OAuth. Each user logs in with their own Garmin credentials; nothing is stored server-side. Activities, laps, zones, and time-series data can be previewed, copied, or downloaded as structured text reports.

**Live:** [pacevault.vercel.app](https://pacevault.vercel.app)

---

## Features

| Feature | Detail |
|---------|--------|
| **Per-user Auth** | Each visitor logs in with their own Garmin Connect account |
| **OAuth Tokens** | Garmin OAuth 1 + OAuth 2; tokens live in `sessionStorage` only |
| **Activity List** | Fetch up to 200 activities with date & type filters |
| **Detail View** | Per-activity stats, laps/splits, heart rate zones, power zones |
| **Time-Series** | Full metric columns (HR, cadence, pace, power, altitude…) |
| **Export** | Preview in-app, copy to clipboard, or download `.txt` report |
| **Rate Limiting** | Max 5 login attempts per 15 min via `express-rate-limit` |
| **Security** | Helmet.js headers, CORS, no stored credentials |
| **Dark / Light Mode** | CSS `[data-theme]` on `<html>`, syncs with Project Hub via `localStorage('theme')` |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Garmin API | `garmin-connect` npm package |
| Security | Helmet.js, express-rate-limit |
| Frontend | Vanilla HTML/CSS/JS (served from `public/`) |
| Hosting | Vercel (serverless Express via `builds` config) |

---

## Project Structure

```
pacevault/
├── server.js           # Express app — all API routes and Garmin logic
├── public/
│   └── index.html      # Frontend (login form, activity explorer, export UI)
├── vercel.json         # Vercel serverless Express build config
├── package.json
└── README.md
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/login` | None | `{email, password}` → Garmin OAuth tokens |
| `GET` | `/api/activities` | `x-garmin-tokens` header | Returns up to 200 activities |
| `GET` | `/api/activity-details` | `x-garmin-tokens` header | Laps, metrics & zones for one activity |

Returns `401` if the token header is missing or expired.

---

## Local Development

```bash
npm install
node server.js   # Starts on http://localhost:3000
```

---

## Deployment

```bash
vercel --prod
```

The project is linked to the `pacevault` Vercel project via `.vercel/project.json`.
