import React from 'react';
import { GameStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/library';

interface StatusBadgeProps {
  status: GameStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  showDot = true,
}) => {
  const label = STATUS_LABELS[status] || status;
  const config = STATUS_COLORS[status] || STATUS_COLORS.pending;

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {label}
    </span>
  );
};
