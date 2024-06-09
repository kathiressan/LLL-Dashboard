export async function POST(req, res) {
    const { authToken, spaceID } = await req.json();
  
    if (!authToken) {
      return new Response(JSON.stringify({ error: 'Auth token is required' }), { status: 400 });
    }
  
    try {
      const res = await fetch(`https://api.clickup.com/api/v2/space/${spaceID}/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
  
      const data = await res.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  