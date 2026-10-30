import "server-only";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, isAdminToken, sessionSecret } from "./session";

export function adminPassword() {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return "";
  return "regalos";
}

export function devLoginHint() {
  return (
    process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD?.trim()
  );
}

export function passwordsMatch(input: string, expected: string) {
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export async function requireAdmin() {
  if (!sessionSecret() || !adminPassword()) redirect("/admin/login?error=config");
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await isAdminToken(token))) redirect("/admin/login");
}
