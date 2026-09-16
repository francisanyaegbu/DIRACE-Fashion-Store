import { Router } from "express";
import { db } from "../db/index.js";
import { cartItems, products } from "../db/schema.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: "User not synced" });

    const items = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        size: cartItems.size,
        quantity: cartItems.quantity,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, user.id));

    return res.json(items);
  } catch (error: any) {
    console.error("Failed to fetch cart:", error);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: "User not synced" });

    const { productId, size, quantity = 1 } = req.body;

    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId), eq(cartItems.size, size)));

    if (existing.length > 0) {
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      await db.insert(cartItems).values({
        userId: user.id,
        productId,
        size,
        quantity,
      });
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to add to cart:", error);
    return res.status(500).json({ error: "Failed to add to cart" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: "User not synced" });

    await db.delete(cartItems).where(and(eq(cartItems.id, parseInt(req.params.id as string)), eq(cartItems.userId, user.id)));
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to remove from cart:", error);
    return res.status(500).json({ error: "Failed to remove from cart" });
  }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: "User not synced" });

    const { quantity } = req.body;
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, parseInt(req.params.id as string)), eq(cartItems.userId, user.id)));
      
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update cart:", error);
    return res.status(500).json({ error: "Failed to update cart" });
  }
});

export default router;
