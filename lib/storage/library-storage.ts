import {
  UserGame,
  NewUserGameInput,
  UpdateUserGameInput,
  LibraryBackup,
  BackupValidationResult,
  ImportResult,
  ImportMode,
  GameStatus,
} from '@/types/library';
import { normalizePlatformName } from '@/lib/utils/platforms';

export interface ILibraryStorage {
  getAll(): Promise<UserGame[]>;
  getById(id: string): Promise<UserGame | null>;
  getByGameId(gameId: number): Promise<UserGame | null>;
  add(input: NewUserGameInput): Promise<UserGame>;
  update(id: string, updates: UpdateUserGameInput): Promise<UserGame>;
  remove(id: string): Promise<boolean>;
  exportBackup(): Promise<LibraryBackup>;
  validateBackup(rawContent: string | object): BackupValidationResult;
  importBackup(backup: LibraryBackup, mode: ImportMode): Promise<ImportResult>;
}

const STORAGE_KEY = 'gameshelf_library_v1';

class LocalStorageLibraryStorage implements ILibraryStorage {
  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private readRaw(): UserGame[] {
    if (!this.isClient()) return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Normalizar nombres de plataforma almacenados para consistencia
        return parsed.map((item) => ({
          ...item,
          platform: normalizePlatformName(item.platform),
        }));
      }
      return [];
    } catch (error) {
      console.error('[LocalStorageLibraryStorage] Error parsing stored library:', error);
      return [];
    }
  }

  private writeRaw(items: UserGame[]): void {
    if (!this.isClient()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('[LocalStorageLibraryStorage] Error saving to localStorage:', error);
    }
  }

  async getAll(): Promise<UserGame[]> {
    const list = this.readRaw();
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getById(id: string): Promise<UserGame | null> {
    const list = this.readRaw();
    return list.find((g) => g.id === id) || null;
  }

  async getByGameId(gameId: number): Promise<UserGame | null> {
    const list = this.readRaw();
    return list.find((g) => g.gameId === gameId) || null;
  }

  async add(input: NewUserGameInput): Promise<UserGame> {
    const list = this.readRaw();
    const existing = list.find((g) => g.gameId === input.gameId);

    const now = new Date().toISOString();
    const newGame: UserGame = {
      id: existing ? existing.id : `game_${input.gameId}_${Date.now()}`,
      gameId: input.gameId,
      title: input.title,
      coverUrl: input.coverUrl ?? null,
      platform: normalizePlatformName(input.platform || 'PC'),
      status: input.status || 'pending',
      hoursPlayed: Math.max(0, input.hoursPlayed ?? 0),
      notes: input.notes || '',
      releaseYear: input.releaseYear,
      genre: input.genre,
      addedAt: existing ? existing.addedAt : now,
      updatedAt: now,
    };

    const updatedList = existing
      ? list.map((g) => (g.id === existing.id ? newGame : g))
      : [newGame, ...list];

    this.writeRaw(updatedList);
    return newGame;
  }

  async update(id: string, updates: UpdateUserGameInput): Promise<UserGame> {
    const list = this.readRaw();
    const index = list.findIndex((g) => g.id === id);

    if (index === -1) {
      throw new Error(`Juego con ID ${id} no encontrado en la biblioteca.`);
    }

    const current = list[index];
    const updated: UserGame = {
      ...current,
      platform:
        updates.platform !== undefined
          ? normalizePlatformName(updates.platform)
          : current.platform,
      status: updates.status !== undefined ? updates.status : current.status,
      hoursPlayed:
        updates.hoursPlayed !== undefined
          ? Math.max(0, updates.hoursPlayed)
          : current.hoursPlayed,
      notes: updates.notes !== undefined ? updates.notes : current.notes,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.writeRaw(list);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const list = this.readRaw();
    const filtered = list.filter((g) => g.id !== id);
    if (filtered.length === list.length) {
      return false;
    }
    this.writeRaw(filtered);
    return true;
  }

  async exportBackup(): Promise<LibraryBackup> {
    const list = await this.getAll();
    const backup: LibraryBackup = {
      version: 1,
      app: 'gameshelf',
      exportedAt: new Date().toISOString(),
      totalGames: list.length,
      games: list,
    };
    return backup;
  }

  validateBackup(rawContent: string | object): BackupValidationResult {
    let parsed: any;
    if (typeof rawContent === 'string') {
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        return {
          valid: false,
          error: 'El archivo no contiene una estructura JSON válida.',
        };
      }
    } else {
      parsed = rawContent;
    }

    if (!parsed || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
      return {
        valid: false,
        error: 'El contenido de la copia de seguridad no es un objeto ni una lista válida.',
      };
    }

    let gamesList: any[] = [];
    let version = 1;
    let exportedAt = new Date().toISOString();

    if (Array.isArray(parsed)) {
      // Compatibilidad con exportaciones directas de arrays de juegos
      gamesList = parsed;
    } else {
      if (parsed.app && parsed.app !== 'gameshelf') {
        return {
          valid: false,
          error: `El archivo indica que pertenece a "${parsed.app}", no a GameShelf.`,
        };
      }

      if (typeof parsed.version === 'number') {
        if (parsed.version > 1) {
          return {
            valid: false,
            error: `La versión del archivo (v${parsed.version}) es más reciente que la compatible con esta versión de GameShelf (v1).`,
          };
        }
        version = parsed.version;
      }

      if (parsed.exportedAt) {
        exportedAt = String(parsed.exportedAt);
      }

      if (!Array.isArray(parsed.games)) {
        return {
          valid: false,
          error: 'El archivo no contiene una lista de videojuegos en el campo "games".',
        };
      }

      gamesList = parsed.games;
    }

    // Validar y normalizar cada videojuego
    const validStatuses: GameStatus[] = ['pending', 'playing', 'paused', 'completed', 'abandoned'];
    const validatedGames: UserGame[] = [];

    for (let i = 0; i < gamesList.length; i++) {
      const g = gamesList[i];
      if (!g || typeof g !== 'object') continue;

      const gameId = typeof g.gameId === 'number' ? g.gameId : parseInt(String(g.gameId), 10);
      const title = typeof g.title === 'string' ? g.title.trim() : '';

      if (isNaN(gameId) || !title) {
        return {
          valid: false,
          error: `El elemento #${i + 1} no tiene un identificador o título de videojuego válido.`,
        };
      }

      const status: GameStatus = validStatuses.includes(g.status) ? g.status : 'pending';
      const hoursPlayed = Math.max(
        0,
        typeof g.hoursPlayed === 'number' ? g.hoursPlayed : parseFloat(String(g.hoursPlayed)) || 0
      );
      const notes = typeof g.notes === 'string' ? g.notes : '';
      const platform = normalizePlatformName(g.platform);
      const now = new Date().toISOString();

      validatedGames.push({
        id: typeof g.id === 'string' && g.id ? g.id : `game_${gameId}_${Date.now()}_${i}`,
        gameId,
        title,
        coverUrl: typeof g.coverUrl === 'string' ? g.coverUrl : null,
        platform,
        status,
        hoursPlayed,
        notes,
        releaseYear: typeof g.releaseYear === 'number' ? g.releaseYear : undefined,
        genre: typeof g.genre === 'string' ? g.genre : undefined,
        addedAt: g.addedAt && !isNaN(Date.parse(g.addedAt)) ? g.addedAt : now,
        updatedAt: g.updatedAt && !isNaN(Date.parse(g.updatedAt)) ? g.updatedAt : now,
      });
    }

    const currentGames = this.readRaw();
    const existingGameIds = new Set(currentGames.map((c) => c.gameId));
    let existingCount = 0;
    let newCount = 0;

    for (const vg of validatedGames) {
      if (existingGameIds.has(vg.gameId)) {
        existingCount++;
      } else {
        newCount++;
      }
    }

    return {
      valid: true,
      version,
      backup: {
        version,
        app: 'gameshelf',
        exportedAt,
        totalGames: validatedGames.length,
        games: validatedGames,
      },
      stats: {
        totalGames: validatedGames.length,
        newGamesCount: newCount,
        existingGamesCount: existingCount,
      },
    };
  }

  async importBackup(backup: LibraryBackup, mode: ImportMode): Promise<ImportResult> {
    if (!backup || !Array.isArray(backup.games)) {
      throw new Error('La copia de seguridad no contiene una lista de videojuegos válida.');
    }

    if (mode === 'replace') {
      this.writeRaw(backup.games);
      return {
        success: true,
        importedCount: backup.games.length,
        mode: 'replace',
        message: `Se ha reemplazado tu biblioteca por completo con ${backup.games.length} videojuegos.`,
      };
    }

    // Modo Merge (Combinar sin duplicar)
    const current = this.readRaw();
    let newlyAdded = 0;
    let updated = 0;

    for (const bg of backup.games) {
      const existingIdx = current.findIndex((c) => c.gameId === bg.gameId);
      if (existingIdx === -1) {
        current.push(bg);
        newlyAdded++;
      } else {
        // Conflicto: Si la copia importada es más reciente, actualizamos conservando addedAt original
        const existing = current[existingIdx];
        const backupTime = new Date(bg.updatedAt).getTime();
        const existingTime = new Date(existing.updatedAt).getTime();

        if (backupTime > existingTime) {
          current[existingIdx] = {
            ...bg,
            addedAt: existing.addedAt || bg.addedAt,
          };
          updated++;
        }
      }
    }

    this.writeRaw(current);
    return {
      success: true,
      importedCount: newlyAdded,
      mode: 'merge',
      message: `Combinación completada: ${newlyAdded} juegos nuevos añadidos y ${updated} juegos existentes actualizados.`,
    };
  }
}

export const libraryStorage: ILibraryStorage = new LocalStorageLibraryStorage();
