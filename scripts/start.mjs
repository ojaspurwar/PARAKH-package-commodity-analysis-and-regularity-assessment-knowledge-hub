// Production-style local start: serves the built web app AND the API from a
// single Express server. Run `pnpm run build` first (or just use `pnpm start`,
// which builds automatically). Everything is reachable at http://localhost:5000.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = path.join(root, ".data", "nirikshan.db");

const port = process.env.PORT || "5000";

console.log("──────────────────────────────────────────────────────────");
console.log(`  Nirikshan — single-server mode`);
console.log(`  App + API:  http://localhost:${port}`);
console.log(`  Health:     http://localhost:${port}/api/healthz`);
console.log(`  Database:   ${dbPath} (SQLite, persists across restarts)`);
console.log("──────────────────────────────────────────────────────────");

const server = spawn(
  process.execPath,
  ["artifacts/api-server/dist/index.mjs"],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: port,
      NODE_ENV: "production",
      DATABASE_PATH: dbPath,
    },
  },
);

server.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (server.exitCode === null) server.kill(signal);
    process.exit(0);
  });
}
