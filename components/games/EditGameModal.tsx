'use client';

import React, { useState, useEffect } from 'react';
import { UserGame, GameStatus, STATUS_LABELS } from '@/types/library';
import { X, Clock, MessageSquare, Monitor, Check } from 'lucide-react';
import { GameImage } from '@/components/ui/GameImage';

interface EditGameModalProps {
  game: UserGame | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { status: GameStatus; hoursPlayed: number; notes: string; platform: string }) => Promise<void>;
}

export const EditGameModal: React.FC<EditGameModalProps> = ({
  game,
  isOpen,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<GameStatus>('playing');
  const [hoursPlayed, setHoursPlayed] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [platform, setPlatform] = useState<string>('PC');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (game) {
      setStatus(game.status);
      setHoursPlayed(game.hoursPlayed);
      setNotes(game.notes || '');
      setPlatform(game.platform || 'PC');
    }
  }, [game]);

  if (!isOpen || !game) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(game.id, {
        status,
        hoursPlayed: Math.max(0, Number(hoursPlayed) || 0),
        notes: notes.trim(),
        platform: platform.trim() || 'PC',
      });
      onClose();
    } catch (err) {
      console.error('Error guardando cambios:', err);
    } finally {
      setSaving(false);
    }
  };

  const platformsList = ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X|S', 'Xbox One', 'Nintendo Switch', 'Steam Deck', 'Móvil', 'Otro'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-shelf-900 border border-shelf-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-shelf-800 bg-shelf-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-14 rounded-md overflow-hidden bg-shelf-850 shrink-0 border border-shelf-700/60">
              <GameImage src={game.coverUrl} alt={game.title} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white line-clamp-1">{game.title}</h3>
              <p className="text-xs text-shelf-400">Editar datos en mi biblioteca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-shelf-400 hover:text-white hover:bg-shelf-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-2">
              Estado de Progreso
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABELS) as GameStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    status === st
                      ? 'bg-brand-purple/20 border-brand-purple text-brand-purple font-semibold shadow-glow'
                      : 'bg-shelf-850 border-shelf-750 text-shelf-300 hover:bg-shelf-800 hover:border-shelf-700'
                  }`}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>
          </div>

          {/* Horas y Plataforma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-shelf-400" />
                <span>Horas Jugadas</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hoursPlayed}
                onChange={(e) => setHoursPlayed(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-shelf-850 border border-shelf-700 text-white text-sm focus:outline-none focus:border-brand-purple font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-shelf-400" />
                <span>Plataforma</span>
              </label>
              <input
                list="platforms-list"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="Ej: PC, PS5, Switch..."
                className="w-full px-3 py-2 rounded-lg bg-shelf-850 border border-shelf-700 text-white text-sm focus:outline-none focus:border-brand-purple"
              />
              <datalist id="platforms-list">
                {platformsList.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Notas Personales */}
          <div>
            <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-shelf-400" />
              <span>Notas Personales</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Qué te ha parecido? ¿Algún apunte, build, logro o recuerdo?"
              className="w-full px-3 py-2 rounded-lg bg-shelf-850 border border-shelf-700 text-white text-sm focus:outline-none focus:border-brand-purple resize-none placeholder-shelf-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-shelf-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-shelf-300 hover:text-white hover:bg-shelf-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-purple hover:bg-purple-600 text-white text-sm font-medium shadow-glow transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
