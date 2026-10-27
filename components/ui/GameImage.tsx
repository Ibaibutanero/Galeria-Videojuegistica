'use client';

import React, { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

interface GameImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const GameImage: React.FC<GameImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showFallback = !src || hasError;

  if (showFallback) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-shelf-800 to-shelf-900 border border-shelf-700/40 text-shelf-400 p-4 text-center select-none ${className}`}
      >
        <div className="w-12 h-12 rounded-xl bg-shelf-700/40 border border-shelf-600/30 flex items-center justify-center mb-2 shadow-inner">
          <Gamepad2 className="w-6 h-6 text-shelf-400/80" />
        </div>
        <span className="text-xs font-medium text-shelf-400 line-clamp-2 px-1">
          {alt}
        </span>
        <span className="text-[10px] text-shelf-500 mt-1 uppercase tracking-wider font-mono">
          Sin imagen
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-shelf-900 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-shelf-800/80 animate-pulse flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-shelf-700 animate-bounce" />
        </div>
      )}
      {/* Usamos etiqueta img nativa con lazy loading para tolerar todos los dominios de GameBrain sin restricciones */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
