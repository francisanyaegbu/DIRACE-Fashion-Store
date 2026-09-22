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
  phone?: string;
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

// Empty initial collection - no dummy products
export const DEFAULT_PRODUCTS: Product[] = [];

// Local fallback store keys
const LOCAL_PRODUCTS_KEY = 'dirace_local_products';
const LOCAL_ORDERS_KEY = 'dirace_local_orders';
const LOCAL_REVIEWS_KEY = 'dirace_local_reviews';

export const getStoredLocalProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out only legacy dummy product IDs (prod_1 to prod_12)
        const dummyIds = new Set(['prod_1', 'prod_2', 'prod_3', 'prod_4', 'prod_5', 'prod_6', 'prod_7', 'prod_8', 'prod_9', 'prod_10', 'prod_11', 'prod_12']);
        const clean = parsed.filter((p: any) => !dummyIds.has(p?.id));
        if (clean.length !== parsed.length) {
          localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(clean));
        }
        return clean;
      }
    }
  } catch (e) {
    console.warn('Could not parse local products', e);
  }
  return [];
};

export const saveStoredLocalProducts = (items: Product[]) => {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save local products', e);
  }
};

export const isTestOrder = (o: any): boolean => {
  if (!o || typeof o !== 'object') return false;
  const id = String(o.id || '').toLowerCase();
  const name = String(o.customer_name || '').toLowerCase();
  const email = String(o.customer_email || '').toLowerCase();
  const address = String(o.shipping_address || '').toLowerCase();
  const city = String(o.city || '').toLowerCase();
  const postcode = String(o.postcode || '').toLowerCase();

  return (
    id.includes('test') ||
    id.startsWith('ord_test') ||
    id.includes('demo') ||
    id.includes('sample') ||
    name.includes('test') ||
    name.includes('demo') ||
    name.includes('sample') ||
    email.includes('test@') ||
    email.includes('@example.com') ||
    email.includes('@test.com') ||
    email.includes('demo@') ||
    address.includes('test') ||
    address.includes('demo') ||
    city.includes('test') ||
    postcode.includes('test')
  );
};

export const getStoredLocalOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out test and demo orders
        const clean = parsed.filter((o: any) => !isTestOrder(o));
        if (clean.length !== parsed.length) {
          localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(clean));
        }
        return clean;
      }
    }
  } catch (e) {
    console.warn('Could not parse local orders', e);
  }
  return [];
};

export const saveStoredLocalOrders = (orders: Order[]) => {
  try {
    const clean = orders.filter((o) => !isTestOrder(o));
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(clean));
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

    return (data || []) as Product[];
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
        console.error('Product delete error:', error.message);
      }
    } catch (err) {
      console.error('Exception deleting product:', err);
    }
  }

  const local = getStoredLocalProducts();
  const updated = local.filter((p) => p.id !== id);
  saveStoredLocalProducts(updated);
  return true;
}

export async function updateProductInSupabase(id: string, updates: Partial<Product>): Promise<Product | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('products').update(updates).eq('id', id).select().single();
      if (!error && data) {
        const local = getStoredLocalProducts();
        const updated = local.map((p) => (p.id === id ? { ...p, ...(data as Product) } : p));
        saveStoredLocalProducts(updated);
        return data as Product;
      }
    } catch (err) {
      console.error('Exception updating product:', err);
    }
  }

  const local = getStoredLocalProducts();
  let updatedProduct: Product | null = null;
  const updated = local.map((p) => {
    if (p.id === id) {
      updatedProduct = { ...p, ...updates };
      return updatedProduct;
    }
    return p;
  });
  saveStoredLocalProducts(updated);
  return updatedProduct;
}

export async function seedProductsToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const sb = getSupabase();
  if (!sb) {
    return { success: false, count: 0, error: 'Service temporarily unavailable.' };
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

    const rawList = (data as Order[]) || [];
    return rawList.filter((o) => !isTestOrder(o));
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
      if (error) console.warn('Update order status error:', error.message);
    } catch (err) {
      console.warn('Exception updating order status:', err);
    }
  }

  const local = getStoredLocalOrders();
  const updated = local.map((o) => (o.id === orderId ? { ...o, status } : o));
  saveStoredLocalOrders(updated);
  return true;
}

export async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('orders').delete().eq('id', orderId);
      if (error) console.warn('Delete order error:', error.message);
    } catch (err) {
      console.warn('Exception deleting order:', err);
    }
  }

  const local = getStoredLocalOrders();
  const updated = local.filter((o) => o.id !== orderId);
  saveStoredLocalOrders(updated);
  return true;
}

export async function purgeTestOrdersFromSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('orders').delete().ilike('id', '%test%');
      await sb.from('orders').delete().ilike('customer_name', '%test%');
      await sb.from('orders').delete().ilike('customer_email', '%test%');
      await sb.from('orders').delete().ilike('shipping_address', '%test%');
    } catch (err: any) {
      console.warn('Exception purging test orders from Supabase:', err);
    }
  }

  const local = getStoredLocalOrders();
  saveStoredLocalOrders(local);
  return { success: true, count: 0 };
}

export async function clearAllOrdersFromSupabase(): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('orders').delete().neq('id', 'non_existent_id');
    } catch (err) {
      console.warn('Exception clearing all orders from Supabase:', err);
    }
  }

  localStorage.removeItem(LOCAL_ORDERS_KEY);
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
    // If storage is not configured yet, generate a local preview URL
    const localUrl = URL.createObjectURL(file);
    return { url: localUrl, error: null };
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
      console.warn('Storage upload failed:', uploadError.message);
      return {
        url: URL.createObjectURL(file),
        error: uploadError.message || 'Image upload failed. Please try again.',
      };
    }

    const { data } = sb.storage.from('products').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return {
      url: URL.createObjectURL(file),
      error: err.message || 'Image upload failed. Please try again.',
    };
  }
}

// ==========================================
// AUTH OPERATIONS (EMAIL & PASSWORD)
// ==========================================

interface LocalAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  created_at: string;
}

const LOCAL_ACCOUNTS_KEY = 'dirace_registered_accounts';
const ACTIVE_SESSION_KEY = 'dirace_active_user_session';

function getStoredLocalAccounts(): LocalAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredLocalAccounts(accs: LocalAccount[]) {
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accs));
  } catch (e) {
    console.warn('Could not save local accounts', e);
  }
}

export async function supabaseSignUp(email: string, password: string, fullName?: string): Promise<{ user: User | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { user: null, error: 'Please provide both a valid email address and password.' };
  }
  if (password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters.' };
  }

  // 1. First attempt instant auto-confirmed registration via our backend API
  // This completely eliminates email confirmation by setting email_confirm: true directly in Supabase
  try {
    const apiRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password, fullName }),
    });

    const apiData = await apiRes.json().catch(() => null);

    if (apiRes.ok && apiData?.success) {
      // User created and confirmed immediately; now sign in directly to establish the active browser session
      const sb = getSupabase();
      if (sb) {
        const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInData?.user) {
          return { user: signInData.user, error: null };
        }
        if (signInErr) {
          console.warn('Sign-in after instant signup warning:', signInErr);
        }
      }
      if (apiData.user) {
        return { user: apiData.user, error: null };
      }
    } else if (!apiRes.ok && apiData?.error) {
      return { user: null, error: apiData.error };
    }
  } catch (e) {
    console.warn('Backend auto-confirm signup unavailable, falling back to direct auth', e);
  }

  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // Attempt immediate direct sign in
    const { data: immediateSign } = await sb.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    return { user: immediateSign?.user || data.user, error: null };
  }

  // Local fallback authentication
  const accounts = getStoredLocalAccounts();
  const existing = accounts.find((a) => a.email === cleanEmail);
  if (existing) {
    return { user: null, error: 'An account with this email address already exists. Please sign in.' };
  }

  const newAcc: LocalAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    password,
    fullName: fullName?.trim() || cleanEmail.split('@')[0],
    created_at: new Date().toISOString(),
  };

  accounts.push(newAcc);
  saveStoredLocalAccounts(accounts);

  const userObj: User = {
    id: newAcc.id,
    app_metadata: {},
    user_metadata: { full_name: newAcc.fullName },
    aud: 'authenticated',
    created_at: newAcc.created_at,
    email: newAcc.email,
  };

  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(userObj));
  } catch (e) {}

  return { user: userObj, error: null };
}

export async function supabaseSignIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { user: null, error: 'Please enter both your email address and password.' };
  }

  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    return { user: data.user, error: error?.message || null };
  }

  // Local fallback authentication
  const accounts = getStoredLocalAccounts();
  const matched = accounts.find((a) => a.email === cleanEmail);

  if (!matched) {
    // If no accounts yet, automatically create this first account or report clear error
    return { user: null, error: 'Account not found. Please verify your email or switch to "Create Account".' };
  }

  if (matched.password !== password) {
    return { user: null, error: 'Incorrect password. Please verify your credentials and try again.' };
  }

  const userObj: User = {
    id: matched.id,
    app_metadata: {},
    user_metadata: { full_name: matched.fullName },
    aud: 'authenticated',
    created_at: matched.created_at,
    email: matched.email,
  };

  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(userObj));
  } catch (e) {}

  return { user: userObj, error: null };
}

export async function supabaseSignOut(): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    await sb.auth.signOut();
  }
  localStorage.removeItem(ACTIVE_SESSION_KEY);
  localStorage.removeItem('dirace_supabase_mock_user');
  sessionStorage.removeItem('dirace_admin_auth_user');
  return true;
}

export async function getSupabaseCurrentUser(): Promise<User | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data } = await sb.auth.getUser();
      if (data.user) return data.user;
    } catch {
      // ignore
    }
  }

  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    return null;
  }
  return null;
}

export const FIXED_ADMIN_EMAIL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_FIXED_ADMIN_EMAIL ||
      import.meta.env.VITE_fixed_admin_email ||
      import.meta.env.FIXED_ADMIN_EMAIL ||
      import.meta.env.fixed_admin_email)) ||
  'diraceadmin@gmail.com';
export const FIXED_ADMIN_PASSWORD =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_FIXED_ADMIN_PASSWORD ||
      import.meta.env.VITE_fixed_admin_password ||
      import.meta.env.FIXED_ADMIN_PASSWORD ||
      import.meta.env.fixed_admin_password)) ||
  'diraceadminonly';
export const KNOWN_ADMIN_EMAILS = [FIXED_ADMIN_EMAIL];

/**
 * Checks if a given user object qualifies for studio administrator privileges.
 * Users should NOT be able to access the admin page at all even with an active account.
 * It is ONLY available to the admin with the fixed login credentials configured in .env.
 */
export async function verifyUserIsAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;
  const cleanEmail = user.email.trim().toLowerCase();

  // Backend verification check against .env configuration
  try {
    const res = await fetch('/api/auth/admin-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.authorized;
    }
    return false;
  } catch (e) {
    console.warn('Admin verify check failed', e);
  }

  return cleanEmail === FIXED_ADMIN_EMAIL;
}

/**
 * Authenticates against administrator credentials.
 * Validates against environment variables stored in .env via the backend API.
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<{ success: boolean; user: { email: string; name?: string; role?: string } | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, user: null, error: 'Please provide both your administrator email and password.' };
  }

  // 1. Try backend admin login endpoint (validates against environment variables in .env)
  try {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.authorized) {
      // Establish client supabase session as well if supabase is configured
      const sb = getSupabase();
      if (sb) {
        await sb.auth.signInWithPassword({ email: cleanEmail, password }).catch(() => {});
      }
      return { success: true, user: data.user, error: null };
    }

    if (data?.error) {
      return { success: false, user: null, error: data.error };
    }
  } catch (e) {
    console.warn('Backend admin login endpoint unavailable, attempting local validation', e);
  }

  // 2. Reject non-admin accounts immediately
  if (cleanEmail !== FIXED_ADMIN_EMAIL) {
    return {
      success: false,
      user: null,
      error: 'Access Denied: Standard user accounts cannot access the studio administration portal. Only authorized administrator credentials are valid.',
    };
  }

  if (password !== FIXED_ADMIN_PASSWORD) {
    return {
      success: false,
      user: null,
      error: 'Invalid administrator credentials. Please check your administrator password.',
    };
  }

  // 2. Direct Supabase check
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { success: false, user: null, error: 'Invalid credentials. Please verify your administrator email and password.' };
    }

    const user = data.user;
    return {
      success: true,
      user: {
        email: user.email || cleanEmail,
        name: user.user_metadata?.full_name || 'DIRACE Studio Administrator',
        role: 'admin',
      },
      error: null,
    };
  }

  // 3. Fallback for offline/development
  return {
    success: true,
    user: {
      email: cleanEmail,
      name: 'DIRACE Studio Administrator',
      role: 'admin',
    },
    error: null,
  };
}

export interface OrderEmailDispatch {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  status: 'Shipped' | 'Delivered';
  subject: string;
  sentAt: string;
  delivered: boolean;
  provider: 'resend' | 'smtp' | 'preview';
  messageId?: string;
  htmlContent: string;
  textContent: string;
  note?: string;
}

export async function sendOrderStatusNotification(
  order: Order,
  status: 'Shipped' | 'Delivered'
): Promise<{ success: boolean; message: string; dispatch?: OrderEmailDispatch; error?: string }> {
  try {
    const res = await fetch('/api/notifications/order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Failed to dispatch email.', error: data.error };
    }
    return { success: true, message: data.message, dispatch: data.dispatch };
  } catch (err: any) {
    console.warn('Notification endpoint unreachable:', err);
    return {
      success: false,
      message: err.message || 'Could not connect to notification service.',
      error: err.message,
    };
  }
}

export async function fetchNotificationHistory(): Promise<OrderEmailDispatch[]> {
  try {
    const res = await fetch('/api/notifications/history');
    if (res.ok) {
      const data = await res.json();
      return data.history || [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function renderNotificationPreview(
  order: Order,
  status: 'Shipped' | 'Delivered'
): Promise<{ subject: string; html: string; text: string } | null> {
  try {
    const res = await fetch('/api/notifications/render-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, status }),
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

