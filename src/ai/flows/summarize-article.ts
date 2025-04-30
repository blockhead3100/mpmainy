
// Summarizes an article provided as input.
//
// - summarizeArticle - A function that summarizes the article text.
// - SummarizeArticleInput - The input type for the summarizeArticle function.
// - SummarizeArticleOutput - The return type for the summarizeArticle function.

'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeArticleInputSchema = z.object({
  article: z.string().min(10, { message: "Article text must be at least 10 characters long." }).describe('The article to summarize.'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('The summary of the article.'),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  // Validate input using Zod schema before calling the flow
  const validationResult = SummarizeArticleInputSchema.safeParse(input);
  if (!validationResult.success) {
    // Throw an error or handle validation failure appropriately
    throw new Error(`Invalid input: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
  }
  return summarizeArticleFlow(validationResult.data);
}

const prompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {
    // Schema used internally by the prompt definition, matching the flow's validated input
    schema: z.object({
      article: z.string().describe('The article to summarize.'),
    }),
  },
  output: {
    // Schema expected from the AI model
    schema: z.object({
      summary: z.string().describe('The summary of the article.'),
    }),
  },
  // Use a slightly more robust prompt template
  prompt: `Please provide a concise summary of the following article:\n\n---\n{{{article}}}\n---\n\nSummary:`,
});

const summarizeArticleFlow = ai.defineFlow<
  typeof SummarizeArticleInputSchema, // Input schema for the flow function (already validated)
  typeof SummarizeArticleOutputSchema // Output schema for the flow function
>(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema, // Zod schema for automatic documentation/validation if used directly
    outputSchema: SummarizeArticleOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input); // Pass the validated input to the prompt
        if (!output || !output.summary) {
             throw new Error("AI model failed to generate a summary.");
        }
        // Ensure the output structure matches the schema, although the prompt definition should handle this
        const validatedOutput = SummarizeArticleOutputSchema.safeParse(output);
         if (!validatedOutput.success) {
             console.error("AI output validation failed:", validatedOutput.error);
             throw new Error("Received invalid summary format from AI.");
         }
        return validatedOutput.data;
    } catch(error: any) {
        console.error("Error in summarizeArticleFlow:", error);
        // Re-throw a more specific error or handle it
        throw new Error(`Failed to generate article summary: ${error.message}`);
    }
  }
);
