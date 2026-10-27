'use client';

import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Menu, Layers, ShieldCheck, Database } from 'lucide-react';
import { useLibrary } from '@/lib/context/library-context';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
  onOpenBackup?: (tab?: 'export' | 'import') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onToggleSidebar,
  onOpenBackup,
}) => {
  const { games, selectedPlatform, setSelectedPlatform, availablePlatforms } = useLibrary();
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  useEffect(() => {
    // Comprobar estado de la API y si el modo mock está activo
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setApiConfigured(Boolean(data?.configured));
        setIsMockMode(Boolean(data?.mockMode));
      })
      .catch(() => setApiConfigured(false));
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-shelf-800 bg-shelf-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Botón menú móvil y título visible en móvil */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-shelf-400 hover:text-white hover:bg-shelf-850 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
          GAMESHELF
        </span>
      </div>

      {/* Buscador visible en la parte superior */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="w-full h-10 px-3.5 rounded-xl bg-shelf-900 border border-shelf-750 hover:border-shelf-600 text-shelf-400 hover:text-shelf-200 flex items-center justify-between text-xs sm:text-sm transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-shelf-400 group-hover:text-brand-purple transition-colors" />
            <span className="text-shelf-400 group-hover:text-shelf-300">
              {isMockMode
                ? 'Buscar en catálogo local (Modo Demo)...'
                : 'Buscar videojuegos en GameBrain...'}
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-shelf-800 border border-shelf-700 text-shelf-400 px-1.5 py-0.5 rounded">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Filtro rápido por plataforma y estado de API */}
      <div className="flex items-center gap-3">
        {/* Selector de plataforma si existen plataformas */}
        {availablePlatforms.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-shelf-400">
            <Layers className="w-3.5 h-3.5" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-shelf-900 border border-shelf-800 text-shelf-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-purple"
            >
              <option value="all">Todas las plataformas ({games.length})</option>
              {availablePlatforms.map((plat) => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Indicador de estado de API / Modo Mock */}
        <div
          title={
            isMockMode
              ? 'Modo Demostración Activo: Cero llamadas de red a GameBrain para no gastar cuota'
              : apiConfigured === true
              ? 'GameBrain API Conectada'
              : 'GameBrain API pendiente de configurar'
          }
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-shelf-900"
        >
          {isMockMode ? (
            <span className="flex items-center gap-1.5 text-cyan-400 border-cyan-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modo Demo (Sin red)</span>
            </span>
          ) : apiConfigured === true ? (
            <span className="flex items-center gap-1.5 text-emerald-400 border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>GameBrain API OK</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>API sin clave</span>
            </span>
          )}
        </div>

        {/* Botón de copia de seguridad */}
        <button
          type="button"
          onClick={() => onOpenBackup?.('export')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-shelf-900 hover:bg-shelf-850 border border-shelf-750 text-shelf-300 hover:text-white text-xs font-medium transition-colors"
          title="Exportar o importar copia de seguridad de la biblioteca"
        >
          <Database className="w-3.5 h-3.5 text-brand-purple" />
          <span>Copia</span>
        </button>

        {/* Botón primario de Explorar */}
        <button
          onClick={onOpenSearch}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-glow transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Añadir juego</span>
          <span className="sm:hidden">Buscar</span>
        </button>
      </div>
    </header>
  );
};
