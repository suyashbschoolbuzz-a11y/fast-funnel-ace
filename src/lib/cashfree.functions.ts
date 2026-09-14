import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().regex(/^\d{10}$/),
  tracking: z.record(z.string()).default({}),
});

const verifySchema = z.object({ orderId: z.string().min(10).max(80) });

function cashfreeHeaders() {
  const appId = process.env["CASHFREE_APP_ID"];
  const secretKey = process.env["CASHFREE_SECRET_KEY"];
  if (!appId || !secretKey) throw new Error("Cashfree checkout is not configured");
  return {
    "content-type": "application/json",
    "x-api-version": "2025-01-01",
    "x-client-id": appId,
    "x-client-secret": secretKey,
  };
}

export const createCashfreeOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    const request = getRequest();
    const origin = request ? new URL(request.url).origin : "";
    if (!origin) throw new Error("Checkout origin is unavailable");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("app_settings")
      .select("offer_price_inr, access_months")
      .eq("id", "primary")
      .single();
    if (settingsError || !settings) throw new Error("The current offer is unavailable. Please try again.");
    const amount = Number(settings.offer_price_inr);
    const accessMonths = settings.access_months;
    const orderId = `contentdesk_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: { ...cashfreeHeaders(), "x-idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: `guest_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`,
          customer_name: data.name,
          customer_email: data.email,
          customer_phone: data.whatsapp,
        },
        order_meta: {
          return_url: `${origin}/?cashfree_order_id={order_id}`,
          notify_url: `${origin}/api/public/cashfree-webhook`,
        },
        order_note: `The Content Desk — ${accessMonths} months access`,
        order_tags: { plan: `${accessMonths}_months`, ...data.tracking },
      }),
    });
    const payload = (await response.json()) as {
      cf_order_id?: string;
      order_status?: string;
      payment_session_id?: string;
      message?: string;
    };
    if (!response.ok || !payload.payment_session_id) {
      console.error("Cashfree create order failed", response.status, payload.message);
      throw new Error("Payment could not be started. Please try again.");
    }

    const { error } = await supabaseAdmin.from("cashfree_orders").insert({
      order_id: orderId,
      cf_order_id: payload.cf_order_id ?? null,
      customer_name: data.name,
      customer_email: data.email,
      customer_phone: data.whatsapp,
      amount_inr: amount,
      access_months: accessMonths,
      status: payload.order_status?.toLowerCase() === "active" ? "active" : "created",
      tracking: data.tracking,
      payment_session_id: payload.payment_session_id,
    });
    if (error) {
      console.error("Order storage failed", error.message);
      throw new Error("Payment could not be prepared. Please try again.");
    }
    return { orderId, paymentSessionId: payload.payment_session_id, mode: "production" as const };
  });

export const verifyCashfreeOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => verifySchema.parse(input))
  .handler(async ({ data }) => {
    const response = await fetch(`https://api.cashfree.com/pg/orders/${encodeURIComponent(data.orderId)}`, {
      headers: cashfreeHeaders(),
    });
    const payload = (await response.json()) as { order_status?: string; message?: string };
    if (!response.ok) {
      console.error("Cashfree verify order failed", response.status, payload.message);
      throw new Error("We could not verify this payment yet.");
    }

    const paid = payload.order_status === "PAID";
    const status = paid ? "paid" : payload.order_status?.toLowerCase() === "expired" ? "expired" : "active";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: storedOrder } = await supabaseAdmin.from("cashfree_orders").select("access_months").eq("order_id", data.orderId).single();
    const accessMonths = storedOrder?.access_months ?? 3;
    const update = paid
      ? { status, paid_at: new Date().toISOString(), access_expires_at: new Date(Date.now() + accessMonths * 30 * 24 * 60 * 60 * 1000).toISOString() }
      : { status };
    const { error } = await supabaseAdmin.from("cashfree_orders").update(update).eq("order_id", data.orderId);
    if (error) console.error("Order verification storage failed", error.message);

    if (!paid) return { paid: false as const, status };
    const { data: settings } = await supabaseAdmin.from("app_settings").select("whatsapp_group_url").eq("id", "primary").single();
    const storedUrl = settings?.whatsapp_group_url;
    const groupUrl = storedUrl && !storedUrl.includes("pending-admin-update") ? storedUrl : process.env["WHATSAPP_GROUP_URL"];
    if (!groupUrl) throw new Error("Payment is complete, but the group link is unavailable. Please contact support.");
    return { paid: true as const, status, groupUrl };
  });