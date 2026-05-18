import { config } from "../config.js";
import { syncGames } from "../sync.js";

async function run(): Promise<void> {
  const username = process.env.CHESS_USERNAME ?? config.username;
  if (!username) {
    throw new Error("Set CHESS_USERNAME in env or .env file.");
  }

  const result = await syncGames({
    username,
    days: config.syncDays,
    todayOnly: false
  });

  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
