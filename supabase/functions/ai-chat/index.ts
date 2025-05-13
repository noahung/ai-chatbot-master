import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

serve(async (req) => {
  const { message, clientId } = await req.json();

  // Connect to Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://rlwmcbdqfusyhhqgwxrz.supabase.co";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsd21jYmRxZnVzeWhocWd3eHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEzMDMzMywiZXhwIjoyMDYyNzA2MzMzfQ.OqTLnRsRPIw4EaHBbqfyNz9dBuuNFiP7DrYBc5X6byI";
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch client info (including OpenAI key and model)
  const { data: client, error } = await supabase
    .from("clients")
    .select("id, name, model, api_key")
    .eq("id", clientId)
    .single();

  if (error || !client) {
    return new Response(JSON.stringify({ error: "Client not found" }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Fetch training data for context
  const { data: trainingData } = await supabase
    .from("training_data")
    .select("content")
    .eq("client_id", clientId);

  const context = trainingData?.map((td: any) => td.content).join("\n") || "";

  // Use the client's OpenAI key, or fallback to a default (if you want)
  const openai = new OpenAI({
    apiKey: client.api_key || Deno.env.get("OPENAI_API_KEY"),
  });

  // Call OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: client.model || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are a helpful assistant for ${client.name}. Here is some context about the client:\n${context}` },
        { role: "user", content: message }
      ],
      max_tokens: 500,
    });
    const aiReply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return new Response(JSON.stringify({ reply: aiReply }), { 
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("OpenAI API error:", err);
    return new Response(JSON.stringify({ error: "AI error", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});