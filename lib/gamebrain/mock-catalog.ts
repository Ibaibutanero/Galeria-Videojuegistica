import { GameBrainGame, GameBrainSearchResponse } from '@/types/gamebrain';

/**
 * Catálogo local de demostración para GameShelf.
 * Se utiliza exclusivamente cuando GAMEDATA_MOCK_MODE=true para no consumir
 * cuota de la API de GameBrain durante el desarrollo y pruebas.
 */
export const MOCK_CATALOG: GameBrainGame[] = [
  {
    id: 1273795,
    name: 'Cyberpunk 2077',
    year: 2020,
    genre: 'Action Role Playing',
    image: 'https://img.gamebrain.co/games/418/the_witcher_3_wild_hunt_cdprojektred_2015_4286.jpg',
    link: 'https://gamebrain.co/game/cyberpunk-2077',
    developer: 'CD PROJEKT RED',
    release_date: '2020-12-10',
    rating: {
      mean: 0.88,
      count: 185420,
    },
    short_description:
      'Cyberpunk 2077 es una historia de acción y aventura en mundo abierto ambientada en Night City, una megalópolis obsesionada con el poder, el glamur y la modificación corporal.',
    description:
      'Cyberpunk 2077 es una aventura de acción en mundo abierto ambientada en la megalópolis futurista de Night City. Conviértete en V, un mercenario que busca un implante único que otorga el secreto de la inmortalidad. Personaliza el ciberware, las habilidades y el estilo de juego de tu personaje mientras exploras una ciudad inmensa donde tus decisiones dan forma a la historia.',
    platforms: [
      { value: 'playstation_5', name: 'Playstation 5' },
      { value: 'playstation_4', name: 'Playstation 4' },
      { value: 'xbox_series_xs', name: 'Xbox Series X|S' },
      { value: 'xbox_one', name: 'XBox One' },
      { value: 'pc', name: 'PC' },
      { value: 'windows', name: 'Windows' },
      { value: 'nintendo_switch-2', name: 'Nintendo Switch 2' },
      { value: 'nintendo_switch', name: 'Nintendo Switch' },
    ],
    screenshots: [
      'https://img.gamebrain.co/games/371/the_witcher_3_wild_hunt_cdprojektred_2016_7.webp',
      'https://img.gamebrain.co/games/311/the_witcher_3_wild_hunt_cdprojektred_2015_72.jpg',
      'https://img.gamebrain.co/games/520/the_witcher_3_wild_hunt_cdprojektred_2015_4333.webp',
      'https://img.gamebrain.co/games/525/the_witcher_3_wild_hunt_cdprojektred_2015_4338.webp',
    ],
  },
  {
    id: 434940,
    name: 'The Witcher 3: Wild Hunt',
    year: 2015,
    genre: 'Open World Role Playing',
    image: 'https://img.gamebrain.co/games/418/the_witcher_3_wild_hunt_cdprojektred_2015_4286.jpg',
    link: 'https://gamebrain.co/game/the-witcher-3-wild-hunt',
    developer: 'CD PROJEKT RED',
    release_date: '2015-05-19',
    rating: {
      mean: 0.95,
      count: 245802,
    },
    short_description:
      'Eres Geralt de Rivia, cazador de monstruos. En un mundo devastado por la guerra y plagado de bestias, debes cumplir tu contrato más importante: encontrar a Ciri, la niña de la profecía.',
    description:
      'The Witcher: Wild Hunt es un juego de rol basado en una historia ambientado en un universo de fantasía visualmente impresionante lleno de elecciones significativas y consecuencias impactantes. Conviértete en un cazador de monstruos a sueldo mientras recorres islas azotadas por el viento, pasos de montaña y cavernas olvidadas.',
    platforms: [
      { value: 'playstation_5', name: 'Playstation 5' },
      { value: 'playstation_4', name: 'Playstation 4' },
      { value: 'xbox_series_xs', name: 'Xbox Series X|S' },
      { value: 'xbox_one', name: 'XBox One' },
      { value: 'pc', name: 'PC' },
      { value: 'nintendo_switch', name: 'Nintendo Switch' },
    ],
    screenshots: [
      'https://img.gamebrain.co/games/371/the_witcher_3_wild_hunt_cdprojektred_2016_7.webp',
      'https://img.gamebrain.co/games/311/the_witcher_3_wild_hunt_cdprojektred_2015_72.jpg',
      'https://img.gamebrain.co/games/520/the_witcher_3_wild_hunt_cdprojektred_2015_4333.webp',
      'https://img.gamebrain.co/games/525/the_witcher_3_wild_hunt_cdprojektred_2015_4338.webp',
    ],
  },
  {
    id: 15174,
    name: 'Portal 2',
    year: 2011,
    genre: 'Puzzle Platformer',
    image: 'https://img.gamebrain.co/games/424/portal_2_valve_2011_6.jpg',
    link: 'https://gamebrain.co/game/portal-2-2011',
    developer: 'Valve',
    release_date: '2011-04-19',
    rating: {
      mean: 0.96,
      count: 299612,
    },
    short_description:
      'Portal 2 introduce una vibrante variedad de personajes, una batería de desafíos innovadores y un catálogo mucho más amplio de misteriosas cámaras de pruebas en Aperture Science.',
    description:
      'La parte para un jugador de Portal 2 introduce un reparto dinámico de nuevos personajes, una gran cantidad de nuevos elementos de puzle y un conjunto mucho más grande de enrevesadas cámaras de pruebas. Los jugadores explorarán áreas nunca vistas de los laboratorios Aperture Science y se reencontrarán con GLaDOS.',
    platforms: [
      { value: 'pc', name: 'PC' },
      { value: 'nintendo_switch', name: 'Nintendo Switch' },
      { value: 'xbox_360', name: 'Xbox 360' },
      { value: 'playstation_3', name: 'Playstation 3' },
    ],
    screenshots: [
      'https://img.gamebrain.co/games/424/portal_2_valve_2011_6.jpg',
    ],
  },
  {
    id: 982341,
    name: 'The Legend of Zelda: Tears of the Kingdom',
    year: 2023,
    genre: 'Action Adventure',
    image: 'https://img.gamebrain.co/games/424/portal_2_valve_2011_6.jpg',
    link: 'https://gamebrain.co/game/the-legend-of-zelda-tears-of-the-kingdom',
    developer: 'Nintendo',
    release_date: '2023-05-12',
    rating: {
      mean: 0.96,
      count: 142100,
    },
    short_description:
      'Una épica aventura por las tierras y los cielos de Hyrule te espera en The Legend of Zelda: Tears of the Kingdom.',
    description:
      'En esta secuela de The Legend of Zelda: Breath of the Wild, decidirás tu propio camino a través de los extensos paisajes de Hyrule y las misteriosas islas flotantes de los cielos. Aprovecha el poder de las nuevas habilidades de Link para luchar contra las fuerzas malévolas que amenazan el reino.',
    platforms: [
      { value: 'nintendo_switch', name: 'Nintendo Switch' },
    ],
    screenshots: [],
  },
  {
    id: 872134,
    name: 'Elden Ring',
    year: 2022,
    genre: 'Action RPG',
    image: 'https://img.gamebrain.co/games/418/the_witcher_3_wild_hunt_cdprojektred_2015_4286.jpg',
    link: 'https://gamebrain.co/game/elden-ring',
    developer: 'FromSoftware',
    release_date: '2022-02-25',
    rating: {
      mean: 0.95,
      count: 220450,
    },
    short_description:
      'Álzate, Sinluz, y que la gracia te guíe para abrazar el poder del Círculo de Elden y encumbrarte como señor del Círculo en las Tierras Intermedias.',
    description:
      'Un nuevo mundo de fantasía creado por Hidetaka Miyazaki, creador de la influyente saga DARK SOULS, y George R. R. Martin, autor de Canción de hielo y fuego. Desentraña los misterios del poder del Círculo de Elden y enfréntate a temibles adversarios con profundas historias de fondo.',
    platforms: [
      { value: 'playstation_5', name: 'Playstation 5' },
      { value: 'playstation_4', name: 'Playstation 4' },
      { value: 'xbox_series_xs', name: 'Xbox Series X|S' },
      { value: 'xbox_one', name: 'XBox One' },
      { value: 'pc', name: 'PC' },
    ],
    screenshots: [],
  },
  {
    id: 54312,
    name: 'Bloodborne',
    year: 2015,
    genre: 'Action RPG',
    image: null, // Ejemplo realista de juego sin imagen para verificar fallback
    link: 'https://gamebrain.co/game/bloodborne',
    developer: 'FromSoftware',
    release_date: '2015-03-24',
    rating: {
      mean: 0.93,
      count: 178900,
    },
    short_description:
      'Afronta tus pesadillas mientras buscas respuestas en la antigua ciudad de Yharnam, ahora maldita por una extraña enfermedad endémica.',
    description:
      'Enfrenta tus miedos mientras buscas respuestas en la antigua ciudad de Yharnam, ahora infectada por una extraña plaga que se extiende por las calles como un reguero de pólvora. El peligro, la locura y las criaturas de pesadilla acechan en cada esquina.',
    platforms: [
      { value: 'playstation_5', name: 'Playstation 5' },
      { value: 'playstation_4', name: 'Playstation 4' },
    ],
    screenshots: [],
  },
  {
    id: 765432,
    name: 'Red Dead Redemption 2',
    year: 2018,
    genre: 'Open World Western',
    image: 'https://img.gamebrain.co/games/418/the_witcher_3_wild_hunt_cdprojektred_2015_4286.jpg',
    link: 'https://gamebrain.co/game/red-dead-redemption-2',
    developer: 'Rockstar Games',
    release_date: '2018-10-26',
    rating: {
      mean: 0.96,
      count: 260300,
    },
    short_description:
      'América, 1899. El ocaso del Salvaje Oeste ha comenzado. Arthur Morgan y la banda de Van der Linde se ven forzados a huir.',
    description:
      'Con agentes federales y los mejores cazarrecompensas de la nación pisándoles los talones, la banda debe atracar, robar y luchar a través del abrupto territorio del corazón de América para sobrevivir.',
    platforms: [
      { value: 'playstation_5', name: 'Playstation 5' },
      { value: 'playstation_4', name: 'Playstation 4' },
      { value: 'xbox_series_xs', name: 'Xbox Series X|S' },
      { value: 'xbox_one', name: 'XBox One' },
      { value: 'pc', name: 'PC' },
    ],
    screenshots: [],
  },
  {
    id: 23451,
    name: 'Grand Theft Auto IV',
    year: 2008,
    genre: 'Open World Action',
    image: 'https://img.gamebrain.co/games/424/portal_2_valve_2011_6.jpg',
    link: 'https://gamebrain.co/game/grand-theft-auto-iv',
    developer: 'Rockstar North',
    release_date: '2008-04-29',
    rating: {
      mean: 0.94,
      count: 165400,
    },
    short_description:
      'Niko Bellic llega a Liberty City en busca del sueño americano y para escapar de un turbio pasado.',
    description:
      'Para Niko Bellic, recién desembarcado de Europa, es la esperanza de poder escapar de su pasado. Para su primo, Roman, es la visión de que juntos pueden encontrar fortuna en Liberty City, la puerta de entrada a la tierra de las oportunidades.',
    platforms: [
      { value: 'playstation_3', name: 'Playstation 3' },
      { value: 'xbox_360', name: 'Xbox 360' },
      { value: 'pc', name: 'PC' },
    ],
    screenshots: [],
  },
  {
    id: 1261640,
    name: 'Metroid Prime 4: Beyond',
    year: 2025,
    genre: 'Action Adventure',
    image: 'https://img.gamebrain.co/games/424/portal_2_valve_2011_6.jpg',
    link: 'https://gamebrain.co/game/metroid-prime-4',
    developer: 'Retro Studios',
    release_date: '2025-11-20',
    rating: {
      mean: 0.92,
      count: 14200,
    },
    short_description:
      'Samus Aran se embarca en una nueva misión galáctica en primera persona para descubrir misterios ocultos.',
    description:
      'La cazarrecompensas más formidable de la galaxia regresa en una nueva odisea planetaria llena de exploración, combates intensos y tecnología alienígena.',
    platforms: [
      { value: 'nintendo_switch-2', name: 'Nintendo Switch 2' },
      { value: 'nintendo_switch', name: 'Nintendo Switch' },
    ],
    screenshots: [],
  },
  {
    id: 345678,
    name: 'Hollow Knight',
    year: 2017,
    genre: 'Metroidvania',
    image: 'https://img.gamebrain.co/games/418/the_witcher_3_wild_hunt_cdprojektred_2015_4286.jpg',
    link: 'https://gamebrain.co/game/hollow-knight',
    developer: 'Team Cherry',
    release_date: '2017-02-24',
    rating: {
      mean: 0.95,
      count: 210000,
    },
    short_description:
      'Forja tu propio camino a través de Hallownest, un vasto reino subterráneo en ruinas lleno de misterios y peligros.',
    description:
      'Hollow Knight es una clásica aventura de acción en 2D ambientada en un vasto mundo interconectado. Explora cavernas serpenteantes, ciudades antiguas y páramos mortales mientras combates a criaturas corrompidas.',
    platforms: [
      { value: 'pc', name: 'PC' },
      { value: 'nintendo_switch', name: 'Nintendo Switch' },
      { value: 'playstation_5', name: 'Playstation 5' },
      { value: 'xbox_series_xs', name: 'Xbox Series X|S' },
    ],
    screenshots: [],
  },
];

/**
 * Búsqueda en el catálogo de demostración (cero llamadas de red).
 */
export function mockSearchGames(
  query: string,
  options: { limit?: number; offset?: number } = {}
): GameBrainSearchResponse {
  const limit = options.limit ?? 12;
  const offset = options.offset ?? 0;
  const cleanQuery = query.toLowerCase().trim();

  let matches = MOCK_CATALOG;
  if (cleanQuery) {
    matches = MOCK_CATALOG.filter((game) => {
      const matchName = game.name.toLowerCase().includes(cleanQuery);
      const matchGenre = game.genre ? game.genre.toLowerCase().includes(cleanQuery) : false;
      const matchDev = game.developer ? game.developer.toLowerCase().includes(cleanQuery) : false;
      const matchShortDesc = game.short_description ? game.short_description.toLowerCase().includes(cleanQuery) : false;
      const matchDesc = game.description ? game.description.toLowerCase().includes(cleanQuery) : false;
      
      // Soporte para siglas y abreviaciones comunes
      const isGta = cleanQuery === 'gta' && game.name.toLowerCase().includes('grand theft auto');
      const isRdr = cleanQuery === 'rdr' && game.name.toLowerCase().includes('red dead redemption');
      const isTotk = cleanQuery === 'totk' && game.name.toLowerCase().includes('tears of the kingdom');
      const isBg3 = cleanQuery === 'bg3' && game.name.toLowerCase().includes('baldur');

      return matchName || matchGenre || matchDev || matchShortDesc || matchDesc || isGta || isRdr || isTotk || isBg3;
    });
  }

  const paginated = matches.slice(offset, offset + limit);

  return {
    query,
    total_results: matches.length,
    limit,
    offset,
    results: paginated,
  };
}

/**
 * Obtener detalle de juego del catálogo de demostración (cero llamadas de red).
 */
export function mockGetGameDetail(id: number | string): GameBrainGame {
  const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
  const found = MOCK_CATALOG.find((g) => g.id === numId);

  if (found) {
    return found;
  }

  // Si no está exactamente en el mock, devolver un esquema representativo seguro sin fallar
  return {
    id: numId,
    name: `Videojuego #${numId}`,
    year: 2024,
    genre: 'Acción y Aventura',
    image: null,
    rating: { mean: 0.9, count: 1000 },
    description: 'Ficha generada localmente en modo demostración.',
    short_description: 'Modo demostración activo.',
    developer: 'Desarrollador Demo',
    platforms: [
      { value: 'pc', name: 'PC' },
      { value: 'playstation_5', name: 'Playstation 5' },
      { value: 'xbox_series_xs', name: 'Xbox Series X|S' },
      { value: 'nintendo_switch', name: 'Nintendo Switch' },
    ],
    screenshots: [],
  };
}
