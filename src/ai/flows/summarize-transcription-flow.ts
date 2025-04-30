
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
  transcription: z.string().min(10, { message: "Transcription must be at least 10 characters long." }).describe('The video transcription text to summarize.'),
});
export type SummarizeTranscriptionInput = z.infer<typeof SummarizeTranscriptionInputSchema>;

const SummarizeTranscriptionOutputSchema = z.object({
  summary: z.string().min(1, { message: "Summary cannot be empty." }).describe('The summary of the transcription.'),
});
export type SummarizeTranscriptionOutput = z.infer<typeof SummarizeTranscriptionOutputSchema>;

export async function summarizeTranscription(input: SummarizeTranscriptionInput): Promise<SummarizeTranscriptionOutput> {
  // Validate input using Zod schema before calling the flow
  const validationResult = SummarizeTranscriptionInputSchema.safeParse(input);
  if (!validationResult.success) {
    throw new Error(`Invalid input: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
  }
  return summarizeTranscriptionFlow(validationResult.data);
}

const prompt = ai.definePrompt({
  name: 'summarizeTranscriptionPrompt',
  input: {
    // Schema used internally by the prompt definition
    schema: z.object({
      transcription: z.string().describe('The video transcription text to summarize.'),
    }),
  },
  output: {
     // Schema expected from the AI model
    schema: z.object({
      summary: z.string().describe('The summary of the transcription.'),
    }),
  },
  // Slightly enhanced prompt
  prompt: `You are an AI assistant highly skilled in summarizing text, specifically video transcriptions. Please generate a concise and informative summary of the following transcription:

--- Transcription ---
{{{transcription}}}
--- End Transcription ---

Summary:`,
});

const summarizeTranscriptionFlow = ai.defineFlow<
  typeof SummarizeTranscriptionInputSchema, // Input schema for the flow (already validated)
  typeof SummarizeTranscriptionOutputSchema // Output schema for the flow
>(
  {
    name: 'summarizeTranscriptionFlow',
    inputSchema: SummarizeTranscriptionInputSchema, // Zod schema for documentation/validation
    outputSchema: SummarizeTranscriptionOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input); // Pass validated input to the prompt
        if (!output || !output.summary) {
            throw new Error("AI model failed to generate a transcription summary.");
        }
         // Validate the output structure
        const validatedOutput = SummarizeTranscriptionOutputSchema.safeParse(output);
         if (!validatedOutput.success) {
             console.error("AI summary output validation failed:", validatedOutput.error);
             throw new Error("Received invalid summary format from AI.");
         }
        return validatedOutput.data;
     } catch(error: any) {
        console.error("Error in summarizeTranscriptionFlow:", error);
        throw new Error(`Failed to summarize transcription: ${error.message}`);
    }
  }
);
