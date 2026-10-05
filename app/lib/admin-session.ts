import { env } from "cloudflare:workers";

const COOKIE_NAME = "ebi_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();
type AuthEnv = { ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string };

function authEnv() {
  const runtime = env as unknown as AuthEnv;
  if (!runtime.ADMIN_PASSWORD || !runtime.ADMIN_SESSION_SECRET) throw new Error("Administrator authentication is not configured.");
  return runtime as Required<AuthEnv>;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function sign(payload: string) {
  const { ADMIN_SESSION_SECRET } = authEnv();
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(ADMIN_SESSION_SECRET), encoder.encode(payload))));
}

export async function passwordMatches(candidate: string) {
  const { ADMIN_PASSWORD } = authEnv();
  const [candidateHash, passwordHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
    crypto.subtle.digest("SHA-256", encoder.encode(ADMIN_PASSWORD)),
  ]);
  const left = new Uint8Array(candidateHash); const right = new Uint8Array(passwordHash);
  let difference = left.length ^ right.length;
  for (let index = 0; index < Math.min(left.length, right.length); index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function createAdminCookie() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `v1:${expires}`;
  const value = `${payload}.${await sign(payload)}`;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearAdminCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function hasAdminSession(cookieHeader: string | null) {
  if (!cookieHeader) return false;
  const value = cookieHeader.split(";").map(item => item.trim()).find(item => item.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!value) return false;
  const dot = value.lastIndexOf("."); if (dot < 0) return false;
  const payload = value.slice(0, dot); const signature = value.slice(dot + 1);
  const [version, expiresRaw] = payload.split(":");
  const expires = Number(expiresRaw);
  if (version !== "v1" || !Number.isFinite(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  try {
    const { ADMIN_SESSION_SECRET } = authEnv();
    return crypto.subtle.verify("HMAC", await hmacKey(ADMIN_SESSION_SECRET), base64UrlToBytes(signature), encoder.encode(payload));
  } catch { return false; }
}

export async function requirePasswordAdmin(request: Request) {
  if (await hasAdminSession(request.headers.get("cookie"))) return { ok: true as const };
  return { ok: false as const, response: Response.json({ error: "Administrator login required" }, { status: 401 }) };
}
