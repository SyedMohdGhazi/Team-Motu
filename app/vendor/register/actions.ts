"use server";

import { createClient as serviceRole } from "@supabase/supabase-js";

export async function checkEmailIsCustomer(email: string): Promise<boolean> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return false;

  const admin = serviceRole(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data } = await admin
    .from("users")
    .select("role")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  return data?.role === "customer";
}
