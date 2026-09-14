import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

const webhookSchema = z.object({
  type: z.string(),
  data: z.object({
    order: z.object({ order_id: z.string() }),
    payment: z.object({ payment_status: z.string() }).passthrough(),
  }),
});

export const Route = createFileRoute("/api/public/cashfree-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("x-webhook-signature") ?? "";
        const timestamp = request.headers.get("x-webhook-timestamp") ?? "";
        const secret = process.env["CASHFREE_SECRET_KEY"];
        const rawBody = await request.text();
        if (!signature || !timestamp || !secret) return new Response("Unauthorized", { status: 401 });

        const expected = createHmac("sha256", secret).update(timestamp + rawBody).digest("base64");
        const receivedBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expected);
        if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const parsed = webhookSchema.safeParse(JSON.parse(rawBody));
        if (!parsed.success) return new Response("Invalid payload", { status: 400 });
        const paid = parsed.data.data.payment.payment_status === "SUCCESS";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const update = paid
          ? { status: "paid", paid_at: new Date().toISOString(), access_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), last_webhook_at: new Date().toISOString() }
          : { last_webhook_at: new Date().toISOString() };
        const { error } = await supabaseAdmin.from("cashfree_orders").update(update).eq("order_id", parsed.data.data.order.order_id);
        if (error) {
          console.error("Cashfree webhook storage failed", error.message);
          return new Response("Storage error", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});