export type GameStatus =
  | 'pending'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'abandoned';

export type LibrarySortBy = 'addedAt' | 'title' | 'hoursPlayed';
export type SortDirection = 'desc' | 'asc';

export interface UserGame {
  /** Identificador único del registro en la biblioteca personal */
  id: string;
  /** Identificador del juego en el catálogo de GameBrain */
  gameId: number;
  /** Título del juego */
  title: string;
  /** URL de la carátula proporcionada por GameBrain, si existe */
  coverUrl: string | null;
  /** Plataforma seleccionada por el usuario (ej: PC, PlayStation 5, Switch...) */
  platform: string;
  /** Estado actual de progreso */
  status: GameStatus;
  /** Horas dedicadas por el usuario */
  hoursPlayed: number;
  /** Notas y valoraciones personales del usuario */
  notes: string;
  /** Año de lanzamiento (metadato de referencia) */
  releaseYear?: number;
  /** Género principal (metadato de referencia) */
  genre?: string;
  /** Fecha en la que se añadió a la biblioteca (ISO 8601) */
  addedAt: string;
  /** Fecha de la última modificación (ISO 8601) */
  updatedAt: string;
}

export interface NewUserGameInput {
  gameId: number;
  title: string;
  coverUrl?: string | null;
  platform?: string;
  status?: GameStatus;
  hoursPlayed?: number;
  notes?: string;
  releaseYear?: number;
  genre?: string;
}

export interface UpdateUserGameInput {
  platform?: string;
  status?: GameStatus;
  hoursPlayed?: number;
  notes?: string;
}

export const STATUS_LABELS: Record<GameStatus, string> = {
  playing: 'Jugando',
  pending: 'Pendiente',
  completed: 'Completado',
  paused: 'En pausa',
  abandoned: 'Abandonado',
};

export const STATUS_COLORS: Record<
  GameStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  playing: {
    bg: 'bg-emerald-500/15 backdrop-blur-md',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  pending: {
    bg: 'bg-amber-500/15 backdrop-blur-md',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  completed: {
    bg: 'bg-violet-500/15 backdrop-blur-md',
    text: 'text-violet-300',
    border: 'border-violet-500/30',
    dot: 'bg-violet-400',
  },
  paused: {
    bg: 'bg-blue-500/15 backdrop-blur-md',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
  },
  abandoned: {
    bg: 'bg-rose-500/15 backdrop-blur-md',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400',
  },
};

/**
 * Estructura versionada para exportación e importación de copias de seguridad.
 */
export interface LibraryBackup {
  version: number;
  app: 'gameshelf';
  exportedAt: string;
  totalGames: number;
  games: UserGame[];
}

export type ImportMode = 'merge' | 'replace';

export interface BackupValidationResult {
  valid: boolean;
  version?: number;
  error?: string;
  backup?: LibraryBackup;
  stats?: {
    totalGames: number;
    newGamesCount: number;
    existingGamesCount: number;
  };
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  mode: ImportMode;
  message: string;
}
