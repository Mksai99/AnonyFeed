"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogout() {
    setLoading(true);
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      // Force a client navigation to login. Middleware will redirect as needed.
      router.push('/admin/login');
      // refresh to ensure client state updates
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Logout failed', description: err?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleLogout} variant="ghost" size="icon" className={className} disabled={loading}>
      <LogOut />
    </Button>
  );
}
