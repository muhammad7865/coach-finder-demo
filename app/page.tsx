"use client";

import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { ResultsTable } from "@/components/ResultsTable";
import { ExportButton } from "@/components/ExportButton";
import type { CoachResult, SearchParams } from "@/lib/types";

export default function Home() {
  const [results, setResults] = useState<CoachResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleInstagramSearch(params: SearchParams) {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResults(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWebSearch(query: string, url?: string) {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      const res = await fetch("/api/web-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, url }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResults(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Coach Finder
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Discover sports coaches from Instagram and the web
              </p>
            </div>
            <ExportButton results={results} />
          </div>
        </div>
      </header>

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <SearchForm
            onSubmit={handleInstagramSearch}
            onWebSearch={handleWebSearch}
            isLoading={isLoading}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No coaches found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different hashtag, search query, or website URL
            </p>
          </div>
        )}

        <ResultsTable results={results} isLoading={isLoading} />

        {!isLoading && results.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            {results.length} coach{results.length !== 1 ? "es" : ""} found
          </p>
        )}
      </section>
    </main>
  );
}
