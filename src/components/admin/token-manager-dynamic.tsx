"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Token } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function TokenManager({ initialTokens }: { initialTokens: Token[] }) {
  const [tokens, setTokens] = useState(initialTokens);
  const [count, setCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [newTokens, setNewTokens] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showUsed, setShowUsed] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteTokens = async () => {
    if (selectedTokens.length === 0) return;
    setIsLoading(true);
    
    try {
      // Optimistically update UI
      const tokensToDelete = new Set(selectedTokens);
      const updatedTokens = tokens.filter(token => !tokensToDelete.has(token.hash));
      setTokens(updatedTokens);
      setSelectedTokens([]);
      setIsDeleteDialogOpen(false);

      // Make API call
      const response = await fetch(`/api/tokens?hashes=${selectedTokens.join(',')}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete tokens');
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: result.message,
      });
    } catch (error) {
      // Revert optimistic update on error
      setTokens(initialTokens);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete tokens. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (count <= 0 || count > 1000) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please generate between 1 and 1000 tokens.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tokens');
      }

      const result = await response.json();
      // Update local state with new tokens
      setTokens(prev => [...result.tokens, ...prev]);
      setNewTokens(result.rawTokens);
      setIsDialogOpen(true);
      toast({
        title: "Success",
        description: `${result.rawTokens.length} new tokens generated.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate tokens. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(newTokens.join('\n')).then(() => {
      toast({ description: "Tokens copied to clipboard." });
    });
  }

  const filteredTokens = tokens
    .filter(token => showUsed ? true : !token.used)
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Generate New Tokens</CardTitle>
          <CardDescription>
            Create single-use tokens for students to submit feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min="1"
            max="1000"
            className="w-32"
          />
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Tokens</CardTitle>
          <CardDescription>List of all generated tokens and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-used" 
                checked={showUsed} 
                onCheckedChange={(checked) => setShowUsed(Boolean(checked))} 
              />
              <Label htmlFor="show-used" className="cursor-pointer">Show used tokens</Label>
            </div>
            {selectedTokens.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedTokens.length} token{selectedTokens.length === 1 ? '' : 's'} selected
                </span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
          <div className="rounded-md border">
            <ScrollArea className="h-96">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[30px]">
                      <Checkbox 
                        checked={filteredTokens.length > 0 && selectedTokens.length === filteredTokens.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTokens(filteredTokens.map(t => t.hash));
                          } else {
                            setSelectedTokens([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Token Hash (SHA-256)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Used At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTokens.map((token) => (
                    <TableRow key={token.hash}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedTokens.includes(token.hash)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTokens([...selectedTokens, token.hash]);
                              } else {
                                setSelectedTokens(selectedTokens.filter(t => t !== token.hash));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{token.hash.substring(0,32)}...</TableCell>
                        <TableCell>
                        <Badge variant={token.used ? "secondary" : "default"}>
                            {token.used ? "Used" : "Unused"}
                        </Badge>
                        </TableCell>
                        <TableCell>{formatDistanceToNow(new Date(token.createdAt), { addSuffix: true })}</TableCell>
                        <TableCell>
                        {token.usedAt ? formatDistanceToNow(new Date(token.usedAt), { addSuffix: true }) : "N/A"}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Tokens Generated</DialogTitle>
            <DialogDescription>
              Copy these tokens and distribute them. They are shown only once.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64 my-4 rounded-md border bg-muted p-4">
            <pre className="text-sm font-mono">
              {newTokens.join('\n')}
            </pre>
          </ScrollArea>
          <div className="flex justify-between mt-4">
             <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
            <Button type="button" onClick={copyToClipboard}>Copy Tokens</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Tokens</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTokens.length} selected token{selectedTokens.length === 1 ? '' : 's'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTokens}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}