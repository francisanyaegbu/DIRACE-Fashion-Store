import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const inMemoryWishlist: Record<string, string[]> = {};

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id || 'default';
  if (supabase) {
    try {
      const { data, error } = await supabase.from('wishlist').select('productId:product_id').eq('user_id', userId);
      if (!error && data) return res.json(data);
    } catch (e) {
      console.warn('Supabase wishlist fetch error', e);
    }
  }
  const items = (inMemoryWishlist[userId] || []).map((productId) => ({ productId }));
  return res.json(items);
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id || 'default';
  const { productId } = req.body;

  if (supabase) {
    try {
      const { data: existing } = await supabase.from('wishlist').select('id').eq('user_id', userId).eq('product_id', productId);
      if (existing && existing.length > 0) {
        await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId);
        return res.json({ success: true, added: false });
      } else {
        await supabase.from('wishlist').insert([{ user_id: userId, product_id: productId }]);
        return res.json({ success: true, added: true });
      }
    } catch (e) {
      console.warn('Supabase wishlist toggle error', e);
    }
  }

  if (!inMemoryWishlist[userId]) inMemoryWishlist[userId] = [];
  const exists = inMemoryWishlist[userId].includes(productId);
  if (exists) {
    inMemoryWishlist[userId] = inMemoryWishlist[userId].filter(id => id !== productId);
    return res.json({ success: true, added: false });
  } else {
    inMemoryWishlist[userId].push(productId);
    return res.json({ success: true, added: true });
  }
});

export default router;
