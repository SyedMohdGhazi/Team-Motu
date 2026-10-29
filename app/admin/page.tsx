import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as serviceRole } from "@supabase/supabase-js";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from("users") as any)
    .select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin/login");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const empty = { grooming_vendors: [], medical_stores: [], shelters: [], pet_walkers: [] };

  if (!serviceKey || !supabaseUrl) {
    console.error("[admin] SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is not set in environment variables.");
    return (
      <AdminDashboardClient
        adminEmail={user.email ?? ""}
        initialData={empty}
        initialAdmins={[]}
        configError="SUPABASE_SERVICE_ROLE_KEY is missing from environment variables. Add it in Vercel → Settings → Environment Variables."
      />
    );
  }

  try {
    const admin = serviceRole(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [gv, ms, sh, pw, admins] = await Promise.all([
      admin.from("grooming_vendors").select("*").order("created_at", { ascending: false }),
      admin.from("medical_stores").select("*").order("created_at", { ascending: false }),
      admin.from("shelters").select("*").order("created_at", { ascending: false }),
      admin.from("pet_walkers").select("*").order("created_at", { ascending: false }),
      admin.from("users").select("id, email, full_name, created_at")
        .eq("role", "admin").order("created_at", { ascending: true }),
    ]);

    const initialData = {
      grooming_vendors: (gv.data ?? []) as object[],
      medical_stores:   (ms.data ?? []) as object[],
      shelters:         (sh.data ?? []) as object[],
      pet_walkers:      (pw.data ?? []) as object[],
    };

    return (
      <AdminDashboardClient
        adminEmail={user.email ?? ""}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData={initialData as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialAdmins={(admins.data ?? []) as any}
      />
    );
  } catch (err) {
    console.error("[admin] Failed to load vendor data:", err);
    return (
      <AdminDashboardClient
        adminEmail={user.email ?? ""}
        initialData={empty}
        initialAdmins={[]}
        configError={`Failed to load data: ${err instanceof Error ? err.message : String(err)}`}
      />
    );
  }
}
