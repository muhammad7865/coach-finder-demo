# Coach Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 14 demo app that scrapes Instagram for sports coaches via Apify and exports results to Excel.

**Architecture:** Server-side API route calls Apify with a hashtag/location/follower filter; client renders results in a table and exports via xlsx. Token stays server-side only.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, apify-client, xlsx

---

## File Map

| File | Responsibility |
|------|---------------|
| `app/layout.tsx` | Root layout, metadata |
| `app/globals.css` | Tailwind base |
| `app/page.tsx` | Page state owner, composes components |
| `app/api/scrape/route.ts` | POST handler — calls Apify, normalizes, returns CoachResult[] |
| `lib/types.ts` | Shared TypeScript types |
| `lib/apify.ts` | Apify client wrapper |
| `components/SearchForm.tsx` | Hashtag/location/maxFollowers form |
| `components/ResultsTable.tsx` | Table + skeleton + empty state |
| `components/ExportButton.tsx` | xlsx download |
| `.env.local` | APIFY_API_TOKEN (not committed) |

---

### Task 1: Initialize Next.js project

- [ ] Run Next.js scaffolding
```bash
cd /c/Users/Orbit/coach-finder-demo
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```
- [ ] Verify it scaffolded correctly
```bash
ls app/ components/ public/
```
- [ ] Commit
```bash
git add -A && git commit -m "chore: initialize Next.js 14 with TypeScript and Tailwind"
```

---

### Task 2: Install dependencies

- [ ] Install apify-client and xlsx
```bash
npm install apify-client xlsx
```
- [ ] Install shadcn/ui
```bash
npx shadcn@latest init -d
```
- [ ] Add shadcn table and button components
```bash
npx shadcn@latest add table button input label skeleton
```
- [ ] Commit
```bash
git add -A && git commit -m "chore: install apify-client, xlsx, shadcn/ui"
```

---

### Task 3: Types and Apify wrapper

**Files:**
- Create: `lib/types.ts`
- Create: `lib/apify.ts`

- [ ] Create `lib/types.ts`
- [ ] Create `lib/apify.ts`
- [ ] Commit

---

### Task 4: API route `/api/scrape`

**Files:**
- Create: `app/api/scrape/route.ts`

- [ ] Create route with Apify call, filter, normalize pipeline
- [ ] Commit

---

### Task 5: Components

**Files:**
- Create: `components/SearchForm.tsx`
- Create: `components/ResultsTable.tsx`
- Create: `components/ExportButton.tsx`

- [ ] Build each component
- [ ] Commit

---

### Task 6: Main page and env template

**Files:**
- Modify: `app/page.tsx`
- Create: `.env.local.example`

- [ ] Wire up page state and components
- [ ] Create env template
- [ ] Final commit
