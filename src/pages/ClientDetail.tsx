
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatbot } from "@/context/ChatbotContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { availableModels } from "@/types/models";
import { FileText, Settings, Code, Bot, Globe, BrainCircuit, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, updateClient } = useChatbot();
  
  const client = getClient(id || "");
  
  const [name, setName] = useState(client?.name || "");
  const [website, setWebsite] = useState(client?.website || "");
  const [model, setModel] = useState(client?.model || "gpt-4o");
  const [apiKey, setApiKey] = useState(client?.apiKey || "");
  
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
      updateClient(id, {
        name,
        website,
        model,
        apiKey,
      });
      
      toast.success("Client information updated successfully", {
        description: "Your changes have been saved.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-gray-500">{client.website}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/preview/${client.id}`)}>
            <Bot className="mr-2 h-4 w-4" /> Preview Chatbot
          </Button>
          <Button onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>
                Basic information about your client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  placeholder="Acme Corporation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>
                Configure the AI model and API key for this client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.value}>
                        {model.name} - {model.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apiKey">OpenAI API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  If provided, this key will be used instead of the default one. 
                  Make sure it has access to the selected model.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your client's chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" 
                onClick={() => navigate(`/dashboard/clients/${client.id}/training`)}>
                <FileText className="mr-2 h-4 w-4" />
                Training Data
              </Button>
              <Button variant="outline" className="w-full justify-start"
                onClick={() => navigate(`/dashboard/clients/${client.id}/settings`)}>
                <Settings className="mr-2 h-4 w-4" />
                Chatbot Settings
              </Button>
              <Button variant="outline" className="w-full justify-start"
                onClick={() => navigate(`/dashboard/clients/${client.id}/integration`)}>
                <Code className="mr-2 h-4 w-4" />
                Integration
              </Button>
              <Button variant="outline" className="w-full justify-start"
                onClick={() => navigate(`/preview/${client.id}`)}>
                <Bot className="mr-2 h-4 w-4" />
                Preview Chatbot
              </Button>
              <Button variant="outline" className="w-full justify-start"
                onClick={() => window.open(client.website, '_blank')}>
                <Globe className="mr-2 h-4 w-4" />
                Visit Website
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Chatbot Status</CardTitle>
              <CardDescription>
                Overview of your chatbot setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Training Data</span>
                  </div>
                  <Badge variant={client.trainingData.length > 0 ? "success" : "secondary"}>
                    {client.trainingData.length} items
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Chatbot Configured</span>
                  </div>
                  <Badge variant={client.settings ? "success" : "secondary"}>
                    {client.settings ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <BrainCircuit className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">AI Model</span>
                  </div>
                  <Badge variant="outline">
                    {availableModels.find(m => m.value === client.model)?.name || client.model}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Code className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Integration Status</span>
                  </div>
                  <Badge variant="secondary">
                    Not Deployed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
