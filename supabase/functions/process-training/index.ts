import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { extractTextFromPDF } from "./pdf-utils.ts";

// Helper function to extract contact information using regex
function extractContactInfo(text: string) {
  const contactInfo = {
    emails: [],
    phones: [],
    addresses: []
  };
  
  // Extract emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  if (emails) {
    contactInfo.emails = [...new Set(emails)]; // Remove duplicates
  }
  
  // Extract phone numbers (various formats)
  const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const phones = text.match(phoneRegex);
  if (phones) {
    contactInfo.phones = [...new Set(phones)]; // Remove duplicates
  }
  
  // Extract potential addresses (simplified)
  const addressRegex = /\d+\s+[A-Za-z0-9\s,]+(?:Avenue|Ave|Street|St|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl)(?:\s+[A-Za-z0-9\s,]+)?/g;
  const addresses = text.match(addressRegex);
  if (addresses) {
    contactInfo.addresses = [...new Set(addresses)]; // Remove duplicates
  }
  
  return contactInfo;
}

// Helper function to extract product information
function extractProductInfo(document: any) {
  const products = [];
  
  // Look for product elements (common patterns)
  const productElements = document.querySelectorAll('.product, [data-product], .product-item, .product-card, [itemtype*="Product"]');
  
  productElements.forEach((el: any) => {
    try {
      const product: any = {};
      
      // Try to find product name
      const nameEl = el.querySelector('.product-name, .product-title, h2, h3');
      if (nameEl) product.name = nameEl.textContent.trim();
      
      // Try to find product price
      const priceEl = el.querySelector('.price, .product-price, [itemprop="price"]');
      if (priceEl) product.price = priceEl.textContent.trim();
      
      // Try to find product description
      const descEl = el.querySelector('.description, .product-description, [itemprop="description"]');
      if (descEl) product.description = descEl.textContent.trim();
      
      // Only add if we found at least a name
      if (product.name) {
        products.push(product);
      }
    } catch (err) {
      // Skip this product if extraction fails
    }
  });
  
  return products;
}

// Helper function to extract FAQ information
function extractFAQs(document: any) {
  const faqs = [];
  
  // Look for FAQ elements (common patterns)
  const faqElements = document.querySelectorAll('.faq, .faqs, .faq-item, [itemtype*="FAQPage"]');
  
  faqElements.forEach((el: any) => {
    try {
      // Try different FAQ structures
      const questionEl = el.querySelector('.question, h3, dt, summary');
      const answerEl = el.querySelector('.answer, p, dd, details');
      
      if (questionEl && answerEl) {
        faqs.push({
          question: questionEl.textContent.trim(),
          answer: answerEl.textContent.trim()
        });
      }
    } catch (err) {
      // Skip this FAQ if extraction fails
    }
  });
  
  return faqs;
}

serve(async (req) => {
  try {
    const { clientId } = await req.json();
    
    if (!clientId) {
      return new Response(JSON.stringify({ error: "Client ID is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Connect to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://rlwmcbdqfusyhhqgwxrz.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsd21jYmRxZnVzeWhocWd3eHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEzMDMzMywiZXhwIjoyMDYyNzA2MzMzfQ.OqTLnRsRPIw4EaHBbqfyNz9dBuuNFiP7DrYBc5X6byI";
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch client info
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      return new Response(JSON.stringify({ error: "Client not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch training data
    const { data: trainingData, error: trainingError } = await supabase
      .from("training_data")
      .select("*")
      .eq("client_id", clientId);

    if (trainingError) {
      return new Response(JSON.stringify({ error: "Failed to fetch training data" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Process URL training data
    const urlItems = trainingData.filter((item: any) => item.type === 'url' && item.url);
    const processedItems = [];
    
    for (const item of urlItems) {
      try {
        console.log(`Processing URL: ${item.url}`);
        
        // Skip if already processed with substantial content
        if (item.content && item.content.length > 500) {
          processedItems.push(item.id);
          continue;
        }
        
        // Fetch content from URL
        const response = await fetch(item.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch ${item.url}: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const html = await response.text();
        
        // Parse HTML and extract text
        const parser = new DOMParser();
        const document = parser.parseFromString(html, "text/html");
        
        if (!document) {
          console.error(`Failed to parse HTML from ${item.url}`);
          continue;
        }
        
        // Extract title and metadata
        const title = document.querySelector("title")?.textContent || "";
        const metaDescription = document.querySelector("meta[name='description']")?.getAttribute("content") || "";
        
        // Extract main content (prioritize article or main tags)
        let mainContent = "";
        const mainElement = document.querySelector("article") || document.querySelector("main") || document.body;
        
        if (mainElement) {
          // Remove script, style, and nav elements
          const scriptsAndStyles = mainElement.querySelectorAll("script, style, nav, footer, header");
          scriptsAndStyles.forEach((el: any) => el.remove());
          
          // Get text content
          mainContent = mainElement.textContent || "";
          
          // Clean up whitespace
          mainContent = mainContent
            .replace(/\s+/g, " ")
            .trim();
        }
        
        // Extract contact information
        const contactInfo = extractContactInfo(mainContent);
        
        // Extract product information
        const products = extractProductInfo(document);
        
        // Extract FAQs
        const faqs = extractFAQs(document);
        
        // Combine extracted content in a structured way
        const extractedContent = {
          title,
          description: metaDescription,
          url: item.url,
          mainContent: mainContent.substring(0, 10000), // Limit to avoid excessively large content
          contactInfo,
          products: products.length > 0 ? products : undefined,
          faqs: faqs.length > 0 ? faqs : undefined
        };
        
        // Format the content for AI training
        let formattedContent = `
Title: ${extractedContent.title}
URL: ${extractedContent.url}
Description: ${extractedContent.description}

MAIN CONTENT:
${extractedContent.mainContent.substring(0, 5000)}

`;

        // Add contact information if found
        if (contactInfo.emails.length > 0 || contactInfo.phones.length > 0 || contactInfo.addresses.length > 0) {
          formattedContent += `
CONTACT INFORMATION:
${contactInfo.emails.length > 0 ? `Emails: ${contactInfo.emails.join(', ')}` : ''}
${contactInfo.phones.length > 0 ? `Phone Numbers: ${contactInfo.phones.join(', ')}` : ''}
${contactInfo.addresses.length > 0 ? `Addresses: ${contactInfo.addresses.join('; ')}` : ''}

`;
        }
        
        // Add product information if found
        if (products.length > 0) {
          formattedContent += `
PRODUCTS/SERVICES:
${products.map((p: any) => `- ${p.name}${p.price ? ` (${p.price})` : ''}${p.description ? `\n  Description: ${p.description}` : ''}`).join('\n')}

`;
        }
        
        // Add FAQs if found
        if (faqs.length > 0) {
          formattedContent += `
FREQUENTLY ASKED QUESTIONS:
${faqs.map((faq: any) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

`;
        }
        
        // Update the content field in the database
        const { error: updateError } = await supabase
          .from("training_data")
          .update({ content: formattedContent })
          .eq("id", item.id);
        
        if (updateError) {
          console.error(`Failed to update content for ${item.id}: ${updateError.message}`);
        } else {
          processedItems.push(item.id);
        }
      } catch (err) {
        console.error(`Error processing URL ${item.url}:`, err);
      }
    }

    // Process PDF training data
    const pdfItems = trainingData.filter((item: any) => item.type === 'pdf' && item.file_url);
    for (const item of pdfItems) {
      try {
        console.log(`Processing PDF: ${item.file_url}`);
        if (item.content && item.content.length > 100) {
          processedItems.push(item.id);
          continue;
        }
        const pdfText = await extractTextFromPDF(item.file_url);
        const contactInfo = extractContactInfo(pdfText);
        let formattedContent = `PDF CONTENT:\n${pdfText.substring(0, 10000)}\n`;
        if (contactInfo.emails.length > 0 || contactInfo.phones.length > 0 || contactInfo.addresses.length > 0) {
          formattedContent += `\nCONTACT INFORMATION:\n`;
          if (contactInfo.emails.length > 0) formattedContent += `Emails: ${contactInfo.emails.join(', ')}\n`;
          if (contactInfo.phones.length > 0) formattedContent += `Phone Numbers: ${contactInfo.phones.join(', ')}\n`;
          if (contactInfo.addresses.length > 0) formattedContent += `Addresses: ${contactInfo.addresses.join('; ')}\n`;
        }
        const { error: updateError } = await supabase
          .from("training_data")
          .update({ content: formattedContent })
          .eq("id", item.id);
        if (updateError) {
          console.error(`Failed to update PDF content for ${item.id}: ${updateError.message}`);
        } else {
          processedItems.push(item.id);
        }
      } catch (err) {
        console.error(`Error processing PDF ${item.file_url}:`, err);
      }
    }

    // Process Table/CSV/Excel training data
    const tableItems = trainingData.filter((item: any) => item.type === 'table' && item.file_url);
    for (const item of tableItems) {
      try {
        console.log(`Processing Table: ${item.file_url}`);
        if (item.content && item.content.length > 100) {
          processedItems.push(item.id);
          continue;
        }
        const response = await fetch(item.file_url);
        if (!response.ok) throw new Error('Failed to fetch table file');
        const ext = item.file_url.split('.').pop()?.toLowerCase();
        let tableText = '';
        if (ext === 'csv') {
          const csv = await response.text();
          tableText = csv;
        } else if (ext === 'xlsx' || ext === 'xls') {
          const arrayBuffer = await response.arrayBuffer();
          const XLSX = await import('npm:xlsx');
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          tableText = csv;
        } else {
          throw new Error('Unsupported table file type');
        }
        const contactInfo = extractContactInfo(tableText);
        let formattedContent = `TABLE DATA (CSV):\n${tableText.substring(0, 10000)}\n`;
        if (contactInfo.emails.length > 0 || contactInfo.phones.length > 0 || contactInfo.addresses.length > 0) {
          formattedContent += `\nCONTACT INFORMATION:\n`;
          if (contactInfo.emails.length > 0) formattedContent += `Emails: ${contactInfo.emails.join(', ')}\n`;
          if (contactInfo.phones.length > 0) formattedContent += `Phone Numbers: ${contactInfo.phones.join(', ')}\n`;
          if (contactInfo.addresses.length > 0) formattedContent += `Addresses: ${contactInfo.addresses.join('; ')}\n`;
        }
        const { error: updateError } = await supabase
          .from("training_data")
          .update({ content: formattedContent })
          .eq("id", item.id);
        if (updateError) {
          console.error(`Failed to update table content for ${item.id}: ${updateError.message}`);
        } else {
          processedItems.push(item.id);
        }
      } catch (err) {
        console.error(`Error processing Table ${item.file_url}:`, err);
      }
    }

    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      message: "Training data processed successfully",
      itemsProcessed: processedItems.length,
      processedItems: processedItems
    }), { 
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error processing training data:", err);
    return new Response(JSON.stringify({ error: "Internal server error", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
