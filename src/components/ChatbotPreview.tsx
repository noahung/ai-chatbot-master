
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatbot } from "@/context/ChatbotContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Bot, 
  Send, 
  X, 
  MessageSquare,
  Loader2,
  Code
} from "lucide-react";
import { ChatMessage } from "@/types/models";

const ChatbotPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient } = useChatbot();
  
  const client = getClient(id || "");
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showExitButton, setShowExitButton] = useState(true);
  
  useEffect(() => {
    // Initialize with welcome message
    if (client) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: client.settings.welcomeMessage || "Hello! How can I help you today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [client]);
  
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-2">Client Not Found</h1>
        <p className="text-gray-500 mb-4">The client you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/dashboard/clients")}>
          Back to Clients
        </Button>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!message.trim()) return;

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
    
    // Simulate AI response delay
    setTimeout(() => {
      // Mock AI response based on user question
      let response = "I'm an AI assistant trained to help with questions about this company and its products or services.";
      
      // Basic keyword detection for demo purposes
      const lowercaseMessage = message.toLowerCase();
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
      setIsTyping(false);
    }, 1500);
  };

  // Position the chatbot based on settings
  const chatbotPosition = client.settings.position === "bottom-right" ? "right-4" : "left-4";

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && message.trim()) {
        handleSendMessage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [message]);

  return (
    <div className="min-h-screen w-full bg-gray-100 relative overflow-hidden">
      {showExitButton && (
        <div className="fixed top-4 left-4 z-50">
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/dashboard/clients/${client.id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit Preview
          </Button>
        </div>
      )}
      
      {/* Simulate a webpage */}
      <div className="max-w-screen-lg mx-auto p-6 pt-20">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6">{client.name}</h1>
          <p className="text-gray-700 mb-6">
            This is a preview of how your chatbot will appear on {client.name}'s website.
            The chatbot is fully interactive in this preview.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Chatbot Settings</h2>
              <ul className="space-y-2 text-sm">
                <li><strong>Name:</strong> {client.settings.name}</li>
                <li><strong>Position:</strong> {client.settings.position.replace('-', ' ')}</li>
                <li><strong>Primary Color:</strong> <span className="inline-block w-4 h-4 rounded-full align-middle mr-1" style={{ backgroundColor: client.settings.primaryColor }}></span> {client.settings.primaryColor}</li>
                <li><strong>Welcome Message:</strong> {client.settings.welcomeMessage}</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Training Data</h2>
              {client.trainingData.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {client.trainingData.slice(0, 5).map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                  {client.trainingData.length > 5 && (
                    <li>+ {client.trainingData.length - 5} more items</li>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No training data added yet.</p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-4">Integration Code</h2>
            <p className="mb-4">
              To add this chatbot to your website, navigate to the Integration page 
              and copy the embed code.
            </p>
            <Button 
              onClick={() => navigate(`/dashboard/clients/${client.id}/integration`)}
            >
              <Code className="mr-2 h-4 w-4" /> View Integration Code
            </Button>
          </div>
          
          <div className="text-center text-gray-500 text-sm mt-12">
            <p>👇 Click the chat icon in the bottom corner to interact with the chatbot</p>
          </div>
        </div>
      </div>
      
      {/* Chat toggle button */}
      {!chatOpen && (
        <button
          className={`fixed bottom-4 ${chatbotPosition} z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110`}
          style={{ backgroundColor: client.settings.primaryColor }}
          onClick={() => setChatOpen(true)}
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </button>
      )}
      
      {/* Chatbot window */}
      {chatOpen && (
        <div 
          className={`fixed bottom-4 ${chatbotPosition} z-40 w-80 sm:w-96 rounded-lg shadow-xl overflow-hidden flex flex-col bg-white animate-fade-in`}
          style={{ height: "500px", maxHeight: "calc(100vh - 32px)" }}
        >
          {/* Chat header */}
          <div 
            className="p-3 flex items-center justify-between"
            style={{ backgroundColor: client.settings.primaryColor }}
          >
            <div className="flex items-center">
              {client.settings.logo ? (
                <img src={client.settings.logo} alt="Logo" className="w-6 h-6 mr-2" />
              ) : (
                <Bot className="h-5 w-5 mr-2 text-white" />
              )}
              <span className="font-medium text-white">{client.settings.name}</span>
            </div>
            <button 
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
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
      )}
    </div>
  );
};

export default ChatbotPreview;
