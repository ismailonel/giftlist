import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "giftlist_session";

export function sessionSecret() {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return "";
  return "dev-only-session-secret-change-me";
}

function key() {
  const secret = sessionSecret();
  if (!secret) throw new Error("Falta SESSION_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signAdminSession() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(key());
}

export async function isAdminToken(token: string | undefined) {
  if (!token || !sessionSecret()) return false;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
