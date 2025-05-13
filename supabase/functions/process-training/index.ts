import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Process URL training data (in a real implementation, you would crawl these URLs)
    const urlItems = trainingData.filter(item => item.type === 'url');
    for (const item of urlItems) {
      console.log(`Processing URL: ${item.url}`);
      // In a real implementation:
      // 1. Fetch content from URL
      // 2. Extract text
      // 3. Update the content field in the database
    }

    // Process PDF training data (in a real implementation, you would extract text from PDFs)
    const pdfItems = trainingData.filter(item => item.type === 'pdf');
    for (const item of pdfItems) {
      console.log(`Processing PDF: ${item.file_url}`);
      // In a real implementation:
      // 1. Download PDF
      // 2. Extract text
      // 3. Update the content field in the database
    }

    // In a real implementation, you might:
    // 1. Create embeddings for all content
    // 2. Store in a vector database
    // 3. Update a model fine-tuning job

    // For now, we'll just return success
    return new Response(JSON.stringify({ 
      success: true,
      message: "Training data processed successfully",
      itemsProcessed: trainingData.length
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