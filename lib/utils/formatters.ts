export function formatHours(hours: number): string {
  if (!hours || hours <= 0) return '0 h';
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  const rounded = Number.isInteger(hours) ? hours.toString() : hours.toFixed(1);
  return `${rounded} h`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatRating(mean?: number): { score: number; text: string } | null {
  if (mean === undefined || mean === null) return null;
  // Mean suele venir como valor entre 0 y 1 (ej 0.94) o entre 0 y 100
  const score = mean <= 1 ? Math.round(mean * 100) : Math.round(mean);
  return {
    score,
    text: `${score}%`,
  };
}
