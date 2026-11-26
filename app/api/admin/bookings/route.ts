import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function serviceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  const admin = serviceClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await admin.from("users").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

// GET /api/admin/bookings?vendor_id=xxx&vendor_type=grooming|walking
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");
    const vendorType = searchParams.get("vendor_type");

    if (!vendorId || !["grooming", "walking"].includes(vendorType ?? "")) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const admin = serviceClient();

    if (vendorType === "grooming") {
      const { data, error } = await admin
        .from("bookings")
        .select("id, pet_name, pet_type, appointment_date, appointment_time, booking_type, status, total_price, rejection_reason, created_at, users(full_name, email), services(name)")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ bookings: data ?? [] });
    } else {
      const { data, error } = await admin
        .from("walker_bookings")
        .select("id, pet_name, pet_type, walk_date, walk_time, status, notes, created_at, users(full_name, email)")
        .eq("walker_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ bookings: data ?? [] });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
