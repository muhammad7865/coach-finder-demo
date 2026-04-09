export interface SearchParams {
  hashtag: string;
  location?: string;
  maxFollowers?: number;
}

export interface WebSearchParams {
  query: string;
  url?: string;
}

export interface CoachResult {
  name: string;
  bio: string;
  email: string | null;
  phone?: string | null;
  followers: number;
  instagramUrl: string;
  source?: string;
}

export interface ScrapeResponse {
  results?: CoachResult[];
  error?: string;
}
