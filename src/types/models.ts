
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

export type ChatSession = {
  id: string;
  messages: ChatMessage[];
  clientId: string;
  startedAt: Date;
  productContext?: string;
};

export type ModelOption = {
  id: string;
  name: string;
  value: string;
  description: string;
};

export const availableModels: ModelOption[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    value: "gpt-4o",
    description: "Most capable model for complex tasks, web browsing, vision"
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    value: "gpt-4-turbo-preview",
    description: "Improved model with better reasoning"
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    value: "gpt-3.5-turbo",
    description: "Fast and cost-effective for simpler tasks"
  }
];
