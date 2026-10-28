"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, LogOut, CheckCircle2, XCircle, Clock,
  Scissors, ShoppingBag, Heart, PawPrint, Loader2, RefreshCw,
  UserPlus, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface VendorRow {
  id: string;
  business_name?: string;
  store_name?: string;
  name?: string;
  full_name?: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  approval_status: ApprovalStatus;
  created_at: string;
  user_id: string;
  users?: { email: string } | null;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

const STATUS_CHIP: Record<ApprovalStatus, { label: string; cls: string }> = {
  pending:  { label: "Pending",  cls: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-400 border border-red-500/30" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const VENDOR_TABS = [
  { key: "grooming_vendors", label: "Grooming",    icon: Scissors,   nameField: "business_name" },
  { key: "medical_stores",   label: "Med Stores",  icon: ShoppingBag, nameField: "store_name" },
  { key: "shelters",         label: "Shelters",    icon: Heart,       nameField: "name" },
  { key: "pet_walkers",      label: "Pet Walkers", icon: PawPrint,    nameField: "full_name" },
] as const;

type TableKey = (typeof VENDOR_TABS)[number]["key"];

function AddAdminDialog({ open, onClose, onAdded }: {
  open: boolean; onClose: () => void; onAdded: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast({ title: "Failed to create admin", description: json.error, variant: "destructive" });
    } else {
      toast({ title: "Admin account created", description: `${email} can now log in at /admin/login` });
      setEmail(""); setPassword("");
      onAdded(); onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-zinc-900 border-zinc-700 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Add Admin User
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label className="text-zinc-400 text-xs">Email address</Label>
            <Input
              type="email"
              placeholder="newadmin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-zinc-400 text-xs">Initial password</Label>
            <Input
              type="password"
              placeholder="8+ characters"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              required
            />
            <p className="text-xs text-zinc-600">The new admin can change this after logging in.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Create admin
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboardClient({ adminEmail }: { adminEmail: string }) {
  const [data, setData] = useState<Record<TableKey, VendorRow[]>>({
    grooming_vendors: [], medical_stores: [], shelters: [], pet_walkers: [],
  });
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ApprovalStatus>("pending");
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [vendorResults, adminResult] = await Promise.all([
      Promise.all(
        VENDOR_TABS.map(async ({ key }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: rows } = await (supabase.from(key) as any)
            .select("*, users(email)")
            .order("created_at", { ascending: false });
          return [key, rows ?? []] as [TableKey, VendorRow[]];
        })
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("users") as any)
        .select("id, email, full_name, created_at")
        .eq("role", "admin")
        .order("created_at", { ascending: true }),
    ]);
    setData(Object.fromEntries(vendorResults) as Record<TableKey, VendorRow[]>);
    setAdmins(adminResult.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function setStatus(table: TableKey, id: string, status: "approved" | "rejected") {
    setProcessing(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from(table) as any)
      .update({ approval_status: status, is_active: status === "approved" })
      .eq("id", id);
    setProcessing(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: status === "approved" ? "Vendor approved ✓" : "Vendor rejected" });
      loadAll();
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const pendingCount = VENDOR_TABS.reduce((sum, { key }) =>
    sum + data[key].filter((r) => r.approval_status === "pending").length, 0
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-zinc-400" />
            <span className="font-semibold text-zinc-100">Team Motu Admin</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 text-zinc-900 text-xs font-bold px-2 py-0.5">
                {pendingCount} pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden sm:inline">{adminEmail}</span>
            <button
              onClick={loadAll}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1.5 rounded-lg hover:bg-zinc-800"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(["pending", "approved", "rejected"] as const).map((s) => {
            const total = VENDOR_TABS.reduce((sum, { key }) =>
              sum + data[key].filter((r) => r.approval_status === s).length, 0
            );
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  filter === s
                    ? s === "pending"  ? "border-amber-500/50 bg-amber-500/10"
                    : s === "approved" ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-red-500/50 bg-red-500/10"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-zinc-400 capitalize mt-0.5">{s}</p>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <Tabs defaultValue="grooming_vendors">
            <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex-wrap h-auto gap-1">
              {VENDOR_TABS.map(({ key, label, icon: Icon }) => {
                const pendingN = data[key].filter((r) => r.approval_status === "pending").length;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-400 gap-1.5"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                    {pendingN > 0 && (
                      <span className="rounded-full bg-amber-500 text-zinc-900 text-xs font-bold px-1.5 py-px ml-0.5">
                        {pendingN}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
              {/* Admin Users tab */}
              <TabsTrigger
                value="admins"
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-400 gap-1.5 ml-auto"
              >
                <Users className="h-3.5 w-3.5" /> Admins
                <span className="rounded-full bg-zinc-700 text-zinc-300 text-xs px-1.5 py-px">
                  {admins.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Vendor tabs */}
            {VENDOR_TABS.map(({ key, nameField }) => {
              const rows = data[key].filter((r) =>
                filter === "all" ? true : r.approval_status === filter
              );
              return (
                <TabsContent key={key} value={key}>
                  {rows.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500">
                      <p>No {filter === "all" ? "" : filter} entries for this category.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {rows.map((row) => {
                        const displayName =
                          (row as unknown as Record<string, unknown>)[nameField] as string | null
                          ?? row.email ?? "—";
                        const ownerEmail = row.users?.email ?? row.email ?? "—";
                        const st = STATUS_CHIP[row.approval_status] ?? STATUS_CHIP.pending;
                        const isPending = row.approval_status === "pending";
                        return (
                          <div
                            key={row.id}
                            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-zinc-100 truncate">{displayName}</p>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold shrink-0 ${st.cls}`}>
                                  {st.label}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500">{ownerEmail}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-600">
                                {row.city && <span>{row.city}</span>}
                                {row.phone && <span>{row.phone}</span>}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {formatDate(row.created_at)}
                                </span>
                              </div>
                            </div>
                            {isPending && (
                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  disabled={processing === row.id}
                                  onClick={() => setStatus(key, row.id, "approved")}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                                >
                                  {processing === row.id
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <CheckCircle2 className="h-3.5 w-3.5" />}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={processing === row.id}
                                  onClick={() => setStatus(key, row.id, "rejected")}
                                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1.5"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Reject
                                </Button>
                              </div>
                            )}
                            {!isPending && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={processing === row.id}
                                onClick={() => setStatus(key, row.id, row.approval_status === "approved" ? "rejected" : "approved")}
                                className="text-zinc-500 hover:text-zinc-300 shrink-0 text-xs"
                              >
                                {row.approval_status === "approved" ? "Revoke" : "Re-approve"}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              );
            })}

            {/* Admin Users tab */}
            <TabsContent value="admins">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400">{admins.length} admin account{admins.length !== 1 ? "s" : ""}</p>
                <Button
                  size="sm"
                  onClick={() => setAddAdminOpen(true)}
                  className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 gap-1.5"
                >
                  <UserPlus className="h-4 w-4" /> Add Admin
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {admins.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 shrink-0">
                      <ShieldCheck className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-100 text-sm">
                        {a.full_name ?? a.email}
                        {a.email === adminEmail && (
                          <span className="ml-2 text-xs text-zinc-500">(you)</span>
                        )}
                      </p>
                      {a.full_name && <p className="text-xs text-zinc-500">{a.email}</p>}
                    </div>
                    <p className="text-xs text-zinc-600 shrink-0">{formatDate(a.created_at)}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <AddAdminDialog
        open={addAdminOpen}
        onClose={() => setAddAdminOpen(false)}
        onAdded={loadAll}
      />
    </div>
  );
}
