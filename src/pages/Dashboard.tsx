
import { useNavigate } from "react-router-dom";
import { useChatbot } from "@/context/ChatbotContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { availableModels } from "@/types/models";
import { Bot, Users, FileText, BrainCircuit, Plus, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const { clients, addClient } = useChatbot();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [website, setWebsite] = useState("");
  const [model, setModel] = useState("gpt-4o");

  const handleAddClient = () => {
    if (clientName && website) {
      const id = addClient({
        name: clientName,
        website,
        model,
      });
      setOpen(false);
      setClientName("");
      setWebsite("");
      setModel("gpt-4o");
      navigate(`/dashboard/clients/${id}`);
    }
  };

  const statCards = [
    {
      title: "Total Clients",
      value: clients.length,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Training Documents",
      value: clients.reduce((acc, client) => acc + client.trainingData.length, 0),
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Active Chatbots",
      value: clients.length,
      icon: Bot,
      color: "bg-amber-500",
    },
    {
      title: "AI Models Used",
      value: [...new Set(clients.map(client => client.model))].length || 1,
      icon: BrainCircuit,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client profile to generate a customized chatbot.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  placeholder="Acme Corporation"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
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
              <div className="grid gap-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.value}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClient}>Create Client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.color}`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>
              Your most recently added client profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length > 0 ? (
              <div className="space-y-4">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.website}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/clients/${client.id}`)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No clients added yet</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setOpen(true)}
                >
                  Add Your First Client
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full" asChild>
              <a href="/dashboard/clients">View All Clients</a>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>
              Follow these steps to set up your first AI chatbot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Add a new client</h3>
                  <p className="text-sm text-gray-500">Create a profile with basic information about your client</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Upload training data</h3>
                  <p className="text-sm text-gray-500">Add website URLs, PDFs, or text content to train the AI</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Customize chatbot settings</h3>
                  <p className="text-sm text-gray-500">Configure appearance, behavior, and messaging</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white mr-3 shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Integrate with website</h3>
                  <p className="text-sm text-gray-500">Generate embed code to add the chatbot to your client's website</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button className="w-full" onClick={() => setOpen(true)}>
              Create Your First Chatbot
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
