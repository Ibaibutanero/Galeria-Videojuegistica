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
  Sparkles,
  Search,
  X,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Database,
} from 'lucide-react';
import { GameBrainGame } from '@/types/gamebrain';

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
    if (selectedFilter === 'all') return 'Todos los Videojuegos';
    if (selectedFilter === 'playing') return 'Jugando Actualmente';
    if (selectedFilter === 'pending') return 'Juegos Pendientes';
    if (selectedFilter === 'completed') return 'Juegos Completados';
    if (selectedFilter === 'paused') return 'En Pausa';
    if (selectedFilter === 'abandoned') return 'Abandonados';
    return 'Biblioteca';
  };

  return (
    <div className="min-h-screen bg-shelf-950 flex flex-col md:flex-row text-shelf-100 selection:bg-brand-purple selection:text-white">
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

          {/* Aviso discreto si el modo de demostración está activo */}
          {isMockMode && (
            <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
              <span>
                🛡️ <strong>Modo Demostración activo:</strong> Desarrollando con catálogo local protegido. Cero peticiones a GameBrain para conservar cuota.
              </span>
              <span className="font-mono text-[10px] text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                GAMEDATA_MOCK_MODE=true
              </span>
            </div>
          )}

          {/* Cabecera de la sección actual */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                  <span>Organiza tu biblioteca personal, registra horas y haz seguimiento</span>
                )}
              </p>
            </div>

            {/* Botón principal de añadir y copia de seguridad */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenBackup('export')}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-xl bg-shelf-850 hover:bg-shelf-800 border border-shelf-750 text-shelf-300 hover:text-white font-medium text-xs sm:text-sm transition-all"
                title="Copia de seguridad: Exportar o Importar JSON"
              >
                <Database className="w-4 h-4 text-brand-purple" />
                <span className="hidden sm:inline">Copia de seguridad</span>
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-glow hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir juego</span>
              </button>
            </div>
          </div>

          {/* Barra de Filtros, Búsqueda y Ordenación */}
          <div className="p-3 sm:p-4 rounded-2xl bg-shelf-900/70 border border-shelf-800 space-y-3 backdrop-blur-sm shadow-sm">
            {/* Fila 1: Filtros de Estado */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-shelf-800 text-white border border-shelf-700 shadow-sm'
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
                      ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/40 font-semibold shadow-glow'
                      : 'text-shelf-400 hover:text-white hover:bg-shelf-850'
                  }`}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>

            {/* Fila 2: Buscador por título, Plataforma y Ordenación */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-shelf-800/80">
              {/* Buscador de juegos guardados */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-shelf-400" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Buscar por título guardado..."
                  className="w-full pl-9 pr-8 py-1.5 bg-shelf-850 border border-shelf-750 rounded-xl text-xs text-white placeholder-shelf-500 focus:outline-none focus:border-brand-purple"
                />
                {librarySearch && (
                  <button
                    onClick={() => setLibrarySearch('')}
                    className="absolute right-2.5 top-2 text-shelf-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Controles de Plataforma y Ordenación */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Filtro por plataforma */}
                {availablePlatforms.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-shelf-400 bg-shelf-850 px-2.5 py-1.5 rounded-xl border border-shelf-750">
                    <Layers className="w-3.5 h-3.5 text-shelf-400" />
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
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

                {/* Selector de Ordenación (Ordenar por) */}
                <div className="flex items-center gap-1.5 text-xs text-shelf-400 bg-shelf-850 px-2.5 py-1.5 rounded-xl border border-shelf-750">
                  <ArrowUpDown className="w-3.5 h-3.5 text-shelf-400" />
                  <span className="text-[11px] text-shelf-400 hidden sm:inline">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as LibrarySortBy)}
                    className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="addedAt" className="bg-shelf-900 text-white">
                      Fecha de incorporación
                    </option>
                    <option value="title" className="bg-shelf-900 text-white">
                      Título
                    </option>
                    <option value="hoursPlayed" className="bg-shelf-900 text-white">
                      Horas jugadas
                    </option>
                  </select>

                  {/* Alternar orden Ascendente / Descendente */}
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-1 rounded text-shelf-400 hover:text-white transition-colors ml-1"
                    title={sortOrder === 'desc' ? 'Orden descendente (invertir)' : 'Orden ascendente (invertir)'}
                  >
                    {sortOrder === 'desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-brand-purple" />
                    ) : (
                      <ArrowUp className="w-3.5 h-3.5 text-brand-purple" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cuadrícula de videojuegos con proporción 2:3 y navegación a ficha individual */}
          <GameGrid
            games={filteredGames}
            loading={loading}
            selectedFilter={selectedFilter}
            selectedPlatform={selectedPlatform}
            searchQuery={librarySearch}
            onSelectGame={(game) => {
              // Al pulsar una carátula, navega a la página de detalles bien diseñada
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

      {/* Modal de Búsqueda de Videojuegos (en vivo o catálogo mock) */}
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

      {/* Modal de Copia de Seguridad (Exportar / Importar JSON) */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        initialTab={backupTab}
      />
    </div>
  );
}
