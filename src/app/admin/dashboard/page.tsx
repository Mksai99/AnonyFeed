import { getAdminData } from "@/lib/actions";
import { StatsCards } from "@/components/admin/stats-cards";
import { RatingsChart } from "@/components/admin/ratings-chart";
import { FeedbackTable } from "@/components/admin/feedback-table";
import { FeedbackTableDynamic } from "@/components/admin/feedback-table-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const { feedback, tokens, faculty } = await getAdminData();

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <StatsCards feedback={feedback} tokens={tokens} />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Ratings per Faculty</CardTitle>
            <CardDescription>Average feedback rating for each faculty member.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RatingsChart feedback={feedback} faculty={faculty} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
           <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>Latest 5 feedback submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackTableDynamic feedback={feedback.slice(0, 5)} simple />
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>All Feedback</CardTitle>
            <CardDescription>Browse all submitted feedback entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackTableDynamic feedback={feedback} />
          </CardContent>
        </Card>
    </div>
  );
}
