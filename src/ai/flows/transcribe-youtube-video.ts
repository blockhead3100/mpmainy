'use server';

/**
 * @fileOverview Transcribes audio from a YouTube video using a large language model.
 *
 * - transcribeYouTubeVideo - A function that handles the YouTube video transcription process.
 * - TranscribeYouTubeVideoInput - The input type for the transcribeYouTubeVideo function.
 * - TranscribeYouTubeVideoOutput - The return type for the transcribeYouTubeVideo function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TranscribeYouTubeVideoInputSchema = z.object({
  youtubeUrl: z.string().describe('The URL of the YouTube video to transcribe.'),
});
export type TranscribeYouTubeVideoInput = z.infer<typeof TranscribeYouTubeVideoInputSchema>;

const TranscribeYouTubeVideoOutputSchema = z.object({
  transcription: z.string().describe('The transcription of the YouTube video audio.'),
});
export type TranscribeYouTubeVideoOutput = z.infer<typeof TranscribeYouTubeVideoOutputSchema>;

export async function transcribeYouTubeVideo(input: TranscribeYouTubeVideoInput): Promise<TranscribeYouTubeVideoOutput> {
  return transcribeYouTubeVideoFlow(input);
}

const transcribeYouTubeVideoPrompt = ai.definePrompt({
  name: 'transcribeYouTubeVideoPrompt',
  input: {
    schema: z.object({
      youtubeUrl: z.string().describe('The URL of the YouTube video to transcribe.'),
    }),
  },
  output: {
    schema: z.object({
      transcription: z.string().describe('The transcription of the YouTube video audio.'),
    }),
  },
  prompt: `You are an AI assistant that transcribes YouTube videos.  The user will provide you with a link to the video.  You will then provide a transcript of the video.

YouTube URL: {{{youtubeUrl}}}`,
});

const transcribeYouTubeVideoFlow = ai.defineFlow<
  typeof TranscribeYouTubeVideoInputSchema,
  typeof TranscribeYouTubeVideoOutputSchema
>(
  {
    name: 'transcribeYouTubeVideoFlow',
    inputSchema: TranscribeYouTubeVideoInputSchema,
    outputSchema: TranscribeYouTubeVideoOutputSchema,
  },
  async input => {
    const {output} = await transcribeYouTubeVideoPrompt(input);
    return output!;
  }
);
