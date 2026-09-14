declare module "@cashfreepayments/cashfree-js" {
  type CashfreeMode = "sandbox" | "production";

  type CheckoutOptions = {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_top" | "_modal";
  };

  type CheckoutResult = {
    error?: { message?: string };
    redirect?: boolean;
    paymentDetails?: { paymentMessage?: string };
  };

  type Cashfree = {
    checkout(options: CheckoutOptions): Promise<CheckoutResult>;
  };

  export function load(options: { mode: CashfreeMode }): Promise<Cashfree>;
}