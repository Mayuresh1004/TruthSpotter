// Type declarations for Google Generative AI

declare module '@google/generative-ai' {
  export interface GenerationConfig {
    maxOutputTokens?: number;
    temperature?: number;
  }
  
  export interface ModelConfig {
    model: string;
    generationConfig?: GenerationConfig;
  }
  
  export interface GenerateContentResponse {
    response: {
      text(): string;
    };
  }
  
  export class GenerativeModel {
    constructor(config: ModelConfig);
    
    generateContent(prompt: string): Promise<GenerateContentResponse>;
  }
  
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    
    getGenerativeModel(config: ModelConfig): GenerativeModel;
  }
}

