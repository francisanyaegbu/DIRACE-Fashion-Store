import { Router } from "express";
import { db } from "../db/index.js";
import { wishlist, products } from "../db/schema.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: "User not synced" });

    const items = await db
      .select({
        id: wishlist.id,
        productId: wishlist.productId,
      })
      .from(wishlist)
      .where(eq(wishlist.userId, user.id));

    return res.json(items);
  } catch (error: any) {
    console.error("Failed to fetch wishlist:", error);
    return res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: "User not synced" });

    const { productId } = req.body;

    const existing = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, user.id), eq(wishlist.productId, productId)));

    if (existing.length > 0) {
      // Remove it (toggle off)
      await db.delete(wishlist).where(eq(wishlist.id, existing[0].id));
      return res.json({ success: true, added: false });
    } else {
      // Add it
      await db.insert(wishlist).values({
        userId: user.id,
        productId,
      });
      return res.json({ success: true, added: true });
    }
  } catch (error: any) {
    console.error("Failed to toggle wishlist:", error);
    return res.status(500).json({ error: "Failed to toggle wishlist" });
  }
});

export default router;
