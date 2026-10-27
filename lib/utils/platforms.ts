export const ALLOWED_PLATFORMS = [
  'Xbox Series X/S',
  'PS5',
  'PS4',
  'PS3',
  'Xbox 360',
  'PC',
  'Switch 2',
  'Nintendo Switch',
] as const;

export type AllowedPlatform = typeof ALLOWED_PLATFORMS[number];

/**
 * Normaliza un nombre de plataforma a una de las plataformas permitidas.
 */
export function normalizePlatformName(platform?: string | null): AllowedPlatform {
  if (!platform) return 'PC';
  const clean = platform.toLowerCase().trim();

  // Switch 2
  if (clean.includes('switch 2') || clean.includes('switch-2')) {
    return 'Switch 2';
  }
  // Nintendo Switch
  if (clean.includes('switch') || clean.includes('nintendo')) {
    return 'Nintendo Switch';
  }
  // PS5
  if (clean.includes('ps5') || clean.includes('playstation 5') || clean.includes('playstation_5')) {
    return 'PS5';
  }
  // PS4
  if (clean.includes('ps4') || clean.includes('playstation 4') || clean.includes('playstation_4')) {
    return 'PS4';
  }
  // PS3
  if (clean.includes('ps3') || clean.includes('playstation 3') || clean.includes('playstation_3')) {
    return 'PS3';
  }
  // Xbox Series X/S
  if (
    clean.includes('series') ||
    clean.includes('xbox series') ||
    clean.includes('xbox_series') ||
    clean.includes('xbox one') ||
    clean.includes('xbox_one')
  ) {
    return 'Xbox Series X/S';
  }
  // Xbox 360
  if (clean.includes('360')) {
    return 'Xbox 360';
  }
  // PC / Windows
  if (clean.includes('pc') || clean.includes('windows') || clean.includes('steam')) {
    return 'PC';
  }

  return 'PC';
}

/**
 * Resuelve y filtra las plataformas de un videojuego según las reglas:
 * 1. Solo se admiten las plataformas permitidas:
 *    - Xbox Series X/S
 *    - PS4 / PS5 (con prioridad de la más nueva: si está en PS5, solo PS5)
 *    - PS3
 *    - Xbox 360
 *    - PC
 *    - Nintendo Switch / Switch 2 (con prioridad de la más nueva: si está en Switch 2, solo Switch 2)
 * 2. Si un juego está en varias generaciones de la misma familia, siempre sale la más nueva.
 *    - PS4 y PS5 -> solo PS5
 *    - Switch y Switch 2 -> solo Switch 2
 *    - Xbox One y Xbox Series X/S -> solo Xbox Series X/S
 */
export function resolveGamePlatforms(
  rawPlatforms?: Array<{ value?: string; name?: string }> | string[] | null
): AllowedPlatform[] {
  if (!rawPlatforms || !Array.isArray(rawPlatforms) || rawPlatforms.length === 0) {
    return ['PC', 'PS5', 'Xbox Series X/S', 'Nintendo Switch'];
  }

  const keys = new Set<string>();

  for (const p of rawPlatforms) {
    if (typeof p === 'string') {
      keys.add(p.toLowerCase().trim());
    } else if (p && typeof p === 'object') {
      if (p.value) keys.add(p.value.toLowerCase().trim());
      if (p.name) keys.add(p.name.toLowerCase().trim());
    }
  }

  const result: AllowedPlatform[] = [];

  // 1. Xbox: Xbox Series X/S > Xbox 360
  const hasSeries =
    keys.has('xbox_series_xs') ||
    keys.has('xbox series x|s') ||
    keys.has('xbox series x/s') ||
    keys.has('xbox series x') ||
    keys.has('xbox series s') ||
    keys.has('series x') ||
    keys.has('series x/s') ||
    keys.has('xbox_one') ||
    keys.has('xbox one');

  const has360 = keys.has('xbox_360') || keys.has('xbox 360');

  if (hasSeries) {
    result.push('Xbox Series X/S');
  } else if (has360) {
    result.push('Xbox 360');
  }

  // 2. PlayStation: PS5 > PS4 > PS3
  const hasPS5 = keys.has('playstation_5') || keys.has('playstation 5') || keys.has('ps5');
  const hasPS4 = keys.has('playstation_4') || keys.has('playstation 4') || keys.has('ps4');
  const hasPS3 = keys.has('playstation_3') || keys.has('playstation 3') || keys.has('ps3');

  if (hasPS5) {
    result.push('PS5');
  } else if (hasPS4) {
    result.push('PS4');
  } else if (hasPS3) {
    result.push('PS3');
  }

  // 3. PC
  const hasPC = keys.has('pc') || keys.has('windows');
  if (hasPC) {
    result.push('PC');
  }

  // 4. Nintendo: Switch 2 > Nintendo Switch
  const hasSwitch2 =
    keys.has('nintendo_switch-2') ||
    keys.has('nintendo_switch_2') ||
    keys.has('nintendo switch 2') ||
    keys.has('switch 2');

  const hasSwitch1 =
    keys.has('nintendo_switch') ||
    keys.has('nintendo switch') ||
    keys.has('switch');

  if (hasSwitch2) {
    result.push('Switch 2');
  } else if (hasSwitch1) {
    result.push('Nintendo Switch');
  }

  // Si ninguna de las reglas coincidió pero se pasaron plataformas, devolver por defecto las compatibles
  if (result.length === 0) {
    return ['PC', 'PS5', 'Xbox Series X/S', 'Nintendo Switch'];
  }

  return result;
}
