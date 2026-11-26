import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function serviceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getVendorUser(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  const admin = serviceClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// PATCH /api/vendor/services  { id, is_active: false }  — soft-delete a service
export async function PATCH(request: NextRequest) {
  try {
    const user = await getVendorUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body as { id: string; [key: string]: unknown };
    if (!id) return NextResponse.json({ error: "Missing service id" }, { status: 400 });

    const admin = serviceClient();

    // Confirm this service belongs to the calling user's vendor
    const { data: service, error: fetchError } = await admin
      .from("services")
      .select("vendor_id, grooming_vendors!inner(user_id)")
      .eq("id", id)
      .single();

    if (fetchError || !service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((service.grooming_vendors as any).user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await admin.from("services").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
