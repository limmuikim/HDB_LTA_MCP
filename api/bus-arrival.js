/**
 * Serverless LTA Bus Arrival Information Endpoint
 * Location: /api/bus-arrival.js
 *
 * Upstream API:
 * GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
 * Header: AccountKey
 *
 * Parameters:
 * - BusStopCode: (Required) 5-digit bus stop identifier (e.g. 04121)
 * - ServiceNo: (Optional) Bus service number (e.g. 7)
 *
 * Data refreshes every 20 seconds.
 */

const LTA_BUS_ARRIVAL_BASE_URL = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

export default async function handler(req, res) {
  try {
    // 1. Extract query parameters
    const query = req?.query || parseQueryParams(req?.url || '');
    const busStopCode = (query.BusStopCode || query.busStopCode || query.bus_stop_code || '').trim();
    const serviceNo = (query.ServiceNo || query.serviceNo || query.service_no || '').trim();

    // 2. Validate required parameter: BusStopCode
    if (!busStopCode) {
      const errorResponse = {
        success: false,
        error: "Missing required parameter 'BusStopCode'.",
        example: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7',
        documentation: 'BusStopCode is the only required parameter. Add &ServiceNo=7 to query a single service.',
      };

      if (res && typeof res.status === 'function') {
        return res.status(400).json(errorResponse);
      }
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Retrieve LTA AccountKey from environment variables or incoming header
    const accountKey = (
      process.env.LTA_ACCOUNT_KEY ||
      process.env.ACCOUNT_KEY ||
      req?.headers?.['accountkey'] ||
      req?.headers?.['account-key'] ||
      req?.headers?.['x-account-key'] ||
      req?.headers?.get?.('AccountKey') ||
      req?.headers?.get?.('accountkey')
    );

    // 4. Handle missing API key gracefully
    if (!accountKey) {
      const missingKeyResponse = {
        success: false,
        status: 'awaiting_key',
        error: "LTA_ACCOUNT_KEY is not configured in Vercel environment variables.",
        instructions: "Please add 'LTA_ACCOUNT_KEY' in your Vercel Project Settings under 'Environment Variables'.",
        requested: {
          busStopCode,
          serviceNo: serviceNo || 'ALL',
          upstreamUrl: `${LTA_BUS_ARRIVAL_BASE_URL}?BusStopCode=${encodeURIComponent(busStopCode)}${serviceNo ? `&ServiceNo=${encodeURIComponent(serviceNo)}` : ''}`,
        },
      };

      if (res && typeof res.status === 'function') {
        return res.status(503).json(missingKeyResponse);
      }
      return new Response(JSON.stringify(missingKeyResponse), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Construct upstream LTA Datamall request URL
    const url = new URL(LTA_BUS_ARRIVAL_BASE_URL);
    url.searchParams.set('BusStopCode', busStopCode);
    if (serviceNo) {
      url.searchParams.set('ServiceNo', serviceNo);
    }

    // 6. Execute fetch call to LTA Datamall v3 API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        AccountKey: String(accountKey).trim(),
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errPayload = {
        success: false,
        error: `LTA Datamall returned status ${response.status}`,
        details: errorText.slice(0, 300),
        requestedBusStopCode: busStopCode,
        requestedServiceNo: serviceNo || undefined,
      };

      if (res && typeof res.status === 'function') {
        return res.status(response.status).json(errPayload);
      }
      return new Response(JSON.stringify(errPayload), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    // 7. Return successful arrival data with 20s cache header
    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      // Refreshes every 20 seconds as per LTA Datamall data refresh rate
      res.setHeader('Cache-Control', 'public, max-age=20, s-maxage=20, stale-while-revalidate=10');
      return res.status(200).json(data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=20, s-maxage=20, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    const errorPayload = {
      success: false,
      error: error?.message || 'Internal server error while fetching LTA bus arrival information',
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

export async function GET(req) {
  return handler(req, null);
}

function parseQueryParams(urlString) {
  try {
    const parsed = new URL(urlString, 'http://localhost');
    const out = {};
    parsed.searchParams.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  } catch {
    return {};
  }
}
