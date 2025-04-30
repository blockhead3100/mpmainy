
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

// Example list of languages, could be expanded or loaded dynamically
const supportedLanguages = [
  "English", "Spanish", "French", "German", "Chinese (Simplified)", "Japanese",
  "Korean", "Russian", "Portuguese", "Italian", "Arabic", "Hindi", "Turkish", "Dutch"
];

const TranslateTranscriptionInputSchema = z.object({
  transcription: z.string().min(1, { message: "Transcription cannot be empty." }).describe('The video transcription text to translate.'),
  targetLanguage: z.string().refine(lang => supportedLanguages.includes(lang), {
      message: "Unsupported target language selected.", // Provide a specific message
    }).describe(`The target language for translation (e.g., "${supportedLanguages.join('", "')}")`),
});
export type TranslateTranscriptionInput = z.infer<typeof TranslateTranscriptionInputSchema>;

const TranslateTranscriptionOutputSchema = z.object({
  translation: z.string().min(1, { message: "Translation cannot be empty." }).describe('The translated transcription text.'),
});
export type TranslateTranscriptionOutput = z.infer<typeof TranslateTranscriptionOutputSchema>;

export async function translateTranscription(input: TranslateTranscriptionInput): Promise<TranslateTranscriptionOutput> {
  // Validate input using Zod schema before calling the flow
  const validationResult = TranslateTranscriptionInputSchema.safeParse(input);
  if (!validationResult.success) {
    throw new Error(`Invalid input: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
  }
  return translateTranscriptionFlow(validationResult.data);
}

const prompt = ai.definePrompt({
  name: 'translateTranscriptionPrompt',
  input: {
    // Schema used internally by the prompt definition
    schema: z.object({
      transcription: z.string().describe('The video transcription text to translate.'),
      targetLanguage: z.string().describe('The target language for translation.'),
    }),
  },
  output: {
    // Schema expected from the AI model
    schema: z.object({
      translation: z.string().describe('The translated transcription text.'),
    }),
  },
  // Enhanced prompt specifying the task clearly
  prompt: `You are an AI assistant specialized in high-quality translation. Translate the following video transcription accurately into {{{targetLanguage}}}.

--- Original Transcription ---
{{{transcription}}}
--- End Original Transcription ---

{{{targetLanguage}}} Translation:`,
});

const translateTranscriptionFlow = ai.defineFlow<
  typeof TranslateTranscriptionInputSchema, // Input schema for the flow (already validated)
  typeof TranslateTranscriptionOutputSchema // Output schema for the flow
>(
  {
    name: 'translateTranscriptionFlow',
    inputSchema: TranslateTranscriptionInputSchema, // Zod schema for documentation/validation
    outputSchema: TranslateTranscriptionOutputSchema,
  },
  async input => {
     try {
        const {output} = await prompt(input); // Pass validated input
         if (!output || !output.translation) {
            throw new Error("AI model failed to generate a translation.");
        }
        // Validate the output structure
        const validatedOutput = TranslateTranscriptionOutputSchema.safeParse(output);
         if (!validatedOutput.success) {
             console.error("AI translation output validation failed:", validatedOutput.error);
             throw new Error("Received invalid translation format from AI.");
         }
        return validatedOutput.data;
     } catch(error: any) {
        console.error("Error in translateTranscriptionFlow:", error);
        throw new Error(`Failed to translate transcription to ${input.targetLanguage}: ${error.message}`);
    }
  }
);
