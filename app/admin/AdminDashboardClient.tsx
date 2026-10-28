"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, LogOut, CheckCircle2, XCircle, Clock,
  Scissors, ShoppingBag, Heart, PawPrint, Loader2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

const STATUS_CHIP: Record<ApprovalStatus, { label: string; cls: string }> = {
  pending:  { label: "Pending",  cls: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-400 border border-red-500/30" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TABS = [
  { key: "grooming_vendors", label: "Grooming",     icon: Scissors,   nameField: "business_name" },
  { key: "medical_stores",   label: "Med Stores",   icon: ShoppingBag, nameField: "store_name" },
  { key: "shelters",         label: "Shelters",     icon: Heart,       nameField: "name" },
  { key: "pet_walkers",      label: "Pet Walkers",  icon: PawPrint,    nameField: "full_name" },
] as const;

type TableKey = (typeof TABS)[number]["key"];

export default function AdminDashboardClient({ adminEmail }: { adminEmail: string }) {
  const [data, setData] = useState<Record<TableKey, VendorRow[]>>({
    grooming_vendors: [], medical_stores: [], shelters: [], pet_walkers: [],
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ApprovalStatus>("pending");
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const loadAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      TABS.map(async ({ key }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: rows } = await (supabase.from(key) as any)
          .select("*, users(email)")
          .order("created_at", { ascending: false });
        return [key, rows ?? []] as [TableKey, VendorRow[]];
      })
    );
    setData(Object.fromEntries(results) as Record<TableKey, VendorRow[]>);
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

  const pendingCount = TABS.reduce((sum, { key }) =>
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
            const total = TABS.reduce((sum, { key }) =>
              sum + data[key].filter((r) => r.approval_status === s).length, 0
            );
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  filter === s
                    ? s === "pending" ? "border-amber-500/50 bg-amber-500/10"
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

        {/* Tabs per service type */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <Tabs defaultValue="grooming_vendors">
            <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
              {TABS.map(({ key, label, icon: Icon }) => {
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
            </TabsList>

            {TABS.map(({ key, nameField }) => {
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
                          (row as Record<string, unknown>)[nameField] as string | null
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
                                  {processing === row.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
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
          </Tabs>
        )}
      </main>
    </div>
  );
}
