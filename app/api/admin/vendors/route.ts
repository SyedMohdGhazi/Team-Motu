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

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return null;

  const admin = serviceClient();

  // Verify the token and get the user (service role bypasses RLS)
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;

  // Check role in public.users
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

// GET /api/admin/vendors — fetch all rows from every vendor table + admin users
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = serviceClient();

    const [vendorResults, adminsResult] = await Promise.all([
      Promise.all(
        TABLES.map(async (table) => {
          const { data, error } = await admin
            .from(table)
            .select("*")
            .order("created_at", { ascending: false });
          if (error) console.error(`[admin api] ${table}:`, error.message);
          return [table, data ?? []] as const;
        })
      ),
      admin
        .from("users")
        .select("id, email, full_name, created_at")
        .eq("role", "admin")
        .order("created_at", { ascending: true }),
    ]);

    return NextResponse.json({
      vendors: Object.fromEntries(vendorResults),
      admins: adminsResult.data ?? [],
    });
  } catch (err) {
    console.error("[admin api] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/vendors — approve or reject a vendor
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { table, id, status } = (await request.json()) as {
      table: string;
      id: string;
      status: "approved" | "rejected";
    };

    if (
      !TABLES.includes(table as (typeof TABLES)[number]) ||
      !id ||
      !["approved", "rejected"].includes(status)
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const admin = serviceClient();

    // Update is_active first (always exists)
    const { error } = await admin
      .from(table)
      .update({ is_active: status === "approved" })
      .eq("id", id);

    // Best-effort: update approval_status (column may not exist on older tables)
    await admin
      .from(table)
      .update({ approval_status: status })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin api] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
