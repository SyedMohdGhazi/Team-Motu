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

  // Service role bypasses RLS — fetch everything including pending/inactive
  const admin = serviceRole(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

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
}
