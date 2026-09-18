import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Fallback in-memory store for guest/offline sessions
const inMemoryCart: Record<string, any[]> = {};

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id || 'default';
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cart_items').select('*').eq('user_id', userId);
      if (!error && data) return res.json(data);
    } catch (e) {
      console.warn('Supabase cart fetch error', e);
    }
  }
  return res.json(inMemoryCart[userId] || []);
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id || 'default';
  const { productId, size, quantity = 1 } = req.body;

  if (supabase) {
    try {
      const { error } = await supabase.from('cart_items').upsert([
        { user_id: userId, product_id: productId, size, quantity }
      ]);
      if (!error) return res.json({ success: true });
    } catch (e) {
      console.warn('Supabase cart save error', e);
    }
  }

  if (!inMemoryCart[userId]) inMemoryCart[userId] = [];
  inMemoryCart[userId].push({ productId, size, quantity });
  return res.json({ success: true });
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id || 'default';
  const itemId = req.params.id;

  if (supabase) {
    try {
      await supabase.from('cart_items').delete().eq('id', itemId);
      return res.json({ success: true });
    } catch (e) {
      console.warn('Supabase cart delete error', e);
    }
  }

  inMemoryCart[userId] = (inMemoryCart[userId] || []).filter(i => i.productId !== itemId);
  return res.json({ success: true });
});

export default router;
