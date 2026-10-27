import { NextResponse } from 'next/server';
import { isGameBrainConfigured } from '@/lib/gamebrain/client';

export async function GET() {
  return NextResponse.json({
    configured: isGameBrainConfigured(),
  });
}
