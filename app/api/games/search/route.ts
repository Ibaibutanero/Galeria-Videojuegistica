import { NextRequest, NextResponse } from 'next/server';
import { searchGames, GameBrainError } from '@/lib/gamebrain/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  if (!query || query.trim() === '') {
    return NextResponse.json(
      {
        error: 'INVALID_QUERY',
        message: 'Debes proporcionar un término de búsqueda en el parámetro "query".',
      },
      { status: 400 }
    );
  }

  const limit = limitParam ? parseInt(limitParam, 10) : 12;
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

  try {
    const data = await searchGames(query.trim(), { limit, offset });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GameBrainError) {
      return NextResponse.json(
        {
          error: error.code,
          message: error.message,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Ocurrió un error inesperado al procesar la búsqueda.',
      },
      { status: 500 }
    );
  }
}
