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
import { FileText, Settings, Code, Bot, Globe, BrainCircuit, Check, ArrowLeft, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import ChatbotPreview from "@/components/ChatbotPreview";

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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard/clients")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{client.name}</h1>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preview">Chatbot Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Basic details about this client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {client.name}
                </div>
                <div>
                  <span className="font-medium">Website:</span> <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                    {client.website} <Globe className="h-3 w-3 ml-1" />
                  </a>
                </div>
                <div>
                  <span className="font-medium">AI Model:</span> {client.model}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {client.createdAt.toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => navigate(`/dashboard/clients/${client.id}/edit`)}>
                  Edit Client
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Configuration</CardTitle>
                <CardDescription>Settings for the client's AI chatbot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Chatbot Name:</span> {client.settings.name}
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Primary Color:</span> 
                  <div className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: client.settings.primaryColor }}></div>
                  {client.settings.primaryColor}
                </div>
                <div>
                  <span className="font-medium">Position:</span> {client.settings.position.replace('-', ' ')}
                </div>
                <div>
                  <span className="font-medium">Welcome Message:</span> {client.settings.welcomeMessage}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => navigate(`/dashboard/clients/${client.id}/settings`)}>
                  <Settings className="mr-2 h-4 w-4" /> Customize Chatbot
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Data</CardTitle>
                <CardDescription>Knowledge sources for the AI</CardDescription>
              </CardHeader>
              <CardContent>
                {client.trainingData.length > 0 ? (
                  <div className="space-y-2">
                    {client.trainingData.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center p-2 border rounded-md">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{item.name}</span>
                      </div>
                    ))}
                    {client.trainingData.length > 5 && (
                      <div className="text-sm text-gray-500 mt-2">
                        + {client.trainingData.length - 5} more items
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No training data added yet</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate(`/dashboard/clients/${client.id}/training`)}>
                  Manage Training Data
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Integration</CardTitle>
                <CardDescription>Add the chatbot to your website</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Get the code snippet to add this chatbot to your website
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Button onClick={() => navigate(`/dashboard/clients/${client.id}/integration`)}>
                  View Integration Code
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Preview</CardTitle>
              <CardDescription>
                This is how your chatbot will appear to users. Try asking it questions!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <ChatbotPreview client={client} className="w-full max-w-md" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
