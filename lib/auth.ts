import "server-only";
import {
  createHmac,
  createHash,
  timingSafeEqual,
  randomBytes,
} from "node:crypto";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
export const authReady = () =>
  Boolean(
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_PASSWORD.length >= 16 &&
    process.env.SESSION_SECRET &&
    process.env.SESSION_SECRET.length >= 32,
  );
const digest = (s: string) => createHash("sha256").update(s).digest();
export const checkPassword = (s: string) =>
  authReady() &&
  timingSafeEqual(digest(s), digest(process.env.ADMIN_PASSWORD!));
function sign(s: string) {
  return createHmac(
    "sha256",
    process.env.SESSION_SECRET! +
      createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest("hex"),
  )
    .update(s)
    .digest("base64url");
}
export function createSession() {
  const payload = `${Date.now() + 8 * 60 * 60 * 1000}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${sign(payload)}`;
}
export function verifySession(value: string) {
  if (!authReady()) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0])) return false;
  const payload = parts.slice(0, 2).join(".");
  const a = Buffer.from(parts[2]);
  const b = Buffer.from(sign(payload));
  return (
    a.length === b.length &&
    timingSafeEqual(a, b) &&
    Number(parts[0]) > Date.now()
  );
}
export async function isAdmin() {
  return verifySession((await cookies()).get("kira_session")?.value || "");
}
export function sameOrigin(req: Request) {
  try {
    const raw = req.headers.get("origin");
    if (!raw) return false;
    const origin = new URL(raw);
    const url = new URL(req.url);
    const host = req.headers.get("host") || url.host;
    const protocol =
      (req.headers.get("x-forwarded-proto")?.split(",")[0] ||
        url.protocol.replace(":", "")) + ":";
    return origin.host === host && origin.protocol === protocol;
  } catch {
    return false;
  }
}
const limits = new Map<string, { count: number; expires: number }>();
export async function rateLimit(
  req: Request,
  kind: string,
  max: number,
  windowSeconds: number,
) {
  const ip =
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "local";
  const key = createHash("sha256")
    .update(kind + ":" + ip + ":" + (process.env.SESSION_SECRET || "preview"))
    .digest("hex");
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS kira_rate_limits (key text PRIMARY KEY, count integer NOT NULL, expires timestamptz NOT NULL)`;
    const rows =
      await sql`INSERT INTO kira_rate_limits(key,count,expires) VALUES(${key},1,NOW()+${windowSeconds}*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN kira_rate_limits.expires<NOW() THEN 1 ELSE kira_rate_limits.count+1 END,expires=CASE WHEN kira_rate_limits.expires<NOW() THEN NOW()+${windowSeconds}*interval '1 second' ELSE kira_rate_limits.expires END RETURNING count`;
    return rows[0].count <= max;
  }
  if (process.env.NODE_ENV === "production") return false;
  const value = limits.get(key);
  if (!value || value.expires < Date.now()) {
    limits.set(key, { count: 1, expires: Date.now() + windowSeconds * 1000 });
    return true;
  }
  value.count++;
  return value.count <= max;
}
