import { Logo } from '@/components/logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { AdminLoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center text-center mb-8">
        <Logo />
        <p className="text-muted-foreground mt-2">
          Administrator Access
        </p>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/20 rounded-full p-3 w-fit">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4">Admin Login</CardTitle>
          <CardDescription>
            Please enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Feedback Fortress. All rights reserved.</p>
      </footer>
    </main>
  );
}
