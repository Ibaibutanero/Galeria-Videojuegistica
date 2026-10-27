'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Menu, ShieldCheck, Database, Gamepad2 } from 'lucide-react';
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
  const { games } = useLibrary();
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setApiConfigured(Boolean(data?.configured));
        setIsMockMode(Boolean(data?.mockMode));
      })
      .catch(() => setApiConfigured(false));
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-shelf-750/80 bg-shelf-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Botón menú móvil y marca */}
      <div className="flex items-center gap-2.5 md:hidden">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-shelf-400 hover:text-shelf-200 hover:bg-shelf-850 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-shelf-850 border border-shelf-750 flex items-center justify-center text-brand-purple-light">
            <Gamepad2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            Game<span className="text-brand-purple-light">Shelf</span>
          </span>
        </div>
      </div>

      {/* Buscador superior con acceso directo de teclado */}
      <div className="flex-1 max-w-lg hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full h-9 px-3 rounded-lg bg-shelf-900 border border-shelf-750 hover:border-shelf-600 text-shelf-400 hover:text-shelf-200 flex items-center justify-between text-xs transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-shelf-500 group-hover:text-brand-purple-light transition-colors" />
            <span className="text-shelf-400">
              {isMockMode
                ? 'Buscar en catálogo local (Modo Demo)...'
                : 'Buscar títulos en GameBrain...'}
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] bg-shelf-850 border border-shelf-750 text-shelf-400 px-1.5 py-0.5 rounded">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Acciones del lado derecho */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Indicador discreto de Modo Demo / Conexión (Sin emojis) */}
        {isMockMode ? (
          <div
            title="Modo Demostración Activo: Desarrollando con catálogo local protegido, sin consumo de API externa."
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-shelf-750 bg-shelf-900/90 text-shelf-400"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-shelf-400" />
            <span>Modo Demo</span>
          </div>
        ) : apiConfigured === true ? (
          <div
            title="Conexión activa con GameBrain API"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>API Online</span>
          </div>
        ) : (
          <div
            title="Clave de API pendiente de configurar"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-amber-500/20 bg-amber-500/5 text-amber-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Sin API</span>
          </div>
        )}

        {/* Botón Copia de Seguridad */}
        <button
          type="button"
          onClick={() => onOpenBackup?.('export')}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-shelf-900 hover:bg-shelf-850 border border-shelf-750 hover:border-shelf-700 text-shelf-300 hover:text-white text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
          title="Exportar o importar copia de seguridad de la biblioteca"
        >
          <Database className="w-3.5 h-3.5 text-shelf-400" />
          <span>Copia</span>
        </button>

        {/* Botón primario: Añadir Juego */}
        <button
          onClick={onOpenSearch}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white font-medium text-xs shadow-subtle transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Añadir juego</span>
          <span className="sm:hidden">Añadir</span>
        </button>
      </div>
    </header>
  );
};
