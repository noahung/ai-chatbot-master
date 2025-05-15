import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { extractTextFromPDF } from "./pdf-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

async function generateEmbedding(text, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });
    if (!response.ok) {
      console.error(`Failed to generate embedding: ${response.status} - ${await response.text()}`);
      return null;
    }
    const data = await response.json();
    return data.data[0].embedding;
  } catch (err) {
    console.error(`Error generating embedding:`, err);
    return null;
  }
}

async function parseWithOpenAI(text, apiKey, task) {
  try {
    const prompt = {
      'contact': `Extract contact information from the following text in JSON format: { "emails": [], "phones": [], "addresses": [] }. Return only the raw JSON object without any Markdown or code block formatting (e.g., do not include \`\`\`json or similar). Be precise and only include valid entries. For addresses, look for a full physical address including street, city, postal code, and country (e.g., "123 Example Street, Gloucester, GL1 2AB, UK"). If multiple addresses are present, include only the primary business address. Text: ${text}`,
      'products': `Extract product information from the following text in JSON format as an array of objects: [{ "name": "", "price": "", "description": "" }]. Return only the raw JSON array without any Markdown or code block formatting. Only include complete entries. Text: ${text}`,
      'faqs': `Extract FAQ information from the following text in JSON format as an array of objects: [{ "question": "", "answer": "" }]. Return only the raw JSON array without any Markdown or code block formatting. Ensure questions and answers are paired correctly. Text: ${text}`
    }[task];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      })
    });
    if (!response.ok) {
      console.error(`Failed to parse with OpenAI for ${task}: ${response.status} - ${await response.text()}`);
      return null;
    }
    const data = await response.json();
    let rawContent = data.choices[0].message.content.trim();
    rawContent = rawContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const result = JSON.parse(rawContent);
    return result;
  } catch (err) {
    console.error(`Error parsing with OpenAI for ${task}:`, err);
    return {
      'contact': { emails: [], phones: [], addresses: [] },
      'products': [],
      'faqs': []
    }[task];
  }
}

async function extractFromCSVExcel(fileUrl) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.error(`Failed to fetch file ${fileUrl}: ${response.status}`);
      return "";
    }
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim());
    let content = "";
    lines.forEach(line => {
      const columns = line.split(',').map(col => col.trim());
      if (columns.length > 0) content += `${columns.join(' | ')}\n`;
    });
    return content;
  } catch (err) {
    console.error(`Error processing CSV/Excel ${fileUrl}:`, err);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { clientId } = await req.json();
    if (!clientId) return new Response(JSON.stringify({ error: "Client ID is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://rlwmcbdqfusyhhqgwxrz.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseKey) return new Response(JSON.stringify({ error: "Missing Supabase service role key" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) console.warn("OPENAI_API_KEY not set; embeddings and parsing will not be generated.");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: client, error: clientError } = await supabase.from("clients").select("id, name").eq("id", clientId).single();
    if (clientError || !client) return new Response(JSON.stringify({ error: "Client not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: trainingData, error: trainingError } = await supabase.from("training_data").select("*").eq("client_id", clientId);
    if (trainingError) return new Response(JSON.stringify({ error: "Failed to fetch training data" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const processedItems = [];
    for (const item of trainingData) {
      try {
        let content = "";
        let contactInfo = { emails: [], phones: [], addresses: [] };
        let products = [];
        let faqs = [];

        if (item.type === 'url' && item.url) {
          const response = await fetch(item.url);
          if (!response.ok) {
            console.error(`Failed to fetch URL ${item.url}: ${response.status}`);
            continue;
          }
          const html = await response.text();
          const parser = new DOMParser();
          const document = parser.parseFromString(html, "text/html");
          if (!document) {
            console.error(`Failed to parse HTML for URL ${item.url}`);
            continue;
          }
          const mainElement = document.querySelector("article") || document.querySelector("main") || document.body || document.querySelector("footer");
          if (mainElement) {
            const scriptsAndStyles = mainElement.querySelectorAll("script, style, nav, header");
            scriptsAndStyles.forEach((el) => el.remove());
            content = mainElement.textContent || "";
          }
        } else if (item.type === 'pdf' && item.file_url) {
          content = await extractTextFromPDF(item.file_url);
        } else if (item.type === 'text' && item.content) {
          content = item.content;
        } else if (item.type === 'csv' && item.file_url) {
          content = await extractFromCSVExcel(item.file_url);
        } else if (item.type === 'excel' && item.file_url) {
          content = await extractFromCSVExcel(item.file_url);
        }

        if (content) {
          if (openAiApiKey) {
            contactInfo = await parseWithOpenAI(content, openAiApiKey, 'contact') || contactInfo;
            products = await parseWithOpenAI(content, openAiApiKey, 'products') || products;
            faqs = await parseWithOpenAI(content, openAiApiKey, 'faqs') || faqs;
          }

          let contactContent = `PHONE NUMBER QUERY MATCH:\nCONTENT:\nContact details extracted from source.\n`;
          if (contactInfo.emails.length > 0 || contactInfo.phones.length > 0 || contactInfo.addresses.length > 0) {
            contactContent += `\nCONTACT INFORMATION:\n`;
            if (contactInfo.emails.length > 0) contactContent += `Emails: ${contactInfo.emails.join(', ')}\n`;
            if (contactInfo.phones.length > 0) contactContent += `Phone Numbers: ${contactInfo.phones.join(', ')}\n`;
            if (contactInfo.addresses.length > 0) contactContent += `Addresses: ${contactInfo.addresses.join('; ')}\n`;
          }

          let contactEmbedding = null;
          if (openAiApiKey) {
            contactEmbedding = await generateEmbedding(contactContent, openAiApiKey);
            if (!contactEmbedding) console.error(`Failed to generate embedding for item ${item.id}`);
          }

          const { error: updateError } = await supabase.from("training_data").update({ content: contactContent, embedding: contactEmbedding }).eq("id", item.id);
          if (updateError) {
            console.error(`Failed to update item ${item.id}: ${updateError.message}`);
            continue;
          }

          processedItems.push(item.id);

          if (content.length > 2000) {
            let mainContentEmbedding = null;
            if (openAiApiKey) mainContentEmbedding = await generateEmbedding(`CONTENT:\n${content}`, openAiApiKey);
            const { error: insertError, data: newItem } = await supabase.from("training_data").insert({ client_id: item.client_id, type: 'text', name: `${item.name} - Main Content`, content: `CONTENT:\n${content}`, embedding: mainContentEmbedding }).select('id').single();
            if (insertError) console.error(`Failed to insert main content chunk: ${insertError.message}`);
            else processedItems.push(newItem.id);
          }

          if (products.length > 0) {
            const productsContent = `PRODUCTS:\n${JSON.stringify(products, null, 2)}\n`;
            let productsEmbedding = null;
            if (openAiApiKey) productsEmbedding = await generateEmbedding(productsContent, openAiApiKey);
            const { error: insertError, data: newItem } = await supabase.from("training_data").insert({ client_id: item.client_id, type: 'text', name: `${item.name} - Products`, content: productsContent, embedding: productsEmbedding }).select('id').single();
            if (insertError) console.error(`Failed to insert products chunk: ${insertError.message}`);
            else processedItems.push(newItem.id);
          }

          if (faqs.length > 0) {
            const faqsContent = `FAQS:\n${JSON.stringify(faqs, null, 2)}\n`;
            let faqsEmbedding = null;
            if (openAiApiKey) faqsEmbedding = await generateEmbedding(faqsContent, openAiApiKey);
            const { error: insertError, data: newItem } = await supabase.from("training_data").insert({ client_id: item.client_id, type: 'text', name: `${item.name} - FAQs`, content: faqsContent, embedding: faqsEmbedding }).select('id').single();
            if (insertError) console.error(`Failed to insert FAQs chunk: ${insertError.message}`);
            else processedItems.push(newItem.id);
          }
        }
      } catch (err) {
        console.error(`Error processing item ${item.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Training data processed successfully", itemsProcessed: processedItems.length, processedItems: processedItems }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error processing training data:", err);
    return new Response(JSON.stringify({ error: "Internal server error", details: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});