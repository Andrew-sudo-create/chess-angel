import type { RawGame } from "./types";
import { subDays, subHours, subMinutes } from "date-fns";

const openings = [
  { eco: "E00", name: "Queen's Gambit" },
  { eco: "B20", name: "Sicilian Defense" },
  { eco: "C60", name: "Ruy Lopez" },
  { eco: "A40", name: "Queen's Pawn" },
  { eco: "C00", name: "French Defense" },
  { eco: "D10", name: "Slav Defense" },
  { eco: "B01", name: "Scandinavian Defense" },
  { eco: "C20", name: "King's Pawn Game" },
  { eco: "E10", name: "Catalan Opening" },
  { eco: "A00", name: "Irregular Openings" },
];

const timeClasses = ["bullet", "blitz", "rapid"] as const;
const results: Array<{ my: string; opp: string }> = [
  { my: "win", opp: "resigned" },
  { my: "win", opp: "timeout" },
  { my: "resigned", opp: "win" },
  { my: "timeout", opp: "win" },
  { my: "agreed", opp: "agreed" },
];

let baseRating = 1450;

function makeGame(
  daysAgo: number,
  hoursAgo = 0,
  minutesOffset = 0
): RawGame {
  const result = results[Math.floor(Math.random() * results.length)];
  const opening = openings[Math.floor(Math.random() * openings.length)];
  const tc = timeClasses[Math.floor(Math.random() * timeClasses.length)];
  const isWhite = Math.random() > 0.5;
  const ratingDelta = result.my === "win" ? Math.floor(Math.random() * 8 + 1) : result.my === "agreed" ? 0 : -Math.floor(Math.random() * 8 + 1);
  baseRating = Math.max(1000, Math.min(2000, baseRating + ratingDelta));
  const myRating = baseRating;
  const oppRating = myRating + Math.floor(Math.random() * 200 - 100);
  const date = subMinutes(subHours(subDays(new Date(), daysAgo), hoursAgo), minutesOffset);
  const timeControls = { bullet: "60", blitz: "300", rapid: "600" };

  return {
    id: `game-${daysAgo}-${hoursAgo}-${minutesOffset}-${Math.random().toString(36).slice(2, 6)}`,
    url: `https://www.chess.com/game/live/${Math.floor(Math.random() * 9999999)}`,
    end_time: Math.floor(date.getTime() / 1000),
    time_control: timeControls[tc],
    time_class: tc,
    rated: Math.random() > 0.1,
    eco: opening.eco,
    opening: opening.name,
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5",
    white: {
      username: isWhite ? "ChessAngel" : `opp_${Math.random().toString(36).slice(2, 7)}`,
      result: isWhite ? result.my : result.opp,
      rating: isWhite ? myRating : oppRating,
    },
    black: {
      username: !isWhite ? "ChessAngel" : `opp_${Math.random().toString(36).slice(2, 7)}`,
      result: !isWhite ? result.my : result.opp,
      rating: !isWhite ? myRating : oppRating,
    },
  };
}

export function generateMockGames(): RawGame[] {
  const games: RawGame[] = [];

  // Last 30 days — variable games per day
  for (let day = 0; day < 30; day++) {
    const count = Math.floor(Math.random() * 8) + 1;
    for (let i = 0; i < count; i++) {
      games.push(makeGame(day, Math.floor(Math.random() * 16), i * 8));
    }
  }

  // Add a tilt session: 4 losses in 40 minutes, 2 days ago
  for (let i = 0; i < 4; i++) {
    const r = { my: "resigned", opp: "win" };
    const opening = openings[0];
    const date = subMinutes(subDays(new Date(), 2), i * 8 + 120);
    games.push({
      id: `tilt-${i}`,
      url: `https://www.chess.com/game/live/tilt${i}`,
      end_time: Math.floor(date.getTime() / 1000),
      time_control: "300",
      time_class: "blitz",
      rated: true,
      eco: opening.eco,
      opening: opening.name,
      pgn: "1. e4",
      white: { username: "ChessAngel", result: r.my, rating: 1430 },
      black: { username: "tiltmaster", result: r.opp, rating: 1460 },
    });
  }

  return games;
}
