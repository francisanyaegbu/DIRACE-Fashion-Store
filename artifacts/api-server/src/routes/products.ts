import { Router } from "express";
import { db } from "../db/index.js";
import { products } from "../db/schema.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allProducts = await db.select().from(products);
    res.json(allProducts);
  } catch (error: any) {
    console.error("Failed to fetch products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Admin routes could be added here (creating products)

export default router;
