'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { verifyToken } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const initialState = {
  message: '',
  type: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Verify Token
    </Button>
  );
}

export function TokenForm() {
  const [state, formAction] = useActionState(verifyToken, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.type === 'error' && state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        id="token"
        name="token"
        type="text"
        placeholder="Enter your single-use token"
        required
        className="text-center text-lg tracking-wider"
      />
      <SubmitButton />
    </form>
  );
}
