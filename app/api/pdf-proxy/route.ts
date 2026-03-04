
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
       return NextResponse.json({ error: `Failed to fetch PDF: ${response.statusText}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    const blob = await response.blob();
    const headers = new Headers();
    if (contentType) headers.set('Content-Type', contentType);

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
