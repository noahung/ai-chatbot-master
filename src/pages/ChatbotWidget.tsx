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
  const placeholderText = getQueryParam("placeholderText") || "Ask me anything...";
  const chatbotName = getQueryParam("chatbotName") || "Chat Assistant";
  const logo = getQueryParam("logo");

  // Positioning logic
  let positionStyles = {};
  if (position === "bottom-right") {
    positionStyles = { bottom: 24, right: 24 };
  } else if (position === "bottom-left") {
    positionStyles = { bottom: 24, left: 24 };
  } else if (position === "top-right") {
    positionStyles = { top: 24, right: 24 };
  } else if (position === "top-left") {
    positionStyles = { top: 24, left: 24 };
  }

  const widgetStyles = {
    position: "fixed" as const,
    zIndex: 999999,
    width: 360,
    height: 520,
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
    overflow: "hidden" as const,
    border: "none",
    background: secondaryColor,
    ...positionStyles,
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    // Add user message
    const userMsg = message;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMsg },
    ]);
    setMessage("");
    setIsLoading(true);
    
    try {
      // Call the Supabase Edge Function
      const response = await fetch('https://rlwmcbdqfusyhhqgwxrz.supabase.co/functions/v1/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg,
          clientId: clientId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "a", role: "assistant", content: data.reply }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "a", role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    chatOpen && (
      <div style={widgetStyles}>
        {/* Header */}
        <div style={{ background: primaryColor, color: '#fff', padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {logo ? (
            <img src={logo} alt="Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <span style={{ fontWeight: 700, fontSize: 20 }}>💬</span>
          )}
          <span style={{ fontWeight: 600, fontSize: 16 }}>{chatbotName}</span>
        </div>
        {/* Messages */}
        <div style={{ flex: 1, background: secondaryColor, padding: 12, height: 370, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg, i) => (
            <div key={msg.id} style={{ marginBottom: 8, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                background: msg.role === 'user' ? primaryColor : '#f1f5f9',
                color: msg.role === 'user' ? '#fff' : '#222',
                borderRadius: 12,
                padding: '8px 14px',
                maxWidth: 260,
                fontSize: 14,
                boxShadow: msg.role === 'user' ? '0 1px 4px rgba(0,0,0,0.08)' : undefined,
              }}>{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div style={{ marginBottom: 8, alignSelf: 'flex-start' }}>
              <div style={{
                background: '#f1f5f9',
                color: '#222',
                borderRadius: 12,
                padding: '8px 14px',
                maxWidth: 260,
                fontSize: 14,
                display: 'flex',
                gap: 4,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: primaryColor, animation: 'pulse 1s infinite' }}></span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: primaryColor, animation: 'pulse 1s infinite', animationDelay: '0.3s' }}></span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: primaryColor, animation: 'pulse 1s infinite', animationDelay: '0.6s' }}></span>
              </div>
            </div>
          )}
        </div>
        {/* Input */}
        <div style={{ display: 'flex', borderTop: '1px solid #eee', background: '#fff', padding: 8 }}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={placeholderText}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, padding: 8, borderRadius: 8, background: '#f9f9f9' }}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            style={{ 
              marginLeft: 8, 
              background: primaryColor, 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '8px 16px', 
              fontWeight: 600, 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.4; }
              50% { opacity: 1; }
              100% { opacity: 0.4; }
            }
          `}
        </style>
      </div>
    )
  );
};

export default ChatbotWidget; 