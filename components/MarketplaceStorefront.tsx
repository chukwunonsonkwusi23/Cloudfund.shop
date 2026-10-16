"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import ChairOutlinedIcon from "@mui/icons-material/ChairOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalGroceryStoreOutlinedIcon from "@mui/icons-material/LocalGroceryStoreOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SportsBasketballOutlinedIcon from "@mui/icons-material/SportsBasketballOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Badge,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayouts from "../layouts/MainLayouts";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";
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

const SLIDER_IMAGES = [
  "/img/product-1.jpg", // Replace with your exact filename
  "/img/product-2.jpg",                    // Replace with your exact filename
  "/img/product-3.jpg",
  "/img/product-4.jpg",                       // Replace with your exact filename
];
const CATEGORY_IMAGES: Record<string, string> = {
  Accessories: "/Categories/Accessories.jpg",
  "Women's Clothing": "/Categories/women clothing.jpg",
  "Men's Clothing": "/Categories/men clothing.jpg",
  Appliances: "/Categories/appliance.jpg",
  "Beauty and Health": "/Categories/beauty and health.jpg",
  Electronics: "/Categories/electronics.jpg",
  Furniture: "/Categories/furniture.jpg",
  Sports: "/Categories/sport.jpg",
  Books: "/Categories/book.jpg",
  Groceries: "/Categories/groceries.jpg",
};

function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes("cloth") || name.includes("fashion") || name.includes("wear")) return <CheckroomOutlinedIcon />;
  if (name.includes("furniture") || name.includes("home")) return <ChairOutlinedIcon />;
  if (name.includes("grocery") || name.includes("food")) return <LocalGroceryStoreOutlinedIcon />;
  if (name.includes("book")) return <MenuBookOutlinedIcon />;
  if (name.includes("sport")) return <SportsBasketballOutlinedIcon />;
  if (name.includes("electronic") || name.includes("appliance") || name.includes("accessor")) return <DevicesOtherOutlinedIcon />;
  return <CategoryOutlinedIcon />;
}

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
  const [cartNotice, setCartNotice] = useState("");
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
    ...MARKETPLACE_CATEGORIES,
    ...discoveredCategories.filter(
      (item) => !MARKETPLACE_CATEGORIES.includes(item as (typeof MARKETPLACE_CATEGORIES)[number])
    ),
  ];
  const normalizedSearch = search.trim().toLowerCase();
  const approvedProducts = products.filter(
    (product) => product.vendorStatus === "approved"
  );
  const approvedCategories = Array.from(
    new Set(approvedProducts.map((product) => product.category).filter(Boolean))
  );
  const homepageCategories = (approvedCategories.length > 0 ? approvedCategories : [...MARKETPLACE_CATEGORIES]).slice(0, 10);
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
    : [
        { name: "Featured finds", products: visibleProducts.slice(0, 5) },
        ...(visibleProducts.length > 5
          ? [{ name: "More to explore", products: visibleProducts.slice(5, 10) }]
          : []),
      ];
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cart.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0
  );
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
    setCartNotice(`${product.name} added to your bag`);
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
        {!isFullCatalog ? (
          <Box
            component="section"
            aria-label="Cloudfund marketplace promotion"
            sx={{
              position: "relative",
              overflow: "hidden",
              isolation: "isolate",
              color: "#fff",
              background: "#07506a",
            }}
          >
            <Box
              key={SLIDER_IMAGES[currentImgIdx]}
              component="img"
              src={SLIDER_IMAGES[currentImgIdx]}
              alt="A featured product available from a Cloudfund shop"
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: { xs: "68% center", md: "center 58%" },
              }}
            />
            <Box
              aria-hidden="true"
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                pointerEvents: "none",
                background: {
                  xs: "linear-gradient(90deg, rgba(7,80,106,.96) 0%, rgba(7,80,106,.88) 48%, rgba(7,80,106,.5) 100%)",
                  md: "linear-gradient(90deg, #07506a 0%, rgba(7,80,106,.96) 31%, rgba(7,80,106,.72) 48%, rgba(7,80,106,.08) 78%, rgba(7,80,106,0) 100%)",
                },
              }}
            />
            <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
              <Box
                sx={{
                  position: "relative",
                  zIndex: 2,
                  minHeight: { xs: 430, sm: 470, md: 480 },
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  alignItems: "center",
                  gap: { xs: 1, md: 3 },
                }}
              >
                <Box sx={{ position: "relative", zIndex: 2, maxWidth: { xs: "100%", md: "54%" }, py: { xs: 1, md: 3 } }}>
                  <Typography
                    component="p"
                    sx={{
                      display: "inline-flex",
                      px: 1.5,
                      py: 0.65,
                      mb: 1.5,
                      borderRadius: 20,
                      color: "#07506a",
                      backgroundColor: "#f6d94c",
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                    }}
                  >
                    CLOUDFUND MARKETPLACE
                  </Typography>
                  <Typography
                    component="h1"
                    sx={{
                      maxWidth: 560,
                      fontSize: { xs: 38, sm: 50, md: 58 },
                      lineHeight: 1.04,
                      fontWeight: 850,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Great finds from shops near you.
                  </Typography>
                  <Typography sx={{ maxWidth: 470, mt: 1.75, color: "rgba(255,255,255,.88)", fontSize: { xs: 15, md: 17 }, lineHeight: 1.65 }}>
                    Explore products from independent shops, compare your options, and order in one convenient marketplace.
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                    <Button
                      component={Link}
                      href="#catalog"
                      variant="contained"
                      sx={{ px: 2.6, py: 1.2, borderRadius: 20, backgroundColor: "#f6d94c", color: "#183640", fontWeight: 800, textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: "#ffe56a", boxShadow: "none" } }}
                    >
                      Shop products
                    </Button>
                    <Button
                      component={Link}
                      href="/vendor/register"
                      sx={{ px: 2.2, py: 1.2, borderRadius: 20, border: "1px solid rgba(255,255,255,.55)", color: "#fff", textTransform: "none", "&:hover": { backgroundColor: "rgba(255,255,255,.1)" } }}
                    >
                      Sell on Cloudfund
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Container>
            <Stack direction="row" spacing={0.75} sx={{ position: "absolute", zIndex: 3, bottom: { xs: 12, md: 18 }, left: "50%", transform: "translateX(-50%)" }}>
              {SLIDER_IMAGES.map((image, index) => (
                <IconButton
                  key={image}
                  aria-label={`Show promotion image ${index + 1}`}
                  onClick={() => setCurrentImgIdx(index)}
                  size="small"
                  sx={{ width: 20, height: 20, color: "#fff" }}
                >
                  <Box sx={{ width: index === currentImgIdx ? 12 : 7, height: 7, borderRadius: 8, backgroundColor: index === currentImgIdx ? "#f6d94c" : "rgba(255,255,255,.7)" }} />
                </IconButton>
              ))}
            </Stack>
          </Box>
        ) : null}

          {!isFullCatalog ? (
            <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 4 }, pb: 1 }}>
              <Box component="section" aria-labelledby="shop-categories-title">
                <Stack direction="row" justifyContent="space-between" alignItems="end" sx={{ mb: 2 }}>
                  <Box>
                    <Typography component="h2" id="shop-categories-title" sx={{ color: "#192c36", fontSize: { xs: 21, md: 25 }, fontWeight: 800 }}>
                      Shop by category
                    </Typography>
                    <Typography sx={{ mt: 0.4, color: "#687781", fontSize: 13 }}>
                      Find something for every part of your day.
                    </Typography>
                  </Box>
                  <Button component={Link} href="/marketplace" endIcon={<ArrowForwardIcon />} sx={{ color: "#087c91", fontWeight: 750, textTransform: "none", display: { xs: "none", sm: "inline-flex" } }}>
                    View all
                  </Button>
                </Stack>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))" }, gap: { xs: 1, sm: 1.5 } }}>
                  {homepageCategories.map((item, index) => {
                    const categoryProducts = approvedProducts.filter((product) => product.category === item);
                    const itemCount = categoryProducts.length;
                    const categoryImage = CATEGORY_IMAGES[item] || categoryProducts.find((product) => product.image)?.image;
                    return (
                      <Button
                        key={item}
                        onClick={() => {
                          setCategory(item);
                          document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        aria-label={`Browse ${item}, ${itemCount} ${itemCount === 1 ? "product" : "products"}`}
                        sx={{
                          minWidth: 0,
                          minHeight: { xs: 76, md: 88 },
                          display: "flex",
                          justifyContent: "flex-start",
                          gap: 1.25,
                          px: { xs: 1.25, sm: 1.75 },
                          py: 1.25,
                          border: "1px solid #e5eaeb",
                          borderRadius: 2,
                          backgroundColor: "#fff",
                          color: "#172d39",
                          textAlign: "left",
                          textTransform: "none",
                          boxShadow: "0 3px 10px rgba(15,45,54,.035)",
                          "&:hover": { backgroundColor: "#f5fbfc", borderColor: "#9bd3d6", boxShadow: "0 8px 18px rgba(15,45,54,.08)" },
                        }}
                      >
                        <Box sx={{ width: 58, height: 58, flexShrink: 0, display: "grid", placeItems: "center", overflow: "hidden", borderRadius: 1.5, color: index % 2 ? "#087c91" : "#0b966e", backgroundColor: index % 2 ? "#e5f5f6" : "#e6f5ee", "& svg": { fontSize: 25 } }}>
                          {categoryImage ? (
                            <Box
                              component="img"
                              src={categoryImage}
                              alt={`${item} product`}
                              loading="lazy"
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : getCategoryIcon(item)}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: "#233b47", fontSize: { xs: 12, sm: 13 }, fontWeight: 750, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item}
                          </Typography>
                          <Typography sx={{ mt: 0.4, color: "#788991", fontSize: 11, fontWeight: 500 }}>
                            {loading ? "Explore" : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                          </Typography>
                        </Box>
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            </Container>
          ) : null}

          <Container maxWidth="xl" sx={{ pt: { xs: 0, md: 4 }, pb: { xs: 8, md: 5 } }}>
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
                {isFullCatalog ? "Browse products by category." : "Find something worth keeping."}
              </Typography>
            </Box>
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
                  {isFullCatalog ? "Products" : "Explore the marketplace"}
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
                  gap: { xs: 1, md: 2 },
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
                      minWidth: "max-content",
                      px: { xs: 1.5, md: 0.75 },
                      py: { xs: 1, md: 0 },
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
                      <Typography component="h3" sx={{ color: "#192f3b", fontSize: { xs: 21, md: 25 }, fontWeight: 800, letterSpacing: "-0.02em" }}>
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
                      gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))", xl: "repeat(5, minmax(0, 1fr))" },
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
                    <Box sx={{ position: "relative", overflow: "hidden", aspectRatio: "1 / 1", backgroundColor: "#f7f9f8" }}>
                      {product.image ? (
                        <Box
                          component="img"
                          src={product.image}
                          alt={product.name}
                          sx={{ width: "100%", height: "100%", p: 1.25, objectFit: "contain", background: "#f7f9f8" }}
                        />
                      ) : (
                        <Box sx={{ width: "100%", height: "100%", background: "#edf0eb", display: "grid", placeItems: "center" }}>
                          <StorefrontOutlinedIcon sx={{ fontSize: 44, color: "#9ca99f" }} />
                        </Box>
                      )}
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
                        <Typography variant="caption" sx={{ color: "#087c91", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {product.category || "Shop find"}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#123d4b", fontWeight: 850, whiteSpace: "nowrap" }}>
                          {currency.format(product.price)}
                        </Typography>
                      </Stack>
                      <Typography variant="subtitle1" sx={{ color: "#23343d", fontWeight: 750, lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
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
            width: { xs: 48, sm: 48, md: 104 },
            height: { xs: 48, sm: 48 },
            minWidth: { xs: 48, sm: 48, md: 104 },
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <Badge badgeContent={cartCount} color="error" overlap="circular" sx={{ "& .MuiBadge-badge": { fontWeight: 800, minWidth: 21, height: 21 } }}>
              <ShoppingBagOutlinedIcon sx={{ fontSize: 26 }} />
            </Badge>
            <Box component="span" sx={{ display: { xs: "none", md: "inline" }, fontWeight: 750, fontSize: 13 }}>Bag</Box>
          </Stack>
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
        <Button onClick={() => setCartOpen(true)} startIcon={<Badge badgeContent={cartCount} color="error" overlap="circular"><ShoppingBagOutlinedIcon sx={{ fontSize: 21 }} /></Badge>} sx={{ color: "#203c35", p: 0, minWidth: 0, textTransform: "none", "&:hover": { background: "transparent" } }}>
          <Typography sx={{ fontSize: 10, fontWeight: 750 }}>Bag · {cartCount}</Typography>
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
      <Snackbar
        open={Boolean(cartNotice)}
        autoHideDuration={5000}
        onClose={() => setCartNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: "calc(80px + env(safe-area-inset-bottom)) !important", sm: "24px !important" } }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCartNotice("")}
          action={<Button color="inherit" size="small" onClick={() => { setCartNotice(""); setCartOpen(true); }}>View bag</Button>}
          sx={{ alignItems: "center", borderRadius: 3, boxShadow: "0 8px 28px rgba(15,45,35,.22)" }}
        >
          {cartNotice}
        </Alert>
      </Snackbar>
    </MainLayouts>
  );
}
