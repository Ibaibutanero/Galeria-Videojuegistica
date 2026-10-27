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
      color: 'text-shelf-300',
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
      color: 'text-violet-400',
    },
    {
      id: 'paused',
      label: 'En pausa',
      icon: PauseCircle,
      count: statusCounts.paused,
      color: 'text-blue-400',
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
    onClose();
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 lg:w-64 bg-shelf-900 border-r border-shelf-750/80 flex flex-col transition-transform duration-200 ease-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Cabecera del Sidebar con Logotipo Tipográfico */}
        <div className="h-14 px-4 sm:px-5 border-b border-shelf-750/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-shelf-850 border border-shelf-750 flex items-center justify-center text-brand-purple-light shadow-subtle">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                Game<span className="text-brand-purple-light">Shelf</span>
              </span>
              <span className="text-[10px] text-shelf-400 tracking-wider font-mono">
                Colección Personal
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-shelf-400 hover:text-white hover:bg-shelf-800 transition-colors"
            aria-label="Cerrar menú lateral"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido de navegación scrolleable */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5 custom-scrollbar">
          {/* Navegación por Estados */}
          <div>
            <div className="px-2.5 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-shelf-400 uppercase tracking-widest font-mono">
                Estados
              </span>
            </div>

            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = selectedFilter === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                      active
                        ? 'bg-shelf-850 text-white font-semibold border border-shelf-700/80 shadow-subtle'
                        : 'text-shelf-300 hover:text-white hover:bg-shelf-850/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${active ? item.color : 'text-shelf-400 group-hover:text-shelf-300'}`} />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                        active
                          ? 'bg-shelf-750 text-white font-bold'
                          : 'bg-shelf-850 text-shelf-400 border border-shelf-750/60'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Navegación por Plataformas */}
          {availablePlatforms.length > 0 && (
            <div>
              <div className="px-2.5 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-shelf-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-shelf-400" />
                  <span>Plataformas</span>
                </span>
                {selectedPlatform !== 'all' && (
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className="text-[10px] text-brand-purple-light hover:underline font-mono"
                  >
                    Todas
                  </button>
                )}
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => handleSelectPlatform('all')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedPlatform === 'all'
                      ? 'bg-shelf-850 text-white font-semibold border border-shelf-700/80'
                      : 'text-shelf-400 hover:text-shelf-200 hover:bg-shelf-850/60'
                  }`}
                >
                  <span>Todas las plataformas</span>
                  <span className="text-[10px] font-mono text-shelf-400">{games.length}</span>
                </button>

                {availablePlatforms.map((plat) => {
                  const active = selectedPlatform === plat;
                  const count = games.filter((g) => g.platform === plat).length;

                  return (
                    <button
                      key={plat}
                      onClick={() => handleSelectPlatform(plat)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-shelf-850 text-white font-semibold border border-shelf-700/80'
                          : 'text-shelf-400 hover:text-shelf-200 hover:bg-shelf-850/60'
                      }`}
                    >
                      <span className="line-clamp-1">{plat}</span>
                      <span className="text-[10px] font-mono text-shelf-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botón rápido Añadir */}
          <div className="px-0.5 pt-1">
            <button
              onClick={() => {
                onOpenSearch();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-shelf-700 hover:border-brand-purple/60 text-shelf-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all hover:bg-shelf-850/60"
            >
              <Plus className="w-3.5 h-3.5 text-brand-purple-light" />
              <span>Añadir nuevo videojuego</span>
            </button>
          </div>

          {/* Sección Copia de Seguridad */}
          <div className="pt-3 border-t border-shelf-750/70">
            <div className="px-2.5 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-shelf-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Database className="w-3 h-3 text-shelf-400" />
                <span>Copia de seguridad</span>
              </span>
            </div>

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onOpenBackup('export');
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-shelf-300 hover:text-white hover:bg-shelf-850/60 transition-colors text-left"
              >
                <Download className="w-3.5 h-3.5 text-shelf-400 shrink-0" />
                <span>Exportar biblioteca</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenBackup('import');
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-shelf-300 hover:text-white hover:bg-shelf-850/60 transition-colors text-left"
              >
                <Upload className="w-3.5 h-3.5 text-shelf-400 shrink-0" />
                <span>Importar (.json)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tarjeta de Estadísticas en el Footer */}
        <div className="p-3 border-t border-shelf-750/80 bg-shelf-950/60">
          <div className="p-2.5 rounded-lg bg-shelf-850/90 border border-shelf-750/70 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-shelf-400 flex items-center gap-1.5 text-[11px]">
                <Gamepad2 className="w-3 h-3 text-shelf-400" />
                <span>Total juegos</span>
              </span>
              <span className="font-mono font-bold text-white text-xs">{games.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-shelf-400 flex items-center gap-1.5 text-[11px]">
                <Hourglass className="w-3 h-3 text-emerald-400" />
                <span>Horas totales</span>
              </span>
              <span className="font-mono font-bold text-emerald-400 text-xs">
                {formatHours(totalHours)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
