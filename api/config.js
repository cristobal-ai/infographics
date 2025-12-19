export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Optional security: Only allow requests from your own domain
  const origin = req.headers.get('origin') || req.headers.get('referer');
  if (process.env.NODE_ENV === 'production' && (!origin || !origin.includes('smrtinvestments.com'))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  return new Response(JSON.stringify(firebaseConfig), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
