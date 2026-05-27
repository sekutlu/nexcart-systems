"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ShoppingCart, Check, Package, Heart, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { getStoredUser } from "@/lib/useAuth";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
};

const CATEGORIES = ["All", "Computers", "Networking", "ICT Products", "Web Hosting", "Accessories"];
const HOSTING_CATEGORY = "Web Hosting";
const PRICE_RANGES = [
  { label: "Any price",    min: 0,     max: 0      },
  { label: "Under M 1k",  min: 0,     max: 1000   },
  { label: "M 1k – 5k",   min: 1000,  max: 5000   },
  { label: "M 5k – 20k",  min: 5000,  max: 20000  },
  { label: "M 20k+",      min: 20000, max: 0      },
];

function ProductImage({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <Package size={52} strokeWidth={1.2} style={{ color: "var(--accent)", opacity: 0.4 }} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }}
    />
  );
}

function SkeletonCard() {
  return (
    <article className="product-card" style={{ pointerEvents: "none" }}>
      <div className="product-img" style={{ background: "var(--bg2)" }} />
      <div className="product-body" style={{ gap: 10 }}>
        <div style={{ height: 10, width: "40%", borderRadius: 6, background: "var(--bg2)" }} />
        <div style={{ height: 14, width: "80%", borderRadius: 6, background: "var(--bg2)" }} />
        <div style={{ height: 12, width: "100%", borderRadius: 6, background: "var(--bg2)" }} />
        <div style={{ height: 22, width: "50%", borderRadius: 6, background: "var(--bg2)", marginTop: 4 }} />
      </div>
      <div className="product-footer">
        <div style={{ height: 38, width: "100%", borderRadius: 6, background: "var(--bg2)" }} />
      </div>
    </article>
  );
}

export function ProductList() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [empty, setEmpty]             = useState(false);
  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [activeCategory, setCategory] = useState("All");
  const [priceRange, setPriceRange]   = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart]               = useState<string[]>([]);
  const [cartLoading, setCartLoading]  = useState<string | null>(null);
  const [wishlist, setWishlist]       = useState<string[]>([]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch)              params.set("search",   debouncedSearch);
    if (activeCategory !== "All")     params.set("category", activeCategory);
    const range = PRICE_RANGES[priceRange];
    if (range.min > 0)                params.set("minPrice", String(range.min));
    if (range.max > 0)                params.set("maxPrice", String(range.max));

    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.message || !Array.isArray(data) || data.length === 0) {
          setProducts([]);
          setEmpty(true);
        } else {
          setProducts(data);
          setEmpty(false);
        }
      })
      .catch(() => { setProducts([]); setEmpty(true); })
      .finally(() => setLoading(false));
  }, [debouncedSearch, activeCategory, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleCart = async (id: string) => {
    const user = getStoredUser();
    if (!user?.token) {
      window.location.href = "/login";
      return;
    }
    if (cart.includes(id)) return; // already added
    setCartLoading(id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ productId: id, quantity: 1 }),
      });
      if (res.ok) setCart(p => [...p, id]);
    } finally {
      setCartLoading(null);
    }
  };
  const toggleWishlist = (id: string) => setWishlist(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const hasFilters = activeCategory !== "All" || priceRange !== 0 || debouncedSearch !== "";
  const clearFilters = () => { setSearch(""); setCategory("All"); setPriceRange(0); };

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ left: 13, position: "absolute", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
          <input
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(v => !v)}
          className={`btn btn-ghost`}
          style={{ gap: 6, position: "relative", borderColor: showFilters ? "var(--accent)" : undefined, color: showFilters ? "var(--accent)" : undefined }}
        >
          <SlidersHorizontal size={14} /> Filters
          {hasFilters && <span style={{ background: "var(--accent)", borderRadius: "50%", height: 7, position: "absolute", right: 8, top: 8, width: 7 }} />}
        </button>

        <div style={{ color: "var(--muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          {!loading && <span>{products.length} product{products.length !== 1 ? "s" : ""}</span>}
          {cart.length > 0 && (
            <span style={{ background: "var(--accent)", color: "#fff", borderRadius: 20, padding: "2px 10px", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <ShoppingCart size={12} /> {cart.length}
            </span>
          )}
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--radius)", marginBottom: 20, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10, textTransform: "uppercase" }}>Category</p>
            <div className="category-bar" style={{ marginBottom: 0 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} className={`cat-pill${activeCategory === cat ? " active" : ""}`} onClick={() => setCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10, textTransform: "uppercase" }}>Price range</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRICE_RANGES.map((r, i) => (
                <button key={r.label} className={`cat-pill${priceRange === i ? " active" : ""}`} onClick={() => setPriceRange(i)}>{r.label}</button>
              ))}
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0 }}>
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && (
        <div className="grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && empty && (
        <div className="empty">
          <Package size={48} strokeWidth={1} style={{ opacity: 0.25 }} />
          <h3>{hasFilters ? "No products match your filters" : "No products yet"}</h3>
          <p>{hasFilters ? "Try adjusting your search or filters." : "Add products via the admin panel and they'll appear here."}</p>
          {hasFilters && <button onClick={clearFilters} className="btn btn-ghost" style={{ marginTop: 4 }}>Clear filters</button>}
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !empty && (
        <div className="grid">
          {products.map(product => {
            const inCart     = cart.includes(product.id);
            const inWishlist = wishlist.includes(product.id);
            const isHosting  = product.category === HOSTING_CATEGORY;
            const lowStock   = !isHosting && product.stock > 0 && product.stock <= 5;
            const outOfStock = !isHosting && product.stock === 0;

            return (
              <article className="product-card" key={product.id}>
                <div className="product-img">
                  <ProductImage src={product.imageUrl} alt={product.name} />
                  {lowStock   && <span className="product-img-badge" style={{ background: "#f59e0b" }}>Low Stock</span>}
                  {outOfStock && <span className="product-img-badge" style={{ background: "var(--muted)" }}>Out of Stock</span>}
                </div>

                <div className="product-body">
                  {product.category && <span className="product-category">{product.category}</span>}
                  <div className="product-name">{product.name}</div>
                  <div className="product-desc">{product.description}</div>
                  <div className="product-price-row" style={{ marginTop: "auto" }}>
                    <span className="product-price">M {product.price.toLocaleString()}</span>
                    {!isHosting && product.stock > 0 && (
                      <span style={{ marginLeft: "auto", color: "var(--teal)", fontSize: 12, fontWeight: 600 }}>
                        {product.stock} in stock
                      </span>
                    )}
                    {isHosting && (
                      <span style={{ marginLeft: "auto", color: "var(--teal)", fontSize: 12, fontWeight: 700 }}>
                        Instant activation
                      </span>
                    )}
                  </div>
                </div>

                <div className="product-footer">
                  <button
                    className={`btn ${inCart ? "btn-ghost" : "btn-primary"} btn-full`}
                    onClick={() => !outOfStock && toggleCart(product.id)}
                    disabled={outOfStock || cartLoading === product.id}
                    style={{ gap: 6, opacity: outOfStock ? 0.45 : 1 }}
                  >
                    {cartLoading === product.id
                      ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Adding…</>
                      : inCart
                      ? <><Check size={14} strokeWidth={2.5} /> Added</>
                      : <><ShoppingCart size={14} strokeWidth={2} /> Add to Cart</>}
                  </button>
                  <button
                    className="btn-icon"
                    title="Wishlist"
                    onClick={() => toggleWishlist(product.id)}
                    style={{ color: inWishlist ? "var(--accent)" : undefined, borderColor: inWishlist ? "var(--accent)" : undefined }}
                  >
                    <Heart size={16} strokeWidth={1.8} fill={inWishlist ? "var(--accent)" : "none"} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
