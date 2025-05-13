
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatbot } from "@/context/ChatbotContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { CircleDot, Bot, FileUp, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ChatbotSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, updateChatbotSettings } = useChatbot();
  
  const client = getClient(id || "");
  
  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [logo, setLogo] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (client) {
      setName(client.settings.name);
      setPrimaryColor(client.settings.primaryColor);
      setSecondaryColor(client.settings.secondaryColor);
      setWelcomeMessage(client.settings.welcomeMessage);
      setPlaceholderText(client.settings.placeholderText);
      setPosition(client.settings.position);
      setLogo(client.settings.logo);
    }
  }, [client]);
  
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

  const handleSave = () => {
    if (id) {
      updateChatbotSettings(id, {
        name,
        primaryColor,
        secondaryColor,
        welcomeMessage,
        placeholderText,
        position,
        logo
      });
      
      toast.success("Chatbot settings updated successfully", {
        description: "Your changes have been saved and will be reflected in the chatbot.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chatbot Settings</h1>
          <p className="text-gray-500">Customize the appearance and behavior of {client.name}'s chatbot</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/clients/${client.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Client
          </Button>
          <Button variant="outline" onClick={() => navigate(`/preview/${client.id}`)}>
            <Bot className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
              <CardDescription>
                Configure the general settings for your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="chatbot-name">Chatbot Name</Label>
                <Input
                  id="chatbot-name"
                  placeholder="E.g., Support Assistant, Product Expert"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  placeholder="Hello! How can I help you today?"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500">
                  This message will be shown when the chatbot is first opened.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="placeholder">Input Placeholder</Label>
                <Input
                  id="placeholder"
                  placeholder="Ask me anything..."
                  value={placeholderText}
                  onChange={(e) => setPlaceholderText(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  This text will appear in the input field as a placeholder.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how your chatbot looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-3">
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: primaryColor }}
                      ></div>
                      <Input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Used for the chatbot header and buttons.
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-3">
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: secondaryColor }}
                      ></div>
                      <Input
                        id="secondary-color"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Used for the chatbot background and text.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Position</Label>
                    <RadioGroup 
                      value={position} 
                      onValueChange={(value) => setPosition(value as "bottom-right" | "bottom-left")}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem 
                          value="bottom-right" 
                          id="bottom-right" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="bottom-right"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="w-full h-24 bg-gray-100 rounded-md relative">
                            <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <span className="mt-2 text-sm font-normal">Bottom Right</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem 
                          value="bottom-left" 
                          id="bottom-left" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="bottom-left"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="w-full h-24 bg-gray-100 rounded-md relative">
                            <div className="absolute bottom-2 left-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <span className="mt-2 text-sm font-normal">Bottom Left</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid gap-2 mt-6">
                    <Label htmlFor="logo">Logo (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-6 flex flex-col items-center justify-center">
                      <FileUp className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Drag and drop an image, or click to browse
                      </p>
                      <Button variant="outline" size="sm">
                        Select Image
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Recommended size: 64x64px. Will be displayed in the chatbot header.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how your chatbot will look
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-md overflow-hidden max-w-[320px] mx-auto">
                  <div 
                    className="p-3 flex items-center" 
                    style={{ backgroundColor: primaryColor }}
                  >
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-6 h-6 mr-2" />
                    ) : (
                      <Bot className="h-5 w-5 mr-2 text-white" />
                    )}
                    <span className="font-medium text-white">{name || "Chat Assistant"}</span>
                  </div>
                  
                  <div 
                    className="h-[300px] p-3 flex flex-col"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    <div className="flex-1 overflow-y-auto">
                      <div className="mb-3 max-w-[80%]">
                        <div className="bg-gray-200 rounded-lg p-2 text-sm inline-block">
                          {welcomeMessage || "Hello! How can I help you today?"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <input 
                          type="text" 
                          className="flex-1 p-2 text-sm outline-none bg-white"
                          placeholder={placeholderText || "Ask me anything..."}
                          readOnly
                        />
                        <button
                          className="p-2"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <ArrowRight className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-4">
                <Button onClick={() => navigate(`/preview/${client.id}`)}>
                  Open Full Preview
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  After configuring settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0">
                      1
                    </div>
                    <p className="text-sm">
                      Review the changes in the preview
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0">
                      2
                    </div>
                    <p className="text-sm">
                      Save your settings
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0">
                      3
                    </div>
                    <p className="text-sm">
                      Generate integration code to add the chatbot to your website
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/dashboard/clients/${client.id}/integration`)}
                >
                  <ArrowRight className="mr-2 h-4 w-4" /> Go to Integration
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotSettings;
