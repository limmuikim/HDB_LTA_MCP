/**
 * Serverless Health & API Monitoring Endpoint
 * Location: /api/health.ts
 *
 * Monitors system health and verifies readiness of HDB and LTA Datamall endpoints.
 */

export interface EndpointHealthStatus {
  path: string;
  status: string;
  provider?: string;
  dataset?: string;
  apiKeyConfigured?: boolean;
  accountKeyConfigured?: boolean;
  refreshIntervalSeconds?: number;
  pingMs?: number;
  upstreamReachable?: boolean;
  pingError?: string;
}

export interface HealthReport {
  status: 'ok' | 'error';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  endpoints: {
    health: EndpointHealthStatus;
    hdbResale: EndpointHealthStatus;
    ltaBusArrival: EndpointHealthStatus;
  };
  config: {
    LTA_ACCOUNT_KEY: string;
    DATA_GOV_SG_API_KEY: string;
  };
}

export default async function handler(req: any, res: any) {
  const query = req?.query || parseQueryParams(req?.url || '');
  const isDeepCheck = query.check === 'all' || query.test === 'true';

  const ltaKeyConfigured = Boolean(process.env.LTA_ACCOUNT_KEY || process.env.ACCOUNT_KEY);
  const dataGovKeyConfigured = Boolean(process.env.DATA_GOV_SG_API_KEY || process.env.HDB_API_KEY);

  const healthReport: HealthReport = {
    status: 'ok',
    service: 'TransitHDB & LTA Datamall API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      health: {
        path: '/api/health',
        status: 'healthy',
      },
      hdbResale: {
        path: '/api/hdb',
        status: 'ready',
        dataset: 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc',
        apiKeyConfigured: dataGovKeyConfigured,
      },
      ltaBusArrival: {
        path: '/api/bus-arrival',
        status: ltaKeyConfigured ? 'ready' : 'awaiting_key',
        provider: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
        accountKeyConfigured: ltaKeyConfigured,
        refreshIntervalSeconds: 20,
      },
    },
    config: {
      LTA_ACCOUNT_KEY: ltaKeyConfigured ? 'Configured' : 'Missing (set in Vercel environment variables)',
      DATA_GOV_SG_API_KEY: dataGovKeyConfigured ? 'Configured' : 'Optional / Not set',
    },
  };

  // Optional live test ping if requested via ?check=all
  if (isDeepCheck) {
    try {
      const hdbTestStart = Date.now();
      const hdbRes = await fetch(
        'https://data.gov.sg/api/action/datastore_search?resource_id=d_8b84c4ee58e3cfc0ece0d773c8ca6abc&limit=1',
        { method: 'GET', signal: AbortSignal.timeout(5000) }
      );
      healthReport.endpoints.hdbResale.pingMs = Date.now() - hdbTestStart;
      healthReport.endpoints.hdbResale.upstreamReachable = hdbRes.ok;
    } catch (err: any) {
      healthReport.endpoints.hdbResale.upstreamReachable = false;
      healthReport.endpoints.hdbResale.pingError = err?.message || 'Ping failed';
    }
  }

  if (res && typeof res.status === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(healthReport);
  }

  return new Response(JSON.stringify(healthReport), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function GET(req?: Request) {
  return handler(req, null);
}

function parseQueryParams(urlString: string): Record<string, string> {
  try {
    const parsed = new URL(urlString, 'http://localhost');
    const out: Record<string, string> = {};
    parsed.searchParams.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  } catch {
    return {};
  }
}
