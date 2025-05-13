import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatbot } from "@/context/ChatbotContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Globe, 
  FileText, 
  Type, 
  Plus, 
  Trash, 
  FileUp, 
  Bot, 
  Copy, 
  Edit, 
  Search,
  FileSymlink,
  Check,
  Loader2,
  Code as CodeIcon
} from "lucide-react";
import { TrainingDataType, TrainingItem } from "@/context/ChatbotContext";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlwmcbdqfusyhhqgwxrz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsd21jYmRxZnVzeWhocWd3eHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzAzMzMsImV4cCI6MjA2MjcwNjMzM30.96HbYy6EfaY2snPjvcO6hT2E-pVCFOvSz5anC3GYVQ8';
const supabase = createClient(supabaseUrl, supabaseKey);

const TrainingData = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, addTrainingData, updateTrainingData, deleteTrainingData } = useChatbot();
  
  const client = getClient(id || "");
  
  const [activeTab, setActiveTab] = useState<TrainingDataType>("url");
  const [newItemName, setNewItemName] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemContent, setNewItemContent] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [editingItem, setEditingItem] = useState<TrainingItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
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

  const resetAddForm = () => {
    setNewItemName("");
    setNewItemUrl("");
    setNewItemContent("");
    setActiveTab("url");
  };

  const handleAddTrainingData = async () => {
    if (!newItemName) {
      toast.error("Please provide a name for this training data");
      return;
    }

    if (activeTab === 'url' && !newItemUrl) {
      toast.error("Please provide a valid URL");
      return;
    }

    if (activeTab === 'text' && !newItemContent) {
      toast.error("Please provide some content");
      return;
    }

    if (activeTab === 'pdf') {
      if (!pdfFile) {
        toast.error("Please select a PDF file to upload");
        return;
      }
      try {
        const fileExt = pdfFile.name.split('.').pop();
        const filePath = `${client.id}/${Date.now()}_${newItemName.replace(/\s+/g, '_')}.${fileExt}`;
        const { data, error } = await supabase.storage.from('training_data').upload(filePath, pdfFile, {
          cacheControl: '3600',
          upsert: false
        });
        if (error) {
          toast.error("Failed to upload PDF: " + error.message);
          return;
        }
        const { data: publicUrlData } = supabase.storage.from('training_data').getPublicUrl(filePath);
        const fileUrl = publicUrlData?.publicUrl;
        if (!fileUrl) {
          toast.error("Failed to get public URL for uploaded PDF");
          return;
        }
        addTrainingData(client.id, {
          type: 'pdf',
          name: newItemName,
          fileUrl
        });
        setIsAddDialogOpen(false);
        resetAddForm();
        setPdfFile(null);
        mockTrainingProcess();
        return;
      } catch (err) {
        toast.error("Unexpected error uploading PDF");
        return;
      }
    }
    
    // Add URL or text training data
    addTrainingData(client.id, {
      type: activeTab,
      name: newItemName,
      ...(activeTab === 'url' ? { url: newItemUrl } : {}),
      ...(activeTab === 'text' ? { content: newItemContent } : {})
    });
    
    setIsAddDialogOpen(false);
    resetAddForm();
    
    // Mock training process
    mockTrainingProcess();
  };
  
  const handleUpdateTrainingData = () => {
    if (!editingItem) return;
    
    updateTrainingData(client.id, editingItem.id, {
      name: newItemName,
      ...(editingItem.type === 'url' ? { url: newItemUrl } : {}),
      ...(editingItem.type === 'text' ? { content: newItemContent } : {})
    });
    
    setIsEditDialogOpen(false);
    setEditingItem(null);
    
    toast.success("Training data updated successfully");
  };
  
  const handleDeleteTrainingData = (itemId: string) => {
    deleteTrainingData(client.id, itemId);
    toast.success("Training data deleted successfully");
  };
  
  const handleEditItem = (item: TrainingItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemUrl(item.url || "");
    setNewItemContent(item.content || "");
    setIsEditDialogOpen(true);
  };
  
  // Mock training process for demonstration
  const mockTrainingProcess = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsTraining(false);
            toast.success("Training completed successfully", {
              description: "AI model has been updated with new data."
            });
          }, 500);
          return 100;
        }
        return next;
      });
    }, 500);
  };

  const getTypeIcon = (type: TrainingDataType) => {
    switch (type) {
      case 'url':
        return <Globe className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
    }
  };
  
  const getTypeLabel = (type: TrainingDataType) => {
    switch (type) {
      case 'url':
        return 'Website URL';
      case 'pdf':
        return 'PDF Document';
      case 'text':
        return 'Text Content';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Data</h1>
          <p className="text-gray-500">Manage knowledge sources for {client.name}'s AI chatbot</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/clients/${client.id}`)}>
            Back to Client
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Training Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Training Data</DialogTitle>
                <DialogDescription>
                  Add content that will be used to train the AI for this client.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="url" value={activeTab} onValueChange={(value) => setActiveTab(value as TrainingDataType)}>
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="url" className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" /> Website URL
                  </TabsTrigger>
                  <TabsTrigger value="pdf" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" /> PDF Upload
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center">
                    <Type className="mr-2 h-4 w-4" /> Text Content
                  </TabsTrigger>
                </TabsList>
                
                <div className="space-y-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="E.g., Product Catalog, About Us Page"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                    />
                  </div>
                
                  <TabsContent value="url" className="space-y-4 mt-0">
                    <div className="grid gap-2">
                      <Label htmlFor="url">Website URL</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com/page-to-crawl"
                        value={newItemUrl}
                        onChange={(e) => setNewItemUrl(e.target.value)}
                      />
                      <p className="text-sm text-gray-500">
                        The AI will crawl this URL and extract content to learn from.
                      </p>
                    </div>
                  </TabsContent>
                
                  <TabsContent value="pdf" className="space-y-4 mt-0">
                    <div className="grid gap-2">
                      <Label htmlFor="pdf">Upload PDF</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-md p-6 flex flex-col items-center justify-center">
                        <FileUp className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">
                          Drag and drop a PDF file, or click to browse
                        </p>
                        <input
                          type="file"
                          accept="application/pdf"
                          style={{ display: 'none' }}
                          id="pdf-upload-input"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setPdfFile(e.target.files[0]);
                            }
                          }}
                        />
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('pdf-upload-input')?.click()}>
                          {pdfFile ? pdfFile.name : 'Select File'}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        PDF files will be processed and their content extracted for training.
                      </p>
                    </div>
                  </TabsContent>
                
                  <TabsContent value="text" className="space-y-4 mt-0">
                    <div className="grid gap-2">
                      <Label htmlFor="content">Text Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Paste or type content here..."
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                        className="min-h-[200px]"
                      />
                      <p className="text-sm text-gray-500">
                        Directly input text content like product descriptions, FAQs, or company information.
                      </p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTrainingData}>
                  Add and Train
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          {editingItem && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Training Data</DialogTitle>
                  <DialogDescription>
                    Update the {getTypeLabel(editingItem.type).toLowerCase()} training data.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      placeholder="E.g., Product Catalog, About Us Page"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                    />
                  </div>
                
                  {editingItem.type === 'url' && (
                    <div className="grid gap-2">
                      <Label htmlFor="edit-url">Website URL</Label>
                      <Input
                        id="edit-url"
                        placeholder="https://example.com/page-to-crawl"
                        value={newItemUrl}
                        onChange={(e) => setNewItemUrl(e.target.value)}
                      />
                    </div>
                  )}
                
                  {editingItem.type === 'text' && (
                    <div className="grid gap-2">
                      <Label htmlFor="edit-content">Text Content</Label>
                      <Textarea
                        id="edit-content"
                        placeholder="Paste or type content here..."
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateTrainingData}>
                    Update
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isTraining && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4 animate-fade-in">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 text-amber-500 mr-2 animate-spin" />
            <div>
              <h3 className="font-medium text-amber-800">Training in progress</h3>
              <p className="text-sm text-amber-600">
                Please wait while we train the AI with your new data. This may take a few moments.
              </p>
              <div className="w-full bg-amber-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${trainingProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Training Data Sources</CardTitle>
            <CardDescription>
              These sources are used to train the AI to answer questions about your client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client.trainingData.length > 0 ? (
              <div className="space-y-4">
                {client.trainingData.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-4 border rounded-md hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-1">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge variant="outline" className="ml-2">
                            {getTypeLabel(item.type)}
                          </Badge>
                        </div>
                        
                        {item.type === 'url' && (
                          <p className="text-sm text-gray-500 mt-1 flex items-center">
                            <Globe className="h-3 w-3 mr-1" /> {item.url}
                          </p>
                        )}
                        
                        {item.type === 'pdf' && (
                          <p className="text-sm text-gray-500 mt-1 flex items-center">
                            <FileSymlink className="h-3 w-3 mr-1" /> {item.fileUrl?.split('/').pop()}
                          </p>
                        )}
                        
                        {item.type === 'text' && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {item.content?.substring(0, 60)}...
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-1">
                          Added {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Training Data</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this training data? This will remove
                              this knowledge from the AI's training set.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDeleteTrainingData(item.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-md">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No training data yet</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Add website URLs, PDF documents, or text content to train the AI 
                  to answer questions about your client.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add First Training Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adding Product-Specific Data</CardTitle>
            <CardDescription>
              Learn how to train your AI for specific products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                To create product-specific AI experiences, add training data for each product you want 
                the AI to know about. Later, you can generate specific "Ask About This Product" buttons 
                for each product.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="font-medium mb-2">Pro Tips:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Name your training data with product names for better organization</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Upload product-specific PDFs like spec sheets or manuals</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Add URLs to specific product pages on your website</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Include product descriptions, features, and FAQs in text format</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => navigate(`/dashboard/clients/${client.id}/integration`)}>
                  <CodeIcon className="mr-2 h-4 w-4" /> Go to Integration Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingData;
