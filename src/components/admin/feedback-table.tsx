"use client";

import type { Feedback } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Button } from "../ui/button";
import { getExportData } from "@/lib/actions";
import { Download, Star } from "lucide-react";
import { cn } from "@/lib/utils";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "text-accent fill-accent" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

function ExportButton() {
    const handleExport = async () => {
        const csvData = await getExportData();
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `feedback-export-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
    );
}

export function FeedbackTable({ feedback, simple = false }: { feedback: Feedback[]; simple?: boolean }) {
  return (
    <div className="space-y-4">
        {!simple && (
            <div className="flex justify-end">
                <ExportButton />
            </div>
        )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faculty</TableHead>
              <TableHead>Rating</TableHead>
              {!simple && <TableHead className="hidden md:table-cell">Comment</TableHead>}
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.length === 0 && (
              <TableRow>
                <TableCell colSpan={simple ? 3 : 4} className="h-24 text-center">
                  No feedback yet.
                </TableCell>
              </TableRow>
            )}
            {feedback.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.facultyName}</TableCell>
                <TableCell>
                  <RatingStars rating={item.rating} />
                </TableCell>
                {!simple && (
                    <TableCell className="hidden md:table-cell max-w-sm">
                        <p className="truncate hover:whitespace-normal cursor-pointer">{item.comment}</p>
                    </TableCell>
                )}
                <TableCell className="text-right">
                  {format(new Date(item.createdAt), 'PP')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
