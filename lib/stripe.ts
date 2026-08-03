import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripePriceIdPro(): string {
  const priceId = process.env.STRIPE_PRICE_ID_PRO?.trim();
  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID_PRO is not configured");
  }
  return priceId;
}

const PRODUCTION_ORIGIN = "https://nectar-ai-web.vercel.app";

export function getRequestOrigin(request: Request): string {
  const origin = request.headers.get("origin")?.replace(/\/+$/, "");
  if (origin) return origin;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) {
    return `${proto}://${host.split(",")[0].trim()}`.replace(/\/+$/, "");
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? PRODUCTION_ORIGIN
  );
}

export function getAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
    "http://localhost:3000"
  );
}
