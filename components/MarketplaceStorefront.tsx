"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayouts from "../layouts/MainLayouts";
import { getAllProducts, MarketProduct } from "../src/lib/supabase-marketplace";
import ValueProposition from "./ValueProposition";

type CartLine = {
  product: MarketProduct;
  quantity: number;
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

const DEFAULT_CATEGORIES = [
  "Accessories",
  "Women's Clothing",
  "Men's Clothing",
  "Appliances",
  "Beauty and Health",
  "Electronics",
  "Furniture",
  "Sports",
  "Books",
  "Groceries",
];
const SLIDER_IMAGES = [
  "/img/product-1.jpg", // Replace with your exact filename
  "/img/product-2.jpg",                    // Replace with your exact filename
  "/img/product-3.jpg",
  "/img/product-4.jpg",                       // Replace with your exact filename
];

export default function MarketplaceStorefront() {
  const pathname = usePathname();
  const isFullCatalog = pathname === "/marketplace";
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All products");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
   // 1. Slider Index State
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  // 2. Automated 5-second interval timer
  useEffect(() => {
    if (isFullCatalog) return; 
    const interval = setInterval(() => {
      setCurrentImgIdx((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isFullCatalog]);

  useEffect(() => {
    let active = true;
    getAllProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((loadError) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Products could not be loaded. Please try again."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
  
    return () => {
      active = false;
    };
  }, []);
  


  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem("cloudfund-cart");
      if (storedCart) setCart(JSON.parse(storedCart) as CartLine[]);

      const storedLikes = window.localStorage.getItem("cloudfund-liked-products");
      if (storedLikes) setLikedProducts(JSON.parse(storedLikes) as string[]);
    } catch {
      window.localStorage.removeItem("cloudfund-cart");
      window.localStorage.removeItem("cloudfund-liked-products");
    }
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (cartLoaded) window.localStorage.setItem("cloudfund-cart", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  useEffect(() => {
    window.localStorage.setItem("cloudfund-liked-products", JSON.stringify(likedProducts));
  }, [likedProducts]);

  const toggleLike = (productId: string) => {
    setLikedProducts((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const discoveredCategories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
  );
  const categories = [
    "All products",
    ...DEFAULT_CATEGORIES,
    ...discoveredCategories.filter(
      (item) => !DEFAULT_CATEGORIES.includes(item)
    ),
  ];
  const normalizedSearch = search.trim().toLowerCase();
  const approvedProducts = products.filter(
    (product) => product.vendorStatus === "approved"
  );
  const visibleProducts = approvedProducts
    .filter((product) => category === "All products" || product.category === category)
    .filter((product) =>
      [product.name, product.description, product.category, product.storeName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    )
    .sort((first, second) => {
      if (sort === "price-low") return first.price - second.price;
      if (sort === "price-high") return second.price - first.price;
      return second.createdAt.localeCompare(first.createdAt);
    });
  const displayedProducts = isFullCatalog ? visibleProducts : visibleProducts.slice(0, 10);
  const productGroups = isFullCatalog
    ? [
        ...categories.slice(1).map((groupName) => ({
          name: groupName,
          products: visibleProducts.filter((product) => product.category === groupName),
        })).filter((group) => group.products.length > 0),
        ...(visibleProducts.some((product) => !product.category)
          ? [{ name: "Other products", products: visibleProducts.filter((product) => !product.category) }]
          : []),
      ]
    : [{ name: "", products: displayedProducts }];
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cart.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0
  );
  const shopCount = new Set(products.map((product) => product.vendorId)).size;

  const addToCart = (product: MarketProduct) => {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (!existing) return [...current, { product, quantity: 1 }];
      if (existing.quantity >= product.stock) return current;
      return current.map((line) =>
        line.product.id === product.id
          ? { ...line, quantity: line.quantity + 1 }
          : line
      );
    });
  };

  const changeQuantity = (productId: string, change: number) => {
    setCart((current) =>
      current
        .map((line) =>
          line.product.id === productId
            ? { ...line, quantity: line.quantity + change }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) =>
      current.filter((line) => line.product.id !== productId)
    );
  };

  const beginCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: checkoutName,
          email: checkoutEmail,
          phone: checkoutPhone,
          address: checkoutAddress,
          items: cart.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.authorizationUrl) {
        throw new Error(result.error ?? "Could not start checkout. Please try again.");
      }
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Could not start checkout. Please try again.");
      setCheckoutLoading(false);
    }
  };

  return (
    <MainLayouts>
      <div style={{ display: 'none' }}>
        {SLIDER_IMAGES.map((src, index) => (
          <img key={index} src={src} alt="preload" />
        ))}
      </div>
      <Box sx={{ minHeight: "100vh", background: "#f7f8f5", color: "#202823" }}>
        {!isFullCatalog ? <Box
          component="section"
          sx={{
            minHeight: { xs: "calc(100svh - 64px)", md: "calc(100svh - 76px)" },
            display: "flex",
            alignItems: "center",
            backgroundColor: "#e8e7e2",
            backgroundImage: {
              xs: `linear-gradient(90deg, rgba(250,250,248,.84) 0%, rgba(250,250,248,.62) 62%, rgba(250,250,248,.3) 100%), url(${SLIDER_IMAGES[currentImgIdx]})`,
              md: `linear-gradient(90deg, rgba(250,250,248,.9) 0%, rgba(250,250,248,.62) 42%, rgba(250,250,248,.08) 78%), url(${SLIDER_IMAGES[currentImgIdx]})`,
            },

            backgroundPosition: { xs: "68% center", md: "center" },
            backgroundSize: "cover",
             transition: "background-image 1s ease-in-out", // Smooth crossfade transition
          }}
        >
          <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
            <Box sx={{ maxWidth: 640 }}>
              <Typography variant="overline" sx={{ color: "#4e6059", fontWeight: 700, letterSpacing: 1.5 }}>
                CLOUDFUND MARKETPLACE
              </Typography>
              <Typography
                component="h1"
                sx={{
                  maxWidth: 620,
                  mt: 1,
                  mb: 2.5,
                  color: "#28333b",
                  fontSize: { xs: 44, sm: 60, md: 72 },
                  lineHeight: 1.06,
                  fontWeight: 500,
                  letterSpacing: 0,
                }}
              >
                Discover more. Shop independent.
              </Typography>
              <Typography sx={{ maxWidth: 500, color: "#010c13", fontFamily: "var(--font-inter), Arial, sans-serif", fontSize: { xs: 18, md: 19 }, fontWeight: 900, lineHeight: 1.65, letterSpacing: "0.005em", textShadow: "0 1px 1px rgba(255,255,255,0.35)" }}>
                Explore products from independent shops, compare your options, and place your order in one convenient marketplace. The best place to shop. 
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  component={Link}
                  href="#catalog"
                  variant="contained"
                  sx={{ px: 3.5, py: 1.4, borderRadius: 20, backgroundColor: "#00a57a", textTransform: "none", fontSize: 16, boxShadow: "none", "&:hover": { backgroundColor: "#008d68", boxShadow: "none" } }}
                >
                  Browse products
                </Button>
                <Button
                  component={Link}
                  href="/vendor/register"
                  sx={{ px: 3.5, py: 1.4, borderRadius: 20, backgroundColor: "rgba(255,255,255,.76)", color: "#28333b", textTransform: "none", fontSize: 16, "&:hover": { backgroundColor: "#fff" } }}
                >
                  Sell on Cloudfund
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box> : null}

          <Box sx={{ display: { xs: "block", md: "none" }, pb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, background: "#fff", border: "1px solid #dfe5df", borderRadius: 2, p: 1, boxShadow: "0 5px 18px rgba(32, 60, 53, 0.06)" }}>
              <SearchRoundedIcon sx={{ color: "#7a867f", ml: 1 }} fontSize="small" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products and shops"
                aria-label="Search products and shops"
                style={{ flex: 1, minWidth: 0, border: 0, outline: 0, fontSize: 14, color: "#202823", background: "transparent" }}
              />
              <Button onClick={() => setCartOpen(true)} aria-label={`Open shopping bag with ${cartCount} items`} sx={{ minWidth: 44, width: 44, height: 44, borderRadius: 1.5, background: "#203c35", color: "#fff", p: 0, "&:hover": { background: "#172e28" } }}>
                <ShoppingBagOutlinedIcon fontSize="small" />
              </Button>
            </Box>
            <FormControl fullWidth sx={{ mt: 1.5 }}>
              <Select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
                aria-label="Filter products by category"
                sx={{ backgroundColor: "#fff", borderRadius: 2, border: "1px solid #dfe5df", "& .MuiSelect-select": { py: 1.25, fontSize: 13 } }}
              >
                <MenuItem value="All products">All categories</MenuItem>
                {categories.filter((item) => item !== "All products").map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: { xs: "grid", md: "grid" },
              gridTemplateColumns: { xs: "1fr", md: "0.75fr 1.25fr" },
              gap: { xs: 2, md: 3 },
              mb: 2.5,
              py: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: { xs: 150, md: 230 },
                p: { xs: 3, md: 5 },
                borderRadius: 2.5,
                backgroundColor: "#1d4ed8",
                color: "#fff",
                textAlign: "center",
                boxShadow: "0 14px 30px rgba(29, 78, 216, 0.16)",
              }}
            >
              <Typography
                component="h2"
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 25, sm: 30, md: 36 },
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                Shop By Category
              </Typography>
              <Typography sx={{ mt: 2, maxWidth: 320, color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.6 }}>
                Browse our selected products by category.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
                gap: { xs: 1.5, sm: 2 },
                alignContent: "center",
                minHeight: { xs: 150, md: 230 },
                p: { xs: 3, md: 4 },
                borderRadius: 2.5,
                backgroundColor: "#f6d94c",
                boxShadow: "0 14px 30px rgba(77, 61, 0, 0.12)",
              }}
            >
              {categories.map((item) => (
                <Button
                  key={item}
                  onClick={() => {
                    setCategory(item);
                    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  variant="contained"
                  sx={{
                    minWidth: 0,
                    width: "100%",
                    px: { xs: 1, sm: 2 },
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#1f9c72",
                    color: "#fff",
                    boxShadow: "none",
                    textTransform: "uppercase",
                    textAlign: "center",
                    fontSize: { xs: 10, sm: 11, md: 12 },
                    fontWeight: 800,
                    letterSpacing: { xs: "0.04em", md: "0.06em" },
                    lineHeight: 1.25,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    transition: "transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease",
                    "&:hover": {
                      backgroundColor: "#147a5a",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(31, 156, 114, 0.24)",
                    },
                    "&:active": { transform: "translateY(0)" },
                  }}
                >
                  {item === "All products" ? "All products" : item}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: { xs: "block", md: "none" }, mb: 2.5 }}>
            <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 2.5, minHeight: 150, background: "linear-gradient(135deg, #1f4a3e 0%, #2c6b5a 55%, #d9ef78 150%)", color: "#fff", p: { xs: 3, sm: 4 } }}>
              <Box sx={{ position: "absolute", right: -20, top: -50, width: 170, height: 170, borderRadius: "50%", border: "28px solid rgba(217,239,120,.2)" }} />
              <Typography variant="overline" sx={{ color: "#d9ef78", fontWeight: 800, letterSpacing: "0.1em" }}>Fresh finds</Typography>
              <Typography component="h2" variant="h4" sx={{ position: "relative", maxWidth: 280, mt: 1, fontWeight: 700, lineHeight: 1.15 }}>Discover better prices, directly from trusted shops.</Typography>
              <Typography variant="body2" sx={{ position: "relative", maxWidth: 290, color: "rgba(255,255,255,.78)", mt: 1.5 }}>Shop independent vendors and discover products selected for everyday living.</Typography>
              <Button component={Link} href="/marketplace" variant="contained" sx={{ position: "relative", mt: 2.5, background: "#fff", color: "#203c35", borderRadius: 20, px: 3, py: 1, textTransform: "none", fontWeight: 700, boxShadow: "none" }}>
                Shop now
              </Button>
            </Box>
          </Box>

          <Container maxWidth="xl" sx={{ pt: { xs: 0, md: 9 }, pb: 9 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
              gap: { xs: 2, md: 4 },
              alignItems: "end",
              pb: { xs: 3, md: 4 },
            }}
          >
            <Box>
              <Typography variant="overline" sx={{ color: "#53665c", fontWeight: 700, letterSpacing: 1.4 }}>
                {isFullCatalog ? "Cloudfund Marketplace" : "Discover independent shops"}
              </Typography>
              <Typography component="h2" sx={{ color: "#203c35", fontSize: { xs: 32, md: 42 }, lineHeight: 1.15, fontWeight: 600, mt: 0.5 }}>
                {isFullCatalog ? "Browse products by brand." : "Find something worth keeping."}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ maxWidth: 360, color: "#5e6a63", lineHeight: 1.7 }}>
              {isFullCatalog
                ? `Browse all ${visibleProducts.length} matching products from ${shopCount} independent ${shopCount === 1 ? "shop" : "shops"}.`
                : `Explore ${visibleProducts.length} approved finds from ${shopCount} independent ${shopCount === 1 ? "shop" : "shops"}.`}
            </Typography>
          </Box>

          <Box id="catalog" sx={{ pt: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { md: "center" },
                justifyContent: { md: "space-between" },
                width: "100%",
                gap: 2,
                pb: 2,
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ color: "#203c35", fontWeight: 700, lineHeight: 1.2 }}>
                  Products
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {loading ? "Finding products from our sellers…" : `${visibleProducts.length} approved products to explore`}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: { xs: "wrap", md: "nowrap" },
                  gap: 1.5,
                  flexShrink: 0,
                  width: { xs: "100%", md: "auto" },
                }}
              >
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", flex: { xs: "1 1 100%", sm: "0 0 256px" }, minWidth: 0 }}>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    style={{ position: "absolute", left: 12, width: 16, height: 16, color: "#9ca3af", pointerEvents: "none" }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products and shops"
                    style={{ boxSizing: "border-box", width: "100%", height: 40, paddingLeft: 40, paddingRight: 12, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#202823", backgroundColor: "#fff" }}
                  />
                </Box>
                <FormControl
                  size="small"
                  sx={{ minWidth: 170, flexShrink: 0, height: 40, backgroundColor: "#fff" }}
                >
                  <Select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter products by category">
                    <MenuItem value="All products">All categories</MenuItem>
                    {categories.filter((item) => item !== "All products").map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  sx={{ minWidth: 150, flexShrink: 0, height: 40, backgroundColor: "#fff" }}
                >
                  <Select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
                    <MenuItem value="featured">Recently added</MenuItem>
                    <MenuItem value="price-low">Price: low to high</MenuItem>
                    <MenuItem value="price-high">Price: high to low</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  onClick={() => setCartOpen(true)}
                  startIcon={<ShoppingBagOutlinedIcon />}
                  variant="outlined"
                  sx={{ height: 40, flexShrink: 0, borderColor: "#d1d5db", color: "#203c35", whiteSpace: "nowrap", px: 2 }}
                >
                  Bag ({cartCount})
                </Button>
              </Box>
            </Box>

            {categories.length > 1 ? (
              <Box
                aria-label="Product categories"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  pb: { xs: 1, md: 0 },
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  color: "#6b7280",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {categories.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    sx={{
                      minWidth: { xs: "auto", md: 0 },
                      px: { xs: 2, md: 0 },
                      py: { xs: 1, md: 0 },
                      p: 0,
                      color: category === item ? "#202823" : "#6b7280",
                      backgroundColor: category === item ? { xs: "#e9f2e8", md: "transparent" } : "transparent",
                      borderRadius: { xs: 2, md: 0 },
                      fontSize: { xs: 13, md: 14 },
                      fontWeight: category === item ? 700 : 500,
                      lineHeight: 1.4,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      "&:hover": { backgroundColor: category === item ? { xs: "#dfece2", md: "transparent" } : "transparent" },
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Box>
            ) : null}

            {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading products">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <div className="aspect-[4/3] animate-pulse bg-neutral-200" />
                    <div className="space-y-3 p-5">
                      <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
                      <div className="h-5 w-4/5 animate-pulse rounded bg-neutral-200" />
                      <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {!loading && !error && visibleProducts.length === 0 ? (
              <Box
                sx={{
                  py: { xs: 7, md: 10 },
                  px: 3,
                  textAlign: "center",
                  borderTop: "1px solid #dfe4dc",
                  borderBottom: "1px solid #dfe4dc",
                }}
              >
                <StorefrontOutlinedIcon sx={{ color: "#bf5538", fontSize: 42, mb: 1 }} />
                <Typography variant="h5" sx={{ color: "#203c35", fontWeight: 700 }}>
                  {products.length === 0 ? "The first finds are on their way." : "No matches this time."}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 460, mx: "auto", mt: 1, mb: 2.5 }}>
                  {products.length === 0
                    ? "Independent shops are getting ready to open here. Come back soon, or be among the first to sell."
                    : "Try another search or category to discover more from independent shops."}
                </Typography>
                {products.length === 0 ? (
                  <Button
                    component={Link}
                    href="/vendor/register"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ color: "#bf5538", fontWeight: 700 }}
                  >
                    Open your shop
                  </Button>
                ) : (
                  <Button onClick={() => { setSearch(""); setCategory("All products"); }} sx={{ color: "#bf5538" }}>
                    Clear filters
                  </Button>
                )}
              </Box>
            ) : null}

            {!isFullCatalog && visibleProducts.length > 10 ? (
              <Stack direction="row" justifyContent="center" sx={{ mb: 3 }}>
                <Button
                  component={Link}
                  href="/marketplace"
                  variant="outlined"
                  sx={{ borderColor: "#203c35", color: "#203c35", px: 3 }}
                >
                  View All
                </Button>
              </Stack>
            ) : null}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 4, md: 6 },
                pb: 3,
              }}
              aria-label="Product cards"
            >
              {productGroups.map((group) => (
                <Box component="section" key={group.name || "featured-products"} aria-label={group.name || "Featured products"}>
                  {group.name ? (
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2 }}>
                      <Typography component="h3" sx={{ color: "#26343a", fontSize: { xs: 22, md: 28 }, fontWeight: 500 }}>
                        {group.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#687479" }}>
                        {group.products.length} {group.products.length === 1 ? "product" : "products"}
                      </Typography>
                    </Stack>
                  ) : null}
                  <Box
                    sx={{
                      display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                    gap: { xs: 1.5, md: 3 },
                  }}
                  >
                    {group.products.map((product) => (
                      <Box key={product.id} sx={{ minWidth: 0 }}>
                  <Card
                    sx={{
                      height: "100%",
                      border: "1px solid #e3e7e1",
                      borderRadius: { xs: 2, md: 1 },
                      boxShadow: "none",
                      display: "flex",
                      flexDirection: "column",
                      background: "#fff",
                    }}
                  >
                    <Box sx={{ position: "relative", overflow: "hidden", aspectRatio: "1 / 0.88" }}>
                      {product.image ? (
                        <Box
                          component="img"
                          src={product.image}
                          alt={product.name}
                          sx={{ width: "100%", height: "100%", objectFit: "cover", background: "#edf0eb" }}
                        />
                      ) : (
                        <Box sx={{ width: "100%", height: "100%", background: "#edf0eb", display: "grid", placeItems: "center" }}>
                          <StorefrontOutlinedIcon sx={{ fontSize: 44, color: "#9ca99f" }} />
                        </Box>
                      )}
                      <Box sx={{ position: "absolute", top: 1.25, left: 1.25, px: 1.25, py: 0.75, borderRadius: 1.5, backgroundColor: "rgba(32,60,53,.92)", color: "#fff", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
                        {product.category || "Marketplace"}
                      </Box>
                      <IconButton
                        aria-label={likedProducts.includes(product.id) ? `Unlike ${product.name}` : `Like ${product.name}`}
                        aria-pressed={likedProducts.includes(product.id)}
                        size="small"
                        onClick={() => toggleLike(product.id)}
                        sx={{
                          position: "absolute",
                          top: 1,
                          right: 1,
                          width: 34,
                          height: 34,
                          backgroundColor: "rgba(255,255,255,.94)",
                          color: likedProducts.includes(product.id) ? "#e63f5f" : "#7b8980",
                          boxShadow: "0 4px 12px rgba(0,0,0,.09)",
                          "&:hover": {
                            backgroundColor: "#fff",
                            color: likedProducts.includes(product.id) ? "#d82e52" : "#1f9c72",
                            transform: "scale(1.06)",
                          },
                        }}
                      >
                        {likedProducts.includes(product.id) ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Box>
                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, p: { xs: 1.5, md: 2.25 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "#e5a52e" }}>
                          <StarRoundedIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" sx={{ color: "#687479", fontWeight: 700 }}>
                            4.8
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ color: "#203c35", fontWeight: 800 }}>
                          {currency.format(product.price)}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" sx={{ color: "#202823", fontWeight: 700, lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64736a", lineHeight: 1.35 }}>
                        {product.storeName} · {product.stock} available
                      </Typography>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={product.stock < 1}
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                          mt: 0.5,
                          minHeight: { xs: 44, md: 42 },
                          background: "#00a57a",
                          color: "#fff",
                          fontWeight: 700,
                          boxShadow: "none",
                          textTransform: "none",
                          borderRadius: 2,
                          "&:hover": { background: "#008d68", boxShadow: "none" },
                        }}
                      >
                        {product.stock < 1 ? "Out of stock" : "Add to bag"}
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

          </Box>
        </Container>
        {!isFullCatalog ? <ValueProposition /> : null}
        <Button
          onClick={() => setCartOpen(true)}
          aria-label={`Open shopping bag, ${cartCount} items`}
          sx={{
            position: "fixed",
            right: { xs: 12, sm: 24 },
            bottom: { xs: 12, sm: 24 },
            zIndex: 1200,
            width: { xs: 48, sm: 48 },
            height: { xs: 48, sm: 48 },
            minWidth: 48,
            minHeight: 48,
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e5e9e7",
            borderRadius: 2,
            backgroundColor: "#fff",
            color: "#078b68",
            boxShadow: "0 8px 28px #15251c18",
            textTransform: "none",
            "&:hover": { backgroundColor: "#fff", boxShadow: "0 10px 32px #15251c24", transform: "translateY(-2px)" },
          }}
        >
          <ShoppingBagOutlinedIcon sx={{ fontSize: 24 }} />
        </Button>
      </Box>

      <Box
        component="nav"
        aria-label="Mobile marketplace navigation"
        sx={{
          display: { xs: "grid", md: "none" },
          gridTemplateColumns: "repeat(4, 1fr)",
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          height: 68,
          backgroundColor: "rgba(255,255,255,.96)",
          borderTop: "1px solid #dfe5df",
          backdropFilter: "blur(14px)",
          px: 1,
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, color: "#738078", textDecoration: "none" }}>
          <HomeOutlinedIcon sx={{ fontSize: 22 }} />
          <Typography sx={{ fontSize: 10, fontWeight: 650 }}>Home</Typography>
        </Link>
        <Link href="/marketplace" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, color: "#203c35", textDecoration: "none" }}>
          <StorefrontOutlinedIcon sx={{ fontSize: 22 }} />
          <Typography sx={{ fontSize: 10, fontWeight: 650 }}>Shop</Typography>
        </Link>
        <Link href="/vendor/login" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, color: "#738078", textDecoration: "none" }}>
          <PersonOutlineIcon sx={{ fontSize: 22 }} />
          <Typography sx={{ fontSize: 10, fontWeight: 650 }}>Vendor</Typography>
        </Link>
        <Button onClick={() => setCartOpen(true)} startIcon={<ShoppingBagOutlinedIcon sx={{ fontSize: 21 }} />} sx={{ color: "#738078", p: 0, minWidth: 0, textTransform: "none", "&:hover": { background: "transparent" } }}>
          <Typography sx={{ fontSize: 10, fontWeight: 650 }}>Bag · {cartCount}</Typography>
        </Button>
      </Box>

      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: { xs: "100vw", sm: 420 }, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ color: "#203c35", fontWeight: 700 }}>Your bag ({cartCount})</Typography>
            <IconButton onClick={() => setCartOpen(false)} aria-label="Close bag">×</IconButton>
          </Stack>
          {cart.length === 0 ? (
            <Typography color="text.secondary">Your bag is empty. Browse the collection to add something you like.</Typography>
          ) : (
            <Stack spacing={2}>
              {cart.map(({ product, quantity }) => (
                <Box key={product.id} sx={{ py: 2, borderBottom: "1px solid #e3e7e1" }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{product.storeName}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>{currency.format(product.price)}</Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconButton size="small" onClick={() => changeQuantity(product.id, -1)} aria-label={`Remove one ${product.name}`}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 1.5, textAlign: "center" }}>{quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => changeQuantity(product.id, 1)}
                        disabled={quantity >= product.stock}
                        aria-label={`Add one ${product.name}`}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => removeFromCart(product.id)}
                        aria-label={`Remove ${product.name} from bag`}
                        sx={{ color: "#a94438", "&:hover": { backgroundColor: "#fff0ed" } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              ))}
              <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Subtotal</Typography>
                <Typography sx={{ fontWeight: 700 }}>{currency.format(cartTotal)}</Typography>
              </Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, pt: 1 }}>Delivery and payment</Typography>
              <TextField label="Full name" value={checkoutName} onChange={(event) => setCheckoutName(event.target.value)} autoComplete="name" required fullWidth size="small" />
              <TextField label="Email" type="email" value={checkoutEmail} onChange={(event) => setCheckoutEmail(event.target.value)} autoComplete="email" required fullWidth size="small" />
              <TextField label="Phone number" value={checkoutPhone} onChange={(event) => setCheckoutPhone(event.target.value)} autoComplete="tel" required fullWidth size="small" />
              <TextField label="Delivery address" value={checkoutAddress} onChange={(event) => setCheckoutAddress(event.target.value)} autoComplete="street-address" required fullWidth multiline minRows={2} size="small" />
              {checkoutError && <Alert severity="error">{checkoutError}</Alert>}
              <Alert severity="info">Secure payment is completed on Paystack. Available payment methods depend on your Paystack account settings.</Alert>
              <Button
                variant="contained"
                onClick={beginCheckout}
                disabled={checkoutLoading || cart.length === 0 || !checkoutName.trim() || !checkoutEmail.trim() || !checkoutPhone.trim() || !checkoutAddress.trim()}
                sx={{ background: "#203c35", py: 1.25, "&:hover": { background: "#172e28" } }}
              >
                {checkoutLoading ? "Starting secure checkout…" : `Continue to payment · ${currency.format(cartTotal)}`}
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </MainLayouts>
  );
}
