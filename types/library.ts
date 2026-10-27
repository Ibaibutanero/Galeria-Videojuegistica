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
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  pending: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  completed: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  paused: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
  abandoned: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
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
