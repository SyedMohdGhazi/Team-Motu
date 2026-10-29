"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as serviceRole } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const TABLES = ["grooming_vendors", "pet_walkers"] as const;
type TableKey = (typeof TABLES)[number];

function adminClient() {
  return serviceRole(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from("users") as any)
    .select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
}

export async function updateVendorStatus(
  table: TableKey,
  id: string,
  status: "approved" | "rejected"
) {
  await assertAdmin();
  const admin = adminClient();
  await admin.from(table).update({ is_active: status === "approved" }).eq("id", id);
  await admin.from(table).update({ approval_status: status }).eq("id", id);
  revalidatePath("/admin");
}

export async function loadAllVendors() {
  await assertAdmin();
  const admin = adminClient();

  const [gv, pw, admins] = await Promise.all([
    admin.from("grooming_vendors").select("*").order("created_at", { ascending: false }),
    admin.from("pet_walkers").select("*").order("created_at", { ascending: false }),
    admin.from("users").select("id, email, full_name, created_at")
      .eq("role", "admin").order("created_at", { ascending: true }),
  ]);

  return {
    vendors: {
      grooming_vendors: gv.data ?? [],
      pet_walkers: pw.data ?? [],
    },
    admins: admins.data ?? [],
  };
}
