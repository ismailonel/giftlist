import "server-only";

import { setDefaultResultOrder } from "node:dns";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

setDefaultResultOrder("ipv4first");

const globalForSupabase = globalThis as unknown as {
  giftlistSupabase?: SupabaseClient;
};

export function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function projectUrl(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("SUPABASE_URL https://<proje>.supabase.co olmalı.");
  }
  const host = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "https:" || host.startsWith("db.") || host.includes("pooler.supabase.com")) {
    throw new Error("SUPABASE_URL https://<proje>.supabase.co olmalı. Pooler veya db adresi değil.");
  }
  return parsed.origin;
}

async function fetchApi(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : "fetch failed";
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    throw new Error(cause ? `${message}: ${cause}` : message);
  }
}

export function getSupabase() {
  const url = process.env.SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!url || !key) return null;
  if (!globalForSupabase.giftlistSupabase) {
    globalForSupabase.giftlistSupabase = createClient(projectUrl(url), key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchApi },
    });
  }
  return globalForSupabase.giftlistSupabase;
}
