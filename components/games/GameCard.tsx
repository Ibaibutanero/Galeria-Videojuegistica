'use client';

import React from 'react';
import { UserGame, GameStatus, STATUS_LABELS } from '@/types/library';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GameImage } from '@/components/ui/GameImage';
import { Clock, MessageSquare, Edit3, Trash2, Eye } from 'lucide-react';
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
      className="group relative flex flex-col rounded-xl bg-shelf-900 border border-shelf-800/80 hover:border-brand-purple/60 hover:shadow-glow transition-all duration-300 overflow-hidden cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
    >
      {/* Contenedor de la carátula vertical con proporción 2:3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-shelf-950">
        <GameImage
          src={game.coverUrl}
          alt={game.title}
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Gradiente oscuro superior sutil */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none" />

        {/* Badge de estado en esquina superior izquierda */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <StatusBadge status={game.status} size="sm" />
        </div>

        {/* Badge de plataforma en esquina superior derecha */}
        {game.platform && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 border border-white/10 text-shelf-200 backdrop-blur-md">
              {game.platform}
            </span>
          </div>
        )}

        {/* Overlay hover sutil centrado en las carátulas con título y estado */}
        <div className="absolute inset-0 bg-gradient-to-t from-shelf-950 via-shelf-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 z-20 pointer-events-none">
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <StatusBadge status={game.status} size="sm" />
              {game.platform && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-white">
                  {game.platform}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
              {game.title}
            </h4>
            <div className="flex items-center justify-between pt-1 text-[11px] text-shelf-300">
              <span className="flex items-center gap-1 font-mono text-emerald-400">
                <Clock className="w-3 h-3" />
                {formatHours(game.hoursPlayed)}
              </span>
              <span className="inline-flex items-center gap-1 text-brand-purple font-medium">
                <Eye className="w-3 h-3" />
                Ver ficha
              </span>
            </div>
          </div>
        </div>

        {/* Horas jugadas visibles en estado normal */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between text-xs text-shelf-300 group-hover:opacity-0 transition-opacity duration-200">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/65 backdrop-blur-md border border-white/5 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-shelf-400" />
            <span>{formatHours(game.hoursPlayed)}</span>
          </div>

          {game.notes && game.notes.trim() !== '' && (
            <div
              className="p-1 rounded-md bg-black/65 backdrop-blur-md border border-white/5 text-shelf-300"
              title="Tiene notas personales"
            >
              <MessageSquare className="w-3 h-3 text-brand-purple" />
            </div>
          )}
        </div>
      </div>

      {/* Contenido inferior de la tarjeta */}
      <div className="flex flex-col flex-1 p-3 justify-between gap-1.5">
        <div>
          <h3
            className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-purple transition-colors line-clamp-1"
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

        {/* Acciones de edición rápida */}
        <div className="pt-2 border-t border-shelf-800/80 flex items-center justify-between text-[11px] text-shelf-500">
          <span>{STATUS_LABELS[game.status]}</span>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-shelf-400 hover:text-white hover:bg-shelf-800 transition-colors"
              title="Editar progreso, horas o notas"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-shelf-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Eliminar de mi biblioteca"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
