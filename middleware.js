import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const token = await getToken({ req: request });
  
  if (!token) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
  if (!token.email?.endsWith("@citchennai.net")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "Domain");
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/create",
    "/api/slots/:path*",
  ],
};