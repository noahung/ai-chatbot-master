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

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: message },
      { id: Date.now().toString() + "a", role: "assistant", content: "(AI response placeholder)" },
    ]);
    setMessage("");
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
          />
          <button
            onClick={handleSend}
            style={{ marginLeft: 8, background: primaryColor, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
          >
            Send
          </button>
        </div>
      </div>
    )
  );
};

export default ChatbotWidget; 