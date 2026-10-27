'use client';

import React from 'react';
import { UserGame, STATUS_LABELS } from '@/types/library';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GameImage } from '@/components/ui/GameImage';
import { Clock, MessageSquare, Edit3, Trash2, ChevronRight } from 'lucide-react';
import { formatHours } from '@/lib/utils/formatters';

interface GameCardProps {
  game: UserGame;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex flex-col rounded-xl bg-shelf-900 border border-shelf-750/70 hover:border-shelf-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover overflow-hidden cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
    >
      {/* Contenedor de la carátula vertical con proporción 2:3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-shelf-950">
        <GameImage
          src={game.coverUrl}
          alt={game.title}
          className="transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />

        {/* Gradiente oscuro superior sutil para legibilidad de insignias */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/70 via-black/25 to-transparent pointer-events-none" />

        {/* Badge de estado en esquina superior izquierda */}
        <div className="absolute top-2 left-2 z-10">
          <StatusBadge status={game.status} size="sm" />
        </div>

        {/* Badge de plataforma en esquina superior derecha */}
        {game.platform && (
          <div className="absolute top-2 right-2 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-shelf-950/80 border border-shelf-750 text-shelf-300 backdrop-blur-md">
              {game.platform}
            </span>
          </div>
        )}

        {/* Horas jugadas e icono de notas en la parte inferior de la carátula */}
        <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between text-xs pointer-events-none">
          {game.hoursPlayed > 0 ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-shelf-950/80 backdrop-blur-md border border-shelf-750/80 font-mono text-[11px] text-emerald-400">
              <Clock className="w-3 h-3 text-emerald-400/80" />
              <span>{formatHours(game.hoursPlayed)}</span>
            </div>
          ) : (
            <div />
          )}

          {game.notes && game.notes.trim() !== '' && (
            <div
              className="p-1 rounded bg-shelf-950/80 backdrop-blur-md border border-shelf-750/80 text-shelf-300"
              title="Contiene notas personales"
            >
              <MessageSquare className="w-3 h-3 text-brand-purple-light" />
            </div>
          )}
        </div>

        {/* Hover sutil con indicador «Ver ficha» */}
        <div className="absolute inset-0 bg-shelf-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-3 pointer-events-none">
          <span className="text-[11px] font-medium text-white bg-shelf-900/90 border border-shelf-700/80 px-2.5 py-1 rounded-md backdrop-blur-md flex items-center gap-1 shadow-subtle">
            <span>Ver ficha</span>
            <ChevronRight className="w-3 h-3 text-brand-purple-light" />
          </span>
        </div>
      </div>

      {/* Contenido inferior de la tarjeta */}
      <div className="flex flex-col flex-1 p-3 justify-between gap-2 bg-shelf-900 border-t border-shelf-750/50">
        <div>
          <h3
            className="text-xs sm:text-sm font-semibold text-shelf-100 group-hover:text-white transition-colors line-clamp-1"
            title={game.title}
          >
            {game.title}
          </h3>

          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-shelf-400">
            {game.releaseYear && <span>{game.releaseYear}</span>}
            {game.releaseYear && game.genre && <span>•</span>}
            {game.genre && <span className="line-clamp-1">{game.genre}</span>}
          </div>
        </div>

        {/* Acciones de edición rápida y estado textual */}
        <div className="pt-2 border-t border-shelf-800/80 flex items-center justify-between text-[11px] text-shelf-400">
          <span className="font-medium text-shelf-400">{STATUS_LABELS[game.status]}</span>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md text-shelf-400 hover:text-white hover:bg-shelf-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-purple"
              title="Editar estado, horas o notas"
              aria-label={`Editar ${game.title}`}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md text-shelf-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
              title="Eliminar de mi biblioteca"
              aria-label={`Eliminar ${game.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
