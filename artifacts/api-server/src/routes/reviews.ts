import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

interface Review {
  id: string;
  product_id: string;
  user_id?: string | null;
  user_name: string;
  user_email?: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

let inMemoryReviews: Review[] = [];

// GET /api/reviews?productId=prod_1
router.get("/", async (req, res) => {
  const { productId } = req.query;

  try {
    if (supabase) {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (productId) {
        query = query.eq('product_id', String(productId));
      }
      const { data, error } = await query;
      if (!error && data) {
        // Strip out any legacy dummy reviews
        const cleanData = (data as Review[]).filter((r) => !['rev_1', 'rev_2', 'rev_3', 'rev_4'].includes(r.id));
        return res.json(cleanData);
      }
    }
  } catch (e) {
    console.warn('Supabase reviews fetch error', e);
  }

  const results = inMemoryReviews.filter((r) => !['rev_1', 'rev_2', 'rev_3', 'rev_4'].includes(r.id));
  const filtered = productId
    ? results.filter((r) => r.product_id === productId)
    : results;

  return res.json(filtered);
});

// POST /api/reviews
router.post("/", async (req, res) => {
  const { product_id, user_id, user_name, user_email, rating, comment } = req.body;

  if (!product_id || !user_name || !rating || !comment) {
    return res.status(400).json({ error: "Missing required review fields (product_id, user_name, rating, comment)" });
  }

  const parsedRating = Number(rating);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  const newReview: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    product_id,
    user_id: user_id || null,
    user_name,
    user_email: user_email || null,
    rating: parsedRating,
    comment,
    created_at: new Date().toISOString(),
  };

  try {
    if (supabase) {
      const { data, error } = await supabase.from('reviews').insert([newReview]).select().single();
      if (!error && data) {
        inMemoryReviews.unshift(data as Review);
        return res.status(201).json(data);
      }
      if (error) {
        console.warn("Supabase review insert error:", error.message);
      }
    }
  } catch (err) {
    console.warn("Exception writing review to Supabase:", err);
  }

  inMemoryReviews.unshift(newReview);
  return res.status(201).json(newReview);
});

// DELETE /api/reviews/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (supabase) {
      await supabase.from('reviews').delete().eq('id', id);
    }
  } catch (err) {
    console.warn("Error deleting review in Supabase:", err);
  }

  inMemoryReviews = inMemoryReviews.filter((r) => r.id !== id);
  return res.json({ success: true, id });
});

export default router;
