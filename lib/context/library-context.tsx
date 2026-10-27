'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  UserGame,
  GameStatus,
  NewUserGameInput,
  UpdateUserGameInput,
  LibrarySortBy,
  SortDirection,
} from '@/types/library';
import { libraryStorage } from '@/lib/storage/library-storage';

interface LibraryContextType {
  games: UserGame[];
  loading: boolean;
  selectedFilter: 'all' | GameStatus;
  setSelectedFilter: (status: 'all' | GameStatus) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  librarySearch: string;
  setLibrarySearch: (query: string) => void;
  sortBy: LibrarySortBy;
  setSortBy: (sort: LibrarySortBy) => void;
  sortOrder: SortDirection;
  setSortOrder: (order: SortDirection) => void;
  addGame: (input: NewUserGameInput) => Promise<UserGame>;
  updateGame: (id: string, updates: UpdateUserGameInput) => Promise<UserGame>;
  removeGame: (id: string) => Promise<boolean>;
  isGameInLibrary: (gameId: number) => boolean;
  getUserGameByGameId: (gameId: number) => UserGame | undefined;
  statusCounts: Record<'all' | GameStatus, number>;
  availablePlatforms: string[];
  filteredGames: UserGame[];
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState<UserGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | GameStatus>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('addedAt');
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc');

  // Carga inicial desde localStorage
  const loadLibrary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await libraryStorage.getAll();
      setGames(data);
    } catch (err) {
      console.error('Error al cargar la biblioteca:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const addGame = async (input: NewUserGameInput): Promise<UserGame> => {
    const saved = await libraryStorage.add(input);
    setGames((prev) => {
      const exists = prev.some((g) => g.id === saved.id || g.gameId === saved.gameId);
      if (exists) {
        return prev.map((g) => (g.id === saved.id || g.gameId === saved.gameId ? saved : g));
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const updateGame = async (id: string, updates: UpdateUserGameInput): Promise<UserGame> => {
    const updated = await libraryStorage.update(id, updates);
    setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  };

  const removeGame = async (id: string): Promise<boolean> => {
    const success = await libraryStorage.remove(id);
    if (success) {
      setGames((prev) => prev.filter((g) => g.id !== id));
    }
    return success;
  };

  const isGameInLibrary = useCallback(
    (gameId: number) => {
      return games.some((g) => g.gameId === gameId);
    },
    [games]
  );

  const getUserGameByGameId = useCallback(
    (gameId: number) => {
      return games.find((g) => g.gameId === gameId);
    },
    [games]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<'all' | GameStatus, number> = {
      all: games.length,
      playing: 0,
      pending: 0,
      completed: 0,
      paused: 0,
      abandoned: 0,
    };
    for (const g of games) {
      if (counts[g.status] !== undefined) {
        counts[g.status]++;
      }
    }
    return counts;
  }, [games]);

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    for (const g of games) {
      if (g.platform) set.add(g.platform);
    }
    return Array.from(set).sort();
  }, [games]);

  // Filtros combinados + Ordenación en tiempo real
  const filteredGames = useMemo(() => {
    // 1. Filtrar
    const filtered = games.filter((g) => {
      // Filtro por estado
      if (selectedFilter !== 'all' && g.status !== selectedFilter) {
        return false;
      }
      // Filtro por plataforma
      if (selectedPlatform !== 'all' && g.platform !== selectedPlatform) {
        return false;
      }
      // Buscador por título entre los guardados
      if (librarySearch.trim() !== '') {
        const query = librarySearch.toLowerCase().trim();
        const matchesTitle = g.title.toLowerCase().includes(query);
        const matchesNotes = g.notes ? g.notes.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesNotes) {
          return false;
        }
      }
      return true;
    });

    // 2. Ordenar
    return filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
      } else if (sortBy === 'hoursPlayed') {
        comparison = (a.hoursPlayed || 0) - (b.hoursPlayed || 0);
      } else {
        // 'addedAt' (por defecto)
        const dateA = new Date(a.addedAt).getTime();
        const dateB = new Date(b.addedAt).getTime();
        comparison = dateA - dateB;
      }

      // Si el orden es descendente, invertir
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [games, selectedFilter, selectedPlatform, librarySearch, sortBy, sortOrder]);

  const value = {
    games,
    loading,
    selectedFilter,
    setSelectedFilter,
    selectedPlatform,
    setSelectedPlatform,
    librarySearch,
    setLibrarySearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addGame,
    updateGame,
    removeGame,
    isGameInLibrary,
    getUserGameByGameId,
    statusCounts,
    availablePlatforms,
    filteredGames,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary debe ser utilizado dentro de un LibraryProvider');
  }
  return context;
}
