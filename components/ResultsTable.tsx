"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { CoachResult } from "@/lib/types";

interface ResultsTableProps {
  results: CoachResult[];
  isLoading: boolean;
}

export function ResultsTable({ results, isLoading }: ResultsTableProps) {
  const hasPhone = results.some((r) => r.phone);
  const hasSource = results.some((r) => r.source);
  const hasFollowers = results.some((r) => r.followers > 0);

  const colCount = 4 + (hasPhone ? 1 : 0) + (hasFollowers ? 1 : 0) + (hasSource ? 1 : 0);

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {["Name", "Bio", "Email", "Phone", "Followers", "Link"].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">Name</TableHead>
            <TableHead>Bio</TableHead>
            <TableHead className="w-48">Email</TableHead>
            {hasPhone && <TableHead className="w-36">Phone</TableHead>}
            {hasFollowers && <TableHead className="w-28 text-right">Followers</TableHead>}
            <TableHead className="w-32">
              {hasSource ? "Source" : "Instagram"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((coach, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{coach.name}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {coach.bio || "—"}
              </TableCell>
              <TableCell>
                {coach.email ? (
                  <a
                    href={`mailto:${coach.email}`}
                    className="text-primary underline underline-offset-2"
                  >
                    {coach.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              {hasPhone && (
                <TableCell>
                  {coach.phone ? (
                    <a
                      href={`tel:${coach.phone}`}
                      className="text-primary underline underline-offset-2"
                    >
                      {coach.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
              {hasFollowers && (
                <TableCell className="text-right">
                  {coach.followers.toLocaleString()}
                </TableCell>
              )}
              <TableCell>
                {coach.source ? (
                  <a
                    href={coach.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    View
                  </a>
                ) : coach.instagramUrl ? (
                  <a
                    href={coach.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
