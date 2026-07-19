import { NextRequest, NextResponse } from 'next/server';
import { analyzeCivicImage } from '@/services/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, categoryHint } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Base64 image string is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeCivicImage(image, categoryHint);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Server API Route /api/analyze Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze civic image' },
      { status: 500 }
    );
  }
}
export const maxDuration = 30; // Limit execution to 30s max
export const dynamic = 'force-dynamic';
