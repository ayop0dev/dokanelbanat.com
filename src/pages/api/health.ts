import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify({
      ok: true,
      service: 'dokanelbanat',
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
