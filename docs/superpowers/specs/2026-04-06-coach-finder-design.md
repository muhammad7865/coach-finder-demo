# Coach Finder — Design Spec
**Date:** 2026-04-06  
**Status:** Approved

---

## Overview

A demo web app for a hosiery export business owner who wants to find coaches at small sports clubs. The MVP scrapes Instagram by hashtag/location, filters by follower count, and exports results to Excel.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Scraping | Apify — `apify/instagram-hashtag-scraper` |
| Export | `xlsx` library |
| Deployment | Vercel |
| Config | `.env` file with `APIFY_API_TOKEN` |

---

## Architecture

```
app/
├── page.tsx                  # Main search UI (composes all components)
├── api/
│   └── scrape/
│       └── route.ts          # Server-side Apify call, returns normalized results
└── components/
    ├── SearchForm.tsx         # Search inputs + submit button
    ├── ResultsTable.tsx       # Data grid with coach results + loading skeleton
    └── ExportButton.tsx       # Generates and downloads coaches.xlsx
```

---

## Data Flow

1. User fills in SearchForm (hashtag required; location and maxFollowers optional)
2. Client POSTs `{ hashtag, location, maxFollowers }` to `/api/scrape`
3. API route reads `APIFY_API_TOKEN` from env, calls Apify actor
4. Apify returns raw Instagram profiles
5. API route filters by `maxFollowers` if provided, normalizes to `CoachResult[]`
6. Client receives array, renders ResultsTable
7. User clicks Export → xlsx generated client-side from current results → file download triggered

---

## API Route — `/api/scrape`

**Method:** POST  
**Request body:**
```ts
{
  hashtag: string        // required
  location?: string      // optional, passed to Apify input
  maxFollowers?: number  // optional, client-side filter applied after fetch
}
```

**Response:**
```ts
CoachResult[] = {
  name: string
  bio: string
  email: string | null   // extracted from bio if present, else null
  followers: number
  instagramUrl: string
}
```

**Error handling:** Returns `{ error: string }` with appropriate HTTP status on Apify failure.

---

## Components

### SearchForm
- Inputs: hashtag (text, required), location (text, optional), max followers (number, optional)
- "Find Coaches" submit button — disabled while a request is in flight
- Inline validation: show error if hashtag is empty on submit

### ResultsTable
- shadcn `Table` with columns: Name, Bio, Email, Followers, Instagram URL
- Shows a loading skeleton (shimmer rows) while API call is pending
- Shows empty state message when no results found
- Results live in React state in `page.tsx` — cleared on new search

### ExportButton
- Disabled when results array is empty
- On click: uses `xlsx` to create a workbook with one sheet ("Coaches"), triggers browser download as `coaches.xlsx`
- Columns match table: Name, Bio, Email, Followers, Instagram URL

---

## Environment

```env
APIFY_API_TOKEN=your_token_here
```

No database. No authentication. No session persistence — results reset on page refresh.

---

## Out of Scope (MVP)

- LinkedIn / Facebook scraping (future phases)
- User accounts or saved searches
- Pagination of results
- Email outreach features
