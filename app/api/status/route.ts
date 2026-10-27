import { NextResponse } from 'next/server';
import { isGameBrainConfigured, isMockModeEnabled } from '@/lib/gamebrain/client';

export async function GET() {
  return NextResponse.json({
    configured: isGameBrainConfigured(),
    mockMode: isMockModeEnabled(),
  });
}
