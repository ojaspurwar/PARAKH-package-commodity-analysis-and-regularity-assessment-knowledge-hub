// Local development runner: starts the API server and the Vite dev server for
// the web app in parallel. Vite proxies /api to the API server, so the whole
// app is reachable at the web port.
//
// Ports: defaults to 5173 (web) / 5000 (API) when they are free. If either is
// already taken (common on shared/student wifi where many services run), a
// random free port is picked instead, so `pnpm dev` never fails with
// "address already in use". Set WEB_PORT / API_PORT to force specific ports.
//
// HTTPS: pass `--https` (or `pnpm dev:https`) to serve the web app over TLS
// with an auto-generated self-signed certificate. Browsers only allow camera
// access (barcode scanning) on https:// or localhost, so phone testing over
// the LAN needs this mode. Your phone will show a certificate warning the
// first time — tap "Advanced" → "Proceed" once, then the camera prompt works.
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import selfsigned from "selfsigned";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = path.join(root, ".data", "parakh.db");

const DEFAULT_WEB_PORT = 41052;
const DEFAULT_API_PORT = 35280;

const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  if (typeof process.loadEnvFile === "function") {
    try { process.loadEnvFile(envPath); } catch {}
  } else {
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx > 0) {
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          if (!process.env[key]) process.env[key] = val;
        }
      }
    } catch {}
  }
}

// Camera / getUserMedia requires HTTPS or localhost; default to HTTPS so mobile cameras always work seamlessly.
const httpsMode = !process.argv.includes("--no-https") && process.env.HTTPS !== "0";

const children = [];

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.unref();
    probe.once("error", () => resolve(false));
    probe.listen(port, "0.0.0.0", () => {
      probe.close(() => resolve(true));
    });
  });
}

function randomPort() {
  // Ephemeral-ish high range: avoids common dev ports (3000/5000/5173/8080…)
  // that other students' services tend to occupy.
  return 20000 + Math.floor(Math.random() * 30000);
}

async function pickPort(preferred) {
  if (preferred) {
    const port = Number(preferred);
    if (Number.isInteger(port) && port > 0 && port < 65536 && (await isPortFree(port))) {
      return port;
    }
    if (preferred) {
      console.warn(
        `[dev] Requested port ${preferred} is already in use — picking a free port instead.`,
      );
    }
  }
  for (let attempt = 0; attempt < 25; attempt++) {
    const port = randomPort();
    if (await isPortFree(port)) return port;
  }
  throw new Error("Could not find a free port after 25 attempts");
}

function lanAddress() {
  const ifaces = os.networkInterfaces();
  for (const list of Object.values(ifaces)) {
    for (const iface of list ?? []) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return null;
}

/**
 * Generate (once) a self-signed certificate for local HTTPS. Persisted under
 * .data/certs so the same cert is reused across restarts — otherwise the
 * phone's "proceed anyway" choice would reset every time.
 */
async function ensureCert(lan) {
  const certDir = path.join(root, ".data", "certs");
  fs.mkdirSync(certDir, { recursive: true });
  const keyPath = path.join(certDir, "dev-key.pem");
  const certPath = path.join(certDir, "dev-cert.pem");
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return { keyPath, certPath };
  }

  const altNames = [
    { type: 2, value: "localhost" },
    { type: 2, value: "parakh.local" },
  ];
  if (lan) altNames.push({ type: 7, ip: lan });

  console.log("[dev] Generating a local HTTPS certificate… (one-time)");
  const pems = await selfsigned.generate(
    [{ name: "commonName", value: "parakh.local" }],
    {
      keySize: 2048,
      algorithm: "sha256",
      days: 365,
      extensions: [
        { name: "basicConstraints", cA: false },
        { name: "keyUsage", digitalSignature: true, keyEncipherment: true },
        { name: "extKeyUsage", serverAuth: true },
        { name: "subjectAltName", altNames },
      ],
    },
  );
  fs.writeFileSync(keyPath, pems.private);
  fs.writeFileSync(certPath, pems.cert);
  return { keyPath, certPath };
}

function run(name, args, extraEnv) {
  const child = spawn("pnpm", args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
    shell: process.platform === "win32",
  });
  children.push(child);

  child.on("exit", (code, signal) => {
    if (code === 0) return;
    console.error(`[dev] ${name} stopped (${signal || `code ${code}`})`);
    for (const other of children) {
      if (other !== child && other.exitCode === null) other.kill();
    }
    process.exit(code ?? 1);
  });
  return child;
}

async function main() {
  const apiPort = await pickPort(process.env.API_PORT || DEFAULT_API_PORT);
  const webPort = await pickPort(process.env.WEB_PORT || DEFAULT_WEB_PORT);
  const lan = lanAddress();

  let tls = null;
  if (httpsMode) {
    tls = await ensureCert(lan);
  }

  const scheme = tls ? "https" : "http";
  console.log("──────────────────────────────────────────────────────────");
  console.log(`  PARAKH — local development`);
  if (tls) console.log(`  ⚠  HTTPS mode: needed for camera access on phones`);
  console.log(`  Web app:     ${scheme}://localhost:${webPort}`);
  if (lan) console.log(`  On network:  ${scheme}://${lan}:${webPort}  (share this on your wifi)`);
  console.log(`  API health:  http://localhost:${apiPort}/api/healthz`);
  console.log(`  Database:    ${dbPath} (SQLite, created automatically)`);
  console.log("──────────────────────────────────────────────────────────");

  run(
    "api",
    ["--filter", "@workspace/api-server", "run", "dev"],
    { PORT: apiPort, DATABASE_PATH: dbPath },
  );

  run(
    "web",
    ["--filter", "@workspace/metrology-assistant", "run", "dev"],
    {
      PORT: webPort,
      BASE_PATH: "/",
      API_ORIGIN: `http://localhost:${apiPort}`,
      ...(tls ? { TLS_KEY_PATH: tls.keyPath, TLS_CERT_PATH: tls.certPath } : {}),
    },
  );
}

function shutdown(signal) {
  for (const child of children) {
    if (child.exitCode === null) child.kill(signal);
  }
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
  process.exit(0);
});
process.on("SIGTERM", () => {
  shutdown("SIGTERM");
  process.exit(0);
});

main().catch((error) => {
  console.error(error);
  process.exit(1);
});