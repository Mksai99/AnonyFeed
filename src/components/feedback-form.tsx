'use client';

import { submitFeedback } from '@/lib/actions';
import type { Faculty } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const feedbackSchema = z.object({
  facultyId: z.string({ required_error: 'Please select a faculty member.' }).min(1, 'Please select a faculty member.'),
  rating: z.coerce.number().min(1, 'Please provide a rating.').max(5),
  comment: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const StarRating = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const stars = Array(5).fill(0);

  return (
    <div className="flex items-center gap-1">
      {stars.map((_, index) => {
        const ratingValue = index + 1;
        return (
          <Star
            key={index}
            onClick={() => onChange(ratingValue)}
            onMouseEnter={() => setHoverValue(ratingValue)}
            onMouseLeave={() => setHoverValue(0)}
            className={cn(
              "h-8 w-8 cursor-pointer transition-colors",
              (hoverValue || value) >= ratingValue
                ? "text-accent fill-accent"
                : "text-muted-foreground/50"
            )}
          />
        );
      })}
    </div>
  );
};

export function FeedbackForm({ faculty }: { faculty: Faculty[] }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      facultyId: '',
      rating: 0,
      comment: '',
    },
  });

  async function onSubmit(data: FeedbackFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('facultyId', data.facultyId);
    formData.append('rating', String(data.rating));
  formData.append('comment', data.comment ?? '');

    const result = await submitFeedback(null, formData);
    
    setIsSubmitting(false);

    if (result?.type === 'error') {
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: result.message,
      });
      if (result.errors) {
        Object.keys(result.errors).forEach((key) => {
          const field = key as keyof FeedbackFormValues;
          const message = result.errors[field]?.[0]
          if(message) {
            form.setError(field, { type: 'server', message });
          }
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="facultyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty Member</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a faculty member to review" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {faculty.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Rating</FormLabel>
              <FormControl>
                <StarRating value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide your detailed feedback here. Please avoid including any personally identifiable information."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your comment will be checked for sensitive information to ensure anonymity.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Feedback
        </Button>
      </form>
    </Form>
  );
}
