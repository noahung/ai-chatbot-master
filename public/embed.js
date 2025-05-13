(function() {
  // Get script tag that loaded this file
  var scriptTag = document.currentScript;
  var clientId = scriptTag.dataset.clientId;
  var primaryColor = scriptTag.dataset.primaryColor || '#2563eb';
  var secondaryColor = scriptTag.dataset.secondaryColor || '#ffffff';
  var position = scriptTag.dataset.position || 'bottom-right';
  var welcomeMessage = scriptTag.dataset.welcomeMessage || '';
  var placeholderText = scriptTag.dataset.placeholderText || '';
  var chatbotName = scriptTag.dataset.chatbotName || '';
  var logo = scriptTag.dataset.logo || '';

  // Build query string for iframe
  var params = new URLSearchParams({
    clientId: clientId || '',
    primaryColor,
    secondaryColor,
    position,
    welcomeMessage,
    placeholderText,
    chatbotName,
    logo
  });

  // Dynamic base URL for local/prod
  var baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5173'
    : 'https://website-whisper-ai-builder.lovable.app';

  // Create the iframe
  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/chatbot?' + params.toString();
  iframe.style.position = 'fixed';
  iframe.style.zIndex = '999999';
  iframe.style.border = 'none';
  iframe.style.width = '400px';
  iframe.style.height = '600px';
  iframe.style.background = 'transparent';
  iframe.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  iframe.style.borderRadius = '16px';

  // Positioning
  if (position === 'bottom-right') {
    iframe.style.bottom = '24px';
    iframe.style.right = '24px';
  } else if (position === 'bottom-left') {
    iframe.style.bottom = '24px';
    iframe.style.left = '24px';
  } else if (position === 'top-right') {
    iframe.style.top = '24px';
    iframe.style.right = '24px';
  } else if (position === 'top-left') {
    iframe.style.top = '24px';
    iframe.style.left = '24px';
  }

  // Append to body
  document.body.appendChild(iframe);
})(); 