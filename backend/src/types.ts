export type GameResult = "win" | "draw" | "loss" | "unknown";

export interface RawChessPlayer {
  username?: string;
  rating?: number;
  result?: string;
}

export interface RawGame {
  id?: string;
  uuid?: string;
  url?: string;
  pgn?: string;
  rated?: boolean;
  time_class?: string;
  time_control?: string;
  rules?: string;
  eco?: string;
  opening?: string;
  end_time?: number;
  white?: RawChessPlayer;
  black?: RawChessPlayer;
  my_color?: "white" | "black";
  my_result?: string;
  my_rating?: number;
  opponent_rating?: number;
}

export interface DailySummary {
  date: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  ratingEnd?: number;
}

export interface SyncResult {
  username: string;
  fetchedGames: number;
  addedGames: number;
  totalGames: number;
  summaries: number;
  updatedAt: string;
}
