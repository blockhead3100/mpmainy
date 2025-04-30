'use server';
/**
 * @fileOverview Translates a video transcription into a specified target language using an AI model.
 *
 * - translateTranscription - A function that handles the transcription translation process.
 * - TranslateTranscriptionInput - The input type for the translateTranscription function.
 * - TranslateTranscriptionOutput - The return type for the translateTranscription function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TranslateTranscriptionInputSchema = z.object({
  transcription: z.string().describe('The video transcription text to translate.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French", "Japanese").'),
});
export type TranslateTranscriptionInput = z.infer<typeof TranslateTranscriptionInputSchema>;

const TranslateTranscriptionOutputSchema = z.object({
  translation: z.string().describe('The translated transcription text.'),
});
export type TranslateTranscriptionOutput = z.infer<typeof TranslateTranscriptionOutputSchema>;

export async function translateTranscription(input: TranslateTranscriptionInput): Promise<TranslateTranscriptionOutput> {
  return translateTranscriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTranscriptionPrompt',
  input: {
    schema: z.object({
      transcription: z.string().describe('The video transcription text to translate.'),
      targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French", "Japanese").'),
    }),
  },
  output: {
    schema: z.object({
      translation: z.string().describe('The translated transcription text.'),
    }),
  },
  prompt: `You are an AI assistant specialized in translation. Translate the following video transcription into {{{targetLanguage}}}:\n\n{{{transcription}}}`,
});

const translateTranscriptionFlow = ai.defineFlow<
  typeof TranslateTranscriptionInputSchema,
  typeof TranslateTranscriptionOutputSchema
>(
  {
    name: 'translateTranscriptionFlow',
    inputSchema: TranslateTranscriptionInputSchema,
    outputSchema: TranslateTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
