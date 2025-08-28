import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Dev tenancy: read `?tenant=` and stamp `x-tenant-id`.
 * Later, swap this to parse subdomains and keep the same header name.
 */
export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const tenant = url.searchParams.get("tenant") || "default";
  const res = NextResponse.next();
  res.headers.set("x-tenant-id", tenant);
  return res;
}

// Apply to both index and slug proposal pages
export const config = { matcher: ["/proposal", "/proposal/:path*"] };
