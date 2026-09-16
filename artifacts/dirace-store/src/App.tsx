import { useMemo, useState, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Heart, Menu, Minus, Plus, Search, ShoppingBag, Trash2, UserRound, X } from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import NotFound from '@/pages/not-found';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  alt: string;
  badge?: string;
  description: string;
  sizes: string[];
};
type CartItem = { productId: string; size: string; quantity: number };

// Supabase will become the source of truth for this catalog.
const products: Product[] = [];

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function Header({ cartCount, wishlistCount }: { cartCount: number; wishlistCount: number }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [['Shop', '/shop'], ['Collections', '/collections'], ['About', '/about'], ['Contact', '/contact']];
  return (
    <>
      <div className="topbar">Free shipping on orders over $250 · Worldwide delivery</div>
      <header className="nav">
        <div className="page-wrap nav-inner">
          <button className="icon-btn mobile-menu" aria-label="Open navigation" data-testid="button-open-navigation" onClick={() => setMenuOpen(true)}><Menu size={19} strokeWidth={1.5} /></button>
          <Link href="/" className="wordmark" data-testid="link-logo">DIRACE</Link>
          <nav className="nav-links" aria-label="Main navigation">
            {links.map(([label, href]) => <Link key={href} href={href} className={`nav-link ${location === href ? 'active' : ''}`} data-testid={`link-${label.toLowerCase()}`}>{label}</Link>)}
          </nav>
          <div className="nav-actions">
            <Link href="/search" className="icon-btn" aria-label="Search" data-testid="link-search"><Search size={18} strokeWidth={1.5} /></Link>
            <Link href="/account" className="icon-btn" aria-label="Account" data-testid="link-account"><UserRound size={18} strokeWidth={1.5} /></Link>
            <Link href="/wishlist" className="icon-btn" aria-label="Wishlist" data-testid="link-wishlist"><Heart size={18} strokeWidth={1.5} />{wishlistCount > 0 && <span className="count-dot">{wishlistCount}</span>}</Link>
            <Link href="/cart" className="icon-btn" aria-label="Shopping bag" data-testid="link-cart"><ShoppingBag size={18} strokeWidth={1.5} />{cartCount > 0 && <span className="count-dot">{cartCount}</span>}</Link>
          </div>
        </div>
      </header>
      {menuOpen && <div className="mobile-drawer" style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'hsl(var(--background))', padding: '26px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Link href="/" className="wordmark" onClick={() => setMenuOpen(false)}>DIRACE</Link><button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"><X size={20} /></button></div>
        <div style={{ display: 'grid', gap: 22, marginTop: 80 }}>
          {links.map(([label, href]) => <Link key={href} href={href} className="display" style={{ fontSize: 44 }} onClick={() => setMenuOpen(false)} data-testid={`mobile-link-${label.toLowerCase()}`}>{label}</Link>)}
        </div>
      </div>}
    </>
  );
}

function Footer() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  return <footer className="footer">
    <div className="page-wrap">
      <div className="footer-grid">
        <div><div className="wordmark">DIRACE</div><p className="muted" style={{ maxWidth: 220, fontSize: 12, lineHeight: 1.7, marginTop: 18 }}>Clothing for the considered life. Designed in London. Worn everywhere.</p></div>
        <div><div className="footer-title">Explore</div><div className="footer-links"><Link href="/shop">Shop all</Link><Link href="/collections">Collections</Link><Link href="/about">Our standard</Link><Link href="/contact">Contact</Link></div></div>
        <div><div className="footer-title">Client service</div><div className="footer-links"><Link href="/contact">Shipping & returns</Link><Link href="/account">Account</Link><Link href="/wishlist">Wishlist</Link><Link href="/admin">Studio</Link></div></div>
        <div><div className="footer-title">Social</div><div className="footer-links"><a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={12} style={{ verticalAlign: 'middle' }} /></a><a href="https://www.pinterest.com" target="_blank" rel="noreferrer">Pinterest <ArrowUpRight size={12} style={{ verticalAlign: 'middle' }} /></a><a href="mailto:studio@dirace.com">Email us <ArrowUpRight size={12} style={{ verticalAlign: 'middle' }} /></a></div></div>
      </div>
      <div className="footer-bottom mono"><span>© 2025 DIRACE STUDIO</span><span>MADE TO BE WORN. NOT CONSUMED.</span></div>
    </div>
  </footer>;
}

function ProductCard({ product, isSaved, onToggleWish }: { product: Product; isSaved: boolean; onToggleWish: (id: string) => void }) {
  return <article className="product-card reveal" data-testid={`card-product-${product.id}`}>
    <div className="product-media">
      <Link href={`/product/${product.id}`} data-testid={`link-product-${product.id}`}><img src={product.image} alt={product.alt} /></Link>
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <button className={`wish-btn ${isSaved ? 'saved' : ''}`} aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => onToggleWish(product.id)} data-testid={`button-wishlist-${product.id}`}><Heart size={15} fill={isSaved ? 'currentColor' : 'none'} /></button>
    </div>
    <Link href={`/product/${product.id}`} className="product-info" data-testid={`link-product-info-${product.id}`}><div><div className="product-name">{product.name}</div><div className="product-meta">{product.category}</div></div><span className="price">{money(product.price)}</span></Link>
  </article>;
}

function CatalogNotice({ title = 'Catalog awaiting connection.', copy = 'Connect Supabase to load products, collections, and availability into this space.' }: { title?: string; copy?: string }) {
  return <div className="empty-state"><div className="accent"><ShoppingBag size={24} /></div><h2 className="display">{title}</h2><p>{copy}</p></div>;
}

function Home({ wishlist, onToggleWish }: { wishlist: string[]; onToggleWish: (id: string) => void }) {
  return <main>
    <section className="hero">
      <div className="hero-copy reveal"><div><div className="eyebrow accent">Collection 01 / 25</div><h1 className="display">DEFINE<br />YOUR OWN<br /><span className="accent">STANDARD.</span></h1></div><div><p>DIRACE is a uniform for the self-defined. Considered shapes, uncompromising materials, no borrowed ideas.</p><div className="hero-note"><span>THE NEW STANDARD</span><Link href="/shop" className="circle-arrow" aria-label="Shop the latest drop" data-testid="link-hero-shop"><ArrowRight size={17} /></Link></div></div></div>
      <div className="hero-image reveal delay-2" role="img" aria-label="DIRACE campaign portrait" />
    </section>
    <div className="marquee"><div className="marquee-track"><span>DIRACE / WEAR WHAT DEFINES YOU</span><span className="dot">·</span><span>DIRACE / THE LATEST DROP</span><span className="dot">·</span><span>DIRACE / WEAR WHAT DEFINES YOU</span><span className="dot">·</span><span>DIRACE / THE LATEST DROP</span></div></div>
    <section className="section page-wrap">
      <div className="section-head"><div><div className="eyebrow accent">01 / The edit</div><h2 className="display section-title">THE LATEST<br />DROP</h2></div><div className="section-copy">A considered collection for a life in motion. New forms, familiar instincts.<br /><Link href="/shop" className="text-link" style={{ marginTop: 22 }} data-testid="link-shop-latest">Shop the edit <ArrowRight size={14} /></Link></div></div>
      {products.length > 0 ? <div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} isSaved={wishlist.includes(product.id)} onToggleWish={onToggleWish} />)}</div> : <CatalogNotice />}
    </section>
    <section className="manifesto"><div className="page-wrap manifesto-inner"><div><div className="eyebrow">A point of view</div><p>We make pieces with a point of view, not a shelf life. Every seam has a reason. Every silhouette leaves room for you.</p></div><h2 className="display">WEAR WHAT<br /><span className="accent">DEFINES YOU.</span></h2></div></section>
    <section className="split-feature"><div className="feature-image" role="img" aria-label="Charcoal tailoring on a steel chair" /><div className="feature-copy"><div><div className="feature-number">02 / THE FORM STUDY</div><h2 className="display">CUT WITH<br />CONVICTION.</h2></div><div><p>Our first study in tailoring: softened structure, severe proportions, and the kind of cloth that remembers where you have been.</p><Link href="/collections" className="text-link" data-testid="link-form-study">View the collection <ArrowRight size={14} /></Link></div></div></section>
    <section className="section page-wrap"><div className="section-head"><div><div className="eyebrow accent">03 / Field notes</div><h2 className="display section-title">THE WORLD<br />AROUND IT</h2></div><div className="section-copy">A look at the places, objects and people that make the DIRACE language. <Link href="/about" className="text-link" style={{ marginTop: 22 }} data-testid="link-about-notes">Read our story <ArrowRight size={14} /></Link></div></div><div className="editorial-strip"><div className="editorial-tile"><img src="/dirace-look-03.jpg" alt="Ivory knit textile detail" /><span className="editorial-label">01 — Texture</span></div><div className="editorial-tile"><img src="/dirace-look-02.jpg" alt="DIRACE street look" /><span className="editorial-label">02 — Movement</span></div><div className="editorial-tile"><img src="/dirace-look-01.jpg" alt="Charcoal tailoring detail" /><span className="editorial-label">03 — Form</span></div></div></section>
    <Signup />
  </main>;
}

function Signup() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return <div className="page-wrap"><section className="newsletter"><div><div className="eyebrow accent">Stay in the loop</div><h2 className="display">NOISE, FILTERED.</h2></div>{sent ? <div className="mono"><Check size={14} style={{ verticalAlign: 'middle' }} /> You're on the list.</div> : <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); if (email) setSent(true); }}><input type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email address" data-testid="input-newsletter-email" /><button type="submit" data-testid="button-newsletter-submit">Subscribe <ArrowRight size={13} style={{ verticalAlign: 'middle' }} /></button></form>}</section></div>;
}

function Shop({ wishlist, onToggleWish }: { wishlist: string[]; onToggleWish: (id: string) => void }) {
  const [category, setCategory] = useState('All');
  const categories = ['All', 'Outerwear', 'Tailoring', 'Essentials', 'Knitwear', 'Denim'];
  const filtered = category === 'All' ? products : products.filter((product) => product.category === category);
  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Shop</div><h1 className="display">THE COLLECTION</h1></div><div className="shop-toolbar"><span className="mono muted">{filtered.length} pieces</span><div className="filter-row">{categories.map((item) => <button key={item} className={`filter-btn ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)} data-testid={`button-filter-${item.toLowerCase()}`}>{item}</button>)}</div><button className="filter-btn">Sort <ChevronDown size={13} style={{ verticalAlign: 'middle' }} /></button></div>{filtered.length > 0 ? <div className="shop-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} isSaved={wishlist.includes(product.id)} onToggleWish={onToggleWish} />)}</div> : <CatalogNotice title="No products loaded." copy="Connect Supabase to populate the DIRACE collection." />}</main>;
}

function ProductDetail({ wishlist, onToggleWish, onAdd }: { wishlist: string[]; onToggleWish: (id: string) => void; onAdd: (id: string, size: string) => void }) {
  const [, params] = useRoute('/product/:id');
  const product = products.find((item) => item.id === params?.id);
  const [size, setSize] = useState('');
  const [added, setAdded] = useState(false);
  if (!product) return <main className="page-wrap detail-page"><CatalogNotice title="Product not available." copy="This product will appear when the Supabase catalog is connected." /></main>;
  const selectedSize = size || product.sizes[2] || product.sizes[0];
  const add = () => { onAdd(product.id, selectedSize); setAdded(true); window.setTimeout(() => setAdded(false), 1800); };
  return <main className="page-wrap detail-page"><div className="mono muted" style={{ marginBottom: 24 }}><Link href="/shop">Shop</Link> / {product.category} / {product.name}</div><div className="detail-layout"><div className="detail-gallery"><img src={product.image} alt={product.alt} /><img src={product.image} alt={`${product.name} detail`} style={{ filter: 'saturate(.3) contrast(1.08)', transform: 'scaleX(-1)' }} /></div><div className="detail-info"><div className="eyebrow accent">{product.badge ?? product.category}</div><h1 className="display">{product.name}</h1><div className="detail-price">{money(product.price)}</div><p className="detail-description">{product.description}</p><div className="size-label"><span>Select size</span><Link href="/contact">Size guide</Link></div><div className="size-grid">{product.sizes.map((item) => <button key={item} className={`size-btn ${selectedSize === item ? 'selected' : ''}`} onClick={() => setSize(item)} data-testid={`button-size-${item}`}>{item}</button>)}</div><button className="primary-btn full-btn" onClick={add} data-testid={`button-add-${product.id}`}>{added ? 'Added to bag' : 'Add to bag'} {added ? <Check size={14} style={{ verticalAlign: 'middle' }} /> : <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />}</button><button className={`secondary-btn full-btn ${wishlist.includes(product.id) ? 'saved' : ''}`} onClick={() => onToggleWish(product.id)} data-testid={`button-detail-wishlist-${product.id}`}>{wishlist.includes(product.id) ? 'Saved to wishlist' : 'Save to wishlist'} <Heart size={14} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} style={{ verticalAlign: 'middle' }} /></button><div className="accordions"><div className="accordion">Material & care <Plus size={14} /></div><div className="accordion">Shipping & returns <Plus size={14} /></div><div className="accordion">The DIRACE standard <Plus size={14} /></div></div></div></div></main>;
}

function Collections() {
  return <main><div className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Collections</div><h1 className="display">A STUDY IN<br />CONTRAST</h1></div></div><section className="split-feature"><div className="feature-image" style={{ backgroundImage: "url('/dirace-look-02.jpg')" }} /><div className="feature-copy"><div><div className="feature-number">Collection 01 / 25</div><h2 className="display">THE NEW<br />STANDARD.</h2></div><div><p>Built from the tension between utility and elegance. A wardrobe of strong lines, generous volume and subtle interruption.</p><Link href="/shop" className="text-link">Shop Collection 01 <ArrowRight size={14} /></Link></div></div></section><section className="section page-wrap"><div className="section-head"><div><div className="eyebrow accent">The language</div><h2 className="display section-title">THREE<br />INSTINCTS</h2></div><div className="section-copy">Every DIRACE collection starts with a question: what can a garment say before you do?</div></div><div className="editorial-strip"><div className="editorial-tile"><img src="/dirace-look-01.jpg" alt="Tailoring collection" /><span className="editorial-label">01 — Structure</span></div><div className="editorial-tile"><img src="/dirace-look-03.jpg" alt="Knitwear collection" /><span className="editorial-label">02 — Ease</span></div><div className="editorial-tile"><img src="/dirace-hero.jpg" alt="Outerwear collection" /><span className="editorial-label">03 — Presence</span></div></div></section></main>;
}

function About() {
  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / About</div><h1 className="display">WE MAKE<br />THE MARK.</h1></div><div className="content-narrow"><div className="about-grid"><div><div className="eyebrow accent">Our standard</div><h2 className="display">CLOTHING<br />AS IDENTITY.</h2></div><div><p>DIRACE began with a simple refusal: to make clothes that disappear. We believe what you wear can be an act of authorship — an external language for an internal point of view.</p><p>Based in London and made in small, deliberate runs, each piece is designed to stay in rotation. We choose cloth for its hand, construction for its longevity, and proportion for the room it gives you.</p><p>We are not interested in basics. We are interested in the things you reach for when you know exactly who you are.</p></div></div><div style={{ marginTop: 90, aspectRatio: '1.9', background: "url('/dirace-hero.jpg') center 42% / cover", filter: 'saturate(.5)' }} /><div style={{ marginTop: 90, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50 }}><div><div className="eyebrow accent">01 — Materials</div><p className="muted" style={{ lineHeight: 1.8, fontSize: 13 }}>Traceable wool. Dense cotton. Organic yarns. We select materials for how they age, not how they photograph on day one.</p></div><div><div className="eyebrow accent">02 — Making</div><p className="muted" style={{ lineHeight: 1.8, fontSize: 13 }}>Small runs, close partners, clear standards. Good clothing is a conversation between a designer, a maker and the person who wears it.</p></div></div></div></main>;
}

function Contact() {
  const [sent, setSent] = useState(false);
  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Contact</div><h1 className="display">SAY<br />HELLO.</h1></div><div className="content-narrow"><div className="about-grid"><div><p className="display" style={{ fontSize: 36 }}>For questions about an order, a piece, or anything else on your mind.</p><div className="footer-links" style={{ marginTop: 40 }}><a href="mailto:studio@dirace.com">studio@dirace.com</a><span>Mon–Fri / 09:00–18:00 GMT</span><span>14 Redchurch Street<br />London E2 7DD</span></div></div>{sent ? <div className="empty-state" style={{ padding: 50 }}><Check size={26} className="accent" /><h2 style={{ fontSize: 28 }}>Message sent.</h2><p>We'll be in touch within two working days.</p></div> : <form className="contact-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><div className="field"><label htmlFor="name">Your name</label><input id="name" required data-testid="input-contact-name" /></div><div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" required data-testid="input-contact-email" /></div><div className="field"><label htmlFor="message">Message</label><textarea id="message" required data-testid="input-contact-message" /></div><button className="primary-btn" type="submit" data-testid="button-contact-submit">Send message <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></button></form>}</div></div></main>;
}

function Wishlist({ wishlist, onToggleWish }: { wishlist: string[]; onToggleWish: (id: string) => void }) {
  const saved = products.filter((product) => wishlist.includes(product.id));
  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Personal</div><h1 className="display">WISHLIST</h1></div>{saved.length === 0 ? <EmptyState title="Nothing saved yet." copy="Connect Supabase to sync saved pieces to this space." cta="Explore the collection" href="/shop" icon={<Heart size={24} />} /> : <div className="shop-grid">{saved.map((product) => <ProductCard key={product.id} product={product} isSaved onToggleWish={onToggleWish} />)}</div>}</main>;
}

function Cart({ items, onQty, onRemove }: { items: CartItem[]; onQty: (index: number, delta: number) => void; onRemove: (index: number) => void }) {
  const detailed = items.map((item) => ({ ...item, product: products.find((product) => product.id === item.productId)! }));
  const subtotal = detailed.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Your selection</div><h1 className="display">YOUR BAG <span className="muted" style={{ fontSize: '30%' }}>({items.length})</span></h1></div>{items.length === 0 ? <EmptyState title="Your bag is quiet." copy="The right piece is worth waiting for." cta="Discover the collection" href="/shop" icon={<ShoppingBag size={24} />} /> : <div className="cart-layout"><div>{detailed.map((item, index) => <div className="cart-item" key={`${item.product.id}-${item.size}`}><img src={item.product.image} alt={item.product.alt} /><div><div className="eyebrow accent">{item.product.category}</div><h3>{item.product.name}</h3><div className="muted" style={{ fontSize: 11 }}>Size {item.size}</div><div className="qty-control" style={{ marginTop: 17 }}><button onClick={() => onQty(index, -1)} aria-label="Decrease quantity" data-testid={`button-decrease-${item.product.id}`}><Minus size={12} /></button><span data-testid={`text-quantity-${item.product.id}`}>{item.quantity}</span><button onClick={() => onQty(index, 1)} aria-label="Increase quantity" data-testid={`button-increase-${item.product.id}`}><Plus size={12} /></button></div></div><div style={{ textAlign: 'right' }}><div className="price">{money(item.product.price * item.quantity)}</div><button className="icon-btn" onClick={() => onRemove(index)} aria-label="Remove item" data-testid={`button-remove-${item.product.id}`}><Trash2 size={15} /></button></div></div>)}</div><aside className="cart-summary"><div className="eyebrow accent">Summary</div><div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-row"><span>Shipping</span><span>{subtotal >= 250 ? 'Complimentary' : money(18)}</span></div><div className="summary-row summary-total"><span>Total</span><span>{money(subtotal >= 250 ? subtotal : subtotal + 18)}</span></div><Link href="/checkout" className="primary-btn full-btn" style={{ display: 'block', textAlign: 'center' }} data-testid="link-checkout">Proceed to checkout <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></Link><div className="mono muted" style={{ textAlign: 'center', marginTop: 18, fontSize: 9 }}>Taxes calculated at checkout</div></aside></div>}</main>;
}

function EmptyState({ title, copy, cta, href, icon }: { title: string; copy: string; cta: string; href: string; icon: ReactNode }) {
  return <div className="empty-state"><div className="accent">{icon}</div><h2 className="display">{title}</h2><p>{copy}</p><Link href={href} className="primary-btn" style={{ display: 'inline-block', marginTop: 25 }} data-testid="link-empty-cta">{cta} <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></Link></div>;
}

function Checkout({ items }: { items: CartItem[] }) {
  const [placed, setPlaced] = useState(false);
  const total = items.reduce((sum, item) => { const product = products.find((p) => p.id === item.productId); return sum + (product?.price ?? 0) * item.quantity; }, 0);
  if (placed) return <main className="page-wrap"><div className="content-narrow"><div className="empty-state"><Check size={28} className="accent" /><h2 className="display">ORDER CONFIRMED.</h2><p>Your order is being prepared with care. A confirmation is on its way to your inbox.</p><Link href="/" className="primary-btn" style={{ display: 'inline-block', marginTop: 26 }}>Return home</Link></div></div></main>;
  if (items.length === 0) return <main className="page-wrap"><div className="page-header"><h1 className="display">CHECKOUT</h1></div><EmptyState title="Nothing to check out." copy="Your bag is waiting for a point of view." cta="Shop DIRACE" href="/shop" icon={<ShoppingBag size={24} />} /></main>;
  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Secure checkout</div><h1 className="display">MAKE IT<br />YOURS.</h1></div><div className="cart-layout"><form className="contact-form" onSubmit={(event) => { event.preventDefault(); setPlaced(true); }}><div className="eyebrow accent">01 / Delivery details</div><div className="field"><label htmlFor="checkout-email">Email address</label><input id="checkout-email" type="email" required data-testid="input-checkout-email" /></div><div className="field"><label htmlFor="checkout-name">Full name</label><input id="checkout-name" required data-testid="input-checkout-name" /></div><div className="field"><label htmlFor="checkout-address">Address</label><input id="checkout-address" required data-testid="input-checkout-address" /></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}><div className="field"><label htmlFor="checkout-city">City</label><input id="checkout-city" required data-testid="input-checkout-city" /></div><div className="field"><label htmlFor="checkout-postcode">Postcode</label><input id="checkout-postcode" required data-testid="input-checkout-postcode" /></div></div><div className="eyebrow accent" style={{ marginTop: 20 }}>02 / Payment</div><div className="field"><label htmlFor="checkout-card">Card number</label><input id="checkout-card" inputMode="numeric" placeholder="0000 0000 0000 0000" required data-testid="input-checkout-card" /></div><button className="primary-btn" type="submit" data-testid="button-place-order">Place order · {money(total)} <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></button></form><aside className="cart-summary"><div className="eyebrow accent">Your pieces</div>{items.map((item) => { const product = products.find((p) => p.id === item.productId)!; return <div className="summary-row" key={`${item.productId}-${item.size}`}><span>{product.name} × {item.quantity}</span><span>{money(product.price * item.quantity)}</span></div>; })}<div className="summary-row summary-total"><span>Total</span><span>{money(total)}</span></div></aside></div></main>;
}

function SearchPage({ wishlist, onToggleWish }: { wishlist: string[]; onToggleWish: (id: string) => void }) {
  const [term, setTerm] = useState('');
  const result = useMemo(() => products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(term.toLowerCase())), [term]);
  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Search</div><h1 className="display">FIND YOUR<br />FORM.</h1></div><div className="search-box"><Search size={22} strokeWidth={1.5} /><input autoFocus placeholder="Search pieces, categories..." value={term} onChange={(event) => setTerm(event.target.value)} aria-label="Search products" data-testid="input-search" /><span className="mono muted">{result.length} results</span></div>{term && result.length === 0 ? <EmptyState title="No exact match." copy="Try a wider search. The right silhouette may be waiting under another name." cta="View all pieces" href="/shop" icon={<Search size={24} />} /> : <div className="shop-grid">{result.map((product) => <ProductCard key={product.id} product={product} isSaved={wishlist.includes(product.id)} onToggleWish={onToggleWish} />)}</div>}</main>;
}

function Account() {
  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Personal</div><h1 className="display">YOUR SPACE.</h1></div><div className="content-narrow"><div className="account-panel"><div className="eyebrow accent">Client account</div><h2 className="display" style={{ fontSize: 45, margin: '18px 0' }}>WELCOME IN.</h2><p className="muted" style={{ fontSize: 13, lineHeight: 1.8 }}>Account access, saved pieces, order history, and faster checkout will be enabled through Supabase Auth.</p><div className="rule" style={{ margin: '25px 0' }} /><div className="empty-state" style={{ padding: '52px 24px' }}><UserRound size={24} className="accent" /><h2 className="display" style={{ fontSize: 32 }}>AUTH NOT CONNECTED.</h2><p>Connect Supabase Auth here when you are ready to enable customer accounts.</p></div></div></div></main>;
}

function Admin() {
  return <main className="page-wrap"><div className="page-header"><div className="eyebrow accent">DIRACE / Studio</div><h1 className="display">CONTROL<br />ROOM.</h1></div><section className="section" style={{ paddingTop: 48 }}><div className="admin-grid"><div className="stat-card"><div className="eyebrow accent">Revenue / 30 days</div><strong>—</strong><span className="mono muted">Supabase data pending</span></div><div className="stat-card"><div className="eyebrow accent">Orders</div><strong>—</strong><span className="mono muted">Supabase data pending</span></div><div className="stat-card"><div className="eyebrow accent">Pieces in studio</div><strong>—</strong><span className="mono muted">Supabase data pending</span></div></div><div className="section-head"><div><div className="eyebrow accent">Live inventory</div><h2 className="display section-title" style={{ fontSize: 52 }}>THE FLOOR</h2></div><button className="secondary-btn" disabled data-testid="button-add-product">Connect Supabase <Plus size={14} style={{ verticalAlign: 'middle' }} /></button></div><div className="empty-state" style={{ padding: '76px 24px' }}><ShoppingBag size={24} className="accent" /><h2 className="display" style={{ fontSize: 38 }}>NO INVENTORY CONNECTED.</h2><p>Product management, orders, customers, and analytics will be powered by your Supabase setup.</p></div></section></main>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router({ wishlist, onToggleWish, items, onAdd, onQty, onRemove }: { wishlist: string[]; onToggleWish: (id: string) => void; items: CartItem[]; onAdd: (id: string, size: string) => void; onQty: (index: number, delta: number) => void; onRemove: (index: number) => void }) {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={() => <Home wishlist={wishlist} onToggleWish={onToggleWish} />} />
    <Route path="/shop" component={() => <Shop wishlist={wishlist} onToggleWish={onToggleWish} />} />
    <Route path="/product/:id" component={() => <ProductDetail wishlist={wishlist} onToggleWish={onToggleWish} onAdd={onAdd} />} />
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
  </Switch></RoutedErrorBoundary>;
}

function App() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const toggleWish = (id: string) => setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const add = (id: string, size: string) => setItems((current) => { const found = current.find((item) => item.productId === id && item.size === size); return found ? current.map((item) => item === found ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { productId: id, size, quantity: 1 }]; });
  const qty = (index: number, delta: number) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity > 0));
  const remove = (index: number) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return <TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Header cartCount={cartCount} wishlistCount={wishlist.length} /><Router wishlist={wishlist} onToggleWish={toggleWish} items={items} onAdd={add} onQty={qty} onRemove={remove} /><Footer /></WouterRouter><Toaster /></TooltipProvider>;
}

export default App;