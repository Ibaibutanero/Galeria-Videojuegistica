import { UserGame, NewUserGameInput, UpdateUserGameInput } from '@/types/library';

export interface ILibraryStorage {
  getAll(): Promise<UserGame[]>;
  getById(id: string): Promise<UserGame | null>;
  getByGameId(gameId: number): Promise<UserGame | null>;
  add(input: NewUserGameInput): Promise<UserGame>;
  update(id: string, updates: UpdateUserGameInput): Promise<UserGame>;
  remove(id: string): Promise<boolean>;
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
        return parsed;
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
    // Ordenar por fecha de última actualización o adición descendente
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
      platform: input.platform || 'PC',
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
      platform: updates.platform !== undefined ? updates.platform : current.platform,
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
}

export const libraryStorage: ILibraryStorage = new LocalStorageLibraryStorage();
