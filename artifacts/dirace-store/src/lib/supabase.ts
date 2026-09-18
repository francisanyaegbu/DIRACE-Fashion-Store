import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

// Access Supabase credentials from Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
  );
};

// Safe lazy initialization to prevent crashes if environment variables are not yet configured
let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
};

export const supabase = getSupabase();

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // in NGN (Naira)
  image: string;
  alt: string;
  badge?: string;
  description: string;
  sizes: string[];
  stock?: number;
  created_at?: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  postcode: string;
  total_amount: number; // in NGN
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string | null;
  user_name: string;
  user_email?: string | null;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
}

export const DEFAULT_REVIEWS: Review[] = [];

// Initial curated collection in Nigerian Naira (NGN)
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'The Oversized Blazer',
    category: 'Outerwear',
    price: 350000, // ₦350,000
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    alt: 'Oversized black tailored blazer',
    badge: 'New Arrival',
    description: 'Structured, severe, and meticulously tailored. The Oversized Blazer forms the cornerstone of any modern uniform.',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 14,
  },
  {
    id: 'prod_2',
    name: 'Pleated Trousers',
    category: 'Bottoms',
    price: 220000, // ₦220,000
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
    alt: 'Wide leg pleated charcoal trousers',
    badge: 'Classic',
    description: 'Fluid motion captured in fabric. These high-waisted pleated trousers offer unparalleled drape and movement.',
    sizes: ['28', '30', '32', '34'],
    stock: 22,
  },
  {
    id: 'prod_3',
    name: 'Heavyweight Crewneck',
    category: 'Tops',
    price: 180000, // ₦180,000
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    alt: 'Minimalist grey crewneck sweater',
    badge: 'Essential',
    description: 'The Platonic ideal of a sweatshirt. Cut from dense 500gsm cotton terry with a slightly cropped, boxy fit.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 35,
  },
  {
    id: 'prod_4',
    name: 'Structured Leather Tote',
    category: 'Accessories',
    price: 450000, // ₦450,000
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80',
    alt: 'Black leather structural tote bag',
    badge: 'Limited',
    description: 'Architectural carry. Crafted from rigid Italian calfskin that develops a profound patina with extended use.',
    sizes: ['OS'],
    stock: 8,
  },
  {
    id: 'prod_5',
    name: 'Raw Denim Jacket',
    category: 'Outerwear',
    price: 280000, // ₦280,000
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
    alt: 'Deep indigo raw denim outerwear jacket',
    badge: 'Signature',
    description: 'Unwashed Japanese selvedge denim crafted with brass hardware and reinforced drop shoulders.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12,
  },
  {
    id: 'prod_6',
    name: 'Merino Wool Mock Neck',
    category: 'Knitwear',
    price: 210000, // ₦210,000
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
    alt: 'Black fine merino wool mock neck knitwear',
    badge: 'Restocked',
    description: 'Ultra-fine 19.5 micron merino wool for second-skin warmth without bulk. Engineered for layering.',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 19,
  },
  {
    id: 'prod_7',
    name: 'Cocoon Wool Coat',
    category: 'Outerwear',
    price: 480000, // ₦480,000
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&q=80',
    alt: 'Minimalist black double-breasted cocoon coat',
    badge: 'Archive',
    description: 'Sculptural cocoon silhouette in double-faced Italian virgin wool with hidden horn button closures.',
    sizes: ['S', 'M', 'L'],
    stock: 7,
  },
  {
    id: 'prod_8',
    name: 'Relaxed Wide-Leg Chino',
    category: 'Bottoms',
    price: 195000, // ₦195,000
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    alt: 'Relaxed wide leg cotton trousers',
    badge: 'Essential',
    description: 'Heavyweight brushed cotton twill with deep front pleats and an architectural straight taper.',
    sizes: ['28', '30', '32', '34'],
    stock: 18,
  },
  {
    id: 'prod_9',
    name: 'Boxy Poplin Shirt',
    category: 'Tops',
    price: 165000, // ₦165,000
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    alt: 'Crisp white poplin button down shirt',
    badge: 'Core',
    description: '120-thread count Egyptian cotton poplin with dropped shoulders and a clean squared hem.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 24,
  },
  {
    id: 'prod_10',
    name: 'Calfskin Minimalist Belt',
    category: 'Accessories',
    price: 110000, // ₦110,000
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80',
    alt: 'Matte black calfskin leather belt with brushed steel buckle',
    badge: 'Accessory',
    description: 'Full-grain vegetable-tanned French calfskin finished with custom brushed stainless steel hardware.',
    sizes: ['85', '90', '95', '100'],
    stock: 15,
  },
  {
    id: 'prod_11',
    name: 'Chunky Ribbed Cardigan',
    category: 'Knitwear',
    price: 290000, // ₦290,000
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    alt: 'Oatmeal heavy ribbed knit cardigan',
    badge: 'Seasonal',
    description: 'Spun from chunky Scottish lambswool in an exaggerated 3-gauge fisherman rib.',
    sizes: ['S', 'M', 'L'],
    stock: 11,
  },
  {
    id: 'prod_12',
    name: 'Monolithic Leather Cardholder',
    category: 'Accessories',
    price: 75000, // ₦75,000
    image: 'https://images.unsplash.com/photo-1606503829064-28b9d2a23363?w=800&q=80',
    alt: 'Slim architectural black card case',
    badge: 'Edition',
    description: 'Hand-burnished saddle leather case with bevelled edge paint and laser-engraved serial stamping.',
    sizes: ['OS'],
    stock: 30,
  }
];

// Local fallback store keys
const LOCAL_PRODUCTS_KEY = 'dirace_local_products';
const LOCAL_ORDERS_KEY = 'dirace_local_orders';
const LOCAL_REVIEWS_KEY = 'dirace_local_reviews';

export const getStoredLocalProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not parse local products', e);
  }
  return DEFAULT_PRODUCTS;
};

export const saveStoredLocalProducts = (items: Product[]) => {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save local products', e);
  }
};

export const getStoredLocalOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not parse local orders', e);
  }
  return [];
};

export const saveStoredLocalOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Could not save local orders', e);
  }
};

export const getStoredLocalReviews = (): Review[] => {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Purge any legacy dummy reviews
        const clean = parsed.filter((r: any) => !['rev_1', 'rev_2', 'rev_3', 'rev_4'].includes(r?.id));
        if (clean.length !== parsed.length) {
          localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(clean));
        }
        return clean;
      }
    }
  } catch (e) {
    console.warn('Could not parse local reviews', e);
  }
  return [];
};

export const saveStoredLocalReviews = (reviews: Review[]) => {
  try {
    const clean = reviews.filter((r) => !['rev_1', 'rev_2', 'rev_3', 'rev_4'].includes(r.id));
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(clean));
  } catch (e) {
    console.warn('Could not save local reviews', e);
  }
};

// ==========================================
// SUPABASE DATABASE OPERATIONS
// ==========================================

export async function fetchProductsFromSupabase(): Promise<Product[]> {
  const sb = getSupabase();
  if (!sb) {
    return getStoredLocalProducts();
  }

  try {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase products fetch failed, using local collection:', error.message);
      return getStoredLocalProducts();
    }

    if (data && data.length > 0) {
      return data as Product[];
    } else {
      // If table is empty, return default products
      return getStoredLocalProducts();
    }
  } catch (err) {
    console.warn('Error querying Supabase products:', err);
    return getStoredLocalProducts();
  }
}

export async function fetchRecommendedProductsFromSupabase(
  category: string,
  currentProductId: string,
  limit: number = 4
): Promise<Product[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', currentProductId)
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data as Product[];
      } else if (error) {
        console.warn('Supabase recommended query note:', error.message);
      }
    } catch (err) {
      console.warn('Error querying recommended products from Supabase:', err);
    }
  }

  // Graceful local fallback to same-category pieces
  const local = getStoredLocalProducts();
  const sameCat = local.filter((p) => p.category === category && p.id !== currentProductId);
  if (sameCat.length > 0) {
    return sameCat.slice(0, limit);
  }
  return local.filter((p) => p.id !== currentProductId).slice(0, limit);
}

export async function addProductToSupabase(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  const newProduct: Product = {
    id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...product,
    created_at: new Date().toISOString(),
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('products').insert([newProduct]).select().single();
      if (!error && data) {
        return data as Product;
      } else if (error) {
        console.error('Supabase product insert error:', error.message);
      }
    } catch (err) {
      console.error('Exception inserting product to Supabase:', err);
    }
  }

  // Local fallback
  const local = getStoredLocalProducts();
  const updated = [newProduct, ...local];
  saveStoredLocalProducts(updated);
  return newProduct;
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase product delete error:', error.message);
      }
    } catch (err) {
      console.error('Exception deleting product from Supabase:', err);
    }
  }

  const local = getStoredLocalProducts();
  const updated = local.filter((p) => p.id !== id);
  saveStoredLocalProducts(updated);
  return true;
}

export async function seedProductsToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const sb = getSupabase();
  if (!sb) {
    return { success: false, count: 0, error: 'Supabase credentials not configured yet.' };
  }

  try {
    const { data, error } = await sb.from('products').upsert(DEFAULT_PRODUCTS, { onConflict: 'id' }).select();
    if (error) {
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: data?.length || DEFAULT_PRODUCTS.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Unknown error' };
  }
}

// ==========================================
// SUPABASE ORDERS OPERATIONS
// ==========================================

export async function fetchOrdersFromSupabase(): Promise<Order[]> {
  const sb = getSupabase();
  if (!sb) {
    return getStoredLocalOrders();
  }

  try {
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase orders fetch error:', error.message);
      return getStoredLocalOrders();
    }

    return (data as Order[]) || [];
  } catch (err) {
    console.warn('Exception querying Supabase orders:', err);
    return getStoredLocalOrders();
  }
}

export async function createOrderInSupabase(orderData: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<Order> {
  const newOrder: Order = {
    id: `ord_${Date.now().toString().slice(-6)}`,
    ...orderData,
    status: 'Pending',
    created_at: new Date().toISOString(),
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('orders').insert([newOrder]).select().single();
      if (!error && data) {
        return data as Order;
      }
      if (error) {
        console.warn('Supabase order insert error:', error.message);
      }
    } catch (err) {
      console.warn('Exception inserting order in Supabase:', err);
    }
  }

  // Local fallback
  const local = getStoredLocalOrders();
  const updated = [newOrder, ...local];
  saveStoredLocalOrders(updated);
  return newOrder;
}

export async function updateOrderStatusInSupabase(orderId: string, status: Order['status']): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('orders').update({ status }).eq('id', orderId);
      if (error) console.warn('Supabase update order status error:', error.message);
    } catch (err) {
      console.warn('Exception updating order status:', err);
    }
  }

  const local = getStoredLocalOrders();
  const updated = local.map((o) => (o.id === orderId ? { ...o, status } : o));
  saveStoredLocalOrders(updated);
  return true;
}

// ==========================================
// SUPABASE REVIEWS OPERATIONS
// ==========================================

export async function fetchReviewsFromSupabase(productId?: string): Promise<Review[]> {
  const sb = getSupabase();
  if (!sb) {
    const local = getStoredLocalReviews();
    return productId ? local.filter((r) => r.product_id === productId) : local;
  }

  try {
    let query = sb
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase reviews fetch error:', error.message);
      const local = getStoredLocalReviews();
      return productId ? local.filter((r) => r.product_id === productId) : local;
    }

    if (!data || data.length === 0) {
      const local = getStoredLocalReviews();
      return productId ? local.filter((r) => r.product_id === productId) : local;
    }

    const cleanData = ((data as Review[]) || []).filter((r) => !['rev_1', 'rev_2', 'rev_3', 'rev_4'].includes(r.id));
    return cleanData;
  } catch (err) {
    console.warn('Exception querying Supabase reviews:', err);
    const local = getStoredLocalReviews();
    return productId ? local.filter((r) => r.product_id === productId) : local;
  }
}

export async function createReviewInSupabase(reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  const newReview: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...reviewData,
    created_at: new Date().toISOString(),
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('reviews').insert([newReview]).select().single();
      if (!error && data) {
        // Also update local storage cache
        const local = getStoredLocalReviews();
        saveStoredLocalReviews([data as Review, ...local.filter((r) => r.id !== data.id)]);
        return data as Review;
      }
      if (error) {
        console.warn('Supabase review insert error:', error.message);
      }
    } catch (err) {
      console.warn('Exception inserting review into Supabase:', err);
    }
  }

  // Local fallback storage
  const local = getStoredLocalReviews();
  const updated = [newReview, ...local];
  saveStoredLocalReviews(updated);
  return newReview;
}

export async function deleteReviewFromSupabase(reviewId: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('reviews').delete().eq('id', reviewId);
      if (error) console.warn('Supabase delete review error:', error.message);
    } catch (err) {
      console.warn('Exception deleting review from Supabase:', err);
    }
  }

  const local = getStoredLocalReviews();
  const updated = local.filter((r) => r.id !== reviewId);
  saveStoredLocalReviews(updated);
  return true;
}

export async function purgeDummyReviewsFromSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('reviews').delete().in('id', ['rev_1', 'rev_2', 'rev_3', 'rev_4']);
    } catch (err: any) {
      console.warn('Exception purging dummy reviews from Supabase:', err);
    }
  }

  const local = getStoredLocalReviews().filter((r) => !['rev_1', 'rev_2', 'rev_3', 'rev_4'].includes(r.id));
  saveStoredLocalReviews(local);
  return { success: true, count: 0 };
}

export async function seedReviewsToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  return purgeDummyReviewsFromSupabase();
}

// ==========================================
// SUPABASE STORAGE OPERATIONS
// ==========================================

export async function uploadProductImageToSupabase(file: File): Promise<{ url: string | null; error: string | null }> {
  const sb = getSupabase();
  if (!sb) {
    // If Supabase is not configured yet, generate a local preview URL
    const localUrl = URL.createObjectURL(file);
    return { url: localUrl, error: 'Supabase credentials not detected; using temporary local image preview.' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `catalog/${fileName}`;

    // Upload to 'products' bucket
    const { error: uploadError } = await sb.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload failed:', uploadError.message);
      return {
        url: URL.createObjectURL(file),
        error: `Supabase Storage upload: ${uploadError.message}. Make sure the 'products' bucket exists in your Supabase Storage.`,
      };
    }

    const { data } = sb.storage.from('products').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return {
      url: URL.createObjectURL(file),
      error: err.message || 'Failed to upload image to Supabase Storage.',
    };
  }
}

// ==========================================
// SUPABASE AUTH OPERATIONS
// ==========================================

export async function supabaseSignUp(email: string, password: string, fullName?: string) {
  const sb = getSupabase();
  if (!sb) {
    // Return mock successful auth for preview if credentials aren't set
    const mockUser: User = {
      id: `usr_${Date.now()}`,
      app_metadata: {},
      user_metadata: { full_name: fullName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email,
    };
    localStorage.setItem('dirace_supabase_mock_user', JSON.stringify(mockUser));
    return { user: mockUser, error: null };
  }

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return { user: data.user, error: error?.message || null };
}

export async function supabaseSignIn(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) {
    const mockUser: User = {
      id: `usr_${Date.now()}`,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email,
    };
    localStorage.setItem('dirace_supabase_mock_user', JSON.stringify(mockUser));
    return { user: mockUser, error: null };
  }

  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data.user, error: error?.message || null };
}

export async function supabaseSignInWithGoogle() {
  const sb = getSupabase();
  if (!sb) {
    const mockUser: User = {
      id: `usr_${Date.now()}`,
      app_metadata: {},
      user_metadata: { full_name: 'Google User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'user@gmail.com',
    };
    localStorage.setItem('dirace_supabase_mock_user', JSON.stringify(mockUser));
    return { user: mockUser, error: null };
  }

  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/account',
    },
  });

  return { error: error?.message || null };
}

export async function supabaseSignOut() {
  const sb = getSupabase();
  if (sb) {
    await sb.auth.signOut();
  }
  localStorage.removeItem('dirace_supabase_mock_user');
  return true;
}

export async function getSupabaseCurrentUser(): Promise<User | null> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.auth.getUser();
    if (data.user) return data.user;
  }

  const local = localStorage.getItem('dirace_supabase_mock_user');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return null;
    }
  }
  return null;
}

// ==========================================
// SUPABASE SQL MIGRATION TEMPLATE
// ==========================================
export const SUPABASE_SQL_SCHEMA = `-- ====================================================
-- DIRACE STOREFRONT SUPABASE DATABASE SCHEMA
-- Run this in your Supabase Project -> SQL Editor
-- ====================================================

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  badge TEXT,
  description TEXT NOT NULL DEFAULT '',
  sizes JSONB NOT NULL DEFAULT '["S", "M", "L"]'::jsonb,
  stock INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users or public" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users or public" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users or public" ON public.products FOR DELETE USING (true);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  postcode TEXT NOT NULL DEFAULT '',
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders or all if admin" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update order status" ON public.orders FOR UPDATE USING (true);

-- 3. Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wishlist viewable by owner" ON public.wishlist FOR ALL USING (true);

-- 4. Supabase Storage Bucket for Products
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for products bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Public Upload for products bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products');

-- 5. Product Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users or admins can delete reviews" ON public.reviews FOR DELETE USING (true);
`;
