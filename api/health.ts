/**
 * Serverless Health Check Endpoint
 * Location: /api/health.ts
 *
 * Compatible with Vercel, Netlify, Express, and standard serverless runtimes.
 */

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
}

/**
 * Standard Node / Express / Vercel serverless function handler
 */
export default async function handler(req: any, res: any) {
  const healthData: HealthCheckResponse = {
    status: 'ok',
    service: 'hdb-lta-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || 'production',
  };

  if (res && typeof res.status === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(healthData);
  }

  // Web API Response fallback (e.g. Next.js App Router / Edge)
  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

/**
 * Web standard GET handler (for Next.js / Edge runtimes)
 */
export async function GET(req?: Request) {
  return handler(req, null);
}
