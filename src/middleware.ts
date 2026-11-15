import { NextRequest, NextResponse } from "next/server";

// Nonces protect admin documents. Authorization remains in every API/page.
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const development = process.env.NODE_ENV !== "production";
  const policy = [
    "default-src 'self'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:", `connect-src 'self'${development ? " ws: wss:" : ""}`,
    "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce); headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("Cache-Control", "no-store, private");
  return response;
}
export const config = { matcher: ["/011011000110111101101110011001110110111001100111011000010011000100111001001101010011010000110001001110010011010100110110/:path*"] };
