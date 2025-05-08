'use server';

/**
 * @fileOverview Implements semantic search for files using natural language queries.
 *
 * - semanticSearch - A function that performs semantic search on files.
 * - SemanticSearchInput - The input type for the semanticSearch function.
 * - SemanticSearchOutput - The return type for the semanticSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {File} from '@/services/zapier';

const SemanticSearchInputSchema = z.object({
  query: z.string().describe('The natural language query to search for.'),
  files: z.array(z.object({name: z.string(), data: z.string()})).describe('The list of files to search through.'),
});
export type SemanticSearchInput = z.infer<typeof SemanticSearchInputSchema>;

const SemanticSearchOutputSchema = z.object({
  relevantFiles: z.array(z.string()).describe('The names of the files that are relevant to the query.'),
});
export type SemanticSearchOutput = z.infer<typeof SemanticSearchOutputSchema>;

export async function semanticSearch(input: SemanticSearchInput): Promise<SemanticSearchOutput> {
  return semanticSearchFlow(input);
}

const fileRelevanceTool = ai.defineTool({
  name: 'isFileRelevant',
  description: 'Determines whether a file is relevant to a given search query.',
  inputSchema: z.object({
    query: z.string().describe('The search query.'),
    fileContent: z.string().describe('The content of the file.'),
    fileName: z.string().describe('The name of the file.'),
  }),
  outputSchema: z.boolean(),
}, async (input) => {
  // This is a placeholder; replace with actual relevance check logic.
  // For example, using an embeddings model and cosine similarity.
  // Or LLM prompt.
  // For now, let's just return true if the query is found in the file content.
  return input.fileContent.toLowerCase().includes(input.query.toLowerCase());
});

const semanticSearchPrompt = ai.definePrompt({
  name: 'semanticSearchPrompt',
  tools: [fileRelevanceTool],
  input: {schema: SemanticSearchInputSchema},
  output: {schema: SemanticSearchOutputSchema},
  prompt: `You are an AI assistant helping users find relevant files based on their search query.  You will use the isFileRelevant tool to determine which files are relevant to the query. Return the names of the relevant files.

User Query: {{{query}}}

Files:{{#each files}}\n- Name: {{{this.name}}}, Content: {{{this.data}}}{{/each}}`,
  system: `For each file, use the isFileRelevant tool to determine if the file is relevant to the user's query. If it is, include the file name in the relevantFiles array. Return a JSON object containing the relevantFiles array.`
});

const semanticSearchFlow = ai.defineFlow(
  {
    name: 'semanticSearchFlow',
    inputSchema: SemanticSearchInputSchema,
    outputSchema: SemanticSearchOutputSchema,
  },
  async input => {
    const {output} = await semanticSearchPrompt(input);
    return output!;
  }
);
