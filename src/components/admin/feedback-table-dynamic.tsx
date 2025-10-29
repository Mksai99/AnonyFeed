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
import { Button } from "@/components/ui/button";
import { getExportData } from "@/lib/actions";
import { Download, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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

export function FeedbackTableDynamic({ feedback: initialFeedback, simple = false }: { feedback: Feedback[]; simple?: boolean }) {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
  const [selected, setSelected] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filtered = feedback.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  }

  const selectAll = (checked: boolean) => {
    setSelected(checked ? filtered.map(f => f.id) : []);
  }

  const handleDelete = async () => {
    if (selected.length === 0) return;
    setIsDeleting(true);
    // optimistic update
    const remaining = feedback.filter(f => !selected.includes(f.id));
    setFeedback(remaining);
    setIsDialogOpen(false);
    try {
      const res = await fetch(`/api/feedback?ids=${selected.join(',')}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      const data = await res.json();
      toast({ title: 'Deleted', description: `Removed ${data.deleted || selected.length} feedback entries.` });
      setSelected([]);
    } catch (err) {
      // revert
      setFeedback(initialFeedback);
      toast({ title: 'Error', description: 'Failed to delete feedback.' , variant: 'destructive'});
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
        {!simple && (
            <div className="flex justify-between items-center">
                <ExportButton />
                {selected.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{selected.length} selected</span>
                    <Button variant="destructive" size="sm" onClick={() => setIsDialogOpen(true)} disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete Selected'}
                    </Button>
                  </div>
                )}
            </div>
        )}
      <div className="rounded-md border">
        <ScrollArea className="max-h-[480px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">
                <Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={(c) => selectAll(Boolean(c))} />
              </TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Rating</TableHead>
              {!simple && <TableHead className="hidden md:table-cell">Comment</TableHead>}
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={simple ? 3 : 4} className="h-24 text-center">
                  No feedback yet.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox checked={selected.includes(item.id)} onCheckedChange={(c) => toggleSelect(item.id, Boolean(c))} />
                </TableCell>
                <TableCell className="font-medium">{item.facultyName}</TableCell>
                <TableCell>
                  <RatingStars rating={item.rating} />
                </TableCell>
                {!simple && (
                    <TableCell className="hidden md:table-cell max-w-sm">
                        <p className="truncate hover:whitespace-normal cursor-pointer">{item.comment}</p>
                    </TableCell>
                )}
                <TableCell className="text-right">{format(new Date(item.createdAt), 'PP')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </ScrollArea>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Feedback</DialogTitle>
            <p>Are you sure you want to delete {selected.length} feedback item{selected.length===1? '':'s'}? This action cannot be undone.</p>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
