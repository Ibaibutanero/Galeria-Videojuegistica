'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameBrainGame, GameBrainSearchResponse } from '@/types/gamebrain';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useLibrary } from '@/lib/context/library-context';
import { GameImage } from '@/components/ui/GameImage';
import { AddGameDialog } from '@/components/games/AddGameDialog';
import {
  Search,
  X,
  Loader2,
  AlertCircle,
  Plus,
  Check,
  Calendar,
  Gamepad2,
  Key,
  ExternalLink,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: { id: number; title: string; coverUrl?: string | null; catalogData?: GameBrainGame }) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
}) => {
  const { isGameInLibrary } = useLibrary();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GameBrainGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Dialog para añadir juego con selector de plataforma y estado
  const [gameToAdd, setGameToAdd] = useState<GameBrainGame | null>(null);

  const debouncedQuery = useDebounce(query, 350);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setResults([]);
      setErrorMessage(null);
      setErrorCode(null);
      setGameToAdd(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setErrorMessage(null);
      setErrorCode(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const performSearch = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        setErrorCode(null);

        const res = await fetch(
          `/api/games/search?query=${encodeURIComponent(trimmed)}&limit=24`
        );
        const data = await res.json();

        if (isCancelled) return;

        if (!res.ok) {
          setErrorCode(data.error || 'ERROR');
          setErrorMessage(data.message || 'Error al buscar en GameBrain.');
          setResults([]);
          return;
        }

        const searchData: GameBrainSearchResponse = data;
        setResults(searchData.results || []);
      } catch (err) {
        if (!isCancelled) {
          setErrorCode('NETWORK_ERROR');
          setErrorMessage('Error al comunicar con el catálogo de videojuegos.');
          setResults([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  if (!isOpen) return null;

  const handleOpenAddDialog = (e: React.MouseEvent, game: GameBrainGame) => {
    e.stopPropagation();
    if (isGameInLibrary(game.id)) return;
    setGameToAdd(game);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-12 p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl rounded-2xl bg-shelf-900 border border-shelf-750 shadow-modal overflow-hidden flex flex-col max-h-[86vh]">
          {/* Cabecera del Buscador */}
          <div className="flex items-center px-4 py-3 border-b border-shelf-750 bg-shelf-950/80 gap-3">
            <Search className="w-4 h-4 text-shelf-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar título de videojuego (ej: Cyberpunk, Zelda, Witcher, Mario)..."
              className="w-full bg-transparent text-white placeholder-shelf-500 text-sm focus:outline-none"
            />
            {loading && <Loader2 className="w-4 h-4 text-brand-purple animate-spin shrink-0" />}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-shelf-400 hover:text-white hover:bg-shelf-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-shelf-300 hover:text-white bg-shelf-800 hover:bg-shelf-750 transition-colors shrink-0"
            >
              Cerrar
            </button>
          </div>

          {/* Área de Resultados y Estados */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar">
            {/* Estado inicial sin texto */}
            {!query.trim() && (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-shelf-850 border border-shelf-750 flex items-center justify-center text-brand-purple-light mx-auto mb-3 shadow-subtle">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Catálogo de Videojuegos
                </h4>
                <p className="text-xs text-shelf-400 max-w-md mx-auto">
                  Escribe el título de cualquier juego para buscarlo en la base de datos y añadirlo
                  a tu biblioteca personal con tu plataforma y horas.
                </p>
              </div>
            )}

            {/* Mensajes de Error */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-shelf-850 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-rose-200">
                      {errorCode === 'MISSING_API_KEY'
                        ? 'Clave de API no configurada'
                        : errorCode === 'QUOTA_EXCEEDED'
                        ? 'Cuota de API alcanzada (Error 402)'
                        : errorCode === 'RATE_LIMITED'
                        ? 'Límite de solicitudes (Error 429)'
                        : 'Error en la búsqueda'}
                    </h5>
                    <p className="mt-1 text-shelf-300">{errorMessage}</p>
                  </div>
                </div>

                {errorCode === 'MISSING_API_KEY' && (
                  <div className="mt-3 p-3 rounded-lg bg-shelf-900 border border-shelf-800 text-[11px] text-shelf-300 space-y-1.5">
                    <p className="font-medium text-white flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cómo activar el catálogo real:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-0.5 text-shelf-400">
                      <li>Obtén tu clave en gamebrain.co/api.</li>
                      <li>Añádela en tu archivo .env.local como GAMEBRAIN_API_KEY.</li>
                      <li>O activa GAMEDATA_MOCK_MODE=true para el modo demostración.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Sin resultados */}
            {!loading && query.trim() && !errorMessage && results.length === 0 && (
              <div className="py-14 text-center text-xs text-shelf-400">
                No se han encontrado videojuegos con el título &ldquo;{query}&rdquo;.
              </div>
            )}

            {/* Skeletons durante búsqueda */}
            {loading && results.length === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-shelf-850 p-2 space-y-2">
                    <div className="aspect-[2/3] w-full bg-shelf-800 rounded-lg" />
                    <div className="h-3.5 bg-shelf-800 rounded w-3/4" />
                    <div className="h-3 bg-shelf-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Grid de resultados */}
            {results.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {results.map((game) => {
                  const inLibrary = isGameInLibrary(game.id);

                  return (
                    <div
                      key={game.id}
                      onClick={() => {
                        onSelectGame({
                          id: game.id,
                          title: game.name,
                          coverUrl: game.image,
                          catalogData: game,
                        });
                      }}
                      className="group relative flex flex-col rounded-xl bg-shelf-850 border border-shelf-750 hover:border-shelf-600 transition-all duration-200 overflow-hidden cursor-pointer"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-shelf-950">
                        <GameImage src={game.image} alt={game.name} />

                        {inLibrary && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <Check className="w-3 h-3" />
                            <span>Guardado</span>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
                        <div>
                          <h4
                            className="text-xs font-semibold text-shelf-100 group-hover:text-white line-clamp-1 transition-colors"
                            title={game.name}
                          >
                            {game.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-shelf-400">
                            {game.year && <span>{game.year}</span>}
                            {game.year && game.genre && <span>•</span>}
                            {game.genre && <span className="line-clamp-1">{game.genre}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleOpenAddDialog(e, game)}
                          disabled={inLibrary}
                          className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                            inLibrary
                              ? 'bg-shelf-900 text-emerald-400 cursor-default border border-emerald-500/20'
                              : 'bg-brand-purple hover:bg-brand-purple-hover text-white shadow-subtle'
                          }`}
                        >
                          {inLibrary ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>En biblioteca</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Añadir</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddGameDialog
        game={gameToAdd}
        isOpen={Boolean(gameToAdd)}
        onClose={() => setGameToAdd(null)}
      />
    </>
  );
};
