'use client';

import React from 'react';
import { UserGame, GameStatus } from '@/types/library';
import { GameCard } from '@/components/games/GameCard';
import { Library, Sparkles, FilterX, Plus, Gamepad2 } from 'lucide-react';

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl bg-shelf-900 border border-shelf-800 overflow-hidden animate-pulse"
          >
            <div className="aspect-[2/3] w-full bg-shelf-850" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-shelf-800 rounded w-3/4" />
              <div className="h-3 bg-shelf-850 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Estado cuando la biblioteca no tiene ningún juego añadido aún
  if (games.length === 0 && selectedFilter === 'all' && selectedPlatform === 'all' && !searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-shelf-800 bg-shelf-900/40">
        <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple mb-4 shadow-glow">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Tu biblioteca está vacía</h3>
        <p className="text-sm text-shelf-400 max-w-md mb-6 leading-relaxed">
          Todavía no has guardado ningún juego. Busca tus títulos favoritos en el catálogo de GameBrain para organizar tu colección y llevar el seguimiento de tu progreso.
        </p>
        <button
          onClick={onOpenSearch}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow hover:shadow-lg transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Buscar videojuegos en GameBrain</span>
        </button>
      </div>
    );
  }

  // Estado cuando hay filtros activos y no hay coincidencias
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-shelf-800/80 bg-shelf-900/30">
        <div className="w-12 h-12 rounded-xl bg-shelf-800 flex items-center justify-center text-shelf-400 mb-3">
          <FilterX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Sin resultados para estos filtros</h3>
        <p className="text-xs text-shelf-400 max-w-sm mb-4">
          No tienes ningún juego guardado que coincida con los criterios de búsqueda o filtro seleccionados.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-lg bg-shelf-800 hover:bg-shelf-700 text-shelf-200 text-xs font-medium transition-colors"
          >
            Restablecer filtros
          </button>
          <button
            onClick={onOpenSearch}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/40 text-brand-purple text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
