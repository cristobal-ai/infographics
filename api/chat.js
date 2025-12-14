// api/chat.js
export const config = {
  runtime: 'edge',
};

// 1. DEFINE YOUR PROMPTS HERE
const SYSTEM_PROMPTS = {
  "tax_strategy": "You are a highly knowledgeable commercial real estate tax consultant. Respond to the user's query about U.S. tax deductions, depreciation, or real estate finance with expert, concise, and grounded information. Focus on U.S. tax law (TCJA, QIP, Bonus Depreciation). Format your response as a single, well-structured paragraph.",
  "estate_tax": "You are an international tax and legal expert specializing in real estate investment structures for Mexicans in Texas.  Please answer concisely (maximum 100 words) in English, explaining the provided legal or tax term, focusing on its relevance to the foreign investor (NRA) and LLCs. Do not provide direct legal advice, only information.",
  "impuesto_herencia": "Usted es un experto fiscal internacional y legal, especializado en estructuras de inversión inmobiliaria de mexicanos en Texas. Responda concisamente (máximo 100 palabras) y en español, explicando el término legal o fiscal proporcionado, enfocándose en su relevancia para el inversionista extranjero (NRA) y las LLCs. No ofrezca asesoramiento legal directo, solo información.",  
  "market_analysis": "You are a real estate market analyst. Focus on cap rates, absorption, and rent growth in Texas.",
  "leasing_agent": "You are a leasing specialist. Focus on NNN lease terms, TI allowances, and tenant credit.",
  "default": "You are a helpful real estate assistant."
};

export default async function handler(req) {
  // Security: Domain Check
  const origin = req.headers.get('origin') || req.headers.get('referer');
  if (!origin || !origin.includes('smrtinvestments.com')) {
    return new Response(JSON.stringify({ error: 'Unauthorized origin' }), { status: 403 });
  }

  // 2. RECEIVE THE TOPIC FROM THE FRONTEND
  const { query, topic } = await req.json();

  // 3. SELECT THE CORRECT PROMPT (Fall back to default if topic is missing)
  const systemInstruction = SYSTEM_PROMPTS[topic] || SYSTEM_PROMPTS['default'];

  const apiKey = process.env.GEMINI_API_KEY;
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: query }] }],
    tools: [{ "google_search": {} }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  try {
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await geminiResponse.json();
    return new Response(JSON.stringify(data), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from AI' }), { status: 500 });
  }
}
