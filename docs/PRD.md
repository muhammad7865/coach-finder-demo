# Coach Finder — Product Design Document (PRD)
**Date:** 2026-04-06  
**Author:** Muhammad Awais Mohsin  
**Status:** Approved

---

## 1. Problem Statement

A hosiery export business owner needs to identify and contact coaches at small, grassroots sports clubs — not major leagues. These coaches are potential buyers or brand ambassadors for sports hosiery products. Manually searching Instagram and other platforms is time-consuming, unstructured, and produces no exportable data.

---

## 2. Goals

- **Primary:** Give the client a fast way to discover coaches at small sports clubs via Instagram.
- **Secondary:** Export discovered coaches to Excel for outreach.
- **Demo goal:** Prove the concept works in a 2-3 hour build; client pays after approval.

---

## 3. Non-Goals (MVP)

- No LinkedIn or Facebook scraping (future phases)
- No email outreach or CRM features
- No user accounts or saved history
- No multi-user support

---

## 4. User Persona

**Name:** The Client  
**Role:** Hosiery export business owner (Pakistan/USA market)  
**Tech comfort:** Moderate — comfortable with a web UI, not a developer  
**Goal:** Find 20-50 contactable coaches per session, export to Excel, do outreach manually

---

## 5. User Journey

1. Client opens the app in a browser
2. Enters a hashtag (e.g. `#grassrootscoach`), optional location, optional max follower cap
3. Clicks **Find Coaches**
4. Waits ~10-30 seconds while Apify scrapes Instagram
5. Reviews results in a table (Name, Bio, Email, Followers, Link)
6. Clicks **Export to Excel** — downloads `coaches.xlsx`
7. Opens Excel, starts manual outreach

---

## 6. Features (MVP)

| # | Feature | Priority |
|---|---------|----------|
| 1 | Hashtag search input | Must have |
| 2 | Optional location filter | Should have |
| 3 | Optional max follower count filter | Should have |
| 4 | Results table with coach details | Must have |
| 5 | Loading state while scraping | Must have |
| 6 | Export to Excel (.xlsx) | Must have |
| 7 | Empty state / error messaging | Must have |

---

## 7. Success Metrics (Demo)

- Search returns results within 30 seconds
- Exported Excel file opens correctly with all columns populated
- Client can use the app without instructions

---

## 8. Budget & Timeline

| Item | Detail |
|------|--------|
| Development | $2,500–$3,500 one-time |
| Monthly running cost | ~$79/month (Apify + Vercel) |
| Demo | Today (2-3 hours) |
| Full app | 4-6 weeks post-approval |

---

## 9. Future Phases

- **Phase 2:** LinkedIn scraper (coaches on LinkedIn)
- **Phase 3:** Facebook group scraper
- **Phase 4:** Saved searches, history, CRM-lite features
- **Phase 5:** Automated outreach templates
