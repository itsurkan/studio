import { Pinecone, Index } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const apiKey = process.env.PINECONE_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
const embeddingDimension = process.env.EMBEDDING_MODEL_DIMENSION;
const pineconeCloud = process.env.PINECONE_CLOUD;
const pineconeRegion = process.env.PINECONE_REGION;

if (!apiKey) {
  throw new Error('PINECONE_API_KEY is not set in environment variables.');
}
if (!pineconeIndexName) {
  throw new Error('PINECONE_INDEX_NAME is not set in environment variables.');
}
if (!embeddingDimension) {
  throw new Error('EMBEDDING_MODEL_DIMENSION is not set in environment variables.');
}
if (!pineconeCloud) {
  throw new Error('PINECONE_CLOUD is not set in environment variables.');
}
if (!pineconeRegion) {
  throw new Error('PINECONE_REGION is not set in environment variables.');
}

const numericEmbeddingDimension = parseInt(embeddingDimension, 10);
if (isNaN(numericEmbeddingDimension)) {
  throw new Error('EMBEDDING_MODEL_DIMENSION is not a valid number.');
}

let pineconeInstance: Pinecone | null = null;

export const getPineconeClient = (): Pinecone => {
  if (!pineconeInstance) {
    pineconeInstance = new Pinecone({ apiKey });
  }
  return pineconeInstance;
};

let appIndex: Index | null = null;

/**
 * Retrieves the application's Pinecone index.
 * It attempts to connect to the configured index.
 * If the index does not exist, it will attempt to create it.
 * Note: Index creation can be slow and might be better handled by a setup script for production.
 */
export const getOrCreateMainPineconeIndex = async (): Promise<Index> => {
  if (appIndex) {
    return appIndex;
  }

  const client = getPineconeClient();
    
  try {
    
    const existingIndexes = await client.listIndexes();
    if (!existingIndexes.indexes?.some(index => index.name === pineconeIndexName)) {
      console.warn(
        `Pinecone index "${pineconeIndexName}" not found. Attempting to create it. ` +
        `For production, it's recommended to create the index beforehand using the setup script.`
      );
      await client.createIndex({
        name: pineconeIndexName,
        dimension: numericEmbeddingDimension,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: pineconeCloud as 'aws' | 'gcp' | 'azure',
            region: pineconeRegion,
          },
        },
        waitUntilReady: true,
      });
      console.log(`Pinecone index "${pineconeIndexName}" created successfully.`);
    } else {
      console.log(`Successfully connected to existing Pinecone index "${pineconeIndexName}".`);
    }
    
    appIndex = client.index(pineconeIndexName);
    // Optional: Describe index to confirm connection and configuration
    // const description = await appIndex.describeIndexStats();
    // console.log('Pinecone Index Stats:', description);
    return appIndex;

  } catch (error) {
    console.error(`Error accessing or creating Pinecone index "${pineconeIndexName}":`, error);
    if (error instanceof Error) {
        const anyError = error as any;
        if (anyError.response && anyError.response.data) {
          console.error('Error details:', anyError.response.data);
        } else if (anyError.cause) {
            console.error('Error cause:', anyError.cause);
        }
    }
    throw new Error(`Failed to initialize or connect to Pinecone index "${pineconeIndexName}".`);
  }
};

// Simpler function to just get the initialized index object.
// It's expected that `getOrCreateMainPineconeIndex` is called at application startup.
export const getPineconeAppIndex = (): Index => {
  if (!appIndex) {
    throw new Error(
      "Pinecone app index has not been initialized. " +
      "Call 'getOrCreateMainPineconeIndex()' at application startup."
    );
  }
  return appIndex;
};
