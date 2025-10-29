'use server';

/**
 * @fileOverview This flow uses GenAI to summarize feedback, suggest titles, and propose question improvements.
 *
 * - suggestFeedbackImprovements - A function that suggests improvements to feedback and questions.
 * - SuggestFeedbackImprovementsInput - The input type for the suggestFeedbackImprovements function.
 * - SuggestFeedbackImprovementsOutput - The return type for the suggestFeedbackImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFeedbackImprovementsInputSchema = z.object({
  feedbackText: z.string().describe('The feedback text to summarize and analyze.'),
  currentQuestions: z.array(z.string()).describe('The current feedback questions.'),
});
export type SuggestFeedbackImprovementsInput = z.infer<typeof SuggestFeedbackImprovementsInputSchema>;

const SuggestFeedbackImprovementsOutputSchema = z.object({
  summary: z.string().describe('A short summary of the feedback.'),
  suggestedTitle: z.string().describe('A suggested title for the feedback.'),
  improvedQuestions: z.array(z.string()).describe('Suggestions for improving the feedback questions.'),
});
export type SuggestFeedbackImprovementsOutput = z.infer<typeof SuggestFeedbackImprovementsOutputSchema>;

export async function suggestFeedbackImprovements(input: SuggestFeedbackImprovementsInput): Promise<SuggestFeedbackImprovementsOutput> {
  return suggestFeedbackImprovementsFlow(input);
}

const suggestFeedbackImprovementsPrompt = ai.definePrompt({
  name: 'suggestFeedbackImprovementsPrompt',
  input: {schema: SuggestFeedbackImprovementsInputSchema},
  output: {schema: SuggestFeedbackImprovementsOutputSchema},
  prompt: `You are an AI assistant helping administrators improve their feedback collection process.

  Summarize the following feedback text, suggest a concise title, and propose improvements to the current feedback questions to make the process more effective.

  Feedback Text: {{{feedbackText}}}

  Current Questions:
  {{#each currentQuestions}}
  - {{{this}}}
  {{/each}}

  Respond with a summary, a suggested title, and improved questions.
  `,
});

const suggestFeedbackImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestFeedbackImprovementsFlow',
    inputSchema: SuggestFeedbackImprovementsInputSchema,
    outputSchema: SuggestFeedbackImprovementsOutputSchema,
  },
  async input => {
    const {output} = await suggestFeedbackImprovementsPrompt(input);
    return output!;
  }
);
