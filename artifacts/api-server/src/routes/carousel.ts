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

const DEFAULT_SLIDES = [
  {
    id: "carousel-slide-1",
    image: "/WhatsApp_Image_2026-10-02_at_09.51.09.jpeg",
    alt: "DIRACE Drop Look 01",
    title: "Drop Look 01",
  },
  {
    id: "carousel-slide-2",
    image: "/WhatsApp_Image_2026-10-02_at_09.50.10.jpeg",
    alt: "DIRACE Drop Look 02",
    title: "Drop Look 02",
  },
];

// Persistent file path for local caching on server
const LOCAL_CACHE_DIR = path.resolve(process.cwd(), "data");
const LOCAL_CACHE_FILE = path.resolve(LOCAL_CACHE_DIR, "carousel_slides.json");

function getInitialSlides() {
  try {
    if (fs.existsSync(LOCAL_CACHE_FILE)) {
      const content = fs.readFileSync(LOCAL_CACHE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...DEFAULT_SLIDES];
}

let inMemorySlidesCache = getInitialSlides();

function saveLocalBackup(slides: any[]) {
  try {
    if (!fs.existsSync(LOCAL_CACHE_DIR)) {
      fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_CACHE_FILE, JSON.stringify(slides, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write local carousel backup:", err);
  }
}

// GET /api/carousel
router.get("/", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    // If cache is empty and Supabase is configured, try direct storage download once
    if ((!inMemorySlidesCache || inMemorySlidesCache.length === 0) && supabase) {
      const { data: blob, error } = await supabase.storage
        .from("products")
        .download("config/carousel_slides.json");
      if (!error && blob) {
        const text = await blob.text();
        const json = JSON.parse(text);
        if (Array.isArray(json) && json.length > 0) {
          inMemorySlidesCache = json;
          saveLocalBackup(json);
        }
      }
    }
    return res.json(inMemorySlidesCache);
  } catch (err: any) {
    return res.json(inMemorySlidesCache);
  }
});

// PUT /api/carousel
router.put("/", async (req, res) => {
  try {
    const slides = req.body?.slides || req.body;
    if (!Array.isArray(slides)) {
      return res.status(400).json({ error: "Invalid slides payload, expected an array." });
    }

    inMemorySlidesCache = slides;
    saveLocalBackup(slides);

    if (supabase) {
      const jsonBuffer = Buffer.from(JSON.stringify(slides, null, 2));
      const { error } = await supabase.storage
        .from("products")
        .upload("config/carousel_slides.json", jsonBuffer, {
          contentType: "application/json",
          upsert: true,
        });
      if (error) {
        console.warn("API server failed to sync carousel to Supabase storage:", error.message);
      }
    }

    return res.json({ success: true, count: slides.length, slides });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update carousel slides" });
  }
});

// POST /api/carousel/upload (handles Base64 or multipart file upload to Supabase storage & local public folder)
router.post("/upload", async (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || !dataUrl.startsWith("data:")) {
      return res.status(400).json({ error: "Invalid image data format. Expected Data URL." });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid base64 string format" });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    const rawExt = mimeType.split("/")[1] || "jpg";
    const ext = rawExt.includes("+") ? rawExt.split("+")[0] : rawExt;
    const cleanFilename = (filename || `carousel_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileNameOnDisk = `${cleanFilename}_${Date.now()}.${ext}`;
    const filePath = `carousel/${fileNameOnDisk}`;

    // 1. Try upload to Supabase public storage
    if (supabase) {
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadError) {
        const { data: pub } = supabase.storage.from("products").getPublicUrl(filePath);
        if (pub?.publicUrl) {
          return res.json({ success: true, url: pub.publicUrl });
        }
      } else {
        console.warn("Supabase storage upload error:", uploadError.message);
      }
    }

    // 2. Dual fallback: save to local public directory so Vite can serve it
    const publicDirCandidates = [
      path.resolve(process.cwd(), "artifacts/dirace-store/public/uploads"),
      path.resolve(process.cwd(), "../dirace-store/public/uploads"),
      path.resolve(process.cwd(), "public/uploads"),
    ];

    for (const dir of publicDirCandidates) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.resolve(dir, fileNameOnDisk), buffer);
        return res.json({ success: true, url: `/uploads/${fileNameOnDisk}` });
      } catch {}
    }

    return res.status(500).json({ error: "Failed to store image in any destination" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to process image upload" });
  }
});

export default router;
