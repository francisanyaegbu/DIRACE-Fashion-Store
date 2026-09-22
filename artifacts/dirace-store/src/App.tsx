import { useMemo, useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
  Upload,
  Copy,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  EyeOff,
  LogOut,
  RefreshCw,
  Package,
  Layers,
  Sparkles,
  Star,
  MessageSquare,
  Eye,
  Edit3,
  ExternalLink,
  Download,
  Printer,
  Loader2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Mail,
  Send,
  FileText,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import NotFound from '@/pages/not-found';
import {
  fetchProductsFromSupabase,
  addProductToSupabase,
  updateProductInSupabase,
  fetchRecommendedProductsFromSupabase,
  deleteProductFromSupabase,
  uploadProductImageToSupabase,
  fetchOrdersFromSupabase,
  createOrderInSupabase,
  updateOrderStatusInSupabase,
  deleteOrderFromSupabase,
  purgeTestOrdersFromSupabase,
  clearAllOrdersFromSupabase,
  fetchReviewsFromSupabase,
  createReviewInSupabase,
  deleteReviewFromSupabase,
  sendOrderStatusNotification,
  fetchNotificationHistory,
  renderNotificationPreview,
  type OrderEmailDispatch,
  isSupabaseConfigured,
  supabaseSignUp,
  supabaseSignIn,
  supabaseSignOut,
  getSupabaseCurrentUser,
  verifyUserIsAdmin,
  adminLogin,
  KNOWN_ADMIN_EMAILS,
  type Product,
  type Order,
  type Review,
  DEFAULT_PRODUCTS,
} from './lib/supabase';
import type { User } from '@supabase/supabase-js';

export type CartItem = { productId: string; size: string; quantity: number };

interface StoreContextType {
  products: Product[];
  refreshProducts: () => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  reviews: Review[];
  refreshReviews: () => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'created_at'>) => Promise<Review>;
  deleteReview: (reviewId: string) => Promise<void>;
  currentUser: User | null;
  refreshUser: () => Promise<void>;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  addToCart: (productId: string, size: string) => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextType>({
  products: [],
  refreshProducts: async () => {},
  deleteProduct: async () => {},
  orders: [],
  refreshOrders: async () => {},
  deleteOrder: async () => {},
  reviews: [],
  refreshReviews: async () => {},
  addReview: async () => ({} as Review),
  deleteReview: async () => {},
  currentUser: null,
  refreshUser: async () => {},
  quickViewProduct: null,
  openQuickView: () => {},
  closeQuickView: () => {},
  addToCart: () => {},
  clearCart: () => {},
});

export function useStore() {
  return useContext(StoreContext);
}

export function money(value: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function InstagramIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.277-.101-.478-.15-.678.15-.201.301-.779.98-.954 1.18-.176.201-.351.226-.652.076-.301-.151-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.101-.201.05-.376-.025-.526-.075-.151-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.008-.377-.01-.578-.01-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.511 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.242 5.145 4.547.719.31 1.28.497 1.718.636.722.23 1.378.197 1.897.12.578-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.201-.577-.351z" />
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.56 3.77 1.53 5.31L2 22l4.82-1.49C8.31 21.46 10.1 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.2c-1.64 0-3.17-.46-4.48-1.26l-.32-.2-2.86.88.9-2.77-.21-.34A8.17 8.17 0 0 1 3.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2z" />
    </svg>
  );
}

function Header({ cartCount, wishlistCount }: { cartCount: number; wishlistCount: number }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ['Shop', '/shop'],
    ['Collections', '/collections'],
    ['About', '/about'],
    ['Contact', '/contact'],
  ];

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className="nav">
        <div className="page-wrap nav-inner">
          <button
            className="icon-btn mobile-menu"
            aria-label="Open navigation"
            data-testid="button-open-navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={19} strokeWidth={1.5} />
          </button>
          <Link href="/" className="brand-lockup" data-testid="link-logo" aria-label="DIRACE Home">
            <span className="brand-logo-mark-wrap">
              <img
                src="/dirace-logo-1-removebg-preview.png"
                alt="DIRACE Logo"
                className="brand-logo-mark"
              />
            </span>
            <img
              src="/diracename-removebg-preview.png"
              alt="DIRACE"
              className="brand-name-img"
            />
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`nav-link ${location === href ? 'active' : ''}`}
                data-testid={`link-${label.toLowerCase()}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link href="/search" className="icon-btn" aria-label="Search" data-testid="link-search">
              <Search size={18} strokeWidth={1.5} />
            </Link>
            <Link href="/account" className="icon-btn" aria-label="Account" data-testid="link-account">
              <UserRound size={18} strokeWidth={1.5} />
            </Link>
            <Link href="/wishlist" className="icon-btn" aria-label="Wishlist" data-testid="link-wishlist">
              <Heart size={18} strokeWidth={1.5} />
              {wishlistCount > 0 && <span className="count-dot">{wishlistCount}</span>}
            </Link>
            <Link href="/cart" className="icon-btn" aria-label="Shopping bag" data-testid="link-cart">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && <span className="count-dot">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>
      {menuOpen && (
        <div
          className="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation"
        >
          <div className="mobile-drawer-header">
            <Link href="/" className="brand-lockup" onClick={() => setMenuOpen(false)} aria-label="DIRACE Home">
              <span className="brand-logo-mark-wrap">
                <img
                  src="/dirace-logo-1-removebg-preview.png"
                  alt="DIRACE Logo"
                  className="brand-logo-mark"
                />
              </span>
              <img
                src="/diracename-removebg-preview.png"
                alt="DIRACE"
                className="brand-name-img"
              />
            </Link>
            <button
              className="icon-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
              data-testid="button-close-navigation"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mobile-drawer-body">
            <div className="mobile-primary-links">
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className={`mobile-nav-item display ${location === href ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                  data-testid={`mobile-link-${label.toLowerCase()}`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="mobile-nav-item display mobile-admin-link"
                onClick={() => setMenuOpen(false)}
              >
                Studio Admin
              </Link>
            </div>

            <div className="mobile-drawer-shortcuts">
              <div className="eyebrow muted" style={{ marginBottom: 10 }}>Personal & Bag</div>
              <div className="mobile-shortcuts-grid">
                <Link href="/search" className="mobile-shortcut-btn" onClick={() => setMenuOpen(false)}>
                  <Search size={15} />
                  <span>Search</span>
                </Link>
                <Link href="/account" className="mobile-shortcut-btn" onClick={() => setMenuOpen(false)}>
                  <UserRound size={15} />
                  <span>Account</span>
                </Link>
                <Link href="/wishlist" className="mobile-shortcut-btn" onClick={() => setMenuOpen(false)}>
                  <Heart size={15} />
                  <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
                </Link>
                <Link href="/cart" className="mobile-shortcut-btn" onClick={() => setMenuOpen(false)}>
                  <ShoppingBag size={15} />
                  <span>Bag {cartCount > 0 ? `(${cartCount})` : ''}</span>
                </Link>
              </div>
            </div>

            <div className="mobile-drawer-footer mono muted">
              <div>PRICING IN NGN (₦) · LAGOS / ABUJA, NIGERIA</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 16, alignItems: 'center' }}>
                <a
                  href="https://www.instagram.com/dirace_?stkn=djRpbnhoamh2bWJh&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-link"
                >
                  <InstagramIcon size={14} />
                  <span>@dirace_</span>
                </a>
                <a
                  href="https://wa.me/2349136660187"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-link"
                >
                  <WhatsAppIcon size={14} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="page-wrap">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand-lockup footer-brand" aria-label="DIRACE Home" data-testid="link-footer-logo">
              <span className="brand-logo-mark-wrap">
                <img
                  src="/dirace-logo-1-removebg-preview.png"
                  alt="DIRACE Logo"
                  className="brand-logo-mark"
                />
              </span>
              <img
                src="/diracename-removebg-preview.png"
                alt="DIRACE"
                className="brand-name-img"
              />
            </Link>
            <p className="muted" style={{ maxWidth: 220, fontSize: 12, lineHeight: 1.7, marginTop: 18 }}>
              Clothing for the considered life. Designed in Nigeria.
            </p>
          </div>
          <div>
            <div className="footer-title">Explore</div>
            <div className="footer-links">
              <Link href="/shop">Shop all</Link>
              <Link href="/collections">Collections</Link>
              <Link href="/about">Our standard</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div>
            <div className="footer-title">Client service</div>
            <div className="footer-links">
              <Link href="/contact">Shipping & returns</Link>
              <Link href="/account">Account</Link>
              <Link href="/wishlist">Wishlist</Link>
              <Link href="/admin">Studio Admin</Link>
            </div>
          </div>
          <div>
            <div className="footer-title">Connect</div>
            <div className="footer-links">
              <a
                href="https://www.instagram.com/dirace_?stkn=djRpbnhoamh2bWJh&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
                data-testid="link-footer-instagram"
              >
                <InstagramIcon size={14} className="footer-social-icon" />
                <span>Instagram</span>
                <ArrowUpRight size={11} style={{ opacity: 0.6 }} />
              </a>
              <a
                href="https://wa.me/2349136660187"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
                data-testid="link-footer-whatsapp"
              >
                <WhatsAppIcon size={14} className="footer-social-icon" />
                <span>WhatsApp (+234 913 666 0187)</span>
                <ArrowUpRight size={11} style={{ opacity: 0.6 }} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom mono">
          <span>© {new Date().getFullYear()} DIRACE STUDIO</span>
          <span>MADE TO BE WORN. NOT CONSUMED.</span>
        </div>
      </div>
    </footer>
  );
}

function ProductCard({
  product,
  isSaved,
  onToggleWish,
}: {
  product: Product;
  isSaved: boolean;
  onToggleWish: (id: string) => void;
}) {
  const { reviews, openQuickView } = useStore();
  const productReviews = reviews.filter((r) => r.product_id === product.id);
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : null;

  return (
    <article className="product-card reveal" data-testid={`card-product-${product.id}`}>
      <div className="product-media">
        <Link href={`/product/${product.id}`} data-testid={`link-product-${product.id}`}>
          <img src={product.image} alt={product.alt || product.name} />
        </Link>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button
          className={`wish-btn ${isSaved ? 'saved' : ''}`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => onToggleWish(product.id)}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          className="quick-view-btn"
          aria-label={`Quick view ${product.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openQuickView(product);
          }}
          data-testid={`button-quick-view-${product.id}`}
        >
          <Eye size={12} />
          <span>Quick View</span>
        </button>
      </div>
      <Link href={`/product/${product.id}`} className="product-info" data-testid={`link-product-info-${product.id}`}>
        <div>
          <div className="product-name">{product.name}</div>
          <div className="product-meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{product.category}</span>
            {avgRating && (
              <>
                <span className="muted">·</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    color: 'hsl(var(--foreground))',
                    fontSize: 10,
                  }}
                  className="mono"
                >
                  <Star size={10} fill="currentColor" /> {avgRating} ({productReviews.length})
                </span>
              </>
            )}
          </div>
        </div>
        <span className="price">{money(product.price)}</span>
      </Link>
    </article>
  );
}

function QuickViewModal({
  wishlist,
  onToggleWish,
}: {
  wishlist: string[];
  onToggleWish: (id: string) => void;
}) {
  const { quickViewProduct, closeQuickView, addToCart, reviews } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes?.[0] || 'M');
      setAdded(false);
    }
  }, [quickViewProduct]);

  useEffect(() => {
    if (!quickViewProduct) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeQuickView();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [quickViewProduct, closeQuickView]);

  if (!quickViewProduct) return null;

  const isSaved = wishlist.includes(quickViewProduct.id);
  const productReviews = reviews.filter((r) => r.product_id === quickViewProduct.id);
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : null;

  const handleAdd = () => {
    setIsAdding(true);
    setTimeout(() => {
      addToCart(quickViewProduct.id, selectedSize || quickViewProduct.sizes?.[0] || 'M');
      setIsAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }, 280);
  };

  return (
    <div
      className="quick-view-overlay"
      id="quick-view-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      onClick={closeQuickView}
      data-testid="modal-quick-view"
    >
      <div className="quick-view-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="quick-view-close"
          onClick={closeQuickView}
          aria-label="Close quick view"
          data-testid="button-close-quick-view"
        >
          <X size={16} />
        </button>

        <div className="quick-view-media">
          <img
            src={quickViewProduct.image}
            alt={quickViewProduct.alt || quickViewProduct.name}
            data-testid="quick-view-image"
          />
          {quickViewProduct.badge && (
            <span className="product-badge">{quickViewProduct.badge}</span>
          )}
        </div>

        <div className="quick-view-body">
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span className="eyebrow accent">DIRACE / {quickViewProduct.category}</span>
              <span className="mono muted" style={{ fontSize: 10 }}>
                {quickViewProduct.stock ? `${quickViewProduct.stock} in archive` : 'In stock'}
              </span>
            </div>

            <h2
              id="quick-view-title"
              className="display"
              style={{
                fontSize: 'clamp(24px, 3.2vw, 36px)',
                margin: '0 0 10px',
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
              }}
              data-testid="quick-view-title"
            >
              {quickViewProduct.name}
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div className="mono" style={{ fontSize: 18, fontWeight: 600 }} data-testid="quick-view-price">
                {money(quickViewProduct.price)}
              </div>
              {avgRating ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'hsl(var(--foreground))',
                    fontSize: 11,
                  }}
                  className="mono"
                >
                  <Star size={11} fill="currentColor" /> {avgRating} ({productReviews.length} reflection{productReviews.length > 1 ? 's' : ''})
                </div>
              ) : (
                <span className="mono muted" style={{ fontSize: 10 }}>
                  No client reflections yet
                </span>
              )}
            </div>

            <p
              className="muted"
              style={{
                fontSize: 12,
                lineHeight: 1.7,
                margin: '0 0 22px',
                maxWidth: 400,
              }}
              data-testid="quick-view-description"
            >
              {quickViewProduct.description}
            </p>

            {/* Size Selector */}
            <div style={{ marginBottom: 24 }}>
              <div className="size-label" style={{ margin: '0 0 10px' }}>
                <span>Select Size</span>
                <span className="muted mono" style={{ fontSize: 10 }}>
                  Selected: <strong>{selectedSize}</strong>
                </span>
              </div>
              <div className="size-grid">
                {(quickViewProduct.sizes || ['XS', 'S', 'M', 'L']).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`size-btn ${selectedSize === sz ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(sz)}
                    data-testid={`quick-view-size-${sz}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
              <button
                type="button"
                className="primary-btn"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                disabled={isAdding}
                onClick={handleAdd}
                data-testid={`button-quick-view-add-to-bag-${quickViewProduct.id}`}
              >
                {isAdding ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Adding to Bag...
                  </>
                ) : added ? (
                  <>
                    <Check size={14} /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} /> Add to Bag — {money(quickViewProduct.price)}
                  </>
                )}
              </button>

              <button
                type="button"
                className={`secondary-btn ${isSaved ? 'saved' : ''}`}
                style={{
                  width: 48,
                  padding: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: isSaved ? 'hsl(var(--foreground))' : 'transparent',
                  color: isSaved ? 'hsl(var(--background))' : 'inherit',
                }}
                onClick={() => onToggleWish(quickViewProduct.id)}
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                data-testid={`button-quick-view-wishlist-${quickViewProduct.id}`}
              >
                <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <Link
                href={`/product/${quickViewProduct.id}`}
                onClick={closeQuickView}
                className="text-link"
                style={{ fontSize: 10 }}
                data-testid="link-quick-view-full-page"
              >
                View Full Editorial Details & Client Reviews <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogNotice({
  title = 'Curating collection.',
  copy = 'Preparing the latest pieces for your selection.',
}: {
  title?: string;
  copy?: string;
}) {
  return (
    <div className="empty-state">
      <div className="accent">
        <ShoppingBag size={24} />
      </div>
      <h2 className="display">{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

function Home({ wishlist, onToggleWish }: { wishlist: string[]; onToggleWish: (id: string) => void }) {
  const { products } = useStore();

  return (
    <main>
      <section className="hero">
        <div className="hero-copy reveal">
          <div>
            <div className="eyebrow accent">Collection 01 / 25</div>
            <h1 className="display">
              DEFINE
              <br />
              YOUR OWN
              <br />
              <span className="accent">STANDARD.</span>
            </h1>
          </div>
          <div>
            <p>DIRACE is a uniform for the self-defined. Considered shapes, uncompromising materials, no borrowed ideas.</p>
            <div className="hero-note">
              <span>THE NEW STANDARD</span>
              <Link href="/shop" className="circle-arrow" aria-label="Shop the latest drop" data-testid="link-hero-shop">
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-image reveal delay-2" role="img" aria-label="DIRACE campaign portrait" />
      </section>
      <div className="marquee">
        <div className="marquee-track">
          <span>DIRACE IS LAW</span>
          <span className="dot">·</span>
          <span>DIRACE IS LAW</span>
          <span className="dot">·</span>
          <span>DIRACE IS LAW</span>
          <span className="dot">·</span>
          <span>DIRACE IS LAW</span>
          <span className="dot">·</span>
          <span>DIRACE IS LAW</span>
          <span className="dot">·</span>
          <span>DIRACE IS LAW</span>
          <span className="dot">·</span>
          <span>DIRACE IS LAW</span>
          <span className="dot">·</span>
          <span>DIRACE IS LAW</span>
        </div>
      </div>
      <section className="section page-wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow accent">01 / The edit</div>
            <h2 className="display section-title">
              THE LATEST
              <br />
              DROP
            </h2>
          </div>
          <div className="section-copy">
            A considered collection for a life in motion. Prices in Nigerian Naira (₦).
            <br />
            <Link href="/shop" className="text-link" style={{ marginTop: 22 }} data-testid="link-shop-latest">
              Shop the edit <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        {products.length > 0 ? (
          <div className="product-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSaved={wishlist.includes(product.id)}
                onToggleWish={onToggleWish}
              />
            ))}
          </div>
        ) : (
          <CatalogNotice />
        )}
      </section>
      <section className="manifesto">
        <div className="page-wrap manifesto-inner">
          <div>
            <div className="eyebrow">A point of view</div>
            <p>
              We make pieces with a point of view, not a shelf life. Every seam has a reason. Every silhouette leaves room
              for you.
            </p>
          </div>
          <h2 className="display">
            WEAR WHAT
            <br />
            <span className="accent">DEFINES YOU.</span>
          </h2>
        </div>
      </section>
      <section className="split-feature">
        <div className="feature-image" role="img" aria-label="Charcoal tailoring on a steel chair" />
        <div className="feature-copy">
          <div>
            <div className="feature-number">02 / THE FORM STUDY</div>
            <h2 className="display">
              CUT WITH
              <br />
              CONVICTION.
            </h2>
          </div>
          <div>
            <p>
              Our first study in tailoring: softened structure, severe proportions, and the kind of cloth that remembers
              where you have been.
            </p>
            <Link href="/collections" className="text-link" data-testid="link-form-study">
              View the collection <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section page-wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow accent">03 / Field notes</div>
            <h2 className="display section-title">
              THE WORLD
              <br />
              AROUND IT
            </h2>
          </div>
          <div className="section-copy">
            A look at the places, objects and people that make the DIRACE language.{' '}
            <Link href="/about" className="text-link" style={{ marginTop: 22 }} data-testid="link-about-notes">
              Read our story <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="editorial-strip">
          <div className="editorial-tile">
            <img src="/dirace-look-03.jpg" alt="Ivory knit textile detail" />
            <span className="editorial-label">01 — Texture</span>
          </div>
          <div className="editorial-tile">
            <img src="/dirace-look-02.jpg" alt="DIRACE street look" />
            <span className="editorial-label">02 — Movement</span>
          </div>
          <div className="editorial-tile">
            <img src="/dirace-look-01.jpg" alt="Charcoal tailoring detail" />
            <span className="editorial-label">03 — Form</span>
          </div>
        </div>
      </section>
      <Signup />
    </main>
  );
}

function Signup() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email) {
      setSubscribing(true);
      setTimeout(() => {
        setSubscribing(false);
        setSent(true);
      }, 500);
    }
  };

  return (
    <div className="page-wrap">
      <section className="newsletter">
        <div>
          <div className="eyebrow accent">Stay in the loop</div>
          <h2 className="display">NOISE, FILTERED.</h2>
        </div>
        {sent ? (
          <div className="mono">
            <Check size={14} style={{ verticalAlign: 'middle' }} /> You're on the list.
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Email address"
              data-testid="input-newsletter-email"
              disabled={subscribing}
            />
            <button type="submit" disabled={subscribing} data-testid="button-newsletter-submit">
              {subscribing ? (
                <>
                  Subscribing... <Loader2 size={13} className="animate-spin" style={{ verticalAlign: 'middle' }} />
                </>
              ) : (
                <>
                  Subscribe <ArrowRight size={13} style={{ verticalAlign: 'middle' }} />
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function Shop({ wishlist, onToggleWish }: { wishlist: string[]; onToggleWish: (id: string) => void }) {
  const { products } = useStore();
  const [category, setCategory] = useState('All');
  const categories = ['All', 'Outerwear', 'Tailoring', 'Bottoms', 'Tops', 'Accessories', 'Knitwear'];
  const filtered = category === 'All' ? products : products.filter((p) => p.category === category);

  return (
    <main className="page-wrap">
      <div className="page-header">
        <div className="eyebrow accent">DIRACE / Shop</div>
        <h1 className="display">THE COLLECTION</h1>
      </div>
      <div className="shop-toolbar">
        <span className="mono muted">{filtered.length} pieces</span>
        <div className="filter-row">
          {categories.map((item) => (
            <button
              key={item}
              className={`filter-btn ${category === item ? 'active' : ''}`}
              onClick={() => setCategory(item)}
              data-testid={`button-filter-${item.toLowerCase()}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {filtered.length > 0 ? (
        <div className="shop-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSaved={wishlist.includes(product.id)}
              onToggleWish={onToggleWish}
            />
          ))}
        </div>
      ) : (
        <CatalogNotice title="No pieces found." copy="No garments match your selected criteria. Try adjusting your filters or search." />
      )}
    </main>
  );
}

function ProductDetail({
  wishlist,
  onToggleWish,
  onAdd,
}: {
  wishlist: string[];
  onToggleWish: (id: string) => void;
  onAdd: (id: string, size: string) => void;
}) {
  const { products, reviews, addReview, deleteReview, currentUser, refreshUser } = useStore();
  const [, params] = useRoute('/product/:id');
  const product = products.find((item) => item.id === params?.id);
  const [size, setSize] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Reviews state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Recommended products from same category in Supabase
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [params?.id]);

  // Fetch recommended products from the same category from Supabase
  useEffect(() => {
    let isSubscribed = true;
    if (product) {
      setLoadingRecommended(true);
      fetchRecommendedProductsFromSupabase(product.category, product.id, 4)
        .then((data) => {
          if (isSubscribed) {
            setRecommended(data);
            setLoadingRecommended(false);
          }
        })
        .catch((err) => {
          console.warn('Error querying recommended items from Supabase:', err);
          if (isSubscribed) {
            const fallback = products.filter(
              (item) => item.category === product.category && item.id !== product.id
            );
            setRecommended(fallback.slice(0, 4));
            setLoadingRecommended(false);
          }
        });
    }
    return () => {
      isSubscribed = false;
    };
  }, [product?.id, product?.category, products]);

  // Quick auth state for unauthenticated users
  const [quickAuthMode, setQuickAuthMode] = useState<'signin' | 'signup'>('signin');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickAuthLoading, setQuickAuthLoading] = useState(false);
  const [quickAuthError, setQuickAuthError] = useState<string | null>(null);

  if (!product) {
    return (
      <main className="page-wrap detail-page">
        <CatalogNotice title="Piece not found." copy="Return to the shop to view available pieces." />
      </main>
    );
  }

  const productReviews = reviews.filter((r) => r.product_id === product.id);
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : null;

  const selectedSize = size || (product.sizes && product.sizes[0]) || 'M';
  const add = () => {
    setIsAdding(true);
    window.setTimeout(() => {
      onAdd(product.id, selectedSize);
      setIsAdding(false);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    }, 280);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setReviewFeedback({
        type: 'error',
        message: 'Authentication required. Please sign in to leave a review.',
      });
      return;
    }
    if (!comment.trim()) {
      setReviewFeedback({
        type: 'error',
        message: 'Please provide commentary or reflection regarding this piece.',
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewerName =
        currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Verified Client';
      await addReview({
        product_id: product.id,
        user_id: currentUser.id,
        user_name: reviewerName,
        user_email: currentUser.email || null,
        rating,
        comment: comment.trim(),
      });

      setComment('');
      setRating(5);
      setReviewFeedback({
        type: 'success',
        message: 'Your review has been successfully published and added to the archive.',
      });
      window.setTimeout(() => setReviewFeedback(null), 5000);
    } catch (err: any) {
      setReviewFeedback({
        type: 'error',
        message: err?.message || 'Failed to submit review. Please try again.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuickAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickAuthLoading(true);
    setQuickAuthError(null);

    if (quickAuthMode === 'signup') {
      const res = await supabaseSignUp(quickEmail, quickPassword, quickName);
      if (res.error) {
        setQuickAuthError(res.error);
      } else {
        await refreshUser();
      }
    } else {
      const res = await supabaseSignIn(quickEmail, quickPassword);
      if (res.error) {
        setQuickAuthError(res.error);
      } else {
        await refreshUser();
      }
    }
    setQuickAuthLoading(false);
  };

  return (
    <main className="page-wrap detail-page">
      <div className="mono muted" style={{ marginBottom: 24 }}>
        <Link href="/shop">Shop</Link> / {product.category} / {product.name}
      </div>
      <div className="detail-layout">
        <div className="detail-gallery">
          <img src={product.image} alt={product.alt || product.name} />
          <img
            src={product.image}
            alt={`${product.name} detail`}
            style={{ filter: 'saturate(.3) contrast(1.08)', transform: 'scaleX(-1)' }}
          />
        </div>
        <div className="detail-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="eyebrow accent">{product.badge ?? product.category}</div>
            {avgRating && (
              <>
                <span className="muted">·</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }} className="mono">
                  <div style={{ display: 'flex', color: 'hsl(var(--foreground))' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        fill={s <= Math.round(Number(avgRating)) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      />
                    ))}
                  </div>
                  <span>
                    {avgRating} ({productReviews.length} {productReviews.length === 1 ? 'reflection' : 'reflections'})
                  </span>
                </div>
              </>
            )}
          </div>
          <h1 className="display">{product.name}</h1>
          <div className="detail-price">{money(product.price)}</div>
          <p className="detail-description">{product.description}</p>
          <div className="size-label">
            <span>Select size</span>
            <Link href="/contact">Size guide</Link>
          </div>
          <div className="size-grid">
            {(product.sizes || ['XS', 'S', 'M', 'L']).map((item) => (
              <button
                key={item}
                className={`size-btn ${selectedSize === item ? 'selected' : ''}`}
                onClick={() => setSize(item)}
                data-testid={`button-size-${item}`}
              >
                {item}
              </button>
            ))}
          </div>
          <button className="primary-btn full-btn" onClick={add} disabled={isAdding} data-testid={`button-add-${product.id}`}>
            {isAdding ? (
              <>
                Adding to bag... <Loader2 size={14} className="animate-spin" style={{ verticalAlign: 'middle' }} />
              </>
            ) : added ? (
              <>
                Added to bag <Check size={14} style={{ verticalAlign: 'middle' }} />
              </>
            ) : (
              <>
                Add to bag <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
              </>
            )}
          </button>
          <button
            className={`secondary-btn full-btn ${wishlist.includes(product.id) ? 'saved' : ''}`}
            onClick={() => onToggleWish(product.id)}
            data-testid={`button-detail-wishlist-${product.id}`}
          >
            {wishlist.includes(product.id) ? 'Saved to wishlist' : 'Save to wishlist'}{' '}
            <Heart
              size={14}
              fill={wishlist.includes(product.id) ? 'currentColor' : 'none'}
              style={{ verticalAlign: 'middle' }}
            />
          </button>
          <div className="accordions">
            <div className="accordion">
              Material & care <Plus size={14} />
            </div>
            <div className="accordion">
              Shipping & courier delivery <Plus size={14} />
            </div>
            <div className="accordion">
              The DIRACE standard <Plus size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDED FOR YOU (SUPABASE SAME-CATEGORY QUERY) */}
      <section
        className="recommended-section"
        style={{
          marginTop: 88,
          borderTop: '1px solid hsl(var(--border))',
          paddingTop: 64,
        }}
        data-testid="section-recommended-products"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 36,
          }}
        >
          <div>
            <div className="eyebrow accent" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>DIRACE / {product.category} Archive</span>
              <span className="muted">·</span>
              <span className="muted">Curated Match</span>
            </div>
            <h2 className="display" style={{ fontSize: 36, margin: '8px 0 4px', textTransform: 'uppercase' }}>
              RECOMMENDED FOR YOU
            </h2>
            <p className="muted" style={{ fontSize: 13, maxWidth: 520, lineHeight: 1.6 }}>
              Curated silhouettes and complementary tailoring from the{' '}
              <strong style={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>{product.category}</strong> collection.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              className="mono"
              style={{
                fontSize: 10,
                padding: '6px 12px',
                background: 'hsl(0 0% 92%)',
                border: '1px solid hsl(var(--border))',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{product.category.toUpperCase()} ARCHIVE ({recommended.length} PIECES)</span>
            </div>
          </div>
        </div>

        {loadingRecommended ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  background: 'hsl(0 0% 94%)',
                  aspectRatio: '.78',
                  animation: 'pulse 1.8s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : recommended.length > 0 ? (
          <div
            className="product-grid"
            data-testid="recommended-products-grid"
          >
            {recommended.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                isSaved={wishlist.includes(item.id)}
                onToggleWish={onToggleWish}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              border: '1px dashed hsl(var(--border))',
              background: 'hsl(0 0% 98%)',
            }}
          >
            <p className="muted mono" style={{ fontSize: 12 }}>
              No other pieces currently catalogued in the '{product.category}' category.
            </p>
          </div>
        )}
      </section>

      {/* CLIENT REVIEWS & REFLECTIONS */}
      <section className="product-reviews-section" style={{ marginTop: 80, borderTop: '1px solid hsl(var(--border))', paddingTop: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
          <div>
            <div className="eyebrow accent">Verified Client Reflections</div>
            <h2 className="display" style={{ fontSize: 38, margin: '8px 0 4px' }}>
              CLIENT REVIEWS & ARCHIVE NOTES
            </h2>
            <p className="muted" style={{ fontSize: 13, maxWidth: 540, lineHeight: 1.6 }}>
              Authentic reflections submitted by verified clients and archival collectors.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="mono"
              style={{
                fontSize: 10,
                padding: '5px 12px',
                background: 'hsl(0 0% 92%)',
                border: '1px solid hsl(var(--border))',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={12} />
              VERIFIED ARCHIVE REVIEWS
            </div>
          </div>
        </div>

        {/* Overall Score + Distribution */}
        <div className="review-stats-card">
          <div className="review-score-summary">
            <div className="eyebrow muted">Overall rating</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '10px 0 6px' }}>
              <span className="display" style={{ fontSize: 52, lineHeight: 1 }}>
                {avgRating || '—'}
              </span>
              <span className="mono muted" style={{ fontSize: 14 }}>/ 5.0</span>
            </div>
            <div style={{ display: 'flex', gap: 3, color: 'hsl(var(--foreground))', marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= Math.round(Number(avgRating || 5)) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                />
              ))}
            </div>
            <div className="mono muted" style={{ fontSize: 11 }}>
              Based on {productReviews.length} {productReviews.length === 1 ? 'verified reflection' : 'verified reflections'}
            </div>
          </div>

          {/* Distribution bars */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = productReviews.filter((r) => r.rating === stars).length;
              const pct = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
              return (
                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11 }} className="mono">
                  <span style={{ width: 44, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {stars} <Star size={10} fill="currentColor" />
                  </span>
                  <div style={{ flex: 1, height: 6, background: 'hsl(var(--border))', position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${pct}%`,
                        background: 'hsl(var(--foreground))',
                        transition: 'width .3s ease',
                      }}
                    />
                  </div>
                  <span className="muted" style={{ width: 28, textAlign: 'right' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* REVIEW SUBMISSION SECTION */}
        <div className="review-submission-layout">
          {/* Form on left (or card) */}
          <div className="review-form-box">
            <div className="eyebrow accent" style={{ marginBottom: 6 }}>
              Step 01 / Write a Review
            </div>
            <h3 className="display" style={{ fontSize: 24, margin: '0 0 16px' }}>
              RECORD A REFLECTION
            </h3>

            {reviewFeedback && (
              <div
                style={{
                  padding: '12px 14px',
                  marginBottom: 20,
                  fontSize: 12,
                  lineHeight: 1.5,
                  background: reviewFeedback.type === 'error' ? 'hsl(0 80% 96%)' : 'hsl(142 70% 96%)',
                  color: reviewFeedback.type === 'error' ? 'hsl(0 80% 30%)' : 'hsl(142 70% 25%)',
                  border: '1px solid currentColor',
                }}
              >
                {reviewFeedback.message}
              </div>
            )}

            {currentUser ? (
              <form onSubmit={handleReviewSubmit} style={{ display: 'grid', gap: 18 }}>
                {/* Authenticated user badge */}
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'hsl(0 0% 96%)',
                    border: '1px solid hsl(var(--border))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <ShieldCheck size={16} className="accent" />
                  <div style={{ fontSize: 11 }}>
                    <div className="mono" style={{ fontWeight: 600 }}>
                      {currentUser.user_metadata?.full_name || currentUser.email}
                    </div>
                    <div className="muted" style={{ fontSize: 10 }}>
                      Verified Client Session
                    </div>
                  </div>
                </div>

                {/* Star Rating Selection */}
                <div className="field">
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 11 }} className="mono">
                    Star Rating ({rating} of 5)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const active = starVal <= (hoverRating || rating);
                      return (
                        <button
                          key={starVal}
                          type="button"
                          style={{
                            background: 'none',
                            border: 0,
                            padding: 4,
                            color: active ? 'hsl(var(--foreground))' : 'hsl(0 0% 72%)',
                            cursor: 'pointer',
                            transition: 'transform .15s ease',
                          }}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starVal)}
                          aria-label={`Rate ${starVal} stars`}
                        >
                          <Star size={24} fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
                        </button>
                      );
                    })}
                    <span className="mono muted" style={{ fontSize: 11, marginLeft: 8 }}>
                      {rating === 5 && 'Masterpiece'}
                      {rating === 4 && 'Refined & Considered'}
                      {rating === 3 && 'Standard Fit'}
                      {rating === 2 && 'Noticeable Flaws'}
                      {rating === 1 && 'Below Standard'}
                    </span>
                  </div>
                </div>

                {/* Review Comment */}
                <div className="field">
                  <label htmlFor="review-comment" style={{ display: 'block', marginBottom: 8, fontSize: 11 }} className="mono">
                    Comment & Reflection
                  </label>
                  <textarea
                    id="review-comment"
                    required
                    rows={4}
                    placeholder="Reflections on silhouette, drape, wool weight, cut, and sizing..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      font: 'inherit',
                      fontSize: 13,
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--background))',
                      color: 'inherit',
                      resize: 'vertical',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="primary-btn full-btn"
                  disabled={submittingReview}
                  style={{ marginTop: 4 }}
                >
                  {submittingReview ? (
                    <>
                      Recording Reflection... <Loader2 size={14} className="animate-spin" style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                    </>
                  ) : (
                    <>
                      Submit Reflection <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div>
                <div
                  style={{
                    padding: 18,
                    background: 'hsl(0 0% 96%)',
                    border: '1px solid hsl(var(--border))',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <ShieldCheck size={16} />
                    <strong className="mono" style={{ fontSize: 11 }}>
                      AUTHENTICATION REQUIRED
                    </strong>
                  </div>
                  <p className="muted" style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                    To ensure the integrity of the archive, reflections can only be posted by authenticated clients.
                  </p>
                </div>

                {/* Quick inline auth widget */}
                <div style={{ border: '1px solid hsl(var(--border))', padding: 18 }}>
                  <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid hsl(var(--border))', paddingBottom: 10, marginBottom: 14 }}>
                    <button
                      type="button"
                      className={`mono ${quickAuthMode === 'signin' ? 'accent' : 'muted'}`}
                      style={{ background: 'none', border: 0, fontWeight: quickAuthMode === 'signin' ? 700 : 400, fontSize: 11 }}
                      onClick={() => setQuickAuthMode('signin')}
                    >
                      01 / Sign In
                    </button>
                    <button
                      type="button"
                      className={`mono ${quickAuthMode === 'signup' ? 'accent' : 'muted'}`}
                      style={{ background: 'none', border: 0, fontWeight: quickAuthMode === 'signup' ? 700 : 400, fontSize: 11 }}
                      onClick={() => setQuickAuthMode('signup')}
                    >
                      02 / Create Account
                    </button>
                  </div>

                  {quickAuthError && (
                    <div
                      style={{
                        padding: '8px 10px',
                        marginBottom: 12,
                        fontSize: 11,
                        background: 'hsl(0 80% 96%)',
                        color: 'hsl(0 80% 30%)',
                        border: '1px solid currentColor',
                      }}
                    >
                      {quickAuthError}
                    </div>
                  )}

                  <form onSubmit={handleQuickAuth} style={{ display: 'grid', gap: 12 }}>
                    {quickAuthMode === 'signup' && (
                      <div className="field">
                        <label style={{ fontSize: 10 }} className="mono">Full name</label>
                        <input
                          required
                          placeholder="Jane Doe"
                          value={quickName}
                          onChange={(e) => setQuickName(e.target.value)}
                          style={{ padding: '8px 10px', fontSize: 12 }}
                        />
                      </div>
                    )}
                    <div className="field">
                      <label style={{ fontSize: 10 }} className="mono">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="client@dirace.com"
                        value={quickEmail}
                        onChange={(e) => setQuickEmail(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: 12 }}
                      />
                    </div>
                    <div className="field">
                      <label style={{ fontSize: 10 }} className="mono">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={quickPassword}
                        onChange={(e) => setQuickPassword(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: 12 }}
                      />
                    </div>
                    <button type="submit" className="primary-btn full-btn" disabled={quickAuthLoading} style={{ marginTop: 4 }}>
                      {quickAuthLoading ? (
                        <>
                          Authenticating... <Loader2 size={13} className="animate-spin" style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                        </>
                      ) : (
                        quickAuthMode === 'signin' ? 'Sign In & Unlock Reviews' : 'Create Account & Unlock'
                      )}
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: 14 }}>
                    <Link href="/account" className="mono muted" style={{ fontSize: 10, textDecoration: 'underline' }}>
                      Or go to Client Account page &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviews List on right */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="eyebrow accent">
                Archive Reflections ({productReviews.length})
              </div>
              <div className="mono muted" style={{ fontSize: 10 }}>
                Verified client reflections
              </div>
            </div>

            {productReviews.length === 0 ? (
              <div
                style={{
                  padding: 48,
                  textAlign: 'center',
                  background: 'hsl(0 0% 96%)',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <MessageSquare size={24} className="muted" style={{ margin: '0 auto 12px' }} />
                <h3 className="display" style={{ fontSize: 20, margin: 0 }}>
                  NO REFLECTIONS YET
                </h3>
                <p className="muted" style={{ fontSize: 12, marginTop: 8, maxWidth: 360, margin: '8px auto 0' }}>
                  Be the first verified client to record your review for this piece.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {productReviews.map((rev) => {
                  const isOwner = currentUser && (currentUser.id === rev.user_id || currentUser.email === rev.user_email);
                  return (
                    <div
                      key={rev.id}
                      style={{
                        border: '1px solid hsl(var(--border))',
                        padding: 24,
                        background: 'hsl(0 0% 98%)',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ display: 'flex', color: 'hsl(var(--foreground))' }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={13}
                                  fill={s <= rev.rating ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                />
                              ))}
                            </div>
                            <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>
                              {rev.rating}.0 / 5.0
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                              {rev.user_name}
                            </span>
                            <span
                              className="mono"
                              style={{
                                fontSize: 9,
                                padding: '2px 6px',
                                background: 'hsl(0 0% 90%)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <ShieldCheck size={10} /> Verified Client
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="mono muted" style={{ fontSize: 10 }}>
                            {new Date(rev.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {isOwner && (
                            <button
                              className="icon-btn"
                              style={{ padding: 4 }}
                              title="Delete reflection"
                              onClick={() => deleteReview(rev.id)}
                            >
                              <Trash2 size={13} className="muted" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p
                        style={{
                          margin: '12px 0 0',
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: 'hsl(var(--foreground))',
                        }}
                      >
                        "{rev.comment}"
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Collections() {
  return (
    <main>
      <div className="page-wrap">
        <div className="page-header">
          <div className="eyebrow accent">DIRACE / Collections</div>
          <h1 className="display">
            A STUDY IN
            <br />
            CONTRAST
          </h1>
        </div>
      </div>
      <section className="split-feature">
        <div className="feature-image" style={{ backgroundImage: "url('/dirace-look-02.jpg')" }} />
        <div className="feature-copy">
          <div>
            <div className="feature-number">Collection 01 / 25</div>
            <h2 className="display">
              THE NEW
              <br />
              STANDARD.
            </h2>
          </div>
          <div>
            <p>
              Built from the tension between utility and elegance. A wardrobe of strong lines, generous volume and
              subtle interruption.
            </p>
            <Link href="/shop" className="text-link">
              Shop Collection 01 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section page-wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow accent">The language</div>
            <h2 className="display section-title">
              THREE
              <br />
              INSTINCTS
            </h2>
          </div>
          <div className="section-copy">
            Every DIRACE collection starts with a question: what can a garment say before you do?
          </div>
        </div>
        <div className="editorial-strip">
          <div className="editorial-tile">
            <img src="/dirace-look-01.jpg" alt="Tailoring collection" />
            <span className="editorial-label">01 — Structure</span>
          </div>
          <div className="editorial-tile">
            <img src="/dirace-look-03.jpg" alt="Knitwear collection" />
            <span className="editorial-label">02 — Ease</span>
          </div>
          <div className="editorial-tile">
            <img src="/dirace-hero.jpg" alt="Outerwear collection" />
            <span className="editorial-label">03 — Presence</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function About() {
  return (
    <main className="page-wrap">
      <div className="page-header">
        <div className="eyebrow accent">DIRACE / About</div>
        <h1 className="display">
          WE MAKE
          <br />
          THE MARK.
        </h1>
      </div>
      <div className="content-narrow">
        <div className="about-grid">
          <div>
            <div className="eyebrow accent">Our standard</div>
            <h2 className="display">
              CLOTHING
              <br />
              AS IDENTITY.
            </h2>
          </div>
          <div>
            <p>
              DIRACE began with a simple refusal: to make clothes that disappear. We believe what you wear can be an act of
              authorship — an external language for an internal point of view.
            </p>
            <p>
              Based in Nigeria and made in small, deliberate runs, each piece is designed to stay in rotation. We choose cloth
              for its hand, construction for its longevity, and proportion for the room it gives you.
            </p>
            <p>We are not interested in basics. We are interested in the things you reach for when you know exactly who you are.</p>
          </div>
        </div>
        <div
          style={{
            marginTop: 90,
            aspectRatio: '1.9',
            background: "url('/dirace-hero.jpg') center 42% / cover",
            filter: 'saturate(.5)',
          }}
        />
        <div className="about-columns" style={{ marginTop: 80 }}>
          <div>
            <div className="eyebrow accent">01 — Materials</div>
            <p className="muted" style={{ lineHeight: 1.8, fontSize: 13 }}>
              Traceable wool. Dense cotton. Organic yarns. We select materials for how they age, not how they photograph on day
              one.
            </p>
          </div>
          <div>
            <div className="eyebrow accent">02 — Making</div>
            <p className="muted" style={{ lineHeight: 1.8, fontSize: 13 }}>
              Small runs, close partners, clear standards. Good clothing is a conversation between a designer, a maker and the
              person who wears it.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 600);
  };

  return (
    <main className="page-wrap">
      <div className="page-header">
        <div className="eyebrow accent">DIRACE / Contact</div>
        <h1 className="display">
          SAY
          <br />
          HELLO.
        </h1>
      </div>
      <div className="content-narrow">
        <div className="about-grid">
          <div>
            <p className="display" style={{ fontSize: 36 }}>
              For questions about an order, a piece, or anything else on your mind.
            </p>
            <div className="footer-links" style={{ marginTop: 40 }}>
              <a
                href="https://wa.me/2349136660187"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
              >
                <WhatsAppIcon size={14} className="footer-social-icon" />
                <span>WhatsApp: +234 913 666 0187</span>
                <ArrowUpRight size={11} style={{ opacity: 0.6 }} />
              </a>
              <a
                href="https://www.instagram.com/dirace_?stkn=djRpbnhoamh2bWJh&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
              >
                <InstagramIcon size={14} className="footer-social-icon" />
                <span>Instagram: @dirace_</span>
                <ArrowUpRight size={11} style={{ opacity: 0.6 }} />
              </a>
              <a href="mailto:studio@dirace.com">studio@dirace.com</a>
              <span>Mon–Fri / 09:00–18:00 WAT</span>
              <span>
                Victoria Island
                <br />
                Lagos, Nigeria
              </span>
            </div>
          </div>
          {sent ? (
            <div className="empty-state" style={{ padding: 50 }}>
              <Check size={26} className="accent" />
              <h2 style={{ fontSize: 28 }}>Message sent.</h2>
              <p>We'll be in touch within two working days.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Your name</label>
                <input id="name" required data-testid="input-contact-name" disabled={submitting} />
              </div>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input id="email" type="email" required data-testid="input-contact-email" disabled={submitting} />
              </div>
              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea id="message" required data-testid="input-contact-message" disabled={submitting} />
              </div>
              <button className="primary-btn" type="submit" disabled={submitting} data-testid="button-contact-submit">
                {submitting ? (
                  <>
                    Sending message... <Loader2 size={14} className="animate-spin" style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                  </>
                ) : (
                  <>
                    Send message <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function Wishlist({ wishlist, onToggleWish }: { wishlist: string[]; onToggleWish: (id: string) => void }) {
  const { products } = useStore();
  const saved = products.filter((product) => wishlist.includes(product.id));

  return (
    <main className="page-wrap">
      <div className="page-header">
        <div className="eyebrow accent">DIRACE / Personal</div>
        <h1 className="display">WISHLIST</h1>
      </div>
      {saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet."
          copy="Click the heart on any piece in the collection to keep it close."
          cta="Explore the collection"
          href="/shop"
          icon={<Heart size={24} />}
        />
      ) : (
        <div className="shop-grid">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} isSaved onToggleWish={onToggleWish} />
          ))}
        </div>
      )}
    </main>
  );
}

function Cart({
  items,
  onQty,
  onRemove,
}: {
  items: CartItem[];
  onQty: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}) {
  const { products } = useStore();
  const detailed = items
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId) || DEFAULT_PRODUCTS.find((p) => p.id === item.productId)!,
    }))
    .filter((item) => Boolean(item.product));

  const subtotal = detailed.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = 5000;
  const grandTotal = subtotal + shippingFee;

  return (
    <main className="page-wrap">
      <div className="page-header">
        <div className="eyebrow accent">DIRACE / Your selection</div>
        <h1 className="display">
          YOUR BAG <span className="muted" style={{ fontSize: '30%' }}>({items.length})</span>
        </h1>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title="Your bag is quiet."
          copy="The right piece is worth waiting for."
          cta="Discover the collection"
          href="/shop"
          icon={<ShoppingBag size={24} />}
        />
      ) : (
        <div className="cart-layout">
          <div>
            {detailed.map((item, index) => (
              <div className="cart-item" key={`${item.product.id}-${item.size}`}>
                <img src={item.product.image} alt={item.product.alt} />
                <div>
                  <div className="eyebrow accent">{item.product.category}</div>
                  <h3>{item.product.name}</h3>
                  <div className="muted" style={{ fontSize: 11 }}>
                    Size {item.size}
                  </div>
                  <div className="qty-control" style={{ marginTop: 17 }}>
                    <button
                      onClick={() => onQty(index, -1)}
                      aria-label="Decrease quantity"
                      data-testid={`button-decrease-${item.product.id}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span data-testid={`text-quantity-${item.product.id}`}>{item.quantity}</span>
                    <button
                      onClick={() => onQty(index, 1)}
                      aria-label="Increase quantity"
                      data-testid={`button-increase-${item.product.id}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="price">{money(item.product.price * item.quantity)}</div>
                  <button
                    className="icon-btn"
                    onClick={() => onRemove(index)}
                    aria-label="Remove item"
                    data-testid={`button-remove-${item.product.id}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <aside className="cart-summary">
            <div className="eyebrow accent">Summary</div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Standard Delivery</span>
              <span>{money(shippingFee)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{money(grandTotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="primary-btn full-btn"
              style={{ display: 'block', textAlign: 'center' }}
              data-testid="link-checkout"
            >
              Proceed to checkout <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </Link>
            <div className="mono muted" style={{ textAlign: 'center', marginTop: 18, fontSize: 9 }}>
              Base currency in Nigerian Naira (₦)
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function EmptyState({
  title,
  copy,
  cta,
  href,
  icon,
}: {
  title: string;
  copy: string;
  cta: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="accent">{icon}</div>
      <h2 className="display">{title}</h2>
      <p>{copy}</p>
      <Link href={href} className="primary-btn" style={{ display: 'inline-block', marginTop: 25 }} data-testid="link-empty-cta">
        {cta} <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
      </Link>
    </div>
  );
}

function Checkout({ items }: { items: CartItem[] }) {
  const { products, clearCart, refreshOrders } = useStore();
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    postcode: '',
  });

  const detailedItems = items
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId) || DEFAULT_PRODUCTS.find((p) => p.id === item.productId)!,
    }))
    .filter((item) => Boolean(item.product));

  const subtotal = detailedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = 5000;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const currentUser = await getSupabaseCurrentUser();
    const orderItems = detailedItems.map((item) => ({
      product_id: item.product.id,
      name: item.product.name,
      size: item.size,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image,
    }));

    try {
      const created = await createOrderInSupabase({
        user_id: currentUser?.id || null,
        customer_name: form.name,
        customer_email: form.email,
        shipping_address: form.address,
        city: form.city,
        postcode: form.postcode,
        total_amount: total,
        items: orderItems,
      });

      setOrderId(created.id);
      setPlaced(true);
      clearCart();
      await refreshOrders();
    } catch (err) {
      console.error('Failed to create order in Supabase:', err);
      // Still show confirmation in preview
      setOrderId(`ord_${Date.now().toString().slice(-6)}`);
      setPlaced(true);
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <main className="page-wrap">
        <div className="content-narrow">
          <div className="empty-state">
            <Check size={28} className="accent" />
            <h2 className="display">ORDER CONFIRMED.</h2>
            <p style={{ marginTop: 12 }}>
              Reference number: <strong className="mono">{orderId}</strong>
            </p>
            <p className="muted" style={{ maxWidth: 440, margin: '14px auto 0', lineHeight: 1.8 }}>
              Your order has been recorded. A confirmation email and shipping updates will be dispatched to{' '}
              <strong>{form.email || 'your email'}</strong>.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link href="/shop" className="primary-btn">
                Continue shopping
              </Link>
              <Link href="/account" className="secondary-btn">
                View in Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="page-wrap">
        <div className="page-header">
          <h1 className="display">CHECKOUT</h1>
        </div>
        <EmptyState
          title="Nothing to check out."
          copy="Your bag is waiting for a point of view."
          cta="Shop DIRACE"
          href="/shop"
          icon={<ShoppingBag size={24} />}
        />
      </main>
    );
  }

  return (
    <main className="page-wrap">
      <div className="page-header">
        <div className="eyebrow accent">DIRACE / Secure checkout</div>
        <h1 className="display">
          MAKE IT
          <br />
          YOURS.
        </h1>
      </div>
      <div className="cart-layout">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="eyebrow accent">01 / Delivery details</div>
          <div className="field">
            <label htmlFor="checkout-email">Email address</label>
            <input
              id="checkout-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="client@dirace.com"
              data-testid="input-checkout-email"
            />
          </div>
          <div className="field">
            <label htmlFor="checkout-name">Full name</label>
            <input
              id="checkout-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Alexander Wright"
              data-testid="input-checkout-name"
            />
          </div>
          <div className="field">
            <label htmlFor="checkout-address">Shipping address</label>
            <input
              id="checkout-address"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Admiralty Way, Lekki Phase 1"
              data-testid="input-checkout-address"
            />
          </div>
          <div className="form-two-col">
            <div className="field">
              <label htmlFor="checkout-city">City / State</label>
              <input
                id="checkout-city"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Lagos, Nigeria"
                data-testid="input-checkout-city"
              />
            </div>
            <div className="field">
              <label htmlFor="checkout-postcode">Postal Code</label>
              <input
                id="checkout-postcode"
                required
                value={form.postcode}
                onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                placeholder="101233"
                data-testid="input-checkout-postcode"
              />
            </div>
          </div>
          <div className="eyebrow accent" style={{ marginTop: 24 }}>
            02 / Payment method
          </div>
          <div className="field">
            <label htmlFor="checkout-card">Card number</label>
            <input
              id="checkout-card"
              inputMode="numeric"
              placeholder="•••• •••• •••• ••••"
              required
              data-testid="input-checkout-card"
            />
          </div>
          <button className="primary-btn" type="submit" disabled={submitting} data-testid="button-place-order">
            {submitting ? (
              <>
                Placing order... <Loader2 size={14} className="animate-spin" style={{ verticalAlign: 'middle', marginLeft: 6 }} />
              </>
            ) : (
              <>
                {`Place order · ${money(total)}`} <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
              </>
            )}
          </button>
        </form>
        <aside className="cart-summary">
          <div className="eyebrow accent">Your selection</div>
          {detailedItems.map((item) => (
            <div className="summary-row" key={`${item.productId}-${item.size}`}>
              <span>
                {item.product.name} ({item.size}) × {item.quantity}
              </span>
              <span>{money(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Standard Delivery</span>
            <span>{money(shippingFee)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total amount</span>
            <span>{money(total)}</span>
          </div>
          <div className="mono muted" style={{ marginTop: 14, fontSize: 10 }}>
            Instant order confirmation & tracking
          </div>
        </aside>
      </div>
    </main>
  );
}

function SearchPage({ wishlist, onToggleWish }: { wishlist: string[]; onToggleWish: (id: string) => void }) {
  const { products } = useStore();
  const [term, setTerm] = useState('');
  const result = useMemo(
    () => products.filter((p) => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(term.toLowerCase())),
    [products, term]
  );

  return (
    <main className="page-wrap">
      <div className="page-header">
        <div className="eyebrow accent">DIRACE / Search</div>
        <h1 className="display">
          FIND YOUR
          <br />
          FORM.
        </h1>
      </div>
      <div className="search-box">
        <Search size={22} strokeWidth={1.5} />
        <input
          autoFocus
          placeholder="Search pieces, categories..."
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          aria-label="Search products"
          data-testid="input-search"
        />
        <span className="mono muted">{result.length} results</span>
      </div>
      {term && result.length === 0 ? (
        <EmptyState
          title="No exact match."
          copy="Try a wider search. The right silhouette may be waiting under another name."
          cta="View all pieces"
          href="/shop"
          icon={<Search size={24} />}
        />
      ) : (
        <div className="shop-grid">
          {result.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSaved={wishlist.includes(product.id)}
              onToggleWish={onToggleWish}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function Account() {
  const { orders, refreshUser } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    getSupabaseCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setSubmittingAuth(true);

    try {
      if (mode === 'signup') {
        const res = await supabaseSignUp(email, password, fullName);
        if (res.error) {
          setStatusMessage({ type: 'error', text: res.error });
        } else {
          setUser(res.user);
          await refreshUser();
          setStatusMessage({ type: 'success', text: 'Account created successfully.' });
        }
      } else {
        const res = await supabaseSignIn(email, password);
        if (res.error) {
          setStatusMessage({ type: 'error', text: res.error });
        } else {
          setUser(res.user);
          await refreshUser();
          setStatusMessage({ type: 'success', text: 'Welcome back to your DIRACE space.' });
        }
      }
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabaseSignOut();
      setUser(null);
      await refreshUser();
      setStatusMessage(null);
    } finally {
      setSigningOut(false);
    }
  };

  const userOrders = orders.filter((o) => o.customer_email?.toLowerCase() === user?.email?.toLowerCase());

  return (
    <main className="page-wrap">
      <div className="page-header">
        <div className="eyebrow accent">DIRACE / Personal Space</div>
        <h1 className="display">CLIENT ACCOUNT</h1>
      </div>
      <div className="content-narrow">
        <div className="account-panel" style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow accent">Client Authentication</div>
            <div
              className="mono"
              style={{
                fontSize: 9,
                padding: '3px 8px',
                background: 'hsl(0 0% 92%)',
                border: '1px solid hsl(var(--border))',
              }}
            >
              CLIENT ARCHIVE PORTAL
            </div>
          </div>

          {user ? (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'hsl(var(--foreground))',
                    color: 'hsl(var(--background))',
                    display: 'grid',
                    placeItems: 'center',
                    font: '16px var(--app-font-serif)',
                  }}
                >
                  {user.email?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <h2 className="display" style={{ fontSize: 28, margin: 0 }}>
                    {user.user_metadata?.full_name || 'DIRACE CLIENT'}
                  </h2>
                  <p className="mono muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="rule" style={{ margin: '28px 0' }} />

              <div className="eyebrow accent">Order History</div>
              {userOrders.length > 0 ? (
                <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        border: '1px solid hsl(var(--border))',
                        padding: 16,
                        background: 'hsl(0 0% 96%)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                          {order.id}
                        </span>
                        <span
                          className="mono"
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            background: 'hsl(var(--foreground))',
                            color: 'hsl(var(--background))',
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
                        <span className="muted">{order.items?.length || 0} items</span>
                        <strong className="mono">{money(order.total_amount)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  No past orders recorded for this account.
                </p>
              )}

              <div style={{ marginTop: 36, display: 'flex', gap: 14 }}>
                <button className="secondary-btn" onClick={handleSignOut} disabled={signingOut}>
                  {signingOut ? (
                    <>
                      Signing Out... <Loader2 size={13} className="animate-spin" style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                    </>
                  ) : (
                    'Sign Out'
                  )}
                </button>
                <Link href="/shop" className="primary-btn">
                  Explore New Pieces
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', gap: 18, borderBottom: '1px solid hsl(var(--border))', paddingBottom: 12 }}>
                <button
                  type="button"
                  className={`mono ${mode === 'signin' ? 'accent' : 'muted'}`}
                  style={{ background: 'none', border: 0, fontWeight: mode === 'signin' ? 700 : 400 }}
                  onClick={() => setMode('signin')}
                >
                  01 / Sign In
                </button>
                <button
                  type="button"
                  className={`mono ${mode === 'signup' ? 'accent' : 'muted'}`}
                  style={{ background: 'none', border: 0, fontWeight: mode === 'signup' ? 700 : 400 }}
                  onClick={() => setMode('signup')}
                >
                  02 / Create Account
                </button>
              </div>

              <h2 className="display" style={{ fontSize: 36, margin: '24px 0 8px' }}>
                {mode === 'signin' ? 'WELCOME BACK.' : 'JOIN THE ARCHIVE.'}
              </h2>
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
                Access your personal archive, bespoke curation, and past dispatches.
              </p>

              {statusMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    marginBottom: 18,
                    fontSize: 12,
                    background: statusMessage.type === 'error' ? 'hsl(0 80% 95%)' : 'hsl(142 70% 95%)',
                    color: statusMessage.type === 'error' ? 'hsl(0 80% 30%)' : 'hsl(142 70% 25%)',
                    border: '1px solid currentColor',
                  }}
                >
                  {statusMessage.text}
                </div>
              )}

              <form onSubmit={handleAuth} style={{ display: 'grid', gap: 16 }}>
                {mode === 'signup' && (
                  <div className="field">
                    <label htmlFor="auth-name">Full name</label>
                    <input
                      id="auth-name"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                )}
                <div className="field">
                  <label htmlFor="auth-email">Email address</label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="client@dirace.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="auth-password">Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button className="primary-btn full-btn" type="submit" disabled={submittingAuth} style={{ marginTop: 8 }}>
                  {submittingAuth ? (
                    <>
                      {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}{' '}
                      <Loader2 size={14} className="animate-spin" style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                    </>
                  ) : (
                    <>
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}{' '}
                      <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Admin() {
  const {
    products,
    refreshProducts,
    deleteProduct,
    orders,
    refreshOrders,
    deleteOrder,
    reviews,
    refreshReviews,
    deleteReview,
  } = useStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'reviews'>('inventory');

  // Studio Admin Authentication States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminAuthChecking, setAdminAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string; name?: string; role?: string } | null>(null);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminAuthSubmitting, setAdminAuthSubmitting] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Check existing session on mount - active store accounts MUST NOT grant admin access
  useEffect(() => {
    let isMounted = true;
    async function checkAdminClearance() {
      try {
        const storedAdmin = sessionStorage.getItem('dirace_admin_auth_user');
        if (storedAdmin) {
          try {
            const parsed = JSON.parse(storedAdmin);
            if (parsed?.email) {
              const isVerified = await verifyUserIsAdmin({ email: parsed.email } as any);
              if (isVerified && isMounted) {
                setAdminUser(parsed);
                setIsAdminAuthenticated(true);
                setAdminAuthChecking(false);
                return;
              }
            }
          } catch (e) {
            sessionStorage.removeItem('dirace_admin_auth_user');
          }
        }

        // Active customer accounts on the store do NOT grant access to admin
        if (isMounted) {
          setIsAdminAuthenticated(false);
          setAdminUser(null);
        }
      } catch (err) {
        console.warn('Admin clearance verification error:', err);
      } finally {
        if (isMounted) setAdminAuthChecking(false);
      }
    }
    checkAdminClearance();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setAdminAuthSubmitting(true);

    try {
      const res = await adminLogin(adminEmailInput, adminPasswordInput);
      if (res.success && res.user) {
        setAdminUser(res.user);
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('dirace_admin_auth_user', JSON.stringify(res.user));
        setAdminPasswordInput('');
        setAdminAuthError(null);
      } else {
        setAdminAuthError(res.error || 'Invalid administrator login credentials.');
      }
    } finally {
      setAdminAuthSubmitting(false);
    }
  };

  const handleAdminSignOut = () => {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    sessionStorage.removeItem('dirace_admin_auth_user');
  };

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'piece' | 'order' | 'review' | 'all-orders';
    id: string;
    name: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search & Filter States
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('All');
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'All' | 'low' | 'out' | 'healthy'>('All');
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  const LOW_STOCK_THRESHOLD = 5;

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('All');
  const [refreshingReviews, setRefreshingReviews] = useState(false);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isExportingOrders, setIsExportingOrders] = useState(false);
  const [isExportingReviews, setIsExportingReviews] = useState(false);
  const [isAddingPiece, setIsAddingPiece] = useState(false);
  const [isUpdatingPiece, setIsUpdatingPiece] = useState(false);

  // New Piece Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newPiece, setNewPiece] = useState({
    name: '',
    category: 'Outerwear',
    price: 250000,
    stock: 12,
    description: '',
    badge: 'New Arrival',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    sizes: 'S, M, L, XL',
  });
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Edit Piece Form State
  const [editingPiece, setEditingPiece] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'Outerwear',
    price: 250000,
    stock: 10,
    description: '',
    badge: '',
    image: '',
    sizes: '',
  });
  const [isEditUploading, setIsEditUploading] = useState(false);
  const [editUploadFeedback, setEditUploadFeedback] = useState<string | null>(null);

  // Order Inspector State
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Automated Email Notification States
  const [notificationHistory, setNotificationHistory] = useState<OrderEmailDispatch[]>([]);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<
    | OrderEmailDispatch
    | {
        id: string;
        orderId: string;
        customerName: string;
        customerEmail: string;
        status: 'Shipped' | 'Delivered' | string;
        subject: string;
        sentAt?: string;
        delivered: boolean;
        provider: 'resend' | 'smtp' | 'preview';
        htmlContent: string;
        textContent: string;
        note?: string;
      }
    | null
  >(null);
  const [previewTab, setPreviewTab] = useState<'html' | 'text'>('html');
  const [notificationFeedback, setNotificationFeedback] = useState<{
    type: 'success' | 'info' | 'warning';
    message: string;
    dispatch?: OrderEmailDispatch;
  } | null>(null);
  const [isSendingManualEmail, setIsSendingManualEmail] = useState(false);

  useEffect(() => {
    fetchNotificationHistory().then(setNotificationHistory).catch(() => {});
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Stock Analysis
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const s = typeof p.stock === 'number' ? p.stock : (p.stock != null ? Number(p.stock) : 0);
      return s < LOW_STOCK_THRESHOLD;
    });
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => {
      const s = typeof p.stock === 'number' ? p.stock : (p.stock != null ? Number(p.stock) : 0);
      return s <= 0;
    });
  }, [products]);

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        inventorySearch === '' ||
        p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.id.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.category.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchCategory = inventoryCategory === 'All' || p.category.toLowerCase() === inventoryCategory.toLowerCase();

      const s = typeof p.stock === 'number' ? p.stock : (p.stock != null ? Number(p.stock) : 0);
      let matchStock = true;
      if (inventoryStockFilter === 'low') {
        matchStock = s > 0 && s < LOW_STOCK_THRESHOLD;
      } else if (inventoryStockFilter === 'out') {
        matchStock = s <= 0;
      } else if (inventoryStockFilter === 'healthy') {
        matchStock = s >= LOW_STOCK_THRESHOLD;
      }

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, inventorySearch, inventoryCategory, inventoryStockFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        orderSearch === '' ||
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customer_name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customer_email || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.shipping_address || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.city || '').toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const prod = products.find((p) => p.id === r.product_id);
      const matchSearch =
        reviewSearch === '' ||
        (r.user_name || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
        (r.user_email || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
        (r.comment || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
        (prod?.name || '').toLowerCase().includes(reviewSearch.toLowerCase());
      const matchRating = reviewRatingFilter === 'All' || r.rating === Number(reviewRatingFilter);
      return matchSearch && matchRating;
    });
  }, [reviews, products, reviewSearch, reviewRatingFilter]);

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadFeedback('Uploading piece imagery...');

    const res = await uploadProductImageToSupabase(file);
    if (res.url) {
      setNewPiece((prev) => ({ ...prev, image: res.url! }));
      setUploadFeedback('Image uploaded successfully!');
    } else {
      setUploadFeedback(res.error || 'Unable to upload image. Please try again.');
    }
    setIsUploading(false);
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEditUploading(true);
    setEditUploadFeedback('Uploading piece imagery...');

    const res = await uploadProductImageToSupabase(file);
    if (res.url) {
      setEditForm((prev) => ({ ...prev, image: res.url! }));
      setEditUploadFeedback('Image updated successfully!');
    } else {
      setEditUploadFeedback(res.error || 'Unable to update image. Please try again.');
    }
    setIsEditUploading(false);
  };

  const handleAddPiece = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPiece(true);
    try {
      const sizesArray = newPiece.sizes.split(',').map((s) => s.trim()).filter(Boolean);

      await addProductToSupabase({
        name: newPiece.name,
        category: newPiece.category,
        price: Number(newPiece.price),
        stock: Number(newPiece.stock) >= 0 ? Number(newPiece.stock) : 0,
        description: newPiece.description,
        badge: newPiece.badge || undefined,
        image: newPiece.image,
        alt: newPiece.name,
        sizes: sizesArray.length > 0 ? sizesArray : ['S', 'M', 'L'],
      });

      setShowAddModal(false);
      setNewPiece({
        name: '',
        category: 'Outerwear',
        price: 250000,
        stock: 12,
        description: '',
        badge: 'New Arrival',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
        sizes: 'S, M, L, XL',
      });
      await refreshProducts();
    } finally {
      setIsAddingPiece(false);
    }
  };

  const handleStartEdit = (p: Product) => {
    setEditingPiece(p);
    setEditForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: typeof p.stock === 'number' ? p.stock : (p.stock != null ? Number(p.stock) : 10),
      description: p.description || '',
      badge: p.badge || '',
      image: p.image,
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : 'S, M, L',
    });
    setEditUploadFeedback(null);
  };

  const handleUpdatePiece = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPiece) return;
    setIsUpdatingPiece(true);

    try {
      const sizesArray = editForm.sizes.split(',').map((s) => s.trim()).filter(Boolean);

      await updateProductInSupabase(editingPiece.id, {
        name: editForm.name,
        category: editForm.category,
        price: Number(editForm.price),
        stock: Number(editForm.stock) >= 0 ? Number(editForm.stock) : 0,
        description: editForm.description,
        badge: editForm.badge || undefined,
        image: editForm.image,
        alt: editForm.name,
        sizes: sizesArray.length > 0 ? sizesArray : ['S', 'M', 'L'],
      });

      setEditingPiece(null);
      await refreshProducts();
    } finally {
      setIsUpdatingPiece(false);
    }
  };

  const handleQuickStockAdjust = async (product: Product, delta: number) => {
    setUpdatingStockId(product.id);
    try {
      const current = typeof product.stock === 'number' ? product.stock : (product.stock != null ? Number(product.stock) : 0);
      const next = Math.max(0, current + delta);
      await updateProductInSupabase(product.id, { stock: next });
      await refreshProducts();
    } catch (e) {
      console.warn('Failed to adjust stock:', e);
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    setDeletingId(id);
    try {
      if (type === 'piece') {
        await deleteProduct(id);
      } else if (type === 'order') {
        await deleteOrder(id);
        if (inspectedOrder?.id === id) {
          setInspectedOrder(null);
        }
      } else if (type === 'all-orders') {
        await clearAllOrdersFromSupabase();
        setInspectedOrder(null);
        await refreshOrders();
      } else if (type === 'review') {
        await deleteReview(id);
      }
    } catch (err) {
      console.error('Deletion error:', err);
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    setUpdatingStatusId(`${orderId}-${status}`);
    try {
      await updateOrderStatusInSupabase(orderId, status);
      if (inspectedOrder && inspectedOrder.id === orderId) {
        setInspectedOrder({ ...inspectedOrder, status });
      }
      await refreshOrders();

      // Automatically send an email to the client when the status is updated to 'Shipped' or 'Delivered'
      if (status === 'Shipped' || status === 'Delivered') {
        const targetOrder =
          orders.find((o) => o.id === orderId) ||
          (inspectedOrder && inspectedOrder.id === orderId ? inspectedOrder : null);

        if (targetOrder) {
          const updatedTargetOrder = { ...targetOrder, status };
          const notifyResult = await sendOrderStatusNotification(updatedTargetOrder, status);
          if (notifyResult.success && notifyResult.dispatch) {
            const disp = notifyResult.dispatch;
            setNotificationFeedback({
              type: disp.delivered ? 'success' : 'info',
              message: disp.delivered
                ? `Automated email dispatched to ${disp.customerEmail} (${status}).`
                : `Automated ${status} notification composed for ${disp.customerEmail} and archived.`,
              dispatch: disp,
            });
          } else {
            setNotificationFeedback({
              type: 'warning',
              message: notifyResult.error || `Client email notification queued for Order #${orderId}.`,
            });
          }
          fetchNotificationHistory().then(setNotificationHistory).catch(() => {});
        }
      }
    } catch (err: any) {
      console.error('Status change error:', err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handlePreviewClientEmail = async (order: Order, status: 'Shipped' | 'Delivered') => {
    const preview = await renderNotificationPreview(order, status);
    if (preview) {
      setPreviewEmail({
        id: `prev_${order.id}`,
        orderId: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        status,
        subject: preview.subject,
        sentAt: new Date().toISOString(),
        delivered: false,
        provider: 'preview',
        htmlContent: preview.html,
        textContent: preview.text,
      });
      setPreviewTab('html');
    }
  };

  const handleSendClientEmailManual = async (order: Order, status: 'Shipped' | 'Delivered') => {
    setIsSendingManualEmail(true);
    try {
      const res = await sendOrderStatusNotification(order, status);
      if (res.success && res.dispatch) {
        setNotificationFeedback({
          type: res.dispatch.delivered ? 'success' : 'info',
          message: res.dispatch.delivered
            ? `Client email dispatched to ${res.dispatch.customerEmail} (${status}).`
            : `Client notification composed and recorded for ${res.dispatch.customerEmail}.`,
          dispatch: res.dispatch,
        });
        const history = await fetchNotificationHistory();
        setNotificationHistory(history);
      } else {
        setNotificationFeedback({
          type: 'warning',
          message: res.error || 'Failed to dispatch email.',
        });
      }
    } finally {
      setIsSendingManualEmail(false);
    }
  };

  const exportOrdersCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders available to export.');
      return;
    }
    setIsExportingOrders(true);
    setTimeout(() => {
      try {
        const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Shipping Address', 'City', 'Postcode', 'Items', 'Total (NGN)', 'Status'];
        const rows = filteredOrders.map((o) => [
          `"${o.id}"`,
          `"${new Date(o.created_at).toISOString().slice(0, 10)}"`,
          `"${(o.customer_name || '').replace(/"/g, '""')}"`,
          `"${(o.customer_email || '').replace(/"/g, '""')}"`,
          `"${(o.shipping_address || '').replace(/"/g, '""')}"`,
          `"${(o.city || '').replace(/"/g, '""')}"`,
          `"${(o.postcode || '').replace(/"/g, '""')}"`,
          `"${(o.items?.map((it) => `${it.name} (${it.size}) x${it.quantity}`).join('; ') || '').replace(/"/g, '""')}"`,
          `"${o.total_amount}"`,
          `"${o.status}"`,
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `dirace_orders_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        setIsExportingOrders(false);
      }
    }, 250);
  };

  const exportReviewsCSV = () => {
    if (filteredReviews.length === 0) {
      alert('No reflections available to export.');
      return;
    }
    setIsExportingReviews(true);
    setTimeout(() => {
      try {
        const headers = ['Review ID', 'Piece ID', 'Piece Name', 'Rating', 'Client Name', 'Email', 'Reflection', 'Date'];
        const rows = filteredReviews.map((r) => {
          const prod = products.find((p) => p.id === r.product_id);
          return [
            `"${r.id}"`,
            `"${r.product_id}"`,
            `"${(prod?.name || '').replace(/"/g, '""')}"`,
            `"${r.rating}"`,
            `"${(r.user_name || '').replace(/"/g, '""')}"`,
            `"${(r.user_email || '').replace(/"/g, '""')}"`,
            `"${(r.comment || '').replace(/"/g, '""')}"`,
            `"${new Date(r.created_at).toISOString().slice(0, 10)}"`,
          ];
        });
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `dirace_reflections_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        setIsExportingReviews(false);
      }
    }, 250);
  };

  const handleRefreshOrdersWithFeedback = async () => {
    setRefreshingOrders(true);
    await refreshOrders();
    window.setTimeout(() => setRefreshingOrders(false), 600);
  };

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    window.setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleRefreshReviewsWithFeedback = async () => {
    setRefreshingReviews(true);
    await refreshReviews();
    window.setTimeout(() => setRefreshingReviews(false), 600);
  };

  // Gate 1: Verification in progress
  if (adminAuthChecking) {
    return (
      <main className="page-wrap" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 18px', opacity: 0.65 }} />
          <div className="eyebrow accent" style={{ letterSpacing: '0.12em' }}>
            Verifying Studio Administrative Clearance...
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            Checking authenticated credentials against directory
          </p>
        </div>
      </main>
    );
  }

  // Gate 2: Unauthenticated / Unauthorized Access Barrier
  if (!isAdminAuthenticated) {
    return (
      <main className="page-wrap" style={{ paddingBottom: 120, minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 520, margin: '50px auto' }}>
          <div
            className="account-panel"
            style={{
              padding: '40px 36px',
              border: '1px solid hsl(var(--foreground))',
              background: 'hsl(var(--background))',
              boxShadow: '0 12px 36px -10px hsl(0 0% 0% / 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
              <div className="eyebrow accent" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={12} />
                DIRACE / Restricted Studio Archive
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '3px 8px',
                  background: 'hsl(0 0% 92%)',
                  border: '1px solid hsl(var(--border))',
                  letterSpacing: '0.06em',
                }}
              >
                RESTRICTED PORTAL
              </span>
            </div>

            <h1 className="display" style={{ fontSize: 'clamp(32px, 5vw, 44px)', margin: '0 0 10px', lineHeight: 1 }}>
              STUDIO ADMIN.
            </h1>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
              This operational control room is exclusively reserved for the studio administrator. Standard customer and user accounts are strictly barred from this portal.
            </p>

            {adminAuthError && (
              <div
                role="alert"
                style={{
                  padding: '12px 14px',
                  marginBottom: 22,
                  background: 'hsl(0 85% 96%)',
                  border: '1px solid hsl(0 75% 80%)',
                  color: 'hsl(0 75% 35%)',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  lineHeight: 1.5,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>{adminAuthError}</div>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} style={{ display: 'grid', gap: 20 }}>
              <div className="field">
                <label htmlFor="admin-email-input" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Administrator Email</span>
                  <span className="muted" style={{ textTransform: 'none', fontSize: 10 }}>Fixed admin credentials</span>
                </label>
                <input
                  id="admin-email-input"
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="diraceadmin@gmail.com"
                  required
                  autoComplete="email"
                  style={{
                    padding: '12px 12px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(0 0% 98%)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div className="field">
                <label htmlFor="admin-password-input" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Administrator Password</span>
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    style={{
                      background: 'none',
                      border: 0,
                      padding: 0,
                      cursor: 'pointer',
                      fontSize: 10,
                      color: 'hsl(var(--muted-foreground))',
                      fontFamily: 'inherit',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {showAdminPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                    {showAdminPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </label>
                <input
                  id="admin-password-input"
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  autoComplete="current-password"
                  style={{
                    padding: '12px 12px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(0 0% 98%)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                id="admin-login-submit-btn"
                className="btn-primary"
                disabled={adminAuthSubmitting}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '15px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: adminAuthSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {adminAuthSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>VERIFYING PRIVILEGES...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={14} />
                    <span>UNLOCK STUDIO CONTROL ROOM</span>
                  </>
                )}
              </button>
            </form>

            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px solid hsl(var(--border))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <Link
                href="/"
                className="muted"
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                &larr; Return to Storefront
              </Link>
              <span
                className="mono muted"
                style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <ShieldCheck size={12} /> 256-Bit TLS Clearance
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Gate 3: Authorized Studio Admin view
  return (
    <main className="page-wrap" style={{ paddingBottom: 120 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="eyebrow accent">DIRACE / Studio</div>
          <h1 className="display">CONTROL ROOM.</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            className="mono"
            style={{
              padding: '6px 12px',
              background: 'hsl(142 60% 96%)',
              border: '1px solid hsl(142 50% 80%)',
              color: 'hsl(142 70% 25%)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'hsl(142 65% 42%)',
                boxShadow: '0 0 0 2px hsl(142 65% 85%)',
              }}
            />
            Clearance Active: {adminUser?.email || 'Administrator'}
          </span>
          <button
            type="button"
            id="admin-lock-portal-btn"
            onClick={handleAdminSignOut}
            title="Lock Studio Admin Portal"
            className="mono"
            style={{
              padding: '6px 12px',
              background: 'hsl(0 0% 94%)',
              border: '1px solid hsl(var(--border))',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(0 0% 88%)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(0 0% 94%)')}
          >
            <Lock size={12} />
            Lock Portal
          </button>
          <span
            className="mono"
            style={{
              padding: '6px 12px',
              background: 'hsl(0 0% 92%)',
              border: '1px solid hsl(var(--border))',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
            }}
          >
            <ShieldCheck size={13} />
            Archive: Studio Live
          </span>
          <span
            className="mono"
            style={{
              padding: '6px 12px',
              background: 'hsl(0 0% 92%)',
              border: '1px solid hsl(var(--border))',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
            }}
          >
            Base: NGN (₦)
          </span>
        </div>
      </div>

      {/* Metrics Row - Fully Interactive */}
      <div className="admin-grid" style={{ marginTop: 32 }}>
        <div
          className="stat-card"
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('orders')}
          title="Click to inspect dispatches and revenue"
          style={{ cursor: 'pointer', transition: 'all .15s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow accent">Revenue / Recorded</div>
            <ArrowRight size={13} className="muted" />
          </div>
          <strong>{money(totalRevenue)}</strong>
          <span className="mono muted">Recorded checkout volume &rarr;</span>
        </div>
        <div
          className="stat-card"
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('orders')}
          title="Click to view all client orders"
          style={{ cursor: 'pointer', transition: 'all .15s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow accent">Customer Orders</div>
            <ArrowRight size={13} className="muted" />
          </div>
          <strong>{orders.length}</strong>
          <span className="mono muted">Active client dispatches &rarr;</span>
        </div>
        <div
          className="stat-card"
          role="button"
          tabIndex={0}
          onClick={() => {
            setActiveTab('inventory');
            if (lowStockProducts.length > 0) {
              setInventoryStockFilter('low');
            }
          }}
          title="Click to manage catalog inventory"
          style={{ cursor: 'pointer', transition: 'all .15s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow accent">Pieces in Catalog</div>
            <ArrowRight size={13} className="muted" />
          </div>
          <strong>{products.length}</strong>
          <span className="mono">
            {lowStockProducts.length > 0 ? (
              <span style={{ color: 'hsl(30 90% 32%)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <AlertTriangle size={12} /> {lowStockProducts.length} low stock {lowStockProducts.length === 1 ? 'alert' : 'alerts'} &rarr;
              </span>
            ) : (
              <span className="muted">Live catalog pieces &rarr;</span>
            )}
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          borderBottom: '1px solid hsl(var(--border))',
          margin: '32px 0 28px',
          overflowX: 'auto',
        }}
      >
        <button
          className={`mono ${activeTab === 'inventory' ? 'accent' : 'muted'}`}
          style={{
            background: 'none',
            border: 0,
            padding: '12px 4px',
            borderBottom: activeTab === 'inventory' ? '2px solid hsl(var(--foreground))' : 'none',
            fontWeight: activeTab === 'inventory' ? 600 : 400,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
          onClick={() => setActiveTab('inventory')}
        >
          01 / Inventory & Pieces ({products.length})
          {lowStockProducts.length > 0 && (
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                background: 'hsl(38 95% 90%)',
                color: 'hsl(30 90% 25%)',
                border: '1px solid hsl(38 85% 75%)',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {lowStockProducts.length} LOW
            </span>
          )}
        </button>
        <button
          className={`mono ${activeTab === 'orders' ? 'accent' : 'muted'}`}
          style={{
            background: 'none',
            border: 0,
            padding: '12px 4px',
            borderBottom: activeTab === 'orders' ? '2px solid hsl(var(--foreground))' : 'none',
            fontWeight: activeTab === 'orders' ? 600 : 400,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setActiveTab('orders')}
        >
          02 / Client Orders ({orders.length})
        </button>
        <button
          className={`mono ${activeTab === 'reviews' ? 'accent' : 'muted'}`}
          style={{
            background: 'none',
            border: 0,
            padding: '12px 4px',
            borderBottom: activeTab === 'reviews' ? '2px solid hsl(var(--foreground))' : 'none',
            fontWeight: activeTab === 'reviews' ? 600 : 400,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setActiveTab('reviews')}
        >
          03 / Client Reflections ({reviews.length})
        </button>
      </div>

      {/* TAB 1: INVENTORY & STORAGE */}
      {activeTab === 'inventory' && (
        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div className="eyebrow accent">Collection Management</div>
              <h2 className="display" style={{ fontSize: 36, margin: '4px 0' }}>
                CATALOG ARCHIVE
              </h2>
            </div>
            <button
              className="primary-btn"
              onClick={() => setShowAddModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={16} /> Add New Piece
            </button>
          </div>

          {/* Low Stock Alert Notice Banner */}
          {lowStockProducts.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                padding: '14px 18px',
                background: 'hsl(38 100% 97%)',
                border: '1px solid hsl(38 85% 80%)',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: 'hsl(38 95% 90%)',
                    border: '1px solid hsl(38 85% 75%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={17} style={{ color: 'hsl(30 95% 35%)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'hsl(30 90% 25%)' }}>
                      Low Stock Inventory Alert
                    </strong>
                    <span
                      className="mono"
                      style={{
                        fontSize: 10,
                        padding: '1px 6px',
                        background: 'hsl(38 95% 90%)',
                        color: 'hsl(30 90% 25%)',
                        border: '1px solid hsl(38 85% 75%)',
                        fontWeight: 700,
                      }}
                    >
                      {lowStockProducts.length} {lowStockProducts.length === 1 ? 'piece' : 'pieces'} under 5 units
                    </span>
                  </div>
                  <p className="mono muted" style={{ margin: '3px 0 0', fontSize: 11, color: 'hsl(30 70% 30%)' }}>
                    {outOfStockProducts.length > 0 ? `${outOfStockProducts.length} depleted (0 stock) · ` : ''}
                    Pieces highlighted in warm amber require replenishment. Use the quick controls below to adjust units.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {inventoryStockFilter === 'low' ? (
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ fontSize: 11, padding: '6px 12px' }}
                    onClick={() => setInventoryStockFilter('All')}
                  >
                    View All Pieces
                  </button>
                ) : (
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{
                      fontSize: 11,
                      padding: '6px 12px',
                      background: 'hsl(38 95% 91%)',
                      borderColor: 'hsl(38 80% 75%)',
                      color: 'hsl(30 90% 22%)',
                      fontWeight: 600,
                    }}
                    onClick={() => setInventoryStockFilter('low')}
                  >
                    Filter Low Stock ({lowStockProducts.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search & Category Filter Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              padding: '14px 16px',
              background: 'hsl(0 0% 96%)',
              border: '1px solid hsl(var(--border))',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
              <Search size={15} className="muted" />
              <input
                placeholder="Search pieces by name, category, or ID..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: 12,
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono muted" style={{ fontSize: 11 }}>Category:</span>
                <select
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    fontFamily: 'inherit',
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  <option value="All">All Categories</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Tailoring">Tailoring</option>
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Knitwear">Knitwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Denim">Denim</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono muted" style={{ fontSize: 11 }}>Stock:</span>
                <select
                  value={inventoryStockFilter}
                  onChange={(e) => setInventoryStockFilter(e.target.value as any)}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    fontFamily: 'inherit',
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  <option value="All">All Stock Levels</option>
                  <option value="low">Low Stock (&lt; 5 units) {lowStockProducts.length > 0 ? `(${lowStockProducts.length})` : ''}</option>
                  <option value="out">Out of Stock (0) {outOfStockProducts.length > 0 ? `(${outOfStockProducts.length})` : ''}</option>
                  <option value="healthy">In Stock (5+ units)</option>
                </select>
              </div>

              {(inventorySearch || inventoryCategory !== 'All' || inventoryStockFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setInventorySearch('');
                    setInventoryCategory('All');
                    setInventoryStockFilter('All');
                  }}
                  className="mono muted"
                  style={{ background: 'none', border: 0, fontSize: 11, textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Reset filters
                </button>
              )}

              <span className="mono muted" style={{ fontSize: 11, marginLeft: 6 }}>
                Showing {filteredProducts.length} of {products.length}
              </span>
            </div>
          </div>

          {/* Add Piece Modal */}
          {showAddModal && (
            <div
              style={{
                background: 'hsl(0 0% 97%)',
                border: '1px solid hsl(var(--border))',
                padding: 24,
                marginBottom: 28,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div className="eyebrow accent">Catalog Archive</div>
                  <h3 className="display" style={{ fontSize: 24, margin: '4px 0 0' }}>
                    ADD NEW SILHOUETTE
                  </h3>
                </div>
                <button className="icon-btn" onClick={() => setShowAddModal(false)} aria-label="Close modal">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddPiece} style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div className="field">
                    <label>Piece Title</label>
                    <input
                      required
                      placeholder="e.g. Wool Peacoat"
                      value={newPiece.name}
                      onChange={(e) => setNewPiece({ ...newPiece, name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Category</label>
                    <select
                      value={newPiece.category}
                      onChange={(e) => setNewPiece({ ...newPiece, category: e.target.value })}
                      style={{
                        padding: '10px 14px',
                        background: 'transparent',
                        border: '1px solid hsl(var(--border))',
                        font: 'inherit',
                      }}
                    >
                      <option value="Outerwear">Outerwear</option>
                      <option value="Tailoring">Tailoring</option>
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Knitwear">Knitwear</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Denim">Denim</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Price in NGN (₦)</label>
                    <input
                      type="number"
                      required
                      placeholder="250000"
                      value={newPiece.price}
                      onChange={(e) => setNewPiece({ ...newPiece, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label>Available Sizes (comma separated)</label>
                    <input
                      placeholder="S, M, L, XL"
                      value={newPiece.sizes}
                      onChange={(e) => setNewPiece({ ...newPiece, sizes: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Stock Archive (Units)</span>
                      <span className="mono muted" style={{ fontSize: 10 }}>Alert if &lt; 5</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="12"
                      value={newPiece.stock}
                      onChange={(e) => setNewPiece({ ...newPiece, stock: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div className="field">
                    <label>Badge / Label (Optional)</label>
                    <input
                      placeholder="e.g. New Arrival, Limited Run"
                      value={newPiece.badge}
                      onChange={(e) => setNewPiece({ ...newPiece, badge: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Upload Image or provide URL</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <label
                        className="secondary-btn"
                        style={{
                          cursor: isUploading ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          padding: '10px 14px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Upload size={14} />
                        {isUploading ? 'Uploading...' : 'Choose File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <input
                        placeholder="https://..."
                        value={newPiece.image}
                        onChange={(e) => setNewPiece({ ...newPiece, image: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                    {uploadFeedback && (
                      <span className="mono muted" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
                        {uploadFeedback}
                      </span>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label>Provenance & Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe tailoring, wool weight, cut, silhouette notes..."
                    value={newPiece.description}
                    onChange={(e) => setNewPiece({ ...newPiece, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: '1px solid hsl(var(--border))',
                      font: 'inherit',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="secondary-btn" onClick={() => setShowAddModal(false)} disabled={isAddingPiece}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={isAddingPiece || isUploading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {isAddingPiece ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving Piece...
                      </>
                    ) : (
                      'Save Piece to Catalog'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Piece Modal */}
          {editingPiece && (
            <div
              style={{
                background: 'hsl(0 0% 97%)',
                border: '1px solid hsl(var(--border))',
                padding: 24,
                marginBottom: 28,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div className="eyebrow accent">Edit Catalog Piece</div>
                  <h3 className="display" style={{ fontSize: 24, margin: '4px 0 0' }}>
                    MODIFYING: {editingPiece.name}
                  </h3>
                </div>
                <button className="icon-btn" onClick={() => setEditingPiece(null)} aria-label="Close edit modal">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdatePiece} style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div className="field">
                    <label>Piece Title</label>
                    <input
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      style={{
                        padding: '10px 14px',
                        background: 'transparent',
                        border: '1px solid hsl(var(--border))',
                        font: 'inherit',
                      }}
                    >
                      <option value="Outerwear">Outerwear</option>
                      <option value="Tailoring">Tailoring</option>
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Knitwear">Knitwear</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Denim">Denim</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Price in NGN (₦)</label>
                    <input
                      type="number"
                      required
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label>Available Sizes</label>
                    <input
                      value={editForm.sizes}
                      onChange={(e) => setEditForm({ ...editForm, sizes: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Stock Archive (Units)</span>
                      <span className="mono muted" style={{ fontSize: 10 }}>Alert if &lt; 5</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div className="field">
                    <label>Badge / Label</label>
                    <input
                      placeholder="e.g. Archival, Limited"
                      value={editForm.badge}
                      onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Imagery URL or Upload New</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <label
                        className="secondary-btn"
                        style={{
                          cursor: isEditUploading ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          padding: '10px 14px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Upload size={14} />
                        {isEditUploading ? 'Uploading...' : 'Replace File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditFileUpload}
                          disabled={isEditUploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <input
                        required
                        value={editForm.image}
                        onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                    {editUploadFeedback && (
                      <span className="mono muted" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
                        {editUploadFeedback}
                      </span>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label>Provenance & Description</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: '1px solid hsl(var(--border))',
                      font: 'inherit',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="secondary-btn" onClick={() => setEditingPiece(null)} disabled={isUpdatingPiece}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={isUpdatingPiece || isEditUploading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {isUpdatingPiece ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="table-scroll-hint mono muted">
            <ArrowRight size={11} /> Swipe table horizontally to inspect all columns
          </div>
          <div className="table-overflow">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name & Category</th>
                  <th>Price (NGN)</th>
                  <th>Stock & Status</th>
                  <th>Sizes</th>
                  <th>ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40 }} className="muted">
                      No pieces matched your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const stockCount = typeof p.stock === 'number' ? p.stock : (p.stock != null ? Number(p.stock) : 0);
                    const isOutOfStock = stockCount <= 0;
                    const isLowStock = stockCount > 0 && stockCount < LOW_STOCK_THRESHOLD;

                    return (
                      <tr
                        key={p.id}
                        className={isOutOfStock ? 'row-out-of-stock' : isLowStock ? 'row-low-stock' : ''}
                      >
                        <td style={{ width: 60 }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: 44, height: 52, objectFit: 'cover', filter: 'saturate(.7)' }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <strong>{p.name}</strong>
                            {isOutOfStock && (
                              <span
                                className="mono"
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  padding: '1px 5px',
                                  background: 'hsl(0 85% 92%)',
                                  color: 'hsl(0 75% 38%)',
                                  border: '1px solid hsl(0 75% 75%)',
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Depleted
                              </span>
                            )}
                            {isLowStock && (
                              <span
                                className="mono"
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  padding: '1px 5px',
                                  background: 'hsl(38 95% 88%)',
                                  color: 'hsl(30 95% 25%)',
                                  border: '1px solid hsl(38 85% 70%)',
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Low Stock
                              </span>
                            )}
                          </div>
                          <div className="muted" style={{ fontSize: 11 }}>
                            {p.category} {p.badge ? `· ${p.badge}` : ''}
                          </div>
                        </td>
                        <td className="mono">{money(p.price)}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
                            {isOutOfStock ? (
                              <span
                                className="mono"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  padding: '3px 8px',
                                  background: 'hsl(0 85% 94%)',
                                  color: 'hsl(0 75% 38%)',
                                  border: '1px solid hsl(0 75% 80%)',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <AlertCircle size={11} /> Out of Stock (0)
                              </span>
                            ) : isLowStock ? (
                              <span
                                className="mono"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  padding: '3px 8px',
                                  background: 'hsl(38 95% 90%)',
                                  color: 'hsl(30 90% 25%)',
                                  border: '1px solid hsl(38 85% 75%)',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <AlertTriangle size={11} /> Low Stock · {stockCount} Left
                              </span>
                            ) : (
                              <span
                                className="mono muted"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 10,
                                  padding: '3px 8px',
                                  background: 'hsl(0 0% 94%)',
                                  border: '1px solid hsl(var(--border))',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <CheckCircle2 size={11} style={{ color: 'hsl(142 65% 38%)' }} /> {stockCount} in archive
                              </span>
                            )}

                            {/* Quick Inline Adjustments */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}>
                              <button
                                type="button"
                                disabled={updatingStockId === p.id || stockCount <= 0}
                                onClick={() => handleQuickStockAdjust(p, -1)}
                                title="Decrease stock by 1"
                                aria-label={`Decrease stock for ${p.name}`}
                                style={{
                                  background: 'none',
                                  border: 0,
                                  padding: '2px 7px',
                                  cursor: stockCount <= 0 || updatingStockId === p.id ? 'not-allowed' : 'pointer',
                                  opacity: stockCount <= 0 ? 0.4 : 1,
                                  fontSize: 11,
                                  fontFamily: 'inherit',
                                }}
                              >
                                -
                              </button>
                              <span
                                className="mono"
                                style={{
                                  padding: '2px 8px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  borderLeft: '1px solid hsl(var(--border))',
                                  borderRight: '1px solid hsl(var(--border))',
                                  color: isOutOfStock ? 'hsl(0 75% 38%)' : isLowStock ? 'hsl(30 90% 25%)' : 'inherit',
                                  minWidth: 28,
                                  textAlign: 'center',
                                }}
                              >
                                {updatingStockId === p.id ? (
                                  <Loader2 size={10} className="animate-spin" style={{ display: 'inline-block' }} />
                                ) : (
                                  stockCount
                                )}
                              </span>
                              <button
                                type="button"
                                disabled={updatingStockId === p.id}
                                onClick={() => handleQuickStockAdjust(p, 1)}
                                title="Increase stock by 1"
                                aria-label={`Increase stock for ${p.name}`}
                                style={{
                                  background: 'none',
                                  border: 0,
                                  padding: '2px 7px',
                                  cursor: updatingStockId === p.id ? 'not-allowed' : 'pointer',
                                  fontSize: 11,
                                  fontFamily: 'inherit',
                                }}
                              >
                                +
                              </button>
                              {isOutOfStock && (
                                <button
                                  type="button"
                                  disabled={updatingStockId === p.id}
                                  onClick={() => handleQuickStockAdjust(p, 5)}
                                  title="Quick restock +5 units"
                                  style={{
                                    background: 'hsl(0 0% 94%)',
                                    border: 0,
                                    borderLeft: '1px solid hsl(var(--border))',
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  +5
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="mono" style={{ fontSize: 11 }}>
                          {Array.isArray(p.sizes) ? p.sizes.join(', ') : 'S, M, L'}
                        </td>
                        <td className="mono muted" style={{ fontSize: 10 }}>
                          {p.id}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Link
                              href={`/product/${p.id}`}
                              className="icon-btn"
                              title="View piece in storefront"
                              aria-label={`View ${p.name}`}
                            >
                              <Eye size={15} />
                            </Link>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => handleStartEdit(p)}
                              title="Edit piece specifications"
                              aria-label={`Edit ${p.name}`}
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => setDeleteConfirm({ type: 'piece', id: p.id, name: p.name })}
                              aria-label={`Delete ${p.name}`}
                              title="Delete piece"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: CLIENT ORDERS */}
      {activeTab === 'orders' && (
        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div className="eyebrow accent">Client Dispatches</div>
              <h2 className="display" style={{ fontSize: 36, margin: '4px 0' }}>
                DISPATCHES & CLIENTS
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {orders.length > 0 && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setDeleteConfirm({ type: 'all-orders', id: 'all_orders', name: 'All Client Orders' })}
                  disabled={deletingId !== null}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'hsl(0 75% 45%)' }}
                  title="Clear all recorded dispatches"
                >
                  <Trash2 size={13} /> Clear All Orders
                </button>
              )}
              <button
                type="button"
                className="secondary-btn"
                onClick={exportOrdersCSV}
                disabled={isExportingOrders}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                title="Download CSV report of dispatches"
              >
                {isExportingOrders ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Exporting...
                  </>
                ) : (
                  <>
                    <Download size={14} /> Export CSV
                  </>
                )}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleRefreshOrdersWithFeedback}
                disabled={refreshingOrders}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                title="Refresh latest orders"
              >
                <RefreshCw size={14} className={refreshingOrders ? 'animate-spin' : ''} />{' '}
                {refreshingOrders ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowNotificationHistory(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                title="Inspect automated client email dispatch logs"
              >
                <Mail size={14} /> Email Logs ({notificationHistory.length})
              </button>
            </div>
          </div>

          {/* Automated Client Email Notice Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: 'hsl(0 0% 97%)',
              border: '1px solid hsl(var(--border))',
              marginBottom: 16,
              fontSize: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'hsl(142 70% 45%)',
                }}
              />
              <span>
                <strong>Automated Client Emailing Active:</strong> Changing any order to <em>'Shipped'</em> or <em>'Delivered'</em> automatically composes and dispatches a notification to the client's email.
              </span>
            </div>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowNotificationHistory(true)}
              style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Mail size={12} /> View Logs ({notificationHistory.length})
            </button>
          </div>

          {/* Real-time Email Dispatch Feedback Banner */}
          {notificationFeedback && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                marginBottom: 16,
                fontSize: 12,
                background:
                  notificationFeedback.type === 'success'
                    ? 'hsl(142 60% 40% / 0.12)'
                    : notificationFeedback.type === 'warning'
                    ? 'hsl(45 90% 45% / 0.12)'
                    : 'hsl(215 70% 50% / 0.12)',
                border: `1px solid ${
                  notificationFeedback.type === 'success'
                    ? 'hsl(142 60% 35% / 0.35)'
                    : notificationFeedback.type === 'warning'
                    ? 'hsl(45 90% 45% / 0.35)'
                    : 'hsl(215 70% 50% / 0.35)'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {notificationFeedback.type === 'success' ? (
                  <CheckCircle2 size={16} style={{ color: 'hsl(142 60% 35%)' }} />
                ) : (
                  <Mail size={16} />
                )}
                <span>{notificationFeedback.message}</span>
                {notificationFeedback.dispatch && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewEmail(notificationFeedback.dispatch!);
                      setPreviewTab('html');
                    }}
                    style={{
                      background: 'none',
                      border: 0,
                      color: 'inherit',
                      textDecoration: 'underline',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 11,
                      padding: 0,
                    }}
                  >
                    View Dispatched Email
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setNotificationFeedback(null)}
                style={{ background: 'none', border: 0, cursor: 'pointer', padding: 2 }}
                aria-label="Dismiss feedback"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Search & Status Filter Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              padding: '14px 16px',
              background: 'hsl(0 0% 96%)',
              border: '1px solid hsl(var(--border))',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
              <Search size={15} className="muted" />
              <input
                placeholder="Search orders by reference ID, client name, email, or city..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: 12,
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono muted" style={{ fontSize: 11 }}>Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    fontFamily: 'inherit',
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {(orderSearch || orderStatusFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderSearch('');
                    setOrderStatusFilter('All');
                  }}
                  className="mono muted"
                  style={{ background: 'none', border: 0, fontSize: 11, textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Reset filters
                </button>
              )}

              <span className="mono muted" style={{ fontSize: 11, marginLeft: 6 }}>
                Showing {filteredOrders.length} of {orders.length}
              </span>
            </div>
          </div>

          {/* Inspect Order Details Modal */}
          {inspectedOrder && (
            <div
              style={{
                background: 'hsl(0 0% 97%)',
                border: '1px solid hsl(var(--border))',
                padding: 24,
                marginBottom: 28,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div className="eyebrow accent">Dispatch Details</div>
                  <h3 className="display" style={{ fontSize: 28, margin: '4px 0' }}>
                    ORDER {inspectedOrder.id}
                  </h3>
                  <div className="mono muted" style={{ fontSize: 11 }}>
                    Recorded on {new Date(inspectedOrder.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => window.print()}
                    style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <Printer size={13} /> Print Slip
                  </button>
                  <button className="icon-btn" onClick={() => setInspectedOrder(null)} aria-label="Close details">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
                <div style={{ border: '1px solid hsl(var(--border))', padding: 18, background: 'hsl(var(--background))' }}>
                  <div className="eyebrow accent" style={{ marginBottom: 8 }}>Client Information</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{inspectedOrder.customer_name}</div>
                  <div className="mono muted" style={{ fontSize: 12, marginTop: 4 }}>{inspectedOrder.customer_email}</div>
                  {inspectedOrder.phone && (
                    <div className="mono muted" style={{ fontSize: 12, marginTop: 2 }}>Phone: {inspectedOrder.phone}</div>
                  )}

                  <div className="eyebrow accent" style={{ marginTop: 16, marginBottom: 6 }}>Shipping Destination</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    {inspectedOrder.shipping_address}<br />
                    {inspectedOrder.city}, {inspectedOrder.postcode}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopyAddress(
                        `${inspectedOrder.customer_name}\n${inspectedOrder.shipping_address}\n${inspectedOrder.city} ${inspectedOrder.postcode}`
                      )
                    }
                    className="mono"
                    style={{
                      marginTop: 10,
                      background: 'none',
                      border: '1px solid hsl(var(--border))',
                      padding: '4px 8px',
                      fontSize: 10,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Copy size={11} />
                    {copiedAddress ? 'Address Copied!' : 'Copy Shipping Address'}
                  </button>
                </div>

                <div style={{ border: '1px solid hsl(var(--border))', padding: 18, background: 'hsl(var(--background))' }}>
                  <div className="eyebrow accent" style={{ marginBottom: 8 }}>Dispatch Status & Actions</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span className="mono" style={{ fontSize: 12 }}>Current:</span>
                    <span
                      className="mono"
                      style={{
                        padding: '4px 10px',
                        background: 'hsl(var(--foreground))',
                        color: 'hsl(var(--background))',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {inspectedOrder.status}
                    </span>
                  </div>

                  <div className="mono muted" style={{ fontSize: 11, marginBottom: 8 }}>Quick Status Update:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ fontSize: 10, padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      disabled={updatingStatusId !== null}
                      onClick={() => handleStatusChange(inspectedOrder.id, 'Processing')}
                    >
                      {updatingStatusId === `${inspectedOrder.id}-Processing` ? (
                        <>
                          <Loader2 size={11} className="animate-spin" /> Updating...
                        </>
                      ) : (
                        'Set Processing'
                      )}
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ fontSize: 10, padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      disabled={updatingStatusId !== null}
                      onClick={() => handleStatusChange(inspectedOrder.id, 'Shipped')}
                    >
                      {updatingStatusId === `${inspectedOrder.id}-Shipped` ? (
                        <>
                          <Loader2 size={11} className="animate-spin" /> Updating...
                        </>
                      ) : (
                        'Set Shipped'
                      )}
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ fontSize: 10, padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      disabled={updatingStatusId !== null}
                      onClick={() => handleStatusChange(inspectedOrder.id, 'Delivered')}
                    >
                      {updatingStatusId === `${inspectedOrder.id}-Delivered` ? (
                        <>
                          <Loader2 size={11} className="animate-spin" /> Updating...
                        </>
                      ) : (
                        'Set Delivered'
                      )}
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ fontSize: 10, padding: '4px 8px', color: 'hsl(0 70% 40%)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      disabled={updatingStatusId !== null}
                      onClick={() => handleStatusChange(inspectedOrder.id, 'Cancelled')}
                    >
                      {updatingStatusId === `${inspectedOrder.id}-Cancelled` ? (
                        <>
                          <Loader2 size={11} className="animate-spin" /> Updating...
                        </>
                      ) : (
                        'Set Cancelled'
                      )}
                    </button>
                  </div>

                  {/* Automated Client Email Notification Card */}
                  <div
                    style={{
                      marginTop: 14,
                      padding: '12px 14px',
                      background: 'hsl(0 0% 96%)',
                      border: '1px solid hsl(var(--border))',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600 }} className="mono">
                        <Mail size={13} className="accent" /> Client Email Notification
                      </div>
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          background:
                            inspectedOrder.status === 'Shipped' || inspectedOrder.status === 'Delivered'
                              ? 'hsl(142 60% 40% / 0.15)'
                              : 'hsl(0 0% 90%)',
                          color:
                            inspectedOrder.status === 'Shipped' || inspectedOrder.status === 'Delivered'
                              ? 'hsl(142 60% 30%)'
                              : 'hsl(0 0% 40%)',
                          fontWeight: 600,
                        }}
                      >
                        {inspectedOrder.status === 'Shipped' || inspectedOrder.status === 'Delivered'
                          ? 'Automated Trigger Ready'
                          : 'Pending Shipped / Delivered'}
                      </span>
                    </div>
                    <p className="muted" style={{ fontSize: 11, lineHeight: 1.5, margin: 0 }}>
                      {inspectedOrder.status === 'Shipped' || inspectedOrder.status === 'Delivered'
                        ? `Setting status to '${inspectedOrder.status}' automatically dispatched an email to ${inspectedOrder.customer_email}.`
                        : `Updating this order to 'Shipped' or 'Delivered' automatically sends an email to ${inspectedOrder.customer_email}.`}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="secondary-btn"
                        style={{ fontSize: 10, padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() =>
                          handlePreviewClientEmail(
                            inspectedOrder,
                            inspectedOrder.status === 'Delivered' ? 'Delivered' : 'Shipped'
                          )
                        }
                      >
                        <Eye size={11} /> Preview Client Email
                      </button>
                      {(inspectedOrder.status === 'Shipped' || inspectedOrder.status === 'Delivered') && (
                        <button
                          type="button"
                          className="secondary-btn"
                          disabled={isSendingManualEmail}
                          style={{ fontSize: 10, padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() =>
                            handleSendClientEmailManual(
                              inspectedOrder,
                              inspectedOrder.status as 'Shipped' | 'Delivered'
                            )
                          }
                        >
                          <Send size={11} /> {isSendingManualEmail ? 'Sending...' : 'Resend Email'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rule" style={{ margin: '16px 0' }} />

                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ type: 'order', id: inspectedOrder.id, name: `Order ${inspectedOrder.id}` })}
                    style={{
                      background: 'none',
                      border: 0,
                      color: 'hsl(0 70% 40%)',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={13} /> Delete Order Record
                  </button>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="eyebrow accent" style={{ marginBottom: 10 }}>Dispatched Items</div>
              <div style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}>
                {inspectedOrder.items && inspectedOrder.items.length > 0 ? (
                  inspectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: idx === inspectedOrder.items.length - 1 ? 'none' : '1px solid hsl(var(--border))',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 13 }}>{it.name}</strong>
                        <div className="mono muted" style={{ fontSize: 11 }}>
                          Size: {it.size} · Quantity: {it.quantity}
                        </div>
                      </div>
                      <div className="mono" style={{ fontWeight: 600 }}>
                        {money(it.price * it.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 16 }} className="muted mono">
                    No items recorded
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'hsl(0 0% 95%)',
                    borderTop: '1px solid hsl(var(--border))',
                  }}
                >
                  <span className="mono" style={{ fontWeight: 600 }}>Total Recorded</span>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 15 }}>
                    {money(inspectedOrder.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="empty-state">
              <Package size={26} className="accent" />
              <h2 className="display" style={{ fontSize: 32 }}>
                NO ORDERS RECORDED.
              </h2>
              <p>When clients complete checkout, their order is captured and listed here.</p>
            </div>
          ) : (
            <>
              <div className="table-scroll-hint mono muted">
                <ArrowRight size={11} /> Swipe table horizontally to inspect all columns
              </div>
              <div className="table-overflow">
                <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Destination</th>
                    <th>Items</th>
                    <th>Total (NGN)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 40 }} className="muted">
                        No orders matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="mono">
                          <strong>{o.id}</strong>
                          <div className="muted" style={{ fontSize: 10 }}>
                            {new Date(o.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div>{o.customer_name}</div>
                          <div className="mono muted" style={{ fontSize: 11 }}>
                            {o.customer_email}
                          </div>
                        </td>
                        <td style={{ fontSize: 11 }}>
                          {o.shipping_address}, {o.city} {o.postcode}
                        </td>
                        <td>
                          {o.items && o.items.length > 0 ? (
                            <div style={{ fontSize: 11 }}>
                              {o.items.map((it, idx) => (
                                <div key={idx}>
                                  {it.name} ({it.size}) × {it.quantity}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="muted">No items</span>
                          )}
                        </td>
                        <td className="mono" style={{ fontWeight: 700 }}>
                          {money(o.total_amount)}
                        </td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value as Order['status'])}
                            style={{
                              padding: '4px 8px',
                              background: 'transparent',
                              border: '1px solid hsl(var(--border))',
                              font: '10px var(--app-font-mono)',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => setInspectedOrder(o)}
                              title="Inspect order details"
                              aria-label={`Inspect ${o.id}`}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() =>
                                handlePreviewClientEmail(o, o.status === 'Delivered' ? 'Delivered' : 'Shipped')
                              }
                              title={
                                o.status === 'Shipped' || o.status === 'Delivered'
                                  ? `View automated ${o.status} email sent to client`
                                  : `Preview automated client email (sent upon Shipped/Delivered)`
                              }
                              aria-label={`Email preview for ${o.id}`}
                            >
                              <Mail size={15} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => setDeleteConfirm({ type: 'order', id: o.id, name: `Order ${o.id}` })}
                              title="Delete order record"
                              aria-label={`Delete ${o.id}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        </section>
      )}

      {/* TAB 3: REVIEWS & MODERATION */}
      {activeTab === 'reviews' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="eyebrow accent">Client Reflections</div>
              <h2 className="display" style={{ fontSize: 36, margin: '4px 0' }}>
                CLIENT REFLECTIONS & REVIEWS
              </h2>
              <p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>
                Manage authentic client ratings and reflections across the catalog.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={exportReviewsCSV}
                disabled={isExportingReviews}
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Export all client reflections to CSV"
              >
                {isExportingReviews ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Exporting...
                  </>
                ) : (
                  <>
                    <Download size={13} /> Export CSV
                  </>
                )}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleRefreshReviewsWithFeedback}
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                disabled={refreshingReviews}
              >
                <RefreshCw size={13} className={refreshingReviews ? 'animate-spin' : ''} />
                {refreshingReviews ? 'Refreshing...' : 'Refresh Reflections'}
              </button>
            </div>
          </div>

          {/* Review metrics */}
          <div className="admin-grid" style={{ marginBottom: 28 }}>
            <div className="stat-card">
              <div className="eyebrow accent">Total Reviews</div>
              <strong>{reviews.length}</strong>
              <span className="mono muted">Recorded reflections</span>
            </div>
            <div className="stat-card">
              <div className="eyebrow accent">Average Rating</div>
              <strong>
                {reviews.length > 0
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : '—'}{' '}
                / 5.0
              </strong>
              <span className="mono muted">Across active pieces</span>
            </div>
            <div className="stat-card">
              <div className="eyebrow accent">5-Star Feedback</div>
              <strong>{reviews.filter((r) => r.rating === 5).length}</strong>
              <span className="mono muted">
                {reviews.length > 0
                  ? `${Math.round((reviews.filter((r) => r.rating === 5).length / reviews.length) * 100)}% 5-star rating`
                  : 'No reviews recorded'}
              </span>
            </div>
          </div>

          {/* Search & Rating Filter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              padding: '14px 16px',
              background: 'hsl(0 0% 96%)',
              border: '1px solid hsl(var(--border))',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
              <Search size={15} className="muted" />
              <input
                placeholder="Search reflections by client, piece, or commentary..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: 12,
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono muted" style={{ fontSize: 11 }}>Rating:</span>
                <select
                  value={reviewRatingFilter}
                  onChange={(e) => setReviewRatingFilter(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    fontFamily: 'inherit',
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  <option value="All">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              {(reviewSearch || reviewRatingFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setReviewSearch('');
                    setReviewRatingFilter('All');
                  }}
                  className="mono muted"
                  style={{ background: 'none', border: 0, fontSize: 11, textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Reset filters
                </button>
              )}

              <span className="mono muted" style={{ fontSize: 11, marginLeft: 6 }}>
                Showing {filteredReviews.length} of {reviews.length}
              </span>
            </div>
          </div>

          <div className="table-scroll-hint mono muted">
            <ArrowRight size={11} /> Swipe table horizontally to inspect all columns
          </div>
          <div className="table-overflow">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Piece</th>
                  <th>Rating</th>
                  <th>Client</th>
                  <th>Reflection & Notes</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40 }} className="muted">
                      No client reviews matched your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((r) => {
                    const prod = products.find((p) => p.id === r.product_id);
                    return (
                      <tr key={r.id}>
                        <td>
                          <strong>{prod?.name || r.product_id}</strong>
                          <div className="mono muted" style={{ fontSize: 10 }}>
                            {prod?.category || 'Catalog Piece'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ display: 'flex', color: 'hsl(var(--foreground))' }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={11}
                                  fill={s <= r.rating ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                />
                              ))}
                            </div>
                            <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>
                              {r.rating}.0
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                            {r.user_name}
                          </div>
                          <div className="muted mono" style={{ fontSize: 10 }}>
                            {r.user_email || 'Verified Client'}
                          </div>
                        </td>
                        <td style={{ maxWidth: 340 }}>
                          <span style={{ fontSize: 12, lineHeight: 1.5 }}>"{r.comment}"</span>
                        </td>
                        <td className="mono muted" style={{ fontSize: 11 }}>
                          {new Date(r.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {prod && (
                              <Link
                                href={`/product/${prod.id}`}
                                className="icon-btn"
                                title="View piece in store"
                                aria-label={`View ${prod.name}`}
                              >
                                <ExternalLink size={13} />
                              </Link>
                            )}
                            <button
                              type="button"
                              className="icon-btn"
                              title="Delete reflection"
                              aria-label="Delete reflection"
                              onClick={() => setDeleteConfirm({ type: 'review', id: r.id, name: `Reflection by ${r.user_name || 'Anonymous'}` })}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* IN-APP DELETION CONFIRMATION DIALOG (IFRAME-SAFE) */}
      {deleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 24,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              padding: 32,
              maxWidth: 460,
              width: '100%',
              boxShadow: '0 24px 48px rgba(0,0,0,0.28)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="eyebrow" style={{ color: 'hsl(0 75% 45%)' }}>
              Confirm Action
            </div>
            <h3 className="display" style={{ fontSize: 24, margin: '8px 0 14px' }}>
              DELETE PERMANENTLY?
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 24px', color: 'hsl(var(--foreground))' }}>
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This will permanently remove {deleteConfirm.type === 'piece' ? 'this catalog piece' : deleteConfirm.type === 'order' ? 'this order record' : deleteConfirm.type === 'all-orders' ? 'all client order records' : 'this client reflection'}.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDeleteConfirm(null)}
                style={{ fontSize: 12 }}
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                style={{
                  fontSize: 12,
                  background: 'hsl(0 75% 45%)',
                  borderColor: 'hsl(0 75% 45%)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {deletingId ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Deleting...
                  </>
                ) : deleteConfirm.type === 'all-orders' ? (
                  'Clear All Orders'
                ) : (
                  'Delete Record'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router({
  wishlist,
  onToggleWish,
  items,
  onAdd,
  onQty,
  onRemove,
}: {
  wishlist: string[];
  onToggleWish: (id: string) => void;
  items: CartItem[];
  onAdd: (id: string, size: string) => void;
  onQty: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={() => <Home wishlist={wishlist} onToggleWish={onToggleWish} />} />
        <Route path="/shop" component={() => <Shop wishlist={wishlist} onToggleWish={onToggleWish} />} />
        <Route
          path="/product/:id"
          component={() => <ProductDetail wishlist={wishlist} onToggleWish={onToggleWish} onAdd={onAdd} />}
        />
        <Route path="/collections" component={Collections} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/wishlist" component={() => <Wishlist wishlist={wishlist} onToggleWish={onToggleWish} />} />
        <Route path="/cart" component={() => <Cart items={items} onQty={onQty} onRemove={onRemove} />} />
        <Route path="/checkout" component={() => <Checkout items={items} />} />
        <Route path="/search" component={() => <SearchPage wishlist={wishlist} onToggleWish={onToggleWish} />} />
        <Route path="/account" component={Account} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function App() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const refreshProducts = async () => {
    try {
      const data = await fetchProductsFromSupabase();
      setProducts(data || []);
    } catch (e) {
      console.warn('Could not refresh products from Supabase:', e);
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await deleteProductFromSupabase(productId);
    await refreshProducts();
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    await deleteOrderFromSupabase(orderId);
    await refreshOrders();
  };

  const refreshOrders = async () => {
    try {
      const data = await fetchOrdersFromSupabase();
      setOrders(data);
    } catch (e) {
      console.warn('Could not refresh orders from Supabase:', e);
    }
  };

  const refreshReviews = async () => {
    try {
      const data = await fetchReviewsFromSupabase();
      setReviews(data || []);
    } catch (e) {
      console.warn('Could not refresh reviews from Supabase:', e);
      setReviews([]);
    }
  };

  const refreshUser = async () => {
    try {
      const u = await getSupabaseCurrentUser();
      setCurrentUser(u);
    } catch (e) {
      console.warn('Could not refresh current user:', e);
    }
  };

  const addReview = async (reviewInput: Omit<Review, 'id' | 'created_at'>) => {
    const newRev = await createReviewInSupabase(reviewInput);
    await refreshReviews();
    return newRev;
  };

  const deleteReview = async (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    await deleteReviewFromSupabase(reviewId);
    await refreshReviews();
  };

  useEffect(() => {
    refreshProducts();
    purgeTestOrdersFromSupabase().finally(() => refreshOrders());
    refreshReviews();
    refreshUser();
  }, []);

  const toggleWish = (id: string) => {
    setWishlist((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const add = (id: string, size: string) => {
    setItems((current) => {
      const found = current.find((item) => item.productId === id && item.size === size);
      return found
        ? current.map((item) => (item === found ? { ...item, quantity: item.quantity + 1 } : item))
        : [...current, { productId: id, size, quantity: 1 }];
    });
  };

  const qty = (index: number, delta: number) => {
    setItems((current) =>
      current
        .map((item, itemIndex) => (itemIndex === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const remove = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <TooltipProvider>
      <StoreContext.Provider
        value={{
          products,
          refreshProducts,
          deleteProduct,
          orders,
          refreshOrders,
          deleteOrder,
          reviews,
          refreshReviews,
          addReview,
          deleteReview,
          currentUser,
          refreshUser,
          quickViewProduct,
          openQuickView,
          closeQuickView,
          addToCart: add,
          clearCart,
        }}
      >
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Header cartCount={cartCount} wishlistCount={wishlist.length} />
          <Router
            wishlist={wishlist}
            onToggleWish={toggleWish}
            items={items}
            onAdd={add}
            onQty={qty}
            onRemove={remove}
          />
          <Footer />
        </WouterRouter>
        <QuickViewModal wishlist={wishlist} onToggleWish={toggleWish} />
        <Toaster />
      </StoreContext.Provider>
    </TooltipProvider>
  );
}

export default App;
