import path from "node:path";
import { defineConfig } from "drizzle-kit";

// Match the default used by lib/db/src/index.ts so `drizzle-kit push` and the
// runtime open the same file. Can be overridden with DATABASE_PATH.
function defaultDbPath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }
  return path.resolve(process.cwd(), ".data", "parakh.db");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "sqlite",
  dbCredentials: {
    url: defaultDbPath(),
  },
});
