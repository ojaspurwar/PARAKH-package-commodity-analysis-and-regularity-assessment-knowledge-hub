import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Keep API 404s as JSON rather than the HTML fallback below.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ---------------------------------------------------------------------------
// Static frontend hosting (production / single-process local mode)
//
// When the frontend has been built (artifacts/metrology-assistant/dist/public),
// this server also serves the UI on the same origin as the API. Any non-API
// GET falls back to index.html so the SPA router works on refresh/deep links.
// ---------------------------------------------------------------------------
const distDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(
  distDir,
  "..",
  "metrology-assistant",
  "dist",
  "public",
);
const indexHtml = path.join(frontendDist, "index.html");

if (fs.existsSync(indexHtml)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(indexHtml);
  });
} else if (process.env.NODE_ENV === "production") {
  logger.warn(
    { frontendDist },
    "Frontend build not found — serving API only. Run `pnpm run build` first.",
  );
}

export default app;
