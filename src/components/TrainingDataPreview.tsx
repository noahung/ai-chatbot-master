import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Globe, FileText, Type, Phone, Mail, MapPin, Tag, HelpCircle } from "lucide-react";
import { TrainingItem } from "@/context/ChatbotContext";

interface TrainingDataPreviewProps {
  trainingItem: TrainingItem;
  className?: string;
}

const TrainingDataPreview = ({ trainingItem, className }: TrainingDataPreviewProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [parsedContent, setParsedContent] = useState<any>({
    title: "",
    description: "",
    mainContent: "",
    contactInfo: {
      emails: [],
      phones: [],
      addresses: []
    },
    products: [],
    faqs: []
  });

  useEffect(() => {
    if (!trainingItem.content) return;
    
    const content = trainingItem.content;
    const parsed: any = {
      title: "",
      description: "",
      mainContent: "",
      contactInfo: {
        emails: [],
        phones: [],
        addresses: []
      },
      products: [],
      faqs: []
    };
    
    // Extract title
    if (content.includes("Title:")) {
      parsed.title = content.split("Title:")[1]?.split("\n")[0]?.trim() || "";
    }
    
    // Extract description
    if (content.includes("Description:")) {
      parsed.description = content.split("Description:")[1]?.split("\n")[0]?.trim() || "";
    }
    
    // Extract main content
    if (content.includes("MAIN CONTENT:")) {
      parsed.mainContent = content.split("MAIN CONTENT:")[1]?.split("\n\n")[0]?.trim() || "";
    }
    
    // Extract contact information
    if (content.includes("CONTACT INFORMATION:")) {
      const contactSection = content.split("CONTACT INFORMATION:")[1]?.split("\n\n")[0] || "";
      
      // Extract emails
      if (contactSection.includes("Emails:")) {
        parsed.contactInfo.emails = contactSection
          .split("Emails:")[1]
          ?.split("\n")[0]
          ?.split(",")
          .map((email: string) => email.trim())
          .filter(Boolean) || [];
      }
      
      // Extract phones
      if (contactSection.includes("Phone Numbers:")) {
        parsed.contactInfo.phones = contactSection
          .split("Phone Numbers:")[1]
          ?.split("\n")[0]
          ?.split(",")
          .map((phone: string) => phone.trim())
          .filter(Boolean) || [];
      }
      
      // Extract addresses
      if (contactSection.includes("Addresses:")) {
        parsed.contactInfo.addresses = contactSection
          .split("Addresses:")[1]
          ?.split("\n")[0]
          ?.split(";")
          .map((address: string) => address.trim())
          .filter(Boolean) || [];
      }
    }
    
    // Extract products
    if (content.includes("PRODUCTS/SERVICES:")) {
      const productsSection = content.split("PRODUCTS/SERVICES:")[1]?.split("\n\n")[0] || "";
      const productLines = productsSection.split("\n").filter(line => line.trim().startsWith("-"));
      
      parsed.products = productLines.map((line: string) => {
        const productText = line.substring(1).trim();
        const name = productText.split("(")[0]?.trim() || productText;
        const price = productText.includes("(") ? 
          productText.split("(")[1]?.split(")")[0]?.trim() : "";
        const description = productText.includes("Description:") ? 
          productText.split("Description:")[1]?.trim() : "";
          
        return { name, price, description };
      });
    }
    
    // Extract FAQs
    if (content.includes("FREQUENTLY ASKED QUESTIONS:")) {
      const faqsSection = content.split("FREQUENTLY ASKED QUESTIONS:")[1]?.split("\n\n\n")[0] || "";
      const faqPairs = faqsSection.split("\n\n");
      
      parsed.faqs = faqPairs.map((pair: string) => {
        const question = pair.split("Q:")[1]?.split("\n")[0]?.trim() || "";
        const answer = pair.split("A:")[1]?.trim() || "";
        return { question, answer };
      }).filter((faq: any) => faq.question && faq.answer);
    }
    
    setParsedContent(parsed);
  }, [trainingItem.content]);

  const getTypeIcon = () => {
    switch (trainingItem.type) {
      case 'url':
        return <Globe className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const hasContactInfo = parsedContent.contactInfo.emails.length > 0 || 
    parsedContent.contactInfo.phones.length > 0 || 
    parsedContent.contactInfo.addresses.length > 0;
    
  const hasProducts = parsedContent.products.length > 0;
  const hasFaqs = parsedContent.faqs.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {getTypeIcon()}
            </div>
            <CardTitle>{trainingItem.name}</CardTitle>
          </div>
          <Badge variant="outline">
            {trainingItem.type === 'url' ? 'Website URL' : 
             trainingItem.type === 'pdf' ? 'PDF Document' : 'Text Content'}
          </Badge>
        </div>
        <CardDescription>
          {trainingItem.type === 'url' && trainingItem.url && (
            <a href={trainingItem.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
              <Globe className="h-3 w-3 mr-1" /> {trainingItem.url}
            </a>
          )}
          {trainingItem.type === 'pdf' && trainingItem.fileUrl && (
            <a href={trainingItem.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
              <FileText className="h-3 w-3 mr-1" /> View PDF
            </a>
          )}
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {hasContactInfo && <TabsTrigger value="contact">Contact Info</TabsTrigger>}
          {hasProducts && <TabsTrigger value="products">Products</TabsTrigger>}
          {hasFaqs && <TabsTrigger value="faqs">FAQs</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {parsedContent.title && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="text-base">{parsedContent.title}</p>
            </div>
          )}
          
          {parsedContent.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="text-base">{parsedContent.description}</p>
            </div>
          )}
          
          {parsedContent.mainContent && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Content Preview</h3>
              <p className="text-sm text-gray-700 line-clamp-4">{parsedContent.mainContent}</p>
              <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("content")}>
                Read more
              </Button>
            </div>
          )}
          
          <div className="pt-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Extracted Information</h3>
            <div className="flex flex-wrap gap-2">
              {hasContactInfo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Contact Info
                </Badge>
              )}
              
              {hasProducts && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Products ({parsedContent.products.length})
                </Badge>
              )}
              
              {hasFaqs && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" /> FAQs ({parsedContent.faqs.length})
                </Badge>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contact">
          <div className="space-y-4">
            {parsedContent.contactInfo.emails.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="h-4 w-4 mr-1" /> Email Addresses
                </h3>
                <ul className="mt-2 space-y-1">
                  {parsedContent.contactInfo.emails.map((email: string, index: number) => (
                    <li key={index} className="text-blue-600">
                      <a href={`mailto:${email}`}>{email}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {parsedContent.contactInfo.phones.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Phone className="h-4 w-4 mr-1" /> Phone Numbers
                </h3>
                <ul className="mt-2 space-y-1">
                  {parsedContent.contactInfo.phones.map((phone: string, index: number) => (
                    <li key={index} className="text-blue-600">
                      <a href={`tel:${phone.replace(/\D/g, '')}`}>{phone}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {parsedContent.contactInfo.addresses.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> Addresses
                </h3>
                <ul className="mt-2 space-y-2">
                  {parsedContent.contactInfo.addresses.map((address: string, index: number) => (
                    <li key={index}>
                      <p>{address}</p>
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600"
                      >
                        View on map
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Products & Services</h3>
            <ul className="space-y-3">
              {parsedContent.products.map((product: any, index: number) => (
                <li key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{product.name}</h4>
                    {product.price && (
                      <Badge variant="outline">{product.price}</Badge>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="faqs">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Frequently Asked Questions</h3>
            <ul className="space-y-4">
              {parsedContent.faqs.map((faq: any, index: number) => (
                <li key={index} className="border rounded-md p-3">
                  <h4 className="font-medium">{faq.question}</h4>
                  <Separator className="my-2" />
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Full Content</h3>
            <div className="border rounded-md p-3 max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">{parsedContent.mainContent}</pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <CardContent className="pt-6">
        <div className="text-xs text-gray-500">
          Last processed: {trainingItem.createdAt.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingDataPreview; 