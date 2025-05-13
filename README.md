# AI Chatbot Widget

A customizable, embeddable AI chatbot widget for your website. This project provides a simple way to add an AI-powered chatbot to any website with minimal code.

## Features

- 🎨 **Customizable**: Change colors, position, and messaging to match your brand
- 📱 **Responsive**: Works well on desktop, tablet, and mobile devices
- 🔌 **Easy Integration**: Just add a single script tag to your website
- 🤖 **AI-Powered**: Connect to OpenAI's API for intelligent responses
- 🔒 **Secure**: Your API key stays on your site, not stored on our servers
- 🌐 **Self-hostable**: Host the widget on your own server or use our CDN

## Quick Start

Add this code to your website before the closing `</body>` tag:

```html
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://noahung.github.io/ai-chatbot-master/public/embed.js';
    script.async = true;
    script.dataset.clientId = 'YOUR_CLIENT_ID';
    script.dataset.primaryColor = '#2563eb';
    script.dataset.secondaryColor = '#ffffff';
    script.dataset.position = 'bottom-right';
    script.dataset.welcomeMessage = "Hello! How can I help you today?";
    script.dataset.placeholderText = "Ask me anything...";
    script.dataset.chatbotName = "AI Assistant";
    script.dataset.apiKey = 'YOUR_OPENAI_API_KEY';
    script.dataset.model = 'gpt-3.5-turbo';
    document.head.appendChild(script);
  })();
</script>
```

## Configuration Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `clientId` | Your unique client identifier | Required |
| `primaryColor` | Main color for the chatbot (hex code) | `#2563eb` |
| `secondaryColor` | Background color for the chat window | `#ffffff` |
| `position` | Where the chatbot appears (bottom-right, bottom-left, top-right, top-left) | `bottom-right` |
| `welcomeMessage` | Initial message shown to users | `Hello! How can I help you today?` |
| `placeholderText` | Text shown in the input field | `Ask me anything...` |
| `chatbotName` | Name displayed in the chatbot header | `AI Assistant` |
| `apiKey` | Your OpenAI API key | Required for AI responses |
| `model` | The OpenAI model to use | `gpt-3.5-turbo` |

## Deployment Options

### 1. GitHub Pages (Recommended)

1. Fork this repository
2. Enable GitHub Pages in your repository settings
3. Update the script URL in your embed code to point to your GitHub Pages URL

### 2. Self-hosted

1. Download the `embed.js` file
2. Host it on your own server
3. Update the script URL in your embed code to point to your server

### 3. Use Supabase Storage

1. Upload the `embed.js` file to your Supabase storage bucket
2. Make the bucket public
3. Use the Supabase storage URL in your embed code

## Advanced Usage

### Custom Styling

You can further customize the appearance by modifying the CSS variables in the embed.js file.

### Training Data

To provide your chatbot with specific knowledge:

1. Create a client in your database
2. Add training data associated with that client
3. Use the client ID in your embed code

## Development

### Prerequisites

- Node.js 14+

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open `test-chatbot.html` in your browser

### Building for Production

```bash
npm run build
```

## License

MIT License - feel free to use this in your projects!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
