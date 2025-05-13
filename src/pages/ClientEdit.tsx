import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatbot } from "@/context/ChatbotContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { availableModels } from "@/types/models";
import { toast } from "sonner";

const ClientEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, updateClient } = useChatbot();
  
  const client = getClient(id || "");
  
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  
  useEffect(() => {
    if (client) {
      setName(client.name);
      setWebsite(client.website);
      setModel(client.model);
      setApiKey(client.apiKey || "");
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

  const handleSave = async () => {
    if (id) {
      await updateClient(id, {
        name,
        website,
        model,
        apiKey,
      });
      
      toast.success("Client information updated successfully", {
        description: "Your changes have been saved.",
      });
      
      navigate(`/dashboard/clients/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate(`/dashboard/clients/${id}`)} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Client</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>Update the basic details for this client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter client name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((modelOption) => (
                  <SelectItem key={modelOption.id} value={modelOption.value}>
                    {modelOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="apiKey">OpenAI API Key (Optional)</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              type="password"
            />
            <p className="text-sm text-gray-500">
              If provided, this key will be used for this client's AI responses.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(`/dashboard/clients/${id}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClientEdit; 