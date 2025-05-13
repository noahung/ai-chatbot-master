import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatbot, ChatbotSettings } from "@/context/ChatbotContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ArrowLeft, 
  Bot, 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  FileCode, 
  ShoppingCart 
} from "lucide-react";
import { toast } from "sonner";

const Integration = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient } = useChatbot();
  
  const client = getClient(id || "");
  const [productId, setProductId] = useState("product-123");
  const [productName, setProductName] = useState("Example Product");
  const [copied, setCopied] = useState(false);
  const [copiedProduct, setCopiedProduct] = useState(false);
  
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-3xl font-bold mb-2">Client Not Found</h1>
        <p className="text-gray-500 mb-4">The client you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/dashboard/clients")}>
          Back to Clients
        </Button>
      </div>
    );
  }

  // Generate the embed code based on client settings
  const generateEmbedCode = () => {
    // Create a settings object with defaults for undefined values
    const settings: Partial<ChatbotSettings> = client.settings || {};
    const primaryColor = settings.primaryColor || '#2563eb';
    const secondaryColor = settings.secondaryColor || '#ffffff';
    const position = settings.position || 'bottom-right';
    const welcomeMessage = settings.welcomeMessage || 'Hello! How can I help you today?';
    const placeholderText = settings.placeholderText || 'Ask me anything...';
    const chatbotName = settings.name || 'AI Assistant';
    const logo = settings.logo || '';
    const apiKey = client.apiKey || '';

    const scriptCode = `<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://noahung.github.io/ai-chatbot-master/embed.js';
    script.async = true;
    script.dataset.clientId = '${client.id}';
    script.dataset.primaryColor = '${primaryColor}';
    script.dataset.secondaryColor = '${secondaryColor}';
    script.dataset.position = '${position}';
    script.dataset.welcomeMessage = "${welcomeMessage.replace(/"/g, '&quot;')}";
    script.dataset.placeholderText = "${placeholderText.replace(/"/g, '&quot;')}";
    script.dataset.chatbotName = "${chatbotName.replace(/"/g, '&quot;')}";
    script.dataset.logo = '${logo}';
    script.dataset.apiKey = '${apiKey}';
    document.head.appendChild(script);
  })();
</script>`;

    return scriptCode;
  };

  // Generate the product-specific code
  const generateProductCode = () => {
    // Create a settings object with defaults for undefined values
    const settings: Partial<ChatbotSettings> = client.settings || {};
    const primaryColor = settings.primaryColor || '#2563eb';

    const buttonCode = `<button 
  class="chatflow-product-button" 
  data-client-id="${client.id}" 
  data-product-id="${productId}" 
  data-product-name="${productName}"
  style="background-color: ${primaryColor}; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <path d="M12 17h.01"/>
  </svg>
  Ask about this product
</button>`;

    return buttonCode;
  };

  const handleCopy = (code: string, type: 'main' | 'product') => {
    navigator.clipboard.writeText(code).then(() => {
      if (type === 'main') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopiedProduct(true);
        setTimeout(() => setCopiedProduct(false), 2000);
      }
      
      toast.success("Code copied to clipboard!", {
        description: "You can now paste it into your website."
      });
    });
  };

  const embedCode = generateEmbedCode();
  const productCode = generateProductCode();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integration</h1>
          <p className="text-gray-500">Add the chatbot to {client.name}'s website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/clients/${client.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Client
          </Button>
          <Button variant="outline" onClick={() => navigate(`/preview/${client.id}`)}>
            <Bot className="mr-2 h-4 w-4" /> Preview Chatbot
          </Button>
        </div>
      </div>

      <Tabs defaultValue="embed">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="embed" className="flex-1">
            <FileCode className="mr-2 h-4 w-4" /> Embed Code
          </TabsTrigger>
          <TabsTrigger value="product" className="flex-1">
            <ShoppingCart className="mr-2 h-4 w-4" /> Product-Specific Code
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="embed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Embed Code</CardTitle>
              <CardDescription>
                Add this code to your website to embed the chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-900 text-gray-100 rounded-md overflow-x-auto">
                <div className="flex items-start">
                  <pre className="text-sm whitespace-pre-wrap mb-0">{embedCode}</pre>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500">
                Add this code before the closing <code>&lt;/body&gt;</code> tag of your website.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCopy(embedCode, 'main')}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copy Code
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Installation Instructions</CardTitle>
              <CardDescription>
                Follow these steps to add the chatbot to your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Copy the embed code</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Click the "Copy Code" button above to copy the embed code to your clipboard.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Add the code to your website</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Paste the code into your website's HTML, just before the closing <code>&lt;/body&gt;</code> tag.
                      This will add the chatbot to every page on your website.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Test the integration</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Visit your website and look for the chatbot icon in the selected position (bottom-right or bottom-left).
                      Click it to verify that the chatbot opens correctly.
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="font-medium text-blue-800 flex items-center mb-2">
                    <Code className="h-4 w-4 mr-2" /> Need developer help?
                  </h3>
                  <p className="text-sm text-blue-700">
                    If you're not comfortable editing HTML, share these instructions with your web developer 
                    for assistance with the integration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="product" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product-Specific Chat Button</CardTitle>
              <CardDescription>
                Generate a button to add to specific product pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-id">Product ID</Label>
                  <Input
                    id="product-id"
                    placeholder="e.g., prod-123"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This should be a unique identifier for the product
                  </p>
                </div>
                <div>
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    placeholder="e.g., Wireless Headphones"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will help the AI identify which product to discuss
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="p-4 bg-gray-900 text-gray-100 rounded-md overflow-x-auto">
                  <div className="flex items-start">
                    <pre className="text-sm whitespace-pre-wrap mb-0">{productCode}</pre>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-sm font-medium">Preview:</p>
                  <div className="mt-2" dangerouslySetInnerHTML={{ __html: productCode }} />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCopy(productCode, 'product')}
                >
                  {copiedProduct ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> Copy Code
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How Product-Specific Buttons Work</CardTitle>
              <CardDescription>
                Learn how to use product buttons for a better customer experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-sm text-gray-600">
                  Product-specific buttons allow your customers to ask questions about a particular product.
                  When clicked, the chatbot will open with context about the specific product, providing
                  more relevant answers.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Generate the button code</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the product ID and name, then copy the generated code.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Add the button to product pages</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Paste the button code on each product page, updating the product ID and name for each product.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Use the main embed code</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Make sure you've also added the main embed code to your website from the "Embed Code" tab.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <h3 className="font-medium text-amber-800 flex items-center mb-2">
                    <Terminal className="h-4 w-4 mr-2" /> Pro Tip
                  </h3>
                  <p className="text-sm text-amber-700">
                    For e-commerce platforms like Shopify or WooCommerce, you can use their product template
                    system to automatically include the correct product ID and name for each product page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integration;
