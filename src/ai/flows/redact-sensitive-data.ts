'use server';
/**
 * @fileOverview This flow uses GenAI to redact sensitive PII from user submissions.
 *
 * - redactSensitiveData - A function that redacts sensitive information from text.
 * - RedactSensitiveDataInput - The input type for the redactSensitiveData function.
 * - RedactSensitiveDataOutput - The return type for the redactSensitiveData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RedactSensitiveDataInputSchema = z.object({
  text: z.string().describe('The text to redact sensitive information from.'),
});
export type RedactSensitiveDataInput = z.infer<typeof RedactSensitiveDataInputSchema>;

const RedactSensitiveDataOutputSchema = z.object({
  redactedText: z.string().describe('The redacted text, with sensitive information removed.'),
});
export type RedactSensitiveDataOutput = z.infer<typeof RedactSensitiveDataOutputSchema>;

export async function redactSensitiveData(input: RedactSensitiveDataInput): Promise<RedactSensitiveDataOutput> {
  try {
    return await redactSensitiveDataFlow(input);
  } catch (error) {
    console.error('AI redaction service error:', error);
    // Fallback: Basic regex-based PII redaction
    const basicRedactedText = input.text
      .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g, '[EMAIL REDACTED]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE REDACTED]')
      .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CARD NUMBER REDACTED]');
    return { redactedText: basicRedactedText };
  }
}

const redactSensitiveDataPrompt = ai.definePrompt({
  name: 'redactSensitiveDataPrompt',
  input: {schema: RedactSensitiveDataInputSchema},
  output: {schema: RedactSensitiveDataOutputSchema},
  prompt: `You are an AI assistant that redacts personally identifiable information (PII) from user-submitted text to ensure anonymity.  Your goal is to remove any names, email addresses, phone numbers, or other information that could be used to identify the submitter.  If no PII is found, return the original text unchanged.

Text to redact: {{{text}}} `,
});

const redactSensitiveDataFlow = ai.defineFlow(
  {
    name: 'redactSensitiveDataFlow',
    inputSchema: RedactSensitiveDataInputSchema,
    outputSchema: RedactSensitiveDataOutputSchema,
  },
  async input => {
    const {output} = await redactSensitiveDataPrompt(input);
    return output!;
  }
);
