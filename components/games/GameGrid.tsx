'use client';

import React from 'react';
import { UserGame, GameStatus } from '@/types/library';
import { GameCard } from '@/components/games/GameCard';
import { FilterX, Plus, Gamepad2 } from 'lucide-react';

interface GameGridProps {
  games: UserGame[];
  loading?: boolean;
  selectedFilter: 'all' | GameStatus;
  selectedPlatform: string;
  searchQuery: string;
  onSelectGame: (game: UserGame) => void;
  onEditGame: (game: UserGame) => void;
  onDeleteGame: (game: UserGame) => void;
  onOpenSearch: () => void;
  onResetFilters: () => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  loading = false,
  selectedFilter,
  selectedPlatform,
  searchQuery,
  onSelectGame,
  onEditGame,
  onDeleteGame,
  onOpenSearch,
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl bg-shelf-900 border border-shelf-750/60 overflow-hidden animate-pulse"
          >
            <div className="aspect-[2/3] w-full bg-shelf-850" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-shelf-850 rounded w-3/4" />
              <div className="h-3 bg-shelf-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Estado cuando la biblioteca no tiene ningún juego añadido aún
  if (games.length === 0 && selectedFilter === 'all' && selectedPlatform === 'all' && !searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-shelf-750/80 bg-shelf-900/40">
        <div className="w-12 h-12 rounded-xl bg-shelf-850 border border-shelf-750 flex items-center justify-center text-brand-purple-light mb-4 shadow-subtle">
          <Gamepad2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1.5">Tu biblioteca está vacía</h3>
        <p className="text-xs sm:text-sm text-shelf-400 max-w-md mb-5 leading-relaxed">
          Todavía no has guardado ningún juego. Explora el catálogo para añadir tus títulos favoritos,
          organizar tu colección y llevar el seguimiento de tu progreso.
        </p>
        <button
          onClick={onOpenSearch}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white font-medium text-xs sm:text-sm shadow-subtle transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
        >
          <Plus className="w-4 h-4" />
          <span>Buscar y añadir videojuegos</span>
        </button>
      </div>
    );
  }

  // Estado cuando hay filtros activos y no hay coincidencias
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-shelf-750/70 bg-shelf-900/30">
        <div className="w-10 h-10 rounded-xl bg-shelf-850 border border-shelf-750 flex items-center justify-center text-shelf-400 mb-3 shadow-subtle">
          <FilterX className="w-5 h-5 text-shelf-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">Sin coincidencias para estos filtros</h3>
        <p className="text-xs text-shelf-400 max-w-sm mb-4">
          No tienes ningún juego guardado que cumpla con los filtros o el término de búsqueda actual.
        </p>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onResetFilters}
            className="px-3.5 py-1.5 rounded-lg bg-shelf-850 hover:bg-shelf-800 border border-shelf-700 text-shelf-200 text-xs font-medium transition-colors"
          >
            Restablecer filtros
          </button>
          <button
            onClick={onOpenSearch}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-purple/15 hover:bg-brand-purple/25 border border-brand-purple/40 text-brand-purple-light text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4.5">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onClick={() => onSelectGame(game)}
          onEdit={(e) => {
            e.stopPropagation();
            onEditGame(game);
          }}
          onDelete={(e) => {
            e.stopPropagation();
            onDeleteGame(game);
          }}
        />
      ))}
    </div>
  );
};
