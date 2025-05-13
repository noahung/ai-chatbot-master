import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client } from "@/context/ChatbotContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotPreviewProps {
  client: Client;
  className?: string;
}

const ChatbotPreview = ({ client, className }: ChatbotPreviewProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: client.settings.welcomeMessage,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Build system prompt with training data context
  const buildSystemPrompt = () => {
    let systemPrompt = `You are a helpful assistant for ${client.name}.`;
    
    // Add training data context if available
    if (client.trainingData && client.trainingData.length > 0) {
      systemPrompt += `\nUse the following information to answer questions about the client and their products/services.`;
      systemPrompt += `\nIf the information doesn't contain an answer to the user's question, be honest and say you don't know.`;
      systemPrompt += `\n\nCLIENT INFORMATION:`;
      
      // Process different types of training data
      client.trainingData.forEach(item => {
        systemPrompt += `\n\n--- ${item.name} ---\n`;
        
        if (item.content) {
          systemPrompt += `${item.content}\n`;
        }
        
        if (item.url) {
          systemPrompt += `Source URL: ${item.url}\n`;
        }
        
        if (item.fileUrl) {
          systemPrompt += `Document: ${item.fileUrl}\n`;
        }
      });
    }
    
    return systemPrompt;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date()
    };
    setMessages([...messages, userMessage]);
    setMessage("");
    
    // Simulate AI typing
    setIsTyping(true);
    
    try {
      // Prepare message history for API call
      const systemPrompt = buildSystemPrompt();
      const messageHistory = [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage.content }
      ];
      
      // If client has an API key, use it to call OpenAI
      if (client.apiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${client.apiKey}`
          },
          body: JSON.stringify({
            model: client.model || "gpt-3.5-turbo",
            messages: messageHistory,
            max_tokens: 500
          })
        });
        
        if (!response.ok) {
          throw new Error('OpenAI API error');
        }
        
        const data = await response.json();
        const aiReply = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
        
        // Add AI response
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: aiReply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Fallback to mock responses if no API key
        // Basic keyword detection for demo purposes
        let response = "I'm an AI assistant trained to help with questions about this company and its products or services.";
        
        const lowercaseMessage = userMessage.content.toLowerCase();
        if (lowercaseMessage.includes("price") || lowercaseMessage.includes("cost")) {
          response = "Our pricing varies depending on the specific product or service you're interested in. Could you let me know which product you're asking about?";
        } else if (lowercaseMessage.includes("contact") || lowercaseMessage.includes("support")) {
          response = "You can contact our support team at support@example.com or call us at (555) 123-4567 during business hours.";
        } else if (lowercaseMessage.includes("shipping") || lowercaseMessage.includes("delivery")) {
          response = "We typically process and ship orders within 1-2 business days. Standard shipping usually takes 3-5 business days to arrive, while express shipping is 1-2 days.";
        } else if (lowercaseMessage.includes("return") || lowercaseMessage.includes("refund")) {
          response = "Our return policy allows returns within 30 days of purchase for a full refund. Items must be in their original condition.";
        }
        
        // Add AI response
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm h-[500px] flex flex-col ${className || ""}`}>
      {/* Chat header */}
      <div 
        className="p-3 border-b flex items-center gap-2"
        style={{ backgroundColor: client.settings.primaryColor, color: '#fff' }}
      >
        {client.settings.logo ? (
          <img 
            src={client.settings.logo} 
            alt={`${client.name} logo`} 
            className="w-6 h-6 rounded"
          />
        ) : (
          <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-white">
            💬
          </div>
        )}
        <span className="font-medium">{client.settings.name || `${client.name}'s Chatbot`}</span>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* AI typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-3 text-gray-500">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>AI is typing...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Chat input */}
      <div className="p-3 border-t">
        <div className="flex">
          <Input
            placeholder={client.settings.placeholderText || "Ask me anything..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 mr-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isTyping}
          />
          <Button 
            size="icon"
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            style={{ backgroundColor: client.settings.primaryColor }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPreview;
