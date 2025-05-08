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

const RagBasedQueryInputSchema = z.object({
  query: z.string().describe('The question to ask about the documents.'),
  documentContent: z.string().describe('The content of the document to query.'),
  outputFormat: z.enum(['bullets', 'paragraphs']).describe('The desired output format.'),
});
export type RagBasedQueryInput = z.infer<typeof RagBasedQueryInputSchema>;

const RagBasedQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, generated using RAG.'),
});
export type RagBasedQueryOutput = z.infer<typeof RagBasedQueryOutputSchema>;

export async function ragBasedQuery(input: RagBasedQueryInput): Promise<RagBasedQueryOutput> {
  return ragBasedQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ragBasedQueryPrompt',
  input: {schema: RagBasedQueryInputSchema},
  output: {schema: RagBasedQueryOutputSchema},
  prompt: `You are an AI assistant that answers questions based on the content of a document.

  The user will provide a question and the content of the document. You should use the document content to answer the question.

  The user will also specify the desired output format (bullets or paragraphs). Please format your answer accordingly.

  Question: {{{query}}}
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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
