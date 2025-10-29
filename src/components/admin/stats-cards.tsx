import type { Feedback, Token } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Ticket, Users, Star } from "lucide-react";

export function StatsCards({
  feedback,
  tokens,
}: {
  feedback: Feedback[];
  tokens: Token[];
}) {
  const totalFeedback = feedback.length;
  const totalTokens = tokens.length;
  const usedTokens = tokens.filter((t) => t.used).length;
  const avgRating =
    totalFeedback > 0
      ? (
          feedback.reduce((acc, f) => acc + f.rating, 0) / totalFeedback
        ).toFixed(1)
      : "N/A";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFeedback}</div>
          <p className="text-xs text-muted-foreground">
            Total submissions received
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgRating}</div>
          <p className="text-xs text-muted-foreground">
            Out of 5 stars
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usedTokens} / {totalTokens}
          </div>
          <p className="text-xs text-muted-foreground">
            Percentage of tokens redeemed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unused Tokens</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTokens - usedTokens}</div>
           <p className="text-xs text-muted-foreground">
            Available for submission
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
