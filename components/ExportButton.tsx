"use client";

import { Button } from "@/components/ui/button";
import type { CoachResult } from "@/lib/types";
import { Download } from "lucide-react";

interface ExportButtonProps {
  results: CoachResult[];
}

export function ExportButton({ results }: ExportButtonProps) {
  async function handleExport() {
    const XLSX = await import("xlsx");
    const rows = results.map((c) => ({
      Name: c.name,
      Bio: c.bio,
      Email: c.email ?? "",
      Followers: c.followers,
      "Instagram URL": c.instagramUrl,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Coaches");
    XLSX.writeFile(wb, "coaches.xlsx");
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={results.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      Export to Excel ({results.length})
    </Button>
  );
}
