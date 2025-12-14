// api/chat.js
export const config = {
  runtime: 'edge', // Makes it run fast globally
};

export default async function handler(req) {
  // 1. SECURITY: Domain Restriction (The "No Password" Solution)
  // Only allow requests from your specific domain
  const origin = req.headers.get('origin') || req.headers.get('referer');
  const allowedDomain = 'smrtinvestments.com'; // Adjust if using a specific subdomain
  
  if (!origin || !origin.includes(allowedDomain)) {
    // If you are testing on localhost, you might want to uncomment the line below:
    // if (!origin.includes('localhost')) 
    return new Response(JSON.stringify({ error: 'Unauthorized origin' }), { status: 403 });
  }

  // 2. Parse the User's Message
  const { query } = await req.json();

  // 3. Define System Prompt (Moved here for security)
  const systemPrompt = "You are a highly knowledgeable commercial real estate tax consultant. Respond to the user's query about U.S. tax deductions, depreciation, or real estate finance with expert, concise, and grounded information. Focus on U.S. tax law (TCJA, QIP, Bonus Depreciation). Format your response as a single, well-structured paragraph.";

  // 4. Call Google Gemini (Key is hidden in Environment Variables)
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: query }] }],
    tools: [{ "google_search": {} }], // Keep the grounding tool
    systemInstruction: { parts: [{ text: systemPrompt }] },
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
