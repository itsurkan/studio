'use server';
/**
 * @fileOverview A RAG-based query AI agent that allows users to ask questions about their documents.
 *
 * - ragBasedQuery - A function that handles the RAG-based query process.
 * - RagBasedQueryInput - The input type for the ragBasedQuery function.
 * - RagBasedQueryOutput - The return type for the ragBasedQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {ModelReference} from 'genkit/model';

const RagBasedQueryInputSchema = z.object({
  query: z.string().describe('The question to ask about the documents.'),
  documentContent: z.string().describe('The content of the document to query.'),
  outputFormat: z.enum(['bullets', 'paragraphs']).describe('The desired output format.'),
  modelId: z.string().optional().describe('The ID of the LLM model to use for the query.'),
});
export type RagBasedQueryInput = z.infer<typeof RagBasedQueryInputSchema>;

const RagBasedQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, generated using RAG.'),
});
export type RagBasedQueryOutput = z.infer<typeof RagBasedQueryOutputSchema>;

export async function ragBasedQuery(input: RagBasedQueryInput): Promise<RagBasedQueryOutput> {
  return ragBasedQueryFlow(input);
}

const systemPrompt = `You are an AI assistant that answers questions based on the content of a document.

The user will provide a question and the content of the document. You should use the document content to answer the question.

The user will also specify the desired output format (bullets or paragraphs). Please format your answer accordingly.`;

const prompt = ai.definePrompt({
  name: 'ragBasedQueryPrompt',
  system: systemPrompt,
  input: {schema: RagBasedQueryInputSchema},
  output: {schema: RagBasedQueryOutputSchema},
  prompt: `Question: {{{query}}}
Document Content: {{{documentContent}}}
Output Format: {{{outputFormat}}}

Answer:`,
});

const ragBasedQueryFlow = ai.defineFlow(
  {
    name: 'ragBasedQueryFlow',
    inputSchema: RagBasedQueryInputSchema,
    outputSchema: RagBasedQueryOutputSchema,
  },
  async (input) => {
    let modelToUse: ModelReference<any> | undefined = undefined;
    if (input.modelId) {
      try {
        // Attempt to get the specific model generator
        // Ensure the modelId is a valid Genkit model identifier string (e.g., "googleai/gemini-1.5-pro-latest")
        modelToUse = ai.getGenerator(input.modelId as any) as ModelReference<any>;
      } catch (error) {
        console.warn(`Could not find model generator for ID: ${input.modelId}. Falling back to default.`);
        // Fallback to default model configured in ai.ts if specific model not found or id is incorrect
        // The default model is implicitly used if `modelToUse` remains undefined and prompt is called.
        // Or, explicitly set the default: modelToUse = ai.getGenerator('googleai/gemini-2.0-flash'); 
      }
    }

    // If modelToUse is still undefined, Genkit will use the default model specified in ai.ts or the prompt's config
    const {output} = await prompt(input, { model: modelToUse });
    return output!;
  }
);
