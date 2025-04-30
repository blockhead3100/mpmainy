'use server';
/**
 * @fileOverview Summarizes a video transcription using an AI model.
 *
 * - summarizeTranscription - A function that handles the transcription summarization process.
 * - SummarizeTranscriptionInput - The input type for the summarizeTranscription function.
 * - SummarizeTranscriptionOutput - The return type for the summarizeTranscription function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeTranscriptionInputSchema = z.object({
  transcription: z.string().describe('The video transcription text to summarize.'),
});
export type SummarizeTranscriptionInput = z.infer<typeof SummarizeTranscriptionInputSchema>;

const SummarizeTranscriptionOutputSchema = z.object({
  summary: z.string().describe('The summary of the transcription.'),
});
export type SummarizeTranscriptionOutput = z.infer<typeof SummarizeTranscriptionOutputSchema>;

export async function summarizeTranscription(input: SummarizeTranscriptionInput): Promise<SummarizeTranscriptionOutput> {
  return summarizeTranscriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTranscriptionPrompt',
  input: {
    schema: z.object({
      transcription: z.string().describe('The video transcription text to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('The summary of the transcription.'),
    }),
  },
  prompt: `You are an AI assistant tasked with summarizing video transcriptions. Please provide a concise summary of the following transcription:\n\n{{{transcription}}}`,
});

const summarizeTranscriptionFlow = ai.defineFlow<
  typeof SummarizeTranscriptionInputSchema,
  typeof SummarizeTranscriptionOutputSchema
>(
  {
    name: 'summarizeTranscriptionFlow',
    inputSchema: SummarizeTranscriptionInputSchema,
    outputSchema: SummarizeTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
