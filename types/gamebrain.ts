export interface GameBrainRating {
  mean?: number;
  count?: number;
  mean_players?: number;
  count_players?: number;
  mean_critics?: number;
  count_critics?: number;
}

export interface GameBrainPlatform {
  value: string;
  name: string;
}

export interface GameBrainGenre {
  value: string;
  name: string;
}

export interface GameBrainPlaytime {
  min?: number;
  median?: number;
  max?: number;
  mean?: number;
  mentions?: number;
  percentiles?: number[];
}

export interface GameBrainGame {
  id: number;
  name: string;
  year?: number;
  genre?: string;
  image?: string | null;
  link?: string;
  rating?: GameBrainRating;
  adult_only?: boolean;
  screenshots?: string[];
  micro_trailer?: string;
  gameplay?: string;
  short_description?: string;
  description?: string;
  release_date?: string;
  developer?: string;
  platforms?: GameBrainPlatform[];
  genres?: GameBrainGenre[];
  playtime?: GameBrainPlaytime;
}

export interface GameBrainSearchResponse {
  query?: string;
  total_results?: number;
  limit?: number;
  offset?: number;
  results: GameBrainGame[];
}

export type ApiErrorCode =
  | 'MISSING_API_KEY'
  | 'INVALID_API_KEY'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'UPSTREAM_ERROR'
  | 'NETWORK_ERROR';

export interface ApiErrorResponse {
  error: ApiErrorCode;
  message: string;
  status: number;
}
