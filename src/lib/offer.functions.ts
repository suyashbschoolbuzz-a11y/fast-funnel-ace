import { createServerFn } from "@tanstack/react-start";

export type OfferSettings = {
  price: number;
  months: number;
  monthlyEquivalent: number;
};

export const getPublicOfferSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("offer_price_inr, access_months")
    .eq("id", "primary")
    .single();

  if (error || !data) return { price: 300, months: 3, monthlyEquivalent: 100 };
  const price = Number(data.offer_price_inr);
  const months = data.access_months;
  return { price, months, monthlyEquivalent: Math.round(price / months) };
});