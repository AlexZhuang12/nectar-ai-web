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
