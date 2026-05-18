export type GameResult = "win" | "draw" | "loss" | "unknown";
export type TimeClass = "bullet" | "blitz" | "rapid" | "daily" | "unknown";

export interface RawGame {
  id?: string;
  url?: string;
  end_time?: number;
  time_control?: string;
  rated?: boolean;
  white?: {
    username?: string;
    result?: string;
    rating?: number;
  };
  black?: {
    username?: string;
    result?: string;
    rating?: number;
  };
  pgn?: string;
  eco?: string;
  opening?: string;
  time_class?: string;
  // Pre-computed fields (if present in file)
  my_color?: "white" | "black";
  my_result?: string;
  my_rating?: number;
  opponent_rating?: number;
}

export interface Game {
  id: string;
  url: string;
  date: Date;
  timeControl: string;
  timeClass: TimeClass;
  rated: boolean;
  myColor: "white" | "black";
  myResult: GameResult;
  myRating: number;
  opponentRating: number;
  opponentUsername: string;
  ratingDelta: number;
  eco: string;
  opening: string;
  pgn: string;
}

export interface DailySummary {
  date: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  ratingEnd?: number;
}

export interface OpeningStat {
  eco: string;
  name: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  avgRatingDelta: number;
  avgGameLength: number;
}

export interface StreakInfo {
  type: "win" | "loss" | "draw";
  length: number;
  startDate: Date;
  endDate: Date;
  games: Game[];
}

export interface TiltEvent {
  startTime: Date;
  endTime: Date;
  losses: number;
  games: Game[];
}

export interface SessionCluster {
  start: Date;
  end: Date;
  games: Game[];
  wins: number;
  draws: number;
  losses: number;
}

export interface Settings {
  username: string;
  dateRangeDays: number;
  animateCharts: boolean;
  compactMode: boolean;
}
