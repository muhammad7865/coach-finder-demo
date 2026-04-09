import { NextRequest, NextResponse } from "next/server";
import {
  scrapeWebsiteForCoaches,
  searchAndScrapeForCoaches,
} from "@/lib/firecrawl";

export async function POST(request: NextRequest) {
  let body: { query?: string; url?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { query, url } = body;

  if (!query && !url) {
    return NextResponse.json(
      { error: "Either query or url is required" },
      { status: 400 }
    );
  }

  try {
    let results;
    if (url) {
      // Crawl a specific website for coach info
      results = await scrapeWebsiteForCoaches(url);
    } else {
      // Search the web for coaches
      results = await searchAndScrapeForCoaches(query!);
    }
    return NextResponse.json(results);
  } catch (err: unknown) {
    console.error("Web scrape error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
