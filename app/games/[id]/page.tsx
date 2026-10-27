'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GameBrainGame } from '@/types/gamebrain';
import { GameStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/library';
import { useLibrary } from '@/lib/context/library-context';
import { GameImage } from '@/components/ui/GameImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatHours, formatDate, formatRating } from '@/lib/utils/formatters';
import { resolveGamePlatforms } from '@/lib/utils/platforms';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Gamepad2,
  MessageSquare,
  Plus,
  Star,
  Trash2,
  Loader2,
  AlertCircle,
  Save,
  Check,
  Monitor,
} from 'lucide-react';

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const gameId = parseInt(resolvedParams.id, 10);

  const { getUserGameByGameId, addGame, updateGame, removeGame } = useLibrary();
  const userGame = !isNaN(gameId) ? getUserGameByGameId(gameId) : undefined;

  const [details, setDetails] = useState<GameBrainGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de edición del progreso personal
  const [status, setStatus] = useState<GameStatus>('pending');
  const [hoursPlayed, setHoursPlayed] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [platform, setPlatform] = useState<string>('PC');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estado de confirmación de borrado
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Formulario para añadir a biblioteca si no está guardado
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isNaN(gameId)) {
      setError('Identificador de juego no válido.');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/games/${gameId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'No se pudieron cargar los datos del juego.');
        } else {
          setDetails(data);
        }
      } catch (err) {
        setError('Error de conexión al cargar la información del juego.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [gameId]);

  // Sincronizar campos cuando existe registro personal
  useEffect(() => {
    if (userGame) {
      setStatus(userGame.status);
      setHoursPlayed(userGame.hoursPlayed);
      setNotes(userGame.notes || '');
      setPlatform(userGame.platform || 'PC');
    }
  }, [userGame]);

  // Plataformas disponibles según regla de prioridad y plataformas permitidas
  const platforms = resolveGamePlatforms(details?.platforms);

  // Sincronizar plataforma si cambia la lista y no está guardado
  useEffect(() => {
    if (!userGame && platforms.length > 0 && !platforms.includes(platform as any)) {
      setPlatform(platforms[0]);
    }
  }, [platforms, userGame, platform]);

  const handleSaveProgress = async () => {
    if (!userGame) return;
    try {
      setIsSaving(true);
      await updateGame(userGame.id, {
        status,
        hoursPlayed: Math.max(0, Number(hoursPlayed) || 0),
        notes: notes.trim(),
        platform,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error al guardar progreso:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!details) return;
    setIsAdding(true);
    try {
      await addGame({
        gameId: details.id,
        title: details.name,
        coverUrl: details.image,
        platform,
        status,
        hoursPlayed: Math.max(0, Number(hoursPlayed) || 0),
        notes: notes.trim(),
        releaseYear: details.year,
        genre: details.genre,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!userGame) return;
    await removeGame(userGame.id);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-shelf-950 flex flex-col items-center justify-center text-shelf-400">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <p className="text-sm">Cargando ficha del videojuego...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-shelf-950 p-6 flex flex-col items-center justify-center text-center">
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 max-w-md">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h2 className="text-base font-bold text-white mb-1">Error al cargar juego</h2>
          <p className="text-xs text-shelf-300 mb-4">{error || 'Juego no encontrado.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-shelf-800 hover:bg-shelf-750 text-xs font-medium text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la biblioteca</span>
          </Link>
        </div>
      </div>
    );
  }

  const ratingData = details.rating ? formatRating(details.rating.mean) : null;
  const description = details.description || details.short_description;

  return (
    <div className="min-h-screen bg-shelf-950 text-shelf-100 selection:bg-brand-purple selection:text-white">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navegación Superior */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-shelf-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-shelf-900 border border-shelf-800 hover:border-shelf-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a mi biblioteca</span>
          </Link>

          {userGame && (
            <span className="text-xs text-shelf-400">
              Añadido el {formatDate(userGame.addedAt)}
            </span>
          )}
        </div>

        {/* Ficha Principal de Detalles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-shelf-900/60 border border-shelf-800 rounded-2xl p-6 lg:p-8 backdrop-blur-sm shadow-xl">
          {/* Columna Izquierda: Carátula destacada en tamaño grande (2:3) */}
          <div className="md:col-span-4 lg:col-span-4 space-y-4">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-shelf-700/80 bg-shelf-950">
              <GameImage src={details.image} alt={details.name} />

              {userGame && (
                <div className="absolute top-3 left-3 z-10">
                  <StatusBadge status={userGame.status} size="md" />
                </div>
              )}
            </div>

            {ratingData && (
              <div className="p-3 rounded-xl bg-shelf-850/80 border border-shelf-750 flex items-center justify-between text-xs">
                <span className="text-shelf-400 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>GameBrain Score</span>
                </span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {ratingData.text}
                </span>
              </div>
            )}

            {details.link && (
              <a
                href={details.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-shelf-850 hover:bg-shelf-800 border border-shelf-750 text-shelf-300 hover:text-white text-xs flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <span>Ficha oficial en GameBrain</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Columna Derecha: Metadatos y Gestión del Progreso Personal */}
          <div className="md:col-span-8 lg:col-span-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-shelf-400 mb-2">
                <span className="font-mono">ID: #{details.id}</span>
                {userGame && (
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 text-[10px] font-semibold">
                    En tu colección
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {details.name}
              </h1>

              {/* Metadatos cuando están disponibles en los datos */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                {details.year && (
                  <span className="px-3 py-1 rounded-md bg-shelf-850 border border-shelf-750 text-shelf-300 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-shelf-400" />
                    <span>{details.year}</span>
                  </span>
                )}

                {details.developer && (
                  <span className="px-3 py-1 rounded-md bg-shelf-850 border border-shelf-750 text-shelf-300">
                    {details.developer}
                  </span>
                )}

                {details.genre && (
                  <span className="px-3 py-1 rounded-md bg-shelf-850 border border-shelf-750 text-brand-purple font-medium">
                    {details.genre}
                  </span>
                )}
              </div>

              {/* Plataformas disponibles (resueltas según la regla de más reciente) */}
              {platforms && platforms.length > 0 && (
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-shelf-400 mr-1 flex items-center gap-1">
                    <Monitor className="w-3.5 h-3.5 text-shelf-500" />
                    <span>Plataformas:</span>
                  </span>
                  {platforms.map((p) => (
                    <span
                      key={p}
                      className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-md bg-shelf-850 text-shelf-300 border border-shelf-750"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Descripción (cuando esté disponible) */}
              {description && (
                <div className="mt-5 text-sm text-shelf-300 leading-relaxed border-t border-shelf-800 pt-4 whitespace-pre-line">
                  {description}
                </div>
              )}
            </div>

            {/* SECCIÓN DE PROGRESO PERSONAL */}
            <div className="p-6 rounded-2xl bg-shelf-850/90 border border-shelf-750 shadow-inner space-y-5">
              <div className="flex items-center justify-between border-b border-shelf-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-brand-purple" />
                  <span>Seguimiento y Progreso Personal</span>
                </h3>

                {userGame && (
                  <span className="text-xs text-shelf-400">
                    Añadido el {formatDate(userGame.addedAt)}
                  </span>
                )}
              </div>

              {/* Selector de Estado fácil de utilizar */}
              <div>
                <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-2">
                  Estado de Progreso
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(STATUS_LABELS) as GameStatus[]).map((st) => {
                    const active = status === st;
                    const colors = STATUS_COLORS[st];
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setStatus(st)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all flex items-center justify-center gap-1.5 ${
                          active
                            ? `${colors.bg} ${colors.text} ${colors.border} font-bold shadow-glow ring-1 ring-white/10`
                            : 'bg-shelf-900 border-shelf-750 text-shelf-400 hover:text-white hover:bg-shelf-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        <span>{STATUS_LABELS[st]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plataforma y Horas Jugadas Editables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-shelf-400" />
                    <span>Tu Plataforma</span>
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-shelf-900 border border-shelf-700 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-purple"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-shelf-400" />
                      <span>Horas Jugadas</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {formatHours(hoursPlayed)}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={hoursPlayed}
                      onChange={(e) => setHoursPlayed(parseFloat(e.target.value) || 0)}
                      className="w-full bg-shelf-900 border border-shelf-700 text-white text-xs sm:text-sm font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-brand-purple"
                    />
                    <button
                      type="button"
                      onClick={() => setHoursPlayed((prev) => Math.max(0, (prev || 0) + 1))}
                      className="px-2.5 py-2 bg-shelf-900 hover:bg-shelf-800 border border-shelf-750 text-xs font-mono text-shelf-300 rounded-xl"
                    >
                      +1h
                    </button>
                    <button
                      type="button"
                      onClick={() => setHoursPlayed((prev) => Math.max(0, (prev || 0) + 5))}
                      className="px-2.5 py-2 bg-shelf-900 hover:bg-shelf-800 border border-shelf-750 text-xs font-mono text-shelf-300 rounded-xl"
                    >
                      +5h
                    </button>
                  </div>
                </div>
              </div>

              {/* Notas Personales Editables */}
              <div>
                <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-shelf-400" />
                  <span>Notas Personales</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade tus impresiones, build actual, recuerdos o tareas pendientes..."
                  className="w-full bg-shelf-900 border border-shelf-700 text-white text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:border-brand-purple resize-none placeholder-shelf-500"
                />
              </div>

              {/* Botones de acción: Guardar cambios o Eliminar */}
              <div className="pt-3 border-t border-shelf-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                {userGame ? (
                  <>
                    <div>
                      {confirmDelete ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-rose-400 font-medium">¿Seguro que deseas eliminarlo?</span>
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                          >
                            Sí, eliminar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="px-3 py-1.5 rounded-lg bg-shelf-800 text-shelf-300 text-xs hover:text-white"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          className="text-xs text-shelf-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors py-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar de mi biblioteca</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveProgress}
                      disabled={isSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition-all disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : saveSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>¡Guardado con éxito!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Guardar cambios</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  /* Si no está en la biblioteca todavía */
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isAdding}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition-all disabled:opacity-50"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Añadiendo a tu colección...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Añadir a mi biblioteca</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
