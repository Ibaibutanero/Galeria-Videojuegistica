'use client';

import React, { useState, useEffect } from 'react';
import { useLibrary } from '@/lib/context/library-context';
import { UserGame, GameStatus, STATUS_LABELS } from '@/types/library';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { GameGrid } from '@/components/games/GameGrid';
import { GameDetailModal } from '@/components/games/GameDetailModal';
import { EditGameModal } from '@/components/games/EditGameModal';
import { SearchModal } from '@/components/search/SearchModal';
import { ApiKeyBanner } from '@/components/ui/ApiKeyBanner';
import { Sparkles, Search, Layers, X, Plus } from 'lucide-react';
import { GameBrainGame } from '@/types/gamebrain';

export default function HomePage() {
  const {
    games,
    loading,
    selectedFilter,
    setSelectedFilter,
    selectedPlatform,
    setSelectedPlatform,
    librarySearch,
    setLibrarySearch,
    filteredGames,
    updateGame,
    removeGame,
    availablePlatforms,
  } = useLibrary();

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGameForDetail, setSelectedGameForDetail] = useState<{
    id: number;
    title: string;
    coverUrl?: string | null;
    userGame?: UserGame;
    catalogData?: GameBrainGame;
  } | null>(null);
  const [gameForEdit, setGameForEdit] = useState<UserGame | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState<boolean | null>(null);

  // Check API configuration on load
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setIsApiConfigured(Boolean(data?.configured)))
      .catch(() => setIsApiConfigured(false));
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSelectedGameForDetail(null);
        setGameForEdit(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveEdit = async (
    id: string,
    updates: {
      status: GameStatus;
      hoursPlayed: number;
      notes: string;
      platform: string;
    }
  ) => {
    await updateGame(id, updates);
  };

  const handleDeleteGame = async (game: UserGame) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${game.title}" de tu biblioteca?`)) {
      await removeGame(game.id);
    }
  };

  // Título según filtro
  const getFilterHeading = () => {
    if (selectedFilter === 'all') return 'Todos los Videojuegos';
    if (selectedFilter === 'playing') return 'Jugando Actualmente';
    if (selectedFilter === 'pending') return 'Juegos Pendientes';
    if (selectedFilter === 'completed') return 'Juegos Completados';
    if (selectedFilter === 'paused') return 'En Pausa';
    if (selectedFilter === 'abandoned') return 'Abandonados';
    return 'Biblioteca';
  };

  return (
    <div className="min-h-screen bg-shelf-950 flex flex-col md:flex-row">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col md:pl-60 lg:pl-64 min-w-0">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Banner de aviso si la API de GameBrain no está configurada */}
          {isApiConfigured === false && <ApiKeyBanner />}

          {/* Cabecera de la sección actual */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>{getFilterHeading()}</span>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-shelf-850 text-shelf-300 border border-shelf-750">
                  {filteredGames.length} {filteredGames.length === 1 ? 'juego' : 'juegos'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-shelf-400 mt-1">
                {selectedPlatform !== 'all' ? (
                  <span>
                    Filtrado por plataforma:{' '}
                    <strong className="text-shelf-200">{selectedPlatform}</strong>
                  </span>
                ) : (
                  <span>Tu catálogo visual de seguimiento y registro de horas</span>
                )}
              </p>
            </div>

            {/* Acciones principales */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir a biblioteca</span>
              </button>
            </div>
          </div>

          {/* Barra de filtros secundarios y buscador local */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-shelf-900/60 border border-shelf-800/80 mb-6 backdrop-blur-sm">
            {/* Filtros rápidos por estado */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-shelf-800 text-white border border-shelf-700'
                    : 'text-shelf-400 hover:text-white hover:bg-shelf-850'
                }`}
              >
                Todos
              </button>
              {(Object.keys(STATUS_LABELS) as GameStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedFilter === st
                      ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/40 font-semibold'
                      : 'text-shelf-400 hover:text-white hover:bg-shelf-850'
                  }`}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>

            {/* Buscador dentro de la colección local */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-shelf-400" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Filtrar colección..."
                  className="w-full pl-8 pr-7 py-1.5 bg-shelf-850 border border-shelf-750 rounded-lg text-xs text-white placeholder-shelf-500 focus:outline-none focus:border-brand-purple"
                />
                {librarySearch && (
                  <button
                    onClick={() => setLibrarySearch('')}
                    className="absolute right-2 top-2 text-shelf-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cuadrícula de videojuegos */}
          <GameGrid
            games={filteredGames}
            loading={loading}
            selectedFilter={selectedFilter}
            selectedPlatform={selectedPlatform}
            searchQuery={librarySearch}
            onSelectGame={(game) => {
              setSelectedGameForDetail({
                id: game.gameId,
                title: game.title,
                coverUrl: game.coverUrl,
                userGame: game,
              });
            }}
            onEditGame={(game) => setGameForEdit(game)}
            onDeleteGame={handleDeleteGame}
            onOpenSearch={() => setIsSearchOpen(true)}
            onResetFilters={() => {
              setSelectedFilter('all');
              setSelectedPlatform('all');
              setLibrarySearch('');
            }}
          />
        </main>
      </div>

      {/* Modal de Búsqueda GameBrain */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectGame={(game) => {
          setIsSearchOpen(false);
          setSelectedGameForDetail({
            id: game.id,
            title: game.title,
            coverUrl: game.coverUrl,
            catalogData: game.catalogData,
          });
        }}
      />

      {/* Modal de Ficha de Juego (Detalles + Gestión) */}
      <GameDetailModal
        isOpen={Boolean(selectedGameForDetail)}
        game={selectedGameForDetail}
        onClose={() => setSelectedGameForDetail(null)}
        onOpenEdit={(userGame) => {
          setSelectedGameForDetail(null);
          setGameForEdit(userGame);
        }}
      />

      {/* Modal de Edición de Datos Personales */}
      <EditGameModal
        isOpen={Boolean(gameForEdit)}
        game={gameForEdit}
        onClose={() => setGameForEdit(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
