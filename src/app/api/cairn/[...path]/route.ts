import { NextRequest, NextResponse } from 'next/server';

const CAIRN_API_URL = process.env.CAIRN_API_URL || 'http://178.104.117.204:3001';
const CAIRN_API_KEY = process.env.CAIRN_API_KEY || '';

async function proxyRequest(request: NextRequest, path: string[]) {
  const targetPath = `/api/${path.join('/')}`;
  const url = new URL(targetPath, CAIRN_API_URL);

  // Forward query parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (CAIRN_API_KEY) {
    headers['Authorization'] = `Bearer ${CAIRN_API_KEY}`;
  }

  // Forward the request
  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // Include body for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.json();
      fetchOptions.body = JSON.stringify(body);
    } catch {
      // No body or invalid JSON - continue without body
    }
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Cairn API' },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}
