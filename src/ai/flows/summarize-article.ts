// Summarizes an article provided as input.
//
// - summarizeArticle - A function that summarizes the article text.
// - SummarizeArticleInput - The input type for the summarizeArticle function.
// - SummarizeArticleOutput - The return type for the summarizeArticle function.

'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeArticleInputSchema = z.object({
  article: z.string().describe('The article to summarize.'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('The summary of the article.'),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {
    schema: z.object({
      article: z.string().describe('The article to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('The summary of the article.'),
    }),
  },
  prompt: `Summarize the following article:\n\n{{{article}}}`,
});

const summarizeArticleFlow = ai.defineFlow<
  typeof SummarizeArticleInputSchema,
  typeof SummarizeArticleOutputSchema
>(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
