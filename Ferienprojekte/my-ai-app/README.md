# Fairshare

> Split expenses, track debts — real-time sync with Next.js & Convex.

A full-stack expense-sharing app. Add people, log shared costs, and instantly see who owes whom. All data syncs live across browsers via Convex's reactive database.

**Live:** [my-expense-tracker-theta.vercel.app/expense-tracker](https://my-expense-tracker-theta.vercel.app/expense-tracker)

---

## Features

| Feature | Detail |
|---------|--------|
| **Real-time Sync** | Convex reactive queries — changes appear instantly across all clients |
| **Expense Splitting** | Add people, log costs, split evenly or by custom amount |
| **Balance Summary** | Live KPI cards showing who owes what |
| **Pagination** | Client-side paginated expense list |
| **PDF Export** | Download a summary report |
| **Auth** | Convex Auth — each user has their own account |
| **Dark / Light Mode** | CSS custom properties, `localStorage('theme')`, syncs with Project Hub |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Database & Sync | Convex |
| Auth | Convex Auth |
| Language | TypeScript |
| Styling | CSS Modules |
| Hosting | Vercel |

---

## Project Structure

```
fairshare/
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── Auth.tsx                    # Login / register screen
│   ├── ConvexClientProvider.tsx
│   ├── expense-tracker/
│   │   └── page.tsx                # Main app entry
│   ├── components/
│   │   ├── ExpenseTracker.tsx      # Core logic
│   │   ├── ExpenseItem.tsx
│   │   ├── FilterBar.tsx
│   │   ├── KpiCard.tsx
│   │   ├── Pagination.tsx
│   │   ├── PersonCard.tsx
│   │   ├── SplitExpenseModal.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── BalanceSummary.tsx
│   │   └── AccountSettings.tsx
│   ├── hooks/
│   │   ├── useSession.ts
│   │   └── useTheme.ts
│   └── styles/
│       ├── auth.module.css
│       ├── dashboard.module.css
│       └── shared.module.css
├── convex/
│   ├── schema.ts                   # Database schema
│   ├── expenses.ts                 # Expense mutations & queries
│   └── users.ts                    # User mutations & queries
├── next.config.ts
├── vercel.json
└── README.md
```

---

## Local Development

```bash
npm install
npx convex dev   # Start Convex backend (requires Convex account)
npm run dev      # Start Next.js on http://localhost:3000
```

Copy `.env.local.example` to `.env.local` and fill in your Convex deployment URL.

---

## Deployment

```bash
npx convex deploy   # Deploy Convex functions first
vercel --prod       # Deploy Next.js frontend
```
