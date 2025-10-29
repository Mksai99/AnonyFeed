import { Logo } from "@/components/logo";
import { TokenForm } from "@/components/token-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function HomePage() {

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center text-center mb-8">
        <Logo />
        <p className="text-muted-foreground mt-2">
          A secure and anonymous way to provide faculty feedback.
        </p>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-accent/50 rounded-full p-3 w-fit">
            <KeyRound className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="mt-4">Enter Your Access Token</CardTitle>
          <CardDescription>
            Please enter the single-use token you received to submit your
            feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TokenForm />
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Feedback Fortress. All rights reserved.</p>
        <p className="mt-1">
          Your submission is completely anonymous.
        </p>
      </footer>
    </main>
  );
}
