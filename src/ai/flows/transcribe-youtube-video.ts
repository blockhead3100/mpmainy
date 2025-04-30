
'use server';

/**
 * @fileOverview Transcribes audio from a YouTube video using a large language model.
 * The model is expected to handle the fetching and processing of the YouTube URL directly.
 *
 * - transcribeYouTubeVideo - A function that handles the YouTube video transcription process.
 * - TranscribeYouTubeVideoInput - The input type for the transcribeYouTubeVideo function.
 * - TranscribeYouTubeVideoOutput - The return type for the transcribeYouTubeVideo function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Basic URL validation - more specific YouTube URL regex could be used if needed
const YoutubeUrlSchema = z.string().url({ message: "Invalid URL format." }).refine(
    (url) => url.includes('youtube.com/watch?v=') || url.includes('youtu.be/'),
    { message: "URL must be a valid YouTube video link (youtube.com/watch?v=... or youtu.be/...)." }
);

const TranscribeYouTubeVideoInputSchema = z.object({
  youtubeUrl: YoutubeUrlSchema.describe('The URL of the YouTube video to transcribe.'),
});
export type TranscribeYouTubeVideoInput = z.infer<typeof TranscribeYouTubeVideoInputSchema>;

const TranscribeYouTubeVideoOutputSchema = z.object({
  transcription: z.string().min(1, { message: "Transcription cannot be empty." }).describe('The transcription of the YouTube video audio.'),
});
export type TranscribeYouTubeVideoOutput = z.infer<typeof TranscribeYouTubeVideoOutputSchema>;

export async function transcribeYouTubeVideo(input: TranscribeYouTubeVideoInput): Promise<TranscribeYouTubeVideoOutput> {
   // Validate input using Zod schema before calling the flow
   const validationResult = TranscribeYouTubeVideoInputSchema.safeParse(input);
   if (!validationResult.success) {
     throw new Error(`Invalid input: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
   }
  return transcribeYouTubeVideoFlow(validationResult.data);
}

const transcribeYouTubeVideoPrompt = ai.definePrompt({
  name: 'transcribeYouTubeVideoPrompt',
  input: {
    // Schema used internally by the prompt definition
    schema: z.object({
      youtubeUrl: z.string().describe('The URL of the YouTube video to transcribe.'),
    }),
  },
  output: {
    // Schema expected from the AI model
    schema: z.object({
      transcription: z.string().describe('The transcription of the YouTube video audio.'),
    }),
  },
  // Updated prompt for clarity and expecting direct processing
  prompt: `You are an AI assistant specialized in processing YouTube videos. Please transcribe the audio content of the following YouTube video accurately.
Provide only the transcribed text as the output.

YouTube URL: {{{youtubeUrl}}}

Transcription:`,
});

const transcribeYouTubeVideoFlow = ai.defineFlow<
  typeof TranscribeYouTubeVideoInputSchema, // Input schema for the flow function (already validated)
  typeof TranscribeYouTubeVideoOutputSchema // Output schema for the flow function
>(
  {
    name: 'transcribeYouTubeVideoFlow',
    inputSchema: TranscribeYouTubeVideoInputSchema, // Zod schema for documentation/validation
    outputSchema: TranscribeYouTubeVideoOutputSchema,
  },
  async input => {
     try {
        // The Gemini model (if correctly configured and capable) is expected
        // to fetch and process the audio from the youtubeUrl directly.
        const {output} = await transcribeYouTubeVideoPrompt(input);
        if (!output || !output.transcription) {
             throw new Error("AI model failed to generate a transcription.");
        }
         // Validate the output structure
        const validatedOutput = TranscribeYouTubeVideoOutputSchema.safeParse(output);
         if (!validatedOutput.success) {
             console.error("AI transcription output validation failed:", validatedOutput.error);
             throw new Error("Received invalid transcription format from AI.");
         }

        return validatedOutput.data;
    } catch(error: any) {
        console.error("Error in transcribeYouTubeVideoFlow:", error);
        // Provide a more specific error message if possible
        if (error.message?.includes('API key not valid')) {
             throw new Error("Invalid API Key. Please check your GOOGLE_GENAI_API_KEY environment variable.");
        }
         // Check for model limitations or specific errors if the SDK provides them
         // e.g., if (error.code === 'MODEL_UNSUPPORTED_FEATURE') ...
        throw new Error(`Failed to transcribe YouTube video: ${error.message}`);
    }
  }
);
