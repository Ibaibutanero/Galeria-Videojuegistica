'use client';

import React, { useState, useEffect } from 'react';
import { GameBrainGame } from '@/types/gamebrain';
import { GameStatus, STATUS_LABELS } from '@/types/library';
import { useLibrary } from '@/lib/context/library-context';
import { GameImage } from '@/components/ui/GameImage';
import { resolveGamePlatforms, ALLOWED_PLATFORMS, AllowedPlatform } from '@/lib/utils/platforms';
import { X, Check, Loader2, Monitor, Clock, MessageSquare, Plus } from 'lucide-react';

interface AddGameDialogProps {
  game: GameBrainGame | null;
  isOpen: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

export const AddGameDialog: React.FC<AddGameDialogProps> = ({
  game,
  isOpen,
  onClose,
  onAdded,
}) => {
  const { addGame, isGameInLibrary } = useLibrary();

  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>(Array.from(ALLOWED_PLATFORMS));
  const [selectedPlatform, setSelectedPlatform] = useState<string>('PC');
  const [status, setStatus] = useState<GameStatus>('pending');
  const [hoursPlayed, setHoursPlayed] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [loadingPlatforms, setLoadingPlatforms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!game || !isOpen) {
      return;
    }

    setStatus('pending');
    setHoursPlayed(0);
    setNotes('');

    // Obtener plataformas reales de GameBrain y aplicar la regla de la plataforma más nueva
    let isCancelled = false;
    const fetchPlatforms = async () => {
      try {
        setLoadingPlatforms(true);
        const res = await fetch(`/api/games/${game.id}`);
        if (res.ok) {
          const data: GameBrainGame = await res.json();
          if (!isCancelled) {
            const resolved = resolveGamePlatforms(data.platforms);
            setAvailablePlatforms(resolved);
            // Seleccionar por defecto la primera disponible o PC si existe
            const defaultPlat = resolved.includes('PC') ? 'PC' : resolved[0];
            setSelectedPlatform(defaultPlat || 'PC');
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching game platforms:', err);
      } finally {
        if (!isCancelled) {
          setLoadingPlatforms(false);
        }
      }
      if (!isCancelled) {
        const fallback = ['PC', 'PS5', 'Xbox Series X/S', 'Nintendo Switch'];
        setAvailablePlatforms(fallback);
        setSelectedPlatform('PC');
      }
    };

    fetchPlatforms();

    return () => {
      isCancelled = true;
    };
  }, [game, isOpen]);

  if (!isOpen || !game) return null;

  const alreadyInLibrary = isGameInLibrary(game.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyInLibrary) return;

    try {
      setIsSubmitting(true);
      await addGame({
        gameId: game.id,
        title: game.name,
        coverUrl: game.image,
        platform: selectedPlatform || 'PC',
        status,
        hoursPlayed: Math.max(0, hoursPlayed || 0),
        notes: notes.trim(),
        releaseYear: game.year,
        genre: game.genre,
      });

      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      console.error('Error adding game:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-shelf-900 border border-shelf-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 border-b border-shelf-800 bg-shelf-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-12 rounded-md overflow-hidden bg-shelf-850 shrink-0 border border-shelf-750">
              <GameImage src={game.image} alt={game.name} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{game.name}</h3>
              <p className="text-[11px] text-shelf-400">Añadir a mi biblioteca personal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-shelf-400 hover:text-white hover:bg-shelf-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {alreadyInLibrary && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Este juego ya se encuentra en tu biblioteca.</span>
            </div>
          )}

          {/* Selector de Plataforma (Solo permitidas y la más nueva) */}
          <div>
            <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-shelf-400" />
                <span>Plataforma disponible</span>
              </span>
              {loadingPlatforms && (
                <span className="text-[10px] text-brand-purple flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Cargando...
                </span>
              )}
            </label>

            {/* Opciones en formato pastillas / pills */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-shelf-850 border border-shelf-750">
              {availablePlatforms.map((plat) => (
                <button
                  type="button"
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedPlatform === plat
                      ? 'bg-brand-purple text-white shadow-sm font-semibold ring-1 ring-white/20'
                      : 'bg-shelf-900 text-shelf-300 hover:text-white hover:bg-shelf-750'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-shelf-500 mt-1 italic">
              * Mostrando siempre la versión de plataforma más reciente disponible.
            </p>
          </div>

          {/* Estado Inicial */}
          <div>
            <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1.5">
              Estado Inicial
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(Object.keys(STATUS_LABELS) as GameStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                    status === st
                      ? 'bg-brand-purple/20 border-brand-purple text-brand-purple font-semibold shadow-glow'
                      : 'bg-shelf-850 border-shelf-750 text-shelf-400 hover:text-shelf-200'
                  }`}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>
          </div>

          {/* Horas Iniciales */}
          <div>
            <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-shelf-400" />
              <span>Horas Jugadas (inicialmente 0)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={hoursPlayed}
              onChange={(e) => setHoursPlayed(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-shelf-850 border border-shelf-750 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-purple"
            />
          </div>

          {/* Notas Personales Opcionales */}
          <div>
            <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-shelf-400" />
              <span>Notas Personales (opcional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Algún apunte inicial sobre este juego?"
              className="w-full px-3 py-2 rounded-lg bg-shelf-850 border border-shelf-750 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-purple resize-none placeholder-shelf-500"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-shelf-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-shelf-300 hover:text-white hover:bg-shelf-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={alreadyInLibrary || isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium shadow-glow transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : alreadyInLibrary ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ya guardado</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar en mi biblioteca</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
