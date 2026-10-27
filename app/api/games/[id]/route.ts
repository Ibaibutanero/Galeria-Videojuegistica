import { NextRequest, NextResponse } from 'next/server';
import { getGameDetail, GameBrainError } from '@/lib/gamebrain/client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: 'INVALID_ID', message: 'ID de juego requerido.' },
      { status: 400 }
    );
  }

  try {
    const game = await getGameDetail(id);
    return NextResponse.json(game);
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
        message: 'Ocurrió un error inesperado al obtener los detalles del juego.',
      },
      { status: 500 }
    );
  }
}
