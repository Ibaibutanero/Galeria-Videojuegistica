'use client';

import React, { useState, useEffect } from 'react';
import { UserGame, GameStatus, STATUS_LABELS } from '@/types/library';
import { GameBrainGame } from '@/types/gamebrain';
import { useLibrary } from '@/lib/context/library-context';
import { GameImage } from '@/components/ui/GameImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatHours, formatDate, formatRating } from '@/lib/utils/formatters';
import {
  X,
  Plus,
  Trash2,
  Clock,
  MessageSquare,
  ExternalLink,
  Calendar,
  Gamepad2,
  Star,
  Check,
  Edit2,
  Monitor,
  Save,
} from 'lucide-react';

interface GameDetailModalProps {
  game: {
    id: number;
    title: string;
    coverUrl?: string | null;
    userGame?: UserGame;
    catalogData?: GameBrainGame;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit?: (userGame: UserGame) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  isOpen,
  onClose,
}) => {
  const { addGame, updateGame, removeGame, getUserGameByGameId } = useLibrary();

  const [details, setDetails] = useState<GameBrainGame | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  // Formulario para añadir a la biblioteca si no está guardado
  const [addStatus, setAddStatus] = useState<GameStatus>('pending');
  const [addPlatform, setAddPlatform] = useState<string>('PC');
  const [addHours, setAddHours] = useState<number>(0);
  const [addNotes, setAddNotes] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  // Modo edición directa del progreso personal
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [editStatus, setEditStatus] = useState<GameStatus>('playing');
  const [editHours, setEditHours] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editPlatform, setEditPlatform] = useState<string>('PC');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Estado para confirmación de borrado
  const [confirmDelete, setConfirmDelete] = useState(false);

  const userGame = game ? getUserGameByGameId(game.id) : undefined;

  // Sincronizar estado de edición cuando cambie el userGame
  useEffect(() => {
    if (userGame) {
      setEditStatus(userGame.status);
      setEditHours(userGame.hoursPlayed);
      setEditNotes(userGame.notes || '');
      setEditPlatform(userGame.platform || 'PC');
    }
  }, [userGame]);

  useEffect(() => {
    if (!game || !isOpen) {
      setDetails(null);
      setActiveScreenshot(null);
      setConfirmDelete(false);
      setIsEditingProgress(false);
      return;
    }

    if (game.catalogData) {
      setDetails(game.catalogData);
      return;
    }

    // Consultar detalles completos a nuestro backend de Next.js
    let isCancelled = false;
    const fetchGameDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await fetch(`/api/games/${game.id}`);
        if (res.ok) {
          const data: GameBrainGame = await res.json();
          if (!isCancelled) {
            setDetails(data);
          }
        }
      } catch (err) {
        console.error('Error fetching game details:', err);
      } finally {
        if (!isCancelled) setLoadingDetails(false);
      }
    };

    fetchGameDetails();

    return () => {
      isCancelled = true;
    };
  }, [game, isOpen]);

  if (!isOpen || !game) return null;

  const title = details?.name || game.title;
  const coverUrl = details?.image || game.coverUrl;
  const releaseYear = details?.year || (details?.release_date ? new Date(details.release_date).getFullYear() : undefined);
  const ratingData = details?.rating ? formatRating(details.rating.mean) : null;
  const description = details?.description || details?.short_description;

  const platformsAvailable =
    details?.platforms?.map((p) => p.name) || ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X|S', 'Nintendo Switch', 'Steam Deck'];

  const handleAddToLibrary = async () => {
    try {
      setIsAdding(true);
      await addGame({
        gameId: game.id,
        title,
        coverUrl,
        platform: addPlatform,
        status: addStatus,
        hoursPlayed: Math.max(0, addHours || 0),
        notes: addNotes.trim(),
        releaseYear,
        genre: details?.genre || (details?.genres && details.genres[0]?.name),
      });
    } catch (err) {
      console.error('Error al añadir juego:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!userGame) return;
    try {
      setIsSavingEdit(true);
      await updateGame(userGame.id, {
        status: editStatus,
        hoursPlayed: Math.max(0, editHours || 0),
        notes: editNotes.trim(),
        platform: editPlatform || userGame.platform,
      });
      setIsEditingProgress(false);
    } catch (err) {
      console.error('Error al guardar progreso:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!userGame) return;
    await removeGame(userGame.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl bg-shelf-900 border border-shelf-700/80 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-shelf-800 bg-shelf-950/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-shelf-400">ID: #{game.id}</span>
            {userGame && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                En mi biblioteca
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-shelf-400 hover:text-white hover:bg-shelf-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* Fila superior: Carátula vertical 2:3 + Metadatos */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Carátula vertical 2:3 */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="aspect-[2/3] w-full rounded-xl overflow-hidden shadow-2xl border border-shelf-700/70 bg-shelf-950">
                <GameImage src={coverUrl} alt={title} />
              </div>

              {ratingData && (
                <div className="mt-3 p-2.5 rounded-lg bg-shelf-850/80 border border-shelf-800 flex items-center justify-between text-xs">
                  <span className="text-shelf-400 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>GameBrain Score</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {ratingData.text}
                  </span>
                </div>
              )}

              {details?.link && (
                <a
                  href={details.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 w-full py-2 px-3 rounded-lg bg-shelf-800 hover:bg-shelf-750 border border-shelf-700 text-shelf-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Ficha en GameBrain</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Metadatos y Datos Personales */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-shelf-300">
                  {releaseYear && (
                    <span className="px-2.5 py-1 rounded-md bg-shelf-800 border border-shelf-700/60 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-shelf-400" />
                      {releaseYear}
                    </span>
                  )}
                  {details?.developer && (
                    <span className="px-2.5 py-1 rounded-md bg-shelf-800 border border-shelf-700/60 text-shelf-300">
                      {details.developer}
                    </span>
                  )}
                  {details?.genre && (
                    <span className="px-2.5 py-1 rounded-md bg-shelf-800 border border-shelf-700/60 text-brand-purple">
                      {details.genre}
                    </span>
                  )}
                </div>

                {/* Plataformas disponibles */}
                {details?.platforms && details.platforms.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {details.platforms.map((p) => (
                      <span
                        key={p.value}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-shelf-850 text-shelf-400 border border-shelf-800"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sinopsis / Descripción */}
                {description && (
                  <div className="mt-4 text-xs sm:text-sm text-shelf-300 leading-relaxed max-h-36 overflow-y-auto pr-2 custom-scrollbar">
                    <p className="whitespace-pre-line">{description}</p>
                  </div>
                )}
              </div>

              {/* Panel de Biblioteca Personal */}
              <div className="mt-4 p-4 rounded-xl bg-shelf-850/80 border border-shelf-700/70">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-brand-purple" />
                    <span>Progreso Personal</span>
                  </h4>

                  {userGame && (
                    <button
                      onClick={() => setIsEditingProgress(!isEditingProgress)}
                      className="text-xs text-brand-purple hover:underline flex items-center gap-1 font-medium"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isEditingProgress ? 'Cancelar edición' : 'Editar progreso'}</span>
                    </button>
                  )}
                </div>

                {userGame ? (
                  isEditingProgress ? (
                    /* Formulario de edición directa */
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-shelf-400 mb-1">Estado</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as GameStatus)}
                            className="w-full bg-shelf-900 border border-shelf-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-purple"
                          >
                            {(Object.keys(STATUS_LABELS) as GameStatus[]).map((st) => (
                              <option key={st} value={st}>
                                {STATUS_LABELS[st]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-shelf-400 mb-1">Plataforma</label>
                          <select
                            value={editPlatform}
                            onChange={(e) => setEditPlatform(e.target.value)}
                            className="w-full bg-shelf-900 border border-shelf-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-purple"
                          >
                            {platformsAvailable.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-shelf-400 mb-1">Horas jugadas</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={editHours}
                            onChange={(e) => setEditHours(parseFloat(e.target.value) || 0)}
                            className="w-full bg-shelf-900 border border-shelf-700 text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-purple"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-shelf-400 mb-1">Notas personales</label>
                        <textarea
                          rows={3}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Tus notas, opiniones o progreso..."
                          className="w-full bg-shelf-900 border border-shelf-700 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-brand-purple resize-none placeholder-shelf-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingProgress(false)}
                          className="px-3 py-1.5 rounded-lg text-xs text-shelf-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveProgress}
                          disabled={isSavingEdit}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-purple hover:bg-purple-600 text-white text-xs font-medium shadow-glow transition-all"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSavingEdit ? 'Guardando...' : 'Guardar cambios'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Vista de lectura del progreso */
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div>
                          <span className="text-shelf-400 block text-[11px] mb-1">Estado</span>
                          <StatusBadge status={userGame.status} size="md" />
                        </div>

                        <div>
                          <span className="text-shelf-400 block text-[11px] mb-1">Horas jugadas</span>
                          <div className="flex items-center gap-1.5 font-mono text-sm text-white px-3 py-1 rounded-lg bg-shelf-900 border border-shelf-750">
                            <Clock className="w-4 h-4 text-shelf-400" />
                            <span>{formatHours(userGame.hoursPlayed)}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-shelf-400 block text-[11px] mb-1 flex items-center gap-1">
                            <Monitor className="w-3 h-3 text-shelf-500" />
                            <span>Plataforma</span>
                          </span>
                          <span className="inline-block px-3 py-1 rounded-lg bg-shelf-900 border border-shelf-750 text-white font-mono text-xs">
                            {userGame.platform}
                          </span>
                        </div>
                      </div>

                      {userGame.notes ? (
                        <div className="p-3 rounded-lg bg-shelf-900/90 border border-shelf-800 text-xs">
                          <span className="text-[11px] font-semibold text-shelf-400 flex items-center gap-1 mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-brand-purple" />
                            <span>Notas personales:</span>
                          </span>
                          <p className="text-shelf-200 italic whitespace-pre-wrap">{userGame.notes}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-shelf-500 italic">No tienes notas personales todavía.</p>
                      )}

                      <div className="pt-2 border-t border-shelf-800/80 flex items-center justify-between text-[11px] text-shelf-500">
                        <span>Añadido el {formatDate(userGame.addedAt)}</span>

                        {confirmDelete ? (
                          <div className="flex items-center gap-2">
                            <span className="text-rose-400 font-medium">¿Confirmar?</span>
                            <button
                              onClick={handleDelete}
                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium"
                            >
                              Sí, eliminar
                            </button>
                            <button
                              onClick={() => setConfirmDelete(false)}
                              className="px-2 py-1 rounded bg-shelf-800 text-shelf-300"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(true)}
                            className="flex items-center gap-1 text-shelf-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar de mi biblioteca</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  /* Formulario rápido para añadir cuando aún no está en la biblioteca */
                  <div className="space-y-3">
                    <p className="text-xs text-shelf-300">
                      Añade este videojuego a tu colección para registrar tus horas y seguimiento:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-shelf-400 mb-1">Estado inicial</label>
                        <select
                          value={addStatus}
                          onChange={(e) => setAddStatus(e.target.value as GameStatus)}
                          className="w-full bg-shelf-900 border border-shelf-700 text-shelf-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-brand-purple"
                        >
                          {(Object.keys(STATUS_LABELS) as GameStatus[]).map((st) => (
                            <option key={st} value={st}>
                              {STATUS_LABELS[st]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-shelf-400 mb-1">Plataforma</label>
                        <select
                          value={addPlatform}
                          onChange={(e) => setAddPlatform(e.target.value)}
                          className="w-full bg-shelf-900 border border-shelf-700 text-shelf-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-brand-purple"
                        >
                          {platformsAvailable.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-shelf-400 mb-1">Horas iniciales</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={addHours}
                          onChange={(e) => setAddHours(parseFloat(e.target.value) || 0)}
                          className="w-full bg-shelf-900 border border-shelf-700 text-shelf-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-brand-purple font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Notas iniciales (opcional)..."
                        value={addNotes}
                        onChange={(e) => setAddNotes(e.target.value)}
                        className="w-full bg-shelf-900 border border-shelf-700 text-shelf-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-purple"
                      />
                    </div>

                    <button
                      onClick={handleAddToLibrary}
                      disabled={isAdding}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAdding ? 'Añadiendo...' : 'Añadir a mi biblioteca'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Screenshots Gallery */}
          {details?.screenshots && details.screenshots.length > 0 && (
            <div className="pt-4 border-t border-shelf-800">
              <h4 className="text-xs font-bold text-shelf-400 uppercase tracking-wider mb-3">
                Capturas de pantalla
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {details.screenshots.slice(0, 4).map((shot, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveScreenshot(shot)}
                    className="relative aspect-video rounded-lg overflow-hidden border border-shelf-800 hover:border-brand-purple transition-all cursor-pointer group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shot}
                      alt={`Captura ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal para ampliar Screenshot */}
          {activeScreenshot && (
            <div
              onClick={() => setActiveScreenshot(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 cursor-zoom-out"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeScreenshot}
                alt="Captura ampliada"
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-shelf-700"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
