'use client';

import React, { useState } from 'react';
import { AlertTriangle, Key, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ApiKeyBannerProps {
  onDismiss?: () => void;
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = () => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const envSnippet = 'GAMEBRAIN_API_KEY=tu_clave_aqui';

  const handleCopy = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-shelf-900 to-amber-500/5 p-4 shadow-lg backdrop-blur-md mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-200 flex items-center gap-2">
              <span>GameBrain API no configurada</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Acción Requerida
              </span>
            </h4>
            <p className="text-xs text-shelf-300 mt-1">
              Para buscar y añadir nuevos videojuegos desde el catálogo de más de 800.000 títulos de GameBrain, necesitas configurar tu clave gratuita de API.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all shrink-0"
        >
          {expanded ? (
            <>
              Ocultar guía <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Ver instrucciones <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-amber-500/20 text-xs text-shelf-300 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-shelf-850/80 border border-shelf-700/60">
              <span className="font-semibold text-white block mb-1">1. Obtén tu clave gratis</span>
              <p className="text-shelf-400 mb-2">
                Regístrate sin coste en la web oficial de GameBrain para obtener tu token.
              </p>
              <a
                href="https://gamebrain.co/api"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-cyan hover:underline font-medium"
              >
                gamebrain.co/api <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 rounded-lg bg-shelf-850/80 border border-shelf-700/60">
              <span className="font-semibold text-white block mb-1">2. Crea tu archivo local</span>
              <p className="text-shelf-400 mb-1">
                Crea un archivo llamado <code className="text-amber-300 font-mono bg-shelf-950 px-1 py-0.5 rounded">.env.local</code> en la raíz del proyecto:
              </p>
              <div className="flex items-center justify-between bg-shelf-950 px-2 py-1.5 rounded border border-shelf-800 font-mono text-[11px] text-shelf-300">
                <code>{envSnippet}</code>
                <button
                  onClick={handleCopy}
                  className="text-shelf-400 hover:text-white transition-colors ml-2"
                  title="Copiar snippet"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-shelf-850/80 border border-shelf-700/60">
              <span className="font-semibold text-white block mb-1">3. Reinicia la web</span>
              <p className="text-shelf-400 mb-2">
                Guarda el archivo y reinicia el servidor de Next.js para que cargue la nueva variable de entorno:
              </p>
              <code className="block bg-shelf-950 px-2 py-1 rounded border border-shelf-800 font-mono text-[11px] text-emerald-400">
                npm run dev
              </code>
            </div>
          </div>
          <p className="text-[11px] text-shelf-400 italic">
            * Tu clave se mantiene segura en el servidor de Next.js y nunca se expone en el navegador.
          </p>
        </div>
      )}
    </div>
  );
};
