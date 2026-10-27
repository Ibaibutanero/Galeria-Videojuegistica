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
        className={`w-full h-full flex flex-col items-center justify-center bg-shelf-900 border border-shelf-800 text-shelf-400 p-3 text-center select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-shelf-850 border border-shelf-750 flex items-center justify-center mb-2 shadow-subtle">
          <Gamepad2 className="w-5 h-5 text-shelf-500" />
        </div>
        <span className="text-xs font-medium text-shelf-300 line-clamp-2 px-1 leading-snug">
          {alt}
        </span>
        <span className="text-[10px] text-shelf-400 mt-1 uppercase tracking-wider font-mono">
          Sin carátula
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-shelf-900 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-shelf-850 animate-pulse flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-shelf-700" />
        </div>
      )}
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
