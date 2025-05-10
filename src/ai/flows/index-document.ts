'use server';
import { Pinecone, Index } from '@pinecone-database/pinecone';

import { ai } from '@/ai/genkit'; // Import our configured ai object
import { Document, type Embedding } from 'genkit'; // Document type and Embedding type
import { z } from 'zod';
import { getOrCreateMainPineconeIndex, getPineconeClient } from '@/lib/pinecone/client'; // Import Pinecone client
// Removed direct import of 'embed' and 'EmbeddingData'
// We will use the embedder instance's method.

// We'll use 'text-embedding-004' as the default embedder ID from the googleAI plugin
const EMBEDDER_ID = 'googleai/text-embedding-004';

// Placeholder for actual text splitting/chunking logic
function splitTextIntoChunks(text: string, chunkSize = 1000, chunkOverlap = 200): string[] { // Increased overlap slightly
  const chunks: string[] = [];
  if (!text) return chunks;

  let startIndex = 0;
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    chunks.push(text.substring(startIndex, endIndex));
    startIndex += chunkSize - chunkOverlap;
    if (startIndex >= endIndex && endIndex < text.length) { // Ensure progress if overlap is large
        startIndex = endIndex;
    }
  }
  return chunks.filter(chunk => chunk.trim() !== '');
}

export const IndexDocumentInputSchema = z.object({
  userId: z.string().describe('The unique identifier for the user owning the document.'),
  documentId: z.string().describe('A unique identifier for the document (e.g., filename or DB ID).'),
  content: z.string().describe('The text content of the document.'),
  metadata: z.record(z.any()).optional().describe('Optional metadata to store with the document chunks.'),
});
export type IndexDocumentInput = z.infer<typeof IndexDocumentInputSchema>;

export const IndexDocumentOutputSchema = z.object({
  userId: z.string(),
  documentId: z.string(),
  status: z.string(),
  chunksIndexed: z.number().optional(),
  error: z.string().optional(),
});
export type IndexDocumentOutput = z.infer<typeof IndexDocumentOutputSchema>;

export const indexDocumentFlow = ai.defineFlow(
  {
    name: 'indexDocumentFlow',
    inputSchema: IndexDocumentInputSchema,
    outputSchema: IndexDocumentOutputSchema,
    // Removed authPolicy for now to simplify; can be added back correctly later if needed.
  },
  async (input: IndexDocumentInput): Promise<IndexDocumentOutput> => {
    const { userId, documentId, content, metadata: inputMetadata } = input;
    var client = getPineconeClient();

    try {
      if (!content.trim()) {
        return { userId, documentId, status: 'error', error: 'Document content is empty.' };
      }

      const textChunks = splitTextIntoChunks(content);
      if (textChunks.length === 0) {
        return { userId, documentId, status: 'error', error: 'No text chunks could be generated from the document.' };
      }

      // Initialize Pinecone Index
      const pineconeIndex = await getOrCreateMainPineconeIndex();
      const userNamespace = pineconeIndex.namespace(`user-${userId}`);

      const documentsToEmbed: Document[] = textChunks.map((chunkText, index) =>
        Document.fromText(chunkText, {
          documentId: documentId,
          chunkIndex: index,
          userId: userId,
          originalFileName: inputMetadata?.fileName || documentId, // Example of using input metadata
          ...(inputMetadata || {}), // Spread other input metadata
        })
      );

      var client = getPineconeClient();
      const embeddingResponses = await client.inference.embed(
        EMBEDDER_ID,
        documentsToEmbed.map(d => d.text),
         { inputType: 'passage', truncate: 'END' }
      );
      
      // client.inference.embed() returns a Promise<EmbeddingsList>.
      // EmbeddingsList has a `data` property: `data: Array<Embedding>`.
      // Each `Embedding` can be a `DenseEmbedding` (with a `values: number[]` property)
      // or a `SparseEmbedding`. We expect dense embeddings.

      if (!embeddingResponses || !embeddingResponses.data || !Array.isArray(embeddingResponses.data) || embeddingResponses.data.length !== documentsToEmbed.length) {
        throw new Error('Mismatch between number of documents and embedding results, or embedding response is malformed.');
      }

      const recordsToUpsert = documentsToEmbed.map((doc, i) => {
        const embeddingObject = embeddingResponses.data[i];
        let currentEmbedding: number[] | undefined;

        if (embeddingObject && embeddingObject.vectorType === 'dense' && 'values' in embeddingObject) {
          currentEmbedding = (embeddingObject as any).values; // Cast to any to access .values, assuming it's DenseEmbedding
        }
        
        if (!currentEmbedding || !Array.isArray(currentEmbedding) || currentEmbedding.length === 0) {
          throw new Error(`Failed to generate a valid dense embedding for chunk ${doc.metadata!.chunkIndex} of document ${documentId}`);
        }
        
        const docMetadata = doc.metadata || {};
        const pineconeMetadata: Record<string, any> = {
            text: doc.text, // Corrected: doc.text is a property, not a method
            userId: docMetadata.userId,
            documentId: docMetadata.documentId,
            chunkIndex: docMetadata.chunkIndex,
            originalFileName: docMetadata.originalFileName,
        };
        // Add any other relevant metadata from doc.metadata, excluding known fields
        for (const key in docMetadata) {
            if (!['userId', 'documentId', 'chunkIndex', 'originalFileName', 'source', 'contentType'].includes(key)) {
                 pineconeMetadata[key] = docMetadata[key];
            }
        }

        return {
          id: `doc:${documentId}:chunk:${docMetadata.chunkIndex}`,
          values: currentEmbedding,
          metadata: pineconeMetadata,
        };
      });
      
      // Upsert records to Pinecone in batches if necessary (Pinecone has limits)
      // For simplicity, upserting all at once here. Consider batching for large numbers of chunks.
      await userNamespace.upsert(recordsToUpsert);

      console.log(`Successfully indexed ${recordsToUpsert.length} chunks for document ${documentId} into user ${userId}'s namespace.`);

      return {
        userId,
        documentId,
        status: 'success',
        chunksIndexed: recordsToUpsert.length,
      };
    } catch (err) {
      console.error(`Error in indexDocumentFlow for user ${userId}, document ${documentId}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during indexing.';
      return {
        userId,
        documentId,
        status: 'error',
        error: errorMessage,
      };
    }
  }
);
