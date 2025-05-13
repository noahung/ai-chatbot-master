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

  // Fetch ALL training data for context (including all types)
  const { data: trainingData } = await supabase
    .from("training_data")
    .select("*")
    .eq("client_id", clientId);

  // Function to determine if a message is asking about specific topics
  const getTopicRelevance = (message) => {
    const lowercaseMsg = message.toLowerCase();
    
    return {
      isAboutContact: /contact|email|phone|call|reach|address|location/i.test(lowercaseMsg),
      isAboutProducts: /product|service|offer|price|cost|buy|purchase/i.test(lowercaseMsg),
      isAboutFAQ: /faq|question|how to|what is|can i|do you/i.test(lowercaseMsg),
      isAboutHours: /hour|time|open|close|schedule|when/i.test(lowercaseMsg),
    };
  };

  // Process and organize training data by type
  let contactInfo = [];
  let productInfo = [];
  let faqInfo = [];
  let generalInfo = [];

  if (trainingData && trainingData.length > 0) {
    for (const item of trainingData) {
      if (!item.content) continue;
      
      const content = item.content;
      
      // Extract contact information
      if (content.includes("CONTACT INFORMATION:")) {
        contactInfo.push(content.split("CONTACT INFORMATION:")[1].split("\n\n")[0]);
      }
      
      // Extract product information
      if (content.includes("PRODUCTS/SERVICES:")) {
        productInfo.push(content.split("PRODUCTS/SERVICES:")[1].split("\n\n")[0]);
      }
      
      // Extract FAQ information
      if (content.includes("FREQUENTLY ASKED QUESTIONS:")) {
        faqInfo.push(content.split("FREQUENTLY ASKED QUESTIONS:")[1].split("\n\n")[0]);
      }
      
      // Always include the main content
      if (content.includes("MAIN CONTENT:")) {
        generalInfo.push(content.split("MAIN CONTENT:")[1].split("\n\n")[0]);
      } else {
        generalInfo.push(content); // Fallback to the entire content
      }
    }
  }

  // Determine what the user is asking about
  const topicRelevance = getTopicRelevance(message);
  
  // Build a context-aware system prompt
  let systemPrompt = `You are a helpful assistant for ${client.name}. You should respond in a friendly, professional tone.`;
  
  // Add context based on what the user is asking about
  if (topicRelevance.isAboutContact && contactInfo.length > 0) {
    systemPrompt += `\n\nHere is the contact information for ${client.name}:\n${contactInfo.join("\n")}`;
  }
  
  if (topicRelevance.isAboutProducts && productInfo.length > 0) {
    systemPrompt += `\n\nHere are the products and services offered by ${client.name}:\n${productInfo.join("\n")}`;
  }
  
  if (topicRelevance.isAboutFAQ && faqInfo.length > 0) {
    systemPrompt += `\n\nHere are frequently asked questions about ${client.name}:\n${faqInfo.join("\n")}`;
  }
  
  // Always include some general information, but limit it to avoid token limits
  systemPrompt += `\n\nAdditional information about ${client.name}:\n${generalInfo.slice(0, 3).join("\n\n").substring(0, 2000)}`;
  
  // Add instructions for the AI
  systemPrompt += `\n\nWhen responding to the user:
1. If you're asked about specific information that isn't in the provided context, politely say you don't have that information.
2. If asked about contact information, always provide the exact contact details from the training data.
3. Be conversational but professional.
4. Keep responses concise but informative.
5. Don't make up information that isn't provided in the context.`;

  // Use the client's OpenAI key, or fallback to a default (if you want)
  const openai = new OpenAI({
    apiKey: client.api_key || Deno.env.get("OPENAI_API_KEY"),
  });

  // Call OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: client.model || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7, // Slightly creative but still factual
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