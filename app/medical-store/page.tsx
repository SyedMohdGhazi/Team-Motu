"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Star,
  Tag,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  petType: "dog" | "cat" | "both";
  emoji: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  requiresPrescription: boolean;
}

interface CartItem {
  product: Product;
  qty: number;
}

// ─── Mock products ────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  { id: "p1", name: "Frontline Plus Flea & Tick Treatment", brand: "Frontline", category: "flea_tick", price: 549, originalPrice: 699, petType: "dog", emoji: "🦟", rating: 4.7, reviews: 312, inStock: true, requiresPrescription: false },
  { id: "p2", name: "Royal Canin Adult Maxi Dog Food 3kg", brand: "Royal Canin", category: "food", price: 1299, petType: "dog", emoji: "🍖", rating: 4.8, reviews: 489, inStock: true, requiresPrescription: false },
  { id: "p3", name: "Whiskas Cat Food Tuna Flavour 1.2kg", brand: "Whiskas", category: "food", price: 349, petType: "cat", emoji: "🐟", rating: 4.5, reviews: 224, inStock: true, requiresPrescription: false },
  { id: "p4", name: "Revolution Plus Flea Treatment (Cats)", brand: "Zoetis", category: "flea_tick", price: 799, originalPrice: 950, petType: "cat", emoji: "💊", rating: 4.6, reviews: 156, inStock: true, requiresPrescription: true },
  { id: "p5", name: "Pet Multivitamin Supplement 120 Tablets", brand: "Drools", category: "supplement", price: 299, petType: "both", emoji: "💊", rating: 4.4, reviews: 98, inStock: true, requiresPrescription: false },
  { id: "p6", name: "Dog Ear Cleaning Solution 120ml", brand: "Virbac", category: "medication", price: 249, petType: "dog", emoji: "🧴", rating: 4.3, reviews: 67, inStock: true, requiresPrescription: false },
  { id: "p7", name: "Slicker Brush for Dogs & Cats", brand: "Pet It", category: "grooming_tool", price: 199, petType: "both", emoji: "🪮", rating: 4.2, reviews: 183, inStock: true, requiresPrescription: false },
  { id: "p8", name: "Cat Anti-Hairball Paste 100g", brand: "Beaphar", category: "supplement", price: 379, petType: "cat", emoji: "🐾", rating: 4.5, reviews: 74, inStock: false, requiresPrescription: false },
  { id: "p9", name: "Dog Shampoo — Oatmeal & Aloe 250ml", brand: "Wahl", category: "grooming_tool", price: 399, petType: "dog", emoji: "🛁", rating: 4.6, reviews: 241, inStock: true, requiresPrescription: false },
  { id: "p10", name: "Amoxicillin Suspension 30ml (Rx)", brand: "Indian Immunologicals", category: "medication", price: 189, petType: "both", emoji: "💉", rating: 4.1, reviews: 33, inStock: true, requiresPrescription: true },
  { id: "p11", name: "Cat Dental Treats 60g", brand: "Greenies", category: "food", price: 449, petType: "cat", emoji: "🦷", rating: 4.7, reviews: 127, inStock: true, requiresPrescription: false },
  { id: "p12", name: "Digital Pet Thermometer", brand: "Dr.Morepen", category: "equipment", price: 349, petType: "both", emoji: "🌡️", rating: 4.0, reviews: 55, inStock: true, requiresPrescription: false },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "food", label: "Food" },
  { key: "medication", label: "Medicines" },
  { key: "flea_tick", label: "Flea & Tick" },
  { key: "supplement", label: "Supplements" },
  { key: "grooming_tool", label: "Grooming" },
  { key: "equipment", label: "Equipment" },
];

// ─── Cart sidebar ─────────────────────────────────────────────────────────────
function CartSidebar({ items, onUpdate, onRemove }: {
  items: CartItem[];
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const { toast } = useToast();

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="pb-4 border-b">
        <SheetTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart ({items.reduce((n, i) => n + i.qty, 0)} items)
        </SheetTitle>
      </SheetHeader>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-2">
          <ShoppingCart className="h-12 w-12 opacity-20" />
          <p className="text-sm">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto py-4 grid gap-3">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-start gap-3 rounded-xl border p-3">
                <div className="text-3xl">{product.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
                  <p className="text-sm font-bold text-primary mt-1">₹{product.price}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => onRemove(product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center gap-1 border rounded-lg">
                    <button
                      onClick={() => onUpdate(product.id, qty - 1)}
                      className="p-1 hover:bg-accent transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{qty}</span>
                    <button
                      onClick={() => onUpdate(product.id, qty + 1)}
                      className="p-1 hover:bg-accent transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout summary */}
          <div className="border-t pt-4 grid gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-emerald-600 font-medium">{total >= 499 ? "FREE" : "₹49"}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-3">
              <span>Total</span>
              <span className="text-primary">₹{total >= 499 ? total : total + 49}</span>
            </div>
            {total < 499 && (
              <p className="text-xs text-muted-foreground text-center">
                Add ₹{499 - total} more for free delivery
              </p>
            )}
            <Button
              className="w-full"
              onClick={() => toast({ title: "Order placed!", description: `Total: ₹${total >= 499 ? total : total + 49}` })}
            >
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart }: {
  product: Product;
  onAddToCart: (p: Product) => void;
}) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${!product.inStock ? "opacity-60" : ""}`}>
      <div className="h-28 bg-gradient-to-br from-muted/60 to-muted/30 flex items-center justify-center text-5xl">
        {product.emoji}
      </div>
      <CardContent className="p-3 grid gap-2">
        <div>
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-semibold leading-tight line-clamp-2 flex-1">{product.name}</p>
            {discount > 0 && (
              <span className="shrink-0 rounded-full bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5">
                -{discount}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs capitalize">
            {product.petType === "both" ? "Dogs & Cats" : product.petType}
          </Badge>
          {product.requiresPrescription && (
            <Badge variant="destructive" className="text-xs">Rx</Badge>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span>({product.reviews})</span>
        </div>

        {/* Price + add */}
        <div className="flex items-center justify-between pt-1.5 border-t">
          <div>
            <span className="font-bold text-primary">₹{product.price}</span>
            {product.originalPrice && (
              <span className="ml-1.5 text-xs line-through text-muted-foreground">₹{product.originalPrice}</span>
            )}
          </div>
          <Button
            size="sm"
            disabled={!product.inStock}
            onClick={() => onAddToCart(product)}
            className="h-7 px-2.5 text-xs"
          >
            {product.inStock ? (
              <><Plus className="h-3 w-3 mr-1" />Add</>
            ) : "Out of stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MedicalStorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [petFilter, setPetFilter] = useState<"all" | "dog" | "cat">("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      const matchCat = category === "all" || p.category === category;
      const matchPet = petFilter === "all" || p.petType === petFilter || p.petType === "both";
      return matchSearch && matchCat && matchPet;
    });
  }, [search, category, petFilter]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    toast({ title: "Added to cart", description: product.name });
  }

  function updateCart(id: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== id));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === id ? { ...i, qty } : i))
      );
    }
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Medical Supplies & Essentials</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Medicines, food, flea treatments &amp; more for cats and dogs
            </p>
          </div>
          {/* Cart button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative shrink-0">
                <ShoppingCart className="h-5 w-5" />
                <span className="ml-1.5 hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-6">
              <CartSidebar items={cart} onUpdate={updateCart} onRemove={removeFromCart} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search medicines, food, grooming tools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-2 mb-5">
          {/* Pet type */}
          <div className="flex rounded-lg border overflow-hidden text-sm">
            {(["all", "dog", "cat"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPetFilter(p)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  petFilter === p ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                {p === "all" ? "All" : p === "dog" ? "🐶 Dogs" : "🐱 Cats"}
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  category === c.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-accent border-border"
                }`}
              >
                <Tag className="h-3 w-3" />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p>No products match your search.</p>
            <button
              className="mt-2 text-sm text-primary hover:underline"
              onClick={() => { setSearch(""); setCategory("all"); setPetFilter("all"); }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
