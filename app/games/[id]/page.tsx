'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GameBrainGame } from '@/types/gamebrain';
import { GameStatus, STATUS_LABELS } from '@/types/library';
import { useLibrary } from '@/lib/context/library-context';
import { GameImage } from '@/components/ui/GameImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatHours, formatDate, formatRating } from '@/lib/utils/formatters';
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
  Edit3,
} from 'lucide-react';
import { EditGameModal } from '@/components/games/EditGameModal';

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
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Formulario para añadir a biblioteca
  const [addStatus, setAddStatus] = useState<GameStatus>('pending');
  const [addPlatform, setAddPlatform] = useState<string>('PC');
  const [addHours, setAddHours] = useState<number>(0);
  const [addNotes, setAddNotes] = useState<string>('');
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

  const handleAdd = async () => {
    if (!details) return;
    setIsAdding(true);
    try {
      await addGame({
        gameId: details.id,
        title: details.name,
        coverUrl: details.image,
        platform: addPlatform,
        status: addStatus,
        hoursPlayed: addHours,
        notes: addNotes,
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
    if (window.confirm('¿Deseas eliminar este juego de tu biblioteca?')) {
      await removeGame(userGame.id);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-shelf-950 flex flex-col items-center justify-center text-shelf-400">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <p className="text-sm">Cargando información del videojuego...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-shelf-950 p-6 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 max-w-md">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h2 className="text-base font-bold text-white mb-1">Error al cargar juego</h2>
          <p className="text-xs text-shelf-300 mb-4">{error || 'Juego no encontrado.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-shelf-800 hover:bg-shelf-700 text-xs font-medium text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la biblioteca</span>
          </Link>
        </div>
      </div>
    );
  }

  const ratingData = details.rating ? formatRating(details.rating.mean) : null;
  const platforms = details.platforms?.map((p) => p.name) || ['PC', 'PlayStation 5', 'Xbox', 'Switch'];

  return (
    <div className="min-h-screen bg-shelf-950 text-shelf-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Navegación Volver */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-shelf-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-shelf-900 border border-shelf-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a mi colección</span>
          </Link>
        </div>

        {/* Ficha Principal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-shelf-900/60 border border-shelf-800/80 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
          {/* Carátula */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="aspect-cover w-full rounded-xl overflow-hidden shadow-2xl border border-shelf-700/80 bg-shelf-950">
              <GameImage src={details.image} alt={details.name} />
            </div>

            {ratingData && (
              <div className="p-3 rounded-xl bg-shelf-850 border border-shelf-750 flex items-center justify-between text-xs">
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
                className="w-full py-2 px-3 rounded-lg bg-shelf-800 hover:bg-shelf-750 border border-shelf-700 text-shelf-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Ficha oficial GameBrain</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Información y Seguimiento */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-shelf-400 mb-2">
                <span>GameBrain ID: #{details.id}</span>
                {userGame && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 text-[10px] font-semibold">
                    En tu biblioteca
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {details.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                {details.year && (
                  <span className="px-2.5 py-1 rounded-md bg-shelf-800 border border-shelf-700 text-shelf-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-shelf-400" />
                    {details.year}
                  </span>
                )}
                {details.developer && (
                  <span className="px-2.5 py-1 rounded-md bg-shelf-800 border border-shelf-700 text-shelf-300">
                    {details.developer}
                  </span>
                )}
                {details.genre && (
                  <span className="px-2.5 py-1 rounded-md bg-shelf-800 border border-shelf-700 text-brand-purple">
                    {details.genre}
                  </span>
                )}
              </div>

              {/* Plataformas */}
              {details.platforms && details.platforms.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {details.platforms.map((p) => (
                    <span
                      key={p.value}
                      className="text-xs font-mono px-2 py-0.5 rounded bg-shelf-850 text-shelf-400 border border-shelf-800"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Descripción */}
              {(details.description || details.short_description) && (
                <div className="mt-5 text-sm text-shelf-300 leading-relaxed border-t border-shelf-800 pt-4 whitespace-pre-line">
                  {details.description || details.short_description}
                </div>
              )}
            </div>

            {/* Panel de Seguimiento Personal */}
            <div className="p-5 rounded-xl bg-shelf-850 border border-shelf-700/80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-brand-purple" />
                  <span>Seguimiento en GameShelf</span>
                </h3>

                {userGame && (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="text-xs text-brand-purple hover:underline flex items-center gap-1 font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar registro</span>
                  </button>
                )}
              </div>

              {userGame ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-shelf-900 border border-shelf-800">
                      <span className="text-[11px] text-shelf-400 block mb-1">Estado</span>
                      <StatusBadge status={userGame.status} size="md" />
                    </div>
                    <div className="p-3 rounded-lg bg-shelf-900 border border-shelf-800">
                      <span className="text-[11px] text-shelf-400 block mb-1">Horas jugadas</span>
                      <span className="text-sm font-bold font-mono text-white">
                        {formatHours(userGame.hoursPlayed)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-shelf-900 border border-shelf-800">
                      <span className="text-[11px] text-shelf-400 block mb-1">Plataforma</span>
                      <span className="text-xs font-mono text-white">{userGame.platform}</span>
                    </div>
                  </div>

                  {userGame.notes && (
                    <div className="p-3 rounded-lg bg-shelf-900 border border-shelf-800 text-xs">
                      <span className="text-[11px] font-semibold text-shelf-400 flex items-center gap-1 mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-brand-purple" />
                        <span>Notas personales:</span>
                      </span>
                      <p className="text-shelf-200 italic whitespace-pre-wrap">{userGame.notes}</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-shelf-500">
                    <span>Añadido el {formatDate(userGame.addedAt)}</span>
                    <button
                      onClick={handleDelete}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar de mi biblioteca</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-shelf-300">
                    Añade este videojuego a tu biblioteca para llevar la cuenta de tus horas y estado:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-shelf-400 mb-1">Estado</label>
                      <select
                        value={addStatus}
                        onChange={(e) => setAddStatus(e.target.value as GameStatus)}
                        className="w-full bg-shelf-900 border border-shelf-700 text-xs rounded-lg px-2.5 py-2 text-white"
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
                        className="w-full bg-shelf-900 border border-shelf-700 text-xs rounded-lg px-2.5 py-2 text-white"
                      >
                        {platforms.map((p) => (
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
                        value={addHours}
                        onChange={(e) => setAddHours(parseFloat(e.target.value) || 0)}
                        className="w-full bg-shelf-900 border border-shelf-700 text-xs rounded-lg px-2.5 py-2 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Notas iniciales (opcional)..."
                      value={addNotes}
                      onChange={(e) => setAddNotes(e.target.value)}
                      className="w-full bg-shelf-900 border border-shelf-700 text-xs rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={isAdding}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-glow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAdding ? 'Añadiendo...' : 'Añadir a mi biblioteca'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {userGame && (
        <EditGameModal
          game={userGame}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={async (id, updates) => {
            await updateGame(id, updates);
          }}
        />
      )}
    </div>
  );
}
