# Coach Finder — Software Design Document (SDD)
**Date:** 2026-04-06  
**Author:** Muhammad Awais Mohsin  
**Status:** Approved

---

## 1. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) + TypeScript | SSR + API routes in one project |
| Styling | Tailwind CSS | Utility-first, fast to build |
| UI Components | shadcn/ui | Accessible, unstyled-by-default components |
| Scraping | Apify — `apify/instagram-hashtag-scraper` | Managed scraping, no browser infra needed |
| Export | `xlsx` (SheetJS) | Client-side Excel generation, no server needed |
| Deployment | Vercel | Zero-config Next.js hosting |
| Config | `.env.local` | `APIFY_API_TOKEN` kept server-side only |

---

## 2. Project Structure

```
coach-finder-demo/
├── .env.local                        # APIFY_API_TOKEN (not committed)
├── app/
│   ├── layout.tsx                    # Root layout, fonts, metadata
│   ├── page.tsx                      # Main page — composes all components
│   ├── globals.css                   # Tailwind base styles
│   └── api/
│       └── scrape/
│           └── route.ts              # POST handler — calls Apify, returns results
├── components/
│   ├── SearchForm.tsx                # Hashtag, location, maxFollowers inputs
│   ├── ResultsTable.tsx              # Table + loading skeleton + empty state
│   └── ExportButton.tsx             # xlsx download trigger
├── lib/
│   ├── apify.ts                      # Apify client wrapper
│   └── types.ts                      # Shared TypeScript types
├── docs/
│   ├── PRD.md
│   ├── SDD.md
│   └── superpowers/specs/
│       └── 2026-04-06-coach-finder-design.md
└── public/
```

---

## 3. Data Types

```ts
// lib/types.ts

export interface SearchParams {
  hashtag: string
  location?: string
  maxFollowers?: number
}

export interface CoachResult {
  name: string
  bio: string
  email: string | null     // regex-extracted from bio, null if not found
  followers: number
  instagramUrl: string
}

export interface ScrapeResponse {
  results: CoachResult[]
  error?: string
}
```

---

## 4. API Route — `POST /api/scrape`

### Request
```json
{
  "hashtag": "grassrootscoach",
  "location": "Manchester",
  "maxFollowers": 10000
}
```

### Apify Call
- Actor: `apify/instagram-hashtag-scraper`
- Input: `{ hashtags: ["#grassrootscoach"], resultsLimit: 50 }`
- Auth: `Authorization: Bearer ${process.env.APIFY_API_TOKEN}`
- Mode: Synchronous run (waits for completion, returns dataset)

### Processing Pipeline
```
Raw Apify profiles
  → filter: remove profiles with followers > maxFollowers
  → filter: remove profiles with no name/bio
  → map: normalize to CoachResult shape
  → extract email from bio via regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  → return CoachResult[]
```

### Response
```json
[
  {
    "name": "John Smith",
    "bio": "Head coach @ City FC | contact: john@cityfc.com",
    "email": "john@cityfc.com",
    "followers": 847,
    "instagramUrl": "https://instagram.com/johnsmithcoach"
  }
]
```

### Error Response
```json
{ "error": "Apify request failed: 401 Unauthorized" }
```
HTTP status mirrors the underlying failure (400, 401, 500).

---

## 5. Component Specifications

### `SearchForm.tsx`
- **Props:** `onSubmit: (params: SearchParams) => void`, `isLoading: boolean`
- **State:** `hashtag`, `location`, `maxFollowers` (controlled inputs)
- **Validation:** hashtag must be non-empty; shows inline error if submitted empty
- **Behaviour:** submit button shows spinner and is disabled when `isLoading=true`

### `ResultsTable.tsx`
- **Props:** `results: CoachResult[]`, `isLoading: boolean`
- **States:**
  - Loading: render 5 shimmer skeleton rows
  - Empty (not loading, results = []): "No coaches found. Try a different hashtag."
  - Results: shadcn `Table` with columns: Name, Bio, Email, Followers, Instagram
- **Instagram column:** renders as clickable link, opens in new tab

### `ExportButton.tsx`
- **Props:** `results: CoachResult[]`
- **Behaviour:** disabled when `results.length === 0`
- **On click:** uses `xlsx` to build workbook → sheet "Coaches" → columns match `CoachResult` fields → `writeFile(wb, 'coaches.xlsx')`

### `page.tsx`
- Owns all state: `results`, `isLoading`, `error`
- Passes handlers down to `SearchForm`
- On form submit: sets `isLoading=true`, clears previous `results`, POSTs to `/api/scrape`, sets `results` from response, sets `isLoading=false`
- Renders error banner if API returns `error`

---

## 6. Environment

```env
# .env.local — never commit this file
APIFY_API_TOKEN=your_apify_token_here
```

`.env.local` is in `.gitignore` by default in Next.js. The token is accessed only in `app/api/scrape/route.ts` via `process.env.APIFY_API_TOKEN`.

---

## 7. Apify Actor Details

- **Actor ID:** `apify/instagram-hashtag-scraper`
- **Run mode:** Synchronous (HTTP POST to Apify runs API, poll until done)
- **Estimated runtime:** 10–30 seconds per search
- **Rate limits:** Depends on Apify plan; free tier supports demo usage
- **Apify SDK:** Use `apify-client` npm package for typed access

---

## 8. Security Considerations

- API token is server-side only — never sent to the browser
- No user input is passed to shell commands — only to Apify's JSON API
- No database — no SQL injection surface
- Client receives only normalized `CoachResult[]` — raw Apify response never forwarded

---

## 9. Out of Scope

- Authentication / sessions
- Database / result persistence
- Pagination
- Rate limiting on the `/api/scrape` route (acceptable for demo)
