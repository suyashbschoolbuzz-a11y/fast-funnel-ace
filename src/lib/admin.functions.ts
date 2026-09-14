import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
});

const settingsSchema = z.object({
  price: z.coerce.number().int().min(1).max(100000),
  months: z.coerce.number().int().min(1).max(24),
  groupUrl: z.string().url().regex(/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+$/),
});

const COOKIE_NAME = "content_desk_admin";

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

function readCookie() {
  const cookie = getRequestHeader("cookie") ?? "";
  const entry = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return entry ? decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)) : "";
}

async function requireAdmin() {
  const secret = process.env["ADMIN_SESSION_SECRET"];
  const token = readCookie();
  if (!secret || !token) throw new Error("Unauthorized");
  const separator = token.lastIndexOf(".");
  if (separator < 1) throw new Error("Unauthorized");
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = await sign(payload, secret);
  if (!safeEqual(signature, expected)) throw new Error("Unauthorized");
  const [username, expiresRaw] = payload.split(":");
  const expiresAt = Number(expiresRaw);
  if (username !== process.env["ADMIN_USERNAME"] || !Number.isFinite(expiresAt) || expiresAt < Date.now()) throw new Error("Unauthorized");
}

export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    const expectedUsername = process.env["ADMIN_USERNAME"];
    const expectedPassword = process.env["ADMIN_PASSWORD"];
    const secret = process.env["ADMIN_SESSION_SECRET"];
    if (!expectedUsername || !expectedPassword || !secret) throw new Error("Admin access is not configured");
    const usernameMatches = safeEqual(data.username, expectedUsername);
    const passwordMatches = safeEqual(data.password, expectedPassword);
    if (!usernameMatches || !passwordMatches) throw new Error("Incorrect ID or password");
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    const payload = `${expectedUsername}:${expiresAt}`;
    const token = `${payload}.${await sign(payload, secret)}`;
    setResponseHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);
    return { ok: true };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
  return { ok: true };
});

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: settings, error: settingsError }, { data: orders, error: ordersError }] = await Promise.all([
    supabaseAdmin.from("app_settings").select("offer_price_inr, access_months, whatsapp_group_url, updated_at").eq("id", "primary").single(),
    supabaseAdmin.from("cashfree_orders").select("order_id, customer_name, customer_email, customer_phone, amount_inr, status, created_at, paid_at, access_expires_at").order("created_at", { ascending: false }).limit(500),
  ]);
  if (settingsError || !settings) throw new Error("Settings could not be loaded");
  if (ordersError) throw new Error("Payments could not be loaded");
  const safeOrders = orders ?? [];
  const paidOrders = safeOrders.filter((order) => order.status === "paid");
  const storedUrl = settings.whatsapp_group_url;
  const fallbackUrl = process.env["WHATSAPP_GROUP_URL"] ?? "";
  return {
    settings: {
      price: Number(settings.offer_price_inr),
      months: settings.access_months,
      groupUrl: storedUrl.includes("pending-admin-update") ? fallbackUrl : storedUrl,
      updatedAt: settings.updated_at,
    },
    summary: {
      total: safeOrders.length,
      paid: paidOrders.length,
      pending: safeOrders.length - paidOrders.length,
      revenue: paidOrders.reduce((sum, order) => sum + Number(order.amount_inr), 0),
    },
    orders: safeOrders.map((order) => ({ ...order, amount_inr: Number(order.amount_inr) })),
  };
});

export const updateAdminSettings = createServerFn({ method: "POST" })
  .inputValidator((input) => settingsSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("app_settings").update({
      offer_price_inr: data.price,
      access_months: data.months,
      whatsapp_group_url: data.groupUrl,
    }).eq("id", "primary");
    if (error) throw new Error("Settings could not be saved");
    return { ok: true };
  });