'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  UserGame,
  GameStatus,
  NewUserGameInput,
  UpdateUserGameInput,
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

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (selectedFilter !== 'all' && g.status !== selectedFilter) {
        return false;
      }
      if (selectedPlatform !== 'all' && g.platform !== selectedPlatform) {
        return false;
      }
      if (librarySearch.trim() !== '') {
        const query = librarySearch.toLowerCase().trim();
        const matchesTitle = g.title.toLowerCase().includes(query);
        const matchesNotes = g.notes.toLowerCase().includes(query);
        const matchesPlatform = g.platform.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes && !matchesPlatform) {
          return false;
        }
      }
      return true;
    });
  }, [games, selectedFilter, selectedPlatform, librarySearch]);

  const value = {
    games,
    loading,
    selectedFilter,
    setSelectedFilter,
    selectedPlatform,
    setSelectedPlatform,
    librarySearch,
    setLibrarySearch,
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
