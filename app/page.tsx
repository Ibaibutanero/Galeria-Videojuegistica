'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/lib/context/library-context';
import { UserGame, GameStatus, STATUS_LABELS, LibrarySortBy } from '@/types/library';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { GameGrid } from '@/components/games/GameGrid';
import { EditGameModal } from '@/components/games/EditGameModal';
import { SearchModal } from '@/components/search/SearchModal';
import { BackupModal } from '@/components/backup/BackupModal';
import { ApiKeyBanner } from '@/components/ui/ApiKeyBanner';
import {
  Search,
  X,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Database,
  ShieldCheck,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const {
    games,
    loading,
    selectedFilter,
    setSelectedFilter,
    selectedPlatform,
    setSelectedPlatform,
    librarySearch,
    setLibrarySearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredGames,
    updateGame,
    removeGame,
    availablePlatforms,
  } = useLibrary();

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupTab, setBackupTab] = useState<'export' | 'import'>('export');
  const [gameForEdit, setGameForEdit] = useState<UserGame | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState<boolean | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  const handleOpenBackup = (tab: 'export' | 'import' = 'export') => {
    setBackupTab(tab);
    setIsBackupOpen(true);
  };

  // Check API configuration and mock mode on load
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setIsApiConfigured(Boolean(data?.configured));
        setIsMockMode(Boolean(data?.mockMode));
      })
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
    if (selectedFilter === 'all') return 'Todos los videojuegos';
    if (selectedFilter === 'playing') return 'Jugando actualmente';
    if (selectedFilter === 'pending') return 'Juegos pendientes';
    if (selectedFilter === 'completed') return 'Juegos completados';
    if (selectedFilter === 'paused') return 'En pausa';
    if (selectedFilter === 'abandoned') return 'Abandonados';
    return 'Biblioteca';
  };

  return (
    <div className="min-h-screen bg-shelf-950 flex flex-col md:flex-row text-shelf-200">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBackup={handleOpenBackup}
      />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col md:pl-60 lg:pl-64 min-w-0">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenBackup={handleOpenBackup}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Banner de aviso si la API no está configurada y tampoco está en modo mock */}
          {isApiConfigured === false && !isMockMode && <ApiKeyBanner />}

          {/* Aviso discreto si el modo de demostración está activo (Sin emojis) */}
          {isMockMode && (
            <div className="px-3.5 py-2 rounded-xl bg-shelf-900 border border-shelf-750 text-xs flex items-center justify-between text-shelf-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-shelf-400 shrink-0" />
                <span>
                  <strong>Modo Demostración activo:</strong> Catálogo local protegido. Cero peticiones de red para preservar cuota.
                </span>
              </div>
              <span className="hidden sm:inline-block font-mono text-[10px] text-shelf-400 bg-shelf-850 px-2 py-0.5 rounded border border-shelf-750">
                GAMEDATA_MOCK_MODE=true
              </span>
            </div>
          )}

          {/* Encabezado principal de la biblioteca */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {getFilterHeading()}
                </h1>
                <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-shelf-900 text-shelf-300 border border-shelf-750">
                  {filteredGames.length} {filteredGames.length === 1 ? 'juego' : 'juegos'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-shelf-400 mt-1">
                {selectedPlatform !== 'all' ? (
                  <span>
                    Filtrado por plataforma:{' '}
                    <strong className="text-shelf-200">{selectedPlatform}</strong>
                  </span>
                ) : (
                  <span>Colección personal y seguimiento de progreso</span>
                )}
              </p>
            </div>

            {/* Acciones principales de la biblioteca */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenBackup('export')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-shelf-900 hover:bg-shelf-850 border border-shelf-750 hover:border-shelf-700 text-shelf-300 hover:text-white font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                title="Copia de seguridad: Exportar o Importar JSON"
              >
                <Database className="w-3.5 h-3.5 text-shelf-400" />
                <span>Copia de seguridad</span>
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white font-medium text-xs shadow-subtle transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir juego</span>
              </button>
            </div>
          </div>

          {/* Sistema unificado de Filtros, Búsqueda y Ordenación */}
          <div className="p-3 sm:p-4 rounded-xl bg-shelf-900 border border-shelf-750/80 space-y-3 shadow-subtle">
            {/* Pestañas de Estado */}
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                  selectedFilter === 'all'
                    ? 'bg-shelf-850 text-white font-semibold border border-shelf-700/80 shadow-subtle'
                    : 'text-shelf-400 hover:text-white hover:bg-shelf-850/60'
                }`}
              >
                Todos
              </button>
              {(Object.keys(STATUS_LABELS) as GameStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                    selectedFilter === st
                      ? 'bg-shelf-850 text-white font-semibold border border-shelf-700/80 shadow-subtle'
                      : 'text-shelf-400 hover:text-white hover:bg-shelf-850/60'
                  }`}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>

            {/* Barra secundaria: Buscador en biblioteca, Plataforma y Ordenación */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-shelf-800">
              {/* Buscador de títulos guardados */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-shelf-400" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Buscar en mis juegos..."
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

              {/* Controles de Plataforma y Ordenación */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Filtro por plataforma */}
                {availablePlatforms.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs bg-shelf-850 px-2.5 py-1.5 rounded-lg border border-shelf-750">
                    <Layers className="w-3.5 h-3.5 text-shelf-400" />
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="bg-transparent text-shelf-200 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-shelf-900 text-white">
                        Plataformas ({games.length})
                      </option>
                      {availablePlatforms.map((plat) => (
                        <option key={plat} value={plat} className="bg-shelf-900 text-white">
                          {plat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Selector de Ordenación */}
                <div className="flex items-center gap-1 text-xs bg-shelf-850 px-2.5 py-1.5 rounded-lg border border-shelf-750">
                  <ArrowUpDown className="w-3.5 h-3.5 text-shelf-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as LibrarySortBy)}
                    className="bg-transparent text-shelf-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="addedAt" className="bg-shelf-900 text-white">
                      Fecha añadido
                    </option>
                    <option value="title" className="bg-shelf-900 text-white">
                      Título (A-Z)
                    </option>
                    <option value="hoursPlayed" className="bg-shelf-900 text-white">
                      Horas jugadas
                    </option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-0.5 rounded text-shelf-400 hover:text-white transition-colors"
                    title={sortOrder === 'desc' ? 'Orden descendente' : 'Orden ascendente'}
                  >
                    {sortOrder === 'desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-brand-purple-light" />
                    ) : (
                      <ArrowUp className="w-3.5 h-3.5 text-brand-purple-light" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cuadrícula de videojuegos con proporción 2:3 */}
          <GameGrid
            games={filteredGames}
            loading={loading}
            selectedFilter={selectedFilter}
            selectedPlatform={selectedPlatform}
            searchQuery={librarySearch}
            onSelectGame={(game) => {
              router.push(`/games/${game.gameId}`);
            }}
            onEditGame={(game) => setGameForEdit(game)}
            onDeleteGame={handleDeleteGame}
            onOpenSearch={() => setIsSearchOpen(true)}
            onResetFilters={() => {
              setSelectedFilter('all');
              setSelectedPlatform('all');
              setLibrarySearch('');
              setSortBy('addedAt');
              setSortOrder('desc');
            }}
          />
        </main>
      </div>

      {/* Modal de Búsqueda */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectGame={(game) => {
          setIsSearchOpen(false);
          router.push(`/games/${game.id}`);
        }}
      />

      {/* Modal de Edición Rápida */}
      <EditGameModal
        isOpen={Boolean(gameForEdit)}
        game={gameForEdit}
        onClose={() => setGameForEdit(null)}
        onSave={handleSaveEdit}
      />

      {/* Modal de Copia de Seguridad */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        initialTab={backupTab}
      />
    </div>
  );
}
