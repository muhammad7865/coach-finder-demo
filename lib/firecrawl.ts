import Firecrawl from "@mendable/firecrawl-js";
import type { CoachResult } from "./types";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX =
  /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;

function extractEmails(text: string): string[] {
  return [...new Set(text.match(EMAIL_REGEX) || [])];
}

function extractPhones(text: string): string[] {
  return [...new Set(text.match(PHONE_REGEX) || [])];
}

export interface FirecrawlCoachResult extends CoachResult {
  phone: string | null;
  source: string;
}

export async function scrapeWebsiteForCoaches(
  url: string
): Promise<FirecrawlCoachResult[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not set");
  }

  const app = new Firecrawl({ apiKey });

  // Crawl the site — follow links to staff/team/about pages
  const crawlResult = await app.crawlUrl(url, {
    limit: 20,
    scrapeOptions: {
      formats: ["markdown"],
    },
  });

  if (!crawlResult.success) {
    throw new Error(`Firecrawl crawl failed: ${crawlResult.error || "Unknown error"}`);
  }

  const pages = crawlResult.data || [];
  const coaches: FirecrawlCoachResult[] = [];

  for (const page of pages) {
    const text = page.markdown || "";
    const pageUrl = page.metadata?.sourceURL || url;

    // Look for coach-related keywords
    const lines = text.split("\n");
    const coachLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (
        line.includes("coach") ||
        line.includes("trainer") ||
        line.includes("instructor") ||
        line.includes("director") ||
        line.includes("staff")
      ) {
        // Grab surrounding context (3 lines before and after)
        const start = Math.max(0, i - 3);
        const end = Math.min(lines.length, i + 4);
        coachLines.push(lines.slice(start, end).join("\n"));
      }
    }

    if (coachLines.length === 0) continue;

    const context = coachLines.join("\n");
    const emails = extractEmails(context);
    const phones = extractPhones(context);

    // Extract names — lines that look like headings near "coach" keywords
    const namePattern =
      /(?:^|\n)#+\s*(.+)|(?:^|\n)\*\*(.+?)\*\*|(?:^|\n)(?:Coach|Head Coach|Assistant Coach|Trainer)\s*[:\-–]\s*(.+)/gim;
    let match;
    const names: string[] = [];
    while ((match = namePattern.exec(context)) !== null) {
      const name = (match[1] || match[2] || match[3] || "").trim();
      if (name && name.length < 60 && !name.includes("http")) {
        names.push(name);
      }
    }

    if (names.length > 0) {
      for (let i = 0; i < names.length; i++) {
        coaches.push({
          name: names[i],
          bio: context.substring(0, 200).replace(/\n/g, " ").trim(),
          email: emails[i] || emails[0] || null,
          phone: phones[i] || phones[0] || null,
          followers: 0,
          instagramUrl: "",
          source: pageUrl,
        });
      }
    } else if (emails.length > 0 || phones.length > 0) {
      // No names found but we have contact info
      coaches.push({
        name: "Unknown Coach",
        bio: context.substring(0, 200).replace(/\n/g, " ").trim(),
        email: emails[0] || null,
        phone: phones[0] || null,
        followers: 0,
        instagramUrl: "",
        source: pageUrl,
      });
    }
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return coaches.filter((c) => {
    const key = c.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchAndScrapeForCoaches(
  query: string
): Promise<FirecrawlCoachResult[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not set");
  }

  // Use Firecrawl REST API directly (SDK search has compatibility issues)
  const searchRes = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: query + " coach contact email",
      limit: 10,
      scrapeOptions: { formats: ["markdown"] },
    }),
  });

  const searchResult = await searchRes.json();

  if (!searchResult.success) {
    throw new Error(
      `Firecrawl search failed: ${searchResult.error || searchRes.statusText}`
    );
  }

  const allCoaches: FirecrawlCoachResult[] = [];

  for (const result of searchResult.data || []) {
    const text = result.markdown || result.description || "";
    const pageUrl = result.url || "";
    const emails = extractEmails(text);
    const phones = extractPhones(text);

    if (emails.length > 0 || phones.length > 0) {
      allCoaches.push({
        name: result.title || "Unknown",
        bio: (result.description || text.substring(0, 200))
          .replace(/\n/g, " ")
          .trim(),
        email: emails[0] || null,
        phone: phones[0] || null,
        followers: 0,
        instagramUrl: "",
        source: pageUrl,
      });
    }
  }

  return allCoaches;
}
