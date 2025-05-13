import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TrainingDataType = 'text' | 'pdf' | 'url';

export interface TrainingItem {
  id: string;
  clientId: string;
  type: TrainingDataType;
  name: string;
  content?: string;
  url?: string;
  fileUrl?: string;
  createdAt: Date;
}

export interface ChatbotSettings {
  id: string;
  clientId: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  welcomeMessage: string;
  placeholderText: string;
  position: 'bottom-right' | 'bottom-left';
}

export interface Client {
  id: string;
  name: string;
  website: string;
  apiKey?: string;
  model: string;
  createdAt: Date;
  settings: ChatbotSettings;
  trainingData: TrainingItem[];
}

interface ChatbotContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'settings' | 'trainingData'>) => Promise<string>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  addTrainingData: (clientId: string, data: Omit<TrainingItem, 'id' | 'clientId' | 'createdAt'>) => Promise<string>;
  updateTrainingData: (clientId: string, id: string, data: Partial<TrainingItem>) => Promise<void>;
  deleteTrainingData: (clientId: string, id: string) => Promise<void>;
  updateChatbotSettings: (clientId: string, settings: Partial<ChatbotSettings>) => Promise<void>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
};

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([]);

  // Fetch all clients and their settings/training data
  const fetchClients = async () => {
    const { data: clientRows } = await (supabase.from('clients') as any).select('*');
    if (!clientRows) return;
    const { data: settingsRows } = await (supabase.from('chatbot_settings') as any).select('*');
    const { data: trainingRows } = await (supabase.from('training_data') as any).select('*');
    
    const clientsWithDetails: Client[] = clientRows.map((client: any) => {
      // Find settings for this client or create default settings
      const clientSettings = settingsRows?.find((s: any) => s.client_id === client.id);
      
      // Create a properly typed settings object with defaults
      const settings: ChatbotSettings = {
        id: clientSettings?.id || '',
        clientId: client.id,
        name: clientSettings?.name || `${client.name}'s Chatbot`,
        primaryColor: clientSettings?.primary_color || '#2563eb',
        secondaryColor: clientSettings?.secondary_color || '#ffffff',
        welcomeMessage: clientSettings?.welcome_message || 'Hello! How can I help you today?',
        placeholderText: clientSettings?.placeholder_text || 'Ask me anything...',
        position: clientSettings?.position || 'bottom-right',
        logo: clientSettings?.logo || undefined
      };
      
      return {
        ...client,
        createdAt: new Date(client.created_at),
        settings: settings,
        trainingData: (trainingRows || [])
          .filter((t: any) => t.client_id === client.id)
          .map((t: any) => ({ 
            ...t, 
            createdAt: new Date(t.created_at) 
          })),
      };
    });
    
    setClients(clientsWithDetails);
  };

  useEffect(() => {
    fetchClients();
    // Real-time subscription for clients
    const clientChannel = supabase.channel('public:clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchClients)
      .subscribe();
    // Real-time subscription for settings
    const settingsChannel = supabase.channel('public:chatbot_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chatbot_settings' }, fetchClients)
      .subscribe();
    // Real-time subscription for training data
    const trainingChannel = supabase.channel('public:training_data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_data' }, fetchClients)
      .subscribe();
    return () => {
      supabase.removeChannel(clientChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(trainingChannel);
    };
  }, []);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'settings' | 'trainingData'>) => {
    // Always get the current user using getUser()
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');
    // Map apiKey to api_key for Supabase
    const { apiKey, ...rest } = clientData;
    const { data, error } = await (supabase.from('clients') as any).insert([{
      ...rest,
      api_key: apiKey,
      user_id: user.id
    }]).select();
    if (error || !data || !data[0]) throw error;
    // Insert default settings
    await (supabase.from('chatbot_settings') as any).insert([{
      client_id: data[0].id,
      name: `${clientData.name}'s Chatbot`,
      primary_color: '#2563eb',
      secondary_color: '#ffffff',
      welcome_message: 'Hello! How can I help you today?',
      placeholder_text: 'Ask me anything...',
      position: 'bottom-right',
    }]);
    return data[0].id;
  };

  const updateClient = async (id: string, client: Partial<Client>) => {
    // Always get the current user using getUser()
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');
    // Map apiKey to api_key for Supabase
    const { apiKey, ...rest } = client;
    await (supabase.from('clients') as any)
      .update({ ...rest, api_key: apiKey })
      .eq('id', id)
      .eq('user_id', user.id);
  };

  const deleteClient = async (id: string) => {
    // Always get the current user using getUser()
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');
    await (supabase.from('clients') as any)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  };

  const getClient = (id: string) => {
    return clients.find((client) => client.id === id);
  };

  const addTrainingData = async (
    clientId: string,
    data: Omit<TrainingItem, 'id' | 'clientId' | 'createdAt'>
  ) => {
    // Always get the current user using getUser()
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');
    const { data: inserted, error } = await (supabase.from('training_data') as any).insert([
      {
        ...data,
        client_id: clientId,
        user_id: user.id,
        type: data.type,
        name: data.name,
        content: data.content,
        url: data.url,
        file_url: data.fileUrl
      }
    ]).select();
    if (error || !inserted || !inserted[0]) throw error;
    return inserted[0].id;
  };

  const updateTrainingData = async (
    clientId: string,
    id: string,
    data: Partial<TrainingItem>
  ) => {
    // Always get the current user using getUser()
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');
    // Map fields to correct column names
    const updateFields: any = {};
    if (data.name) updateFields.name = data.name;
    if (data.content) updateFields.content = data.content;
    if (data.url) updateFields.url = data.url;
    if (data.fileUrl) updateFields.file_url = data.fileUrl;
    await (supabase.from('training_data') as any)
      .update(updateFields)
      .eq('id', id)
      .eq('client_id', clientId)
      .eq('user_id', user.id);
  };

  const deleteTrainingData = async (clientId: string, id: string) => {
    // Always get the current user using getUser()
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');
    await (supabase.from('training_data') as any)
      .delete()
      .eq('id', id)
      .eq('client_id', clientId)
      .eq('user_id', user.id);
  };

  const updateChatbotSettings = async (
    clientId: string,
    settings: Partial<ChatbotSettings>
  ) => {
    // Always get the current user using getUser()
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');
    await (supabase.from('chatbot_settings') as any).update({
      name: settings.name,
      primary_color: settings.primaryColor,
      secondary_color: settings.secondaryColor,
      logo: settings.logo,
      welcome_message: settings.welcomeMessage,
      placeholder_text: settings.placeholderText,
      position: settings.position,
    }).eq('client_id', clientId).eq('user_id', user.id);
    // Refresh local state after update
    await fetchClients();
  };

  return (
    <ChatbotContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        deleteClient,
        getClient,
        addTrainingData,
        updateTrainingData,
        deleteTrainingData,
        updateChatbotSettings,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};
