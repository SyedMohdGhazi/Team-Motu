"use server";

import { createClient as serviceRole } from "@supabase/supabase-js";

async function lookupEmailRole(email: string): Promise<string | null> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;

  const admin = serviceRole(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data } = await admin
    .from("users")
    .select("role")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  return data?.role ?? null;
}

export async function checkEmailIsCustomer(email: string): Promise<boolean> {
  return (await lookupEmailRole(email)) === "customer";
}

export async function checkEmailIsVendor(email: string): Promise<boolean> {
  return (await lookupEmailRole(email)) === "vendor";
}
