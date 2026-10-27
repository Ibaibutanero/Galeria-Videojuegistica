'use client';

import React, { useState, useEffect } from 'react';
import { UserGame, GameStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/library';
import { X, Clock, MessageSquare, Monitor, Check, Loader2 } from 'lucide-react';
import { GameImage } from '@/components/ui/GameImage';
import { ALLOWED_PLATFORMS } from '@/lib/utils/platforms';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-shelf-900 border border-shelf-750 shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-shelf-750 bg-shelf-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-12 rounded-lg overflow-hidden bg-shelf-850 shrink-0 border border-shelf-750">
              <GameImage src={game.coverUrl} alt={game.title} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{game.title}</h3>
              <p className="text-xs text-shelf-400">Editar progreso en mi biblioteca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-shelf-400 hover:text-white hover:bg-shelf-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-2">
              Estado de Progreso
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABELS) as GameStatus[]).map((st) => {
                const active = status === st;
                const colors = STATUS_COLORS[st];
                return (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-center transition-all flex items-center justify-center gap-1.5 ${
                      active
                        ? `${colors.bg} ${colors.text} ${colors.border} font-bold shadow-subtle`
                        : 'bg-shelf-850 border-shelf-750 text-shelf-400 hover:text-white hover:bg-shelf-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    <span>{STATUS_LABELS[st]}</span>
                  </button>
                );
              })}
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
                className="w-full px-3 py-2 rounded-lg bg-shelf-850 border border-shelf-750 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-purple font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-shelf-400" />
                <span>Plataforma</span>
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-shelf-850 border border-shelf-750 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-purple"
              >
                {ALLOWED_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notas Personales */}
          <div>
            <label className="block text-xs font-semibold text-shelf-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-shelf-400" />
              <span>Notas Personales</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Qué te ha parecido? ¿Algún apunte, build, logro o recuerdo?"
              className="w-full px-3 py-2 rounded-lg bg-shelf-850 border border-shelf-750 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-purple resize-none placeholder-shelf-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-shelf-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-shelf-300 hover:text-white hover:bg-shelf-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-medium shadow-subtle transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
