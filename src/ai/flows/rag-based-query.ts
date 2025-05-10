'use server';
/**
 * @fileOverview A RAG-based query AI agent that allows users to ask questions about their documents or engage in general conversation.
 *
 * - ragBasedQuery - A function that handles the RAG-based query process.
 * - RagBasedQueryInput - The input type for the ragBasedQuery function.
 * - RagBasedQueryOutput - The return type for the ragBasedQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {ModelReference} from 'genkit/model';

const RagBasedQueryInputSchema = z.object({
  query: z.string().describe('The question to ask.'),
  documentContent: z.string().optional().describe('The content of the document to query. Optional.'),
  outputFormat: z.enum(['bullets', 'paragraphs']).describe('The desired output format.'),
  modelId: z.string().optional().describe('The ID of the LLM model to use for the query.'),
});
export type RagBasedQueryInput = z.infer<typeof RagBasedQueryInputSchema>;

const RagBasedQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, generated using RAG if a document is provided, or as a general response otherwise.'),
});
export type RagBasedQueryOutput = z.infer<typeof RagBasedQueryOutputSchema>;

export async function ragBasedQuery(input: RagBasedQueryInput): Promise<RagBasedQueryOutput> {
  return ragBasedQueryFlow(input);
}

const systemPrompt = `You are an AI assistant.
The user will provide a question.
If document content is provided, you MUST use the document content to answer the question.
If no document content is provided, answer the question as a general conversational AI.
The user will also specify the desired output format (bullets or paragraphs). Please format your answer accordingly.`;

const prompt = ai.definePrompt({
  name: 'ragBasedQueryPrompt',
  system: systemPrompt,
  input: {schema: RagBasedQueryInputSchema},
  output: {schema: RagBasedQueryOutputSchema},
  prompt: `Question: {{{query}}}
{{#if documentContent}}
Document Content: {{{documentContent}}}
{{/if}}
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
        modelToUse = ai.getGenerator(input.modelId as any) as ModelReference<any>;
      } catch (error) {
        console.warn(`Could not find model generator for ID: ${input.modelId}. Falling back to default.`);
      }
    }
    const result = await prompt(input, { model: modelToUse });
    
    if (!result.output) {
      console.error('RAG Query Flow: Prompt did not return an output.', result);
      // This error will be caught by the client-side try/catch block.
      throw new Error('AI model failed to produce a valid output. The output was empty.');
    }
    // The output schema should ensure result.output matches RagBasedQueryOutput.
    // If result.output is truthy but doesn't match the schema, Genkit/Zod might throw an error earlier.
    return result.output;
  }
);

