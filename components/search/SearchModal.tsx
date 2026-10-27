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
  Sparkles,
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

  const debouncedQuery = useDebounce(query, 400);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input al abrir modal
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

  // Ejecutar búsqueda con debounce
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
          setErrorMessage(
            'Error al comunicar con el servidor local o la API de GameBrain.'
          );
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
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-12 p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl rounded-2xl bg-shelf-900 border border-shelf-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
          {/* Cabecera del Buscador */}
          <div className="flex items-center px-4 py-3.5 border-b border-shelf-800 bg-shelf-950/80 gap-3">
            <Search className="w-5 h-5 text-shelf-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título de videojuego en GameBrain (ej: Elden Ring, Mario, Zelda)..."
              className="w-full bg-transparent text-white placeholder-shelf-500 text-sm sm:text-base focus:outline-none"
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
              Cerrar [ESC]
            </button>
          </div>

          {/* Área de Resultados y Estados */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {/* Estado inicial sin texto */}
            {!query.trim() && (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-shelf-800/80 border border-shelf-700/60 flex items-center justify-center text-brand-purple mx-auto mb-3 shadow-glow">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  Catálogo Oficial de GameBrain
                </h4>
                <p className="text-xs text-shelf-400 max-w-md mx-auto">
                  Escribe el título de cualquier juego para buscarlo en la base de datos de más de 800.000 videojuegos y añadirlo a tu biblioteca personal.
                </p>
              </div>
            )}

            {/* Mensajes de Error */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-rose-200">
                      {errorCode === 'MISSING_API_KEY'
                        ? 'Clave de GameBrain no configurada'
                        : errorCode === 'QUOTA_EXCEEDED'
                        ? 'Cuota de API agotada (Error 402)'
                        : errorCode === 'RATE_LIMITED'
                        ? 'Límite de peticiones alcanzado (Error 429)'
                        : 'Error en la búsqueda'}
                    </h5>
                    <p className="mt-1 text-shelf-300">{errorMessage}</p>
                  </div>
                </div>

                {errorCode === 'MISSING_API_KEY' && (
                  <div className="mt-3 p-3 rounded-lg bg-shelf-950/80 border border-shelf-800 text-[11px] text-shelf-300 space-y-2">
                    <p className="font-medium text-white flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cómo activar la búsqueda:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-shelf-400">
                      <li>
                        Obtén tu clave gratuita en{' '}
                        <a
                          href="https://gamebrain.co/api"
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-cyan underline"
                        >
                          gamebrain.co/api <ExternalLink className="inline w-3 h-3" />
                        </a>
                      </li>
                      <li>
                        Añade la variable <code className="text-emerald-400 font-mono">GAMEBRAIN_API_KEY=tu_clave</code> a tu archivo <code className="text-amber-300 font-mono">.env.local</code>.
                      </li>
                      <li>Reinicia el servidor local (<code className="text-shelf-200 font-mono">npm run dev</code>).</li>
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

            {/* Grid de resultados con carátula 2:3 y título */}
            {results.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
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
                      className="group relative flex flex-col rounded-xl bg-shelf-850/80 border border-shelf-750 hover:border-brand-purple/70 hover:shadow-glow transition-all duration-200 overflow-hidden cursor-pointer"
                    >
                      {/* Carátula vertical con proporción 2:3 */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-shelf-950">
                        <GameImage src={game.image} alt={game.name} />

                        {inLibrary && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-emerald-500/95 text-black text-[10px] font-bold flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3" />
                            <span>En biblioteca</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-shelf-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-center">
                          <span className="text-[11px] text-white font-medium bg-black/75 px-2 py-1 rounded backdrop-blur-sm">
                            Ver detalles
                          </span>
                        </div>
                      </div>

                      {/* Info básica */}
                      <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
                        <div>
                          <h4
                            className="text-xs font-semibold text-white group-hover:text-brand-purple line-clamp-1 transition-colors"
                            title={game.name}
                          >
                            {game.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-shelf-400">
                            {game.year && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-shelf-500" />
                                {game.year}
                              </span>
                            )}
                            {game.year && game.genre && <span>•</span>}
                            {game.genre && (
                              <span className="line-clamp-1 text-shelf-400">
                                {game.genre}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botón «Añadir a mi biblioteca» */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenAddDialog(e, game)}
                          disabled={inLibrary}
                          className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                            inLibrary
                              ? 'bg-shelf-800 text-emerald-400 cursor-default border border-emerald-500/20'
                              : 'bg-brand-purple/20 hover:bg-brand-purple text-brand-purple hover:text-white border border-brand-purple/40 shadow-sm'
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
                              <span>Añadir a mi biblioteca</span>
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

      {/* Diálogo para seleccionar plataforma y progreso inicial al añadir */}
      <AddGameDialog
        game={gameToAdd}
        isOpen={Boolean(gameToAdd)}
        onClose={() => setGameToAdd(null)}
      />
    </>
  );
};
