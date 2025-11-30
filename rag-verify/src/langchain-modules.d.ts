// Type declarations for LangChain modules

declare module '@langchain/google-genai' {
  import { Embeddings } from '@langchain/core/embeddings';
  
  export class GoogleGenerativeAIEmbeddings extends Embeddings {
    constructor(config: {
      apiKey: string;
      modelName?: string;
    });
  }
  
  export class ChatGoogleGenerativeAI {
    constructor(config: {
      apiKey: string;
      modelName?: string;
      temperature?: number;
      maxOutputTokens?: number;
    });
    
    invoke(prompt: string): Promise<{ content: string }>;
  }
}

declare module '@langchain/qdrant' {
  import { Embeddings } from '@langchain/core/embeddings';
  import { VectorStore } from '@langchain/core/vectorstores';
  import { Document } from '@langchain/core/documents';
  
  export class QdrantVectorStore extends VectorStore {
    constructor(embeddings: Embeddings, config: {
      client: any;
      collectionName: string;
    });
    
    addDocuments(documents: Document[]): Promise<void>;
    similaritySearch(query: string, k?: number): Promise<Document[]>;
  }
}

declare module '@langchain/core/documents' {
  export class Document {
    pageContent: string;
    metadata: Record<string, any>;
    
    constructor(config: {
      pageContent: string;
      metadata?: Record<string, any>;
    });
  }
}

declare module 'langchain/text_splitter' {
  export class RecursiveCharacterTextSplitter {
    constructor(config?: {
      chunkSize?: number;
      chunkOverlap?: number;
    });
    
    splitText(text: string): Promise<string[]>;
  }
}

