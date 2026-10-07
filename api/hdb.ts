/**
 * Serverless HDB Resale Transactions Endpoint
 * Location: /api/hdb.ts
 *
 * Pulls real-time Singapore HDB resale flat transaction data from data.gov.sg
 * Dataset: Resale Flat Prices (Jan 2017 onwards)
 * Resource ID: d_8b84c4ee58e3cfc0ece0d773c8ca6abc
 *
 * NOTE: API keys are NOT hardcoded. Keys can be supplied via environment variables
 * (DATA_GOV_SG_API_KEY or HDB_API_KEY) or through the incoming 'x-api-key' header.
 */

const DATA_GOV_SG_BASE_URL = 'https://data.gov.sg/api/action/datastore_search';
const DEFAULT_RESOURCE_ID = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc';

export interface HDBRawRecord {
  _id: number;
  month: string; // e.g. "2024-03"
  town: string; // e.g. "TAMPINES"
  flat_type: string; // e.g. "4 ROOM"
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: string | number;
  flat_model: string;
  lease_commence_date: string | number;
  remaining_lease: string;
  resale_price: string | number;
}

export interface HDBApiResponse {
  success: boolean;
  resourceId: string;
  limit: number;
  offset: number;
  total?: number;
  count: number;
  filtersApplied: Record<string, any>;
  records: HDBRawRecord[];
  endpointCalled?: string;
  error?: string;
}

/**
 * Standard Node / Express / Vercel Serverless Function Handler
 */
export default async function handler(req: any, res: any) {
  try {
    // 1. Parse query parameters or request body
    const query = req?.query || parseQueryParams(req?.url || '');
    const limit = query.limit ? parseInt(String(query.limit), 10) : 5;
    const offset = query.offset ? parseInt(String(query.offset), 10) : 0;
    const resourceId = (query.resource_id as string) || DEFAULT_RESOURCE_ID;
    const q = (query.q as string) || '';
    const sort = (query.sort as string) || '';

    // 2. Build filters
    const filters: Record<string, any> = {};

    if (query.filters) {
      try {
        const parsed = typeof query.filters === 'string' ? JSON.parse(query.filters) : query.filters;
        Object.assign(filters, parsed);
      } catch {
        // if not valid JSON, ignore or proceed
      }
    }

    // Direct filter convenience shortcuts
    if (query.town) {
      filters.town = String(query.town).toUpperCase();
    }
    if (query.flat_type) {
      filters.flat_type = String(query.flat_type).toUpperCase();
    }

    // 3. Construct upstream data.gov.sg URL
    const url = new URL(DATA_GOV_SG_BASE_URL);
    url.searchParams.set('resource_id', resourceId);
    url.searchParams.set('limit', String(limit));

    if (offset > 0) {
      url.searchParams.set('offset', String(offset));
    }

    if (Object.keys(filters).length > 0) {
      url.searchParams.set('filters', JSON.stringify(filters));
    }

    if (q) {
      url.searchParams.set('q', q);
    }

    if (sort) {
      url.searchParams.set('sort', sort);
    }

    // 4. Set headers with optional API key (never hardcoded)
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'TransitHDB-Serverless/1.0',
    };

    const apiKey =
      process.env.DATA_GOV_SG_API_KEY ||
      process.env.HDB_API_KEY ||
      req?.headers?.['x-api-key'] ||
      req?.headers?.get?.('x-api-key');

    if (apiKey) {
      headers['x-api-key'] = String(apiKey).trim();
    }

    // 5. Fetch from data.gov.sg
    const upstreamResponse = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      const errPayload: HDBApiResponse = {
        success: false,
        resourceId,
        limit,
        offset,
        count: 0,
        filtersApplied: filters,
        records: [],
        endpointCalled: url.toString(),
        error: `data.gov.sg responded with status ${upstreamResponse.status}: ${errText.slice(0, 300)}`,
      };

      if (res && typeof res.status === 'function') {
        return res.status(upstreamResponse.status).json(errPayload);
      }

      return new Response(JSON.stringify(errPayload), {
        status: upstreamResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await upstreamResponse.json();
    const result = data?.result || {};
    const records: HDBRawRecord[] = result?.records || [];

    const responsePayload: HDBApiResponse = {
      success: true,
      resourceId,
      limit,
      offset,
      total: result.total,
      count: records.length,
      filtersApplied: filters,
      records,
      endpointCalled: url.toString(),
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(responsePayload);
    }

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    const errorPayload: HDBApiResponse = {
      success: false,
      resourceId: DEFAULT_RESOURCE_ID,
      limit: 5,
      offset: 0,
      count: 0,
      filtersApplied: {},
      records: [],
      error: err?.message || 'Internal server error while fetching HDB resale data',
    };

    if (res && typeof res.status === 'function') {
      return res.status(500).json(errorPayload);
    }

    return new Response(JSON.stringify(errorPayload), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Web standard GET handler (Next.js / Edge / Cloudflare Workers)
 */
export async function GET(req: Request) {
  return handler(req, null);
}

/**
 * Helper to parse query parameters from URL string
 */
function parseQueryParams(urlString: string): Record<string, string> {
  try {
    const parsedUrl = new URL(urlString, 'http://localhost');
    const params: Record<string, string> = {};
    parsedUrl.searchParams.forEach((val, key) => {
      params[key] = val;
    });
    return params;
  } catch {
    return {};
  }
}
