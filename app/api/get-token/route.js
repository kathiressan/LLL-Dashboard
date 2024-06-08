export async function POST(req) {
    const { code } = await req.json();
  
    if (!code) {
      return new Response(JSON.stringify({ error: 'Code is required' }), { status: 400 });
    }
  
    try {
      const res = await fetch('https://app.clickup.com/api/v2/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_CLICKUP_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_CLICKUP_CLIENT_SECRET,
          code: code,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const data = await res.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  