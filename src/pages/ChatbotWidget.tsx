import { useEffect, useState } from "react";

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || '';
}

const ChatbotWidget = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: getQueryParam("welcomeMessage") || "Hello! How can I help you today?",
    },
  ]);
  const [chatOpen, setChatOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Settings from query params
  const clientId = getQueryParam("clientId");
  const primaryColor = getQueryParam("primaryColor") || "#2563eb";
  const secondaryColor = getQueryParam("secondaryColor") || "#ffffff";
  const position = getQueryParam("position") || "bottom-right";
  const chatbotName = getQueryParam("chatbotName") || "Chat Assistant";
  const logo = getQueryParam("logo") || "";
  const placeholderText = getQueryParam("placeholderText") || "Ask me anything...";

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Add user message to the chat
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    setMessages([...messages, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Call the Supabase Edge Function for AI responses
      const response = await fetch('https://rlwmcbdqfusyhhqgwxrz.supabase.co/functions/v1/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          clientId: clientId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply || "I'm sorry, I couldn't process your request at this time.",
        }
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle chat open/closed
  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <div className={`fixed ${position} mb-4 mr-4 z-50`}>
      {/* Chat container */}
      {chatOpen && (
        <div 
          className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
          style={{ width: "350px", height: "500px" }}
        >
          {/* Chat header */}
          <div 
            className="p-3 flex items-center justify-between"
            style={{ backgroundColor: primaryColor, color: secondaryColor }}
          >
            <div className="flex items-center">
              {logo && (
                <img src={logo} alt="Logo" className="w-6 h-6 mr-2 rounded" />
              )}
              <span className="font-medium">{chatbotName}</span>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              ✕
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
                  style={msg.role === 'user' ? { backgroundColor: primaryColor, color: secondaryColor } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg p-3 text-gray-500 flex items-center">
                  <div className="dot-typing"></div>
                  <span className="ml-2">AI is typing...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat input */}
          <div className="p-3 border-t">
            <div className="flex">
              <input
                type="text"
                placeholder={placeholderText}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="px-4 py-2 rounded-r-md text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat toggle button */}
      {!chatOpen && (
        <button
          onClick={toggleChat}
          className="rounded-full shadow-lg p-4 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
      
      {/* CSS for typing animation */}
      <style>
        {`
        .dot-typing {
          position: relative;
          left: -9999px;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          box-shadow: 9984px 0 0 0 #9880ff, 9999px 0 0 0 #9880ff, 10014px 0 0 0 #9880ff;
          animation: dot-typing 1.5s infinite linear;
        }

        @keyframes dot-typing {
          0% {
            box-shadow: 9984px 0 0 0 #9880ff, 9999px 0 0 0 #9880ff, 10014px 0 0 0 #9880ff;
          }
          16.667% {
            box-shadow: 9984px -10px 0 0 #9880ff, 9999px 0 0 0 #9880ff, 10014px 0 0 0 #9880ff;
          }
          33.333% {
            box-shadow: 9984px 0 0 0 #9880ff, 9999px 0 0 0 #9880ff, 10014px 0 0 0 #9880ff;
          }
          50% {
            box-shadow: 9984px 0 0 0 #9880ff, 9999px -10px 0 0 #9880ff, 10014px 0 0 0 #9880ff;
          }
          66.667% {
            box-shadow: 9984px 0 0 0 #9880ff, 9999px 0 0 0 #9880ff, 10014px 0 0 0 #9880ff;
          }
          83.333% {
            box-shadow: 9984px 0 0 0 #9880ff, 9999px 0 0 0 #9880ff, 10014px -10px 0 0 0 #9880ff;
          }
          100% {
            box-shadow: 9984px 0 0 0 #9880ff, 9999px 0 0 0 #9880ff, 10014px 0 0 0 #9880ff;
          }
        }
        `}
      </style>
    </div>
  );
};

export default ChatbotWidget; 