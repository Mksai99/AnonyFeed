import { FeedbackForm } from '@/components/feedback-form';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFaculty } from '@/lib/db';
import { MessageSquareQuote } from 'lucide-react';

export default async function FeedbackPage() {
  const faculty = await getFaculty();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center text-center mb-8">
        <Logo />
        <p className="text-muted-foreground mt-2">
          Your feedback is valuable and completely anonymous.
        </p>
      </div>
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/20 rounded-full p-3 w-fit">
            <MessageSquareQuote className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4">Submit Your Feedback</CardTitle>
          <CardDescription>
            Please provide your honest feedback. Your identity is protected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackForm faculty={faculty} />
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Feedback Fortress. All rights reserved.</p>
      </footer>
    </main>
  );
}
