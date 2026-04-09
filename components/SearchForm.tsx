"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SearchParams } from "@/lib/types";
import { Loader2, Search, Globe } from "lucide-react";

interface SearchFormProps {
  onSubmit: (params: SearchParams) => void;
  onWebSearch: (query: string, url?: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSubmit, onWebSearch, isLoading }: SearchFormProps) {
  const [mode, setMode] = useState<"instagram" | "web">("instagram");

  // Instagram fields
  const [hashtag, setHashtag] = useState("");
  const [location, setLocation] = useState("");
  const [maxFollowers, setMaxFollowers] = useState("");
  const [error, setError] = useState("");

  // Web fields
  const [webQuery, setWebQuery] = useState("");
  const [webUrl, setWebUrl] = useState("");

  function handleInstagramSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hashtag.trim()) {
      setError("Hashtag is required");
      return;
    }
    setError("");
    onSubmit({
      hashtag: hashtag.trim(),
      location: location.trim() || undefined,
      maxFollowers: maxFollowers ? Number(maxFollowers) : undefined,
    });
  }

  function handleWebSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!webQuery.trim() && !webUrl.trim()) {
      setError("Search query or website URL is required");
      return;
    }
    setError("");
    onWebSearch(webQuery.trim(), webUrl.trim() || undefined);
  }

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2">
        <Button
          variant={mode === "instagram" ? "default" : "outline"}
          size="sm"
          onClick={() => { setMode("instagram"); setError(""); }}
          type="button"
        >
          <Search className="mr-2 h-4 w-4" />
          Instagram
        </Button>
        <Button
          variant={mode === "web" ? "default" : "outline"}
          size="sm"
          onClick={() => { setMode("web"); setError(""); }}
          type="button"
        >
          <Globe className="mr-2 h-4 w-4" />
          Web Search
        </Button>
      </div>

      {mode === "instagram" ? (
        <form onSubmit={handleInstagramSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="hashtag">
                Hashtag <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hashtag"
                placeholder="e.g. grassrootscoach"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="e.g. Boston"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxFollowers">Max Followers (optional)</Label>
              <Input
                id="maxFollowers"
                type="number"
                placeholder="e.g. 10000"
                min={0}
                value={maxFollowers}
                onChange={(e) => setMaxFollowers(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching Instagram…
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Coaches
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleWebSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="webQuery">
                Search Query <span className="text-muted-foreground text-xs">(e.g. &quot;youth basketball coach Boston&quot;)</span>
              </Label>
              <Input
                id="webQuery"
                placeholder="youth soccer coach Boston MA"
                value={webQuery}
                onChange={(e) => setWebQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webUrl">
                Or Crawl a Website URL <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="webUrl"
                placeholder="https://www.bostonbasketball.org/coaches"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching the web…
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Search Web
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
