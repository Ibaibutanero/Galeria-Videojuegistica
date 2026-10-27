'use client';

import React from 'react';
import { GameStatus } from '@/types/library';
import { useLibrary } from '@/lib/context/library-context';
import {
  Library,
  PlayCircle,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Gamepad2,
  Layers,
  X,
  Hourglass,
  Plus,
  Download,
  Upload,
  Database,
} from 'lucide-react';
import { formatHours } from '@/lib/utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onOpenBackup: (tab?: 'export' | 'import') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenBackup,
}) => {
  const {
    games,
    selectedFilter,
    setSelectedFilter,
    selectedPlatform,
    setSelectedPlatform,
    statusCounts,
    availablePlatforms,
  } = useLibrary();

  const navItems: Array<{
    id: 'all' | GameStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    color: string;
  }> = [
    {
      id: 'all',
      label: 'Biblioteca',
      icon: Library,
      count: statusCounts.all,
      color: 'text-shelf-200',
    },
    {
      id: 'playing',
      label: 'Jugando',
      icon: PlayCircle,
      count: statusCounts.playing,
      color: 'text-emerald-400',
    },
    {
      id: 'pending',
      label: 'Pendientes',
      icon: Clock,
      count: statusCounts.pending,
      color: 'text-amber-400',
    },
    {
      id: 'completed',
      label: 'Completados',
      icon: CheckCircle2,
      count: statusCounts.completed,
      color: 'text-cyan-400',
    },
    {
      id: 'paused',
      label: 'En pausa',
      icon: PauseCircle,
      count: statusCounts.paused,
      color: 'text-indigo-400',
    },
    {
      id: 'abandoned',
      label: 'Abandonados',
      icon: XCircle,
      count: statusCounts.abandoned,
      color: 'text-rose-400',
    },
  ];

  const totalHours = games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0);

  const handleSelectNav = (id: 'all' | GameStatus) => {
    setSelectedFilter(id);
    onClose(); // Cerrar drawer en móvil al seleccionar
  };

  const handleSelectPlatform = (plat: string) => {
    setSelectedPlatform(plat);
    onClose();
  };

  return (
    <>
      {/* Backdrop para dispositivos móviles */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in"
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 md:w-60 lg:w-64 bg-shelf-950 border-r border-shelf-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-shelf-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-indigo-600 flex items-center justify-center text-white shadow-glow">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                GAMESHELF
              </span>
              <span className="block text-[10px] text-shelf-500 uppercase tracking-widest font-mono">
                Game Library
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-shelf-400 hover:text-white hover:bg-shelf-850"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Sección Estados */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-shelf-500 uppercase tracking-wider">
                Colección
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = selectedFilter === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-shelf-850 text-white font-semibold border border-shelf-700/80 shadow-sm'
                        : 'text-shelf-400 hover:text-shelf-200 hover:bg-shelf-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? item.color : 'text-shelf-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${
                        active
                          ? 'bg-shelf-750 text-white'
                          : 'bg-shelf-900 text-shelf-500 border border-shelf-800'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sección Plataformas */}
          {availablePlatforms.length > 0 && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-shelf-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Plataformas</span>
                </span>
                {selectedPlatform !== 'all' && (
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className="text-[10px] text-brand-purple hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => handleSelectPlatform('all')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedPlatform === 'all'
                      ? 'bg-brand-purple/15 text-brand-purple font-semibold'
                      : 'text-shelf-400 hover:text-shelf-200 hover:bg-shelf-900'
                  }`}
                >
                  <span>Todas</span>
                  <span className="text-[10px] font-mono text-shelf-500">{games.length}</span>
                </button>

                {availablePlatforms.map((plat) => {
                  const active = selectedPlatform === plat;
                  const count = games.filter((g) => g.platform === plat).length;

                  return (
                    <button
                      key={plat}
                      onClick={() => handleSelectPlatform(plat)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-brand-purple/15 text-brand-purple font-semibold'
                          : 'text-shelf-400 hover:text-shelf-200 hover:bg-shelf-900'
                      }`}
                    >
                      <span className="line-clamp-1">{plat}</span>
                      <span className="text-[10px] font-mono text-shelf-500">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botón rápido Añadir */}
          <div className="px-1">
            <button
              onClick={() => {
                onOpenSearch();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-shelf-700/80 hover:border-brand-purple/60 text-shelf-400 hover:text-brand-purple text-xs font-medium flex items-center justify-center gap-2 transition-all hover:bg-brand-purple/5"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir nuevo juego</span>
            </button>
          </div>

          {/* Sección Copia de Seguridad */}
          <div className="pt-3 border-t border-shelf-800/80">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-shelf-500 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Copia de seguridad</span>
              </span>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onOpenBackup('export');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-shelf-400 hover:text-white hover:bg-shelf-900 transition-colors text-left"
              >
                <Download className="w-4 h-4 text-brand-purple shrink-0" />
                <span>Exportar biblioteca</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenBackup('import');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-shelf-400 hover:text-white hover:bg-shelf-900 transition-colors text-left"
              >
                <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Importar (.json)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="p-4 border-t border-shelf-800 bg-shelf-950/60">
          <div className="p-3 rounded-xl bg-shelf-900 border border-shelf-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-shelf-400 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-shelf-500" />
                <span>Total juegos</span>
              </span>
              <span className="font-mono font-bold text-white">{games.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-shelf-400 flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5 text-shelf-500" />
                <span>Horas totales</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {formatHours(totalHours)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
