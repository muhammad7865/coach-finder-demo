import { NextRequest, NextResponse } from "next/server";
import { scrapeInstagramByHashtag } from "@/lib/apify";
import type { SearchParams } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: SearchParams;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { hashtag, maxFollowers } = body;

  if (!hashtag || typeof hashtag !== "string" || hashtag.trim() === "") {
    return NextResponse.json(
      { error: "hashtag is required" },
      { status: 400 }
    );
  }

  try {
    const results = await scrapeInstagramByHashtag(
      hashtag.trim(),
      maxFollowers ? Number(maxFollowers) : undefined
    );
    return NextResponse.json(results);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
