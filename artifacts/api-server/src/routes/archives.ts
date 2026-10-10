import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const LOCAL_CACHE_DIR = path.resolve(process.cwd(), "data");
const LOCAL_CACHE_FILE = path.resolve(LOCAL_CACHE_DIR, "studio_archives.json");

function getInitialArchives() {
  try {
    if (fs.existsSync(LOCAL_CACHE_FILE)) {
      const content = fs.readFileSync(LOCAL_CACHE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

let inMemoryArchivesCache: any[] = getInitialArchives();

function saveLocalBackup(archives: any[]) {
  try {
    if (!fs.existsSync(LOCAL_CACHE_DIR)) {
      fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_CACHE_FILE, JSON.stringify(archives, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write local archives backup:", err);
  }
}

// GET /api/archives
router.get("/", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    if ((!inMemoryArchivesCache || inMemoryArchivesCache.length === 0) && supabase) {
      const { data: blob, error } = await supabase.storage
        .from("products")
        .download("config/studio_archives.json");
      if (!error && blob) {
        const text = await blob.text();
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          inMemoryArchivesCache = json;
          saveLocalBackup(json);
        }
      }
    }
    return res.json(inMemoryArchivesCache);
  } catch (err: any) {
    return res.json(inMemoryArchivesCache);
  }
});

// PUT /api/archives
router.put("/", async (req, res) => {
  try {
    const archives = req.body?.archives || req.body;
    if (!Array.isArray(archives)) {
      return res.status(400).json({ error: "Invalid archives payload, expected an array." });
    }

    inMemoryArchivesCache = archives;
    saveLocalBackup(archives);

    if (supabase) {
      const jsonBuffer = Buffer.from(JSON.stringify(archives, null, 2));
      await supabase.storage
        .from("products")
        .upload("config/studio_archives.json", jsonBuffer, {
          contentType: "application/json",
          upsert: true,
        });
    }

    return res.json({ success: true, count: archives.length, archives });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update archives" });
  }
});

export default router;
