(function() {
  // Get script tag that loaded this file
  var scriptTag = document.currentScript;
  var clientId = scriptTag.dataset.clientId;
  var primaryColor = scriptTag.dataset.primaryColor || '#2563eb';
  var secondaryColor = scriptTag.dataset.secondaryColor || '#ffffff';
  var position = scriptTag.dataset.position || 'bottom-right';
  var welcomeMessage = scriptTag.dataset.welcomeMessage || 'Hello! How can I help you today?';
  var placeholderText = scriptTag.dataset.placeholderText || 'Ask me anything...';
  var chatbotName = scriptTag.dataset.chatbotName || 'Chat Assistant';
  var logo = scriptTag.dataset.logo || '';
  var apiKey = scriptTag.dataset.apiKey || '';
  var openAiModel = scriptTag.dataset.model || 'gpt-3.5-turbo';

  // Client-specific training data
  var clientTrainingData = null;
  var clientName = chatbotName;

  // Supabase configuration
  var supabaseUrl = 'https://rlwmcbdqfusyhhqgwxrz.supabase.co';
  var supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsd21jYmRxZnVzeWhocWd3eHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzAzMzMsImV4cCI6MjA2MjcwNjMzM30.96HbYy6EfaY2snPjvcO6hT2E-pVCFOvSz5anC3GYVQ8';

  // Session storage keys
  const CHAT_MESSAGES_KEY = 'ai_chatbot_messages';
  const CHAT_VISIBILITY_KEY = 'ai_chatbot_visibility';

  // Fetch client training data
  async function fetchClientData() {
    if (!clientId) return;
    
    try {
      const clientResponse = await fetch(`${supabaseUrl}/rest/v1/clients?id=eq.${clientId}&select=id,name`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!clientResponse.ok) {
        console.error('Failed to fetch client data');
        return;
      }
      
      const clientData = await clientResponse.json();
      if (clientData && clientData.length > 0) {
        clientName = clientData[0].name;
      }
      
      const trainingResponse = await fetch(`${supabaseUrl}/rest/v1/training_data?client_id=eq.${clientId}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!trainingResponse.ok) {
        console.error('Failed to fetch training data');
        return;
      }
      
      const trainingData = await trainingResponse.json();
      if (trainingData && trainingData.length > 0) {
        clientTrainingData = trainingData;
        console.log(`Loaded ${trainingData.length} training items for client ${clientName}`);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    }
  }

  // Create chat container
  var chatContainer = document.createElement('div');
  chatContainer.id = 'ai-chatbot-container';
  chatContainer.style.position = 'fixed';
  chatContainer.style.zIndex = '999999';
  chatContainer.style.width = '360px';
  chatContainer.style.height = '520px';
  chatContainer.style.borderRadius = '16px';
  chatContainer.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  chatContainer.style.overflow = 'hidden';
  chatContainer.style.border = 'none';
  chatContainer.style.background = secondaryColor;
  chatContainer.style.flexDirection = 'column';

  // Positioning
  if (position === 'bottom-right') {
    chatContainer.style.bottom = '24px';
    chatContainer.style.right = '24px';
  } else if (position === 'bottom-left') {
    chatContainer.style.bottom = '24px';
    chatContainer.style.left = '24px';
  } else if (position === 'top-right') {
    chatContainer.style.top = '24px';
    chatContainer.style.right = '24px';
  } else if (position === 'top-left') {
    chatContainer.style.top = '24px';
    chatContainer.style.left = '24px';
  }

  // Create toggle button
  var toggleButton = document.createElement('button');
  toggleButton.id = 'ai-chatbot-toggle';
  toggleButton.style.position = 'fixed';
  toggleButton.style.zIndex = '999998';
  toggleButton.style.width = '56px';
  toggleButton.style.height = '56px';
  toggleButton.style.borderRadius = '50%';
  toggleButton.style.backgroundColor = primaryColor;
  toggleButton.style.color = '#fff';
  toggleButton.style.border = 'none';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toggleButton.style.alignItems = 'center';
  toggleButton.style.justifyContent = 'center';
  toggleButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

  // Positioning for toggle button
  if (position === 'bottom-right') {
    toggleButton.style.bottom = '24px';
    toggleButton.style.right = '24px';
  } else if (position === 'bottom-left') {
    toggleButton.style.bottom = '24px';
    toggleButton.style.left = '24px';
  } else if (position === 'top-right') {
    toggleButton.style.top = '24px';
    toggleButton.style.right = '24px';
  } else if (position === 'top-left') {
    toggleButton.style.top = '24px';
    toggleButton.style.left = '24px';
  }

  // Build chat UI
  chatContainer.innerHTML = `
    <div style="background: ${primaryColor}; color: #fff; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 8px;">
        ${logo ? `<img src="${logo}" alt="Logo" style="width: 28px; height: 28px; border-radius: 6px; object-fit: cover;">` : '<span style="font-weight: 700; font-size: 20px;">💬</span>'}
        <span style="font-weight: 600; font-size: 16px;">${chatbotName}</span>
      </div>
      <button id="ai-chatbot-close" style="background: none; border: none; color: #fff; cursor: pointer; padding: 4px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="ai-chatbot-messages" style="flex: 1; padding: 12px; height: 370px; overflow-y: auto; display: flex; flex-direction: column;"></div>
    <div style="display: flex; border-top: 1px solid #eee; background: #fff; padding: 8px;">
      <input 
        id="ai-chatbot-input" 
        type="text" 
        placeholder="${placeholderText}" 
        style="flex: 1; border: none; outline: none; font-size: 14px; padding: 8px; border-radius: 8px; background: #f9f9f9;"
      >
      <button 
        id="ai-chatbot-send" 
        style="margin-left: 8px; background: ${primaryColor}; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-weight: 600; cursor: pointer;"
      >
        Send
      </button>
    </div>
  `;

  // Add to body
  document.body.appendChild(toggleButton);
  document.body.appendChild(chatContainer);

  // Add styles
  var style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { opacity: 0.4; }
      50% { opacity: 1; }
      100% { opacity: 0.4; }
    }
    .ai-chatbot-loading {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ai-chatbot-loading-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${primaryColor};
      animation: pulse 1s infinite;
    }
    .ai-chatbot-loading-dot:nth-child(2) {
      animation-delay: 0.3s;
    }
    .ai-chatbot-loading-dot:nth-child(3) {
      animation-delay: 0.6s;
    }
  `;
  document.head.appendChild(style);

  // Initialize messages from sessionStorage or with welcome message
  var messages = JSON.parse(sessionStorage.getItem(CHAT_MESSAGES_KEY)) || [
    {
      role: "assistant",
      content: welcomeMessage
    }
  ];

  // Initialize chat with stored or default messages
  function initChat() {
    var messagesContainer = document.getElementById('ai-chatbot-messages');
    messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
      var messageDiv = document.createElement('div');
      messageDiv.style.marginBottom = '8px';
      messageDiv.style.alignSelf = message.role === 'user' ? 'flex-end' : 'flex-start';
      messageDiv.innerHTML = `
        <div style="
          background: ${message.role === 'user' ? primaryColor : '#f1f5f9'}; 
          color: ${message.role === 'user' ? '#fff' : '#222'}; 
          border-radius: 12px; 
          padding: 8px 14px; 
          max-width: 260px; 
          font-size: 14px;
          box-shadow: ${message.role === 'user' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};
        ">
          ${message.content}
        </div>
      `;
      messagesContainer.appendChild(messageDiv);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    var isVisible = sessionStorage.getItem(CHAT_VISIBILITY_KEY) !== 'false';
    chatContainer.style.display = isVisible ? 'flex' : 'none';
    toggleButton.style.display = isVisible ? 'none' : 'flex';
    
    fetchClientData();
  }

  // Add message to chat and save to sessionStorage
  function addMessage(role, content) {
    var messagesContainer = document.getElementById('ai-chatbot-messages');
    var messageDiv = document.createElement('div');
    messageDiv.style.marginBottom = '8px';
    messageDiv.style.alignSelf = role === 'user' ? 'flex-end' : 'flex-start';
    
    messageDiv.innerHTML = `
      <div style="
        background: ${role === 'user' ? primaryColor : '#f1f5f9'}; 
        color: ${role === 'user' ? '#fff' : '#222'}; 
        border-radius: 12px; 
        padding: 8px 14px; 
        max-width: 260px; 
        font-size: 14px;
        box-shadow: ${role === 'user' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};
      ">
        ${content}
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    messages.push({ role, content });
    sessionStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  }

  // Show loading indicator
  function showLoading() {
    var messagesContainer = document.getElementById('ai-chatbot-messages');
    var loadingDiv = document.createElement('div');
    loadingDiv.id = 'ai-chatbot-loading';
    loadingDiv.style.marginBottom = '8px';
    loadingDiv.style.alignSelf = 'flex-start';
    
    loadingDiv.innerHTML = `
      <div style="background: #f1f5f9; color: #222; border-radius: 12px; padding: 8px 14px; max-width: 260px; font-size: 14px;">
        <div class="ai-chatbot-loading">
          <div class="ai-chatbot-loading-dot"></div>
          <div class="ai-chatbot-loading-dot"></div>
          <div class="ai-chatbot-loading-dot"></div>
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide loading indicator
  function hideLoading() {
    var loadingDiv = document.getElementById('ai-chatbot-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  // Send message to OpenAI or Supabase Edge Function
  async function sendMessage(message) {
    if (!message.trim()) return;

    addMessage('user', message);
    showLoading();

    try {
      if (apiKey) {
        // Use OpenAI API directly if API key is present
        const systemPrompt = `You are a helpful assistant for ${clientName}.`;
        const messageHistory = [
          { role: "system", content: systemPrompt },
          ...messages.filter(m => m.role !== "system")
        ];
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: messageHistory,
            max_tokens: 500
          })
        });
        if (!response.ok) {
          const errorData = await response.text();
          console.error("OpenAI API error:", errorData);
          throw new Error(`OpenAI API error: ${response.status}`);
        }
        const data = await response.json();
        const reply = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
        hideLoading();
        addMessage('assistant', reply);
      } else {
        // Use Supabase Edge Function for retrieval-augmented chat
        try {
          const response = await fetch('https://rlwmcbdqfusyhhqgwxrz.supabase.co/functions/v1/ai-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey
            },
            body: JSON.stringify({
              message: message,
              clientId: clientId
            })
          });
          if (!response.ok) {
            throw new Error('Edge function error');
          }
          const data = await response.json();
          hideLoading();
          addMessage('assistant', data.reply || 'Sorry, I could not find an answer in our knowledge base.');
        } catch (edgeFunctionError) {
          console.error('Edge function error:', edgeFunctionError);
          setTimeout(() => {
            hideLoading();
            addMessage('assistant', "I'm sorry, but I need an API key to provide intelligent responses. Please configure the chatbot with a valid OpenAI API key.");
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      hideLoading();
      addMessage('assistant', "Sorry, I'm having trouble connecting right now. Please try again later.");
    }
  }

  // Initialize chat
  initChat();
  
  // Set up event listeners
  document.getElementById('ai-chatbot-toggle').addEventListener('click', function() {
    var chatContainer = document.getElementById('ai-chatbot-container');
    chatContainer.style.display = 'flex';
    this.style.display = 'none';
    sessionStorage.setItem(CHAT_VISIBILITY_KEY, 'true');
  });
  
  document.getElementById('ai-chatbot-close').addEventListener('click', function() {
    document.getElementById('ai-chatbot-container').style.display = 'none';
    document.getElementById('ai-chatbot-toggle').style.display = 'flex';
    sessionStorage.setItem(CHAT_VISIBILITY_KEY, 'false');
  });
  
  document.getElementById('ai-chatbot-send').addEventListener('click', function() {
    var input = document.getElementById('ai-chatbot-input');
    var message = input.value;
    
    if (message.trim()) {
      sendMessage(message);
      input.value = '';
    }
  });
  
  document.getElementById('ai-chatbot-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var message = this.value;
      
      if (message.trim()) {
        sendMessage(message);
        this.value = '';
      }
    }
  });
})();