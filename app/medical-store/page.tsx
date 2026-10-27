"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, ShoppingCart, Plus, Minus, Trash2, Star, Tag, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  image_url: string | null;
  pet_type: string;
  requires_prescription: boolean;
}

interface CartItem { product: Product; qty: number; }

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "food", label: "Food" },
  { key: "medication", label: "Medicines" },
  { key: "flea_tick", label: "Flea & Tick" },
  { key: "supplement", label: "Supplements" },
  { key: "grooming_tool", label: "Grooming" },
  { key: "equipment", label: "Equipment" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  food: "🍖", medication: "💊", flea_tick: "🦟",
  supplement: "💊", grooming_tool: "🪮", equipment: "🌡️",
};

function CartSidebar({ items, onUpdate, onRemove }: {
  items: CartItem[]; onUpdate: (id: string, qty: number) => void; onRemove: (id: string) => void;
}) {
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const { toast } = useToast();
  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="pb-4 border-b">
        <SheetTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" /> Cart ({items.reduce((n, i) => n + i.qty, 0)} items)
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
                <div className="text-3xl">{CATEGORY_EMOJI[product.category] ?? "📦"}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
                  <p className="text-sm font-bold text-primary mt-1">₹{product.price}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => onRemove(product.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  <div className="flex items-center gap-1 border rounded-lg">
                    <button onClick={() => onUpdate(product.id, qty - 1)} className="p-1 hover:bg-accent"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-6 text-center text-sm font-medium">{qty}</span>
                    <button onClick={() => onUpdate(product.id, qty + 1)} className="p-1 hover:bg-accent"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 grid gap-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₹{total}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span className={total >= 499 ? "text-emerald-600 font-medium" : ""}>{total >= 499 ? "FREE" : "₹49"}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-3"><span>Total</span><span className="text-primary">₹{total >= 499 ? total : total + 49}</span></div>
            {total < 499 && <p className="text-xs text-muted-foreground text-center">Add ₹{499 - total} more for free delivery</p>}
            <Button className="w-full" onClick={() => toast({ title: "Order placed!", description: `Total: ₹${total >= 499 ? total : total + 49}` })}>
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;
  const inStock = product.stock_quantity > 0;
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${!inStock ? "opacity-60" : ""}`}>
      <div className="h-28 bg-gradient-to-br from-muted/60 to-muted/30 flex items-center justify-center text-5xl">
        {CATEGORY_EMOJI[product.category] ?? "📦"}
      </div>
      <CardContent className="p-3 grid gap-2">
        <div>
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-semibold leading-tight line-clamp-2 flex-1">{product.name}</p>
            {discount > 0 && <span className="shrink-0 rounded-full bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5">-{discount}%</span>}
          </div>
          {product.brand && <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>}
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs capitalize">
            {product.pet_type === "both" ? "Dogs & Cats" : product.pet_type}
          </Badge>
          {product.requires_prescription && <Badge variant="destructive" className="text-xs">Rx</Badge>}
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t">
          <div>
            <span className="font-bold text-primary">₹{product.price}</span>
            {product.original_price && <span className="ml-1.5 text-xs line-through text-muted-foreground">₹{product.original_price}</span>}
          </div>
          <Button size="sm" disabled={!inStock} onClick={() => onAddToCart(product)} className="h-7 px-2.5 text-xs">
            {inStock ? <><Plus className="h-3 w-3 mr-1" />Add</> : "Out of stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MedicalStorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [petFilter, setPetFilter] = useState<"all" | "dog" | "cat">("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data } = await supabase.from("medical_products").select("*").eq("is_active", true).order("name");
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q);
      const matchCat = category === "all" || p.category === category;
      const matchPet = petFilter === "all" || p.pet_type === petFilter || p.pet_type === "both";
      return matchSearch && matchCat && matchPet;
    });
  }, [search, category, petFilter, products]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    toast({ title: "Added to cart", description: product.name });
  }

  function updateCart(id: string, qty: number) {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.product.id !== id));
    else setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, qty } : i));
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Medical Supplies & Essentials</h1>
            <p className="text-sm text-muted-foreground mt-1">Medicines, food, flea treatments &amp; more for cats and dogs</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative shrink-0">
                <ShoppingCart className="h-5 w-5" />
                <span className="ml-1.5 hidden sm:inline">Cart</span>
                {cartCount > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{cartCount}</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-6">
              <CartSidebar items={cart} onUpdate={updateCart} onRemove={(id) => setCart((prev) => prev.filter((i) => i.product.id !== id))} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search medicines, food, grooming tools…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearch("")}><X className="h-4 w-4" /></button>}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex rounded-lg border overflow-hidden text-sm">
            {(["all", "dog", "cat"] as const).map((p) => (
              <button key={p} onClick={() => setPetFilter(p)} className={`px-3 py-1.5 font-medium transition-colors ${petFilter === p ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                {p === "all" ? "All" : p === "dog" ? "🐶 Dogs" : "🐱 Cats"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => setCategory(c.key)} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${category === c.key ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent border-border"}`}>
                <Tag className="h-3 w-3" />{c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🛍️</p>
            <p className="font-medium">{products.length === 0 ? "No products added yet" : "No products match your search"}</p>
            {products.length === 0 && <p className="text-sm mt-1">Add products via the Supabase Table Editor to display them here.</p>}
            {products.length > 0 && <button className="mt-2 text-sm text-primary hover:underline" onClick={() => { setSearch(""); setCategory("all"); setPetFilter("all"); }}>Clear filters</button>}
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
            </div>
          </>
        )}
      </main>
    </>
  );
}
