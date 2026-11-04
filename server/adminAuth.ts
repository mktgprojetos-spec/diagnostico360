import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { parse } from "cookie";

export const ADMIN_COOKIE_NAME = "raiox_admin_session";
export const ADMIN_USERNAME = "admin";
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function signingSecret() {
  return process.env.MANUS_JWT_SECRET || process.env.ADMIN_PASSWORD || "";
}

function digest(value: string) {
  return createHmac("sha256", signingSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyAdminCredentials(username: string, password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || !username || !password) return false;
  return safeEqual(digest(username), digest(ADMIN_USERNAME)) && safeEqual(digest(password), digest(configuredPassword));
}

export function createAdminSession() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${ADMIN_USERNAME}.${issuedAt}`;
  return `${payload}.${digest(payload)}`;
}

export function isAdminSessionValid(req: Request) {
  const token = parse(req.headers.cookie ?? "")[ADMIN_COOKIE_NAME];
  if (!token) return false;
  const [username, issuedAtText, signature] = token.split(".");
  const issuedAt = Number(issuedAtText);
  if (!username || !signature || !Number.isSafeInteger(issuedAt)) return false;
  if (username !== ADMIN_USERNAME || Date.now() / 1000 - issuedAt > ADMIN_SESSION_MAX_AGE_SECONDS || issuedAt > Date.now() / 1000 + 60) return false;
  return safeEqual(signature, digest(`${username}.${issuedAtText}`));
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "none" as const,
  secure: true,
  maxAge: ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
};
