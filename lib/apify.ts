import type { CoachResult } from "./types";

const APIFY_BASE = "https://api.apify.com/v2";
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function extractEmail(text: string): string | null {
  const match = text.match(EMAIL_REGEX);
  return match ? match[0] : null;
}

// The hashtag scraper returns post-level data, so we extract unique owners
// and then enrich them via the profile scraper
interface HashtagPost {
  ownerFullName?: string;
  ownerUsername?: string;
  // These may or may not be present depending on actor version
  biography?: string;
  followersCount?: number;
  caption?: string;
  url?: string;
}

interface ProfileResult {
  username?: string;
  fullName?: string;
  biography?: string;
  followersCount?: number;
  externalUrl?: string;
  businessEmail?: string;
  businessPhoneNumber?: string;
}

function normalizeProfile(raw: ProfileResult): CoachResult {
  const bio = raw.biography ?? "";
  return {
    name: raw.fullName || raw.username || "Unknown",
    bio,
    email: raw.businessEmail || extractEmail(bio),
    followers: raw.followersCount ?? 0,
    instagramUrl: raw.username
      ? `https://www.instagram.com/${raw.username}/`
      : "",
  };
}

async function callApifyActor(
  actorId: string,
  input: Record<string, unknown>,
  token: string
): Promise<unknown[]> {
  const runRes = await fetch(
    `${APIFY_BASE}/acts/${actorId}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!runRes.ok) {
    const errBody = await runRes.text();
    throw new Error(`Apify run failed (${runRes.status}): ${errBody}`);
  }

  const runData = await runRes.json();
  const runId = runData.data.id;

  let status = runData.data.status;
  while (status === "RUNNING" || status === "READY") {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(
      `${APIFY_BASE}/actor-runs/${runId}?token=${token}`
    );
    const pollData = await pollRes.json();
    status = pollData.data.status;
  }

  if (status !== "SUCCEEDED") {
    throw new Error(`Apify run finished with status: ${status}`);
  }

  const datasetId = runData.data.defaultDatasetId;
  const itemsRes = await fetch(
    `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}`
  );
  return await itemsRes.json();
}

export async function scrapeInstagramByHashtag(
  hashtag: string,
  maxFollowers?: number,
  resultsLimit = 50
): Promise<CoachResult[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not set");
  }

  // Step 1: Get posts by hashtag to find unique usernames
  const posts = (await callApifyActor(
    "apify~instagram-hashtag-scraper",
    { hashtags: [hashtag.replace(/^#/, "")], resultsLimit },
    token
  )) as HashtagPost[];

  // Extract unique usernames
  const usernames = [
    ...new Set(
      posts
        .map((p) => p.ownerUsername)
        .filter((u): u is string => !!u)
    ),
  ];

  if (usernames.length === 0) {
    return [];
  }

  // Step 2: Scrape full profiles for those usernames
  const profiles = (await callApifyActor(
    "apify~instagram-profile-scraper",
    {
      usernames,
      resultsLimit: usernames.length,
    },
    token
  )) as ProfileResult[];

  const results = profiles
    .map(normalizeProfile)
    .filter((p) => p.name !== "Unknown")
    .filter((p) =>
      maxFollowers !== undefined ? p.followers <= maxFollowers : true
    );

  return results;
}
