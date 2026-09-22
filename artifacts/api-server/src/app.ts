import fs from "node:fs";
import path from "node:path";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

// Load environment variables from .env if present
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), "../.env"),
  "/app/applet/.env",
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    try {
      if (typeof process.loadEnvFile === "function") {
        process.loadEnvFile(envPath);
      }
    } catch {}
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex).trim();
          const val = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    } catch {}
    break;
  }
}

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

export default app;
