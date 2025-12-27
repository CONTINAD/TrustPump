// Netlify Edge Function to proxy IPFS uploads to pump.fun
// This avoids CORS issues in production

export default async (request) => {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        // Forward the request to pump.fun
        const response = await fetch('https://pump.fun/api/ipfs', {
            method: 'POST',
            body: request.body,
            headers: {
                'Content-Type': request.headers.get('Content-Type'),
            },
            duplex: 'half',
        });

        const data = await response.text();

        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('IPFS proxy error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
