import {
  GameBrainGame,
  GameBrainSearchResponse,
  ApiErrorCode,
} from '@/types/gamebrain';

const GAMEBRAIN_BASE_URL = 'https://api.gamebrain.co/v1';

export class GameBrainError extends Error {
  code: ApiErrorCode;
  status: number;

  constructor(code: ApiErrorCode, message: string, status: number = 500) {
    super(message);
    this.name = 'GameBrainError';
    this.code = code;
    this.status = status;
  }
}

export function isGameBrainConfigured(): boolean {
  const key = process.env.GAMEBRAIN_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'tu_clave_de_gamebrain_aqui');
}

function getApiKey(): string {
  const key = process.env.GAMEBRAIN_API_KEY;
  if (!key || key.trim() === '' || key === 'tu_clave_de_gamebrain_aqui') {
    throw new GameBrainError(
      'MISSING_API_KEY',
      'No se ha configurado la variable de entorno GAMEBRAIN_API_KEY. Por favor, crea un archivo .env.local en la raíz del proyecto y añade tu clave de GameBrain.',
      503
    );
  }
  return key.trim();
}

/**
 * Busca videojuegos en el catálogo de GameBrain por término de búsqueda.
 */
export async function searchGames(
  query: string,
  options: {
    limit?: number;
    offset?: number;
  } = {}
): Promise<GameBrainSearchResponse> {
  const apiKey = getApiKey();
  const limit = Math.min(Math.max(1, options.limit ?? 12), 50);
  const offset = Math.max(0, options.offset ?? 0);

  const url = new URL(`${GAMEBRAIN_BASE_URL}/games`);
  url.searchParams.set('query', query);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('offset', offset.toString());

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        Accept: 'application/json',
      },
      // Revalidar o cachear en Next.js según necesidad
      next: { revalidate: 300 }, // 5 minutos de caché para no gastar tokens innecesariamente
    });

    if (!res.ok) {
      await handleApiError(res);
    }

    const data: GameBrainSearchResponse = await res.json();
    return {
      query: data.query ?? query,
      total_results: data.total_results ?? (data.results ? data.results.length : 0),
      limit: data.limit ?? limit,
      offset: data.offset ?? offset,
      results: data.results ?? [],
    };
  } catch (error) {
    if (error instanceof GameBrainError) {
      throw error;
    }
    throw new GameBrainError(
      'NETWORK_ERROR',
      `Error de conexión al consultar GameBrain: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      500
    );
  }
}

/**
 * Obtiene la ficha detallada de un videojuego por su identificador único de GameBrain.
 */
export async function getGameDetail(id: number | string): Promise<GameBrainGame> {
  const apiKey = getApiKey();
  const cleanId = String(id).trim();

  if (!cleanId) {
    throw new GameBrainError('NOT_FOUND', 'ID de juego no válido.', 400);
  }

  const url = `${GAMEBRAIN_BASE_URL}/games/${encodeURIComponent(cleanId)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        Accept: 'application/json',
      },
      next: { revalidate: 86400 }, // Caché de 24 horas para fichas de juego
    });

    if (!res.ok) {
      await handleApiError(res);
    }

    const game: GameBrainGame = await res.json();
    return game;
  } catch (error) {
    if (error instanceof GameBrainError) {
      throw error;
    }
    throw new GameBrainError(
      'NETWORK_ERROR',
      `Error de conexión al obtener detalles del juego en GameBrain: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      500
    );
  }
}

async function handleApiError(res: Response): Promise<never> {
  let serverMessage = '';
  try {
    const errorBody = await res.json();
    serverMessage = errorBody?.message || errorBody?.error || '';
  } catch {
    serverMessage = await res.text().catch(() => '');
  }

  switch (res.status) {
    case 401:
    case 403:
      throw new GameBrainError(
        'INVALID_API_KEY',
        'La clave de API de GameBrain proporcionada no es válida o no tiene permisos.',
        res.status
      );
    case 402:
      throw new GameBrainError(
        'QUOTA_EXCEEDED',
        'Se ha agotado la cuota diaria de tokens de tu cuenta de GameBrain (Error 402). Se reiniciará a medianoche UTC.',
        402
      );
    case 429:
      throw new GameBrainError(
        'RATE_LIMITED',
        'Límite de solicitudes simultáneas o por minuto alcanzado en GameBrain (Error 429). Espera unos segundos antes de reintentar.',
        429
      );
    case 404:
      throw new GameBrainError(
        'NOT_FOUND',
        'El videojuego solicitado no fue encontrado en la base de datos de GameBrain.',
        404
      );
    default:
      throw new GameBrainError(
        'UPSTREAM_ERROR',
        `GameBrain devolvió un error HTTP ${res.status}: ${serverMessage || res.statusText}`,
        res.status
      );
  }
}
