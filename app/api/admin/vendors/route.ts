import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const TABLES = ["grooming_vendors", "medical_stores", "shelters", "pet_walkers"] as const;

function serviceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from("users") as any)
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

// GET /api/admin/vendors — fetch all rows from every vendor table + admin users
export async function GET() {
  const adminUser = await verifyAdmin();
  if (!adminUser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = serviceClient();

  const [vendorResults, adminsResult] = await Promise.all([
    Promise.all(
      TABLES.map(async (table) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (admin.from(table) as any)
          .select("*")
          .order("created_at", { ascending: false });
        if (error) console.error(`[admin api] ${table}:`, error.message);
        return [table, data ?? []] as const;
      })
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from("users") as any)
      .select("id, email, full_name, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: true }),
  ]);

  return NextResponse.json({
    vendors: Object.fromEntries(vendorResults),
    admins: adminsResult.data ?? [],
  });
}

// POST /api/admin/vendors — approve or reject a vendor
export async function POST(request: NextRequest) {
  const adminUser = await verifyAdmin();
  if (!adminUser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { table, id, status } = await request.json() as {
    table: string;
    id: string;
    status: "approved" | "rejected";
  };

  if (!TABLES.includes(table as (typeof TABLES)[number]) || !id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = serviceClient();

  // Update is_active first (always works)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin.from(table) as any)
    .update({ is_active: status === "approved" })
    .eq("id", id);

  // Update approval_status (best-effort — column may not exist on older tables)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from(table) as any)
    .update({ approval_status: status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
